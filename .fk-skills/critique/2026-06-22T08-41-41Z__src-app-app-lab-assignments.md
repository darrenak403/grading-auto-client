---
target: review luồng quản lí và chấm assignment
total_score: 21
p0_count: 0
p1_count: 3
timestamp: 2026-06-22T08-41-41Z
slug: src-app-app-lab-assignments
---
# FK Review: Lab Assignment Management and Grading Flow

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Polling/progress exists, but grading/export status is split across subtle text, toast, and spinners. |
| 2 | Match System / Real World | 3 | Assignment, test case, submission, grade language is clear; labels like JSON, SOURCE, Bulk ZIP/RAR still need in-context help. |
| 3 | User Control and Freedom | 2 | Wizard has back/exit, but fullscreen takeover, hidden mobile stepper, and weak recovery from import/export errors reduce control. |
| 4 | Consistency and Standards | 2 | Good shared palette, but buttons, shadows, inline styles, export entry points, and destructive actions vary across steps. |
| 5 | Error Prevention | 2 | Confirms destructive actions, but upload/grade/export actions need stronger prerequisites and clearer disabled states. |
| 6 | Recognition Rather Than Recall | 2 | Stepper helps, but users must remember file naming, JSON format, approval prerequisite, and where export lives. |
| 7 | Flexibility and Efficiency | 2 | Bulk upload/regrade/search exist, but power-user affordances and batch review controls are limited. |
| 8 | Aesthetic and Minimalist Design | 2 | The surface is useful but crowded; too many equal-weight actions compete in test case/submission steps. |
| 9 | Error Recovery | 2 | Error messages exist, but several are generic and not anchored to a next repair action. |
| 10 | Help and Documentation | 1 | Sparse inline guidance; no visible examples/templates for JSON import, filename parsing, grading states, or score adjustment policy. |
| **Total** | | **21/40** | **Acceptable: functional foundation, significant UX tightening needed.** |

## Anti-Patterns Verdict

This does not look like a random AI marketing surface. It reads like a real internal product with coherent orange/neutral branding, a proper wizard, data tables, and operational concepts. The AI-ish tells are product-specific: many rounded white cards, repeated same-weight action rows, decorative micro-motion/shadows, and several UI decisions that feel assembled screen-by-screen rather than systemized.

Deterministic scan: `detect.mjs --json src/app/(app)/lab/assignments` returned `[]`. No static detector findings in the reviewed scope.

Visual overlays: skipped because no browser automation tool is available in this session, so no reliable user-visible overlay was injected.

## Overall Impression

The flow is capable and close to useful for real grading work, but it currently asks users to manage too much state in their head: test case approval, upload naming, grading job state, result review, manual adjustment, and export are spread across equal-weight controls. The biggest opportunity is to turn the wizard from "screens with controls" into an operational checklist that always says what is ready, what is blocked, and what to do next.

## What's Working

- The high-level flow is correct: setup -> test cases -> upload/grade -> review results. That matches the mental model of course staff.
- The app has real status plumbing: roster polling, grading indicators, completion toast, status badges, skeleton loading, and confirmation dialogs.
- The existing brand is mostly preserved: white/neutral surfaces, orange primary actions, simple borders, readable Inter-style product UI.

## Priority Issues

### [P1] Readiness and blockers are not explicit enough

Why it matters: Instructors need to know whether an assignment can be graded now. Today, prerequisites are implied through validation messages, disabled buttons, counts, and step navigation. Users can reach a step and still wonder what is missing.

Fix: Add a persistent readiness panel in the wizard header/sidebar: assignment details, approved test cases, uploaded submissions, grading state, export readiness. Each item should be pass/warn/block with a direct action link.

Suggested command: `$fk prod lab assignment grading flow`

### [P1] Step action hierarchy is overloaded

Why it matters: Test Cases shows total counts plus Import JSON, Approve All, Delete All. Submissions shows upload, bulk upload, Grade All, Regrade All, warnings, and table actions. These are very different risk levels but visually compete.

Fix: Make one primary action per step. Move destructive/global actions into a secondary overflow or a separated danger zone. Group upload controls under "Add submissions"; group grading controls under "Run grading"; keep Delete All away from the table header.

Suggested command: `$fk trim src/app/(app)/lab/assignments/[id]/components`

### [P1] Mobile and small-screen wizard likely breaks the flow

Why it matters: The sidebar stepper is hidden on mobile, while the detail page uses fullscreen fixed layout, 80px header/footer, `h-[calc(100vh-210px)]`, and dense tables. Mobile users lose the main step navigation and may fight nested scroll regions.

Fix: Add a mobile step switcher/progress control in the header, reduce fixed heights, and make table-heavy steps use stacked rows or horizontal scroll with clear affordances.

Suggested command: `$fk responsive src/app/(app)/lab/assignments/[id]`

### [P2] Export is conceptually duplicated and one path is invisible

Why it matters: `ResultsTab` includes Export Excel, while `ExportTab` exists but the wizard currently has `TOTAL_STEPS = 4` and does not render step 5. Users may not understand whether export is part of review or its own final step.

Fix: Choose one model. Either make export a visible fifth step with readiness/status, or keep it inside Review Results and remove/deprecate the unused Export tab.

Suggested command: `$fk plan lab assignment export step`

### [P2] Accessibility state communication is too visual

Why it matters: Score pass/fail uses check/cross glyphs, grading spinner is `aria-hidden`, status changes rely on toast/text color, and live grading completion may not be announced to assistive tech.

Fix: Add text labels for pass/fail, `aria-live` regions for grading/export status, accessible names for icon/status controls, and reduced-motion handling for spinner/progress animation.

Suggested command: `$fk check src/app/(app)/lab/assignments/[id]`

## Persona Red Flags

**Alex, power user**: Bulk upload and regrade exist, which is good. But there is no fast batch review path in Results, no keyboard-oriented shortcuts, and global actions are mixed with normal actions. Alex will want to approve/import/grade/review/export quickly, but the current flow forces repeated table scanning and modal interactions.

**Sam, accessibility-dependent user**: The fullscreen wizard uses `select-none`, visual stepper states, color-coded badges, glyph-only pass/fail, and hidden spinner semantics. Sam can probably tab through many controls, but grading progress and result status are not announced robustly.

**PRN232 instructor/operator**: The current flow exposes the raw mechanics but does not answer the operational question "Can I grade and export this class now?" They need a readiness checklist, not just counts and tables.

## Minor Observations

- `ExportTab` uses inline styles while most of the app uses Tailwind/classes.
- Several cards use `rounded-2xl`; this is acceptable but slightly softer than the documented tighter product system.
- `Delete All` appears inside a table header in Submissions, which makes a high-risk action feel like a column label.
- Empty states like "No submissions yet" and "No test cases yet" need direct next actions.
- "Save and Exit" is misleading because most step actions are already persisted independently.

## Questions to Consider

- Should this wizard optimize for a first-time instructor learning the flow, or for a TA repeatedly grading many assignments?
- Is export a final formal step, or just an action inside result review?
- What must be true before "Grade All" is allowed, and can the interface show that as a checklist instead of an error after the user tries?
