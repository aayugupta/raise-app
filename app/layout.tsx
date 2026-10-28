import type { Metadata, Viewport } from "next";
import { DM_Sans, Lora } from "next/font/google";
import "./globals.css";

// Raise design system (29 Oct 2026): Lora for emotional headlines and reflective lines,
// DM Sans for everything functional (body, buttons, labels, navigation, forms).
const display = Lora({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-lora" });
const ui = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dmsans" });

export const metadata: Metadata = {
  title: "Raise",
  description: "Better conversations. Brighter tomorrows. Guiding parents to build stronger bonds, one conversation at a time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F3EA", // --bg (Warm Ivory)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
