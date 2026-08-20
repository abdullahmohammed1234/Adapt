"use client";

import { ResearchProvider } from "@/hooks/useResearchMode";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ResearchProvider>{children}</ResearchProvider>;
}
