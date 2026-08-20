import { LEARNER_STORAGE_KEY } from "@/lib/constants";

export function getLearnerId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(LEARNER_STORAGE_KEY);
  if (existing) return existing;
  const created = `learner-${crypto.randomUUID().slice(0, 8)}`;
  window.localStorage.setItem(LEARNER_STORAGE_KEY, created);
  return created;
}
