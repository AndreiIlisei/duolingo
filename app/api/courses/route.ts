import db from "@/database/drizzle";
import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import { courses } from "@/database/schema";

export const GET = async () => {
  console.log("GET");
  
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await db.query.courses.findMany();

  console.log("GET DATA", data);

  return NextResponse.json(data);
};

export const POST = async (req: Request) => {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const data = await db
    .insert(courses)
    .values({ ...body })
    .returning();

  console.log("POST DATA", data);

  return NextResponse.json(data[0]);
};
