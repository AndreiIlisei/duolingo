import db from "../../database/drizzle";
import { courses, units, challengeProgress, sections } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, inArray } from "drizzle-orm";
import { cache } from "react";
import { getUserProgress } from "../users/getUserData";

export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany();

  return data;
});

export const getCourseById = cache(async (courseId: number) => {
  return db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });
});

export const getCourseProgress = cache(async () => {
  const { userId } = await auth();
  const progress = await getUserProgress();

  if (!userId || !progress?.activeLearningPathId) return null;

  const unitsInPath = await db.query.units.findMany({
    orderBy: (u, { asc }) => [asc(u.order)],
    where: inArray(
      units.sectionId,
      db
        .select({ id: sections.id })
        .from(sections)
        .where(eq(sections.learningPathId, progress.activeLearningPathId))
    ),
    with: {
      lessons: {
        orderBy: (l, { asc }) => [asc(l.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const firstUncompletedLesson = unitsInPath
    .flatMap((u) => u?.lessons)
    .find((lesson) =>
      lesson?.challenges?.some(
        (c) =>
          !c?.challengeProgress?.length ||
          c?.challengeProgress?.some((p) => !p.completed)
      )
    );

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});
