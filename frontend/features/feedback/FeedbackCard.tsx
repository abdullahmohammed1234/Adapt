import { isCorrect } from "@/lib/format";
import type { StepResult } from "@/lib/types";

export function FeedbackCard({ result }: { result: StepResult }) {
  const correct = isCorrect(result);
  return (
    <section
      aria-live="polite"
      className={`rounded-[var(--radius-lg)] border px-6 py-5 ${
        correct ? "border-success/20 bg-success-soft" : "border-retry/20 bg-retry-soft"
      }`}
    >
      <p className="text-sm font-bold uppercase tracking-[0.16em]">{correct ? "Correct." : "Not quite."}</p>
      <h2 className="mt-2 font-display text-3xl">{result.explanation.headline}</h2>
      <p className="mt-2 max-w-2xl text-base">{result.explanation.short_message}</p>
    </section>
  );
}
