import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userProgress, units } from "../schema";
import { learningPaths } from "./learningPaths";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
  learningPathId: integer("learning_path_id")
    .references(() => learningPaths.id, { onDelete: "cascade" })
    .notNull(),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  userProgress: many(userProgress),
  units: many(units),
  learningPath: one(learningPaths, {
    fields: [courses.learningPathId],
    references: [learningPaths.id],
  }),
}));
