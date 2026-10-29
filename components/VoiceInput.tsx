"use client";

import { useEffect, useRef, useState } from "react";

// Speak instead of type, in the AI Coach (Aayushi, 29 Oct 2026). Uses the phone's own speech-to-text
// (Google on Android, Apple on iPhone): Raise never records or stores the voice. Words appear in the
// message box as the parent speaks; they check, edit and send themselves. The first time, a short note
// explains where the voice goes. Hidden on browsers without speech support.

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

const NOTE_KEY = "raise.voiceNoteSeen";

export default function VoiceInput({
  language,
  draft,
  onDraft,
  disabled,
  maxLength,
}: {
  language: "english" | "hindi" | "hinglish";
  draft: string;
  onDraft: (text: string) => void;
  disabled?: boolean;
  maxLength: number;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef<Recognition | null>(null);
  const baseRef = useRef("");

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => recRef.current?.stop();
  }, []);

  if (!supported) return null;

  function start() {
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    // English (India) also understands Hinglish spoken the Latin way; Hindi gives Devanagari.
    rec.lang = language === "hindi" ? "hi-IN" : "en-IN";
    rec.interimResults = true;
    rec.continuous = true;
    baseRef.current = draft ? draft.replace(/\s*$/, " ") : "";
    rec.onresult = (e) => {
      let heard = "";
      for (let i = 0; i < e.results.length; i++) heard += e.results[i][0].transcript;
      onDraft((baseRef.current + heard).slice(0, maxLength));
    };
    rec.onerror = (e) => {
      setError(
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "Microphone access is blocked. You can allow it in your browser's settings, or type instead."
          : e.error === "no-speech"
            ? "Didn't catch that. Tap the mic and try again."
            : "Voice isn't working right now. Please type instead."
      );
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setError("");
    rec.start();
    setListening(true);
  }

  function onMic() {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    let seen = false;
    try {
      seen = localStorage.getItem(NOTE_KEY) === "1";
    } catch {}
    if (!seen) return setShowNote(true);
    start();
  }

  function acceptNote() {
    try {
      localStorage.setItem(NOTE_KEY, "1");
    } catch {}
    setShowNote(false);
    start();
  }

  return (
    <>
      <button
        type="button"
        className={`voice-btn${listening ? " listening" : ""}`}
        onClick={onMic}
        disabled={disabled}
        aria-label={listening ? "Stop listening" : "Speak instead of typing"}
        aria-pressed={listening}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
      </button>

      {(showNote || listening || error) && (
        <div className="voice-panel" role="status">
          {showNote ? (
            <>
              <p style={{ margin: "0 0 10px" }}>
                🎙️ Your voice goes to your phone&apos;s speech service (Google or Apple) to turn it into text. Raise never records or
                stores it. You can check the words before sending.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" className="btn-link" style={{ margin: 0, width: "auto" }} onClick={() => setShowNote(false)}>
                  Not now
                </button>
                <button type="button" className="voice-ok" onClick={acceptNote}>
                  Got it, start
                </button>
              </div>
            </>
          ) : listening ? (
            <span>
              <span className="voice-dot" aria-hidden="true" /> Listening… speak, then tap the mic to stop.
            </span>
          ) : (
            <span>{error}</span>
          )}
        </div>
      )}
    </>
  );
}
