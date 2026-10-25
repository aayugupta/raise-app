// Flat illustration: a phone with a heart-shaped lock, among leaves.
// Says "what you do in Raise stays on your phone".
export default function PhoneLock() {
  return (
    <svg
      viewBox="0 0 400 200"
      width="100%"
      height="100%"
      role="img"
      aria-label="A phone with a lock, among leaves"
      style={{ display: "block" }}
    >
      <circle cx="200" cy="110" r="88" fill="#fff3d6" />

      {/* Leaves behind the phone */}
      <path d="M120 200 C 96 150 110 104 140 84 C 162 120 156 172 120 200 Z" fill="#4e8a5e" />
      <path d="M138 90 L124 194" stroke="#3e7350" strokeWidth="2" />
      <path d="M280 200 C 304 150 290 104 260 84 C 238 120 244 172 280 200 Z" fill="#0e716d" />
      <path d="M262 90 L276 194" stroke="#0b5e5a" strokeWidth="2" />
      <path d="M92 200 C 86 170 98 148 118 140 C 124 164 114 188 92 200 Z" fill="#e7b04a" />

      {/* Phone */}
      <rect x="158" y="30" width="84" height="160" rx="16" fill="#1f2340" />
      <rect x="166" y="44" width="68" height="132" rx="8" fill="#fbf4ea" />
      <rect x="188" y="35" width="24" height="4" rx="2" fill="#3a3f63" />

      {/* Heart lock on screen */}
      <path d="M186 92 C 186 74 214 74 214 92" stroke="#0e716d" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path
        d="M200 140 C 176 124 172 112 176 103 C 180 94 194 94 200 104 C 206 94 220 94 224 103 C 228 112 224 124 200 140 Z"
        fill="#e8735a"
      />
      <circle cx="200" cy="112" r="4" fill="#1f2340" />
      <rect x="198.5" y="113" width="3" height="10" rx="1.5" fill="#1f2340" />

      {/* Flowers in front */}
      <path d="M302 200 L304 150" stroke="#4e8a5e" strokeWidth="3" />
      <path d="M294 152 C 292 138 299 133 304 140 C 309 133 316 138 314 152 C 309 158 299 158 294 152 Z" fill="#e8735a" />
      <circle cx="104" cy="70" r="3" fill="#fff" />
      <circle cx="318" cy="60" r="3" fill="#fff" />
    </svg>
  );
}
