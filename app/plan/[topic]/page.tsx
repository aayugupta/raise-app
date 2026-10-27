import { notFound } from "next/navigation";
import { isTopicId } from "@/lib/topics";
import PlannerView from "./PlannerView";

// Screen 6: Planner (D3, FR4).
export default async function Plan({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  if (!isTopicId(topic)) notFound();
  return <PlannerView topic={topic} />;
}
