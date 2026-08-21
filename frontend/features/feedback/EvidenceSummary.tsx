import type { NoticedView } from "@/lib/types";

export function EvidenceSummary({
  noticed,
  sourceLabel,
}: {
  noticed: NoticedView;
  sourceLabel?: string | null;
}) {
  return (
    <section className="surface px-6 py-6" data-screen="noticed">
      <p className="kicker">What ADAPT noticed</p>
      {sourceLabel ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{sourceLabel}</p> : null}
      <h3 className="mt-2 font-display text-2xl">{noticed.headline}</h3>
      <p className="mt-2 text-muted">{noticed.body || noticed.summary}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {noticed.bullets.map((item) => (
          <li
            key={item.text}
            className={`rounded-full px-3 py-1.5 text-sm ${
              item.ok ? "bg-accent-soft text-accent" : "bg-canvas text-muted"
            }`}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
