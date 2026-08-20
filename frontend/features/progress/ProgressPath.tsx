import type { JourneyStage } from "@/lib/types";

export function JourneyNode({ stage }: { stage: JourneyStage }) {
  const done = stage.status === "completed";
  const current = stage.status === "in_progress";
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className={`mt-0.5 grid h-7 w-7 place-items-center rounded-full text-sm font-bold ${
          done ? "bg-accent text-white" : current ? "border-2 border-accent text-accent" : "border border-line text-muted"
        }`}
      >
        {done ? "✓" : current ? "◉" : "○"}
      </span>
      <div>
        <p className="font-semibold">{stage.name}</p>
        {stage.note ? <p className="text-xs text-muted">{stage.note}</p> : null}
      </div>
    </li>
  );
}

export function ProgressPath({ stages }: { stages: JourneyStage[] }) {
  return (
    <ol className="grid gap-4">
      {stages.map((stage) => (
        <JourneyNode key={stage.id} stage={stage} />
      ))}
    </ol>
  );
}

export function JourneyRail({
  stages,
}: {
  stages: Array<{ id: string; name: string; status?: string }>;
}) {
  return (
    <ol className="grid gap-3 sm:grid-flow-col sm:auto-cols-fr">
      {stages.map((stage) => {
        const done = stage.status === "completed";
        const current = stage.status === "in_progress" || stage.status === "current";
        return (
          <li key={stage.id} className="flex items-center gap-3 sm:flex-col sm:text-center">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                done
                  ? "bg-accent text-white"
                  : current
                    ? "border-2 border-accent text-accent"
                    : "border border-line text-muted"
              }`}
            >
              {done || current ? "●" : "○"}
            </span>
            <span className="text-sm font-semibold">{stage.name}</span>
          </li>
        );
      })}
    </ol>
  );
}
