import db from "@/database/drizzle";
import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import { challenges } from "@/database/schema";

export const GET = async () => {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await db.query.challenges.findMany();
  return NextResponse.json(data); 
};

export const POST = async (req: Request) => {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const data = await db
    .insert(challenges)
    .values({ ...body })
    .returning();
    
  return NextResponse.json(data[0]);
};
