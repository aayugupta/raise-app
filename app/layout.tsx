import type { Metadata, Viewport } from "next";
import { Caveat, DM_Sans, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Raise design system (29 Oct 2026): Lora for emotional headlines and reflective lines,
// DM Sans for everything functional (body, buttons, labels, navigation, forms).
const display = Lora({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-lora" });
const ui = DM_Sans({ subsets: ["latin", "latin-ext"], // latin-ext: the dotless ı in the Raise logo
   weight: ["400", "500", "600", "700"], variable: "--font-dmsans" });
// Caveat: the handwritten-style notes on the flashcards (29 Oct 2026).
const hand = Caveat({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-caveat" });

export const metadata: Metadata = {
  title: "Raise",
  description: "Better conversations. Brighter tomorrows. For the talks that matter most with your child, we help you find the first words.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F3EA", // --bg (Warm Ivory)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable} ${hand.variable}`}>
      <body>
        {children}
        {/* Vercel Web Analytics (30 Oct 2026): anonymous visits, pages and where visitors came from. No cookies. */}
        <Analytics />
      </body>
    </html>
  );
}
