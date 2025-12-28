import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import db from "@/database/drizzle";
import * as schema from "@/database/schema";

function calculateSM2(
  quality: number,
  ef: number,
  intervalDays: number,
  reps: number
): { newEf: number; newInterval: number; newReps: number } {
  let newEf = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  if (newEf < 1.3) newEf = 1.3;

  let newInterval: number;
  let newReps: number;

  if (quality < 3) {
    newReps = 0;
    newInterval = 1;
  } else {
    newReps = reps + 1;
    if (newReps === 1) {
      newInterval = 1;
    } else if (newReps === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(intervalDays * newEf);
    }
  }

  return { newEf, newInterval, newReps };
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { itemId, quality, responseMs } = body;

    if (typeof itemId !== "number" || typeof quality !== "number") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const userItem = await db
      .select()
      .from(schema.srsUserItem)
      .where(
        and(
          eq(schema.srsUserItem.userId, userId),
          eq(schema.srsUserItem.itemId, itemId)
        )
      )
      .limit(1);

    if (!userItem.length) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const current = userItem[0];
    const { newEf, newInterval, newReps } = calculateSM2(
      quality,
      current.ef,
      current.intervalDays,
      current.reps
    );

    const newDueAt = new Date();
    newDueAt.setDate(newDueAt.getDate() + newInterval);

    await db
      .update(schema.srsUserItem)
      .set({
        ef: newEf,
        intervalDays: newInterval,
        reps: newReps,
        lapses: quality < 3 ? current.lapses + 1 : current.lapses,
        dueAt: newDueAt,
        lastReviewAt: new Date(),
      })
      .where(
        and(
          eq(schema.srsUserItem.userId, userId),
          eq(schema.srsUserItem.itemId, itemId)
        )
      );

    await db.insert(schema.srsReviewEvents).values({
      userId,
      itemId,
      quality,
      responseMs: responseMs || null,
      reviewedAt: new Date(),
      newEf,
      newIntervalDays: newInterval,
      newDueAt,
    });

    return NextResponse.json({
      success: true,
      newDueAt,
      newInterval,
    });
  } catch (error) {
    console.error("Error processing review:", error);
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 }
    );
  }
}
