---
phase: 07-pdf-export-and-print
plan: 01
subsystem: ui
tags: [react-pdf, pdf-generation, fonts, arabic-rtl, intl-numberformat]

# Dependency graph
requires:
  - phase: 01-faraid-engine-and-project-foundation
    provides: FaraidOutput, ShareResult, HeirType, CalculationStep, IslamicReference types
  - phase: 04-property-and-land-input
    provides: Property type, computePropertyTotal
  - phase: 06-charts-and-visualization
    provides: Chart data patterns (EMERALD_COLORS, buildChartData)
provides:
  - PdfDocument root component assembling 7 PDF sections
  - PdfData type for serializable PDF document data
  - extractPdfData function for FaraidOutput-to-PdfData transformation
  - Font registration (Inter 3 weights + Noto Naskh Arabic)
  - Ink-friendly grayscale color palette for PDF charts
  - PDF styles (A4 page, tables, disclaimer box, Arabic RTL)
affects: [07-02-hook-and-buttons, pdf-export]

# Tech tracking
tech-stack:
  added: ["@react-pdf/renderer", "html-to-image"]
  patterns: ["side-effect font registration", "pre-formatted serializable data layer", "ink-friendly grayscale palette"]

key-files:
  created:
    - src/components/pdf/PdfDocument.tsx
    - src/components/pdf/PdfHeader.tsx
    - src/components/pdf/PdfHeirTable.tsx
    - src/components/pdf/PdfChartSection.tsx
    - src/components/pdf/PdfPropertySection.tsx
    - src/components/pdf/PdfStepsSection.tsx
    - src/components/pdf/PdfReferencesSection.tsx
    - src/components/pdf/PdfDisclaimer.tsx
    - src/components/pdf/pdfTypes.ts
    - src/components/pdf/extractPdfData.ts
    - src/components/pdf/pdfFonts.ts
    - src/components/pdf/pdfStyles.ts
    - src/components/pdf/pdfColors.ts
    - src/components/__tests__/pdf.test.tsx
    - src/assets/fonts/Inter-Regular.ttf
    - src/assets/fonts/Inter-SemiBold.ttf
    - src/assets/fonts/Inter-Bold.ttf
    - src/assets/fonts/NotoNaskhArabic-Regular.ttf
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "PdfData is fully serializable (no Fraction objects, no store hooks) -- pure pre-formatted strings and primitives"
  - "Font files downloaded as static TTFs (not variable fonts) for PDF spec compatibility"
  - "Noto Naskh Arabic sourced from GitHub googlefonts/noto-fonts repo (gstatic URL returned HTML)"
  - "Disclaimer notices exported as named constants for testability"
  - "Heir table conditionally hides BDT columns when totalEstateValue is 0"

patterns-established:
  - "PDF data extraction pattern: pure function transforms engine types to serializable display data"
  - "Side-effect font import: pdfFonts.ts imported in PdfDocument.tsx for Font.register calls"
  - "Section component pattern: each PDF section is a standalone component receiving props from PdfData"

requirements-completed: [OUTP-01, OUTP-03]

# Metrics
duration: 5min
completed: 2026-03-13
---

# Phase 7 Plan 01: PDF Document Components Summary

**Complete PDF document component tree with @react-pdf/renderer, Inter + Noto Naskh Arabic fonts, serializable data extraction layer, and 15 unit tests**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-13T07:01:45Z
- **Completed:** 2026-03-13T07:06:49Z
- **Tasks:** 2
- **Files modified:** 20

## Accomplishments

- Built complete PDF document with 7 sections in correct order: Header, Heir Table, Charts, Property, Steps, References, Disclaimer
- Created extractPdfData pure function that transforms FaraidOutput + Properties into fully serializable PdfData (no Fraction objects, no store hooks)
- Registered 4 fonts (Inter Regular/SemiBold/Bold + Noto Naskh Arabic) for professional document typesetting with Arabic RTL support
- All 370 tests pass (15 new PDF tests + 355 existing) with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies, download fonts, create PDF data layer and style infrastructure** - `1e34b4c` (feat)
2. **Task 2: Build all PDF section components and root PdfDocument** - `0301b14` (feat)

## Files Created/Modified

- `src/components/pdf/pdfTypes.ts` - PdfData, PdfShareRow, PdfReference, PdfProperty interfaces
- `src/components/pdf/extractPdfData.ts` - Pure function transforming engine output to PdfData
- `src/components/pdf/pdfFonts.ts` - Font.register for Inter (3 weights) + Noto Naskh Arabic
- `src/components/pdf/pdfStyles.ts` - A4 page, table, disclaimer box, Arabic RTL styles
- `src/components/pdf/pdfColors.ts` - Ink-friendly grayscale palette for B&W printing
- `src/components/pdf/PdfHeader.tsx` - App name, report title, generation date
- `src/components/pdf/PdfHeirTable.tsx` - Flexbox heir share table with Awl/Radd banner
- `src/components/pdf/PdfChartSection.tsx` - Pie and bar chart image embedding
- `src/components/pdf/PdfPropertySection.tsx` - Per-property breakdown with BDT totals
- `src/components/pdf/PdfStepsSection.tsx` - Numbered calculation steps
- `src/components/pdf/PdfReferencesSection.tsx` - Quran/Hadith references with Arabic RTL
- `src/components/pdf/PdfDisclaimer.tsx` - 4 notice paragraphs + generation metadata
- `src/components/pdf/PdfDocument.tsx` - Root Document assembling all sections with page numbers
- `src/components/__tests__/pdf.test.tsx` - 15 tests for data extraction, Awl, blocked heirs, properties, disclaimer
- `src/assets/fonts/` - 4 TTF font files (Inter 3 weights + Noto Naskh Arabic)
- `package.json` - Added @react-pdf/renderer, html-to-image

## Decisions Made

- PdfData is fully serializable with pre-formatted strings -- no Fraction objects or Zustand hooks cross the boundary into PDF components
- Font files are static weight TTFs downloaded to src/assets/fonts/ (variable fonts not supported by PDF spec)
- Noto Naskh Arabic font sourced from GitHub googlefonts/noto-fonts repo because the gstatic URL returned an HTML page instead of a TTF
- Disclaimer text constants exported from PdfDisclaimer.tsx for test reusability
- Heir table conditionally omits Per-Heir BDT and Total BDT columns when no estate value entered
- Section components use `break` prop for page break hints before large sections

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Noto Naskh Arabic font URL returned HTML**
- **Found during:** Task 1 (Font download)
- **Issue:** The gstatic URL from the plan returned an HTML page (1.6KB) instead of a TTF font file
- **Fix:** Downloaded from GitHub googlefonts/noto-fonts repository instead (178KB valid TTF)
- **Files modified:** src/assets/fonts/NotoNaskhArabic-Regular.ttf
- **Verification:** `file` command confirms TrueType Font data
- **Committed in:** 1e34b4c (Task 1 commit)

**2. [Rule 3 - Blocking] npm peer dependency conflict**
- **Found during:** Task 1 (Dependency installation)
- **Issue:** @tailwindcss/vite@4.2.1 expects vite@^5.2.0||^6||^7 but project has vite@8.0.0
- **Fix:** Used --legacy-peer-deps flag (pre-existing conflict, not introduced by this plan)
- **Files modified:** package.json, package-lock.json
- **Verification:** npm install completes, all tests pass
- **Committed in:** 1e34b4c (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes necessary for task completion. No scope creep.

## Issues Encountered

None beyond the deviations documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PdfDocument component ready to be consumed by usePdfExport hook (Plan 02)
- extractPdfData available for hook to call with store state
- html-to-image installed for chart-to-image conversion in Plan 02
- All section components tested and type-checked

## Self-Check: PASSED

All 18 created files verified present. Both task commits (1e34b4c, 0301b14) verified in git log.

---
*Phase: 07-pdf-export-and-print*
*Completed: 2026-03-13*
