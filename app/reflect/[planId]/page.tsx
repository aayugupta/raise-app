import ReflectView from "./ReflectView";

// Screen 9: Reflection (D4, FR7, FR10, FR12).
export default async function Reflect({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return <ReflectView planId={planId} />;
}
