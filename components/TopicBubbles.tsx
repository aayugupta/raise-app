// Flat illustration: a parent and teen sitting together on floor cushions,
// with thought bubbles holding a heart, a cloud and two friends.
export default function TopicBubbles() {
  return (
    <svg
      viewBox="0 0 400 220"
      width="100%"
      height="100%"
      role="img"
      aria-label="A parent and teen sitting together, with thought bubbles above them"
      style={{ display: "block" }}
    >
      {/* Leaves at the sides */}
      <path d="M20 220 C 4 176 18 132 46 112 C 66 148 58 196 20 220 Z" fill="#4e8a5e" />
      <path d="M44 118 L26 214" stroke="#3e7350" strokeWidth="2" />
      <path d="M380 220 C 396 176 382 132 354 112 C 334 148 342 196 380 220 Z" fill="#0e716d" />
      <path d="M356 118 L374 214" stroke="#0b5e5a" strokeWidth="2" />

      {/* Thought bubbles */}
      <circle cx="150" cy="98" r="4" fill="#fff" />
      <circle cx="160" cy="84" r="6" fill="#fff" />
      <ellipse cx="130" cy="50" rx="44" ry="32" fill="#fff" />
      <path d="M130 64 C 112 52 110 40 118 35 C 124 31 129 35 130 40 C 131 35 136 31 142 35 C 150 40 148 52 130 64 Z" fill="#e8735a" />

      <circle cx="252" cy="100" r="4" fill="#fff" />
      <circle cx="244" cy="86" r="6" fill="#fff" />
      <ellipse cx="270" cy="50" rx="46" ry="32" fill="#fff" />
      <circle cx="256" cy="52" r="9" fill="#0e716d" />
      <path d="M244 72 C 244 62 268 62 268 72 Z" fill="#0e716d" />
      <circle cx="284" cy="52" r="9" fill="#e7b04a" />
      <path d="M272 72 C 272 62 296 62 296 72 Z" fill="#e7b04a" />

      <ellipse cx="200" cy="34" rx="30" ry="22" fill="#fff" />
      <path d="M186 40 C 180 40 180 30 188 30 C 188 22 202 20 205 28 C 212 24 220 32 214 40 Z" fill="#8fb9a8" />

      {/* Floor and cushions */}
      <rect x="0" y="200" width="400" height="20" fill="#f2c27a" />
      <ellipse cx="160" cy="200" rx="46" ry="10" fill="#e7b04a" />
      <ellipse cx="244" cy="200" rx="42" ry="10" fill="#8fb9a8" />

      {/* Parent (left), cross-legged, holding a cup of chai */}
      <path d="M118 198 C 124 184 196 184 202 198 Z" fill="#1f2340" />
      <path d="M136 192 C 136 160 144 142 160 139 C 176 142 184 160 184 192 Z" fill="#e8735a" />
      <path d="M144 150 C 154 168 168 180 182 188" stroke="#e7b04a" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M178 158 C 186 166 192 170 198 170" stroke="#e8735a" strokeWidth="8" strokeLinecap="round" fill="none" />
      <rect x="194" y="160" width="12" height="13" rx="3" fill="#fbf4ea" />
      <path d="M140 114 C 138 92 182 92 180 114 L182 146 C 174 140 146 140 138 146 Z" fill="#1f2340" />
      <circle cx="160" cy="116" r="17" fill="#b97a5c" />
      <path d="M143 110 C 146 95 174 95 177 110 C 168 102 152 102 143 110 Z" fill="#1f2340" />
      <circle cx="157" cy="116" r="1.8" fill="#1f2340" />
      <circle cx="167" cy="116" r="1.8" fill="#1f2340" />
      <path d="M157 123 Q 163 128 169 123" stroke="#1f2340" strokeWidth="1.7" strokeLinecap="round" fill="none" />

      {/* Teen (right), cross-legged, leaning in */}
      <path d="M206 198 C 212 186 278 186 284 198 Z" fill="#2e3a5c" />
      <path d="M222 194 C 222 166 230 150 245 147 C 260 150 268 166 268 194 Z" fill="#0e716d" />
      <path d="M233 154 C 237 163 253 163 257 154" stroke="#0b5e5a" strokeWidth="3" fill="none" />
      <path d="M226 170 C 220 178 216 182 212 182" stroke="#0e716d" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="245" cy="127" r="16" fill="#a86e52" />
      <path d="M229 124 C 228 104 262 104 261 124 L262 140 C 258 132 232 132 228 140 Z" fill="#2b2b3a" />
      <path d="M230 120 C 234 108 256 108 260 120 C 250 114 240 114 230 120 Z" fill="#2b2b3a" />
      <circle cx="240" cy="128" r="1.8" fill="#1f2340" />
      <circle cx="250" cy="128" r="1.8" fill="#1f2340" />
      <path d="M240 135 Q 245 139 250 135" stroke="#1f2340" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    </svg>
  );
}
