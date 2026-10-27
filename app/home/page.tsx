import Link from "next/link";

// Placeholder until the Home screen is built.
export default function Home() {
  return (
    <main style={{ padding: "56px 24px", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 32 }}>Home</h1>
      <p style={{ fontSize: 17, lineHeight: 1.45 }}>Your open topics will show here.</p>
      <Link href="/topics" style={{ color: "var(--teal)", fontWeight: 600 }}>
        Back to topics
      </Link>
    </main>
  );
}
