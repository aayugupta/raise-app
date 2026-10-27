"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FamilySofa from "@/components/FamilySofa";
import HelpPill from "@/components/HelpPill";
import ConfidenceScale from "@/components/ConfidenceScale";
import { CONFIDENCE_QUESTION, recordConfidence } from "@/lib/confidence";
import { track } from "@/lib/events";
import { saveProfile, type Profile } from "@/lib/profile";
import { PROFILE_CHOICES } from "@/lib/profileOptions";
import { addOpenTopic } from "@/lib/talks";
import { TOPICS, type TopicId } from "@/lib/topics";

// Screens 2–4 of Aayushi's simplified flow (28 Oct 2026, FR1): about you, about your teen,
// confidence + first topic. All taps, no typing, no phone number, email or password.
// Language and "how openly you talk" are no longer asked: Hinglish and gentle by default, changeable in Profile.

const ROLE = PROFILE_CHOICES.find((c) => c.key === "role")!;
const AGE = PROFILE_CHOICES.find((c) => c.key === "ageBand")!;
const GENDER = PROFILE_CHOICES.find((c) => c.key === "teenGender")!;
const STEPS = 3;

export default function Setup() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Profile["role"] | null>(null);
  const [ageBand, setAgeBand] = useState<Profile["ageBand"] | null>(null);
  const [teenGender, setTeenGender] = useState<Profile["teenGender"] | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [topic, setTopic] = useState<TopicId | null>(null);

  function goBack() {
    if (step === 0) return router.push("/");
    setStep(step - 1);
  }

  function finish(firstTopic: TopicId | null) {
    const profile: Profile = {
      nickname: "",
      role: role ?? "guardian",
      ageBand: ageBand ?? "15-16",
      teenGender: teenGender ?? "unsaid",
      language: "hinglish",
      comfort: "gentle",
      wish: "",
      suggestedTopic: firstTopic ?? undefined,
      createdAt: new Date().toISOString(),
    };
    saveProfile(profile);
    if (confidence) recordConfidence(confidence, "setup");
    // The chosen topic shows on Home under "Continue your journey" (step 1, Prepare).
    if (firstTopic) addOpenTopic(firstTopic);
    // Tapped answers only.
    track("setup_completed", { role: profile.role, age_band: profile.ageBand, language: profile.language, comfort: profile.comfort });
    router.push("/home");
  }

  return (
    <main style={{ minHeight: "100dvh", background: "var(--cream)", display: "flex", flexDirection: "column" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px", flex: 1 }}>
        {/* Back and progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={goBack} className="icon-btn" aria-label="Back">
            ←
          </button>
          <div className="progress" aria-label={`Step ${step + 1} of ${STEPS}`}>
            <div style={{ width: `${((step + 1) / STEPS) * 100}%` }} />
          </div>
          <span style={{ fontSize: 14, color: "var(--muted)", minWidth: 32, textAlign: "right" }}>
            {step + 1}/{STEPS}
          </span>
          <HelpPill />
        </div>

        {/* Screen 2: About you */}
        {step === 0 && (
          <>
            <div className="illustration-panel">
              <FamilySofa />
            </div>
            <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>Hey there!</h1>
            <p className="why">You're not just a username. We want to get to know you!</p>
            <h2 className="setup-question">You are your child's…</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {ROLE.options.map((o) => (
                <button
                  key={o.value}
                  className={`option${role === o.value ? " selected" : ""}`}
                  onClick={() => {
                    setRole(o.value as Profile["role"]);
                    setStep(1);
                  }}
                >
                  {o.value === "guardian" ? "Guardian" : o.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Screen 3: About your teen */}
        {step === 1 && (
          <>
            <h1 style={{ fontSize: 28, lineHeight: 1.15, marginTop: 24 }}>About your child</h1>
            <p className="why">So every first line fits your child's age. Your answers stay on this phone.</p>

            <h2 className="setup-question">Child's age</h2>
            <div className="option-row" role="radiogroup" aria-label="Child's age">
              {AGE.options.map((o) => (
                <button
                  key={o.value}
                  role="radio"
                  aria-checked={ageBand === o.value}
                  className={`option${ageBand === o.value ? " selected" : ""}`}
                  onClick={() => setAgeBand(o.value as Profile["ageBand"])}
                >
                  {o.label.replace(" to ", "–")}
                </button>
              ))}
            </div>

            <h2 className="setup-question">Your child is</h2>
            <div className="option-row" role="radiogroup" aria-label="Your child is">
              {GENDER.options.map((o) => (
                <button
                  key={o.value}
                  role="radio"
                  aria-checked={teenGender === o.value}
                  className={`option${teenGender === o.value ? " selected" : ""}`}
                  onClick={() => setTeenGender(o.value as Profile["teenGender"])}
                >
                  {{ girl: "Girl", boy: "Boy" }[o.value] ?? o.label}
                </button>
              ))}
            </div>

            <button className="btn-primary btn-block" style={{ marginTop: 24 }} disabled={!ageBand || !teenGender} onClick={() => setStep(2)}>
              Next
            </button>
          </>
        )}

        {/* Screen 4: Confidence + first topic */}
        {step === 2 && (
          <>
            <h1 style={{ fontSize: 26, lineHeight: 1.2, marginTop: 24, textWrap: "balance" }}>{CONFIDENCE_QUESTION}</h1>
            <p className="why">There's no right answer. We'll ask again after your talks, so you can see how it changes.</p>
            <ConfidenceScale value={confidence} onChoose={setConfidence} />

            <h2 className="setup-question">Which topic would you like to talk about with your child?</h2>
            <div className="topic-pick">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  className={`option${topic === t.id ? " selected" : ""}`}
                  aria-pressed={topic === t.id}
                  onClick={() => setTopic(topic === t.id ? null : t.id)}
                >
                  <span aria-hidden="true">{t.icon}</span> {t.short}
                </button>
              ))}
            </div>

            <button className="btn-primary btn-block" style={{ marginTop: 20 }} disabled={!confidence || !topic} onClick={() => finish(topic)}>
              Continue
            </button>
            <button className="btn-link" disabled={!confidence} onClick={() => finish(null)}>
              Skip, I'll choose later
            </button>
            {!confidence && (
              <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", margin: "4px 0 0" }}>Pick a number from 1 to 5 first.</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
