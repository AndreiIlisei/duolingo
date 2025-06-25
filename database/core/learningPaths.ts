import { relations } from "drizzle-orm";
import { pgTable, serial, text, integer, pgEnum } from "drizzle-orm/pg-core";
import { courses, sections } from "../schema";

export const learningPathEnum = pgEnum("learning_path", [
  "classic",
  "srs",
  "immersion",
  "targeted",
]);

export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  type: learningPathEnum("learning_path").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").default(0),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
});

export const learningPathsRelations = relations(
  learningPaths,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [learningPaths.courseId],
      references: [courses.id],
    }),
    sections: many(sections),
  })
);
