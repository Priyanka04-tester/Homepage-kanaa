# Homepage Test Planner

Owns **Phase 3-4 (ANALYZE → PLAN → GENERATE TESTS)**: turning `state/homepage-map.json` into
`state/requirements.json`, `state/scenarios.json`, `state/test-cases.json`,
`state/traceability.json`, `state/known-risks.json`, and the human-readable
`requirements/homepage-requirements.md` / `specs/homepage-test-plan.md`.

## How to regenerate
```bash
node scripts/generate-test-plan.js
```
Reads the current `state/homepage-map.json`; overwrites the plan artifacts above. Never
hand-edit those generated files — change `scripts/generate-test-plan.js` and regenerate, or the
next regeneration silently reverts hand edits.

## Design choice: pattern-level test cases, not one row per element
This homepage has 240+ buttons, 246 links and 442 images. A catalog with one hand-written test
case per literal element would be unreadable and isn't how a QA engineer actually scopes a plan.
Instead, each section gets a small number of *pattern* test cases per element category it
contains ("every link in section X resolves", "every button in section X does something"), plus
dedicated cases for carousels and product widgets following spec sections 11/12. Execution specs
apply each pattern **data-driven** over the concrete elements listed in `homepage-map.json` — so
every individual button/link/image is still exercised, just not pre-enumerated in the plan.

Product-widget test cases sample first/middle/last of the widget's cards rather than every card
(spec section 12: "test representative products"), for the same reason.

## Global (cross-cutting) requirements
Not tied to one section: the 7 responsive viewports, the 3 browsers, accessibility, negative/
edge interaction robustness, console/network health, RTL/Arabic localization, and a bounded
performance observation. These use `sectionId: "HOME-GLOBAL"` in the state files.

## Known risks vs. bugs
`state/known-risks.json` carries every `discoveredIssues` entry from the homepage map (e.g. the
two placeholder/test products found live in product widgets, 15 broken images, a blank widget
title) as `RISK-HOME-*`. These are *not* filed as bugs yet — that only happens after a dedicated
execution reproduces them with evidence (see `homepage-bug-analyzer.md`). Don't skip that step
even though the risk already looks obviously real; the spec is explicit that a bug requires
reproduction + evidence, not just a discovery-time heuristic hit.
