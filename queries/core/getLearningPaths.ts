import db from "../../database/drizzle";
import { getUserProgress } from "@/queries/queries";
import { challengeProgress, courses } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cache } from "react";

export const getLearningPaths = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) {
    return [];
  }

  const data = await db.query.learningPaths.findMany({
    orderBy: (learningPaths, { asc }) => [asc(learningPaths.order)],
    with: {
      courses: {
        where: eq(courses.id, userProgress.activeCourseId), // Only fetch the user's active course
        with: {
          units: {
            orderBy: (units, { asc }) => [asc(units.order)],
            with: {
              lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                  challenges: {
                    orderBy: (challenges, { asc }) => [asc(challenges.order)],
                    with: {
                      challengeProgress: {
                        where: eq(challengeProgress.userId, userId),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return data;
});
