// The Super Parent goal as a plant that grows (29 Oct 2026): like the Raise logo's sprout, one leaf for
// each topic the parent has had a talk about. Leaves still to grow are soft dashed outlines; at all six a
// small terracotta flower opens. It only ever grows: nothing is taken away for missed days.

const LEAVES = [
  // [x, y, angle]: alternating up the stem, bottom first
  [50, 92, 200],
  [50, 80, -20],
  [50, 66, 205],
  [50, 54, -25],
  [50, 40, 210],
  [50, 28, -30],
] as const;

export default function Sprout({ done, total = 6, size = 88, onDark = false }: { done: number; total?: number; size?: number; onDark?: boolean }) {
  const grown = Math.min(done, total);
  const stemTop = 110 - (16 + grown * 13);
  return (
    <svg viewBox="0 0 100 112" width={size} height={size * 1.12} role="img" aria-label={`A plant with ${grown} of ${total} leaves grown`}>
      {/* Soil */}
      <ellipse cx="50" cy="106" rx="30" ry="6" fill={onDark ? "rgba(255,255,255,0.18)" : "#e6cba9"} />
      {/* Stem grows with each leaf */}
      <path d={`M50 106 C 49 90 51 ${stemTop + 20} 50 ${Math.min(stemTop, 96)}`} stroke={onDark ? "#cfe3c6" : "#3f6b55"} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {LEAVES.slice(0, total).map(([x, y, angle], i) => {
        const on = i < grown;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
            <path
              d="M0 0 C 7 -9 22 -10 30 -1 C 22 7 8 7 0 0 Z"
              fill={on ? (i % 2 ? "#5f8a6e" : "#7ea886") : "none"}
              stroke={on ? "none" : onDark ? "rgba(255,255,255,0.55)" : "#8faa94"}
              strokeWidth="1.6"
              strokeDasharray={on ? undefined : "3 3"}
            />
            {on && <path d="M3 0 C 10 -3 18 -3 26 -1" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" fill="none" strokeLinecap="round" />}
          </g>
        );
      })}
      {/* All six: a small flower opens at the top */}
      {grown >= total && (
        <g transform="translate(50 16)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-6" rx="4.5" ry="7" fill="#e5b99d" transform={`rotate(${a})`} />
          ))}
          <circle r="4" fill="#d6ab6a" />
        </g>
      )}
    </svg>
  );
}
