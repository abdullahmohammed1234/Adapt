import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-line bg-paper p-5 shadow-[var(--shadow)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
