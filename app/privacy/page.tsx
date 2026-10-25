import Link from "next/link";

// Placeholder until the Privacy screen is built.
export default function Privacy() {
  return (
    <main style={{ padding: "56px 24px", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 32 }}>Privacy</h1>
      <p style={{ fontSize: 17, lineHeight: 1.45 }}>This screen is coming next.</p>
      <Link href="/setup" style={{ color: "var(--teal)", fontWeight: 600 }}>
        Back to Setup
      </Link>
    </main>
  );
}
