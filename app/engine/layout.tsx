import type { Metadata } from "next";

// The content engine is for Aayushi only: keep it out of search engines.
export const metadata: Metadata = {
  title: "Raise · Content engine",
  robots: { index: false, follow: false },
};

export default function EngineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
