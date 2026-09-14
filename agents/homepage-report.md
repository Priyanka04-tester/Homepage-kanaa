# Homepage Report

Owns **Phase 11 (REPORT)**. Built: `scripts/generate-report.js`, run via `npm run
report:homepage`, writing `reports/homepage-qa-report.md`.

## Output
`reports/homepage-qa-report.md`, structured per spec section 30: Summary, Coverage, Test
Results (total/passed/failed/blocked/not-executed), Defects by severity, UI/Functional/
Responsive/Browser/Console-Network issues (listed separately), Regression Results, Known
Limitations, Evidence paths, Final Recommendation.

## Final Recommendation rule
`READY` only if execution actually ran (not "planned") and no blocking defects are open.
Otherwise `READY WITH KNOWN ISSUES` (non-blocking defects open) or `NOT READY` (blocking defects,
or required coverage incomplete). Never `READY` just because a plan exists — a generated test
plan with zero executions is not evidence of readiness, and Phase 4 of this project produced
exactly that state on its own (see `specs/homepage-test-plan.md`'s "Not yet executed" section).

## Source of truth
Every number in the report must trace back to `state/executions.json` / `state/bugs.json` /
`state/traceability.json` — don't hand-summarize from memory of what a past session found, the
state files are the only durable source (see root `CLAUDE.md`).
