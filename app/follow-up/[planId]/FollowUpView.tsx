"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Language } from "@/lib/cards";
import { NEXT_LINE, NEXT_TIP, SAID_MORE, topicChoices, type SaidMore } from "@/lib/followUp";
import { loadProfile } from "@/lib/profile";
import { loadReflections, updateReflection, type Reflection } from "@/lib/reflections";
import { TOPICS, type TopicId } from "@/lib/topics";

// Two quick questions built from the parent's own reflection, then a next line to try.
export default function FollowUpView({ planId }: { planId: string }) {
  const router = useRouter();
  const [reflection, setReflection] = useState<Reflection | null | undefined>(undefined);
  const [language, setLanguage] = useState<Language>("hinglish");
  const [picked, setPicked] = useState<TopicId | null>(null);
  const [saidMore, setSaidMore] = useState<SaidMore | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setReflection(loadReflections().find((r) => r.planId === planId) ?? null);
    const saved = loadProfile()?.language;
    if (saved) setLanguage(saved);
  }, [planId]);

  if (reflection === undefined) return <main style={{ minHeight: "100dvh", background: "var(--cream)" }} />;
  if (reflection === null || !reflection.followUpDue) {
    return (
      <main style={{ padding: "56px 24px", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: 28 }}>Nothing to check in on here</h1>
        <Link href="/home" className="btn-primary">
          Go to Home
        </Link>
      </main>
    );
  }

  const talkedOn = new Date(reflection.createdAt).toLocaleDateString("en-IN", { weekday: "long" });
  const topicName = (id: TopicId) => TOPICS.find((t) => t.id === id)!.name;

  function submit() {
    if (!picked || !saidMore) return;
    // Recorded quietly for the metric; never shown to the parent as right or wrong.
    updateReflection(planId, {
      followUpAt: new Date().toISOString(),
      followUpMatched: picked === reflection!.topic,
      followUpAnswer: saidMore,
    });
    setAnswered(true);
    window.scrollTo(0, 0);
  }

  const finalAnswer = saidMore ?? reflection.followUpAnswer;
  if ((answered || reflection.followUpAt) && finalAnswer) {
    return (
      <main style={{ minHeight: "100dvh", background: "var(--cream)" }}>
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "40px 16px 32px" }}>
          <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>Thank you.</h1>
          <p className="notice" style={{ marginTop: 14 }}>
            💡 {NEXT_TIP[finalAnswer]}
          </p>

          <section className="first-line">
            <div className="card-label">A next line to try</div>
            <p className={language === "hindi" ? "devanagari" : undefined} lang={language === "hindi" ? "hi" : language === "hinglish" ? "hi-Latn" : "en"}>
              “{NEXT_LINE[language]}”
            </p>
          </section>

          <Link href={`/plan/${reflection.topic}`} className="btn-primary btn-block" style={{ marginTop: 24 }}>
            Plan another talk
          </Link>
          <button className="btn-link" onClick={() => router.push("/home")}>
            Go to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.push("/home")} className="icon-btn" aria-label="Back">
            ←
          </button>
          <Link href="/help" className="help-pill">
            Help
          </Link>
        </div>

        <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: "18px 0 0" }}>A quick question</h1>
        <p className="why">Two taps. It helps the next talk build on the last one.</p>

        <h2 className="section-title" style={{ marginTop: 4 }}>
          What did you two talk about on {talkedOn}?
        </h2>
        <div style={{ display: "grid", gap: 8 }}>
          {topicChoices(reflection, TOPICS.map((t) => t.id)).map((id) => (
            <button key={id} className={`option${picked === id ? " selected" : ""}`} onClick={() => setPicked(id)}>
              {topicName(id)}
            </button>
          ))}
        </div>

        {/* Shown only after the recall answer, so the note can't give it away. */}
        {picked && (
          <>
            {reflection.learned && (
              <>
                <h2 className="section-title">You noted</h2>
                <p className="notice" style={{ margin: 0, fontStyle: "italic" }}>
                  “{reflection.learned}”
                </p>
              </>
            )}
            <h2 className="section-title">Has your teen said more about it since?</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {SAID_MORE.map((s) => (
                <button key={s.value} className={`option${saidMore === s.value ? " selected" : ""}`} onClick={() => setSaidMore(s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="sticky-action">
          <button className="btn-primary btn-block" onClick={submit} disabled={!picked || !saidMore}>
            Done
          </button>
        </div>
      </div>
    </main>
  );
}
