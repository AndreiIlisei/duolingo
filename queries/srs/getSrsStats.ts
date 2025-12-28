import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import db from "@/database/drizzle";
import * as schema from "@/database/schema";

export async function getSrsStats() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    weekFromNow.setHours(23, 59, 59, 999);

    // Get all user's SRS items
    const allUserItems = await db
      .select()
      .from(schema.srsUserItem)
      .where(
        and(
          eq(schema.srsUserItem.userId, userId),
          eq(schema.srsUserItem.suspended, false)
        )
      );

    // Count items by status
    const dueNow = allUserItems.filter(item => item.dueAt <= now).length;
    const dueTomorrow = allUserItems.filter(
      item => item.dueAt > now && item.dueAt <= tomorrow
    ).length;
    const dueThisWeek = allUserItems.filter(
      item => item.dueAt > tomorrow && item.dueAt <= weekFromNow
    ).length;

    // Learning = reviewed but not mastered (reps < 5)
    const learning = allUserItems.filter(
      item => item.reps > 0 && item.reps < 5
    ).length;

    // Mastered = 5+ successful reviews
    const mastered = allUserItems.filter(item => item.reps >= 5).length;

    // Calculate streak (consecutive days with reviews)
    const reviewDates = await db
      .select({
        reviewDate: schema.srsReviewEvents.reviewedAt,
      })
      .from(schema.srsReviewEvents)
      .where(eq(schema.srsReviewEvents.userId, userId))
      .orderBy(schema.srsReviewEvents.reviewedAt);

    let streak = 0;
    if (reviewDates.length > 0) {
      const uniqueDays = new Set(
        reviewDates.map(r => r.reviewDate.toISOString().split('T')[0])
      );
      const sortedDays = Array.from(uniqueDays).sort().reverse();
      
      const today = now.toISOString().split('T')[0];
      const checkDate = new Date(today);
      
      for (const day of sortedDays) {
        const dayStr = checkDate.toISOString().split('T')[0];
        if (day === dayStr) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Estimate time (assuming 30 seconds per card)
    const estimatedMinutes = Math.ceil((dueNow * 30) / 60);

    return {
      dueNow,
      dueTomorrow,
      dueThisWeek,
      learning,
      mastered,
      totalItems: allUserItems.length,
      streak,
      estimatedMinutes,
    };
  } catch (error) {
    console.error("Error fetching SRS stats:", error);
    return null;
  }
}
