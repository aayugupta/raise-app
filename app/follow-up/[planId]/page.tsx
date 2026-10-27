import FollowUpView from "./FollowUpView";

// Screen 11: the 3-day follow-up (FR8).
export default async function FollowUp({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return <FollowUpView planId={planId} />;
}
