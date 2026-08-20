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
    <div role="alert" className="mx-auto max-w-lg rounded-[var(--radius-lg)] border border-error/20 bg-error-soft p-6">
      <p className="kicker">Notice</p>
      <h2 className="title-section mt-2">{title}</h2>
      <p className="mt-3 text-muted">{message}</p>
      {onRetry ? (
        <div className="mt-5">
          <Button onClick={onRetry}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
