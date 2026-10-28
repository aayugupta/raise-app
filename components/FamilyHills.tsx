// Welcome screen (simplified flow, screen 1): a mother, father, daughter and son standing
// together on soft green hills, seen from behind, looking out at a bright morning.
export default function FamilyHills() {
  return (
    <svg
      viewBox="0 0 400 220"
      width="100%"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="A mother, father, daughter and son standing together on a green hill"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="fh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf4ea" stopOpacity="0" />
          <stop offset="1" stopColor="#eef2e8" />
        </linearGradient>
        <radialGradient id="fh-glow" cx="0.75" cy="0.3" r="0.45">
          <stop offset="0" stopColor="#fbf1e4" />
          <stop offset="1" stopColor="#fbf1e4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" fill="url(#fh-sky)" />
      <rect width="400" height="220" fill="url(#fh-glow)" />
      <circle cx="320" cy="62" r="18" fill="#fde4a8" />

      {/* Back and middle hills */}
      <path d="M0 120 C 60 80 120 78 180 104 C 240 128 300 70 400 92 L400 220 L0 220 Z" fill="#dce6d3" />
      <path d="M0 150 C 70 112 150 118 210 140 C 270 162 330 118 400 128 L400 220 L0 220 Z" fill="#c3d5b9" />
      <ellipse cx="330" cy="128" rx="8" ry="12" fill="#8fae8c" />
      <rect x="329" y="136" width="2" height="8" fill="#5f7d68" />
      <ellipse cx="348" cy="124" rx="6" ry="9" fill="#9cb89a" />
      <rect x="347" y="130" width="2" height="7" fill="#5f7d68" />
      <ellipse cx="60" cy="134" rx="7" ry="10" fill="#8fae8c" />
      <rect x="59" y="141" width="2" height="7" fill="#5f7d68" />

      {/* Front hill, flat where the family stands */}
      <path d="M0 180 C 90 164 170 168 240 172 C 300 176 350 168 400 166 L400 220 L0 220 Z" fill="#a9c3a1" />

      {/* Shadows */}
      <ellipse cx="151" cy="177" rx="18" ry="3.5" fill="#1f4d3a" opacity="0.18" />
      <ellipse cx="186" cy="177" rx="17" ry="3.5" fill="#1f4d3a" opacity="0.18" />
      <ellipse cx="222" cy="177" rx="15" ry="3" fill="#1f4d3a" opacity="0.18" />
      <ellipse cx="257" cy="177" rx="16" ry="3" fill="#1f4d3a" opacity="0.18" />

      {/* Father: mustard kurta, arm towards the mother */}
      <rect x="142" y="146" width="7" height="31" rx="3.5" fill="#3b4a52" />
      <rect x="152" y="146" width="7" height="31" rx="3.5" fill="#3b4a52" />
      <rect x="146" y="94" width="9" height="10" rx="3" fill="#b9785a" />
      <path d="M134 154 C 134 118 138 104 150.5 101 C 163 104 167 118 167 154 Z" fill="#d6ab6a" />
      <path d="M150.5 102 L150.5 154" stroke="#c0955c" strokeWidth="1.5" />
      <path d="M137 112 C 134 126 134 136 136 146" stroke="#d6ab6a" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M164 112 C 168 120 172 128 176 132" stroke="#d6ab6a" strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="150.5" cy="86" r="11" fill="#292d2a" />

      {/* Mother: coral kurta with dupatta, long braid */}
      <rect x="181" y="164" width="6" height="13" rx="3" fill="#c98a6a" />
      <rect x="189" y="164" width="6" height="13" rx="3" fill="#c98a6a" />
      <rect x="182" y="101" width="8" height="9" rx="3" fill="#c98a6a" />
      <path d="M171 168 C 171 132 174 112 186 108 C 198 112 201 132 201 168 Z" fill="#d39474" />
      <path d="M177 112 C 184 132 190 150 197 166" stroke="#e8c07a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M198 118 C 204 124 208 128 213 130" stroke="#d39474" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="186" cy="94" r="10" fill="#292d2a" />
      <path d="M186 100 L186 130" stroke="#292d2a" strokeWidth="5" strokeLinecap="round" />

      {/* Daughter: green top, ponytail */}
      <rect x="215" y="150" width="6" height="27" rx="3" fill="#3b4a52" />
      <rect x="224" y="150" width="6" height="27" rx="3" fill="#3b4a52" />
      <rect x="219" y="111" width="7" height="8" rx="3" fill="#c98a6a" />
      <path d="M208 156 C 208 130 211 120 222.5 117 C 234 120 237 130 237 156 Z" fill="#5f8a6e" />
      <path d="M234 126 C 240 132 243 136 247 138" stroke="#5f8a6e" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="222.5" cy="104" r="9" fill="#2b2b3a" />
      <path d="M223 100 C 232 104 232 116 228 124" stroke="#2b2b3a" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* Son: teal hoodie */}
      <rect x="249" y="148" width="7" height="29" rx="3.5" fill="#292d2a" />
      <rect x="258" y="148" width="7" height="29" rx="3.5" fill="#292d2a" />
      <path d="M241 154 C 241 126 245 115 256.5 112 C 268 115 272 126 272 154 Z" fill="#285c4d" />
      <path d="M247 120 C 249 110 264 110 266 120 C 260 125 253 125 247 120 Z" fill="#1f4a3e" />
      <path d="M269 124 C 272 136 272 144 270 150" stroke="#285c4d" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="256.5" cy="102" r="10" fill="#292d2a" />

      {/* Flowers in the grass */}
      <circle cx="96" cy="190" r="3" fill="#e8c07a" />
      <circle cx="104" cy="196" r="2.5" fill="#fff" />
      <circle cx="312" cy="188" r="3" fill="#e2a98c" />
      <circle cx="322" cy="194" r="2.5" fill="#e8c07a" />
      {/* A path leading forward */}
      <path d="M190 220 C 196 204 200 192 204 182" stroke="#eef2e8" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
    </svg>
  );
}
