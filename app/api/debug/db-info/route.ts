import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  
  // Only show first 30 chars for security
  const masked = dbUrl.substring(0, 30) + "...";
  
  return NextResponse.json({
    databaseUrl: masked,
    nodeEnv: process.env.NODE_ENV,
  });
}
