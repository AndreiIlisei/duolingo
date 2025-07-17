import db from "@/database/drizzle";
import {
  challengeProgress,
  challenges,
  lessons,
  sections,
  units,
} from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { cache } from "react";
import { getUserProgress } from "../queries";

// Not used right now
export const getSections = cache(async () => {
  const { userId } = await auth();
  const progress = await getUserProgress();

  if (!userId || !progress?.activeCourseId) return [];

  //   return progress;

  return db.query.sections.findMany({
    where: and(
      eq(sections.courseId, progress.activeCourseId),
      inArray(sections.id, db.select({ id: units.sectionId }).from(units))
    ),
    orderBy: (lp, { asc }) => [asc(lp.order)],
    // with: {
    //   units: true,
    // },
  });
});

/**
 * completedUnitIds(userId)
 * ------------------------
 *  SELECT unit_id
 *  FROM   units → lessons → challenges
 *  WHERE  EVERY challenge has a completed progress row for that user
 */
function completedUnitIds(userId: string) {
  return db
    .select({ id: units.id })
    .from(units)
    .where(
      // a unit is complete if *no* challenge is missing a completed row
      sql`NOT EXISTS (
           SELECT 1 FROM ${lessons} l
           JOIN ${challenges} c ON c.lesson_id = l.id
           LEFT JOIN ${challengeProgress} cp
             ON cp.challenge_id = c.id
            AND cp.user_id      = ${userId}
           WHERE l.unit_id = ${units.id}
             AND (cp.completed IS DISTINCT FROM TRUE)
         )`
    );
}

/**
 * getSectionsWithProgress(pathId, userId)
 * ---------------------------------------
 * returns [{ id, title, order, total, done, percent }]
 */
export const getSectionsWithProgress = cache(
  async (pathId: number, userId: string) => {
    const doneUnitSub = completedUnitIds(userId).as("done_units");

    const rows = await db
      .select({
        id: sections.id,
        title: sections.title,
        order: sections.order,
        description: sections.description,
        learningPathId: sections.learningPathId,
        total: sql<number>`COUNT(${units.id})`.as("total"),

        done: sql<number>`COUNT(${units.id})
                          FILTER (WHERE ${units.id} IN
                             (SELECT id FROM ${doneUnitSub}))`.as("done"),
      })
      .from(sections)
      .leftJoin(units, eq(units.sectionId, sections.id))
      .where(eq(sections.learningPathId, pathId))
      .groupBy(sections.id)
      .execute();

    return rows
      .filter((r) => r.total > 0) // remove empty sections
      .map((r) => ({
        ...r,
        percent: Math.round((r.done / r.total) * 100), // total ≥1, safe divide
      }));
  }
);

// export const getSectionsWithProgress = cache(
//   async (pathId: number, userId: string) => {
//     /* 1 ▸ pull the full nested tree for this path and user */
//     const raw = await db.query.sections.findMany({
//       where: eq(sections.learningPathId, pathId),
//       orderBy: (s, { asc }) => [asc(s.order)],
//       with: {
//         units: {
//           with: {
//             lessons: {
//               with: {
//                 challenges: {
//                   with: {
//                     challengeProgress: {
//                       where: eq(challengeProgress.userId, userId),
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     /* 2 ▸ map → calculate completion */
//     return raw.map((section) => {
//       const totalUnits = section.units.length;

//       const completedUnits = section.units.filter((unit) => {
//         /* every lesson ... every challenge ... has completed progress */
//         return unit.lessons.every((lesson) =>
//           lesson.challenges.every(
//             (c) =>
//               c.challengeProgress.length > 0 &&
//               c.challengeProgress.every((p) => p.completed)
//           )
//         );
//       }).length;

//       return {
//         ...section,
//         totalUnits,
//         completedUnits,
//         percent: totalUnits
//           ? Math.round((completedUnits / totalUnits) * 100)
//           : 0,
//       };
//     });
//   }
// );
