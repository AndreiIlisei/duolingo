"use server";

import db from "@/database/drizzle";
import {
  challengeProgress,
  challenges,
  learningPaths,
  userProgress,
} from "@/database/schema";
import { POINTS_TO_REFILL } from "@/lib/utils";
import {
  getCourseById,
  getUserProgress,
  getUserSubscription,
} from "@/queries/queries";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Change this into separate userProgress for Course
export const upsertUserProgress = async (
  courseId: number
): Promise<boolean> => {
  try {
    // 1 ▸ Auth
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) throw new Error("Unauthorized");

    // 2 ▸ Confirm course exists
    const course = await getCourseById(courseId);
    if (!course) throw new Error(`Course ${courseId} not found`);

    // 3 ▸ Pick default path for that course
    // const path = await db.query.learningPaths.findFirst({
    //   where: and(
    //     eq(learningPaths.courseId, courseId),
    //     eq(learningPaths.type, "classic") // default path
    //   ),
    // });

    // if (!path) throw new Error("No learning path for this course");

    // 4 ▸ Upsert with one DB call
    await db
      .insert(userProgress)
      .values({
        userId,
        activeCourseId: courseId,
        activeLearningPathId: null,
        userName: user.firstName || "User",
        userImageSrc: user.imageUrl || "/mascot.svg",
        hearts: 5,
        points: 0,
      })
      .onConflictDoUpdate({
        target: userProgress.userId, // composite PK or unique key
        set: {
          activeCourseId: courseId,
          activeLearningPathId: null,
          userName: user.firstName || "User",
          userImageSrc: user.imageUrl || "/mascot.svg",
        },
      });

    // 5 ▸ Revalidate pages & navigate
    revalidatePath("/courses");
    revalidatePath("/learn");

    console.log("upsertUserProgress success");

    return true; // caller can redirect or toast on success
  } catch (err) {
    console.error("upsertUserProgress error:", err);
    return false; // caller can show error toast
  }
};

export const chooseLearningPath = async (pathId: number) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  console.log("PRESSED")
  
  await db
    .update(userProgress)
    .set({ activeLearningPathId: pathId })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/learn");
};

export const reduceHearts = async (challengeId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });

  const isPractice = !!existingChallengeProgress;

  if (isPractice) {
    return { error: "practice" };
  }

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  if (userSubscription?.isActive) {
    return { error: "subscription active" };
  }

  if (currentUserProgress.hearts === 0) {
    return { error: "hearts" };
  }

  await db
    .update(userProgress)
    .set({
      hearts: Math.max(currentUserProgress.hearts - 1, 0),
    })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lessons/${lessonId}`);
};

export const refillHearts = async () => {
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  if (currentUserProgress.hearts === 5) {
    throw new Error("Hearts are already full");
  }

  if (currentUserProgress.points < POINTS_TO_REFILL) {
    throw new Error("Not enough points to refill hearts");
  }

  await db
    .update(userProgress)
    .set({
      hearts: 5,
      points: currentUserProgress.points - POINTS_TO_REFILL,
    })
    .where(eq(userProgress.userId, currentUserProgress.userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};
