import Link from "next/link";

export function ADAPTLogo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 no-underline ${light ? "text-deep-ink" : "text-ink"}`}
      aria-label="ADAPT home"
    >
      <span
        aria-hidden="true"
        className="grid h-8 w-8 place-items-center rounded-full border border-current/20 text-[0.7rem] font-bold tracking-[0.12em]"
      >
        ✦
      </span>
      <span className="text-[0.95rem] font-extrabold tracking-[0.28em]">ADAPT</span>
    </Link>
  );
}
