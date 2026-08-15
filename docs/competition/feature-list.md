# Feature list

Judge-facing product features. Adaptive decisions come from `AdaptiveTutor`.

- Offline local demo (`python -m app`) with no API key
- Learner session: challenge, answer, quick confidence, optional approach, optional explanation
- Feedback generated from actual evidence
- Adaptation moment generated from the actual decision trace
- Research trace: Evidence → State → Strategy → Next Challenge
- Human-readable explanations that only mention observed evidence
- Deterministic guided demo (`DEMO SCENARIO`)
- Counterfactual: same start, two learners, two real engine runs
- Architecture page
- Technical evidence page (engineering benchmarks)
- Known limitations page, including Phase 5 n = 0
- Reset to a clean session
- Session restore after refresh while the server is running
- Seven learning domains with expanded concept catalogs (Mathematics through Quantum)
- CLI demos: `python demo/run_demo.py`, `python demo/run_competition_demo.py`, `python demo/run_phase9_demo.py`
