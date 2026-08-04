---
target: PE assignment grading flow
total_score: 21
p0_count: 0
p1_count: 3
timestamp: 2026-06-22T09-07-20Z
slug: src-app-app-exam-sessions
---
**Design Health Score**

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Step 4 has status and score rows, but no session-level grading summary, no failed/pending counts, and no clear “safe to export” state. |
| 2 | Match System / Real World | 3 | PE concepts are understandable: participants, resources, questions, submissions, results, export. Some labels still sound system-centric. |
| 3 | User Control and Freedom | 2 | Individual view/regrade exists, but bulk review flow is weak and users must open one dialog at a time. |
| 4 | Consistency and Standards | 2 | Lab flow now has cleaner readiness/export guidance; PE still uses older wizard/table/dialog patterns and more inline styles. |
| 5 | Error Prevention | 2 | Some disabled states exist, but grading/export can happen without strong readiness or completion checks at session level. |
| 6 | Recognition Rather Than Recall | 2 | Users need to remember which assignment/round is ready; Results and Export tabs duplicate grading round input without strong context. |
| 7 | Flexibility and Efficiency | 2 | Regrade per submission exists, but reviewing many PE submissions is click-heavy. No failed-only filter or next/previous review loop. |
| 8 | Aesthetic and Minimalist Design | 2 | The foundation is clean, but PE has more nested cards, pills, and large modal detail density than the Lab pass. |
| 9 | Error Recovery | 2 | Errors appear, but failed grading/export states do not guide the user toward the exact next action. |
| 10 | Help and Documentation | 2 | Basic descriptions exist, but high-stakes PE decisions lack inline explanation of readiness, adjustment audit, and export completeness. |
| **Total** | | **21/40** | **Acceptable, but weaker than the current Lab grading flow** |

**Anti-Patterns Verdict**

**LLM assessment**: PE does not look unusable, but it still feels like an earlier generation of the product. The core pieces are present, yet the experience is organized around screens and API objects instead of the instructor’s actual job: prepare PE, run grading, inspect exceptions, adjust with confidence, export. The biggest “AI-made” tell is not visual decoration; it is uniform cards/tables/dialogs without a strong operational command center.

**Deterministic scan**: 1 finding. `src/app/(app)/assignments/[id]/questions/[qid]/page.tsx:361` uses `transition: width`, which can cause layout-thrashing animation. This is a performance polish issue, not the main PE grading UX problem.

**Visual overlays**: Skipped. Browser automation/overlay injection is not available in this session, so this review uses source inspection plus deterministic CLI scan.

**Overall Impression**

PE is functionally covered, but not yet “confident for exam day.” Lab now feels closer to a guided production flow; PE still makes the instructor infer readiness and manually chase exceptions across assignment wizard, session results, submission dialog, and export tab.

**What's Working**

- The PE wizard has a logical skeleton: participants → resources → questions/test cases → upload & grade → export.
- Submission detail has the right raw material: total score, passed questions, test case details, grading history, comments, and score adjustment.
- Exam session tabs give a reasonable top-level split between assignments, participants, results, and export.

**Priority Issues**

**[P1] No PE readiness/checkpoint model at exam-session level**

**Why it matters**: PE is higher stakes than Lab. Before export, instructors need to know which assignments are missing participants, resources, questions/test cases, submissions, completed grading, or review. Right now readiness is spread across assignment cards, wizard steps, Results, and Export.

**Fix**: Add a compact PE session readiness summary, not a large new panel. Use one concise header or tab-level strip with counts like `3/4 assignments ready`, `12 pending`, `2 failed`, `Export blocked`. Drill-down can live inside Assignments/Results, but the top-level answer must be visible.

**Suggested command**: `$fk prod`

**[P1] Review flow is too single-submission oriented**

**Why it matters**: After PE grading, instructors usually review exceptions first: failed, low score, adjusted, missing artifact, worker error. Current session Results table has score/status and a `View` button, but no triage path. Opening one large dialog per student makes bulk review slow.

**Fix**: In `ResultsTab`, add lightweight triage controls: `Failed only`, `Pending`, `Adjusted`, `Low score`. In `DetailSubmissionDialog`, add `Previous` / `Next unresolved` navigation and keep the review context visible so users can move through exceptions without closing the modal.

**Suggested command**: `$fk prod`

**[P1] Export can be generated without enough visible confidence**

**Why it matters**: Export is the final PE artifact. The current Export tab asks for grading round and creates a job, but does not strongly warn if results are incomplete, failed, unreviewed, or from a mismatched round. This can produce a spreadsheet that looks official before the instructor is confident.

**Fix**: Gate export with a compact pre-export checklist: selected round, total submissions, completed, failed, pending, adjusted, last graded time. Disable or secondary-style export when blockers exist; allow an explicit “Export anyway” only if the product needs that escape hatch.

**Suggested command**: `$fk check`

**[P2] Detail dialog is dense and split across two tabs**

**Why it matters**: The user has to inspect results in one tab, then adjust in another. That creates memory load: “which question failed and why?” before entering adjustments.

**Fix**: Keep adjustment controls close to each question result, or at least surface failed questions first in Review. Collapse passing test cases by default, keep failed details expanded.

**Suggested command**: `$fk trim`

**[P2] Grading progress lacks operational summary**

**Why it matters**: Step 4 shows rows, but does not give the instructor a quick sense of “worker done?”, “how many failed?”, “what needs action?”.

**Fix**: Add a small progress summary above the submissions table: `Completed`, `Running`, `Failed`, `Needs review`, with one primary next action.

**Suggested command**: `$fk prod`

**Persona Red Flags**

**Alex (Power User)**: Bulk PE review is slow. Alex can regrade one row and view one submission, but cannot quickly filter failures or move through unresolved submissions. This will feel inefficient once the class has dozens of students.

**Jordan (First-Timer)**: Jordan can follow the wizard, but export confidence is unclear. The UI says “Create Export” without first proving that all assignments in the selected round are complete and safe.

**Sam (Accessibility-Dependent User)**: The large modal and many custom controls may be keyboard-challenging. The review flow depends heavily on visual badges, color, and nested expandable sections; status changes during polling may not be announced.

**Minor Observations**

- PE still has many inline styles and duplicated patterns compared with the newer Lab flow.
- “Grading Round” appears in Step 4, Step 5, Results, and Export; it should behave like one shared selected context, not four separate inputs.
- Delete submission is close to View/Regrade in a dense row. It has confirmation, but its placement still increases misclick risk.
- The deterministic scan’s `transition: width` warning should be cleaned during a polish/perf pass.

**Questions to Consider**

- Should PE grading be centered on “exceptions to review” instead of “all submissions”?
- Should export be blocked until every assignment in the exam session reaches a complete state?
- Is `gradingRound` meant to be a free text field, or should it become a selectable round with known status?
