export function SessionProgress({
  current,
  total,
  concept,
}: {
  current: number;
  total: number;
  concept?: string;
}) {
  const percent = Math.min(100, Math.round((current / Math.max(total, 1)) * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">{concept || "This session"}</span>
        <span className="text-muted">
          {current} / {total}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label="Session progress"
      >
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
