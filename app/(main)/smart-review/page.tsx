import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSrsStats } from "@/queries/srs/getSrsStats";
import { SrsDashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "Smart Review • Lingo",
};

export default async function SmartReviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const stats = await getSrsStats();

  if (!stats) {
    redirect("/learn");
  }

  return <SrsDashboard stats={stats} />;
}
