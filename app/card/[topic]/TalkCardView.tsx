"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { baseTalkCard, cardCacheKey, getBaseCard, SAFETY_PROMISE, type Language, type TalkCard } from "@/lib/cards";
import FlashArt, { type FlashArtKind } from "@/components/FlashArt";
import HelpPill from "@/components/HelpPill";
import type { Family } from "@/lib/cardPrompt";
import { track } from "@/lib/events";
import { loadProfile } from "@/lib/profile";
import { markLearned, startJourney } from "@/lib/journeyLog";
import { addOpenTopic } from "@/lib/talks";
import { TOPICS, type TopicId } from "@/lib/topics";

const REACTIONS: { key: "quiet" | "upset" | "disagree" | "noTalk"; label: string }[] = [
  { key: "quiet", label: "If they go quiet" },
  { key: "upset", label: "If they get upset" },
  { key: "disagree", label: "If they disagree" },
  { key: "noTalk", label: "If they don't want to talk" },
];

const LANGUAGE_NAMES: Record<Language, string> = { hinglish: "Hinglish", hindi: "हिन्दी", english: "English" };

// A short handwritten-style note on each flashcard, in the parent's language (Aayushi, 29 Oct 2026).
const NOTES: Record<Language, [string, string, string, string]> = {
  english: [
    "It's okay to feel nervous. Saying one line is already the hard part.",
    "Pick just one. Then let the quiet do the work.",
    "You won't get every word right. Kind and calm is enough.",
    "If it goes sideways, you can always try again tomorrow.",
  ],
  hinglish: [
    "Thoda nervous lagna normal hai. Ek line bol di, toh mushkil kaam ho gaya.",
    "Bas ek sawaal chuniye. Phir thoda chup rehkar suniye.",
    "Har shabd perfect nahi hoga. Pyaar aur shaanti kaafi hai.",
    "Agar baat bigad jaaye, toh kal phir koshish kar sakte hain.",
  ],
  hindi: [
    "थोड़ा घबराना ठीक है। एक लाइन बोल दी, तो मुश्किल काम हो गया।",
    "बस एक सवाल चुनिए। फिर थोड़ा चुप रहकर सुनिए।",
    "हर शब्द सही नहीं होगा। प्यार और शांति काफ़ी है।",
    "अगर बात बिगड़ जाए, तो कल फिर कोशिश कर सकते हैं।",
  ],
};

// "Don't say" lines end with a short reason in brackets: shown as a softer second line.
function splitReason(line: string): [string, string | null] {
  const m = line.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  return m ? [m[1], m[2]] : [line, null];
}

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

export default function TalkCardView({ topic }: { topic: TopicId }) {
  const router = useRouter();
  const base = getBaseCard(topic);
  const meta = TOPICS.find((t) => t.id === topic)!;
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [index, setIndex] = useState(0);
  const [allQuestions, setAllQuestions] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);

  // Opened from Home's carousel or the topic library: go back there.
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/home");
  }

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

    const key = cardCacheKey(topic, family, base.checkedOn);
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

  // Counted once the card is on screen: which topic, and whether the AI or the base card was shown.
  const shownSource = loaded?.source;
  // Opening a topic's flashcards starts its 14-day journey (Day 1), shown on Home.
  useEffect(() => {
    if (!shownSource) return;
    track("card_viewed", { topic, source: shownSource });
    startJourney(topic);
    markLearned(topic); // step 1 Learn done
    addOpenTopic(topic);
  }, [shownSource, topic]);

  if (!loaded) {
    return (
      <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={goBack} className="icon-btn" aria-label="Back">
              ←
            </button>
            <HelpPill />
          </div>
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
    track("topic_not_now", { topic });
    router.push("/home");
  }

  const langProps = { className: language === "hindi" ? "devanagari" : undefined, lang: language === "hindi" ? "hi" : language === "hinglish" ? "hi-Latn" : "en" };

  // The 4 flashcards (Aayushi's simplified flow, 28 Oct 2026). The safety promise sits on every one:
  // inline on card 1 as the assuring line, as a strip at the bottom of cards 2–4.
  const cards: { title: string; art: FlashArtKind; body: ReactNode }[] = [
    {
      // Card 1 in Aayushi's order (29 Oct 2026): why this topic matters, then the first line, then the assuring line.
      title: "How to begin",
      art: "begin",
      body: (
        <>
          <h3 className="flash-sub">Why this matters</h3>
          <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0 }}>{card.whyNow}</p>
          {base.whySource && <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>{base.whySource}</p>}

          <section className="first-line">
            <div className="card-label">
              Your first line · {LANGUAGE_NAMES[language]} · {source === "ai" ? "written for you" : "standard card"}
            </div>
            <p {...langProps}>{card.firstLine}</p>
            <div style={{ fontSize: 14, color: "var(--text)" }}>Try saying it out loud once, in your own voice.</div>
          </section>

          <div className="assuring-line">
            <span className="card-label">Then add, so they feel safe</span>
            <span>“{SAFETY_PROMISE}”</span>
          </div>
        </>
      ),
    },
    {
      title: "Gentle questions to ask",
      art: "questions",
      body: (
        <>
          <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "0 0 10px" }}>After your first line, pick one that feels natural. Then listen.</p>
          {/* 10 questions: 5 at first, so the cards stay a comfortable height */}
          <ol className="card-list flash-questions">
            {card.followUps.slice(0, allQuestions ? undefined : 5).map((q) => (
              <li key={q} {...langProps}>
                {q}
              </li>
            ))}
          </ol>
          {card.followUps.length > 5 && (
            <button className="btn-link" onClick={() => setAllQuestions(!allQuestions)} aria-expanded={allQuestions}>
              {allQuestions ? "Show fewer" : `Show ${card.followUps.length - 5} more questions`}
            </button>
          )}
        </>
      ),
    },
    {
      title: "What to say, what not to say",
      art: "say",
      body: (
        <>
          <h3 className="flash-sub" style={{ color: "var(--primary)" }}>
            ✓ Say
          </h3>
          <ul className="card-list">
            {card.say.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <h3 className="flash-sub" style={{ color: "var(--danger)" }}>
            ✕ Don't say
          </h3>
          <ul className="card-list">
            {card.avoid.map((x) => {
              const [line, reason] = splitReason(x);
              return (
                <li key={x}>
                  {line}
                  {reason && <span className="avoid-reason">{reason}</span>}
                </li>
              );
            })}
          </ul>
        </>
      ),
    },
    {
      title: "If your child reacts",
      art: "react",
      body: (
        <div style={{ display: "grid", gap: 8 }}>
          {REACTIONS.map((r) => (
            <div key={r.key} className="react-row">
              <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15 }}>{r.label}</div>
              <div style={{ fontStyle: "italic", marginTop: 2 }}>“{card.react[r.key]}”</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  function goTo(i: number) {
    const deck = deckRef.current;
    const target = deck?.children[i] as HTMLElement | undefined;
    if (deck && target) deck.scrollTo({ left: target.offsetLeft - deck.offsetLeft - 16, behavior: "smooth" });
  }

  function onDeckScroll() {
    const deck = deckRef.current;
    if (!deck) return;
    const first = deck.children[0] as HTMLElement;
    const step = first.offsetWidth + 12;
    setIndex(Math.min(cards.length - 1, Math.max(0, Math.round(deck.scrollLeft / step))));
  }

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={goBack} className="icon-btn" aria-label="Back">
            ←
          </button>
          <Link href="/help" className="help-pill">
            Help
          </Link>
        </div>

        {/* Topic, opened from the teen's side */}
        <div style={{ margin: "14px 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="topic-dot" style={{ background: meta.color, marginTop: 0 }} aria-hidden="true" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {meta.name}
          </span>
        </div>
        <h1 style={{ fontSize: 24, lineHeight: 1.2, textWrap: "balance" }}>“{base.teenQuestion}”</h1>

        {/* Flashcards: swipe sideways, or use the buttons below */}
        <div ref={deckRef} className="flash-deck" onScroll={onDeckScroll} role="region" aria-roledescription="carousel" aria-label="Flashcards">
          {cards.map((c, i) => (
            <section
              key={c.title}
              className="flashcard"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${cards.length}: ${c.title}`}
              style={{ borderTopColor: meta.color }}
            >
              <div className="flash-head">
                <div>
                  <div className="flash-count">
                    {i + 1} / {cards.length}
                  </div>
                  <h2 className="flash-title">{c.title}</h2>
                </div>
                <FlashArt kind={c.art} />
              </div>
              <div style={{ flex: 1 }}>{c.body}</div>
              {/* A handwritten-style note from Raise, in the parent's language */}
              <p className={`flash-note${language === "hindi" ? " devanagari" : ""}`} lang={language === "hindi" ? "hi" : language === "hinglish" ? "hi-Latn" : "en"}>
                {NOTES[language][i]}
              </p>
              {/* Fixed on every card, whatever the AI writes (card 1 has it inline as the assuring line) */}
              {i > 0 && (
                <div className="flash-promise">
                  <span className="card-label">Always say this</span>
                  <span>“{SAFETY_PROMISE}”</span>
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="flash-nav">
          <button className="icon-btn" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous card">
            ←
          </button>
          <div className="flash-dots" aria-hidden="true">
            {cards.map((c, i) => (
              <span key={c.title} className={i === index ? "on" : ""} />
            ))}
          </div>
          <button className="icon-btn" onClick={() => goTo(index + 1)} disabled={index === cards.length - 1} aria-label="Next card">
            →
          </button>
        </div>

        {/* Red, because these are the signs to get help (Aayushi, 28 Oct 2026). Calm words, no alarm. */}
        <section className="get-help" aria-label="When to get help">
          <div className="get-help-title">
            <span aria-hidden="true">🚩</span> When to get help
          </div>
          <p style={{ margin: "4px 0 10px", fontSize: 15 }}>{base.getHelp.charAt(0).toUpperCase() + base.getHelp.slice(1)}</p>
          <Link href="/help" className="get-help-button">
            Open Help →
          </Link>
        </section>

        <details className="sources">
          <summary>
            Checked on {base.checkedOn} · Sources
          </summary>
          <p>{base.sources}</p>
        </details>

        {/* Step 1 done: next is practising with the AI Coach (step 2), or skip to planning. Never a save button. */}
        <div className="sticky-action">
          <Link href={`/coach?topic=${topic}`} className="btn-primary btn-block">
            Next: practise with AI Coach
          </Link>
          <div className="card-next-links">
            <Link href={`/plan/${topic}?skipPractice=1`}>Skip, plan a moment</Link>
            <button className="btn-link" onClick={notNow}>
              Not now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
