---
target: review UX chấm bài và UI hiển thị
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-06-22T09-01-40Z
slug: p-app-lab-assignments-id-components-resultstab-tsx
---
# FK Review: Lab Grading UX and Results UI

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Grading state is visible, but result freshness and export readiness could be clearer. |
| 2 | Match System / Real World | 3 | Grading terms mostly fit the domain; SOURCE and adjustment semantics need inline explanation. |
| 3 | User Control and Freedom | 3 | Regrade and adjust are available, but undo/history for score overrides is not visible. |
| 4 | Consistency and Standards | 3 | Main controls are cleaner now; result detail table still has custom table styling separate from shared Table. |
| 5 | Error Prevention | 3 | Grade/export blockers improved; score adjust still permits unclear scoring ranges and weak reason guidance. |
| 6 | Recognition Rather Than Recall | 2 | Users still need to remember what Effective means, what * means, and why SOURCE can score when Docker fails. |
| 7 | Flexibility and Efficiency | 3 | Search, per-student regrade, bulk grading exist; batch result review remains limited. |
| 8 | Aesthetic and Minimalist Design | 3 | Header is cleaner; Results still shows dense table plus full response details, which can overwhelm. |
| 9 | Error Recovery | 2 | BuildFailed is explained, but failed test rows and export/download failures need better local recovery copy. |
| 10 | Help and Documentation | 2 | Some hints exist, but result interpretation and adjustment policy lack lightweight help. |
| **Total** | | **27/40** | **Acceptable/high: improved foundation, remaining issues are result clarity and review efficiency.** |

## Anti-Patterns Verdict

The UI no longer feels over-instrumented in the header. It reads like a task-focused grading tool, not a generic AI dashboard. Remaining visual risk is density: results combine a selected roster, grade summary, table, response details, and adjust actions in one view.

Deterministic scan: `detect.mjs --json` on grading/result components returned `[]`.

Visual overlays: skipped because browser automation is unavailable in this session.

## Overall Impression

The flow is now usable enough for grading, but result interpretation still needs polish. The next improvements should help users answer: which submissions need attention, why did a score happen, and what changed after manual adjustment?

## What's Working

- Grade/export blockers are now clearer and prevent obvious mistakes.
- Results split roster and detail well for desktop review.
- Search and per-submission regrade support real grading workflows.

## Priority Issues

### [P1] Result rows do not clearly prioritize failures

Why it matters: Reviewers need to find failures fast. Current pass/fail glyphs and raw rows force scanning every test.

Fix: Add row emphasis for failed/overridden tests, show failed count near the student total, and offer a "Failures first" or "Failed only" toggle.

Suggested command: `$fk finish src/app/(app)/lab/assignments/[id]/components/ResultsTab.tsx`

### [P1] Score adjustment lacks review confidence

Why it matters: Manual score changes are high-stakes. The modal asks for score/reason but does not show current score, effective score, previous override, or clear max/min boundaries in a strong way.

Fix: In Adjust modal, show Current awarded, Effective, Max, Previous override if present, and a reason hint like "Required for audit trail." Disable scores greater than max client-side.

Suggested command: `$fk prod score adjustment modal`

### [P2] Response details are too open by default

Why it matters: Large JSON responses can dominate the page and bury the grading table.

Fix: Collapse response details per row by default, or show them only for failed/selected test case. Keep a compact "View response" action in the table.

Suggested command: `$fk trim results response details`

### [P2] Grading progress is not rich enough during long runs

Why it matters: During slow grading, users need confidence that work is advancing, not just "Grading student...".

Fix: Add compact progress text: completed/queued, current student, percent if reliable, and last update. Keep it in the Upload & Grade step and roster item.

Suggested command: `$fk motion grading progress state`

## Persona Red Flags

**Alex, power user**: Can regrade and search, but cannot quickly filter failures or batch-review problematic students.

**Sam, accessibility-dependent user**: Pass/fail still uses glyphs; grading spinner is visually meaningful but hidden from assistive tech.

**PRN232 instructor/operator**: Can see scores, but audit confidence around manual overrides is not strong enough yet.

## Minor Observations

- `Effective` and `*` need visible explanation.
- `Export Excel` placement is now reasonable inside Results.
- Failed build explanation is useful; repeat that pattern for test-level errors.
- Header is now much cleaner after removing extra pills.

## Questions to Consider

- Should graders review all tests, or mostly exceptions/failures?
- Should manual override be treated as a small edit or an auditable decision?
- What is more important next: faster review or stronger audit trail?
