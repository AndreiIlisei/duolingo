import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // dbCredentials: {
  //   ssl: true,
  //   host: process.env.PGHOST!,
  //   port: Number(process.env.PGPORT),
  //   user: process.env.PGUSER!,
  //   password: process.env.PGPASSWORD!,
  //   database: process.env.PGDATABASE!,
  // },
});
