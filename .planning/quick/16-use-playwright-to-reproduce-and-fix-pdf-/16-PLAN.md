---
phase: quick-16
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/pdf/extractPdfData.ts
  - src/components/pdf/__tests__/sanitizeForPdf.test.ts
  - e2e/pdf-export.spec.ts
autonomous: true
requirements: [FIX-PDF-BENGALI]
must_haves:
  truths:
    - "PDF generation succeeds when property nicknames contain Bengali Unicode text"
    - "Bengali characters are stripped/replaced before reaching @react-pdf/renderer"
    - "Latin text in parentheses after Bengali text is preserved (e.g., 'Homestead' from 'বাড়ির জমি (Homestead)')"
    - "Properties without Bengali text are unaffected"
  artifacts:
    - path: "src/components/pdf/extractPdfData.ts"
      provides: "sanitizeForPdf utility function and its application to nickname/propertyName fields"
      contains: "sanitizeForPdf"
    - path: "src/components/pdf/__tests__/sanitizeForPdf.test.ts"
      provides: "Unit tests for the sanitize function"
    - path: "e2e/pdf-export.spec.ts"
      provides: "Playwright test importing Bengali scenario JSON and generating PDF without error"
  key_links:
    - from: "src/components/pdf/extractPdfData.ts"
      to: "@react-pdf/renderer"
      via: "sanitizeForPdf strips non-Latin characters before PdfData reaches renderer"
      pattern: "sanitizeForPdf"
---

<objective>
Fix the PDF xCoordinate null error caused by Bengali Unicode characters in property nicknames crashing @react-pdf/renderer's font shaping engine.

Purpose: The Inter font registered for PDF rendering does not support Bengali glyphs. When @react-pdf/renderer processes Bengali text through its OpenType GPOS table, it crashes with "Cannot read properties of null (reading 'xCoordinate')". Previous quick-13/14/15 all targeted the wrong component (Recharts/html-to-image). The actual fix must sanitize text in extractPdfData.ts before it reaches the PDF renderer.

Output: A `sanitizeForPdf` function that strips unsupported Unicode scripts, unit tests for it, and a Playwright e2e test that imports the Bengali scenario JSON and verifies PDF generation completes without error.
</objective>

<execution_context>
@/home/siam/.claude/get-shit-done/workflows/execute-plan.md
@/home/siam/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/pdf/extractPdfData.ts
@src/components/pdf/pdfFonts.ts
@src/hooks/usePdfExport.tsx
@e2e/pdf-export.spec.ts
@e2e/helpers.ts
@test-scenario.json
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create sanitizeForPdf utility and apply to extractPdfData</name>
  <files>src/components/pdf/extractPdfData.ts, src/components/pdf/__tests__/sanitizeForPdf.test.ts</files>
  <behavior>
    - sanitizeForPdf("বাড়ির জমি (Homestead)") returns "(Homestead)" (Bengali stripped, Latin preserved)
    - sanitizeForPdf("ধানের জমি (Paddy Field - Big)") returns "(Paddy Field - Big)"
    - sanitizeForPdf("Regular English Text") returns "Regular English Text" (unchanged)
    - sanitizeForPdf("") returns "" (empty string unchanged)
    - sanitizeForPdf("Mixed বাংলা and English") returns "Mixed and English" (only Bengali removed, extra spaces collapsed)
    - sanitizeForPdf("আমবাগান (Mango Orchard)") returns "(Mango Orchard)"
    - sanitizeForPdf preserves numbers, punctuation: "Plot #3 - 500sqft" unchanged
    - sanitizeForPdf preserves Arabic text since Noto Naskh Arabic font is registered (Arabic range U+0600-U+06FF)
  </behavior>
  <action>
    1. Create a `sanitizeForPdf` function in `extractPdfData.ts` (exported for testing). The function should:
       - Keep ASCII characters (U+0000-U+007F) -- Latin letters, numbers, punctuation
       - Keep Latin Extended (U+0080-U+024F) -- accented characters
       - Keep Arabic (U+0600-U+06FF) -- Noto Naskh Arabic font supports these
       - Strip all other Unicode blocks (Bengali U+0980-U+09FF, Devanagari, CJK, etc.)
       - Collapse multiple spaces into single space
       - Trim leading/trailing whitespace
       - Use regex: `str.replace(/[^\u0000-\u024F\u0600-\u06FF]/g, '').replace(/\s{2,}/g, ' ').trim()`

    2. Apply `sanitizeForPdf()` to all user-provided text fields in `extractPdfData()`:
       - Line 133: `nickname: sanitizeForPdf(prop.nickname)`
       - Line 263: `propertyName: sanitizeForPdf(prop.nickname)`
       - Line 183 (subParcel name): `name: sanitizeForPdf(sp.name)` -- subparcel names could also be user-entered Bengali
       - Line 60 (custom asset name): `return sanitizeForPdf(asset.name || 'Custom Item')` in getAssetItemName
       - Line 356 (individual displayName): `displayName: sanitizeForPdf(displayName)`
       - Line 357 (subtitle): `subtitle: subtitle ? sanitizeForPdf(subtitle) : null`
       - Line 379-380 (compensation names): `fromName: sanitizeForPdf(...)`, `toName: sanitizeForPdf(...)`

    3. Create unit test file `src/components/pdf/__tests__/sanitizeForPdf.test.ts` with tests for the behavior cases above. Import `sanitizeForPdf` directly from `extractPdfData.ts`.

    4. Do NOT touch `usePdfExport.tsx` -- the DOM tooltip removal code from quick-15 in captureCharts() is still useful for the separate Recharts tooltip cloning issue during html-to-image capture. That fix targets a different bug.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/components/pdf/__tests__/sanitizeForPdf.test.ts</automated>
  </verify>
  <done>sanitizeForPdf function exists and is applied to all user-text fields in extractPdfData. All unit tests pass: Bengali stripped, Latin preserved, Arabic preserved, empty strings handled, spaces collapsed.</done>
</task>

<task type="auto">
  <name>Task 2: Add Playwright e2e test that reproduces Bengali scenario PDF export</name>
  <files>e2e/pdf-export.spec.ts</files>
  <action>
    Add a new test to the existing `e2e/pdf-export.spec.ts` file that:

    1. Imports the test-scenario.json (which has Bengali property nicknames) via the JSON import mechanism:
       - Navigate to `/`
       - Find the `input[type="file"][accept*=".json"]` element on step 1
       - Use `page.locator('input[type="file"]').setInputFiles('test-scenario.json')` to import the file
       - Wait for the import confirmation dialog and click the accept/confirm button
       - Wait for results page to load (the imported scenario should auto-navigate or the user clicks Calculate)

    2. Click "Download PDF" button

    3. Assert that:
       - No console error containing "xCoordinate" appears (listen for `page.on('pageerror')`)
       - The PDF button re-enables within 45 seconds (generation completes successfully)
       - No error toast/message appears on screen

    Test name: `'PDF generation succeeds with Bengali Unicode property nicknames'`

    Use `test.setTimeout(60000)` since PDF generation is slow. Follow existing test patterns from the file (clearPersistedState in beforeEach, similar assertion style).

    Listen for page errors BEFORE triggering the PDF generation:
    ```typescript
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    ```
    After PDF generation completes, assert `errors.filter(e => e.includes('xCoordinate')).length` is 0.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx playwright test e2e/pdf-export.spec.ts --project=chromium --timeout=60000</automated>
  </verify>
  <done>Playwright test imports Bengali scenario JSON, generates PDF without xCoordinate error, and PDF button re-enables (generation completes successfully).</done>
</task>

</tasks>

<verification>
1. Unit tests pass: `npx vitest run src/components/pdf/__tests__/sanitizeForPdf.test.ts`
2. Existing PDF unit tests still pass: `npx vitest run src/components/__tests__/pdf.test.tsx src/hooks/__tests__/usePdfExport.test.ts`
3. Playwright e2e test passes: `npx playwright test e2e/pdf-export.spec.ts --project=chromium`
4. TypeScript compiles: `npx tsc --noEmit`
</verification>

<success_criteria>
- PDF generation with Bengali-nicknamed properties completes without xCoordinate crash
- Bengali text is stripped from PDF output; parenthesized English labels are preserved
- Arabic text remains intact (Noto Naskh Arabic font supports it)
- All existing tests continue to pass
- Playwright e2e confirms end-to-end fix with real Bengali scenario data
</success_criteria>

<output>
After completion, create `.planning/quick/16-use-playwright-to-reproduce-and-fix-pdf-/16-SUMMARY.md`
</output>
