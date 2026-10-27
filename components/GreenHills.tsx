// Soft rolling green hills with a warm glow (Welcome screen, brainstorm screen 1).
export default function GreenHills() {
  return (
    <svg viewBox="0 0 400 220" width="100%" preserveAspectRatio="xMidYMax slice" aria-hidden="true" style={{ display: "block" }}>
      <defs>
        <linearGradient id="hills-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf4ea" stopOpacity="0" />
          <stop offset="1" stopColor="#eef6e9" />
        </linearGradient>
        <radialGradient id="hills-glow" cx="0.7" cy="0.35" r="0.45">
          <stop offset="0" stopColor="#fff3d6" />
          <stop offset="1" stopColor="#fff3d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" fill="url(#hills-sky)" />
      <rect width="400" height="220" fill="url(#hills-glow)" />

      {/* Back hills */}
      <path d="M0 120 C 60 80 120 78 180 104 C 240 128 300 70 400 92 L400 220 L0 220 Z" fill="#d6ead8" />
      {/* Middle hills */}
      <path d="M0 150 C 70 112 150 118 210 140 C 270 162 330 118 400 128 L400 220 L0 220 Z" fill="#b2d6bb" />
      {/* Small trees on the middle hill */}
      <ellipse cx="300" cy="128" rx="8" ry="12" fill="#7fb99a" />
      <rect x="299" y="136" width="2" height="8" fill="#5d8a77" />
      <ellipse cx="318" cy="124" rx="6" ry="9" fill="#8fc4a5" />
      <rect x="317" y="130" width="2" height="7" fill="#5d8a77" />
      <ellipse cx="80" cy="132" rx="7" ry="10" fill="#7fb99a" />
      <rect x="79" y="139" width="2" height="7" fill="#5d8a77" />
      {/* Front hill */}
      <path d="M0 182 C 90 150 170 156 240 176 C 300 192 350 170 400 168 L400 220 L0 220 Z" fill="#8cc29f" />
      {/* A path winding over the front hill */}
      <path d="M150 220 C 170 200 200 186 230 178" stroke="#eef6e9" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
    </svg>
  );
}
