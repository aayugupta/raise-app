import Link from "next/link";

// Placeholder until the Reflection screen is built.
export default function Reflect() {
  return (
    <main style={{ padding: "56px 24px", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 30 }}>How did it go?</h1>
      <p style={{ fontSize: 17, lineHeight: 1.45 }}>The 30-second reflection is coming soon.</p>
      <Link href="/home" style={{ color: "var(--teal)", fontWeight: 600 }}>
        Back to Home
      </Link>
    </main>
  );
}
