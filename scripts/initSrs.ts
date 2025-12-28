import "dotenv/config";
import db from "../database/drizzle";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";

async function initSrsForCurrentUsers() {
  console.log("🔄 Initializing SRS items for existing users...");

  // Get all users who have progress
  const users = await db.select().from(schema.userProgress);
  
  if (!users.length) {
    console.log("❌ No users found. Please sign in to the app first.");
    process.exit(1);
  }

  console.log(`📊 Found ${users.length} user(s)`);

  // Get all SRS items
  const allSrsItems = await db.select().from(schema.srsItems);
  
  if (!allSrsItems.length) {
    console.log("❌ No SRS items found. Run 'npm run db:reset' first.");
    process.exit(1);
  }

  console.log(`📚 Found ${allSrsItems.length} SRS items`);

  // For each user, create srsUserItem entries for all items (due now)
  for (const user of users) {
    // Check if user already has SRS items initialized
    const existingItems = await db
      .select()
      .from(schema.srsUserItem)
      .where(eq(schema.srsUserItem.userId, user.userId))
      .limit(1);

    if (existingItems.length > 0) {
      console.log(`⏭️  User ${user.userName} already has SRS items initialized, skipping...`);
      continue;
    }

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

    console.log(`✅ Initialized ${userItems.length} SRS items for user ${user.userName} (${user.userId})`);
  }

  console.log("✅ SRS initialization complete!");
}

initSrsForCurrentUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Failed to initialize SRS:", e);
    process.exit(1);
  });
