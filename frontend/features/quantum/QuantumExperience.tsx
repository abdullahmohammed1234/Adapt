"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/components/LoadingState";

const QuantumField = dynamic(() => import("@/features/quantum/QuantumField"), {
  ssr: false,
  loading: () => <LoadingState label="Loading quantum visual…" />,
});

export function QuantumExperience() {
  return <QuantumField />;
}
