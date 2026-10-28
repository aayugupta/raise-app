// The Raise wordmark with a small sprout above it (from Aayushi's brainstorm, screen 1).
// The sprout is two leaves, orange and green: something small that grows.
export default function Logo({ size = 64 }: { size?: number }) {
  return (
    <div className="logo" style={{ fontSize: size }} role="img" aria-label="Raise">
      <svg className="logo-sprout" viewBox="0 0 60 44" width={size * 0.62} height={size * 0.46} aria-hidden="true">
        <path d="M30 44 C 30 34 30 28 31 22" stroke="#3f6b55" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Orange leaf, left */}
        <path d="M30 24 C 20 26 8 20 6 6 C 20 4 30 12 30 24 Z" fill="#d9a066" />
        {/* Green leaf, right */}
        <path d="M31 22 C 34 10 44 2 58 4 C 56 18 44 26 31 22 Z" fill="#5f8a6e" />
      </svg>
      <span className="logo-word" aria-hidden="true">
        Raise
      </span>
    </div>
  );
}
