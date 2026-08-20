"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { RESEARCH_STORAGE_KEY } from "@/lib/constants";

interface ResearchContextValue {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
}

const ResearchContext = createContext<ResearchContextValue>({
  enabled: false,
  setEnabled: () => undefined,
});

export function ResearchProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    setEnabledState(window.localStorage.getItem(RESEARCH_STORAGE_KEY) === "1");
  }, []);

  const setEnabled = (value: boolean) => {
    setEnabledState(value);
    window.localStorage.setItem(RESEARCH_STORAGE_KEY, value ? "1" : "0");
  };

  const value = useMemo(() => ({ enabled, setEnabled }), [enabled]);
  return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>;
}

export function useResearchMode() {
  return useContext(ResearchContext);
}
