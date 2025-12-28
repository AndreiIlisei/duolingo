import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, and, lte } from "drizzle-orm";
import db from "@/database/drizzle";
import * as schema from "@/database/schema";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    
    const dueItems = await db
      .select({
        id: schema.srsUserItem.itemId,
        itemId: schema.srsItems.id,
        term: schema.srsItems.term,
        meaning: schema.srsItems.meaning,
        partOfSpeech: schema.srsItems.partOfSpeech,
        example: schema.srsItems.example,
        dueAt: schema.srsUserItem.dueAt,
      })
      .from(schema.srsUserItem)
      .innerJoin(
        schema.srsItems,
        eq(schema.srsUserItem.itemId, schema.srsItems.id)
      )
      .where(
        and(
          eq(schema.srsUserItem.userId, userId),
          lte(schema.srsUserItem.dueAt, now),
          eq(schema.srsUserItem.suspended, false)
        )
      )
      .orderBy(schema.srsUserItem.dueAt)
      .limit(20);

    return NextResponse.json({ items: dueItems });
  } catch (error) {
    console.error("Error fetching due items:", error);
    return NextResponse.json(
      { error: "Failed to fetch due items" },
      { status: 500 }
    );
  }
}
