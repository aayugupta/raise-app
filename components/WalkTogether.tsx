// Flat illustration: a parent and teen walking side by side, seen from behind.
// Walks are where teens say they open up most (9 of 12 in the teen survey).
export default function WalkTogether() {
  return (
    <svg
      viewBox="0 100 400 340"
      width="100%"
      role="img"
      aria-label="A parent and teen walking side by side among flowers"
      style={{ display: "block" }}
    >
      {/* Soft cloud behind the figures */}
      <path
        d="M0 300 C 10 200 80 160 140 175 C 165 110 250 105 275 160 C 330 140 400 185 400 260 L400 440 L0 440 Z"
        fill="#fcebc8"
      />
      <circle cx="300" cy="150" r="26" fill="#fff6e6" />

      {/* Ground and path */}
      <path d="M0 330 C 120 312 280 312 400 330 L400 440 L0 440 Z" fill="#f2c27a" />
      <path d="M160 440 C 175 390 190 345 196 322 L214 322 C 222 345 240 390 262 440 Z" fill="#f8d9a4" />

      {/* Shadows */}
      <ellipse cx="176" cy="333" rx="26" ry="5" fill="#1f2340" opacity="0.12" />
      <ellipse cx="232" cy="333" rx="22" ry="5" fill="#1f2340" opacity="0.12" />

      {/* Parent */}
      <rect x="163" y="290" width="10" height="42" rx="5" fill="#1f2340" />
      <rect x="179" y="290" width="10" height="42" rx="5" fill="#1f2340" />
      <rect x="170" y="210" width="12" height="12" rx="4" fill="#e9a27f" />
      <path d="M150 300 C 150 250 155 222 176 218 C 197 222 202 250 202 300 Z" fill="#e8735a" />
      <path d="M176 218 L176 300" stroke="#d4614a" strokeWidth="2" />
      <path d="M198 236 C 210 242 219 240 226 233" stroke="#e8735a" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M154 238 C 150 258 150 272 153 284" stroke="#e8735a" strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx="176" cy="199" r="18" fill="#1f2340" />
      <circle cx="176" cy="178" r="10" fill="#1f2340" />

      {/* Teen */}
      <rect x="222" y="298" width="9" height="34" rx="4.5" fill="#2e3a5c" />
      <rect x="235" y="298" width="9" height="34" rx="4.5" fill="#2e3a5c" />
      <rect x="227" y="230" width="11" height="10" rx="4" fill="#c98a6a" />
      <path d="M210 304 C 210 264 214 241 233 237 C 252 241 256 264 256 304 Z" fill="#0e716d" />
      <path d="M218 246 C 220 233 246 233 248 246 C 241 253 225 253 218 246 Z" fill="#0b5e5a" />
      <path d="M252 256 C 256 272 256 284 253 294" stroke="#0e716d" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="233" cy="222" r="15" fill="#2b2b3a" />

      {/* Upright mustard leaf, left */}
      <path d="M60 362 C 38 322 48 282 70 258 C 92 284 90 330 60 362 Z" fill="#e7b04a" />
      <path d="M70 262 L62 356" stroke="#d29a35" strokeWidth="2" />

      {/* Coral tulips */}
      <path d="M100 372 L102 292" stroke="#4e8a5e" strokeWidth="3" />
      <path d="M88 292 C 86 274 94 268 101 276 C 108 268 116 274 114 292 C 108 299 94 299 88 292 Z" fill="#e8735a" />
      <path d="M318 372 L322 278" stroke="#4e8a5e" strokeWidth="3" />
      <path d="M309 280 C 307 263 315 257 322 265 C 329 257 337 263 335 280 C 329 287 315 287 309 280 Z" fill="#e8735a" />
      <path d="M342 380 L346 310" stroke="#4e8a5e" strokeWidth="3" />
      <path d="M335 312 C 333 299 340 295 346 301 C 352 295 359 299 357 312 C 352 317 340 317 335 312 Z" fill="#f08f74" />

      {/* Foreground leaves */}
      <path d="M-10 440 C 0 360 60 330 112 350 C 92 402 50 432 -10 440 Z" fill="#0e716d" />
      <path d="M-4 436 C 30 392 70 362 106 352" stroke="#0b5e5a" strokeWidth="2" fill="none" />
      <path d="M30 440 C 42 382 100 362 142 382 C 122 422 82 440 30 440 Z" fill="#4e8a5e" />
      <path d="M410 440 C 400 360 340 334 288 352 C 308 402 350 432 410 440 Z" fill="#0e716d" />
      <path d="M404 436 C 370 392 330 362 294 354" stroke="#0b5e5a" strokeWidth="2" fill="none" />
      <path d="M370 440 C 360 386 300 366 260 386 C 284 426 330 440 370 440 Z" fill="#7ba66b" />

      {/* Small yellow flower */}
      <g transform="translate(238 404)">
        <circle cx="0" cy="-9" r="7" fill="#f6c453" />
        <circle cx="9" cy="0" r="7" fill="#f6c453" />
        <circle cx="0" cy="9" r="7" fill="#f6c453" />
        <circle cx="-9" cy="0" r="7" fill="#f6c453" />
        <circle cx="0" cy="0" r="6" fill="#e8735a" />
      </g>

      {/* Sparkles */}
      <circle cx="40" cy="220" r="3" fill="#fff" />
      <circle cx="360" cy="215" r="3" fill="#fff" />
      <circle cx="120" cy="140" r="2.5" fill="#fff" />
    </svg>
  );
}
