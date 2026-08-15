# ADAPT

A tutor that adapts to how you learn, not just whether you are right.

## Why ADAPT?

Most AI tutors adapt to whether an answer is correct.

A correct answer can come from guessing. An incorrect answer can come from a minor slip. ADAPT asks a different question:

> What does this answer tell us about the learner?

It then updates an explicit learner state, chooses an instructional strategy, and changes the next challenge.

This is **evidence-driven adaptive tutoring**. It is not a claim that ADAPT has been proven to improve learning.

## How It Works

```text
Answer
  ↓
Evidence
  ↓
Learner State
  ↓
Strategy
  ↓
Next Challenge
```

1. **Evidence Analyzer** extracts signals about understanding, confidence, reasoning, and misconceptions.
2. **Learner State** maintains the system's current belief about the learner.
3. **Strategy Engine** chooses how the tutor should respond.
4. **Challenge Selector** turns that strategy into the next task.

The product UI does not invent these decisions. It submits `answer`, `confidence`, and `reasoning` to `AdaptiveTutor` and displays the returned trace.

## Demo

Offline-first. No API key. No external LLM.

```bash
python -m app
```

Open [http://127.0.0.1:8765](http://127.0.0.1:8765).

- **Try ADAPT** — choose a subject (Mathematics, Calculus, Computer Science, Physics, Chemistry, Space, Quantum) and start a session.
- **How ADAPT Works** — the adaptive chain, technical evidence, and known limits.
- **Counterfactual** — same starting point, different evidence, different decision.

CLI reproduction of the guided demo:

```bash
python demo/run_demo.py
```

Competition demo (guided path + counterfactual, seed `20260814`):

```bash
python demo/run_competition_demo.py
```

Phase 9 product demo (lightweight answers, seed `20260815`):

```bash
python demo/run_phase9_demo.py
```

## Counterfactual

The key experiment is:

```text
Same initial state
+ different learner evidence
→ different adaptive decision
```

Learner A provides correct answers with strong reasoning and high confidence. Learner B provides correct answers with weak reasoning and low confidence. Both start on the same challenge. `AdaptiveTutor` is invoked twice. Displayed strategies are the engine's strategies.

## Technical Validation

These are engineering benchmarks of adaptive decision behavior. They are **not** proof of learning improvement.

| Phase | Result |
| --- | --- |
| 1E | 51/51 appropriateness; 9/9 counterfactual differentiation; 51/51 traceability |
| 1F | 39/42 development; 17/18 holdout; **ROBUST**; gap −1.6 pp |
| 2 | 60/60 strategy appropriateness |
| 3 | 44/44 end-to-end adaptation; 294/294 state-to-strategy causality; 294/294 strategy-to-challenge consistency |
| 4 | 20/20 task completion; 119/119 engine preservation; 119/119 trace visibility |
| 5 | Human learning evaluation: **INCONCLUSIVE**; **n = 0** |
| 7 | 7 domains; 50 concepts; 14 challenge types; repetition and counterfactual preserved |
| 8 | Product UX layer; explanations from traces; engine preserved; usability PENDING (n=0) |
| 9 | Competitive product polish; lightweight evidence; challenge diversity; expanded catalog; engine preserved |

## Architecture

```text
Learner
   ↓
Response
   ↓
Evidence Analyzer
   ↓
Learner State
   ↓
Strategy Engine
   ↓
Challenge Selector
   ↓
Next Challenge
```

The application boundary is `ProductService` → `AdaptiveTutor`. Historical Phase 1–5 engine logic is frozen. Phase 7 adds a content catalog around that engine. Phase 8 is a learner UX and explanation layer; it does not change adaptive decisions. Phase 9 polishes the product experience around the same frozen engine.

## Testing

```bash
python -m pytest
```

Historical benchmarks without rewriting artifacts:

```bash
python -m benchmarks.run_no_persist
```

## Limitations

- Phase 1F fraction-subtraction boundary (G-001-B).
- Phase 1F delayed-misconception vs regression boundary (G-003), later addressed in Phase 2 and kept as historical evidence.
- Phase 5 human participants = 0, so H1 is INCONCLUSIVE.
- Phase 4 formative usability study is incomplete (0 / 5 PENDING). Phase 8 and Phase 9 usability are also PENDING (0 / 5).
- No claim of educational efficacy.
- Heuristic, deterministic evidence analysis — not an LLM.
- Curated multi-domain catalog (not a complete curriculum).
- Finite challenge bank; questions are not generated at runtime.

## Project Structure

```text
adapt/
├── src/
│   ├── adapt/          # engine, product boundary, evaluation
│   └── app/            # HTTP server and learner UI
├── app/                # `python -m app` launcher
├── benchmarks/
│   ├── phase1e/
│   ├── phase1f/
│   ├── phase2/
│   ├── phase3/
│   ├── phase4/
│   ├── phase5/
│   ├── phase7/
│   ├── phase8/
│   └── phase9/
├── tests/
├── docs/
│   ├── phase-1/ … phase-9/
│   └── competition/
├── results/            # historical benchmark artifacts (do not rewrite)
├── demo/
└── README.md
```

## Research Status

Phase 5 human learning evaluation: **INCONCLUSIVE (n=0)**

No consented participants were available. Missing participants remain missing. Engineering evidence that the system changes decisions based on learner evidence is not a learning-gain result.
