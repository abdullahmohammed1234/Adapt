"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";

export function SpaceField() {
  const reduced = useReducedMotion();
  return (
    <div className="relative h-56 overflow-hidden rounded-[var(--radius-lg)] bg-[#071018]">
      <svg viewBox="0 0 640 240" className="h-full w-full" aria-hidden="true">
        <g fill="#d9e4ff" opacity="0.85">
          <circle cx="80" cy="70" r="1.6" />
          <circle cx="140" cy="40" r="1.2" />
          <circle cx="210" cy="90" r="1.8" />
          <circle cx="280" cy="36" r="1.4" />
          <circle cx="340" cy="110" r="2" />
          <circle cx="410" cy="48" r="1.3" />
          <circle cx="470" cy="86" r="1.7" />
          <circle cx="530" cy="38" r="1.4" />
          <circle cx="580" cy="120" r="1.6" />
          <circle cx="90" cy="170" r="1.2" />
          <circle cx="190" cy="160" r="1.5" />
          <circle cx="300" cy="180" r="1.3" />
          <circle cx="430" cy="170" r="1.6" />
        </g>
        <ellipse
          cx="320"
          cy="120"
          rx="180"
          ry="52"
          fill="none"
          stroke="#8aa4ff"
          strokeWidth="1.2"
          opacity="0.55"
        />
        <ellipse
          cx="320"
          cy="120"
          rx="110"
          ry="28"
          fill="none"
          stroke="#8aa4ff"
          strokeWidth="1"
          opacity="0.35"
        />
        <circle cx="320" cy="120" r="10" fill="#f4f1ea" />
        <circle cx="500" cy="120" r="4" fill="#8aa4ff">
          {reduced ? null : (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 320 120"
              to="360 320 120"
              dur="18s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </svg>
      <p className="absolute bottom-3 left-4 right-4 text-xs text-white/70">
        A visual metaphor for orbital motion — not an astronomy simulator.
      </p>
    </div>
  );
}
