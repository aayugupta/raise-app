import HelpPill from "@/components/HelpPill";
import StartButton from "@/components/StartButton";
import WalkTogether from "@/components/WalkTogether";

// Screen 1: Welcome. Layout follows Aayushi's reference design:
// big serif headline, short subtitle, teal button, illustration filling the bottom.
export default function Welcome() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--peach)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "flex-end", padding: "12px 16px 0" }}>
        <HelpPill style={{ background: "rgba(255,255,255,0.6)" }} />
      </div>
      <div style={{ padding: "clamp(8px, 3vh, 32px) 24px 0", maxWidth: 440 }}>
        <h1 style={{ fontSize: "clamp(36px, 12vw, 46px)", lineHeight: 1.05, textWrap: "balance" }}>Every hard talk starts with one line</h1>
        <p style={{ fontSize: 17, lineHeight: 1.45, margin: "16px 0 24px", color: "var(--text)" }}>
          Raise gives you the first line, a good moment, and calm words for whatever comes next.
        </p>
        <StartButton />
        <p style={{ fontSize: 14, margin: "14px 0 0", color: "var(--muted)" }}>
          No sign-up. Stays private on your phone.
        </p>
      </div>

      <div style={{ marginTop: "auto", width: "100%", maxWidth: 480, paddingTop: 16 }}>
        <WalkTogether />
      </div>
    </main>
  );
}
