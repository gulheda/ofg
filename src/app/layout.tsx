import type { Metadata } from "next";
import Script from "next/script";
import { Jost, JetBrains_Mono } from "next/font/google";
import { site } from "@/data/site";
import TechnicalFrame from "@/components/layout/TechnicalFrame";
import CircuitBackground from "@/components/background/CircuitBackground";
import SafeBoundary from "@/components/layout/SafeBoundary";
import IntroOverlay from "@/components/layout/IntroOverlay";
import SpotlightDelegate from "@/components/layout/SpotlightDelegate";
import "./globals.css";

const jost = Jost({
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
    <html lang="tr" className={`${jost.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">
        {/* A refresh should always land back on the hero, not wherever the
            browser's own scroll restoration would put it. */}
        <Script id="scroll-reset" strategy="beforeInteractive">
          {`if ("scrollRestoration" in history) { history.scrollRestoration = "manual"; } window.scrollTo(0, 0);`}
        </Script>
        <SafeBoundary>
          <CircuitBackground className="pointer-events-none fixed inset-0 -z-10" />
        </SafeBoundary>
        <TechnicalFrame />
        <SpotlightDelegate />
        {children}
        <IntroOverlay />
      </body>
    </html>
  );
}
