import Link from "next/link";

// Placeholder until the Recovery screen is built.
export default function Recover() {
  return (
    <main style={{ padding: "56px 24px", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 30 }}>Let's try again</h1>
      <p style={{ fontSize: 17, lineHeight: 1.45 }}>The recovery path is coming next.</p>
      <Link href="/home" style={{ color: "var(--teal)", fontWeight: 600 }}>
        Back to Home
      </Link>
    </main>
  );
}
