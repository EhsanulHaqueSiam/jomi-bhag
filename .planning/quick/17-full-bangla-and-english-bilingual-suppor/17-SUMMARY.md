---
phase: quick-17
plan: 1
subsystem: i18n
tags: [bilingual, bangla, english, i18n, pdf, translation]
dependency-graph:
  requires: []
  provides: [i18n-system, language-switcher, bilingual-pdf]
  affects: [all-components, pdf-export]
tech-stack:
  added: [noto-sans-bengali-font]
  patterns: [react-context-i18n, language-aware-labels, bilingual-pdf]
key-files:
  created:
    - src/i18n/LanguageContext.tsx
    - src/i18n/useTranslation.ts
    - src/i18n/translations/en.ts
    - src/i18n/translations/bn.ts
    - src/i18n/translations/index.ts
    - src/assets/fonts/NotoSansBengali-Regular.ttf
  modified:
    - src/main.tsx
    - src/index.css
    - index.html
    - src/core/utils/display.ts
    - src/data/bd-land-data.ts
    - src/data/movable-asset-data.ts
    - src/components/layout/AppLayout.tsx
    - src/components/ui/StepIndicator.tsx
    - src/components/wizard/WizardShell.tsx
    - src/components/wizard/StepRelationship.tsx
    - src/components/wizard/StepFamilyAndSiblings.tsx
    - src/components/wizard/FamilyTree.tsx
    - src/components/assets/StepEstateInventory.tsx
    - src/components/results/ResultsPage.tsx
    - src/components/results/HeirCard.tsx
    - src/components/results/ModeToggle.tsx
    - src/components/results/BlockedHeirsSection.tsx
    - src/components/results/AdjustmentBanner.tsx
    - src/components/results/SpecialCaseCallout.tsx
    - src/components/results/IslamicBasisSection.tsx
    - src/components/results/StepAccordion.tsx
    - src/components/results/ChartSection.tsx
    - src/components/results/SharePieChart.tsx
    - src/components/results/MonetaryBarChart.tsx
    - src/components/results/EstateBreakdownCard.tsx
    - src/components/scenarios/ScenariosPage.tsx
    - src/components/scenarios/ScenarioCard.tsx
    - src/components/scenarios/ComparisonView.tsx
    - src/components/scenarios/EmptyState.tsx
    - src/components/distribution/DistributionPage.tsx
    - src/components/distribution/DistributionControls.tsx
    - src/components/distribution/ViewToggle.tsx
    - src/components/distribution/SummaryBanner.tsx
    - src/components/division/CompensationBanner.tsx
    - src/components/json/ImportDropZone.tsx
    - src/components/json/ImportConfirmDialog.tsx
    - src/components/pdf/pdfFonts.ts
    - src/components/pdf/pdfTypes.ts
    - src/components/pdf/extractPdfData.ts
    - src/components/pdf/PdfDocument.tsx
    - src/components/pdf/PdfHeader.tsx
    - src/components/pdf/PdfHeirTable.tsx
    - src/components/pdf/PdfDisclaimer.tsx
    - src/components/pdf/PdfStepsSection.tsx
    - src/components/pdf/PdfReferencesSection.tsx
    - src/components/pdf/PdfPropertySection.tsx
    - src/components/pdf/PdfMovableAssetsSection.tsx
    - src/hooks/usePdfExport.tsx
decisions:
  - Lightweight React Context i18n (no external library) -- appropriate for app size
  - Default language Bangla (bn) for target Bangladeshi users; English (en) for tests
  - useLanguage returns default English context when no LanguageProvider (test compatibility)
  - sanitizeForPdf is language-aware -- preserves Bengali characters for bn PDFs
  - getHeirTypeLabel/getShareTypeLabel functions added alongside HEIR_TYPE_LABELS constant (backward compat)
  - Data files use labelBn field alongside label for bilingual selection
  - Bengali PDF uses Noto Sans Bengali static font from Google Fonts CDN
metrics:
  duration: 38min
  completed: 2026-03-14T20:47:00Z
---

# Quick Task 17: Full Bangla and English Bilingual Support Summary

Context-based i18n system with complete Bangla/English translations, language switcher, and bilingual PDF export using Noto Sans Bengali font.

## What Was Done

### Task 1: i18n Infrastructure (aabfeae)
- Created `LanguageContext.tsx` with provider, `useLanguage` hook, and dot-notation `t()` function
- Created `useTranslation.ts` convenience hook with `{ t, language, setLanguage, isEn, isBn }`
- Built exhaustive translation files: `en.ts` (~350 keys) and `bn.ts` (matching structure with authentic Bangla)
- Added Noto Sans Bengali Google Font to `index.html` and CSS `--font-bengali` variable
- Downloaded static Noto Sans Bengali TTF and registered with `@react-pdf/renderer`
- Wrapped App with `LanguageProvider` in `main.tsx`, defaulting to Bangla

### Task 2: Component Integration (40c5dbe)
- Added language toggle button in AppLayout header (shows "English" when in Bangla, vice versa)
- Updated `document.documentElement.lang` dynamically on language change
- Added `getHeirTypeLabel(type, language)` and `getShareTypeLabel(type, language)` to display.ts
- Added `labelBn` to all data arrays: PROPERTY_TYPES, CONSTRUCTION_TYPES, CONDITION_OPTIONS, TREE_SPECIES, VEHICLE_TYPES, LIVESTOCK_TYPES, ASSET_CATEGORIES
- Replaced hardcoded English strings with `t()` calls across 30+ component files
- All wizard steps, results, scenarios, distribution, and JSON import components translated

### Task 3: PDF Bilingual Support (75b36ba)
- Added `language` field to `PdfData` type
- Updated `extractPdfData` to accept language parameter and use `getHeirTypeLabel`/`getShareTypeLabel`
- Made `sanitizeForPdf` language-aware: preserves Bengali Unicode range for bn PDFs
- Updated `usePdfExport` to read current language and pass to extractPdfData
- Updated all PDF components to accept language and use translated strings:
  PdfDocument (font selection), PdfHeader (title, date), PdfHeirTable (column headers),
  PdfDisclaimer (all notice text), PdfStepsSection, PdfReferencesSection,
  PdfPropertySection, PdfMovableAssetsSection
- Bengali PDF uses `Noto Sans Bengali` font; English PDF uses `Inter`
- Month names translated for date formatting in both languages
- Fixed `useLanguage` to return default English context when no provider (test compatibility)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test failures from missing LanguageProvider**
- **Found during:** Task 3 verification
- **Issue:** 107 tests failed because `useLanguage` threw when called outside `LanguageProvider`
- **Fix:** Changed `useLanguage` to return a default English context instead of throwing, so tests work without wrapping in `LanguageProvider`
- **Commit:** 75b36ba

## Verification

- `tsc --noEmit`: PASSED (0 errors)
- `vitest run`: PASSED (744/744 tests, 46/46 files)
