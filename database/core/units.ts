import { pgTable, integer, text, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { lessons, sections } from "../schema";

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  sectionId: integer("section_id")
    .references(() => sections.id, { onDelete: "cascade" })
    .notNull(),
});

export const unitsRelations = relations(units, ({ one, many }) => ({
  section: one(sections, {
    fields: [units.sectionId],
    references: [sections.id],
  }),
  lessons: many(lessons),
}));
