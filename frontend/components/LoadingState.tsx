export function LoadingState({ label = "Loading ADAPT…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="grid min-h-[40vh] place-items-center px-4 py-16 text-muted">
      <div className="flex flex-col items-center gap-3">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent"
          aria-hidden="true"
        />
        <p>{label}</p>
      </div>
    </div>
  );
}
