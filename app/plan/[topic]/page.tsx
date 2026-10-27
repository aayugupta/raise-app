import { notFound } from "next/navigation";
import { MOMENTS, type MomentId } from "@/lib/talks";
import { isTopicId } from "@/lib/topics";
import PlannerView from "./PlannerView";

// Screen 6: Planner (D3, FR4). Recovery can suggest a moment with ?moment=walk.
export default async function Plan({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ moment?: string }>;
}) {
  const { topic } = await params;
  const { moment } = await searchParams;
  if (!isTopicId(topic)) notFound();
  const suggested = MOMENTS.some((m) => m.id === moment) ? (moment as MomentId) : undefined;
  return <PlannerView topic={topic} suggestedMoment={suggested} />;
}
