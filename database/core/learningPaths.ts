// learningPaths.ts
import { pgTable, serial, text, integer, pgEnum } from "drizzle-orm/pg-core";

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
});
