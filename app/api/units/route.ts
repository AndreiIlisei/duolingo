import db from "@/database/drizzle";
import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import { units } from "@/database/schema";

export const GET = async () => {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await db.query.units.findMany();
  return NextResponse.json(data);
};

export const POST = async (req: Request) => {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const data = await db
    .insert(units)
    .values({ ...body })
    .returning();
    
  return NextResponse.json(data[0]);
};
