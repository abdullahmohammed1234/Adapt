"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADAPTLogo } from "@/components/ADAPTLogo";
import { useResearchMode } from "@/hooks/useResearchMode";

const LINKS = [
  { href: "/subjects", label: "Learn" },
  { href: "/how-it-works", label: "How it adapts" },
  { href: "/progress", label: "Progress" },
  { href: "/counterfactual", label: "Counterfactual" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { enabled, setEnabled } = useResearchMode();
  const [open, setOpen] = useState(false);
  const dark = pathname === "/";

  return (
    <header
      className={`sticky top-0 z-20 border-b ${
        dark ? "border-white/10 bg-[#10131a]/90 text-deep-ink" : "border-line bg-paper/90 text-ink"
      } backdrop-blur-md`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <ADAPTLogo light={dark} />
        <button
          type="button"
          className="rounded-full border border-current/20 px-3 py-1 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
        <nav
          id="site-nav"
          className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-3 border-b border-current/10 bg-inherit px-4 py-4 md:static md:flex md:flex-row md:items-center md:gap-5 md:border-0 md:bg-transparent md:p-0`}
        >
          {LINKS.map((link) => {
            const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`text-sm font-semibold no-underline ${
                  current ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/research"
            className="text-sm font-semibold opacity-70 no-underline hover:opacity-100"
            onClick={() => setOpen(false)}
          >
            Research
          </Link>
          <label className="flex items-center gap-2 text-xs font-semibold opacity-80">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            Research Mode
          </label>
        </nav>
      </div>
    </header>
  );
}
