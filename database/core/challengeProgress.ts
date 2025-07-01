import { relations } from "drizzle-orm";
import { challenges, lessons } from "../schema";
import { pgTable, serial } from "drizzle-orm/pg-core";
import { integer, text } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";

// export const challengesRelations = relations(challenges, ({ one, many }) => ({
//   lesson: one(lessons, {
//     fields: [challenges.lessonId],
//     references: [lessons.id],
//   }),
//   challengeOptions: many(challengeOptions),
//   challengeProgress: many(challengeProgress),
// }));

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // TODO: Confirm this doesn't break
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
});

// export const challengeProgressRelations = relations(
//   challengeProgress,
//   ({ one }) => ({
//     challenge: one(challenges, {
//       fields: [challengeProgress.challengeId],
//       references: [challenges.id],
//     }),
//   })
// );

// export const challengeOptionsRelations = relations(
//   challengeOptions,
//   ({ one }) => ({
//     challenge: one(challenges, {
//       fields: [challengeOptions.challengeId],
//       references: [challenges.id],
//     }),
//   })
// );
