import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

// Debug: Log environment variables
console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL);
console.log(
  "🔍 All ENV vars:",
  Object.keys(process.env).filter((key) => key.includes("DATABASE"))
);

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
