"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The bottom tab bar from Aayushi's brainstorm: Home · Topics · AI Coach · Progress · Profile.
// Shown only on these 5 main screens, never in the middle of preparing, talking or reflecting.

const TABS = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/topics", label: "Topics", icon: "topics" },
  { href: "/coach", label: "AI Coach", icon: "coach" },
  { href: "/progress", label: "Progress", icon: "progress" },
  { href: "/profile", label: "Profile", icon: "profile" },
] as const;

function Icon({ name }: { name: (typeof TABS)[number]["icon"] }) {
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
        </svg>
      );
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
    case "progress":
      return (
        <svg {...common}>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
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
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-label={t.label}
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
