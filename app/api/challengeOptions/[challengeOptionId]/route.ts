/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import db from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { challengeOptions } from "@/database/schema";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ challengeOptionId: string }> }
) {
  const params = await props.params;

  if (!isAuthorized()) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const id = await Number(params.challengeOptionId); // ✅ safe to access here

  const data = await db.query.challengeOptions.findFirst({
    where: eq(challengeOptions.id, id),
  });

  return NextResponse.json(data);
}

export const PUT = async (
  req: NextRequest,
  props: { params: Promise<{ challengeOptionId: number }> }
) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const body = await req.json();

  const data = await db
    .update(challengeOptions)
    .set({ ...body })
    .where(eq(challengeOptions.id, params.challengeOptionId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  _req: NextRequest,
  props: { params: Promise<{ challengeOptionId: number }> }
) => {
  const params = await props.params;
  if (!isAuthorized()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  await db
    .delete(challengeOptions)
    .where(eq(challengeOptions.id, params.challengeOptionId));

  return NextResponse.json({});
};
