import db from "../../database/drizzle";
import { getUserProgress } from "@/queries/queries";
import { courses, learningPaths, sections } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { cache } from "react";

export const getLearningPaths = cache(async () => {
  const { userId } = await auth();
  const prog = await getUserProgress();
  if (!userId || !prog?.activeCourseId) return [];

  return db.query.learningPaths.findMany({
    where: and(
      eq(learningPaths.courseId, prog.activeCourseId),
      /* keep only paths that appear in the sections table */
      inArray(
        learningPaths.id,
        db.select({ id: sections.learningPathId }).from(sections)
      )
    ),
    orderBy: (lp, { asc }) => [asc(lp.order)],
  });
});

export const getLearningPathProgress = cache(async () => {
  const { userId } = await auth();
  const progress = await getUserProgress();

  if (!userId || !progress?.activeLearningPathId) return null;

  return progress;
  // total sections in that path
  // const total = await db.query.sections.count({
  //   where: eq(sections.learningPathId, progress.activeLearningPathId),
  // });

  // sections this user completed
  // const done = await db.query.sectionProgress.count({
  //   where: and(
  //     eq(sectionProgress.userId, userId),
  //     eq(sectionProgress.completed, true),
  //     eq(sectionProgress.sectionId, sections.id),
  //     eq(sections.learningPathId, progress.activeLearningPathId)
  //   ),
  //   join: sections, // join so we can filter on path
  // });

  // return {
  //   completed: done,
  //   total,
  //   percent: total ? Math.round((done / total) * 100) : 0,
  // };
});
