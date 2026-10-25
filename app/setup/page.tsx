import Link from "next/link";

// Placeholder until the Setup screen design arrives.
export default function Setup() {
  return (
    <main style={{ padding: "56px 24px", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 32 }}>Setup</h1>
      <p style={{ fontSize: 17, lineHeight: 1.45 }}>This screen is coming next.</p>
      <Link href="/" style={{ color: "var(--teal)", fontWeight: 600 }}>
        Back to Welcome
      </Link>
    </main>
  );
}
