import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import db from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { challenges } from "@/database/schema";

export const GET = async (req: Request, props: { params: Promise<{ challengeId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const data = await db.query.challenges.findFirst({
    where: eq(challenges.id, params.challengeId),
  });

  return NextResponse.json(data);
};

export const PUT = async (req: Request, props: { params: Promise<{ challengeId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const body = await req.json();

  const data = await db
    .update(challenges)
    .set({ ...body })
    .where(eq(challenges.id, params.challengeId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (req: Request, props: { params: Promise<{ challengeId: number }> }) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  await db.delete(challenges).where(eq(challenges.id, params.challengeId));

  return NextResponse.json({});
};
