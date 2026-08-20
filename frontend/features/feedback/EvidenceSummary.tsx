import type { NoticedView } from "@/lib/types";

export function EvidenceSummary({ noticed }: { noticed: NoticedView }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
      <p className="kicker">{noticed.title}</p>
      <h3 className="mt-2 font-display text-2xl">{noticed.headline}</h3>
      <p className="mt-2 text-muted">{noticed.body || noticed.summary}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {noticed.bullets.map((item) => (
          <li key={item.text} className="rounded-xl bg-canvas px-3 py-2 text-sm">
            <span aria-hidden="true">{item.ok ? "•" : "•"} </span>
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
