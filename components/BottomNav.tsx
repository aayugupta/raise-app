"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The bottom tab bar from Aayushi's simplified flow (28 Oct 2026):
// Topics · AI Coach · Journey · Help · Profile. "Topics" opens Home (topic carousel + library link).
// "Journey" shows the 14-day journeys and progress. Shown only on these main screens,
// never in the middle of preparing, talking or reflecting.

const TABS = [
  { href: "/home", label: "Topics", icon: "topics", also: ["/topics"] },
  { href: "/coach", label: "AI Coach", icon: "coach", also: [] },
  { href: "/journey", label: "Journey", icon: "journey", also: ["/progress"] },
  { href: "/help", label: "Help", icon: "help", also: [] },
  { href: "/profile", label: "Profile", icon: "profile", also: [] },
] as const;

function Icon({ name }: { name: (typeof TABS)[number]["icon"] }) {
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "topics":
      return (
        <svg {...common}>
          <path d="M12 3a6 6 0 0 1 3.5 10.9V17h-7v-3.1A6 6 0 0 1 12 3Z" />
          <path d="M9.5 20.5h5" />
        </svg>
      );
    case "coach":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H9l-5 4V5Z" />
          <path d="M9 10h.01M12 10h.01M15 10h.01" />
        </svg>
      );
    case "journey":
      return (
        <svg {...common}>
          <circle cx="5" cy="18" r="2" />
          <circle cx="19" cy="6" r="2" />
          <path d="M7 18h7a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h7" />
        </svg>
      );
    case "help":
      return (
        <svg {...common}>
          <path d="M12 21s-7.5-4.6-9.2-9.4C1.6 8.2 3.7 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.7 1.1-1.6 2.7-2.7 4.7-2.7 3.6 0 5.7 3.7 4.5 7.1C19.5 16.4 12 21 12 21Z" />
          <path d="M12 9v5M9.5 11.5h5" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </svg>
      );
  }
}

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map((t) => {
        const active = pathname === t.href || (t.also as readonly string[]).includes(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-label={t.label === "Help" ? "Emergency help" : t.label}
            className={`bottom-nav-tab${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
