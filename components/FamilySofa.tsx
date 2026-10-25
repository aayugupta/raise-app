// Flat illustration: an Indian family on a sofa in warm lamp light.
// Both parents are turned towards the teen in the middle, listening.
export default function FamilySofa() {
  return (
    <svg
      viewBox="0 0 400 260"
      width="100%"
      height="100%"
      role="img"
      aria-label="A mother and father sitting on a sofa with their teen, listening"
      style={{ display: "block" }}
    >
      {/* Warm lamp glow */}
      <circle cx="350" cy="110" r="90" fill="#fff3d6" opacity="0.8" />
      <circle cx="350" cy="110" r="50" fill="#fff8e8" />

      {/* Plant, left */}
      <path d="M30 150 C 18 120 26 96 40 84 C 52 102 48 130 30 150 Z" fill="#4e8a5e" />
      <path d="M44 150 C 50 118 66 104 82 102 C 80 124 66 144 44 150 Z" fill="#0e716d" />
      <rect x="26" y="148" width="36" height="34" rx="6" fill="#e8735a" />

      {/* Lamp, right */}
      <rect x="348" y="122" width="4" height="110" fill="#1f2340" />
      <path d="M330 122 L338 92 L362 92 L370 122 Z" fill="#e7b04a" />
      <ellipse cx="350" cy="232" rx="16" ry="4" fill="#1f2340" />

      {/* Floor */}
      <rect x="0" y="236" width="400" height="24" fill="#f2c27a" />

      {/* Sofa */}
      <rect x="62" y="128" width="276" height="76" rx="24" fill="#8fb9a8" />
      <rect x="42" y="150" width="34" height="80" rx="15" fill="#7aa894" />
      <rect x="324" y="150" width="34" height="80" rx="15" fill="#7aa894" />
      <rect x="62" y="190" width="276" height="40" rx="12" fill="#7aa894" />
      <rect x="70" y="228" width="8" height="10" fill="#5d8a77" />
      <rect x="322" y="228" width="8" height="10" fill="#5d8a77" />

      {/* Mother (left): coral kurta, mustard dupatta, long hair */}
      <rect x="104" y="196" width="44" height="16" rx="8" fill="#f2b8a0" />
      <rect x="106" y="206" width="12" height="32" rx="6" fill="#f2b8a0" />
      <rect x="132" y="206" width="12" height="32" rx="6" fill="#f2b8a0" />
      <path d="M100 200 C 100 166 108 146 125 143 C 142 146 150 166 150 200 Z" fill="#e8735a" />
      <path d="M108 152 C 120 170 136 184 148 194" stroke="#e7b04a" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M146 162 C 156 170 164 174 172 174" stroke="#e8735a" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="174" cy="174" r="5" fill="#b97a5c" />
      <path d="M104 118 C 102 92 148 92 146 118 L148 150 C 140 144 110 144 102 150 Z" fill="#1f2340" />
      <circle cx="125" cy="118" r="18" fill="#b97a5c" />
      <path d="M107 112 C 110 96 140 96 143 112 C 134 104 116 104 107 112 Z" fill="#1f2340" />
      <circle cx="122" cy="118" r="1.9" fill="#1f2340" />
      <circle cx="133" cy="118" r="1.9" fill="#1f2340" />
      <path d="M122 126 Q 128 131 134 126" stroke="#1f2340" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Teen (middle): teal hoodie, short curly hair, hands clasped */}
      <rect x="180" y="198" width="40" height="15" rx="7" fill="#2e3a5c" />
      <rect x="182" y="206" width="12" height="32" rx="6" fill="#2e3a5c" />
      <rect x="206" y="206" width="12" height="32" rx="6" fill="#2e3a5c" />
      <path d="M176 202 C 176 172 184 154 200 151 C 216 154 224 172 224 202 Z" fill="#0e716d" />
      <path d="M188 158 C 192 168 208 168 212 158" stroke="#0b5e5a" strokeWidth="3" fill="none" />
      <circle cx="200" cy="190" r="7" fill="#a86e52" />
      <circle cx="200" cy="130" r="17" fill="#a86e52" />
      <circle cx="188" cy="117" r="7" fill="#2b2b3a" />
      <circle cx="197" cy="112" r="8" fill="#2b2b3a" />
      <circle cx="207" cy="113" r="7.5" fill="#2b2b3a" />
      <circle cx="214" cy="120" r="6" fill="#2b2b3a" />
      <circle cx="186" cy="125" r="5" fill="#2b2b3a" />
      <circle cx="195" cy="131" r="1.8" fill="#1f2340" />
      <circle cx="205" cy="131" r="1.8" fill="#1f2340" />
      <path d="M195 138 Q 200 142 205 138" stroke="#1f2340" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Father (right): mustard kurta, short hair, beard, open hands */}
      <rect x="252" y="196" width="46" height="16" rx="8" fill="#e9e1d3" />
      <rect x="254" y="206" width="12" height="32" rx="6" fill="#e9e1d3" />
      <rect x="282" y="206" width="12" height="32" rx="6" fill="#e9e1d3" />
      <path d="M250 200 C 250 166 258 146 275 143 C 292 146 300 166 300 200 Z" fill="#e7b04a" />
      <path d="M275 146 L275 176" stroke="#d29a35" strokeWidth="2" />
      <path d="M254 164 C 244 172 236 176 228 176" stroke="#e7b04a" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="226" cy="176" r="5" fill="#b07454" />
      <circle cx="275" cy="118" r="18" fill="#b07454" />
      <path d="M257 114 C 258 96 292 96 293 114 C 286 104 264 104 257 114 Z" fill="#1f2340" />
      <path d="M260 124 C 262 140 288 140 290 124 C 284 132 266 132 260 124 Z" fill="#3a3a4a" />
      <circle cx="268" cy="117" r="1.9" fill="#1f2340" />
      <circle cx="279" cy="117" r="1.9" fill="#1f2340" />
      <path d="M268 126 Q 273 130 278 126" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      {/* Coffee table with chai and a small plant */}
      <rect x="140" y="226" width="120" height="10" rx="5" fill="#b9845a" />
      <rect x="168" y="212" width="14" height="14" rx="3" fill="#fbf4ea" />
      <path d="M172 206 C 170 202 174 200 172 196" stroke="#fbf4ea" strokeWidth="1.5" fill="none" />
      <rect x="222" y="214" width="16" height="12" rx="3" fill="#e8735a" />
      <path d="M230 214 C 224 204 226 198 230 194 C 234 198 236 204 230 214 Z" fill="#4e8a5e" />
    </svg>
  );
}
