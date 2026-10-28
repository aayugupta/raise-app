import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";
import TrackOnView from "@/components/TrackOnView";
import { HELP_LINES } from "@/lib/safety";
import { CRISIS_TOPICS, type CrisisId } from "@/lib/topics";

// Help screen (FR12, Step 3 section 6C). Always reachable; crisis topics open it with ?about=.
// DRAFT wording: the expert advisor must write and approve help screens before launch.
// Nothing about the crisis is stored.

type Guide = { lines: string[]; say: string; steps: string[]; dont?: string[]; links?: { label: string; href: string }[] };

const GUIDES: Record<CrisisId, Guide> = {
  "self-harm": {
    lines: ["112", "14416", "1098"],
    say: "I'm really glad you told me. I'm here, and we'll get through this together.",
    steps: [
      "Stay with your teen. Don't leave them alone right now.",
      "If they are in danger now, call 112.",
      "Call Tele-MANAS on 14416 (free, 24×7) to talk to a counsellor.",
    ],
  },
  abuse: {
    lines: ["1098", "112"],
    say: "I believe you. This is not your fault, and you're not in trouble.",
    steps: [
      "Stay calm and believe your teen.",
      "Call Childline on 1098, or 112 if they are in danger now.",
      "Keep your teen away from the person if you can.",
    ],
    dont: ["Don't confront the person yourself.", "Don't ask blaming questions like “Why were you there?”"],
  },
  blackmail: {
    lines: ["1930"],
    say: "You're not in trouble. We'll handle this together.",
    steps: [
      "Report it on the cybercrime helpline 1930, or at cybercrime.gov.in.",
      "Use Take It Down to help get images removed.",
      "Take screenshots of the messages and the account.",
    ],
    dont: ["Don't pay.", "Don't delete messages. They are evidence.", "Don't contact the person yourself.", "Don't blame or shame your teen."],
    links: [
      { label: "cybercrime.gov.in", href: "https://cybercrime.gov.in" },
      { label: "Take It Down", href: "https://takeitdown.ncmec.org" },
    ],
  },
  addiction: {
    lines: ["14416"],
    say: "I'm not angry. I want to understand, and I want to help.",
    steps: [
      "Wait to talk until you are both calm.",
      "Call Tele-MANAS on 14416 (free, 24×7) for advice on next steps.",
      "See a doctor or counsellor together.",
    ],
    dont: ["Don't threaten or punish. Teens hide more when they're scared."],
  },
};

function isCrisisId(value: string | undefined): value is CrisisId {
  return CRISIS_TOPICS.some((c) => c.id === value);
}

export default async function Help({ searchParams }: { searchParams: Promise<{ about?: string }> }) {
  const { about } = await searchParams;
  const guide = isCrisisId(about) ? GUIDES[about] : undefined;
  const crisisName = isCrisisId(about) ? CRISIS_TOPICS.find((c) => c.id === about)?.name : undefined;
  const firstLines = guide ? HELP_LINES.filter((h) => guide.lines.includes(h.number)) : HELP_LINES;
  const otherLines = guide ? HELP_LINES.filter((h) => !guide.lines.includes(h.number)) : [];

  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px" }}>
        <BackButton />
        {/* Counts only that Help was opened, never which situation. */}
        <TrackOnView event="help_shown" fields={{ from: "help_page" }} />

        <h1 style={{ fontSize: 30, lineHeight: 1.15, margin: "16px 0 6px" }}>
          {guide ? "You don't have to handle this alone" : "Get help"}
        </h1>
        <p className="why">{crisisName ? crisisName : "Free helplines in India. Tap a number to call."}</p>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {firstLines.map((h) => (
            <li key={h.number}>
              <a href={`tel:${h.number}`} className="help-line">
                <strong>
                  {h.name} · {h.number}
                </strong>
                <span>{h.note}</span>
              </a>
            </li>
          ))}
        </ul>

        {guide && (
          <>
            <h2 className="section-title">Say this now</h2>
            <p className="notice" style={{ margin: 0, fontStyle: "italic", color: "var(--text)" }}>
              “{guide.say}”
            </p>

            <h2 className="section-title">What to do</h2>
            <ol style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 8, lineHeight: 1.45 }}>
              {guide.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>

            {guide.dont && (
              <>
                <h2 className="section-title">What not to do</h2>
                <ul style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 8, lineHeight: 1.45 }}>
                  {guide.dont.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </>
            )}

            {guide.links && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                {guide.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: "none" }}>
                    {l.label}
                  </a>
                ))}
              </div>
            )}

            <h2 className="section-title">Other helplines</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              {otherLines.map((h) => (
                <li key={h.number}>
                  <a href={`tel:${h.number}`} className="help-line">
                    <strong>
                      {h.name} · {h.number}
                    </strong>
                    <span>{h.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        {!guide && (
          <>
            <h2 className="section-title">Also useful</h2>
            <ul style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 8, lineHeight: 1.45 }}>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 600 }}>
                  cybercrime.gov.in
                </a>{" "}
                to report online harm
              </li>
              <li>
                <a href="https://takeitdown.ncmec.org" target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 600 }}>
                  Take It Down
                </a>{" "}
                to help remove a private image of someone under 18
              </li>
              <li>
                <a href="https://nimhans.ac.in" target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 600 }}>
                  NIMHANS
                </a>{" "}
                (SHUT clinic, Bengaluru) for help with heavy phone, gaming or internet use
              </li>
            </ul>
          </>
        )}

        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 24, lineHeight: 1.45 }}>
          Raise guides you to experts. It doesn't counsel or diagnose. Nothing you open here is saved.
        </p>
      </div>
      <BottomNav />
    </main>
  );
}
