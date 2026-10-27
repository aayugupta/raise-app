import TalkMode from "./TalkMode";

// Screen 8: Talk mode (D4, FR6).
export default async function Talk({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return <TalkMode planId={planId} />;
}
