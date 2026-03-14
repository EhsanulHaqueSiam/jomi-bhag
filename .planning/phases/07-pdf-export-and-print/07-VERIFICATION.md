---
phase: 07-pdf-export-and-print
verified: 2026-03-13T13:16:00Z
status: human_needed
score: 3/3 truths verified (automated checks passed)
re_verification: false
human_verification:
  - test: "Download PDF generates a valid file"
    expected: "Clicking Download PDF produces jomi-bhag-inheritance-report-YYYY-MM-DD.pdf with all 7 sections: header, heir table, chart images, property breakdown, calculation steps, Islamic references with Arabic text, disclaimer"
    why_human: "PDF rendering with @react-pdf/renderer requires a browser environment; automated tests mock the renderer and cannot validate actual PDF content, Arabic font rendering, or correct page breaks"
  - test: "Arabic Quranic text renders as Arabic script (not boxes or gibberish)"
    expected: "Noto Naskh Arabic font loads correctly and Arabic text in the References section is readable"
    why_human: "Font loading from TTF assets and RTL text rendering can only be visually confirmed in actual PDF output"
  - test: "Print button opens browser print dialog with PDF content"
    expected: "Clicking Print creates a hidden iframe, loads the PDF, and triggers window.print(); the print dialog shows the PDF, not a blank page"
    why_human: "Print dialog behavior requires a browser with a print system; cannot simulate iframe onload + window.print() in jsdom"
  - test: "Spinner appears during PDF generation (non-blocking UX)"
    expected: "isGenerating=true disables both buttons and shows a spin animation on the Download PDF button icon; buttons re-enable when done"
    why_human: "Async state transitions during PDF generation require real timing which vitest/jsdom tests skip via mock resolution"
  - test: "Shares-only mode (no properties entered)"
    expected: "PDF generates without property section and without bar chart; pie chart still appears; no BDT columns in heir table"
    why_human: "Conditional section rendering (PdfPropertySection returns null, PdfChartSection hides barChart) requires visual inspection of actual PDF"
  - test: "Mobile responsive button layout"
    expected: "At 375px viewport, Download PDF and Print buttons show icons only (span.hidden.sm:inline text hidden); no text overflow"
    why_human: "Responsive CSS visibility requires a real browser viewport"
---

# Phase 7: PDF Export and Print - Verification Report

**Phase Goal:** Users can download or print a complete inheritance division report with formal legal document layout
**Verified:** 2026-03-13T13:16:00Z
**Status:** human_needed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can download a PDF report containing heir breakdown, property details, share allocations, and Quranic references | VERIFIED | `usePdfExport.tsx` — `downloadPdf()` calls `generatePdfBlob()` which dynamically imports `PdfDocument` + `extractPdfData`, calls `pdf(<PdfDocument data={pdfData} />).toBlob()`, then triggers anchor download. `PdfDocument.tsx` assembles all 7 sections including `PdfHeirTable`, `PdfPropertySection`, `PdfReferencesSection`. |
| 2 | The PDF includes a disclaimer about consulting a lawyer for legal registration | VERIFIED | `PdfDisclaimer.tsx` exports `LEGAL_NOTICE = 'This report is for informational purposes only. Consult a qualified lawyer before using for legal registration or property transfer.'` — all 4 required paragraphs rendered in a bordered box. 4 disclaimer tests pass in `pdf.test.tsx`. |
| 3 | The app provides print-friendly output with clean layout | VERIFIED | `usePdfExport.tsx` — `printPdf()` generates same PDF blob as download, creates hidden iframe, triggers `iframe.contentWindow?.print()`. ResultsPage has Download PDF and Print buttons wired to `usePdfExport`. All buttons disabled while `isGenerating=true`. |

**Score:** 3/3 truths verified (automated)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/pdf/PdfDocument.tsx` | Root PDF document assembling all sections | VERIFIED | 60 lines. Imports and renders all 7 section components in order: PdfHeader, PdfHeirTable, PdfChartSection, PdfPropertySection, PdfStepsSection, PdfReferencesSection, PdfDisclaimer. Fixed footer with page numbers. `export function PdfDocument` confirmed. |
| `src/components/pdf/pdfTypes.ts` | PdfData interface for all data the PDF needs | VERIFIED | Exports `PdfData`, `PdfShareRow`, `PdfReference`, `PdfProperty`. All fields present per plan spec. 65 lines. |
| `src/components/pdf/extractPdfData.ts` | Transforms FaraidOutput to serializable PdfData | VERIFIED | 105 lines. Imports `FaraidOutput` from `@/core/faraid/types`, `computePropertyTotal` from land types, `fractionToString/Percent/BDT` from display utils, `getAllReferences` from references module. Filters active shares, maps blocked heirs to display labels, computes property totals. Pure function — no hooks. |
| `src/components/pdf/pdfFonts.ts` | Font.register for Inter + Noto Naskh Arabic | VERIFIED | Registers `Inter` family with 3 weights (400/600/700) and `Noto Naskh Arabic` with weight 400. Imports all 4 TTF assets via Vite path aliases. |
| `src/components/pdf/pdfStyles.ts` | A4 page styles, table, disclaimer, Arabic RTL | VERIFIED | `StyleSheet.create` with all required style keys: page (A4 padding + Inter fontFamily), footer, sectionHeading, tableHeaderRow, tableRow, alternatingRow, tableCell, disclaimerBox (backgroundColor: '#fefce8'), arabicText (fontFamily: 'Noto Naskh Arabic', direction: 'rtl'). |
| `src/components/pdf/pdfColors.ts` | Ink-friendly grayscale palette | VERIFIED | Exports `INK_FRIENDLY_COLORS` (8-element grayscale array) and `INK_FRIENDLY_STROKE` ('#333333'). |
| `src/components/pdf/PdfHeirTable.tsx` | Heir table with Awl/Radd handling | VERIFIED | 133 lines. Renders `AdjustmentBanner` for awl/radd, standard header row (7 cols), BDT columns conditionally shown when `totalEstateValue > 0`, alternating row colors. Iterates `data.activeShares`. |
| `src/components/pdf/PdfDisclaimer.tsx` | 4 disclaimer paragraphs + generation metadata | VERIFIED | Exports 4 named constants (`LEGAL_NOTICE`, `ISLAMIC_NOTICE`, `SCOPE_NOTICE`, `VALUES_NOTICE`). Generation metadata line "Generated on {dateStr} at {timeStr} by Jomi-Bhag (jomi-bhag.netlify.app)". |
| `src/components/pdf/PdfReferencesSection.tsx` | Islamic references with Arabic RTL text | VERIFIED | Groups Quran first then Hadith. Applies `styles.arabicText` (fontFamily: 'Noto Naskh Arabic', direction: 'rtl') for `ref.arabicText`. Separator lines between entries. |
| `src/components/pdf/PdfChartSection.tsx` | Pie and bar chart image embedding | VERIFIED | Accepts `pieChartImage` and `barChartImage` props. Returns null if neither exists. Uses `<Image>` component from @react-pdf/renderer. |
| `src/components/pdf/PdfPropertySection.tsx` | Property breakdown per-property | VERIFIED | Returns null when properties array empty. Renders property nickname, type, location, rate source badge, land/house/trees/pond values, per-property total, overall estate total. |
| `src/components/pdf/PdfStepsSection.tsx` | Numbered calculation steps | VERIFIED | Renders step number bold, description, and detail for each step. |
| `src/components/pdf/PdfHeader.tsx` | App name, report title, generation date | VERIFIED | "Jomi-Bhag" at fontSize 20, "Islamic Inheritance Division Report" at 16, generation date, horizontal rule. |
| `src/assets/fonts/Inter-Regular.ttf` | Inter Regular 400 TTF | VERIFIED | 67KB file present. |
| `src/assets/fonts/Inter-SemiBold.ttf` | Inter SemiBold 600 TTF | VERIFIED | 67KB file present. |
| `src/assets/fonts/Inter-Bold.ttf` | Inter Bold 700 TTF | VERIFIED | 67KB file present. |
| `src/assets/fonts/NotoNaskhArabic-Regular.ttf` | Noto Naskh Arabic Regular TTF | VERIFIED | 178KB file present (sourced from GitHub googlefonts/noto-fonts, not gstatic). |
| `src/hooks/usePdfExport.tsx` | Hook orchestrating chart capture, generation, download, print | VERIFIED | 97 lines. Exports `usePdfExport()` returning `{ downloadPdf, printPdf, isGenerating }`. All @react-pdf imports are lazy via `Promise.all([import(...)])`. Chart capture via `document.getElementById('pdf-pie-chart')` + `toPng`. Download via anchor click; print via hidden iframe + `onload`. |
| `src/components/results/ResultsPage.tsx` | Results page with Download PDF and Print buttons | VERIFIED | Imports `usePdfExport`. Destructures `{ downloadPdf, printPdf, isGenerating }`. Both buttons in header bar, disabled when `isGenerating`, spinner shown on Download PDF. Print button placed before ModeToggle. |
| `src/components/results/SharePieChart.tsx` | Chart with stable DOM ID for capture | VERIFIED | Outer div has `id="pdf-pie-chart"`. |
| `src/components/results/MonetaryBarChart.tsx` | Chart with stable DOM ID for capture | VERIFIED | Outer div has `id="pdf-bar-chart"`. |
| `src/components/__tests__/pdf.test.tsx` | Tests for data extraction, disclaimer, button rendering | VERIFIED | 18 tests, all passing. Covers: extractPdfData basic transform, Awl adjustment, no properties, blocked heirs, property mapping, disclaimer content constants, ResultsPage button rendering (3 integration tests). |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `extractPdfData.ts` | `src/core/faraid/types.ts` | `import type { FaraidOutput }` | WIRED | Line 1: `import type { FaraidOutput } from '@/core/faraid/types'` |
| `PdfDocument.tsx` | `pdfFonts.ts` | side-effect import | WIRED | Line 2: `import './pdfFonts'` — font registration runs before render |
| `PdfReferencesSection.tsx` | `pdfFonts.ts` (Noto Naskh Arabic) | `styles.arabicText` fontFamily | WIRED | `pdfStyles.ts` line 77: `fontFamily: 'Noto Naskh Arabic'`; `PdfReferencesSection.tsx` uses `styles.arabicText` |
| `usePdfExport.tsx` | `PdfDocument.tsx` | dynamic import | WIRED | Line 39: `import('@/components/pdf/PdfDocument')` inside `generatePdfBlob()` |
| `usePdfExport.tsx` | `extractPdfData.ts` | dynamic import | WIRED | Line 40: `import('@/components/pdf/extractPdfData')` inside `generatePdfBlob()` |
| `usePdfExport.tsx` | `html-to-image` | `toPng` call | WIRED | Lines 14, 20, 23: `const { toPng } = await import('html-to-image')`, result assigned to `pieChartImage`/`barChartImage` |
| `ResultsPage.tsx` | `usePdfExport.tsx` | hook consumption | WIRED | Line 2: `import { usePdfExport } from '@/hooks/usePdfExport'`; line 21: `const { downloadPdf, printPdf, isGenerating } = usePdfExport()` used in button onClick handlers |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| OUTP-01 | 07-01-PLAN.md, 07-02-PLAN.md | App generates downloadable PDF report with heir breakdown, property details, shares, and Quranic references | SATISFIED | `PdfDocument` assembles all 7 sections including heir table, property breakdown, references. `usePdfExport.downloadPdf()` generates and downloads with correct filename pattern. `extractPdfData` transforms all data including references. |
| OUTP-02 | 07-02-PLAN.md | App provides print-friendly output with clean layout | SATISFIED | `usePdfExport.printPdf()` generates same PDF blob as download and triggers `window.print()` via hidden iframe. PDF uses A4 page size, `break` props for section page-break hints, no UI chrome (pure @react-pdf/renderer primitives). |
| OUTP-03 | 07-01-PLAN.md, 07-02-PLAN.md | PDF includes disclaimer about consulting a lawyer for legal registration | SATISFIED | `PdfDisclaimer.tsx` exports `LEGAL_NOTICE` = 'This report is for informational purposes only. Consult a qualified lawyer before using for legal registration or property transfer.' Verified by 4 passing disclaimer tests. |

All 3 OUTP requirements for Phase 7 are satisfied. No orphaned requirements — REQUIREMENTS.md traceability table maps OUTP-01, OUTP-02, OUTP-03 exclusively to Phase 7.

### Anti-Patterns Found

None detected.

- No TODO/FIXME/PLACEHOLDER comments in any PDF or hook file
- No empty implementations (`return null` in `AdjustmentBanner` and `PdfChartSection` are correct conditional guards, not stubs)
- No console.log-only handlers
- TypeScript compiles without errors (`npx tsc --noEmit` exits 0)

### Human Verification Required

All automated checks pass. The following items require human testing in a real browser because they depend on actual PDF rendering, font loading, browser print APIs, and visual layout:

#### 1. PDF Download Produces Valid Complete Document

**Test:** Run `npm run dev`, navigate wizard to Results, click "Download PDF"
**Expected:** File `jomi-bhag-inheritance-report-2026-03-13.pdf` downloads. Opening it shows: (a) Header with "Jomi-Bhag" + "Islamic Inheritance Division Report" + date, (b) Heir Share Allocation table with columns, (c) Chart images embedded, (d) Property breakdown, (e) Step-by-step calculation, (f) Islamic references, (g) Disclaimer with all 4 paragraphs, (h) Page numbers in footer
**Why human:** @react-pdf/renderer is fully mocked in tests; actual PDF generation and content validation requires a browser

#### 2. Arabic Text Renders Correctly

**Test:** In the downloaded PDF, inspect the "Islamic Basis" section
**Expected:** Arabic Quranic text appears as readable Arabic script with RTL layout, not as boxes or question marks
**Why human:** Font loading from `NotoNaskhArabic-Regular.ttf` and PDF font embedding can silently fail; only visual inspection reveals this

#### 3. Print Dialog Opens With PDF Content

**Test:** Click the "Print" button in the Results page header
**Expected:** Browser print dialog opens; preview shows the inheritance report PDF, not a blank page
**Why human:** Hidden iframe + `iframe.onload` + `window.print()` pattern requires a real browser environment; jsdom cannot execute this

#### 4. Loading Spinner Appears During Generation

**Test:** Click "Download PDF" or "Print" and observe the button state during generation
**Expected:** Download PDF button icon switches to a spinning circle; both buttons become disabled; after download/print, buttons return to normal state
**Why human:** Async state transitions during PDF generation happen faster than test resolution can observe without real network timing

#### 5. Shares-Only Mode (No Properties Entered)

**Test:** Navigate wizard without entering any properties; on Results page, click "Download PDF"
**Expected:** PDF generates successfully. Property Breakdown section is absent. Bar chart is absent (no estate value). Pie chart still present. Heir table shows shares without Per-Heir BDT and Total BDT columns.
**Why human:** Conditional section omission (`PdfPropertySection` returns null, `PdfChartSection` hides bar image) requires actual PDF inspection to confirm

#### 6. Mobile Button Layout (Icons Only)

**Test:** Open DevTools, set viewport to 375px width, navigate to Results page
**Expected:** Download PDF and Print buttons show only their SVG icons; the `<span className="hidden sm:inline">` text labels are hidden; no text overflow or layout break
**Why human:** Responsive CSS (Tailwind `hidden sm:inline`) requires a real browser viewport; jsdom renders all elements regardless of responsive classes

### Gaps Summary

No gaps found. All automated checks passed:
- 18/18 PDF tests pass
- TypeScript compiles cleanly (0 errors)
- All 7 PDF section components exist and are substantive
- All 4 TTF font files present at expected paths
- usePdfExport hook exports correct API, fully wired to ResultsPage
- All 3 OUTP requirements covered by implementations
- No anti-patterns detected

The phase is pending human verification for browser-dependent behaviors (PDF content quality, Arabic rendering, print dialog, spinner UX, mobile layout).

---

_Verified: 2026-03-13T13:16:00Z_
_Verifier: Claude (gsd-verifier)_
