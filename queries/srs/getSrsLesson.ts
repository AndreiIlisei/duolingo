import { auth } from "@clerk/nextjs/server";
import { eq, and, lte } from "drizzle-orm";
import db from "@/database/drizzle";
import * as schema from "@/database/schema";

export async function getSrsLesson() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  try {
    const now = new Date();
    
    const dueItems = await db
      .select({
        itemId: schema.srsItems.id,
        term: schema.srsItems.term,
        meaning: schema.srsItems.meaning,
        partOfSpeech: schema.srsItems.partOfSpeech,
        example: schema.srsItems.example,
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

    const challenges = dueItems.map((item, index) => ({
      id: -1 * (index + 1), // Negative IDs for SRS challenges to avoid conflicts
      lessonId: -1, // Special SRS lesson ID
      type: "FLASHCARD" as const,
      question: item.term,
      order: index + 1,
      completed: false,
      challengeOptions: [],
      srsItemId: item.itemId,
      term: item.term,
      meaning: item.meaning,
      partOfSpeech: item.partOfSpeech,
      example: item.example,
    }));

    return {
      id: -1,
      title: "Smart Review",
      order: 0,
      unitId: -1,
      challenges,
    };
  } catch (error) {
    console.error("Error fetching SRS lesson:", error);
    return null;
  }
}
