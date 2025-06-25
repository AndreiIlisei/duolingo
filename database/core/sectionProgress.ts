import { pgTable, integer, text, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userProgress, sections } from "../schema";

export const sectionProgress = pgTable(
  "section_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => userProgress.userId, { onDelete: "cascade" }),

    sectionId: integer("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),

    completed: boolean("completed").notNull().default(false),

    // Composite primary key to prevent duplicate progress rows per user/section
  },
  (table) => ({
    pk: [table.userId, table.sectionId],
  })
);

export const sectionProgressRelations = relations(
  sectionProgress,
  ({ one }) => ({
    user: one(userProgress, {
      fields: [sectionProgress.userId],
      references: [userProgress.userId],
    }),
    section: one(sections, {
      fields: [sectionProgress.sectionId],
      references: [sections.id],
    }),
  })
);
