---
phase: 10-movable-assets-and-complete-estate-inventory
plan: 03
subsystem: ui
tags: [react, pdf, indivisible-assets, qurah, buyout, faraid, results-page]

requires:
  - phase: 10-movable-assets-and-complete-estate-inventory
    provides: "MovableAsset types, valuation functions, wizard store integration, asset category forms"
  - phase: 09-land-lot-division-and-qurah-assignment
    provides: "QurahCeremony component for bismillah ceremony and lot drawing"
provides:
  - "IndivisibleCard with 3 resolution options (sell/buyout/qurah) and inline QurahCeremony"
  - "MovableAssetCard wired to render IndivisibleCard for indivisible assets"
  - "EstateBreakdownCard with 5th Movable Assets category and per-category detail"
  - "HeirCard with per-category movable asset amounts in expandable section"
  - "PdfMovableAssetsSection for PDF export with item table"
  - "Integration tests for movable asset results display"
affects: [phase-11-distribution, phase-12-json-import-export]

tech-stack:
  added: []
  patterns: ["stable empty array reference for Zustand selectors to avoid infinite rerenders"]

key-files:
  created:
    - src/components/assets/IndivisibleCard.tsx
    - src/components/pdf/PdfMovableAssetsSection.tsx
  modified:
    - src/components/assets/MovableAssetCard.tsx
    - src/components/results/EstateBreakdownCard.tsx
    - src/components/results/HeirCard.tsx
    - src/core/land/valuation.ts
    - src/components/pdf/pdfTypes.ts
    - src/components/pdf/extractPdfData.ts
    - src/components/pdf/PdfDocument.tsx
    - src/hooks/usePdfExport.tsx
    - src/components/__tests__/results.test.tsx

key-decisions:
  - "Stable EMPTY_SHARES constant prevents Zustand selector infinite rerender when results is null"
  - "EstateBreakdownCard grid dynamically switches between 4-col and 5-col layout based on movable asset presence"
  - "HeirCard toggle renamed from 'View property shares' to 'View asset shares' reflecting combined property+movable scope"

patterns-established:
  - "Stable empty array reference for Zustand selectors with optional chaining fallbacks"

requirements-completed: [P10-SC3, P10-SC4, P10-SC5]

duration: 8min
completed: 2026-03-13
---

# Phase 10 Plan 03: Results Integration & PDF Export Summary

**Indivisible asset resolution UI with sell/buyout/qurah options (inline QurahCeremony), EstateBreakdownCard 5-category display, HeirCard per-category movable amounts, and PDF movable assets table**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-13T12:53:47Z
- **Completed:** 2026-03-13T13:02:24Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- IndivisibleCard shows 3 resolution options: Sell & Divide (per-heir share amounts), Buyout (heir dropdown with compensation math via calculateBuyout), Qurah (inline QurahCeremony with bismillah, draw button, staggered reveal, heir assignment)
- EstateBreakdownCard extended with 5th Movable Assets category showing per-category totals in expandable detail
- HeirCard shows per-category movable asset amounts (Vehicle, Cash, etc.) alongside per-property amounts
- PDF export includes movable assets table with Item, Category, Value, and Status (Divisible/Indivisible + resolution)
- All 499 tests pass, TypeScript clean, production build succeeds

## Task Commits

1. **Task 1: IndivisibleCard, MovableAssetCard wiring, EstateBreakdownCard + HeirCard extensions** - `ff24f2b` (feat)
2. **Task 2: PDF export extension and integration tests** - `db90016` (feat)

## Files Created/Modified
- `src/components/assets/IndivisibleCard.tsx` - Per-item resolution choice UI with sell/buyout/qurah and inline QurahCeremony
- `src/components/assets/MovableAssetCard.tsx` - Wired to render IndivisibleCard for indivisible assets with value; fixed Zustand selector stability
- `src/components/results/EstateBreakdownCard.tsx` - 5th Movable Assets category with per-category detail breakdown
- `src/components/results/HeirCard.tsx` - Per-category movable asset amounts in expandable section
- `src/core/land/valuation.ts` - EstateBreakdown interface extended with movableAssets field; computeEstateBreakdown accepts optional movableAssetsTotal
- `src/components/pdf/pdfTypes.ts` - PdfMovableAsset interface and extended PdfData
- `src/components/pdf/extractPdfData.ts` - Maps MovableAsset[] to PdfMovableAsset[] with display labels and resolution text
- `src/components/pdf/PdfMovableAssetsSection.tsx` - PDF table section for movable assets
- `src/components/pdf/PdfDocument.tsx` - Renders PdfMovableAssetsSection after PdfPropertySection
- `src/hooks/usePdfExport.tsx` - Passes movableAssets to extractPdfData
- `src/components/__tests__/results.test.tsx` - Integration tests for movable asset results display

## Decisions Made
- Used stable EMPTY_SHARES constant instead of inline `?? []` to prevent Zustand selector infinite rerenders when results is null
- EstateBreakdownCard grid dynamically switches between lg:grid-cols-4 and lg:grid-cols-5 based on movable asset presence
- Renamed HeirCard expandable toggle from "View property shares" to "View asset shares" to reflect combined property + movable scope

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zustand selector infinite rerender in MovableAssetCard**
- **Found during:** Task 2 (running full test suite)
- **Issue:** `useWizardStore((s) => s.results?.shares ?? [])` creates new array reference each render when results is null, causing infinite rerender loop
- **Fix:** Extracted `const EMPTY_SHARES: ShareResult[] = []` as stable module-level constant
- **Files modified:** src/components/assets/MovableAssetCard.tsx
- **Verification:** All 499 tests pass, no infinite rerender errors
- **Committed in:** db90016 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed Zustand selector stability issue.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 10 complete: all movable asset types, forms, indivisible resolution, results integration, and PDF export functional
- Ready for Phase 11 (interactive asset distribution with drag-and-drop equilibrium)
- Ready for Phase 12 (JSON import/export for assets)

---
*Phase: 10-movable-assets-and-complete-estate-inventory*
*Completed: 2026-03-13*
