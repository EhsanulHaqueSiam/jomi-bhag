# Phase 7: PDF Export and Print - Research

**Researched:** 2026-03-13
**Domain:** Client-side PDF generation with React, font embedding, chart-to-image conversion
**Confidence:** HIGH

## Summary

Phase 7 adds downloadable PDF reports and browser print functionality to the Jomi-Bhag inheritance calculator. The PDF is a formal legal-grade document (not a screen capture) containing heir share tables, embedded chart images, property breakdowns, step-by-step calculations, Quranic references with Arabic text, and a legal disclaimer. The app already has all computation logic and data structures in place from Phases 1-6; this phase purely consumes existing engine output and renders it into a PDF document.

The primary technical challenge is threefold: (1) building a complete PDF document layout with `@react-pdf/renderer` using its React-like component model, (2) converting Recharts SVG charts to static PNG images for PDF embedding, and (3) embedding Arabic text (Noto Naskh Arabic font) for Quranic references with proper RTL direction. Arabic rendering in `@react-pdf/renderer` v4.x has known issues (open GitHub issue #2638), but the workaround of registering the correct TTF font with explicit RTL direction styling is documented and functional for basic Arabic text display.

**Primary recommendation:** Use `@react-pdf/renderer` v4.3.x with lazy-loaded PDF components (React.lazy + dynamic import) to avoid the ~450KB bundle size impact on initial page load. Convert Recharts charts to PNG using `html-to-image` (lighter and more reliable than html2canvas for SVG content). Bundle Noto Naskh Arabic and Inter TTF font files locally rather than loading from Google Fonts CDN at render time.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- PDF always generates full detailed content regardless of user's current Simple/Detailed mode
- Charts included: pie chart (share distribution) + bar chart (monetary comparison) rendered as images in PDF
- Quranic references fully expanded per heir: Arabic text (Noto Naskh Arabic) + English translation
- Full property breakdown with all sub-details per property
- Blocked heirs included with explanation
- When Awl/Radd applied: show both original and adjusted shares
- Step-by-step calculation explanation included
- Islamic Basis section with all unique Quran/Hadith references
- Formal legal document style, NOT matching app's modern card aesthetic
- Header: "Jomi-Bhag" + "Islamic Inheritance Division Report" + date on first page
- Footer: page numbers only ("Page 1 of 4") on every page
- Heir share data in table format with specific columns (Heir Type, Count, Fraction, Percentage, Per-Heir BDT, Total BDT, Share Type)
- When Awl/Radd: additional "Original Share" and "Adjusted Share" columns with explanation banner
- Section order: Header > Heir table > Charts > Property breakdown > Calculation steps > Islamic references > Disclaimer
- Download and Print as two separate buttons in Results page header bar
- Download filename: `jomi-bhag-inheritance-report-YYYY-MM-DD.pdf`
- Print renders same PDF layout in new window/iframe and triggers browser print dialog
- Button shows spinner while PDF generates (non-blocking)
- Charts use lighter fills and thin outlines for B&W ink-friendly printing
- A4 paper size
- Edge cases: no-properties generates shares-only PDF; single heir generates normally; blocked heirs included
- Disclaimer at end with 4 areas: Legal, Islamic (Hanafi), Scope (parents deceased), Values (user estimates)
- Generation metadata at bottom: date, time, app URL
- No copy protection, no watermark
- Quality prioritized over file size

### Claude's Discretion
- PDF library choice (@react-pdf/renderer suggested, open to alternatives)
- Chart-to-image conversion approach
- Exact font choices for formal document (serif vs sans-serif body)
- Table styling details (borders, alternating rows, column widths)
- Exact spacing, margins, typography
- Page break fine-tuning
- Loading spinner design in download button
- Mobile button layout (icons only vs text) if header gets crowded

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| OUTP-01 | App generates downloadable PDF report with heir breakdown, property details, shares, and Quranic references | @react-pdf/renderer Document/Page/View/Text/Image components with usePDF hook for blob generation; Font.register for Noto Naskh Arabic TTF; chart-to-image via html-to-image |
| OUTP-02 | App provides print-friendly output with clean layout | Same PDF rendered via hidden iframe + window.print() pattern; A4 page size; ink-friendly chart colors |
| OUTP-03 | PDF includes disclaimer about consulting a lawyer for legal registration | Dedicated View section at end of PDF with bordered box styling using @react-pdf/renderer border/padding primitives |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-pdf/renderer | ^4.3.2 | PDF document generation using React components | Only mature React-native PDF library; declarative component model matches project patterns; supports custom fonts, images, flexbox layout, page wrapping |
| html-to-image | ^1.11.x | Convert DOM elements (Recharts SVG charts) to PNG data URLs | Lighter than html2canvas (~3KB vs ~40KB gzip); better SVG rendering; promise-based API; no canvas intermediate step |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-pdf/font | (bundled) | Font registration API for custom TTF/WOFF fonts | Included with @react-pdf/renderer; used for Noto Naskh Arabic and Inter font registration |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | jsPDF + html2canvas | jsPDF is lower-level (manual coordinate positioning), no React component model, html2canvas creates raster screenshots (blurry text, not searchable). @react-pdf/renderer produces vector text PDFs with proper font embedding. |
| @react-pdf/renderer | pdfmake | pdfmake uses JSON-based document definition (not React components), larger bundle, less natural for React projects. |
| html-to-image | recharts-to-png | recharts-to-png wraps html2canvas (40KB); html-to-image is lighter and handles SVG better. recharts-to-png adds unnecessary abstraction. |
| html-to-image | html2canvas | html2canvas is larger, known issues with SVG rendering, produces blurrier output for chart elements. |

**Installation:**
```bash
npm install @react-pdf/renderer html-to-image
```

**Note on bundle size:** @react-pdf/renderer adds ~450KB (minified, gzipped) to the bundle. This MUST be lazy-loaded via dynamic import + React.lazy to avoid impacting initial page load time.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── results/
│   │   ├── ResultsPage.tsx          # Add Download PDF + Print buttons
│   │   └── ...existing components
│   └── pdf/
│       ├── PdfDocument.tsx           # Root @react-pdf Document component
│       ├── PdfHeirTable.tsx          # Heir share table (the core data table)
│       ├── PdfPropertySection.tsx    # Property breakdown section
│       ├── PdfStepsSection.tsx       # Calculation steps listing
│       ├── PdfReferencesSection.tsx  # Islamic references with Arabic text
│       ├── PdfChartSection.tsx       # Embedded chart images
│       ├── PdfDisclaimer.tsx         # Legal/Islamic disclaimer box
│       ├── PdfHeader.tsx             # Document header with title and date
│       ├── PdfFooter.tsx             # Page numbers (fixed on every page)
│       ├── pdfFonts.ts              # Font.register calls for Inter + Noto Naskh Arabic
│       ├── pdfStyles.ts             # StyleSheet.create with all document styles
│       └── pdfColors.ts             # Ink-friendly color palette for charts
├── hooks/
│   └── usePdfExport.ts              # Hook: chart capture + PDF generation + download/print
└── assets/
    └── fonts/
        ├── Inter-Regular.ttf         # Body text font
        ├── Inter-SemiBold.ttf        # Headings font
        ├── Inter-Bold.ttf            # Table headers, emphasis
        └── NotoNaskhArabic-Regular.ttf  # Arabic Quranic text
```

### Pattern 1: Lazy-Loaded PDF Module
**What:** All @react-pdf/renderer imports isolated in `src/components/pdf/` directory; loaded via dynamic import only when user clicks Download or Print
**When to use:** Always -- prevents 450KB from landing in the initial bundle
**Example:**
```typescript
// In usePdfExport.ts or ResultsPage.tsx
async function generatePdf(data: PdfData): Promise<Blob> {
  const { pdf } = await import('@react-pdf/renderer')
  const { PdfDocument } = await import('@/components/pdf/PdfDocument')
  const blob = await pdf(<PdfDocument data={data} />).toBlob()
  return blob
}
```

### Pattern 2: Chart-to-Image Capture Before PDF Generation
**What:** Capture Recharts SVG charts as PNG data URLs BEFORE generating the PDF document, then pass image strings as props to PdfDocument
**When to use:** Always -- @react-pdf/renderer cannot render Recharts components; charts must be pre-converted to images
**Example:**
```typescript
import { toPng } from 'html-to-image'

async function captureCharts(): Promise<{ pieChart: string | null; barChart: string | null }> {
  const pieEl = document.getElementById('pdf-pie-chart')
  const barEl = document.getElementById('pdf-bar-chart')

  const pieChart = pieEl ? await toPng(pieEl, { pixelRatio: 2 }) : null
  const barChart = barEl ? await toPng(barEl, { pixelRatio: 2 }) : null

  return { pieChart, barChart }
}
```

### Pattern 3: Data Extraction Layer (Decouple from Zustand)
**What:** Extract all PDF data from the Zustand store into a plain serializable object BEFORE passing to the PDF component. PDF components receive props, not store access.
**When to use:** Always -- @react-pdf/renderer runs in its own rendering context and cannot access React hooks/context from the main app
**Example:**
```typescript
interface PdfData {
  shares: ShareResult[]
  activeShares: ShareResult[]
  adjustment: AdjustmentType
  totalBeforeAdjustment: Fraction
  blockedHeirs: FaraidOutput['blockedHeirs']
  specialCases: string[]
  steps: CalculationStep[]
  references: IslamicReference[]
  totalEstateValue: number
  properties: Property[]
  pieChartImage: string | null
  barChartImage: string | null
  generatedAt: Date
}
```

### Pattern 4: Print via Hidden Iframe with Blob URL
**What:** For the Print button, generate the same PDF blob, create an Object URL, embed in a hidden iframe, and trigger `window.print()` on the iframe
**When to use:** Print button click
**Example:**
```typescript
async function printPdf(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob)
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  document.body.appendChild(iframe)
  iframe.onload = () => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    // Cleanup after print dialog closes
    setTimeout(() => {
      document.body.removeChild(iframe)
      URL.revokeObjectURL(url)
    }, 1000)
  }
}
```

### Anti-Patterns to Avoid
- **Importing @react-pdf/renderer at top level:** Kills initial bundle size. Always dynamic import.
- **Trying to render Recharts inside PDF:** @react-pdf/renderer has its own rendering engine; DOM-based React components cannot be used inside PDF documents. Charts MUST be pre-captured as images.
- **Using Zustand hooks inside PDF components:** PDF components run in @react-pdf's internal renderer, not the browser DOM. Pass all data as props.
- **Using Google Fonts CSS URL for Font.register:** Must use direct TTF file URL (fonts.gstatic.com) or local TTF file, not the CSS stylesheet URL.
- **Using OpenType Variable fonts:** PDF 2.0 spec does not support variable fonts. Must use static weight TTF files.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF generation | Manual canvas/blob manipulation | @react-pdf/renderer | Font embedding, page wrapping, flexbox layout, vector text -- hundreds of edge cases |
| Chart to image | Manual SVG serialization + canvas drawing | html-to-image `toPng()` | Handles SVG foreignObject, CSS computed styles, cross-browser quirks |
| Page numbering | Manual page count tracking | @react-pdf render prop `{pageNumber}/{totalPages}` | Built-in, handles dynamic content reflow |
| Font subsetting | Manual glyph extraction | @react-pdf/fontkit (bundled) | Automatic subsetting for embedded fonts |
| RTL text direction | Manual character reordering | `direction: 'rtl'` style + proper font | @react-pdf handles bidi internally |

**Key insight:** PDF generation is deceptively complex. Font embedding alone (subsetting, encoding, glyph mapping) would take weeks to implement correctly. @react-pdf/renderer wraps all of this behind a React-like component API.

## Common Pitfalls

### Pitfall 1: Bundle Size Explosion
**What goes wrong:** Importing @react-pdf/renderer in a component that loads on initial page render adds ~450KB gzipped to the main bundle
**Why it happens:** The library includes its own layout engine, font subsetting, PDF serialization, and compression
**How to avoid:** Use dynamic `import()` wrapped in an async function; only trigger on button click; optionally wrap in React.lazy for the PDF preview component
**Warning signs:** Vite build output shows main chunk > 500KB; Lighthouse performance score drops

### Pitfall 2: Arabic Text Rendering Issues
**What goes wrong:** Arabic characters render as gibberish, undefined glyphs, or with incorrect spacing
**Why it happens:** @react-pdf/renderer v4.x has known issues with Arabic character shaping (GitHub issue #2638, open). The bidi support introduced in PR #2600 broke some Arabic rendering.
**How to avoid:** Register Noto Naskh Arabic TTF font explicitly with Font.register; use static (non-variable) font weight; set `direction: 'rtl'` and `textAlign: 'right'` on Arabic text containers; test Arabic output early in development
**Warning signs:** Arabic text appears as boxes or random symbols in generated PDF

### Pitfall 3: Charts Not Appearing in PDF
**What goes wrong:** Empty space where charts should be, or broken image icons
**Why it happens:** Attempting to use Recharts components inside @react-pdf Document (impossible -- different renderers), or capturing charts before they're fully rendered in the DOM
**How to avoid:** Capture charts as PNG data URLs BEFORE initiating PDF generation; verify the data URL is non-null before passing to Image component; use `pixelRatio: 2` for crisp rendering
**Warning signs:** PDF generates but chart areas are blank

### Pitfall 4: Font Loading Race Condition
**What goes wrong:** PDF generates before fonts are loaded, resulting in fallback Helvetica text
**Why it happens:** Font.register with remote URLs is async; PDF generation can start before fonts download
**How to avoid:** Bundle TTF files locally (imported as static assets via Vite); call Font.register at module level (runs once on import); fonts resolve synchronously from local files
**Warning signs:** First PDF generation shows Helvetica; subsequent ones show correct fonts

### Pitfall 5: Page Break Splitting Tables
**What goes wrong:** Heir table gets split across pages with orphaned header or single row on new page
**Why it happens:** Default wrapping algorithm doesn't know about table semantics
**How to avoid:** Use `wrap={false}` on small table-like Views (keeps them together on one page); for large tables, use `minPresenceAhead` prop; use `break` prop to force page breaks before major sections
**Warning signs:** Tables split awkwardly in multi-heir scenarios

### Pitfall 6: Print Dialog Not Opening
**What goes wrong:** Iframe loads but print dialog doesn't appear, or content is blank
**Why it happens:** Cross-origin restrictions on blob URLs in some browsers; iframe content not fully loaded when print() is called
**How to avoid:** Use `onload` event on iframe before calling print(); ensure blob URL is same-origin (it will be for locally generated blobs); add timeout cleanup for iframe removal
**Warning signs:** Print button appears to do nothing; works in Chrome but not Safari

## Code Examples

Verified patterns from official sources:

### Font Registration (Local TTF Files)
```typescript
// Source: https://react-pdf.org/fonts
import { Font } from '@react-pdf/renderer'

// Import TTF files as static assets (Vite resolves to URL)
import InterRegular from '@/assets/fonts/Inter-Regular.ttf'
import InterSemiBold from '@/assets/fonts/Inter-SemiBold.ttf'
import InterBold from '@/assets/fonts/Inter-Bold.ttf'
import NotoNaskhArabic from '@/assets/fonts/NotoNaskhArabic-Regular.ttf'

Font.register({
  family: 'Inter',
  fonts: [
    { src: InterRegular, fontWeight: 400 },
    { src: InterSemiBold, fontWeight: 600 },
    { src: InterBold, fontWeight: 700 },
  ],
})

Font.register({
  family: 'Noto Naskh Arabic',
  src: NotoNaskhArabic,
  fontWeight: 400,
})
```

### Document Structure with A4 + Page Numbers
```typescript
// Source: https://react-pdf.org/components, https://react-pdf.org/advanced
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 50,
    fontFamily: 'Inter',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
})

function PdfDocument({ data }: { data: PdfData }) {
  return (
    <Document
      title="Islamic Inheritance Division Report"
      author="Jomi-Bhag"
      subject="Faraid Calculation"
    >
      <Page size="A4" style={styles.page}>
        {/* Fixed footer renders on every page */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
        {/* Content sections... */}
      </Page>
    </Document>
  )
}
```

### Arabic Text with RTL Direction
```typescript
// Source: https://react-pdf.org/styling + community pattern
const arabicStyles = StyleSheet.create({
  arabicText: {
    fontFamily: 'Noto Naskh Arabic',
    fontSize: 14,
    direction: 'rtl',
    textAlign: 'right',
    lineHeight: 1.8,
    color: '#333',
  },
})

function ArabicVerse({ text }: { text: string }) {
  return <Text style={arabicStyles.arabicText}>{text}</Text>
}
```

### Table Layout with Flexbox
```typescript
// Source: https://react-pdf.org/styling (flexbox)
const tableStyles = StyleSheet.create({
  table: { width: '100%' },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    minHeight: 28,
    alignItems: 'center',
  },
  cell: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
})
```

### Chart Capture with html-to-image
```typescript
// Based on html-to-image API
import { toPng } from 'html-to-image'

async function captureChart(elementId: string): Promise<string | null> {
  const el = document.getElementById(elementId)
  if (!el) return null

  return toPng(el, {
    pixelRatio: 2,        // 2x for crisp rendering
    backgroundColor: '#fff', // Explicit white background
  })
}
```

### PDF Generation + Download
```typescript
// Source: https://react-pdf.org/advanced (pdf() function)
async function downloadPdf(data: PdfData): Promise<void> {
  const { pdf } = await import('@react-pdf/renderer')
  const { PdfDocument } = await import('@/components/pdf/PdfDocument')

  const blob = await pdf(<PdfDocument data={data} />).toBlob()
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `jomi-bhag-inheritance-report-${
    new Date().toISOString().split('T')[0]
  }.pdf`
  link.click()

  URL.revokeObjectURL(url)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| html2canvas + jsPDF (screenshot) | @react-pdf/renderer (vector PDF) | 2020+ | Searchable text, proper font embedding, smaller file sizes, crisp at any zoom |
| html2canvas for chart capture | html-to-image (SVG-native) | 2022+ | Better SVG support, smaller bundle, faster rendering |
| @react-pdf v3.x | @react-pdf v4.x | 2024 | usePDF hook improvements, better TypeScript support, but Arabic rendering regression |
| Remote font loading (CDN) | Local TTF bundling | Best practice | Eliminates race conditions, works offline, faster PDF generation |

**Deprecated/outdated:**
- `PDFDownloadLink` component: Still works but `usePDF` hook or `pdf()` function give more control over loading states and error handling
- Variable fonts in PDF: Not supported by PDF spec; always use static weight TTF files

## Open Questions

1. **Arabic text quality in @react-pdf/renderer v4.3.x**
   - What we know: Issue #2638 (Arabic broken since bidi PR) is still open; issue #3172 (non-English text) was resolved with per-script font registration
   - What's unclear: Whether Noto Naskh Arabic specifically renders correctly with proper ligatures in v4.3.2 (the issue reporter used different Arabic fonts)
   - Recommendation: Register Noto Naskh Arabic TTF, test early with actual Quranic text from the data files, have a fallback plan of rendering Arabic as "See reference in app" if rendering is broken. LOW-MEDIUM confidence on Arabic rendering quality.

2. **Ink-friendly chart color palette**
   - What we know: User wants lighter fills + thin outlines for B&W printing
   - What's unclear: Exact color values that look good on both screen PDF and B&W print
   - Recommendation: Use gray-scale fills with different intensities (e.g., 10%, 25%, 40%, 55%, 70%) plus 1pt black stroke outlines. Test with browser print preview in grayscale mode.

3. **Noto Naskh Arabic TTF file size**
   - What we know: The font file is needed only for PDF generation (lazy loaded), not initial page load
   - What's unclear: Exact file size impact (Noto Naskh Arabic Regular TTF is ~300-500KB)
   - Recommendation: Bundle locally but only load when PDF module is dynamically imported; font subsetting by @react-pdf/fontkit will reduce the embedded size in the final PDF

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.x + @testing-library/react 16.3.x |
| Config file | vite.config.ts (merged Vite+Vitest config) |
| Quick run command | `npx vitest run src/components/__tests__/pdf.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| OUTP-01 | Download PDF button visible in Results header; clicking triggers PDF generation | integration | `npx vitest run src/components/__tests__/pdf.test.tsx -x` | Wave 0 |
| OUTP-01 | PDF contains heir table, property breakdown, charts, references | unit | `npx vitest run src/components/__tests__/pdf.test.tsx -x` | Wave 0 |
| OUTP-02 | Print button visible; triggers print flow | integration | `npx vitest run src/components/__tests__/pdf.test.tsx -x` | Wave 0 |
| OUTP-03 | PDF disclaimer section contains all 4 required paragraphs | unit | `npx vitest run src/components/__tests__/pdf.test.tsx -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/components/__tests__/pdf.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before /gsd:verify-work

### Wave 0 Gaps
- [ ] `src/components/__tests__/pdf.test.tsx` -- covers OUTP-01, OUTP-02, OUTP-03 (button rendering, PDF data assembly, disclaimer content)
- [ ] Font TTF files in `src/assets/fonts/` -- Inter-Regular.ttf, Inter-SemiBold.ttf, Inter-Bold.ttf, NotoNaskhArabic-Regular.ttf
- [ ] Vite config for TTF file imports (`assetsInclude` if needed)

**Testing notes for @react-pdf/renderer:**
- @react-pdf components cannot be rendered in jsdom (no PDF engine in test env). Test strategy:
  - Unit test the data extraction/transformation functions (PdfData assembly)
  - Unit test that PDF components receive correct props by mocking @react-pdf/renderer
  - Integration test that buttons appear and click handlers are called
  - Manual verification of actual PDF output (visual inspection)
- Mock `@react-pdf/renderer` in tests: replace Document/Page/View/Text with simple div/span wrappers
- Mock `html-to-image` toPng to return a fake data URL

## Sources

### Primary (HIGH confidence)
- [react-pdf.org/components](https://react-pdf.org/components) - Component API, Image formats (JPG/PNG/base64), Page size presets
- [react-pdf.org/styling](https://react-pdf.org/styling) - Full CSS property support, flexbox, borders, text styling
- [react-pdf.org/fonts](https://react-pdf.org/fonts) - Font.register API, TTF/WOFF only, font fallback, emoji support
- [react-pdf.org/hooks](https://react-pdf.org/hooks) - usePDF hook API, loading state, blob/url access
- [react-pdf.org/advanced](https://react-pdf.org/advanced) - Page wrapping, break prop, fixed elements, render prop for page numbers, orphan/widow control
- [@react-pdf/renderer npm](https://www.npmjs.com/package/@react-pdf/renderer) - Version 4.3.2, last published ~2 months ago

### Secondary (MEDIUM confidence)
- [GitHub issue #2638](https://github.com/diegomura/react-pdf/issues/2638) - Arabic characters broken since bidi support; still OPEN; workaround is v3.3.5 downgrade (we won't downgrade; we'll test with proper font registration instead)
- [GitHub issue #3172](https://github.com/diegomura/react-pdf/issues/3172) - Non-English text rendering; CLOSED; solution is per-script font registration
- [html-to-image on npm-compare](https://npm-compare.com/dom-to-image,html-to-image,html2canvas) - 1.6M monthly downloads, lighter than html2canvas, better SVG support
- [recharts-to-png GitHub](https://github.com/brammitch/recharts-to-png) - v3 works with Recharts v3; wraps html2canvas
- [Bundle size concerns - issue #632](https://github.com/diegomura/react-pdf/issues/632) - ~450KB gzipped addition; must lazy-load

### Tertiary (LOW confidence)
- [Arabic OpenType features issue #2424](https://github.com/diegomura/react-pdf/issues/2424) - Extra spacing between Arabic glyphs; may or may not affect Noto Naskh Arabic specifically

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @react-pdf/renderer is the established React PDF library; html-to-image is well-maintained with 1.6M monthly downloads
- Architecture: HIGH - Patterns well-documented: lazy loading, data extraction, chart capture, iframe print
- Pitfalls: HIGH - Known issues well-documented in GitHub issues; bundle size, font loading, Arabic rendering all have documented workarounds
- Arabic rendering: LOW-MEDIUM - Known open issue; workaround exists but untested with this specific font + text combination

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (30 days -- @react-pdf/renderer is stable but Arabic issues may get fixed)
