import type { SubjectId } from "@/lib/types";

export const PRODUCT = {
  name: "ADAPT",
  headline: "Learn differently.",
  supporting: "An AI tutor that adapts to how you learn, not just whether you are right.",
  ctaPrimary: "Start learning",
  ctaSecondary: "See how ADAPT adapts",
  loop: ["Answer", "ADAPT notices", "ADAPT adapts", "Your next challenge changes"] as const,
  landingLoop: ["Answer", "ADAPT notices", "ADAPT adapts"] as const,
  researchLoop: ["Evidence", "Learner State", "Strategy", "Challenge Selection"] as const,
  geminiLoop: [
    "Human Input",
    "Gemini Evidence",
    "Validation",
    "Learner State",
    "Strategy",
    "Next Challenge",
  ] as const,
  journey: ["Start", "Explore", "Practice", "ADAPT", "Improve"] as const,
  promise:
    "ADAPT demonstrates evidence-sensitive adaptive tutoring behavior. It has not been proven to improve learning.",
} as const;

export const CONFIDENCE_CHOICES = [
  { value: 1, id: "guessing", label: "Guessing", emoji: "😕", hint: "I am not sure this is right." },
  { value: 3, id: "unsure", label: "Unsure", emoji: "🙂", hint: "I have a sense of it, but not fully." },
  { value: 5, id: "confident", label: "Confident", emoji: "💡", hint: "I believe I understand this." },
] as const;

export const APPROACH_CHOICES = [
  { id: "knew", label: "I knew it" },
  { id: "worked", label: "I worked it out" },
  { id: "pattern", label: "I recognized the pattern" },
  { id: "guessed", label: "I guessed" },
  { id: "unsure", label: "I wasn't sure" },
] as const;

export const SUBJECT_ORDER: SubjectId[] = [
  "mathematics",
  "calculus",
  "computer-science",
  "physics",
  "chemistry",
  "space",
  "quantum",
];

export const SUBJECT_VISUAL: Record<
  string,
  { accent: string; accentSoft: string; motif: string; description: string }
> = {
  mathematics: {
    accent: "#0F6B57",
    accentSoft: "#D7EFE6",
    motif: "geometry",
    description: "Numbers, structure, and proof.",
  },
  calculus: {
    accent: "#6D28D9",
    accentSoft: "#EDE4FF",
    motif: "curve",
    description: "Change, rates, and accumulation.",
  },
  "computer-science": {
    accent: "#1D4ED8",
    accentSoft: "#DCE7FF",
    motif: "nodes",
    description: "Code, data, and algorithms.",
  },
  physics: {
    accent: "#B45309",
    accentSoft: "#FDE7C7",
    motif: "vectors",
    description: "Motion, forces, and energy.",
  },
  chemistry: {
    accent: "#047857",
    accentSoft: "#D5F4E6",
    motif: "molecule",
    description: "Atoms, bonds, and reactions.",
  },
  space: {
    accent: "#1E3A8A",
    accentSoft: "#D9E4FF",
    motif: "orbit",
    description: "Planets, stars, and the cosmos.",
  },
  quantum: {
    accent: "#5B4BD6",
    accentSoft: "#E4DFFF",
    motif: "wave",
    description: "Probability, measurement, and states.",
  },
};

export const LEARNER_STRATEGY: Record<string, string> = {
  ASSESS: "Let's see how you approach this.",
  PROBE: "Let's check your understanding.",
  MAINTAIN: "We'll stay at this level.",
  INCREASE: "You're ready for a harder challenge.",
  DECREASE: "Let's simplify this idea.",
  REMEDIATE: "Let's revisit this idea.",
  RECOVER: "We can move forward from here.",
  GATHER_EVIDENCE: "ADAPT needs a little more evidence.",
};

export const ADAPTATION_GESTURE: Record<string, { symbol: string; label: string }> = {
  INCREASE: { symbol: "↑", label: "Increasing difficulty" },
  DECREASE: { symbol: "↓", label: "Simplifying this idea" },
  PROBE: { symbol: "→", label: "Probing your understanding" },
  REMEDIATE: { symbol: "↻", label: "Revisiting the concept" },
  MAINTAIN: { symbol: "→", label: "Staying at this level" },
  ASSESS: { symbol: "→", label: "Seeing how you approach this" },
  RECOVER: { symbol: "→", label: "Moving forward" },
  GATHER_EVIDENCE: { symbol: "→", label: "Gathering more evidence" },
};

export const MAX_ANSWER_LENGTH = 20000;
export const LEARNER_STORAGE_KEY = "adapt.learner_id";
export const RESEARCH_STORAGE_KEY = "adapt.research_mode";
export const DEFAULT_MAX_STEPS = 10;
