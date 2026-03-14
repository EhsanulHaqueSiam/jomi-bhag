---
phase: quick-16
plan: 01
subsystem: pdf-export
tags: [pdf, unicode, bengali, arabic, font, gpos, sanitization]
dependency-graph:
  requires: []
  provides: [sanitizeForPdf, pdfBdtFormat, deepSanitizeStrings]
  affects: [extractPdfData, PdfPropertySection, PdfMovableAssetsSection, PdfDistributionSection, PdfSettlementSection, PdfIndividualSection]
tech-stack:
  added: []
  patterns: [deep-string-sanitization, pdf-safe-currency-formatting]
key-files:
  created:
    - src/components/pdf/__tests__/sanitizeForPdf.test.ts
  modified:
    - src/components/pdf/extractPdfData.ts
    - src/components/pdf/PdfPropertySection.tsx
    - src/components/pdf/PdfMovableAssetsSection.tsx
    - src/components/pdf/PdfDistributionSection.tsx
    - src/components/pdf/PdfSettlementSection.tsx
    - src/components/pdf/PdfIndividualSection.tsx
    - e2e/pdf-export.spec.ts
decisions:
  - "Bengali Taka symbol replaced with Tk prefix in PDF (pdfBdtFormat)"
  - "Arabic diacriticals stripped from Quran text for PDF (sanitizeArabicForPdf)"
  - "Deep sanitization applied to entire PdfData tree as safety net"
metrics:
  duration: 17min
  completed: "2026-03-14T19:46:40Z"
---

# Quick Task 16: Fix PDF xCoordinate null error (Bengali Unicode + Arabic GPOS)

Sanitize unsupported Unicode characters before @react-pdf/renderer processes text through Inter/Noto Naskh Arabic font GPOS engines, preventing null xCoordinate crashes.

## What Was Done

### Task 1: sanitizeForPdf utility and extractPdfData integration (TDD)

Created `sanitizeForPdf` function that strips characters outside supported Unicode blocks (ASCII U+0000-007F, Latin Extended U+0080-024F, Arabic U+0600-06FF). Applied to all user-entered text fields in `extractPdfData()`: property nicknames, sub-parcel names, custom asset names, individual heir display names, compensation names.

Created 15 unit tests covering Bengali stripping, Latin preservation, Arabic preservation, empty strings, space collapsing, numbers/punctuation, and pdfBdtFormat validation.

### Task 2: Playwright e2e test

Added `PDF generation succeeds with Bengali Unicode property nicknames` test that imports test-scenario.json (10 properties with Bengali nicknames), generates PDF, and asserts no xCoordinate error occurs and the PDF button re-enables.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Bengali Taka symbol crashes PDF renderer**
- **Found during:** Task 2 (Playwright test still failing after initial sanitization)
- **Issue:** BDT currency formatting uses `Intl.NumberFormat` with `narrowSymbol` which outputs the Bengali Taka sign (U+09F3), crashing Inter font's GPOS engine
- **Fix:** Created `pdfBdtFormat()` using `Tk` prefix instead of currency symbol. Replaced all 5 PDF component files' local `bdtFormat` with shared `pdfBdtFormat` from extractPdfData. Also replaced `fractionToBDT` output's Bengali taka symbol with `Tk`.
- **Files modified:** extractPdfData.ts, PdfPropertySection.tsx, PdfMovableAssetsSection.tsx, PdfDistributionSection.tsx, PdfSettlementSection.tsx, PdfIndividualSection.tsx
- **Commit:** 0ebf9f3

**2. [Rule 1 - Bug] Arabic diacriticals crash Noto Naskh Arabic font GPOS engine**
- **Found during:** Task 2 (Playwright test failing even after Bengali and BDT fixes)
- **Issue:** Arabic tashkeel marks (U+064B-065F), superscript alef (U+0670), and Quranic annotation marks (U+06D6-06ED) in Quran reference text crash the Noto Naskh Arabic font's GPOS glyph positioning engine
- **Fix:** Created `sanitizeArabicForPdf()` that strips combining marks while preserving base Arabic letters. Added `deepSanitizeStrings()` as a safety net that walks the entire PdfData tree and sanitizes all strings (Arabic text gets diacritical stripping, other text gets full script stripping, base64 data URLs are skipped).
- **Files modified:** extractPdfData.ts
- **Commit:** 0ebf9f3

## Root Cause Analysis

The previous quick tasks (13, 14, 15) targeted the wrong components (Recharts, html-to-image, DOM tooltip removal). The actual root cause was THREE sources of unsupported Unicode reaching @react-pdf/renderer's OpenType GPOS font shaping engine:

1. **Bengali property nicknames** - User-entered text like "Homestead" containing U+0980-09FF characters that Inter font cannot shape
2. **Bengali Taka currency symbol** - The BDT currency formatter produces (U+09F3) which is in the Bengali Unicode block
3. **Arabic diacritical marks** - Quran text contains combining marks (tashkeel, Quranic annotations) that crash Noto Naskh Arabic's GPOS anchor positioning

All three caused the same error: `Cannot read properties of null (reading 'xCoordinate')` in the GPOS `getAnchor` function.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 38c317d | test | Add failing tests for sanitizeForPdf utility (TDD RED) |
| 1d74850 | feat | Add sanitizeForPdf and apply to all user-text fields (TDD GREEN) |
| 0ebf9f3 | fix | Replace Bengali taka symbol, strip Arabic diacriticals, deep sanitize PdfData |
| f112292 | test | Add Playwright e2e test for Bengali Unicode PDF export |

## Verification Results

1. Unit tests: 15/15 pass (sanitizeForPdf + pdfBdtFormat)
2. Existing PDF tests: 24/24 pass (no regressions)
3. Playwright e2e: Bengali scenario PDF generates without error
4. TypeScript: Clean compilation

## Self-Check: PASSED

All 4 created/modified key files verified on disk. All 4 commit hashes verified in git log.
