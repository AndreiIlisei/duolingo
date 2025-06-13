import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import db from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { lessons } from "@/database/schema";

export const GET = async (req: Request, props: { params: Promise<{ lessonId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, params.lessonId),
  });

  return NextResponse.json(data);
};

export const PUT = async (req: Request, props: { params: Promise<{ lessonId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const body = await req.json();

  const data = await db
    .update(lessons)
    .set({ ...body })
    .where(eq(lessons.id, params.lessonId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (req: Request, props: { params: Promise<{ lessonId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  await db.delete(lessons).where(eq(lessons.id, params.lessonId));

  return NextResponse.json({});
};
