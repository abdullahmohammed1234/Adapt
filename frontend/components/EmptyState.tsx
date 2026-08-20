import { Button } from "@/components/Button";

export function EmptyState({
  title,
  message,
  href,
  actionLabel,
}: {
  title: string;
  message: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h2 className="title-section">{title}</h2>
      <p className="mt-3 text-muted">{message}</p>
      {href && actionLabel ? (
        <div className="mt-6">
          <Button href={href}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
