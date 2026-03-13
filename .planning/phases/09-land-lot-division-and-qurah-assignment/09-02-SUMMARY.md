---
phase: 09-land-lot-division-and-qurah-assignment
plan: 02
subsystem: division-ui
tags: [react, zustand, motion-react, staggered-reveal, qurah, pdf-export, tailwindcss]

requires:
  - phase: 09-land-lot-division-and-qurah-assignment
    provides: Division algorithm, DivisionResult types, useDivisionStore
  - phase: 04-land-property-entry
    provides: Property type, computePropertyTotal, PROPERTY_TYPES
  - phase: 07-pdf-export-and-print
    provides: PdfDocument, extractPdfData, usePdfExport, pdfTypes
provides:
  - LotDivisionPage with QurahCeremony, GroupCard, CompensationBanner, ParcelRow, QurahReference
  - "Divide Land" button on ResultsPage (visible only when properties exist)
  - AppPage 'division' routing with onNavigate threading through WizardShell
  - PdfLotDivisionSection for PDF export of land division results
  - 7 component tests for division UI
affects: [11-drag-and-drop, 07-pdf-export]

tech-stack:
  added: []
  patterns: [staggered-card-reveal, onNavigate-prop-threading, conditional-pdf-section]

key-files:
  created:
    - src/components/division/QurahReference.tsx
    - src/components/division/CompensationBanner.tsx
    - src/components/division/ParcelRow.tsx
    - src/components/division/GroupCard.tsx
    - src/components/division/QurahCeremony.tsx
    - src/components/division/LotDivisionPage.tsx
    - src/components/pdf/PdfLotDivisionSection.tsx
    - src/components/__tests__/division.test.tsx
  modified:
    - src/types/scenario.ts
    - src/App.tsx
    - src/components/wizard/WizardShell.tsx
    - src/components/results/ResultsPage.tsx
    - src/components/pdf/pdfTypes.ts
    - src/components/pdf/extractPdfData.ts
    - src/components/pdf/PdfDocument.tsx
    - src/hooks/usePdfExport.tsx

key-decisions:
  - "WizardShell accepts onNavigate prop and threads it to ResultsPage (minimal prop drilling for 1 level)"
  - "Divide Land button uses emerald-600 style to visually distinguish from ghost action buttons"
  - "ParcelRow uses native select element for Move to... control (simplicity over custom dropdown)"
  - "Staggered reveal uses setInterval(400ms) with revealedGroupCount increment, not framer-motion staggerChildren alone"
  - "PdfLotDivisionSection uses break prop for page break hint on long division sections"
  - "usePdfExport dynamically imports divisionStore (already statically imported elsewhere, no code-split benefit)"

patterns-established:
  - "onNavigate prop threading: App -> WizardShell -> ResultsPage for cross-page navigation"
  - "Conditional PDF sections: check optional data fields before rendering section components"
  - "Gold-accented Islamic UI: bismillah header + QurahReference with border-gold-600, bg-gold-50 palette"

requirements-completed: [P9-SC1, P9-SC2, P9-SC3, P9-SC4]

duration: 4min
completed: 2026-03-13
---

# Phase 9 Plan 02: Division UI, Routing, and PDF Export Summary

**Lot division UI with gold-accented Qurah ceremony, staggered group reveal, manual parcel moves, and conditional PDF section**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T11:11:32Z
- **Completed:** 2026-03-13T11:16:00Z
- **Tasks:** 3
- **Files modified:** 16

## Accomplishments
- 6 standalone division UI components with Islamic ceremony feel (bismillah header, Qurah reference, gold accents)
- App routing for division page with onNavigate threading through WizardShell to ResultsPage
- "Divide Land" emerald button on ResultsPage visible only when properties exist
- PDF export extended with PdfLotDivisionSection showing group assignments and cash compensations
- 7 component tests covering button visibility, compensation banner, group cards, and parcel rows
- Full test suite (447 tests) green, TypeScript clean, production build successful

## Task Commits

Each task was committed atomically:

1. **Task 1: Build standalone division UI components** - `a26bd71` (feat)
2. **Task 2: App routing, WizardShell prop threading, ResultsPage button, and component tests** - `276a22e` (feat)
3. **Task 3: PDF export extension for land division section** - `a85e313` (feat)

## Files Created/Modified
- `src/components/division/QurahReference.tsx` - Gold-accented Islamic reference box with hadith citation
- `src/components/division/CompensationBanner.tsx` - Amber-themed cash compensation summary banner
- `src/components/division/ParcelRow.tsx` - Property row with BDT value and "Move to..." select control
- `src/components/division/GroupCard.tsx` - Heir group card with target/received, cash adjustment, parcel list
- `src/components/division/QurahCeremony.tsx` - Bismillah header with draw/re-draw lots button
- `src/components/division/LotDivisionPage.tsx` - Main orchestrator with staggered reveal animation
- `src/components/pdf/PdfLotDivisionSection.tsx` - PDF section for group assignments and cash compensations
- `src/components/__tests__/division.test.tsx` - 7 component tests for division UI
- `src/types/scenario.ts` - AppPage extended with 'division' variant
- `src/App.tsx` - Division page routing, onNavigate passed to WizardShell
- `src/components/wizard/WizardShell.tsx` - Accepts onNavigate prop, threads to ResultsPage
- `src/components/results/ResultsPage.tsx` - "Divide Land" button when properties exist
- `src/components/pdf/pdfTypes.ts` - PdfLotDivision and PdfLotDivisionGroup types
- `src/components/pdf/extractPdfData.ts` - Maps DivisionResult to PdfLotDivision
- `src/components/pdf/PdfDocument.tsx` - Conditionally renders PdfLotDivisionSection
- `src/hooks/usePdfExport.tsx` - Reads divisionStore and passes to extractPdfData

## Decisions Made
- WizardShell now accepts onNavigate prop (previously no props) -- minimal 1-level prop threading since only ResultsPage needs it
- "Divide Land" button uses emerald-600 bg styling to stand out from ghost action buttons in the header
- ParcelRow uses native HTML select for "Move to..." instead of a custom dropdown (per CONTEXT.md Claude discretion)
- Staggered reveal combines setInterval with revealedGroupCount increments for progressive card appearance
- PdfLotDivisionSection placed between Property Breakdown (section 4) and Steps (section 5) with break hint

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Complete division UI feature accessible from Results page via "Divide Land" button
- PDF export includes land division section when division has been computed
- All division components ready for Phase 11 drag-and-drop enhancement layer
- 447 tests passing with zero regressions

## Self-Check: PASSED

All 8 created files verified on disk. All 3 commit hashes (a26bd71, 276a22e, a85e313) verified in git log.

---
*Phase: 09-land-lot-division-and-qurah-assignment*
*Completed: 2026-03-13*
