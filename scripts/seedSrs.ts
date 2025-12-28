import { config } from "dotenv";
import { eq } from "drizzle-orm";
import db from "../database/drizzle";
import * as schema from "../database/schema";

config({ path: ".env.local" });

function extractMeaning(question?: string | null): string {
  if (!question) return "";
  const m = question.match(/"([^"]+)"/);
  if (m?.[1]) return m[1];
  return question
    .replace(/Which one of these is/i, "")
    .replace(/[?"]/g, "")
    .trim();
}

async function seedSrsFromClassic() {
  console.log("→ Building SRS items from Classic lessons…");

  const rows = await db
    .select({
      courseId: schema.courses.id,
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
    .innerJoin(schema.courses, eq(schema.courses.id, schema.units.courseId))
    .where(eq(schema.challengeOptions.correct, true));

  if (!rows.length) {
    console.log("   No Classic content found to seed SRS.");
    return;
  }

  console.log(`   Found ${rows.length} correct answers to process`);

  const items = rows.map((r) => ({
    courseId: r.courseId,
    term: r.term!,
    meaning: extractMeaning(r.question) || "—",
    originLessonId: r.lessonId!,
  }));

  const uniqueItems = Array.from(
    new Map(items.map((item) => [`${item.courseId}-${item.term}`, item])).values()
  );

  console.log(`   Inserting ${uniqueItems.length} unique items…`);

  await db.insert(schema.srsItems).values(uniqueItems).onConflictDoNothing();

  const total = (
    await db.select({ id: schema.srsItems.id }).from(schema.srsItems)
  ).length;
  console.log(`   SRS items total in database: ${total}`);

  const users = await db.select().from(schema.userProgress);
  console.log(`   Found ${users.length} users to initialize`);

  for (const u of users) {
    if (!u.activeCourseId) continue;

    const itemIds = await db
      .select({ id: schema.srsItems.id })
      .from(schema.srsItems)
      .where(eq(schema.srsItems.courseId, u.activeCourseId));

    if (!itemIds.length) continue;

    await db
      .insert(schema.srsUserItem)
      .values(itemIds.map(({ id }) => ({ userId: u.userId, itemId: id })))
      .onConflictDoNothing();

    console.log(
      `   Initialized ${itemIds.length} schedules for user ${u.userId}`
    );
  }

  console.log("✓ SRS seed complete.");
}

seedSrsFromClassic()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding SRS:", error);
    process.exit(1);
  });
