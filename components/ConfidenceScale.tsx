"use client";

import { CONFIDENCE_SCALE } from "@/lib/confidence";

// 1–5 confidence answer, used in Setup, Reflection and Progress.
export default function ConfidenceScale({ value, onChoose }: { value: number | null; onChoose: (value: number) => void }) {
  return (
    <div className="confidence-scale" role="radiogroup" aria-label="Confidence from 1 to 5">
      {CONFIDENCE_SCALE.map((c) => (
        <button
          key={c.value}
          role="radio"
          aria-checked={value === c.value}
          aria-label={`${c.value}, ${c.label}`}
          className={`confidence-step${value === c.value ? " selected" : ""}`}
          onClick={() => onChoose(c.value)}
        >
          <span className="confidence-number">{c.value}</span>
          <span className="confidence-label">{c.label}</span>
        </button>
      ))}
    </div>
  );
}
