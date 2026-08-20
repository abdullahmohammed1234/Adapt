import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ADAPT — Learn differently",
  description: "An AI tutor that adapts to how you learn, not just whether you are right.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} antialiased text-ink`}>
        <AppProviders>
          <div className="app-shell">
            <a className="skip-link" href="#main">
              Skip to content
            </a>
            <SiteHeader />
            <div className="app-main">{children}</div>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
