import Link from "next/link";
import { notFound } from "next/navigation";
import { isTopicId, topicName } from "@/lib/topics";

// Placeholder until the Planner screen is built.
export default async function Plan({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  if (!isTopicId(topic)) notFound();

  return (
    <main style={{ padding: "56px 24px", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 30 }}>Plan: {topicName(topic)}</h1>
      <p style={{ fontSize: 17, lineHeight: 1.45 }}>The planner is coming soon.</p>
      <Link href={`/card/${topic}`} style={{ color: "var(--teal)", fontWeight: 600 }}>
        Back to the card
      </Link>
    </main>
  );
}
