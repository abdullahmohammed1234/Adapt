import { Badge } from "@/components/Badge";
import { isCorrect } from "@/lib/format";
import type { StepResult } from "@/lib/types";

export function FeedbackCard({ result }: { result: StepResult }) {
  const correct = isCorrect(result);
  return (
    <section
      aria-live="polite"
      className={`rounded-[var(--radius-card)] border p-6 ${
        correct ? "border-success/20 bg-success-soft" : "border-retry/20 bg-retry-soft"
      }`}
    >
      <Badge tone={correct ? "success" : "retry"}>{correct ? "Correct" : "Not quite"}</Badge>
      <h2 className="mt-3 font-display text-3xl">{result.explanation.headline}</h2>
      <p className="mt-3 max-w-2xl text-base">{result.explanation.short_message}</p>
    </section>
  );
}
