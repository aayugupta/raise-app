// Confidence before → now as a simple gauge (Journey tab, 29 Oct 2026): a 1–5 track with a terracotta
// marker for the first rating and a sage marker for the latest one. Shows the change without any score.
export default function ConfidenceGauge({ before, now }: { before: number; now?: number }) {
  const pos = (v: number) => `${((v - 1) / 4) * 100}%`;
  const label = now === undefined ? `Confidence: ${before} out of 5 before your talks` : `Confidence: ${before} out of 5 before, ${now} out of 5 now`;
  return (
    <div className="gauge" role="img" aria-label={label}>
      <div className="gauge-track" aria-hidden="true">
        {now !== undefined && now !== before && (
          <span
            className="gauge-gap"
            style={{ left: pos(Math.min(before, now)), width: `${(Math.abs(now - before) / 4) * 100}%` }}
          />
        )}
        <span className="gauge-marker before" style={{ left: pos(before) }}>
          <span className="gauge-tag">Before · {before}</span>
        </span>
        {now !== undefined && (
          <span className="gauge-marker now" style={{ left: pos(now) }}>
            <span className="gauge-tag">Now · {now}</span>
          </span>
        )}
      </div>
      <div className="gauge-scale" aria-hidden="true">
        <span>1 · Not at all</span>
        <span>5 · Very</span>
      </div>
    </div>
  );
}
