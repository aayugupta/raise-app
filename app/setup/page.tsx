"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FamilySofa from "@/components/FamilySofa";
import { saveProfile, type Profile } from "@/lib/profile";
import { checkSetupText, HELP_LINES, type TextCheck } from "@/lib/safety";
import { topicName, type TopicId } from "@/lib/topics";

// Screen 2: Setup (D1, FR1). One question per screen, tap to answer, under a minute.
// Every question says why it is asked. No phone number, email or password.

type ChoiceKey = "role" | "ageBand" | "teenGender" | "language" | "comfort";
type Answers = Partial<Pick<Profile, ChoiceKey>>;

type Step =
  | { kind: "nickname"; question: string; why: string }
  | { kind: "choice"; key: ChoiceKey; question: string; why: string; options: { value: string; label: string }[] }
  | { kind: "wish"; question: string; why: string };

const STEPS: Step[] = [
  {
    kind: "nickname",
    question: "What should we call you?",
    why: "Only to greet you. No real name needed.",
  },
  {
    kind: "choice",
    key: "role",
    question: "You are your teen's…",
    why: "Mothers and fathers often find different first lines easier.",
    options: [
      { value: "mother", label: "Mother" },
      { value: "father", label: "Father" },
      { value: "guardian", label: "Other guardian" },
    ],
  },
  {
    kind: "choice",
    key: "ageBand",
    question: "How old is your teen?",
    why: "Younger teens get gentler openers that start with their friends.",
    options: [
      { value: "13-15", label: "13 to 15" },
      { value: "16-18", label: "16 to 18" },
    ],
  },
  {
    kind: "choice",
    key: "teenGender",
    question: "Your teen is…",
    why: "So the examples on your card fit your teen.",
    options: [
      { value: "girl", label: "A girl" },
      { value: "boy", label: "A boy" },
      { value: "unsaid", label: "Prefer not to say" },
    ],
  },
  {
    kind: "choice",
    key: "language",
    question: "Which language do you speak at home?",
    why: "Your first line will be written in this language.",
    options: [
      { value: "hinglish", label: "Hinglish (Hindi + English)" },
      { value: "hindi", label: "हिन्दी" },
      { value: "english", label: "English" },
    ],
  },
  {
    kind: "choice",
    key: "comfort",
    question: "How openly does your family talk about personal things?",
    why: "We'll match the wording to your family's comfort.",
    options: [
      { value: "gentle", label: "Gently, we're just starting" },
      { value: "open", label: "Quite openly" },
    ],
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
      ageBand: answers.ageBand ?? "16-18",
      teenGender: answers.teenGender ?? "unsaid",
      language: answers.language ?? "hinglish",
      comfort: answers.comfort ?? "gentle",
      wish: keptWish,
      suggestedTopic,
      createdAt: new Date().toISOString(),
    });
    router.push("/privacy");
  }

  function submitWish() {
    const result = checkSetupText(wish);
    if (result.kind === "ok") return finish(wish.trim(), result.suggestedTopic);
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
          <span style={{ fontSize: 14, color: "var(--muted)", minWidth: 36, textAlign: "right" }}>
            {stepIndex + 1}/{STEPS.length}
          </span>
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
