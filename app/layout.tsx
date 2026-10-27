import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Nunito } from "next/font/google";
import "./globals.css";

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-serif" });
const body = Nunito({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Raise",
  description: "Better conversations. A stronger tomorrow. Practical support for parents to have meaningful conversations with their teenagers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf8f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
