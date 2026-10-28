// "Why this matters" as a picture (29 Oct 2026). Reads the first real number in the hand-written base card's
// "why now" (never the AI's wording, so the picture can't drift from the research):
//   "10 of 12 …" → 12 small figures with 10 filled in   ·   "81% …" → a ring filled to 81%.
// If no number is found, nothing is drawn.

function Person({ x, filled, color }: { x: number; filled: boolean; color: string }) {
  const fill = filled ? color : "var(--border-sage)";
  return (
    <g transform={`translate(${x} 0)`}>
      <circle cx="8" cy="6" r="5" fill={fill} />
      <path d="M1 26c0-6 3.2-11 7-11s7 5 7 11Z" fill={fill} />
    </g>
  );
}

export default function StatGraphic({ text, color }: { text: string; color: string }) {
  const ofMatch = text.match(/(\d+)\s+of\s+(\d+)/);
  const pctMatch = text.match(/(\d+)%/);
  const ofFirst = ofMatch && (!pctMatch || (ofMatch.index ?? 0) < (pctMatch.index ?? 0));

  if (ofMatch && ofFirst) {
    const part = Number(ofMatch[1]);
    const whole = Number(ofMatch[2]);
    if (!whole || whole > 24 || part > whole) return null;
    return (
      <div className="stat-graphic" role="img" aria-label={`${part} of ${whole}`}>
        <svg viewBox={`0 0 ${whole * 18} 26`} width="100%" style={{ maxWidth: whole * 18 }} aria-hidden="true">
          {Array.from({ length: whole }, (_, i) => (
            <Person key={i} x={i * 18} filled={i < part} color={color} />
          ))}
        </svg>
        <div className="stat-number" style={{ color }}>
          {part} <span>of {whole}</span>
        </div>
      </div>
    );
  }

  if (pctMatch) {
    const pct = Math.min(100, Number(pctMatch[1]));
    const r = 26;
    const c = 2 * Math.PI * r;
    return (
      <div className="stat-graphic ring" role="img" aria-label={`${pct}%`}>
        <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border-sage)" strokeWidth="8" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(c * pct) / 100} ${c}`}
            transform="rotate(-90 32 32)"
          />
        </svg>
        <div className="stat-number" style={{ color }}>
          {pct}%
        </div>
      </div>
    );
  }
  return null;
}
