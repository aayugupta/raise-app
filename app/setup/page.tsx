"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FamilySofa from "@/components/FamilySofa";
import HelpPill from "@/components/HelpPill";
import ConfidenceScale from "@/components/ConfidenceScale";
import { CONFIDENCE_QUESTION, recordConfidence } from "@/lib/confidence";
import { track } from "@/lib/events";
import { saveProfile, type Profile } from "@/lib/profile";
import { PROFILE_CHOICES, type ChoiceKey } from "@/lib/profileOptions";
import { checkSetupText, HELP_LINES, type TextCheck } from "@/lib/safety";
import { topicName, type TopicId } from "@/lib/topics";

// Screen 2: Setup (D1, FR1). One question per screen, tap to answer, under a minute.
// Every question says why it is asked. No phone number, email or password.

type Answers = Partial<Pick<Profile, ChoiceKey>>;

type Step =
  | { kind: "nickname"; question: string; why: string }
  | { kind: "choice"; key: ChoiceKey; question: string; why: string; options: { value: string; label: string }[] }
  | { kind: "confidence"; question: string; why: string }
  | { kind: "wish"; question: string; why: string };

const STEPS: Step[] = [
  {
    kind: "nickname",
    question: "What should we call you?",
    why: "Only to greet you. No real name needed.",
  },
  // Role, age band, gender, language, comfort: shared with Profile (lib/profileOptions.ts).
  ...PROFILE_CHOICES.map((c) => ({ kind: "choice" as const, key: c.key, question: c.question, why: c.why, options: c.options })),
  {
    kind: "confidence",
    question: CONFIDENCE_QUESTION,
    why: "There's no right answer. We'll ask again after your talks, so you can see how it changes.",
  },
  {
    kind: "wish",
    question: "Is there something you'd like to talk about with your teen?",
    why: "It helps us suggest where to start. It stays on your phone.",
  },
];

export default function Setup() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [nickname, setNickname] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [wish, setWish] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [check, setCheck] = useState<Exclude<TextCheck, { kind: "ok" }> | null>(null);

  const step = STEPS[stepIndex];

  function goBack() {
    if (check) return setCheck(null);
    if (stepIndex === 0) return router.push("/");
    setStepIndex(stepIndex - 1);
  }

  function choose(key: ChoiceKey, value: string) {
    setAnswers({ ...answers, [key]: value });
    setStepIndex(stepIndex + 1);
  }

  function finish(keptWish: string, suggestedTopic?: TopicId) {
    saveProfile({
      nickname: nickname.trim(),
      role: answers.role ?? "guardian",
      ageBand: answers.ageBand ?? "14-16",
      teenGender: answers.teenGender ?? "unsaid",
      language: answers.language ?? "hinglish",
      comfort: answers.comfort ?? "gentle",
      wish: keptWish,
      suggestedTopic,
      createdAt: new Date().toISOString(),
    });
    if (confidence) recordConfidence(confidence, "setup");
    // Tapped answers only: never the nickname or what the parent typed.
    track("setup_completed", {
      role: answers.role ?? "guardian",
      age_band: answers.ageBand ?? "14-16",
      language: answers.language ?? "hinglish",
      comfort: answers.comfort ?? "gentle",
    });
    router.push("/privacy");
  }

  function submitWish() {
    const result = checkSetupText(wish);
    if (result.kind === "ok") return finish(wish.trim(), result.suggestedTopic);
    if (result.kind === "crisis") track("help_shown", { from: "setup" });
    setCheck(result);
  }

  return (
    <main style={{ minHeight: "100dvh", background: "var(--cream)", display: "flex", flexDirection: "column" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px", flex: 1 }}>
        {/* Back and progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={goBack} className="icon-btn" aria-label="Back">
            ←
          </button>
          <div className="progress" aria-label={`Question ${stepIndex + 1} of ${STEPS.length}`}>
            <div style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
          </div>
          <span style={{ fontSize: 14, color: "var(--muted)", minWidth: 32, textAlign: "right" }}>
            {stepIndex + 1}/{STEPS.length}
          </span>
          <HelpPill />
        </div>

        <div className="illustration-panel">
          <FamilySofa />
        </div>

        {check ? (
          <CheckResult
            check={check}
            onUseTopic={(topic) => finish("", topic)}
            onContinue={() => finish("")}
            onEdit={() => setCheck(null)}
          />
        ) : (
          <>
            <h1 style={{ fontSize: 28, lineHeight: 1.15, textWrap: "balance" }}>{step.question}</h1>
            <p className="why">{step.why}</p>

            {step.kind === "nickname" && (
              <>
                <input
                  className="text-input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Mumma, Papa, Meera"
                  maxLength={20}
                  autoComplete="off"
                />
                <button className="btn-primary btn-block" onClick={() => setStepIndex(1)}>
                  {nickname.trim() ? "Continue" : "Skip"}
                </button>
              </>
            )}

            {step.kind === "choice" && (
              <div style={{ display: "grid", gap: 10 }}>
                {step.options.map((o) => (
                  <button
                    key={o.value}
                    className={`option${answers[step.key] === o.value ? " selected" : ""}`}
                    onClick={() => choose(step.key, o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}

            {step.kind === "confidence" && (
              <ConfidenceScale
                value={confidence}
                onChoose={(v) => {
                  setConfidence(v);
                  setStepIndex(stepIndex + 1);
                }}
              />
            )}

            {step.kind === "wish" && (
              <>
                <textarea
                  className="text-input"
                  value={wish}
                  onChange={(e) => setWish(e.target.value)}
                  placeholder="e.g. She has a crush and I don't know how to bring it up"
                  maxLength={200}
                  rows={3}
                />
                <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 16px" }}>
                  Please don't write names or private details.
                </p>
                <button className="btn-primary btn-block" onClick={submitWish}>
                  {wish.trim() ? "Continue" : "Skip, I'll pick a topic"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function CheckResult({
  check,
  onUseTopic,
  onContinue,
  onEdit,
}: {
  check: Exclude<TextCheck, { kind: "ok" }>;
  onUseTopic: (topic: TopicId) => void;
  onContinue: () => void;
  onEdit: () => void;
}) {
  if (check.kind === "crisis") {
    return (
      <div className="notice">
        <h2 style={{ fontSize: 24 }}>This sounds serious.</h2>
        <p>Would you like help from a professional? You don't have to handle this alone.</p>
        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0", display: "grid", gap: 8 }}>
          {HELP_LINES.map((h) => (
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
        <a href="/help" className="btn-primary btn-block" style={{ marginBottom: 10 }}>
          See what to do now
        </a>
        <button className="btn-secondary btn-block" onClick={onContinue}>
          Not now, continue setup
        </button>
      </div>
    );
  }

  return (
    <div className="notice">
      <p style={{ fontWeight: 700, marginTop: 0 }}>{check.message}</p>
      <p>{check.offerText}</p>
      <button className="btn-primary btn-block" onClick={() => onUseTopic(check.offer)}>
        Start with {topicName(check.offer)}
      </button>
      <button className="btn-link" onClick={onEdit}>
        Change what I wrote
      </button>
    </div>
  );
}
