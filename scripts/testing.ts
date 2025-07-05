import { neon } from "@neondatabase/serverless";
import * as schema from "../database/schema";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("🌱 Seeding database...");

    // Wipe existing data (order matters due to FKs)
    await db.delete(schema.userProgress);
    await db.delete(schema.learningPaths);
    await db.delete(schema.courses);

    // Seed courses
    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "Spanish",
        imageSrc: "/es.svg",
      },
    ]);

    // Seed learning paths
    await db.insert(schema.learningPaths).values([
      {
        type: "classic",
        title: "Classic Path",
        description: "Learn through structured lessons and challenges",
        order: 1,
        courseId: 1,
      },
      {
        type: "srs",
        title: "Spaced Repetition",
        description: "Review based on your memory strength",
        order: 2,
        courseId: 1,
      },
      {
        type: "immersion",
        title: "Culture Immersion",
        description: "Learn through videos, news, and real-world content",
        order: 3,
        courseId: 1,
      },
      {
        type: "targeted",
        title: "Targeted Learning",
        description: "Language for travelers, professionals, or specific needs",
        order: 4,
        courseId: 1,
      },
    ]);

    const learningPaths = await db.query.learningPaths.findMany();
    const classicPath = learningPaths.find((p) => p.type === "classic");

    if (!classicPath) throw new Error("Classic learning path not found");

    console.log("✅ Done seeding.");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    throw err;
  }
};

main();
