/* eslint-disable @typescript-eslint/no-explicit-any */
// import { neon } from "@neondatabase/serverless";
import db from "../database/drizzle";
import * as schema from "../database/schema";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { and } from "drizzle-orm";

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

export async function seedSrsFromClassic() {
  console.log("→ Building SRS items from Classic…");

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

  if (!rows.length) {
    console.log("   No Classic content found to seed SRS.");
    return;
  }

  // De-dupe per (courseId, term)
  const map = new Map<
    string,
    {
      courseId: number;
      term: string;
      meaning: string;
      originLessonId: number | null;
    }
  >();

  for (const r of rows) {
    const term = r.term?.trim();
    const meaning = extractMeaning(r.question);
    if (!r.courseId || !term || !meaning) continue;

    const key = `${r.courseId}::${term.toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, {
        courseId: r.courseId,
        term,
        meaning,
        originLessonId: r.lessonId ?? null,
      });
    }
  }

  const items = Array.from(map.values());
  if (!items.length) {
    console.log("   Nothing to insert after normalization.");
    return;
  }

  // Optional: clear SRS items for affected courses before reseeding
  // const courseIds = [...new Set(items.map(i => i.courseId))];
  // await db.delete(schema.srsItems).where(inArray(schema.srsItems.courseId, courseIds));

  // Insert in chunks inside a transaction
  const CHUNK = 500;
  await db.transaction(async (tx) => {
    for (let i = 0; i < items.length; i += CHUNK) {
      await tx
        .insert(schema.srsItems)
        .values(items.slice(i, i + CHUNK))
        .onConflictDoNothing(); // relies on unique idx (course_id, term)
    }
  });

  console.log(`✓ SRS seed complete. Inserted ~${items.length} items.`);
}

const main = async () => {
  try {
    console.log("🌱 Seeding database...");

    // Wipe existing data (order matters due to FKs)
    await db.delete(schema.userProgress);
    await db.delete(schema.learningPaths);
    await db.delete(schema.courses);
    await db.delete(schema.sections);
    await db.delete(schema.units);
    await db.delete(schema.lessons);
    await db.delete(schema.challenges);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.srsItems);

    // Seed courses
    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "Spanish",
        imageSrc: "/es.svg",
      },
      {
        id: 2,
        title: "French",
        imageSrc: "/fr.svg",
      },
      {
        id: 3,
        title: "German",
        imageSrc: "/de.svg",
      },
      {
        id: 4,
        title: "Italian",
        imageSrc: "/it.svg",
      },
      {
        id: 5,
        title: "Portuguese",
        imageSrc: "/pt.svg",
      },
      {
        id: 6,
        title: "Japanese",
        imageSrc: "/jp.svg",
      },
    ]);

    // Seed learning paths for all courses
    const learningPathValues = [];
    for (let courseId = 1; courseId <= 6; courseId++) {
      learningPathValues.push(
        {
          id: (courseId - 1) * 4 + 1,
          learning_path_type: "classic" as const,
          title: "Classic Path",
          description: "Learn through structured lessons and challenges",
          order: 1,
          courseId,
        },
        {
          id: (courseId - 1) * 4 + 2,
          learning_path_type: "srs" as const,
          title: "Spaced Repetition",
          description: "Review based on your memory strength",
          order: 2,
          courseId,
        },
        {
          id: (courseId - 1) * 4 + 3,
          learning_path_type: "immersion" as const,
          title: "Culture Immersion",
          description: "Learn through videos, news, and real-world content",
          order: 3,
          courseId,
        },
        {
          id: (courseId - 1) * 4 + 4,
          learning_path_type: "targeted" as const,
          title: "Targeted Learning",
          description: "Language for travelers, professionals, or specific needs",
          order: 4,
          courseId,
        }
      );
    }
    await db.insert(schema.learningPaths).values(learningPathValues);

    const learningPaths = await db.query.learningPaths.findMany();
    const classicPath = learningPaths.find(
      (p: any) => p.learning_path_type === "classic"
    );
    const srsPath = learningPaths.find(
      (p: any) => p.learning_path_type === "srs"
    );

    if (!classicPath) throw new Error("Classic learning path not found");
    if (!srsPath) throw new Error("SRS learning path not found");

    // Seed sections for all courses
    const sectionValues = [];
    for (let courseId = 1; courseId <= 6; courseId++) {
      const classicPathId = (courseId - 1) * 4 + 1;
      const srsPathId = (courseId - 1) * 4 + 2;
      
      // Classic sections
      sectionValues.push(
        {
          id: (courseId - 1) * 7 + 1,
          title: `Classic - Section 1`,
          description: "Foundations",
          order: 1,
          courseId,
          learningPathId: classicPathId,
        },
        {
          id: (courseId - 1) * 7 + 2,
          title: `Classic - Section 2`,
          description: "Improvers",
          order: 2,
          courseId,
          learningPathId: classicPathId,
        },
        {
          id: (courseId - 1) * 7 + 3,
          title: `Classic - Section 3`,
          description: "Advanced",
          order: 3,
          courseId,
          learningPathId: classicPathId,
        },
        {
          id: (courseId - 1) * 7 + 4,
          title: `Classic - Section 4`,
          description: "Expert",
          order: 4,
          courseId,
          learningPathId: classicPathId,
        }
      );
      
      // SRS sections
      sectionValues.push(
        {
          id: (courseId - 1) * 7 + 5,
          title: "Daily Review",
          description: "Review words due today",
          order: 1,
          courseId,
          learningPathId: srsPathId,
        },
        {
          id: (courseId - 1) * 7 + 6,
          title: "Learning",
          description: "New and recently learned words",
          order: 2,
          courseId,
          learningPathId: srsPathId,
        },
        {
          id: (courseId - 1) * 7 + 7,
          title: "Mastery",
          description: "Well-practiced vocabulary",
          order: 3,
          courseId,
          learningPathId: srsPathId,
        }
      );
    }
    await db.insert(schema.sections).values(sectionValues);

    // Seed units for all sections
    const unitValues = [];
    let unitId = 1;
    
    for (let courseId = 1; courseId <= 6; courseId++) {
      // Classic units for 4 sections
      for (let section = 1; section <= 4; section++) {
        const sectionId = (courseId - 1) * 7 + section;
        unitValues.push(
          { id: unitId++, sectionId, title: "Basic Vocabulary", description: "Essential words", order: 1 },
          { id: unitId++, sectionId, title: "Grammar Basics", description: "Fundamental rules", order: 2 },
          { id: unitId++, sectionId, title: "Common Phrases", description: "Everyday expressions", order: 3 },
          { id: unitId++, sectionId, title: "Practice", description: "Apply your knowledge", order: 4 }
        );
      }
      
      // SRS units for 3 sections
      for (let srsSection = 5; srsSection <= 7; srsSection++) {
        const sectionId = (courseId - 1) * 7 + srsSection;
        if (srsSection === 5) { // Daily Review
          unitValues.push(
            { id: unitId++, sectionId, title: "Due Now", description: "Words ready for review", order: 1 },
            { id: unitId++, sectionId, title: "Overdue", description: "Catch up on missed reviews", order: 2 }
          );
        } else if (srsSection === 6) { // Learning
          unitValues.push(
            { id: unitId++, sectionId, title: "New Words", description: "Start learning new vocabulary", order: 1 },
            { id: unitId++, sectionId, title: "Recent", description: "Words learned this week", order: 2 }
          );
        } else { // Mastery
          unitValues.push(
            { id: unitId++, sectionId, title: "Strong", description: "Well-remembered words", order: 1 },
            { id: unitId++, sectionId, title: "Mastered", description: "Fully mastered vocabulary", order: 2 }
          );
        }
      }
    }
    await db.insert(schema.units).values(unitValues);

    // Seed lessons for all units
    const lessonValues = [];
    let lessonId = 1;
    
    // Create lessons for each unit
    for (let unitIndex = 0; unitIndex < unitValues.length; unitIndex++) {
      const unit = unitValues[unitIndex];
      const lessonCount = unit.title.includes("Practice") ? 6 : 4; // Practice units have more lessons
      
      for (let i = 1; i <= lessonCount; i++) {
        lessonValues.push({
          id: lessonId++,
          unitId: unit.id,
          order: i,
          title: `${unit.title} - Lesson ${i}`
        });
      }
    }
    await db.insert(schema.lessons).values(lessonValues);

    // Seed challenges with variety of types
    await db.insert(schema.challenges).values([
      // Unit 1 - Basic Vocabulary challenges
      {
        id: 1,
        lessonId: 1,
        type: "SELECT",
        order: 1,
        question: 'Which one of these is "the man"?',
      },
      {
        id: 2,
        lessonId: 1,
        type: "SELECT",
        order: 2,
        question: 'Which one of these is "the woman"?',
      },
      {
        id: 3,
        lessonId: 1,
        type: "ASSIST",
        order: 3,
        question: 'Select the correct translation for "el niño"',
      },
      {
        id: 4,
        lessonId: 2,
        type: "SELECT",
        order: 1,
        question: "Which one of these is the robot?",
      },
      {
        id: 5,
        lessonId: 2,
        type: "SELECT",
        order: 2,
        question: 'What is "to eat" in Spanish?',
      },
      {
        id: 6,
        lessonId: 2,
        type: "ASSIST",
        order: 3,
        question: 'Choose the correct form of "to be"',
      },

      // Unit 2 - Grammar Basics challenges
      {
        id: 7,
        lessonId: 5,
        type: "SELECT",
        order: 1,
        question: 'Which is the correct conjugation of "hablar" for "yo"?',
      },
      {
        id: 8,
        lessonId: 5,
        type: "ASSIST",
        order: 2,
        question: 'Complete: "Tú _____ español" (you speak Spanish)',
      },
      {
        id: 9,
        lessonId: 6,
        type: "SELECT",
        order: 1,
        question: 'When do you use "ser" vs "estar"?',
      },
      {
        id: 10,
        lessonId: 6,
        type: "ASSIST",
        order: 2,
        question: 'Choose: "María _____ doctora" (María is a doctor)',
      },

      // Unit 3 - Common Phrases challenges
      {
        id: 11,
        lessonId: 9,
        type: "SELECT",
        order: 1,
        question: 'How do you say "Good morning" in Spanish?',
      },
      {
        id: 12,
        lessonId: 9,
        type: "ASSIST",
        order: 2,
        question: 'What is the appropriate response to "¿Cómo estás?"',
      },
      {
        id: 13,
        lessonId: 10,
        type: "SELECT",
        order: 1,
        question: 'How do you say "please" in Spanish?',
      },
      {
        id: 14,
        lessonId: 10,
        type: "ASSIST",
        order: 2,
        question: "Choose the polite way to ask for help",
      },

      // Unit 4 - Numbers & Time challenges
      {
        id: 15,
        lessonId: 13,
        type: "SELECT",
        order: 1,
        question: 'What is "fifteen" in Spanish?',
      },
      {
        id: 16,
        lessonId: 13,
        type: "ASSIST",
        order: 2,
        question: 'Select the correct number: "siete"',
      },
      {
        id: 17,
        lessonId: 15,
        type: "SELECT",
        order: 1,
        question: 'How do you say "It is 3:30" in Spanish?',
      },
      {
        id: 18,
        lessonId: 15,
        type: "ASSIST",
        order: 2,
        question: 'What time is "las dos y media"?',
      },

      // Unit 5 - Past Tense challenges
      {
        id: 19,
        lessonId: 17,
        type: "SELECT",
        order: 1,
        question: 'What is the preterite form of "hablar" for "él"?',
      },
      {
        id: 20,
        lessonId: 17,
        type: "ASSIST",
        order: 2,
        question: 'Complete: "Ayer yo _____ con mi madre" (I spoke)',
      },
      {
        id: 21,
        lessonId: 18,
        type: "SELECT",
        order: 1,
        question: 'What is the preterite form of "ir" (to go) for "nosotros"?',
      },
      {
        id: 22,
        lessonId: 18,
        type: "ASSIST",
        order: 2,
        question: 'Choose the correct form: "Ellos _____ al cine" (they went)',
      },

      // Unit 6 - Food & Dining challenges
      {
        id: 23,
        lessonId: 21,
        type: "SELECT",
        order: 1,
        question: 'What is "chicken" in Spanish?',
      },
      {
        id: 24,
        lessonId: 21,
        type: "ASSIST",
        order: 2,
        question: 'Select the correct translation for "la manzana"',
      },
      {
        id: 25,
        lessonId: 22,
        type: "SELECT",
        order: 1,
        question: "How do you ask for the menu in Spanish?",
      },
      {
        id: 26,
        lessonId: 22,
        type: "ASSIST",
        order: 2,
        question: 'What does "la cuenta, por favor" mean?',
      },

      // Unit 7 - Travel & Directions challenges
      {
        id: 27,
        lessonId: 25,
        type: "SELECT",
        order: 1,
        question: 'How do you say "train" in Spanish?',
      },
      {
        id: 28,
        lessonId: 25,
        type: "ASSIST",
        order: 2,
        question: 'What is "el autobús"?',
      },
      {
        id: 29,
        lessonId: 26,
        type: "SELECT",
        order: 1,
        question: 'How do you ask "Where is the bank?" in Spanish?',
      },
      {
        id: 30,
        lessonId: 26,
        type: "ASSIST",
        order: 2,
        question: 'What does "a la derecha" mean?',
      },

      // Unit 8 - Family & Relationships challenges
      {
        id: 31,
        lessonId: 29,
        type: "SELECT",
        order: 1,
        question: 'How do you say "grandmother" in Spanish?',
      },
      {
        id: 32,
        lessonId: 29,
        type: "ASSIST",
        order: 2,
        question: 'What is "el hermano"?',
      },
      {
        id: 33,
        lessonId: 30,
        type: "SELECT",
        order: 1,
        question: 'How do you say "tall" in Spanish?',
      },
      {
        id: 34,
        lessonId: 30,
        type: "ASSIST",
        order: 2,
        question: 'What does "pelo rubio" mean?',
      },

      // Unit 9 - Subjunctive Mood challenges
      {
        id: 35,
        lessonId: 33,
        type: "SELECT",
        order: 1,
        question: 'What is the subjunctive form of "hablar" for "yo"?',
      },
      {
        id: 36,
        lessonId: 33,
        type: "ASSIST",
        order: 2,
        question: 'Complete: "Espero que tú _____ bien" (I hope you are well)',
      },
      {
        id: 37,
        lessonId: 34,
        type: "SELECT",
        order: 1,
        question: "Which phrase requires the subjunctive?",
      },
      {
        id: 38,
        lessonId: 34,
        type: "ASSIST",
        order: 2,
        question: 'Choose: "Dudo que él _____ la verdad" (I doubt he knows)',
      },

      // Unit 10 - Business Spanish challenges
      {
        id: 39,
        lessonId: 37,
        type: "SELECT",
        order: 1,
        question: 'How do you say "meeting" in Spanish?',
      },
      {
        id: 40,
        lessonId: 37,
        type: "ASSIST",
        order: 2,
        question: 'What is "la computadora"?',
      },
      {
        id: 41,
        lessonId: 38,
        type: "SELECT",
        order: 1,
        question: 'How do you say "presentation" in Spanish?',
      },
      {
        id: 42,
        lessonId: 38,
        type: "ASSIST",
        order: 2,
        question: 'What does "el informe" mean?',
      },

      // Unit 11 - Literature & Culture challenges
      {
        id: 43,
        lessonId: 41,
        type: "SELECT",
        order: 1,
        question: 'What is "Día de los Muertos"?',
      },
      {
        id: 44,
        lessonId: 41,
        type: "ASSIST",
        order: 2,
        question: 'When is "Las Posadas" celebrated?',
      },
      {
        id: 45,
        lessonId: 42,
        type: "SELECT",
        order: 1,
        question: 'Who wrote "Don Quixote"?',
      },
      {
        id: 46,
        lessonId: 42,
        type: "ASSIST",
        order: 2,
        question: 'What is "la novela"?',
      },

      // Unit 12 - Idiomatic Expressions challenges
      {
        id: 47,
        lessonId: 45,
        type: "SELECT",
        order: 1,
        question: 'What does "estar en las nubes" mean?',
      },
      {
        id: 48,
        lessonId: 45,
        type: "ASSIST",
        order: 2,
        question: 'Choose the meaning of "costar un ojo de la cara"',
      },
    ]);

    // Seed challenge options for all challenges
    await db.insert(schema.challengeOptions).values([
      // Challenge 1 - "the man"
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
      {
        challengeId: 1,
        imageSrc: "/boy.png",
        correct: false,
        text: "el niño",
        audioSrc: "/elNino.wav",
      },

      // Challenge 2 - "the woman"
      {
        challengeId: 2,
        imageSrc: "/female.png",
        correct: true,
        text: "la mujer",
        audioSrc: "/laMujer.wav",
      },
      {
        challengeId: 2,
        imageSrc: "/man.png",
        correct: false,
        text: "el hombre",
        audioSrc: "/elHombre.wav",
      },
      {
        challengeId: 2,
        imageSrc: "/girl.png",
        correct: false,
        text: "la niña",
        audioSrc: "/laNina.wav",
      },

      // Challenge 3 - "el niño"
      {
        challengeId: 3,
        correct: true,
        text: "the boy",
      },
      {
        challengeId: 3,
        correct: false,
        text: "the girl",
      },
      {
        challengeId: 3,
        correct: false,
        text: "the man",
      },

      // Challenge 4 - robot
      {
        challengeId: 4,
        imageSrc: "/robot.png",
        correct: true,
        text: "el robot",
        audioSrc: "/elRobot.wav",
      },
      {
        challengeId: 4,
        imageSrc: "/dog.png",
        correct: false,
        text: "el perro",
        audioSrc: "/elPerro.wav",
      },
      {
        challengeId: 4,
        imageSrc: "/cat.png",
        correct: false,
        text: "el gato",
        audioSrc: "/elGato.wav",
      },

      // Challenge 5 - "to eat"
      {
        challengeId: 5,
        correct: true,
        text: "comer",
        audioSrc: "/comer.wav",
      },
      {
        challengeId: 5,
        correct: false,
        text: "beber",
        audioSrc: "/beber.wav",
      },
      {
        challengeId: 5,
        correct: false,
        text: "dormir",
        audioSrc: "/dormir.wav",
      },

      // Challenge 6 - "to be"
      {
        challengeId: 6,
        correct: true,
        text: "ser",
        audioSrc: "/ser.wav",
      },
      {
        challengeId: 6,
        correct: true,
        text: "estar",
        audioSrc: "/estar.wav",
      },
      {
        challengeId: 6,
        correct: false,
        text: "tener",
        audioSrc: "/tener.wav",
      },

      // Challenge 7 - "yo hablo"
      {
        challengeId: 7,
        correct: true,
        text: "hablo",
        audioSrc: "/hablo.wav",
      },
      {
        challengeId: 7,
        correct: false,
        text: "hablas",
        audioSrc: "/hablas.wav",
      },
      {
        challengeId: 7,
        correct: false,
        text: "habla",
        audioSrc: "/habla.wav",
      },

      // Challenge 8 - "Tú hablas"
      {
        challengeId: 8,
        correct: true,
        text: "hablas",
        audioSrc: "/hablas.wav",
      },
      {
        challengeId: 8,
        correct: false,
        text: "hablo",
        audioSrc: "/hablo.wav",
      },
      {
        challengeId: 8,
        correct: false,
        text: "habla",
        audioSrc: "/habla.wav",
      },

      // Challenge 9 - ser vs estar
      {
        challengeId: 9,
        correct: true,
        text: "Ser for permanent, estar for temporary",
      },
      {
        challengeId: 9,
        correct: false,
        text: "Estar for permanent, ser for temporary",
      },
      {
        challengeId: 9,
        correct: false,
        text: "They are interchangeable",
      },

      // Challenge 10 - "María es doctora"
      {
        challengeId: 10,
        correct: true,
        text: "es",
        audioSrc: "/es.wav",
      },
      {
        challengeId: 10,
        correct: false,
        text: "está",
        audioSrc: "/esta.wav",
      },
      {
        challengeId: 10,
        correct: false,
        text: "son",
        audioSrc: "/son.wav",
      },

      // Challenge 11 - "Good morning"
      {
        challengeId: 11,
        correct: true,
        text: "Buenos días",
        audioSrc: "/buenosDias.wav",
      },
      {
        challengeId: 11,
        correct: false,
        text: "Buenas tardes",
        audioSrc: "/buenasTardes.wav",
      },
      {
        challengeId: 11,
        correct: false,
        text: "Buenas noches",
        audioSrc: "/buenasNoches.wav",
      },

      // Challenge 12 - Response to "¿Cómo estás?"
      {
        challengeId: 12,
        correct: true,
        text: "Bien, gracias",
        audioSrc: "/bienGracias.wav",
      },
      {
        challengeId: 12,
        correct: false,
        text: "Hola",
        audioSrc: "/hola.wav",
      },
      {
        challengeId: 12,
        correct: false,
        text: "Adiós",
        audioSrc: "/adios.wav",
      },

      // Challenge 13 - "please"
      {
        challengeId: 13,
        correct: true,
        text: "por favor",
        audioSrc: "/porFavor.wav",
      },
      {
        challengeId: 13,
        correct: false,
        text: "gracias",
        audioSrc: "/gracias.wav",
      },
      {
        challengeId: 13,
        correct: false,
        text: "de nada",
        audioSrc: "/deNada.wav",
      },

      // Challenge 14 - asking for help politely
      {
        challengeId: 14,
        correct: true,
        text: "¿Puede ayudarme, por favor?",
        audioSrc: "/puedeAyudarme.wav",
      },
      {
        challengeId: 14,
        correct: false,
        text: "¡Ayúdame!",
        audioSrc: "/ayudame.wav",
      },
      {
        challengeId: 14,
        correct: false,
        text: "Necesito ayuda ahora",
        audioSrc: "/necesito.wav",
      },

      // Challenge 15 - "fifteen"
      {
        challengeId: 15,
        correct: true,
        text: "quince",
        audioSrc: "/quince.wav",
      },
      {
        challengeId: 15,
        correct: false,
        text: "catorce",
        audioSrc: "/catorce.wav",
      },
      {
        challengeId: 15,
        correct: false,
        text: "dieciséis",
        audioSrc: "/dieciseis.wav",
      },

      // Challenge 16 - "siete"
      {
        challengeId: 16,
        correct: true,
        text: "7",
      },
      {
        challengeId: 16,
        correct: false,
        text: "6",
      },
      {
        challengeId: 16,
        correct: false,
        text: "8",
      },

      // Challenge 17 - "It is 3:30"
      {
        challengeId: 17,
        correct: true,
        text: "Son las tres y media",
        audioSrc: "/treysMedia.wav",
      },
      {
        challengeId: 17,
        correct: false,
        text: "Son las tres y cuarto",
        audioSrc: "/treyCuarto.wav",
      },
      {
        challengeId: 17,
        correct: false,
        text: "Son las dos y media",
        audioSrc: "/dosMedia.wav",
      },

      // Challenge 18 - "las dos y media"
      {
        challengeId: 18,
        correct: true,
        text: "2:30",
      },
      {
        challengeId: 18,
        correct: false,
        text: "2:15",
      },
      {
        challengeId: 18,
        correct: false,
        text: "3:30",
      },

      // Challenge 19 - "él habló"
      {
        challengeId: 19,
        correct: true,
        text: "habló",
        audioSrc: "/hablo.wav",
      },
      {
        challengeId: 19,
        correct: false,
        text: "habla",
        audioSrc: "/habla.wav",
      },
      {
        challengeId: 19,
        correct: false,
        text: "hablaba",
        audioSrc: "/hablaba.wav",
      },

      // Challenge 20 - "Ayer yo hablé"
      {
        challengeId: 20,
        correct: true,
        text: "hablé",
        audioSrc: "/hable.wav",
      },
      {
        challengeId: 20,
        correct: false,
        text: "hablo",
        audioSrc: "/hablo.wav",
      },
      {
        challengeId: 20,
        correct: false,
        text: "hablaba",
        audioSrc: "/hablaba.wav",
      },

      // Challenge 21 - "nosotros fuimos"
      {
        challengeId: 21,
        correct: true,
        text: "fuimos",
        audioSrc: "/fuimos.wav",
      },
      {
        challengeId: 21,
        correct: false,
        text: "vamos",
        audioSrc: "/vamos.wav",
      },
      {
        challengeId: 21,
        correct: false,
        text: "íbamos",
        audioSrc: "/ibamos.wav",
      },

      // Challenge 22 - "Ellos fueron"
      {
        challengeId: 22,
        correct: true,
        text: "fueron",
        audioSrc: "/fueron.wav",
      },
      {
        challengeId: 22,
        correct: false,
        text: "van",
        audioSrc: "/van.wav",
      },
      {
        challengeId: 22,
        correct: false,
        text: "iban",
        audioSrc: "/iban.wav",
      },

      // Challenge 23 - "chicken"
      {
        challengeId: 23,
        correct: true,
        text: "el pollo",
        audioSrc: "/pollo.wav",
      },
      {
        challengeId: 23,
        correct: false,
        text: "el pescado",
        audioSrc: "/pescado.wav",
      },
      {
        challengeId: 23,
        correct: false,
        text: "la carne",
        audioSrc: "/carne.wav",
      },

      // Challenge 24 - "la manzana"
      {
        challengeId: 24,
        correct: true,
        text: "apple",
      },
      {
        challengeId: 24,
        correct: false,
        text: "orange",
      },
      {
        challengeId: 24,
        correct: false,
        text: "banana",
      },

      // Challenge 25 - asking for menu
      {
        challengeId: 25,
        correct: true,
        text: "La carta, por favor",
        audioSrc: "/cartaPorFavor.wav",
      },
      {
        challengeId: 25,
        correct: false,
        text: "La cuenta, por favor",
        audioSrc: "/cuentaPorFavor.wav",
      },
      {
        challengeId: 25,
        correct: false,
        text: "El menú del día",
        audioSrc: "/menuDia.wav",
      },

      // Challenge 26 - "la cuenta, por favor"
      {
        challengeId: 26,
        correct: true,
        text: "The check, please",
      },
      {
        challengeId: 26,
        correct: false,
        text: "The menu, please",
      },
      {
        challengeId: 26,
        correct: false,
        text: "The tip, please",
      },

      // Challenge 27 - "train"
      {
        challengeId: 27,
        correct: true,
        text: "el tren",
        audioSrc: "/tren.wav",
      },
      {
        challengeId: 27,
        correct: false,
        text: "el autobús",
        audioSrc: "/autobus.wav",
      },
      {
        challengeId: 27,
        correct: false,
        text: "el avión",
        audioSrc: "/avion.wav",
      },

      // Challenge 28 - "el autobús"
      {
        challengeId: 28,
        correct: true,
        text: "bus",
      },
      {
        challengeId: 28,
        correct: false,
        text: "car",
      },
      {
        challengeId: 28,
        correct: false,
        text: "train",
      },

      // Challenge 29 - "Where is the bank?"
      {
        challengeId: 29,
        correct: true,
        text: "¿Dónde está el banco?",
        audioSrc: "/dondeEstaBanco.wav",
      },
      {
        challengeId: 29,
        correct: false,
        text: "¿Cómo está el banco?",
        audioSrc: "/comoEstaBanco.wav",
      },
      {
        challengeId: 29,
        correct: false,
        text: "¿Qué es el banco?",
        audioSrc: "/queEsBanco.wav",
      },

      // Challenge 30 - "a la derecha"
      {
        challengeId: 30,
        correct: true,
        text: "to the right",
      },
      {
        challengeId: 30,
        correct: false,
        text: "to the left",
      },
      {
        challengeId: 30,
        correct: false,
        text: "straight ahead",
      },

      // Challenge 31 - "grandmother"
      {
        challengeId: 31,
        correct: true,
        text: "la abuela",
        audioSrc: "/abuela.wav",
      },
      {
        challengeId: 31,
        correct: false,
        text: "la madre",
        audioSrc: "/madre.wav",
      },
      {
        challengeId: 31,
        correct: false,
        text: "la tía",
        audioSrc: "/tia.wav",
      },

      // Challenge 32 - "el hermano"
      {
        challengeId: 32,
        correct: true,
        text: "brother",
      },
      {
        challengeId: 32,
        correct: false,
        text: "sister",
      },
      {
        challengeId: 32,
        correct: false,
        text: "cousin",
      },

      // Challenge 33 - "tall"
      {
        challengeId: 33,
        correct: true,
        text: "alto",
        audioSrc: "/alto.wav",
      },
      {
        challengeId: 33,
        correct: false,
        text: "bajo",
        audioSrc: "/bajo.wav",
      },
      {
        challengeId: 33,
        correct: false,
        text: "gordo",
        audioSrc: "/gordo.wav",
      },

      // Challenge 34 - "pelo rubio"
      {
        challengeId: 34,
        correct: true,
        text: "blonde hair",
      },
      {
        challengeId: 34,
        correct: false,
        text: "brown hair",
      },
      {
        challengeId: 34,
        correct: false,
        text: "black hair",
      },

      // Challenge 35 - subjunctive "yo hable"
      {
        challengeId: 35,
        correct: true,
        text: "hable",
        audioSrc: "/hable.wav",
      },
      {
        challengeId: 35,
        correct: false,
        text: "hablo",
        audioSrc: "/hablo.wav",
      },
      {
        challengeId: 35,
        correct: false,
        text: "hablé",
        audioSrc: "/hable2.wav",
      },

      // Challenge 36 - "Espero que tú estés bien"
      {
        challengeId: 36,
        correct: true,
        text: "estés",
        audioSrc: "/estes.wav",
      },
      {
        challengeId: 36,
        correct: false,
        text: "estás",
        audioSrc: "/estas.wav",
      },
      {
        challengeId: 36,
        correct: false,
        text: "estar",
        audioSrc: "/estar.wav",
      },

      // Challenge 37 - subjunctive phrases
      {
        challengeId: 37,
        correct: true,
        text: "Es posible que...",
        audioSrc: "/esPosible.wav",
      },
      {
        challengeId: 37,
        correct: false,
        text: "Es cierto que...",
        audioSrc: "/esCierto.wav",
      },
      {
        challengeId: 37,
        correct: false,
        text: "Es obvio que...",
        audioSrc: "/esObvio.wav",
      },

      // Challenge 38 - "Dudo que él sepa"
      {
        challengeId: 38,
        correct: true,
        text: "sepa",
        audioSrc: "/sepa.wav",
      },
      {
        challengeId: 38,
        correct: false,
        text: "sabe",
        audioSrc: "/sabe.wav",
      },
      {
        challengeId: 38,
        correct: false,
        text: "sabía",
        audioSrc: "/sabia.wav",
      },

      // Challenge 39 - "meeting"
      {
        challengeId: 39,
        correct: true,
        text: "la reunión",
        audioSrc: "/reunion.wav",
      },
      {
        challengeId: 39,
        correct: false,
        text: "la oficina",
        audioSrc: "/oficina.wav",
      },
      {
        challengeId: 39,
        correct: false,
        text: "el proyecto",
        audioSrc: "/proyecto.wav",
      },

      // Challenge 40 - "la computadora"
      {
        challengeId: 40,
        correct: true,
        text: "computer",
      },
      {
        challengeId: 40,
        correct: false,
        text: "printer",
      },
      {
        challengeId: 40,
        correct: false,
        text: "phone",
      },

      // Challenge 41 - "presentation"
      {
        challengeId: 41,
        correct: true,
        text: "la presentación",
        audioSrc: "/presentacion.wav",
      },
      {
        challengeId: 41,
        correct: false,
        text: "la reunión",
        audioSrc: "/reunion.wav",
      },
      {
        challengeId: 41,
        correct: false,
        text: "el informe",
        audioSrc: "/informe.wav",
      },

      // Challenge 42 - "el informe"
      {
        challengeId: 42,
        correct: true,
        text: "report",
      },
      {
        challengeId: 42,
        correct: false,
        text: "meeting",
      },
      {
        challengeId: 42,
        correct: false,
        text: "presentation",
      },

      // Challenge 43 - "Día de los Muertos"
      {
        challengeId: 43,
        correct: true,
        text: "Day of the Dead",
      },
      {
        challengeId: 43,
        correct: false,
        text: "Day of the Living",
      },
      {
        challengeId: 43,
        correct: false,
        text: "Halloween",
      },

      // Challenge 44 - "Las Posadas"
      {
        challengeId: 44,
        correct: true,
        text: "December 16-24",
      },
      {
        challengeId: 44,
        correct: false,
        text: "November 1-2",
      },
      {
        challengeId: 44,
        correct: false,
        text: "January 6",
      },

      // Challenge 45 - "Don Quixote"
      {
        challengeId: 45,
        correct: true,
        text: "Miguel de Cervantes",
      },
      {
        challengeId: 45,
        correct: false,
        text: "Gabriel García Márquez",
      },
      {
        challengeId: 45,
        correct: false,
        text: "Federico García Lorca",
      },

      // Challenge 46 - "la novela"
      {
        challengeId: 46,
        correct: true,
        text: "novel",
      },
      {
        challengeId: 46,
        correct: false,
        text: "poem",
      },
      {
        challengeId: 46,
        correct: false,
        text: "play",
      },

      // Challenge 47 - "estar en las nubes"
      {
        challengeId: 47,
        correct: true,
        text: "to be absent-minded/daydreaming",
      },
      {
        challengeId: 47,
        correct: false,
        text: "to be very tall",
      },
      {
        challengeId: 47,
        correct: false,
        text: "to be flying",
      },

      // Challenge 48 - "costar un ojo de la cara"
      {
        challengeId: 48,
        correct: true,
        text: "to cost an arm and a leg",
      },
      {
        challengeId: 48,
        correct: false,
        text: "to be very ugly",
      },
      {
        challengeId: 48,
        correct: false,
        text: "to be dangerous",
      },
    ]);

    await seedSrsFromClassic();
    console.log("✅ Done seeding with expanded content for all 3 sections.");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    throw err;
  }
};

main();
