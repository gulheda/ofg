import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { site } from "@/data/site";
import TechnicalFrame from "@/components/layout/TechnicalFrame";
import PcbBackground from "@/components/background/PcbBackground";
import SpeedLines from "@/components/background/SpeedLines";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.title}`,
  description: site.tagline,
  openGraph: {
    title: `${site.name} — ${site.title}`,
    description: site.tagline,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">
        <div aria-hidden="true" className="bg-blueprint-grid pointer-events-none fixed inset-0 -z-20" />
        <PcbBackground className="pointer-events-none fixed inset-0 -z-10" />
        <SpeedLines />
        <TechnicalFrame />
        {children}
      </body>
    </html>
  );
}
