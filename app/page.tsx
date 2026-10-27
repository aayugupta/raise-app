import GreenHills from "@/components/GreenHills";
import HelpPill from "@/components/HelpPill";
import Logo from "@/components/Logo";
import StartButton from "@/components/StartButton";

// Screen 1: Welcome / Splash, following Aayushi's brainstorm (screen 1):
// the Raise wordmark with a sprout, the tagline, one line of support, green hills, Get Started.
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
          <br />A stronger tomorrow.
        </p>
        <p className="welcome-support">Practical support for parents to have meaningful conversations with their teenagers.</p>
      </div>

      <div className="welcome-bottom">
        <GreenHills />
        <div className="welcome-action">
          <StartButton block />
          <p style={{ fontSize: 14, margin: "12px 0 0", color: "var(--muted)", textAlign: "center" }}>No sign-up. Stays private on your phone.</p>
        </div>
      </div>
    </main>
  );
}
