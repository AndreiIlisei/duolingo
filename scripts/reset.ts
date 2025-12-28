/* eslint-disable @typescript-eslint/no-explicit-any */
// scripts/seed-min.ts
import "dotenv/config";
import db from "../database/drizzle";
import * as schema from "../database/schema";
import { eq, and } from "drizzle-orm";

// tiny helper from your script
function extractMeaning(q?: string | null): string | null {
  if (!q) return null;
  const quoted = q.match(/"([^"]+)"/);
  if (quoted) return quoted[1];
  return (
    q
      .replace(/Which one of these is/i, "")
      .replace(/Select the correct translation for/i, "")
      .replace(/[?"]/g, "")
      .trim() || null
  );
}

async function seedSrsFromClassic() {
  const rows = await db
    .select({
      courseId: schema.sections.courseId,
      lessonId: schema.lessons.id,
      question: schema.challenges.question,
      term: schema.challengeOptions.text,
    })
    .from(schema.challengeOptions)
    .innerJoin(
      schema.challenges,
      eq(schema.challenges.id, schema.challengeOptions.challengeId)
    )
    .innerJoin(
      schema.lessons,
      eq(schema.lessons.id, schema.challenges.lessonId)
    )
    .innerJoin(schema.units, eq(schema.units.id, schema.lessons.unitId))
    .innerJoin(schema.sections, eq(schema.sections.id, schema.units.sectionId))
    .innerJoin(
      schema.learningPaths,
      eq(schema.learningPaths.id, schema.sections.learningPathId)
    )
    .where(
      and(
        eq(schema.challengeOptions.correct, true),
        eq(schema.learningPaths.learning_path_type, "classic")
      )
    );

  const seen = new Set<string>();
  const items = rows.flatMap((r) => {
    const term = r.term?.trim();
    const meaning = extractMeaning(r.question);
    if (!r.courseId || !term || !meaning) return [];
    const key = `${r.courseId}::${term.toLowerCase()}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [
      {
        courseId: r.courseId,
        term,
        meaning,
        originLessonId: r.lessonId ?? null,
      },
    ];
  });

  if (!items.length) return;

  await db.insert(schema.srsItems).values(items).onConflictDoNothing();
}

async function main() {
  // wipe just what we touch
  await db.delete(schema.challengeProgress);
  await db.delete(schema.challengeOptions);
  await db.delete(schema.challenges);
  await db.delete(schema.lessons);
  await db.delete(schema.units);
  await db.delete(schema.sections);
  await db.delete(schema.learningPaths);
  await db.delete(schema.courses);
  await db.delete(schema.srsDeckItems);
  await db.delete(schema.srsDecks);
  await db.delete(schema.srsUserItem);
  await db.delete(schema.srsReviewEvents);
  await db.delete(schema.srsItems);

  // course
  await db
    .insert(schema.courses)
    .values([{ id: 1, title: "Spanish", imageSrc: "/es.svg" }]);

  // Seed learning paths
  await db.insert(schema.learningPaths).values([
    {
      id: 1,
      learning_path_type: "classic",
      title: "Classic Path",
      description: "Learn through structured lessons and challenges",
      order: 1,
      courseId: 1,
    },
    {
      id: 2,
      learning_path_type: "srs",
      title: "Spaced Repetition",
      description: "Review based on your memory strength",
      order: 2,
      courseId: 1,
    },
    {
      id: 3,
      learning_path_type: "immersion",
      title: "Culture Immersion",
      description: "Learn through videos, news, and real-world content",
      order: 3,
      courseId: 1,
    },
    {
      id: 4,
      learning_path_type: "targeted",
      title: "Targeted Learning",
      description: "Language for travelers, professionals, or specific needs",
      order: 4,
      courseId: 1,
    },
  ]);

  const learningPaths = await db.query.learningPaths.findMany();
  const classicPath = learningPaths.find(
    (p: any) => p.learning_path_type === "classic"
  );
  const srsPath = learningPaths.find(
    (p: any) => p.learning_path_type === "srs"
  );

  if (!classicPath) throw new Error("Classic learning path not found");
  if (!srsPath) throw new Error("SRS learning path not found");

  // Seed sections
  await db.insert(schema.sections).values([
    {
      id: 1,
      title: "Classic - Section 1",
      description: "Foundations",
      order: 1,
      courseId: 1,
      learningPathId: classicPath.id,
    },
    {
      id: 2,
      title: "Classic - Section 2",
      description: "Improvers",
      order: 2,
      courseId: 1,
      learningPathId: classicPath.id,
    },
    {
      id: 3,
      title: "Classic - Section 3",
      description: "Advanced",
      order: 3,
      courseId: 1,
      learningPathId: classicPath.id,
    },
    {
      id: 4,
      title: "SRS - Section 1",
      description: "Spaced Repetition",
      order: 1,
      courseId: 1,
      learningPathId: srsPath.id,
    },
  ]);

  // units
  await db.insert(schema.units).values([
    { id: 1, sectionId: 1, title: "Basics", description: "A", order: 1 },
    { id: 2, sectionId: 4, title: "SRS Intro", description: "B", order: 1 }, // SRS unit
  ]);

  // lessons (1 classic, 1 SRS dummy)
  await db.insert(schema.lessons).values([
    { id: 1, unitId: 1, order: 1, title: "Nouns" }, // classic
    { id: 2, unitId: 2, order: 1, title: "SRS Placeholder" }, // SRS (so your query returns a lesson)
  ]);

  // 1 classic challenge + options so SRS seeding has material
  await db.insert(schema.challenges).values([
    {
      id: 1,
      lessonId: 1,
      type: "SELECT",
      order: 1,
      question: 'Which one of these is "the man"?',
    },
  ]);

  await db.insert(schema.challengeOptions).values([
    { challengeId: 1, correct: true, text: "el hombre" },
    { challengeId: 1, correct: false, text: "la mujer" },
  ]);

  // build SRS items from Classic
  await seedSrsFromClassic();
  console.log("✅ Minimal seed done.");
}

main().catch((e) => {
  console.error(e);
});
