import { notFound } from "next/navigation";
import { isTopicId } from "@/lib/topics";
import TalkCardView from "./TalkCardView";

// Screen 5: Talk Card (D2, FR2, FR3).
export default async function Card({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  if (!isTopicId(topic)) notFound();
  return <TalkCardView topic={topic} />;
}
