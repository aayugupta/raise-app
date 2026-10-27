import BottomNav from "@/components/BottomNav";
import HelpPill from "@/components/HelpPill";

// Placeholder for a tab screen that's planned but not built yet.
export default function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <HelpPill />
        </div>
        <h1 style={{ fontSize: 30, marginTop: 12 }}>{title}</h1>
        <p className="notice" style={{ marginTop: 16 }}>
          {text}
        </p>
      </div>
      <BottomNav />
    </main>
  );
}
