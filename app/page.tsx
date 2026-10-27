import FamilyHills from "@/components/FamilyHills";
import HelpPill from "@/components/HelpPill";
import Logo from "@/components/Logo";
import StartButton from "@/components/StartButton";

// Screen 1: Welcome, following Aayushi's simplified flow (28 Oct 2026, screen 1):
// the Raise wordmark with a sprout, the tagline, one line of support, a family on green hills, Get Started.
export default function Welcome() {
  return (
    <main className="welcome">
      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "flex-end", padding: "12px 16px 0" }}>
        <HelpPill />
      </div>

      <div className="welcome-body">
        <Logo size={68} />
        <p className="welcome-tagline">
          Better conversations.
          <br />Brighter tomorrows.
        </p>
        <p className="welcome-support">Guiding parents to build stronger bonds, one conversation at a time.</p>
      </div>

      <div className="welcome-bottom">
        <FamilyHills />
        <div className="welcome-action">
          <StartButton block />
          <p style={{ fontSize: 14, margin: "12px 0 0", color: "var(--muted)", textAlign: "center" }}>No sign-up. Stays private on your phone.</p>
        </div>
      </div>
    </main>
  );
}
