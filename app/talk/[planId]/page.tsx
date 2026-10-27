import Link from "next/link";

// Placeholder until the Talk mode screen is built.
export default function Talk() {
  return (
    <main style={{ padding: "56px 24px", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 30 }}>Talk mode</h1>
      <p style={{ fontSize: 17, lineHeight: 1.45 }}>Coming next: your first line, Start and Done.</p>
      <Link href="/home" style={{ color: "var(--teal)", fontWeight: 600 }}>
        Back to Home
      </Link>
    </main>
  );
}
