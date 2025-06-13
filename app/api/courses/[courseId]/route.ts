import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import db from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { courses } from "@/database/schema";

export const GET = async (req: Request, props: { params: Promise<{ courseId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const data = await db.query.courses.findFirst({
    where: eq(courses.id, params.courseId),
  });

  return NextResponse.json(data);
};

export const PUT = async (req: Request, props: { params: Promise<{ courseId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const body = await req.json();

  const data = await db
    .update(courses)
    .set({ ...body })
    .where(eq(courses.id, params.courseId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (req: Request, props: { params: Promise<{ courseId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  await db.delete(courses).where(eq(courses.id, params.courseId));

  return NextResponse.json({});
};
