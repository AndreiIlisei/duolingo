import db from "@/database/drizzle";
import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import { units } from "@/database/schema";
import { getUnits } from "@/queries/queries";

export const GET = async (request: Request) => {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sectionId = Number(new URL(request.url).searchParams.get("section"));
  const units = await getUnits(sectionId);
  return NextResponse.json(units);
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
