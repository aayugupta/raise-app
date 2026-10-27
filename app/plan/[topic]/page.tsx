import { notFound } from "next/navigation";
import { MOMENTS, type MomentId } from "@/lib/talks";
import { isTopicId } from "@/lib/topics";
import PlannerView from "./PlannerView";

// Screen 6: Planner (D3, FR4), step 3 of the journey. Recovery can suggest a moment with ?moment=walk;
// ?skipPractice=1 means the parent skipped step 2 (practising with the AI Coach).
export default async function Plan({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ moment?: string; skipPractice?: string }>;
}) {
  const { topic } = await params;
  const { moment, skipPractice } = await searchParams;
  if (!isTopicId(topic)) notFound();
  const suggested = MOMENTS.some((m) => m.id === moment) ? (moment as MomentId) : undefined;
  return <PlannerView topic={topic} suggestedMoment={suggested} skippedPractice={skipPractice === "1"} />;
}
