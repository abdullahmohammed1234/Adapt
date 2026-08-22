# Final submission checklist

Check items only after they are actually done. Do not fabricate.

---

## Competition files

- [ ] ML Workflow PNG (created from `workflow/WORKFLOW_SPEC.md`; not present in this package)
- [ ] Samples video/document (script ready; video not recorded in-repo)
- [ ] Documentation (`documentation/ADAPT_DOCUMENTATION.md` and supporting files)
- [ ] Fourth portal artifact verified, if required (unspecified in this repository — confirm on the portal)

---

## Workflow

- [ ] Human input shown
- [ ] Prompt shown (P-003 / evidence_v3)
- [ ] LLM shown
- [ ] Model identified (Gemini; default configurable; live 2.5/3.6 not combined)
- [ ] Evidence extraction shown
- [ ] Validation shown
- [ ] Fallback shown as failure path, not Gemini success
- [ ] AdaptiveTutor shown
- [ ] Strategy shown as an ADAPT decision
- [ ] Challenge selection shown

---

## Samples

- [ ] Same cases used for baseline and workflow
- [ ] Single-prompt baseline shown (`baseline_v1`)
- [ ] ADAPT workflow shown
- [ ] Correct-but-uncertain case (A-001 / lucky guess)
- [ ] Counterfactual (product `/counterfactual` and/or F-001 vs F-002)
- [ ] Research Mode
- [ ] Results accurately described (no significance claim; no live score)

---

## Documentation

- [ ] P-001
- [ ] P-002 (injection failure retained)
- [ ] P-003
- [ ] Evaluation
- [ ] Limitations
- [ ] Architecture
- [ ] Reproducibility
- [ ] Security

---

## Demo

- [ ] Gemini path tested **or** fallback path tested with correct label
- [ ] Fallback path tested
- [ ] Browser prepared (no secrets on screen)
- [ ] Sample learner responses prepared
- [ ] Counterfactual prepared
- [ ] Screen recording plan prepared (`samples/SAMPLE_VIDEO_SCRIPT.md`)
- [ ] No secrets visible

---

## Final verification

- [x] pytest passes — **598 passed** (2026-08-21 submission-prep run)
- [x] offline benchmark passes — 86.7% extraction; 100% validity/injection/traceability; 20/30 vs 11/30; p ≈ 0.137
- [ ] historical results unchanged (do not rewrite `results/phase12/` reports)
- [ ] AdaptiveTutor unchanged
- [ ] P-003 unchanged
- [ ] holdout unchanged
- [x] no API key tracked (`.env` gitignored; not in `git ls-files`)
- [ ] no unsupported claims in PNG, video, or pasted portal text

---

## After the PNG and video exist

- [ ] PNG matches `WORKFLOW_SPEC.md` node list
- [ ] Video includes same-input single-prompt comparison
- [ ] Closing line used: “Gemini interprets the evidence. ADAPT decides how to teach.”
