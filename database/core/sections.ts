import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { courses, units } from "../schema";
import { learningPaths } from "./learningPaths";
import { relations } from "drizzle-orm";

export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  courseId: integer("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  learningPathId: integer("learning_path_id")
    .references(() => learningPaths.id, { onDelete: "cascade" })
    .notNull(),
});

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, {
    fields: [sections.courseId],
    references: [courses.id],
  }),
  learningPath: one(learningPaths, {
    fields: [sections.learningPathId],
    references: [learningPaths.id],
  }),
  units: many(units),
}));
