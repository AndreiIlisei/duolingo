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
  // Get existing users BEFORE wiping data
  const existingUsers = await db.select().from(schema.userProgress);
  console.log(`📊 Found ${existingUsers.length} existing user(s)`);
  if (existingUsers.length > 0) {
    console.log(`👤 Users:`, existingUsers.map(u => ({ id: u.userId, name: u.userName })));
  }

  // wipe just what we touch
  console.log("🗑️  Deleting old data...");
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

  // Seed learning paths (must be before user restoration due to FK constraints)
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

  // Restore existing users with updated course reference (after learning paths exist)
  if (existingUsers.length > 0) {
    console.log(`🔄 Restoring ${existingUsers.length} user(s)...`);
    for (const user of existingUsers) {
      await db.insert(schema.userProgress).values({
        ...user,
        activeCourseId: 1,
        activeLearningPathId: classicPath.id,
      }).onConflictDoNothing();
    }
    console.log(`✓ Users restored`);
  }

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
      title: "Daily Review",
      description: "Review words due today",
      order: 1,
      courseId: 1,
      learningPathId: srsPath.id,
    },
    {
      id: 5,
      title: "Learning",
      description: "New and recently learned words",
      order: 2,
      courseId: 1,
      learningPathId: srsPath.id,
    },
    {
      id: 6,
      title: "Mastery",
      description: "Well-practiced vocabulary",
      order: 3,
      courseId: 1,
      learningPathId: srsPath.id,
    },
  ]);

  // units
  await db.insert(schema.units).values([
    { id: 1, sectionId: 1, title: "Basics", description: "A", order: 1 },
    // SRS units - Daily Review section
    { id: 2, sectionId: 4, title: "Due Now", description: "Words ready for review", order: 1 },
    { id: 3, sectionId: 4, title: "Overdue", description: "Catch up on missed reviews", order: 2 },
    // SRS units - Learning section
    { id: 4, sectionId: 5, title: "New Words", description: "Start learning new vocabulary", order: 1 },
    { id: 5, sectionId: 5, title: "Recent", description: "Words learned this week", order: 2 },
    // SRS units - Mastery section
    { id: 6, sectionId: 6, title: "Strong", description: "Well-remembered words", order: 1 },
    { id: 7, sectionId: 6, title: "Mastered", description: "Fully mastered vocabulary", order: 2 },
  ]);

  // lessons (1 classic, multiple SRS)
  await db.insert(schema.lessons).values([
    { id: 1, unitId: 1, order: 1, title: "Nouns" }, // classic
    // SRS lessons
    { id: 2, unitId: 2, order: 1, title: "Review Session" },
    { id: 3, unitId: 3, order: 1, title: "Catch Up" },
    { id: 4, unitId: 4, order: 1, title: "Learn New" },
    { id: 5, unitId: 5, order: 1, title: "Practice Recent" },
    { id: 6, unitId: 6, order: 1, title: "Strengthen" },
    { id: 7, unitId: 7, order: 1, title: "Perfect" },
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
  
  // Initialize SRS items for existing users
  if (existingUsers.length > 0) {
    await initializeSrsForUsers(existingUsers);
  } else {
    console.log("⚠️  No users found. Please:");
    console.log("   1. Sign in to the app first");
    console.log("   2. Then run 'npm run db:seed' to initialize SRS items");
  }
  
  console.log("✅ Minimal seed done.");
}

async function initializeSrsForUsers(users: any[]) {
  if (!users.length) {
    console.log("⚠️  No users found to initialize SRS items");
    return;
  }

  // Get all SRS items
  const allSrsItems = await db.select().from(schema.srsItems);
  
  if (!allSrsItems.length) {
    console.log("No SRS items found to initialize");
    return;
  }

  // For each user, create srsUserItem entries for all items (due now)
  for (const user of users) {
    const userItems = allSrsItems.map((item) => ({
      userId: user.userId,
      itemId: item.id,
      ef: 2.5, // default ease factor
      intervalDays: 0,
      reps: 0,
      lapses: 0,
      dueAt: new Date(), // due now - ready for first review
      lastReviewAt: null, // never reviewed yet
      suspended: false,
    }));

    await db
      .insert(schema.srsUserItem)
      .values(userItems)
      .onConflictDoNothing();

    console.log(`✓ Initialized ${userItems.length} SRS items for user ${user.userId}`);
  }
}

main()
  .then(() => {
    console.log("✅ Seed completed successfully");
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
