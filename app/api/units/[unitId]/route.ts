import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import db from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { units } from "@/database/schema";

export const GET = async (req: Request, props: { params: Promise<{ unitId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const data = await db.query.units.findFirst({
    where: eq(units.id, params.unitId),
  });

  return NextResponse.json(data);
};

export const PUT = async (req: Request, props: { params: Promise<{ unitId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const body = await req.json();

  const data = await db
    .update(units)
    .set({ ...body })
    .where(eq(units.id, params.unitId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (req: Request, props: { params: Promise<{ unitId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  await db.delete(units).where(eq(units.id, params.unitId));

  return NextResponse.json({});
};
