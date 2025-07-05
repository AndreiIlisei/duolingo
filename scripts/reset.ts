import { neon } from "@neondatabase/serverless";
import * as schema from "../database/schema";
import { drizzle } from "drizzle-orm/neon-http";

import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("Reset database");

    await db.delete(schema.courses);
    await db.delete(schema.userProgress);
    await db.delete(schema.learningPaths);
    // await db.delete(schema.sections);
    // await db.delete(schema.units);
    // await db.delete(schema.lessons);
    // await db.delete(schema.challenges);
    // await db.delete(schema.challengeOptions);
    // await db.delete(schema.challengeProgress);
    // await db.delete(schema.userSubscription);

    console.log("RESET finished");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to reset the database");
  }
};

main();
