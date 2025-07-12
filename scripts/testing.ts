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
    // await db.delete(schema.learningPaths);
    // await db.delete(schema.courses);
    await db.delete(schema.sections);
    await db.delete(schema.units);
    await db.delete(schema.lessons);

    // Seed courses
    // await db.insert(schema.courses).values([
    //   {
    //     id: 1,
    //     title: "Spanish",
    //     imageSrc: "/es.svg",
    //   },
    // ]);

    // // Seed learning paths
    // await db.insert(schema.learningPaths).values([
    //   {
    //     type: "classic",
    //     title: "Classic Path",
    //     description: "Learn through structured lessons and challenges",
    //     order: 1,
    //     courseId: 1,
    //   },
    //   {
    //     type: "srs",
    //     title: "Spaced Repetition",
    //     description: "Review based on your memory strength",
    //     order: 2,
    //     courseId: 1,
    //   },
    //   {
    //     type: "immersion",
    //     title: "Culture Immersion",
    //     description: "Learn through videos, news, and real-world content",
    //     order: 3,
    //     courseId: 1,
    //   },
    //   {
    //     type: "targeted",
    //     title: "Targeted Learning",
    //     description: "Language for travelers, professionals, or specific needs",
    //     order: 4,
    //     courseId: 1,
    //   },
    // ]);

    const learningPaths = await db.query.learningPaths.findMany();
    const classicPath = learningPaths.find(
      (p) => p.learning_path_type === "classic"
    );
    const srsPath = learningPaths.find((p) => p.learning_path_type === "srs");

    if (!classicPath) throw new Error("Classic learning path not found");
    if (!srsPath) throw new Error("SRS learning path not found");

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
        title: "SRS - Section 1",
        description: "Spaced Repetition",
        order: 1,
        courseId: 1,
        learningPathId: srsPath.id,
      },
    ]);

    await db.insert(schema.units).values([
      {
        id: 1,
        sectionId: 1,
        title: "Unit 1",
        description: "Learn the basics of Spanish",
        order: 1,
      },
    ]);

    // Seed lessons
    await db.insert(schema.lessons).values([
      {
        id: 1,
        unitId: 1,
        order: 1,
        title: "Nouns",
      },
      {
        id: 2,
        unitId: 1,
        order: 2,
        title: "Verbs",
      },
    ]);

    // Seed challenges
    await db.insert(schema.challenges).values([
      {
        id: 1,
        lessonId: 1,
        type: "SELECT",
        order: 1,
        question: 'Which one of these is the "the man"?',
      },
      {
        id: 2,
        lessonId: 2,
        type: "SELECT",
        order: 1,
        question: "Which one of these is the robot?",
      },
    ]);

    // Seed challenge options
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: 1,
        imageSrc: "/man.png",
        correct: true,
        text: "el hombre",
        audioSrc: "/elHombre.wav",
      },
      {
        challengeId: 1,
        imageSrc: "/female.png",
        correct: false,
        text: "la mujer",
        audioSrc: "/laMujer.wav",
      },
    ]);

    await db.insert(schema.challengeOptions).values([
      {
        challengeId: 2,
        imageSrc: "/robot.png",
        correct: true,
        text: "el robot",
        audioSrc: "/elRobot.wav",
      },
      {
        challengeId: 2,
        imageSrc: "/dog.png",
        correct: false,
        text: "el perro",
        audioSrc: "/elPerro.wav",
      },
    ]);

    console.log("✅ Done seeding.");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    throw err;
  }
};

main();
