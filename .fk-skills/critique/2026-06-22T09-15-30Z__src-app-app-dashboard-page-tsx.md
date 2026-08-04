---
target: dashboard
total_score: 23
p0_count: 0
p1_count: 2
timestamp: 2026-06-22T09-15-30Z
slug: src-app-app-dashboard-page-tsx
---
**Design Health Score**

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Counts are visible, but no grading/export health, pending work, failed jobs, or readiness summary. |
| 2 | Match System / Real World | 3 | PE/Lab split matches the product model; wording is mostly understandable. |
| 3 | User Control and Freedom | 3 | Main routes are easy to access; dashboard does not trap users. |
| 4 | Consistency and Standards | 2 | Uses current orange/neutral vocabulary, but card radius, white surfaces, shadows, and skeleton differ from DESIGN.md. |
| 5 | Error Prevention | 2 | Error state exists, but dashboard does not prevent users from entering incomplete grading/export flows. |
| 6 | Recognition Rather Than Recall | 2 | Users must remember which PE/Lab item needs work; recent lists lack status/next-action signals. |
| 7 | Flexibility and Efficiency | 2 | Quick links exist, but no “continue where I left off,” failed-only, pending export, or urgent queue. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and readable; not overcrowded. Some generic dashboard-card sameness remains. |
| 9 | Error Recovery | 2 | Load error is shown, but no retry button or partial-data fallback. |
| 10 | Help and Documentation | 2 | Basic descriptions exist, but empty states do not teach the next action strongly. |
| **Total** | | **23/40** | **Acceptable; clean foundation, weak operational value** |

**Anti-Patterns Verdict**

**LLM assessment**: The dashboard does not look broken or overly AI-decorated. It is clean, restrained, and close to the product’s warm operations-tool direction. The issue is that it behaves more like a navigation hub than a useful grading dashboard. The repeated two-card structure, generic metrics, and “recent items” lists feel familiar, but not yet tailored to the high-stakes PRN232 grading workflow.

**Deterministic scan**: 0 findings for `src/app/(app)/dashboard/page.tsx`. The bundled detector found no slop/anti-pattern rules in this file.

**Visual overlays**: Skipped. Browser automation/overlay injection is not available in this session, so this review uses source inspection plus deterministic CLI scan.

**Overall Impression**

Dashboard is visually acceptable, but strategically underpowered. It tells users “you have PE and Lab areas” instead of “these are the grading tasks that need attention today.” For instructors and TAs under deadlines, the first screen should surface blockers, active grading work, failed submissions, and exports waiting to download.

**What's Working**

- PE and Lab are separated clearly, which fits the product model and avoids mixing two workflows.
- Primary actions are visible and easy to reach: new PE session, submissions, exports, lab assignment, semesters.
- Loading uses a skeleton instead of a full-page spinner, which is the right direction for product UI.

**Priority Issues**

**[P1] Dashboard lacks an operational “Today / Needs Attention” layer**

**Why it matters**: Users open dashboard to know what needs action, not only to see total counts. Current metrics show total sessions, assignments, semesters, and labs, but they do not answer: what is pending, failed, ready to export, or recently graded?

**Fix**: Add a compact top band above the PE/Lab cards with 3-4 actionable queues: `Failed grading`, `Pending review`, `Ready to export`, `Recent activity`. Keep it dense and link each item to the exact filtered surface.

**Suggested command**: `$fk prod`

**[P1] Recent lists do not expose status or next action strongly enough**

**Why it matters**: Recent PE sessions only show title/description/date. Recent Lab assignments show status but no readiness or blocker context. Users must click into each item to know if anything needs work.

**Fix**: Add small status metadata per row: PE session assignment count/results/export state; Lab assignment readiness/submissions/graded/export availability. Use a single subtle status label and one next-action link per row.

**Suggested command**: `$fk prod`

**[P2] Empty states are too passive**

**Why it matters**: “No practical exam sessions yet” and “No lab assignments yet” tell the state but do not teach the first useful action. First-time users need a direct route.

**Fix**: Convert empty states into compact action empty states: one sentence, one primary action, optional secondary link. Example: `Create your first PE session` / `Set up a lab assignment`.

**Suggested command**: `$fk welcome`

**[P2] Visual system drifts from the documented Zapier-inspired tokens**

**Why it matters**: The dashboard uses `bg-white`, `#ebebeb`, `rounded-2xl`, and small shadows, while DESIGN.md emphasizes warm cream, sand borders, tighter radii, and border-forward depth. This makes the dashboard feel slightly different from the intended brand.

**Fix**: Align dashboard surfaces with existing brand tokens: warmer canvas/surfaces, sand borders, radius closer to 8px, fewer shadows. Do not change the orange brand direction.

**Suggested command**: `$fk finish`

**[P2] Error state has no recovery action**

**Why it matters**: If any dashboard API fails, the user sees an error message only. Under exam pressure, they need retry and ideally partial data if some endpoints succeeded.

**Fix**: Add a retry button and consider partial rendering: show PE if PE loaded, Lab if Lab loaded, with inline warning for the failed section.

**Suggested command**: `$fk check`

**Persona Red Flags**

**Alex (Power User)**: Alex wants to jump to urgent work. The current dashboard requires scanning broad navigation cards, then clicking into sessions/labs to discover actual blockers. No failed-only queue, ready-export queue, or “continue grading” shortcut.

**Jordan (First-Timer)**: Jordan can identify PE vs Lab, but empty states and generic descriptions do not guide first setup strongly. “No practical exam sessions yet” needs an action, not just a blank state.

**Sam (Accessibility-Dependent User)**: The page is mostly semantic and link-based, which is good. Risk remains around status communication if future dashboard health is added with color-only badges. Loading skeleton animation should respect reduced motion if global CSS does not already handle it.

**Minor Observations**

- “Lab Labs” should be renamed to “Lab assignments.”
- `New Lab Assignment` currently links to `/lab/assignments`, not an explicit create route; if creation happens there, label may be acceptable, but it behaves like navigation rather than direct creation.
- Dashboard skeleton layout no longer matches the final dashboard exactly: it has a quick-actions skeleton section that the page does not have.
- Page entrance animations are tasteful but should have reduced-motion coverage.

**Questions to Consider**

- Should dashboard be a launchpad, or the command center for urgent grading work?
- Which queue is most important on login: failed grading, pending review, ready export, or recent sessions?
- Should PE and Lab stay symmetrical, or should the dashboard prioritize whichever has active work?
