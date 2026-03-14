---
phase: 16-wire-results-mode-toggle
plan: 01
subsystem: ui
tags: [react, zustand, mode-toggle, results, framer-motion]

requires:
  - phase: 03-results-step
    provides: ResultsPage, HeirCard, ChartSection, StepAccordion, IslamicBasisSection, QuranReference
provides:
  - ModeToggle wired into ResultsPage with viewMode-driven conditional rendering
  - hasToggledMode persistence for one-time hint dismissal
  - Compact per-heir Quran citation footer in HeirCard (detailed mode)
  - Collapsible disclosure pattern replaced by mode toggle
affects: [results, pdf-export]

tech-stack:
  added: []
  patterns:
    - viewMode-driven conditional rendering (AnimatePresence + isDetailed flag)
    - hasToggledMode one-time hint pattern with Zustand persist

key-files:
  created: []
  modified:
    - src/types/wizard.ts
    - src/stores/wizardStore.ts
    - src/components/results/ResultsPage.tsx
    - src/components/results/HeirCard.tsx
    - src/components/__tests__/results.test.tsx
    - src/components/__tests__/charts.test.tsx

key-decisions:
  - "hasToggledMode set to true on any setViewMode call (not just first toggle)"
  - "Compact citation uses An-Nisa prefix since all Faraid verses from Surah An-Nisa"
  - "AnimatePresence with height/opacity transition for section show/hide"

patterns-established:
  - "viewMode conditional rendering: isDetailed flag drives section visibility"
  - "hasToggledMode: persistent one-time hint pattern via Zustand persist"

requirements-completed: [RSLT-06]

duration: 5min
completed: 2026-03-14
---

# Phase 16 Plan 01: Wire Results Mode Toggle Summary

**ModeToggle wired into ResultsPage with simple/detailed view switching, collapsible disclosures removed, compact per-heir An-Nisa citation footer in detailed mode**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-14T13:26:59Z
- **Completed:** 2026-03-14T13:31:40Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- ModeToggle pill rendered between title and first content card on ResultsPage
- Simple mode hides ChartSection, StepAccordion, IslamicBasisSection entirely
- Detailed mode shows all sections inline without collapsible wrappers
- Compact "An-Nisa X:YY -- excerpt" citation footer in HeirCard (detailed mode only)
- One-time hint text below toggle disappears permanently after first toggle
- chartsOpen/basisOpen useState completely removed from ResultsPage

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire ModeToggle into ResultsPage** (TDD)
   - `22e7c83` (test: add failing tests for mode toggle)
   - `7809073` (feat: wire ModeToggle, remove collapsible disclosures)
2. **Task 2: Add compact per-heir Quran citation footer** (TDD)
   - `3036015` (feat: compact citation footer in detailed mode)
3. **Deviation fix: Update chart tests**
   - `9e177c1` (fix: chart tests use viewMode instead of collapsible)

## Files Created/Modified
- `src/types/wizard.ts` - Added hasToggledMode boolean to WizardState
- `src/stores/wizardStore.ts` - hasToggledMode state, setViewMode sets it true, partialize includes it
- `src/components/results/ResultsPage.tsx` - ModeToggle import, viewMode-driven conditional rendering, hint text
- `src/components/results/HeirCard.tsx` - Compact Quran citation footer, viewMode selector, removed QuranReference
- `src/components/__tests__/results.test.tsx` - RSLT-06 mode toggle tests, updated RSLT-02 and RSLT-03
- `src/components/__tests__/charts.test.tsx` - Updated to use viewMode: detailed instead of collapsible click

## Decisions Made
- hasToggledMode set to true on any setViewMode call (permanent dismiss, not just first toggle)
- Compact citation uses "An-Nisa" prefix because all three Faraid verses (4:11, 4:12, 4:176) are from Surah An-Nisa
- AnimatePresence with height/opacity transition matches existing app motion patterns
- Removed expandable QuranReference entirely from HeirCard (replaced, not coexisting)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated chart tests for viewMode-driven rendering**
- **Found during:** Full test suite verification after Task 2
- **Issue:** charts.test.tsx used expandChartsSection() which clicked the now-removed "Charts & Visualizations" collapsible button
- **Fix:** Changed tests to set viewMode: 'detailed' in store state instead of clicking collapsible
- **Files modified:** src/components/__tests__/charts.test.tsx
- **Verification:** All chart tests pass
- **Committed in:** 9e177c1

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Chart test fix necessary due to collapsible removal. No scope creep.

## Issues Encountered
- Pre-existing usePdfExport.test.ts failures (3 tests) unrelated to this plan. Logged but not fixed (out of scope).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- ResultsPage fully wired with mode toggle
- viewMode persists via localStorage (already implemented in prior phase)
- PDF export unaffected (always exports full detail)

## Self-Check: PASSED

All 6 modified files verified present. All 4 task commits verified in git log.

---
*Phase: 16-wire-results-mode-toggle*
*Completed: 2026-03-14*
