// The Raise wordmark (29 Oct 2026): the dot of the "i" is a small sprout, two leaves (orange and green)
// growing out of the letter: something small that grows. The "i" is a dotless ı, so only the sprout shows.
// "animated" (the Welcome screen): the wordmark rises into place, the sprout grows up out of the "i",
// and the two leaves keep swaying slowly. Phones set to reduce motion show it still.
export default function Logo({ size = 64, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <div className={`logo${animated ? " logo-animated" : ""}`} style={{ fontSize: size }} role="img" aria-label="Raise">
      <span className="logo-word" aria-hidden="true">
        Ra
        <span className="logo-i">
          ı
          <svg className="logo-sprout" viewBox="0 0 60 44" aria-hidden="true">
            <path className="logo-stem" d="M30 44 C 30 34 30 28 31 22" stroke="#3f6b55" strokeWidth="5" strokeLinecap="round" fill="none" />
            {/* Orange leaf, left */}
            <path className="logo-leaf left" d="M30 24 C 20 26 8 20 6 6 C 20 4 30 12 30 24 Z" fill="#d9a066" />
            {/* Green leaf, right */}
            <path className="logo-leaf right" d="M31 22 C 34 10 44 2 58 4 C 56 18 44 26 31 22 Z" fill="#5f8a6e" />
          </svg>
        </span>
        se
      </span>
    </div>
  );
}
