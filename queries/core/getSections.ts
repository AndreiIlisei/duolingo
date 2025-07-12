import db from "@/database/drizzle";
import { learningPaths, sections, units } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { cache } from "react";
import { getUserProgress } from "../queries";

export const getSections = cache(async () => {
  const { userId } = await auth();
  const progress = await getUserProgress();

  if (!userId || !progress?.activeCourseId) return [];

  //   return progress;

  return db.query.sections.findMany({
    where: and(
      eq(sections.courseId, progress.activeCourseId),
      inArray(
        sections.id,
        db.select({ id: units.sectionId }).from(units)
      )
    ),
    orderBy: (lp, { asc }) => [asc(lp.order)],
    // with: {
    //   units: true,
    // },
  });
});
