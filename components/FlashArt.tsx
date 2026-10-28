// Small hand-drawn-style pictures for the 4 flashcards (29 Oct 2026), in the sage / terracotta palette:
// a speech bubble (how to begin), a question bubble (gentle questions), a heart (what to say),
// and an open hand (if your child reacts). Decorative only.
export type FlashArtKind = "begin" | "questions" | "say" | "react";

export default function FlashArt({ kind }: { kind: FlashArtKind }) {
  const common = { width: 52, height: 52, viewBox: "0 0 52 52", "aria-hidden": true, className: "flash-art" } as const;
  switch (kind) {
    case "begin":
      return (
        <svg {...common}>
          <circle cx="26" cy="26" r="25" fill="#e4ebdd" />
          <path d="M13 17c0-3 2.4-5 5.4-5h15.2c3 0 5.4 2 5.4 5v10c0 3-2.4 5-5.4 5H24l-6.5 5.6c-.6.5-1.5 0-1.4-.8l.6-4.8h-.3c-1.9 0-3.4-1.6-3.4-3.5V17Z" fill="#285c4d" />
          <circle cx="20" cy="22" r="1.9" fill="#f7f3ea" />
          <circle cx="26" cy="22" r="1.9" fill="#f7f3ea" />
          <circle cx="32" cy="22" r="1.9" fill="#f7f3ea" />
        </svg>
      );
    case "questions":
      return (
        <svg {...common}>
          <circle cx="26" cy="26" r="25" fill="#f6e8dd" />
          <path d="M14 18c0-3.3 2.7-6 6-6h12c3.3 0 6 2.7 6 6v8c0 3.3-2.7 6-6 6h-2l-4.6 5.2c-.5.6-1.4.2-1.4-.5V32h-4c-3.3 0-6-2.7-6-6v-8Z" fill="#d39474" />
          <path d="M23 18.6c.4-1.9 2-3 3.8-2.8 2 .2 3.3 1.8 3 3.6-.3 1.6-1.6 2.2-2.6 2.8-.8.5-1.2 1-1.2 1.8" stroke="#f7f3ea" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="26" cy="27.2" r="1.5" fill="#f7f3ea" />
        </svg>
      );
    case "say":
      return (
        <svg {...common}>
          <circle cx="26" cy="26" r="25" fill="#f6e8dd" />
          <path d="M26 37.5c-.4 0-.8-.1-1.1-.4C19 32.4 14 28.3 14 22.6 14 19 16.7 16 20.3 16c2.4 0 4.3 1.3 5.7 3.2C27.4 17.3 29.3 16 31.7 16c3.6 0 6.3 3 6.3 6.6 0 5.7-5 9.8-10.9 14.5-.3.3-.7.4-1.1.4Z" fill="#d39474" />
          <path d="M20 21.5c.6-1.4 1.8-2.1 3-2.1" stroke="#f7f3ea" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "react":
      return (
        <svg {...common}>
          <circle cx="26" cy="26" r="25" fill="#e4ebdd" />
          <path
            d="M19 27V17.5a2 2 0 0 1 4 0V25m0-8.5v-2a2 2 0 0 1 4 0V25m0-9a2 2 0 0 1 4 0V25m0-6.5a2 2 0 0 1 4 0v9.5c0 5.5-3.8 9-8.7 9-3.4 0-5.6-1.6-7.4-4.3L15.3 29a2 2 0 0 1 3.2-2.4L19 27"
            fill="#5f8a6e"
            stroke="#285c4d"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
