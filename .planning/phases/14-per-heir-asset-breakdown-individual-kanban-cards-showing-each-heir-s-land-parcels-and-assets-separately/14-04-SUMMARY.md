---
phase: 14-per-heir-asset-breakdown
plan: 04
subsystem: pdf
tags: [react-pdf, pdf-export, individual-distribution, equilibrium, qurah]

# Dependency graph
requires:
  - phase: 14-01
    provides: individualDistributionStore with individuals, items, compensations, customNames, qurahUsed, hasBeenUsed
  - phase: 14-02
    provides: IndividualColumn types and individual distribution UI
  - phase: 07
    provides: PDF infrastructure (PdfDocument, extractPdfData, pdfTypes, pdfStyles)
provides:
  - PdfIndividualSection component for per-heir asset breakdown in PDF
  - PdfIndividualDistribution, PdfIndividualHeir, PdfIndividualCompensation types
  - extractPdfData integration with individualDistributionStore
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [store-getState-for-pdf-extraction, conditional-pdf-section]

key-files:
  created:
    - src/components/pdf/PdfIndividualSection.tsx
    - src/components/__tests__/pdf-individual.test.tsx
  modified:
    - src/components/pdf/pdfTypes.ts
    - src/components/pdf/extractPdfData.ts
    - src/components/pdf/PdfDocument.tsx

key-decisions:
  - "PdfIndividualSection uses break prop for page break before section, wrap={false} per type group"
  - "Equilibrium indicators use text markers [OK]/[~]/[X] with color coding (PDF cannot render Unicode checkmarks reliably)"
  - "Custom names resolve in both heir display and compensation fromName/toName via store.customNames lookup"

patterns-established:
  - "Individual PDF section conditional render: only when individualDistribution exists in PdfData"
  - "Store getState() pattern in extractPdfData for reading individual distribution state"

requirements-completed: [P14-21, P14-22, P14-23]

# Metrics
duration: 4min
completed: 2026-03-14
---

# Phase 14 Plan 04: Individual Asset Breakdown PDF Section Summary

**PdfIndividualSection renders per-heir asset tables with equilibrium indicators, type grouping, Qurah reference, and pairwise compensation in the PDF report**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T22:38:46Z
- **Completed:** 2026-03-13T22:42:44Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- PdfIndividualSection component with heir-type grouping, equilibrium color-coded indicators, asset tables, and compensation list
- extractPdfData extended to read individualDistributionStore and build PdfIndividualDistribution with custom name resolution
- 16 integration tests covering data extraction, type grouping, equilibrium calculation, custom names, and component smoke tests

## Task Commits

Each task was committed atomically:

1. **Task 1: PDF types, extractPdfData extension, and PdfIndividualSection component** - `5a0edfc` (feat)
2. **Task 2: PDF individual section integration tests** - `ca8b445` (test)

## Files Created/Modified
- `src/components/pdf/pdfTypes.ts` - Added PdfIndividualHeir, PdfIndividualCompensation, PdfIndividualDistribution types and PdfData.individualDistribution field
- `src/components/pdf/extractPdfData.ts` - Extended to read individualDistributionStore, compute equilibrium, group by heir type, resolve custom names
- `src/components/pdf/PdfIndividualSection.tsx` - New component rendering per-heir breakdown with gold-accent section title, Qurah reference, type headers, asset tables, compensation list, summary line
- `src/components/pdf/PdfDocument.tsx` - Added PdfIndividualSection conditional render after Distribution Summary
- `src/components/__tests__/pdf-individual.test.tsx` - 16 tests: extractPdfData include/exclude, type grouping, custom names, equilibrium status, compensation mapping, balanced count, qurahUsed flag, item sorting, component smoke tests, round-trip integration

## Decisions Made
- Used text markers [OK]/[~]/[X] for equilibrium indicators since PDF renderer cannot reliably render Unicode checkmarks or emoji
- Custom name resolution applied both to heir displayName and compensation fromName/toName by checking customNames keyed on individual ID
- Section uses gold accent border (amber-700) consistent with Islamic styling pattern established in other PDF sections

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 14 is now complete -- all 4 plans executed
- PDF report now includes the full per-heir individual asset breakdown when individual view was used
- Complete actionable division document ready for families to print

## Self-Check: PASSED

All 5 files found. Both commits (5a0edfc, ca8b445) verified. PdfIndividualSection is 278 lines (min: 60). All 684 tests pass.

---
*Phase: 14-per-heir-asset-breakdown*
*Completed: 2026-03-14*
