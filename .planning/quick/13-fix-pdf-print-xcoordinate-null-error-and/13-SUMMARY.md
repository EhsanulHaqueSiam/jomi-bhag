---
phase: quick-13
plan: 1
subsystem: pdf, testing
tags: [recharts, html-to-image, react-pdf, vitest, pdf-export]

requires:
  - phase: 07
    provides: PDF export hook and chart capture logic
provides:
  - Crash-free PDF download/print with chart error isolation
  - All PDF-related tests passing (728/728)
affects: [pdf-export, results-page]

tech-stack:
  added: []
  patterns:
    - Per-chart try/catch isolation in captureCharts
    - Dimension check (offsetHeight > 0) before html-to-image capture

key-files:
  created: []
  modified:
    - src/components/results/SharePieChart.tsx
    - src/hooks/usePdfExport.tsx
    - src/hooks/__tests__/usePdfExport.test.ts

key-decisions:
  - "Removed redundant SVG Label from SharePieChart -- CSS overlay already handles center label display"
  - "Per-chart try/catch in captureCharts so one chart failure does not block the other"
  - "Test expectations updated to match actual hook behavior: errors caught internally, iframe for print"

patterns-established:
  - "Chart capture: always check element dimensions before toPng to avoid capturing zero-height elements"

requirements-completed: [fix-xcoordinate-null, fix-pdf-tests]

duration: 2min
completed: 2026-03-14
---

# Quick Task 13: Fix PDF Print xCoordinate Null Error and Failing Tests

**Eliminated Recharts xCoordinate null crash by removing redundant SVG Label, hardened chart capture with per-chart error isolation and dimension checks, and fixed 3 stale test expectations**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-14T14:52:54Z
- **Completed:** 2026-03-14T14:54:43Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Fixed xCoordinate null error by removing the redundant Recharts `<Label>` component that accessed coordinate props which are null during html-to-image capture
- Hardened `captureCharts` with per-chart try/catch isolation and offsetHeight > 0 dimension checks
- Fixed all 3 failing usePdfExport tests: downloadPdf (fake timers for setTimeout), error handling (check state not thrown error), printPdf (verify iframe not window.open)
- Full test suite passes: 728/728 tests, 0 failures, 0 TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix xCoordinate null error in chart capture and harden captureCharts** - `4f3fbf4` (fix)
2. **Task 2: Fix 3 failing usePdfExport tests to match current hook behavior** - `6fb1c41` (test)
3. **Task 3: Run full test suite to confirm zero regressions** - verification only (no commit needed)

## Files Created/Modified
- `src/components/results/SharePieChart.tsx` - Removed redundant SVG Label component and unused Label import
- `src/hooks/usePdfExport.tsx` - Hardened captureCharts with per-chart error isolation and dimension checks
- `src/hooks/__tests__/usePdfExport.test.ts` - Fixed 3 stale test expectations to match current hook behavior

## Decisions Made
- Removed SVG Label from SharePieChart rather than adding null guards -- the CSS overlay (lines 46-51) already renders the center label reliably, making the SVG Label fully redundant
- Used per-chart try/catch instead of wrapping both in a single try -- ensures one chart failure does not prevent the other from being captured
- Updated test expectations to match actual hook behavior rather than modifying the hook to match tests -- the hook's internal error handling and iframe approach are correct design choices

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- PDF download and print are crash-free with or without charts visible
- All 728 tests pass with 0 failures
- No TypeScript errors

## Self-Check: PASSED

All files verified present, all commits verified in git log.

---
*Quick Task: 13*
*Completed: 2026-03-14*
