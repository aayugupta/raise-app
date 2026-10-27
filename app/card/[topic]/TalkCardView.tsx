"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { baseTalkCard, getBaseCard, SAFETY_PROMISE, type Language, type TalkCard } from "@/lib/cards";
import type { Family } from "@/lib/cardPrompt";
import { loadProfile } from "@/lib/profile";
import { addOpenTopic } from "@/lib/talks";
import { TOPICS, type TopicId } from "@/lib/topics";

const REACTIONS: { key: "quiet" | "upset" | "disagree" | "noTalk"; label: string }[] = [
  { key: "quiet", label: "If they go quiet" },
  { key: "upset", label: "If they get upset" },
  { key: "disagree", label: "If they disagree" },
  { key: "noTalk", label: "If they don't want to talk" },
];

const LANGUAGE_NAMES: Record<Language, string> = { hinglish: "Hinglish", hindi: "हिन्दी", english: "English" };

const CLIENT_TIMEOUT_MS = 9000;

type Loaded = { source: "ai" | "base"; card: TalkCard; language: Language };

// One request per card at a time, even if the screen asks twice (React does this in development).
const inFlight = new Map<string, Promise<{ source?: string; card?: TalkCard } | null>>();

function requestCard(key: string, topic: TopicId, family: Family) {
  let request = inFlight.get(key);
  if (!request) {
    request = fetch("/api/card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, family }),
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
    })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .finally(() => inFlight.delete(key));
    inFlight.set(key, request);
  }
  return request;
}

// Personalised cards are remembered on this phone, so reopening a card doesn't call the AI again.
function cacheKey(topic: TopicId, f: Family, checkedOn: string) {
  return `raise.card.${topic}.${f.role}.${f.ageBand}.${f.teenGender}.${f.language}.${f.comfort}.${checkedOn}`;
}

export default function TalkCardView({ topic }: { topic: TopicId }) {
  const router = useRouter();
  const base = getBaseCard(topic);
  const meta = TOPICS.find((t) => t.id === topic)!;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    const profile = loadProfile();
    if (!profile) {
      setLoaded({ source: "base", card: baseTalkCard(base, "hinglish"), language: "hinglish" });
      return;
    }
    // Only tapped answers leave the phone: never the nickname or what the parent typed.
    const family: Family = {
      role: profile.role,
      ageBand: profile.ageBand,
      teenGender: profile.teenGender,
      language: profile.language,
      comfort: profile.comfort,
    };
    const showBase = () => setLoaded({ source: "base", card: baseTalkCard(base, family.language), language: family.language });

    const key = cacheKey(topic, family, base.checkedOn);
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        setLoaded({ source: "ai", card: JSON.parse(cached) as TalkCard, language: family.language });
        return;
      }
    } catch {
      // Storage blocked: just ask the AI.
    }

    let cancelled = false;
    requestCard(key, topic, family).then((data) => {
      if (cancelled) return;
      if (data?.source === "ai" && data.card) {
        try {
          localStorage.setItem(key, JSON.stringify(data.card));
        } catch {}
        setLoaded({ source: "ai", card: data.card, language: family.language });
      } else {
        showBase();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [topic, base]);

  if (!loaded) {
    return (
      <main style={{ minHeight: "100dvh", background: "var(--cream)" }}>
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px" }}>
          <button onClick={() => router.push("/topics")} className="icon-btn" aria-label="Back">
            ←
          </button>
          <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: "18px 0 0", textWrap: "balance" }}>“{base.teenQuestion}”</h1>
          <section className="first-line" aria-live="polite">
            <div className="card-label">Your first line</div>
            <p style={{ opacity: 0.6 }}>Writing your card…</p>
            <div className="loading-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </section>
        </div>
      </main>
    );
  }

  const { card, language, source } = loaded;

  function notNow() {
    addOpenTopic(topic);
    router.push("/home");
  }

  return (
    <main style={{ minHeight: "100dvh", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.push("/topics")} className="icon-btn" aria-label="Back">
            ←
          </button>
          <Link href="/help" className="help-pill">
            Help
          </Link>
        </div>

        {/* Topic, opened from the teen's side */}
        <div style={{ margin: "18px 0 6px", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="topic-dot" style={{ background: meta.color, marginTop: 0 }} aria-hidden="true" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {meta.name}
          </span>
        </div>
        <h1 style={{ fontSize: 28, lineHeight: 1.15, textWrap: "balance" }}>“{base.teenQuestion}”</h1>

        {/* 1. Why now */}
        <p style={{ fontSize: 16, lineHeight: 1.5, margin: "12px 0 0" }}>{card.whyNow}</p>
        {base.whySource && <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>{base.whySource}</p>}

        {/* 2. First line: the heart of the card */}
        <section className="first-line">
          <div className="card-label">
            Your first line · {LANGUAGE_NAMES[language]} · {source === "ai" ? "written for you" : "standard card"}
          </div>
          <p className={language === "hindi" ? "devanagari" : undefined} lang={language === "hindi" ? "hi" : language === "hinglish" ? "hi-Latn" : "en"}>
            {card.firstLine}
          </p>
          <div style={{ fontSize: 14, color: "var(--text)" }}>Try saying it out loud once, in your own voice.</div>
        </section>

        {/* 3. Follow-ups */}
        <h2 className="section-title">Then ask</h2>
        <ol className="card-list">
          {card.followUps.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>

        {/* 4. Say / avoid */}
        <div className="say-avoid">
          <section>
            <h2 className="section-title" style={{ color: "var(--teal)" }}>
              Say
            </h2>
            <ul className="card-list">
              {card.say.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="section-title" style={{ color: "#b4472f" }}>
              Avoid
            </h2>
            <ul className="card-list">
              {card.avoid.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* 5. If they react */}
        <h2 className="section-title">If they react</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {REACTIONS.map((r) => (
            <div key={r.key} className="react-row">
              <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>{r.label}</div>
              <div style={{ fontStyle: "italic", marginTop: 2 }}>“{card.react[r.key]}”</div>
            </div>
          ))}
        </div>

        {/* Fixed on every card, whatever the AI writes */}
        <section className="promise">
          <div className="card-label" style={{ color: "#fff", opacity: 0.85 }}>
            Always say this
          </div>
          <p>“{SAFETY_PROMISE}”</p>
        </section>

        <section className="notice" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, color: "var(--ink)" }}>When to get help</div>
          <p style={{ margin: "4px 0 8px", fontSize: 15 }}>{base.getHelp.charAt(0).toUpperCase() + base.getHelp.slice(1)}</p>
          <Link href="/help" style={{ color: "var(--teal)", fontWeight: 700 }}>
            Open Help →
          </Link>
        </section>

        <details className="sources">
          <summary>
            Checked on {base.checkedOn} · Sources
          </summary>
          <p>{base.sources}</p>
        </details>

        {/* The card ends with a plan, never a save button (FR3) */}
        <div className="sticky-action">
          <Link href={`/plan/${topic}`} className="btn-primary btn-block">
            Plan this talk
          </Link>
          <button className="btn-link" onClick={notNow} style={{ marginTop: 10 }}>
            Not now
          </button>
        </div>
      </div>
    </main>
  );
}
