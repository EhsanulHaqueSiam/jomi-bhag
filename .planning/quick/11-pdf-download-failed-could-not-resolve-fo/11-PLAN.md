---
phase: quick-11
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/assets/fonts/Inter-Italic.ttf
  - src/components/pdf/pdfFonts.ts
autonomous: true
must_haves:
  truths:
    - "PDF download completes without font resolution error"
    - "Italic text renders correctly in PDF output for special cases, references, and empty states"
  artifacts:
    - path: "src/assets/fonts/Inter-Italic.ttf"
      provides: "Static Inter Italic font for PDF rendering"
    - path: "src/components/pdf/pdfFonts.ts"
      provides: "Font registration including italic variant"
      contains: "fontStyle: 'italic'"
  key_links:
    - from: "src/components/pdf/pdfFonts.ts"
      to: "src/assets/fonts/Inter-Italic.ttf"
      via: "Font.register italic entry"
      pattern: "Inter-Italic"
---

<objective>
Fix PDF download crash: "Could not resolve font for Inter, fontWeight 400, fontStyle italic"

Purpose: Four PDF components use `fontStyle: 'italic'` (PdfHeirTable, PdfReferencesSection, PdfIndividualSection, PdfDistributionSection) but only regular/semibold/bold weights are registered -- no italic variant exists. @react-pdf/renderer requires explicit font registration for every weight+style combination.

Output: Inter-Italic.ttf downloaded and registered, PDF generates without error.
</objective>

<execution_context>
@/home/siam/.claude/get-shit-done/workflows/execute-plan.md
@/home/siam/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/pdf/pdfFonts.ts
@src/components/pdf/pdfStyles.ts
@src/assets/fonts/

Existing font registration (pdfFonts.ts) registers 3 weights for Inter family:
- Inter-Regular.ttf (fontWeight: 400)
- Inter-SemiBold.ttf (fontWeight: 600)
- Inter-Bold.ttf (fontWeight: 700)

No italic variant registered. Four PDF components use `fontStyle: 'italic'`:
- PdfHeirTable.tsx:124 — special case text
- PdfReferencesSection.tsx:34 — English translation text
- PdfIndividualSection.tsx:119 — "No assets assigned" empty state
- PdfDistributionSection.tsx:106 — "No assets assigned" empty state
</context>

<tasks>

<task type="auto">
  <name>Task 1: Download Inter-Italic static TTF and register in pdfFonts</name>
  <files>src/assets/fonts/Inter-Italic.ttf, src/components/pdf/pdfFonts.ts</files>
  <action>
1. Download Inter-Italic static TTF from Google Fonts GitHub:
   `curl -L -o src/assets/fonts/Inter-Italic.ttf "https://github.com/google/fonts/raw/main/ofl/inter/static/Inter-Italic.ttf"`
   If that URL fails, try the rsms/inter GitHub release for static TTFs:
   `curl -L -o src/assets/fonts/Inter-Italic.ttf "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Italic.ttf"`
   If both fail, use fontsource npm package: `npm install @fontsource/inter` and copy the italic 400 weight TTF from node_modules.

   As a last resort, if no italic TTF can be obtained: remove all 4 `fontStyle: 'italic'` usages from the PDF components instead. This is acceptable since the italic is purely cosmetic emphasis.

2. Add italic font import and registration to pdfFonts.ts:
   ```typescript
   import InterItalic from '@/assets/fonts/Inter-Italic.ttf'
   ```
   Add to the Inter font family registration array:
   ```typescript
   { src: InterItalic, fontWeight: 400, fontStyle: 'italic' },
   ```
   This goes inside the existing `Font.register({ family: 'Inter', fonts: [...] })` call.

3. Verify the file is a valid TTF (should be ~60-70KB, similar to other Inter statics).
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx tsc --noEmit 2>&1 | head -20 && npx vitest run src/components/__tests__/pdf.test.tsx --reporter=verbose 2>&1 | tail -20</automated>
  </verify>
  <done>Inter-Italic.ttf exists in src/assets/fonts/, pdfFonts.ts imports and registers it with fontStyle 'italic' + fontWeight 400, TypeScript compiles cleanly, PDF tests pass</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes (font import resolves)
- `npx vitest run src/components/__tests__/pdf` passes (all 3 PDF test files)
- Manual: open app, create a scenario with special cases or references, click Download PDF -- should generate without "Could not resolve font" error
</verification>

<success_criteria>
PDF download works end-to-end without font resolution errors. Italic text renders in the generated PDF for special cases, Quran translations, and empty-state messages.
</success_criteria>

<output>
After completion, create `.planning/quick/11-pdf-download-failed-could-not-resolve-fo/11-SUMMARY.md`
</output>
