import { Button } from "@/components/Button";

export function ErrorState({
  title = "Something went wrong",
  message,
  actionLabel = "Try again",
  onRetry,
}: {
  title?: string;
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-[var(--radius-card)] border border-retry/20 bg-retry-soft p-6">
      <p className="kicker">Notice</p>
      <h2 className="mt-2 font-display text-3xl">{title}</h2>
      <p className="mt-3 text-muted">{message}</p>
      {onRetry ? (
        <div className="mt-5">
          <Button onClick={onRetry}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
