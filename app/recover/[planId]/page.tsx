import RecoverView from "./RecoverView";

// Screen 10: Recovery (D5, FR9, FR10). ?why=not-yet or ?why=repair
export default async function Recover({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ why?: string; blocker?: string; next?: string }>;
}) {
  const { planId } = await params;
  const { why, blocker, next } = await searchParams;
  return <RecoverView planId={planId} why={why === "repair" ? "repair" : "not-yet"} picked={blocker} nextPlanId={next} />;
}
