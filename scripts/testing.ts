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
    await db.delete(schema.sections);
    await db.delete(schema.units);
    await db.delete(schema.lessons);
    await db.delete(schema.challenges);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);

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
        id: 1,
        learning_path_type: "classic",
        title: "Classic Path",
        description: "Learn through structured lessons and challenges",
        order: 1,
        courseId: 1,
      },
      {
        id: 2,
        learning_path_type: "srs",
        title: "Spaced Repetition",
        description: "Review based on your memory strength",
        order: 2,
        courseId: 1,
      },
      {
        id: 3,
        learning_path_type: "immersion",
        title: "Culture Immersion",
        description: "Learn through videos, news, and real-world content",
        order: 3,
        courseId: 1,
      },
      {
        id: 4,
        learning_path_type: "targeted",
        title: "Targeted Learning",
        description: "Language for travelers, professionals, or specific needs",
        order: 4,
        courseId: 1,
      },
    ]);

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
        title: "Classic - Section 3",
        description: "Advanced",
        order: 3,
        courseId: 1,
        learningPathId: classicPath.id,
      },
      {
        id: 4,
        title: "SRS - Section 1",
        description: "Spaced Repetition",
        order: 1,
        courseId: 1,
        learningPathId: srsPath.id,
      },
    ]);

    // Seed units for all 3 sections
    await db.insert(schema.units).values([
      // Section 1 - Foundations
      {
        id: 1,
        sectionId: 1,
        title: "Basic Vocabulary",
        description: "Learn essential Spanish words and phrases",
        order: 1,
      },
      {
        id: 2,
        sectionId: 1,
        title: "Grammar Basics",
        description: "Master fundamental Spanish grammar rules",
        order: 2,
      },
      {
        id: 3,
        sectionId: 1,
        title: "Common Phrases",
        description: "Learn everyday expressions and greetings",
        order: 3,
      },
      {
        id: 4,
        sectionId: 1,
        title: "Numbers & Time",
        description: "Count and tell time in Spanish",
        order: 4,
      },

      // Section 2 - Improvers
      {
        id: 5,
        sectionId: 2,
        title: "Past Tense",
        description: "Express actions in the past",
        order: 1,
      },
      {
        id: 6,
        sectionId: 2,
        title: "Food & Dining",
        description: "Navigate restaurants and cooking vocabulary",
        order: 2,
      },
      {
        id: 7,
        sectionId: 2,
        title: "Travel & Directions",
        description: "Get around and ask for directions",
        order: 3,
      },
      {
        id: 8,
        sectionId: 2,
        title: "Family & Relationships",
        description: "Talk about family and personal relationships",
        order: 4,
      },

      // Section 3 - Advanced
      {
        id: 9,
        sectionId: 3,
        title: "Subjunctive Mood",
        description: "Express doubt, emotion, and hypothetical situations",
        order: 1,
      },
      {
        id: 10,
        sectionId: 3,
        title: "Business Spanish",
        description: "Professional vocabulary and formal communication",
        order: 2,
      },
      {
        id: 11,
        sectionId: 3,
        title: "Literature & Culture",
        description: "Explore Spanish-speaking cultures and literature",
        order: 3,
      },
      {
        id: 12,
        sectionId: 3,
        title: "Idiomatic Expressions",
        description: "Master colloquialisms and cultural expressions",
        order: 4,
      },
    ]);

    // Seed lessons for all units
    await db.insert(schema.lessons).values([
      // Unit 1 - Basic Vocabulary
      { id: 1, unitId: 1, order: 1, title: "Nouns" },
      { id: 2, unitId: 1, order: 2, title: "Verbs" },
      { id: 3, unitId: 1, order: 3, title: "Adjectives" },
      { id: 4, unitId: 1, order: 4, title: "Articles" },

      // Unit 2 - Grammar Basics
      { id: 5, unitId: 2, order: 1, title: "Verb Conjugation" },
      { id: 6, unitId: 2, order: 2, title: "Ser vs Estar" },
      { id: 7, unitId: 2, order: 3, title: "Question Formation" },
      { id: 8, unitId: 2, order: 4, title: "Negation" },

      // Unit 3 - Common Phrases
      { id: 9, unitId: 3, order: 1, title: "Greetings" },
      { id: 10, unitId: 3, order: 2, title: "Politeness" },
      { id: 11, unitId: 3, order: 3, title: "Shopping" },
      { id: 12, unitId: 3, order: 4, title: "Emotions" },

      // Unit 4 - Numbers & Time
      { id: 13, unitId: 4, order: 1, title: "Numbers 1-20" },
      { id: 14, unitId: 4, order: 2, title: "Numbers 21-100" },
      { id: 15, unitId: 4, order: 3, title: "Time" },
      { id: 16, unitId: 4, order: 4, title: "Dates" },

      // Unit 5 - Past Tense
      { id: 17, unitId: 5, order: 1, title: "Preterite Regular" },
      { id: 18, unitId: 5, order: 2, title: "Preterite Irregular" },
      { id: 19, unitId: 5, order: 3, title: "Imperfect" },
      { id: 20, unitId: 5, order: 4, title: "Past vs Present" },

      // Unit 6 - Food & Dining
      { id: 21, unitId: 6, order: 1, title: "Food Items" },
      { id: 22, unitId: 6, order: 2, title: "At the Restaurant" },
      { id: 23, unitId: 6, order: 3, title: "Cooking Verbs" },
      { id: 24, unitId: 6, order: 4, title: "Dietary Preferences" },

      // Unit 7 - Travel & Directions
      { id: 25, unitId: 7, order: 1, title: "Transportation" },
      { id: 26, unitId: 7, order: 2, title: "Asking for Directions" },
      { id: 27, unitId: 7, order: 3, title: "Hotel & Accommodation" },
      { id: 28, unitId: 7, order: 4, title: "Tourist Activities" },

      // Unit 8 - Family & Relationships
      { id: 29, unitId: 8, order: 1, title: "Family Members" },
      { id: 30, unitId: 8, order: 2, title: "Personal Descriptions" },
      { id: 31, unitId: 8, order: 3, title: "Relationships" },
      { id: 32, unitId: 8, order: 4, title: "Life Events" },

      // Unit 9 - Subjunctive Mood
      { id: 33, unitId: 9, order: 1, title: "Present Subjunctive" },
      { id: 34, unitId: 9, order: 2, title: "Doubt and Emotion" },
      { id: 35, unitId: 9, order: 3, title: "Hypothetical Situations" },
      { id: 36, unitId: 9, order: 4, title: "Commands" },

      // Unit 10 - Business Spanish
      { id: 37, unitId: 10, order: 1, title: "Office Vocabulary" },
      { id: 38, unitId: 10, order: 2, title: "Meetings & Presentations" },
      { id: 39, unitId: 10, order: 3, title: "Email Writing" },
      { id: 40, unitId: 10, order: 4, title: "Negotiations" },

      // Unit 11 - Literature & Culture
      { id: 41, unitId: 11, order: 1, title: "Cultural Traditions" },
      { id: 42, unitId: 11, order: 2, title: "Literature Basics" },
      { id: 43, unitId: 11, order: 3, title: "Art & Music" },
      { id: 44, unitId: 11, order: 4, title: "History" },

      // Unit 12 - Idiomatic Expressions
      { id: 45, unitId: 12, order: 1, title: "Common Idioms" },
      { id: 46, unitId: 12, order: 2, title: "Slang & Colloquialisms" },
      { id: 47, unitId: 12, order: 3, title: "Regional Variations" },
      { id: 48, unitId: 12, order: 4, title: "Cultural Context" },
    ]);

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

    console.log("✅ Done seeding with expanded content for all 3 sections.");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    throw err;
  }
};

main();
