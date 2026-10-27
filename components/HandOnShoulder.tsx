// Flat illustration: a parent with a hand on the teen's shoulder, both smiling.
// Used for recovery: after a missed or hard talk, you try again together.
export default function HandOnShoulder() {
  return (
    <svg
      viewBox="0 0 400 220"
      width="100%"
      height="100%"
      role="img"
      aria-label="A parent with a hand on their teen's shoulder, both smiling"
      style={{ display: "block" }}
    >
      {/* Soft window light */}
      <rect x="250" y="20" width="110" height="120" rx="10" fill="#fff6e6" />
      <path d="M305 20 L305 140 M250 80 L360 80" stroke="#f2c27a" strokeWidth="5" />
      <circle cx="120" cy="80" r="60" fill="#fff3d6" opacity="0.8" />

      {/* Plant */}
      <path d="M40 200 C 24 160 34 128 56 112 C 72 140 66 178 40 200 Z" fill="#4e8a5e" />
      <path d="M58 202 C 66 168 84 152 104 150 C 100 176 84 196 58 202 Z" fill="#0e716d" />
      <rect x="36" y="196" width="40" height="24" rx="6" fill="#e8735a" />

      {/* Floor */}
      <rect x="0" y="206" width="400" height="14" fill="#f2c27a" />

      {/* Teen (right), teal hoodie, smiling, slightly turned */}
      <path d="M210 210 C 210 160 220 132 244 128 C 268 132 278 160 278 210 Z" fill="#0e716d" />
      <path d="M228 136 C 232 148 256 148 260 136" stroke="#0b5e5a" strokeWidth="3" fill="none" />
      <rect x="238" y="112" width="12" height="14" rx="4" fill="#a86e52" />
      <circle cx="244" cy="96" r="20" fill="#a86e52" />
      <path d="M224 94 C 222 70 266 70 264 94 C 256 82 232 82 224 94 Z" fill="#2b2b3a" />
      <circle cx="237" cy="97" r="2" fill="#1f2340" />
      <circle cx="249" cy="97" r="2" fill="#1f2340" />
      <path d="M236 105 Q 243 112 250 105" stroke="#1f2340" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Parent (left), coral kurta, mustard dupatta, arm across to the teen's shoulder */}
      <path d="M128 210 C 128 150 140 120 168 116 C 196 120 206 150 206 210 Z" fill="#e8735a" />
      <path d="M144 126 C 160 152 182 174 202 192" stroke="#e7b04a" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M196 140 C 210 134 220 132 230 136" stroke="#e8735a" strokeWidth="12" strokeLinecap="round" fill="none" />
      <ellipse cx="234" cy="137" rx="8" ry="6" fill="#b97a5c" />
      <rect x="162" y="100" width="12" height="16" rx="4" fill="#b97a5c" />
      <path d="M144 86 C 140 54 196 54 192 86 L196 128 C 184 118 152 118 140 128 Z" fill="#1f2340" />
      <circle cx="168" cy="84" r="22" fill="#b97a5c" />
      <path d="M146 78 C 150 58 186 58 190 78 C 178 68 158 68 146 78 Z" fill="#1f2340" />
      <circle cx="166" cy="85" r="2" fill="#1f2340" />
      <circle cx="178" cy="85" r="2" fill="#1f2340" />
      <path d="M164 94 Q 172 101 180 94" stroke="#1f2340" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Small hearts */}
      <path d="M206 58 C 202 52 194 56 198 62 L206 70 L214 62 C 218 56 210 52 206 58 Z" fill="#e8735a" />
      <circle cx="320" cy="170" r="3" fill="#fff" />
    </svg>
  );
}
