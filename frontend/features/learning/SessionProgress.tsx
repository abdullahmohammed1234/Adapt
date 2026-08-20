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
      <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
