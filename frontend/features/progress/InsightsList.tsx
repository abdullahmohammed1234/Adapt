import type { InsightsView } from "@/lib/types";

export function InsightsList({ insights }: { insights: InsightsView }) {
  if (!insights.lines.length) {
    return <p className="text-muted">No insights yet. Answer a few challenges in this session first.</p>;
  }
  return (
    <ul className="grid gap-3">
      {insights.lines.map((line) => (
        <li key={line} className="rounded-2xl border border-line bg-paper px-4 py-3">
          {line}
        </li>
      ))}
    </ul>
  );
}
