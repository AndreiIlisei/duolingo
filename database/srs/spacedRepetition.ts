import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  real,
  primaryKey,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { courses, lessons } from "../schema";

export const srsDirection = pgEnum("srs_direction", ["l1_to_l2", "l2_to_l1"]);

/** Reviewable item per course (optionally linked back to a lesson). */
export const srsItems = pgTable(
  "srs_items",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .references(() => courses.id, { onDelete: "cascade" })
      .notNull(),

    term: text("term").notNull(), // e.g. “el hombre”
    meaning: text("meaning").notNull(), // e.g. “the man”
    partOfSpeech: text("pos"),
    // audioSrc: text("audio_src"),
    // imageSrc: text("image_src"),
    example: text("example"),

    originLessonId: integer("origin_lesson_id").references(() => lessons.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("srs_items_course_term_unique").on(t.courseId, t.term),
    index("srs_items_course_idx").on(t.courseId),
  ]
);

export const srsItemsRelations = relations(srsItems, ({ one }) => ({
  course: one(courses, {
    fields: [srsItems.courseId],
    references: [courses.id],
  }),
  originLesson: one(lessons, {
    fields: [srsItems.originLessonId],
    references: [lessons.id],
  }),
}));

/** Per-user scheduling state (SM-2 compatible). */
export const srsUserItem = pgTable(
  "srs_user_item",
  {
    userId: text("user_id").notNull(),
    itemId: integer("item_id")
      .references(() => srsItems.id, { onDelete: "cascade" })
      .notNull(),

    ef: real("ef").notNull().default(2.5),
    intervalDays: integer("interval_days").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),

    dueAt: timestamp("due_at")
      .notNull()
      .default(sql`now()`),
    lastReviewAt: timestamp("last_review_at"),
    suspended: boolean("suspended").notNull().default(false),
    direction: srsDirection("direction").default("l1_to_l2"),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.itemId] }),
    index("srs_user_item_due_idx").on(t.userId, t.dueAt),
  ]
);

/** Immutable review history with snapshot of new state after each answer. */
export const srsReviewEvents = pgTable(
  "srs_review_events",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    itemId: integer("item_id")
      .references(() => srsItems.id, { onDelete: "cascade" })
      .notNull(),

    quality: integer("quality").notNull(), // 0..5 (SM-2)
    responseMs: integer("response_ms"),
    hintUsed: boolean("hint_used").default(false),

    reviewedAt: timestamp("reviewed_at").notNull().defaultNow(),

    newEf: real("new_ef"),
    newIntervalDays: integer("new_interval_days"),
    newDueAt: timestamp("new_due_at"),
  },
  (t) => [
    index("srs_review_events_user_item_idx").on(
      t.userId,
      t.itemId,
      t.reviewedAt
    ),
  ]
);

/** Optional decks/tags. */
export const srsDecks = pgTable(
  "srs_decks",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .references(() => courses.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    description: text("description"),
  },
  (t) => [index("srs_decks_course_idx").on(t.courseId)]
);

export const srsDeckItems = pgTable(
  "srs_deck_items",
  {
    deckId: integer("deck_id")
      .references(() => srsDecks.id, { onDelete: "cascade" })
      .notNull(),
    itemId: integer("item_id")
      .references(() => srsItems.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.deckId, t.itemId] })]
);
