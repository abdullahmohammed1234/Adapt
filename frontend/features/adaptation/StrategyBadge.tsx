import { LEARNER_STRATEGY } from "@/lib/constants";
import type { StrategyName } from "@/lib/types";

export function StrategyBadge({
  strategy,
  research = false,
}: {
  strategy: StrategyName;
  research?: boolean;
}) {
  const label = research ? strategy : LEARNER_STRATEGY[strategy] || strategy;
  return (
    <span className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
      {label}
    </span>
  );
}
