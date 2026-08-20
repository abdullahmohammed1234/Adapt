import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`surface p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
