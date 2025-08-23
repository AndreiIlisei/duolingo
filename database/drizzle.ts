import * as schema from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  console.log("🔍 Creating database connection...");
  console.log("🔍 DATABASE_URL exists:", !!databaseUrl);
  console.log(
    "🔍 DATABASE_URL starts with:",
    databaseUrl?.substring(0, 15) || "UNDEFINED"
  );

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set in environment variables");
    console.log(
      "🔍 Available env vars:",
      Object.keys(process.env).filter((k) => k.includes("DATA"))
    );
    throw new Error("DATABASE_URL environment variable is required");
  }

  try {
    const sql = postgres(databaseUrl, {
      ssl: databaseUrl.includes("amazonaws.com") ? "require" : "prefer", // RDS requires SSL
    });
    return drizzle(sql, { schema });
  } catch (error) {
    console.error("❌ Failed to create database connection:", error);
    throw error;
  }
}

const db = createDatabase();
export default db;
