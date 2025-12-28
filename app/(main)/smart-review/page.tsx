import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { eq, and, lte, sql } from "drizzle-orm";
import db from "@/database/drizzle";
import * as schema from "@/database/schema";

export const metadata: Metadata = {
  title: "Smart Review • Lingo",
};

type Summary = {
  dueCount: number;
  estMinutes: number;
  accuracyPct: number;
  xpReady: number;
};

async function getSmartReviewSummary(userId: string): Promise<Summary> {
  const now = new Date();
  
  const dueItems = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.srsUserItem)
    .where(
      and(
        eq(schema.srsUserItem.userId, userId),
        lte(schema.srsUserItem.dueAt, now),
        eq(schema.srsUserItem.suspended, false)
      )
    );

  const dueCount = Number(dueItems[0]?.count || 0);
  
  const recentReviews = await db
    .select({ quality: schema.srsReviewEvents.quality })
    .from(schema.srsReviewEvents)
    .where(eq(schema.srsReviewEvents.userId, userId))
    .orderBy(sql`${schema.srsReviewEvents.reviewedAt} DESC`)
    .limit(20);

  let accuracyPct = 0;
  if (recentReviews.length > 0) {
    const correctCount = recentReviews.filter((r: { quality: number }) => r.quality >= 4).length;
    accuracyPct = Math.round((correctCount / recentReviews.length) * 100);
  }

  const estMinutes = Math.ceil((dueCount * 8) / 60);
  const xpReady = dueCount * 5;

  return {
    dueCount,
    estMinutes,
    accuracyPct,
    xpReady,
  };
}

// async function seedSrsFromClassic() {
//   console.log("→ Building SRS items from Classic…");

//   const rows = await db
//     .select({
//       sectionId: schema.units.sectionId,
//       lessonId: schema.lessons.id,
//       question: schema.challenges.question,
//       term: schema.challengeOptions.text,
//       //   audioSrc: schema.challengeOptions.audioSrc,
//       //   imageSrc: schema.challengeOptions.imageSrc,
//     })
//     .from(schema.challengeOptions)
//     .innerJoin(
//       schema.challenges,
//       eq(schema.challenges.id, schema.challengeOptions.challengeId)
//     )
//     .innerJoin(
//       schema.lessons,
//       eq(schema.lessons.id, schema.challenges.lessonId)
//     )
//     .innerJoin(schema.units, eq(schema.units.id, schema.lessons.unitId))
//     .where(eq(schema.challengeOptions.correct, true));

//   if (!rows.length) {
//     console.log("   No Classic content found to seed SRS.");
//     return;
//   }

//   const items = rows.map((r) => ({
//     sectionId: r.sectionId!,
//     term: r.term!,
//     meaning: extractMeaning(r.question) || "—",
//     // audioSrc: r.audioSrc ?? null,
//     // imageSrc: r.imageSrc ?? null,
//     originLessonId: r.lessonId!,
//   }));

//   await db.insert(schema.srsItems).values(items).onConflictDoNothing();

//   //   console.log(items);
//   //   const total = (
//   // await db.select({ id: schema.srsItems.id }).from(schema.srsItems)
//   //   ).length;
//   //   console.log(`   SRS items total: ${total}`);

//   // Optional: default “Core” deck per course
//   //   const allCourses = await db.select().from(schema.courses);
//   //   for (const c of allCourses) {
//   //     const deck = await db
//   //       .insert(schema.srsDecks)
//   //       .values({
//   //         courseId: c.id,
//   //         title: "Core",
//   //         description: "Auto-imported from Classic",
//   //       })
//   //       .returning();

//   //     const itemIds = await db
//   //       .select({ id: schema.srsItems.id })
//   //       .from(schema.srsItems)
//   //       .where(eq(schema.srsItems.courseId, c.id));

//   //     if (itemIds.length) {
//   //       await db
//   //         .insert(schema.srsDeckItems)
//   //         .values(itemIds.map(({ id }) => ({ deckId: deck[0].id, itemId: id })))
//   //         .onConflictDoNothing();
//   //       console.log(
//   //         `   Linked ${itemIds.length} items to '${c.title} / Core' deck`
//   //       );
//   //     }
//   //   }

//   // Optional: pre-init all items “due now” for existing users (by active course)
//   //   const users = await db.select().from(schema.userProgress);
//   //   for (const u of users) {
//   //     if (!u.activeCourseId) continue;

//   //     const itemIds = await db
//   //       .select({ id: schema.srsItems.id })
//   //       .from(schema.srsItems)
//   //       .where(eq(schema.srsItems.courseId, u.activeCourseId));

//   //     if (!itemIds.length) continue;

//   //     await db
//   //       .insert(schema.srsUserItem)
//   //       .values(itemIds.map(({ id }) => ({ userId: u.userId, itemId: id })))
//   //       .onConflictDoNothing();

//   //     console.log(
//   //       `   Initialized ${itemIds.length} schedules for user ${u.userId}`
//   //     );
//   //   }

//   console.log("✓ SRS seed complete.");
// }

// …after your existing seed blocks:

export default async function SmartReviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const summary = await getSmartReviewSummary(userId);

  //   const test = await seedSrsFromClassic();

  //   console.log(test);
  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/40 bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white shadow-xl">
          {/* Corner icon */}
          <div className="absolute right-6 top-6 size-14 rounded-2xl bg-white/15 ring-1 ring-white/20 grid place-items-center">
            <Image src="/brain.svg" alt="Smart Review" width={28} height={28} />
          </div>

          <h1 className="text-3xl font-semibold">Smart Review</h1>
          <p className="mt-1 text-slate-200/90">
            AI-powered review based on your memory strength.
          </p>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
              🧠 {summary.dueCount} words due
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
              ⚡ {summary.estMinutes} min session
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
              🎯 {summary.accuracyPct}% accuracy
            </span>
            {summary.xpReady > 0 && (
              <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
                ✨ +{summary.xpReady} XP ready
              </span>
            )}
          </div>

          {/* CTA row */}
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/smart-review/session"
              className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition
                ${
                  summary.dueCount > 0
                    ? "bg-white text-indigo-700 hover:bg-slate-100"
                    : "bg-white/30 text-white/80 cursor-not-allowed"
                }`}
              aria-disabled={summary.dueCount === 0}
              prefetch
            >
              Start Review
            </Link>

            {/* Secondary actions you can wire later */}
            <Link
              href="/smart-review/session?mode=preview"
              className="text-white/85 underline underline-offset-4 hover:text-white"
              prefetch
            >
              Practice ahead
            </Link>
          </div>
        </div>

        {/* (Optional) Info / tips */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Tip title="How it works">
            Reviews are scheduled by difficulty—hard items reappear sooner.
          </Tip>
          <Tip title="Daily streak">
            Finish due reviews to keep your streak alive and earn bonus XP.
          </Tip>
          <Tip title="Accuracy">
            Focus on quality. Higher accuracy pushes items further into the
            future.
          </Tip>
        </div>
      </div>
    </div>
  );
}

function Tip({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
      <div className="text-slate-200 font-medium">{title}</div>
      <div className="mt-1 text-sm text-slate-300/80">{children}</div>
    </div>
  );
}
