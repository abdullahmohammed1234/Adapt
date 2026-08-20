import type { ReactNode } from "react";

export function PageShell({
  children,
  wide = false,
  className = "",
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <main
      id="main"
      className={`mx-auto w-full px-4 py-10 sm:px-6 sm:py-14 ${wide ? "max-w-6xl" : "max-w-4xl"} ${className}`.trim()}
    >
      {children}
    </main>
  );
}
