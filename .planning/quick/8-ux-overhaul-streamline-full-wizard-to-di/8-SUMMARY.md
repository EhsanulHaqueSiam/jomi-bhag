---
phase: quick-8
plan: 1
subsystem: ui
tags: [ux, wizard, results, distribution]
dependency-graph:
  requires: []
  provides:
    - 4-step wizard flow
    - streamlined results page
    - polished distribution page
  affects:
    - wizard navigation
    - results page layout
    - distribution page layout
tech-stack:
  added: []
  patterns:
    - collapsible disclosure sections for detail content
    - summary card for at-a-glance results
    - sticky action bar pattern
    - auto-distribute (compute + randomize) workflow
key-files:
  created:
    - src/components/wizard/StepFamilyAndSiblings.tsx
  modified:
    - src/types/wizard.ts
    - src/components/wizard/WizardShell.tsx
    - src/stores/wizardStore.ts
    - src/components/results/ResultsPage.tsx
    - src/components/distribution/DistributionPage.tsx
    - src/components/distribution/DistributionControls.tsx
    - src/components/distribution/DistributionBoard.tsx
    - src/components/distribution/HeirColumn.tsx
    - src/core/json/importData.ts
    - src/components/division/LotDivisionPage.tsx
decisions:
  - StepFamilyAndSiblings uses collapsible toggle for siblings section (default collapsed, auto-expand if data exists)
  - Results summary table uses HEIR_TYPE_LABELS for display names and Fraction.toFraction() for share strings
  - Charts and Islamic basis behind collapsible disclosure sections (replaced ModeToggle simple/detailed)
  - Sticky action bar uses position sticky with z-40 and shadow for visual separation
  - Auto-distribute button calls computeDistribution() then randomize() in sequence
  - SummaryBanner promoted from DistributionBoard to DistributionPage for visibility
  - Share fraction displayed next to heir name in HeirColumn headers
  - Persist version bumped to 2 with migration for 5-step to 4-step numbering
metrics:
  duration: 18min
  completed: "2026-03-14T09:25:36Z"
---

# Quick Task 8: UX Overhaul -- Streamline Full Wizard to Distribution Flow

4-step wizard with merged Family Members step, streamlined Results page with summary card and collapsible sections, polished Distribution page with stats bar and auto-distribute.

## Task Results

### Task 1: Merge Steps 2+3 into "Family Members" and renumber wizard to 4 steps
- **Commit:** fdcf029
- **Files:** 22 files changed
- Combined StepFamily and StepSiblings into StepFamilyAndSiblings with collapsible siblings section
- Updated WIZARD_STEPS from 5 to 4 entries (Relationship, Family Members, Estate Inventory, Results)
- Renumbered all step references across WizardShell, wizardStore, importData, and 12 test files
- Added persist migration v1->v2 mapping old step numbers to new (3->2, 4->3, 5->4)
- Siblings section auto-expands on mount if any sibling counts are non-zero

### Task 2: Streamline Results page with summary card, collapsible sections, sticky action bar
- **Commit:** 61e5245
- **Files:** 2 files changed (ResultsPage.tsx, results.test.tsx)
- Added Inheritance Summary table at top showing heir name, share fraction, and BDT amount
- Moved ChartSection behind "Charts & Visualizations" collapsible disclosure
- Moved StepAccordion and IslamicBasisSection behind "Islamic Legal Basis & Calculation Steps" collapsible
- Removed ModeToggle dependency (simple/detailed toggle no longer needed)
- Added sticky action bar at bottom with: Distribute Assets, Download PDF, Print, Export JSON, Edit Heirs, Edit Properties
- Header cleaned to just "Inheritance Results" title

### Task 3: Distribution page polish -- summary stats, auto-distribute, prominent equilibrium
- **Commit:** 074281a
- **Files:** 5 files changed
- Added summary stats bar with 4 stat cards: Properties count, Movable Assets count, Total Value (BDT), Heirs count
- Added Auto-distribute button (primary emerald-600) to DistributionControls
- Made Randomize button secondary (outline style)
- Promoted SummaryBanner from inside DistributionBoard to DistributionPage level
- Added share fraction display next to heir name in HeirColumn headers

### Additional Fix: Chart test updates
- **Commit:** 13adebb
- **Files:** 1 file changed (charts.test.tsx)
- Updated chart tests to expand collapsible section before asserting chart content

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Chart tests assumed charts always visible**
- **Found during:** Full test suite verification after Task 2
- **Issue:** 7 chart tests failed because ChartSection is now behind collapsible disclosure
- **Fix:** Added expandChartsSection() helper, wrapped assertions in waitFor after expanding
- **Files modified:** src/components/__tests__/charts.test.tsx
- **Commit:** 13adebb

**2. [Rule 1 - Bug] Multiple text matches in results tests**
- **Found during:** Task 2 test verification
- **Issue:** Summary table introduced duplicate fraction and BDT text, breaking getByText assertions
- **Fix:** Changed to getAllByText with length > 0 assertion
- **Files modified:** src/components/__tests__/results.test.tsx
- **Commit:** 61e5245

**3. [Rule 1 - Bug] Wizard test waitFor used non-unique step indicator text**
- **Found during:** Task 1 test verification
- **Issue:** "Family Members" text exists in StepIndicator (always visible) and component heading, causing false-positive waitFor matches
- **Fix:** Changed waitFor targets to "Immediate Family" (unique to StepFamilyAndSiblings content)
- **Commit:** fdcf029

## Verification

- All 720 tests pass (3 pre-existing failures in usePdfExport.test.ts confirmed as out-of-scope)
- TypeScript compiles clean (npx tsc --noEmit passes)
- Vite production build succeeds
- No Faraid calculation code touched
