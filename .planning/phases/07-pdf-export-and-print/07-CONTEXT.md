# Phase 7: PDF Export and Print - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Downloadable PDF report with full inheritance division details (heir breakdown, property details, share allocations, Quranic references, charts) and browser print functionality. Users can download or print from the Results page. No new data computation — PDF consumes existing engine output, property data, and chart visualizations from Phases 1-6. No scenario comparison (Phase 8), no land lot assignment (Phase 9).

</domain>

<decisions>
## Implementation Decisions

### PDF Content Scope
- Always full detailed content regardless of user's current Simple/Detailed mode — PDF is the complete legal-grade record
- Charts included: pie chart (share distribution) + bar chart (monetary comparison) rendered as images in PDF
- Quranic references fully expanded per heir: Arabic text (Noto Naskh Arabic) + English translation
- Full property breakdown: each property with type, land area, structures, trees/crops, pond details, and per-property valuation
- Blocked heirs included with explanation of who blocked them and why (Hajb rules)
- When Awl/Radd adjustments applied: show both original and adjusted shares in the heir table
- Step-by-step calculation explanation included
- Islamic Basis section with all unique Quran/Hadith references

### Document Style
- Formal legal document style — structured sections, clear headings, table-based data, professional tone
- NOT matching the app's modern card-based aesthetic — this is a document you'd bring to a lawyer or land office
- Header: "Jomi-Bhag" app name + "Islamic Inheritance Division Report" title + generation date on first page
- Footer: page numbers only ("Page 1 of 4") on every page — no running disclaimer
- Heir share data in table format: columns for Heir Type, Count, Fraction, Percentage, Per-Heir BDT, Total BDT, Share Type (Fard/Asaba)
- When Awl/Radd applied: additional "Original Share" and "Adjusted Share" columns with explanation banner

### PDF Section Order
1. Header (app name, title, date)
2. Heir share table (the core output — who gets what)
3. Charts (pie + bar visual summary)
4. Property breakdown (what's being divided)
5. Step-by-step calculation (how shares were derived)
6. Islamic references (Quranic/Hadith sources)
7. Disclaimer (legal + Islamic notice)

### Export Triggers
- Download PDF and Print as two separate buttons in the Results page header bar (next to Mode Toggle + Edit buttons)
- Download: generates and downloads a PDF file with auto-generated filename: `jomi-bhag-inheritance-report-YYYY-MM-DD.pdf`
- Print: renders the same PDF layout in a new window/iframe and triggers browser print dialog — identical output to downloaded PDF
- Button shows spinner while PDF generates (non-blocking — user can still view results)
- Both buttons available in Simple and Detailed modes (PDF always generates full content)

### Print Optimization
- Print output mirrors PDF content exactly (same rendering component)
- Charts use lighter fills and thin outlines instead of solid colors — ink-friendly for B&W printers common in BD offices
- A4 paper size (standard in Bangladesh)

### Edge Cases
- No properties/estate value entered: generate shares-only PDF (fractions + percentages, pie chart works, bar chart skipped, property section skipped)
- Single heir: generate normally — Radd/Bait-ul-Maal situation is interesting to document
- Blocked heirs present: include blocked heirs section with explanation

### Disclaimer
- Dedicated section at end of PDF (last section)
- Styled as bordered box with info icon — stands out from content, formal feel
- Content covers three areas:
  1. Legal: "This report is for informational purposes only. Consult a qualified lawyer before using for legal registration or property transfer."
  2. Islamic: "Calculations strictly follow the Hanafi school of Islamic jurisprudence. Other schools of thought (Shafi'i, Maliki, Hanbali) may yield different results. For disputes or edge cases, consult a qualified Islamic scholar (Mufti)."
  3. Scope: "This calculation assumes parents of the deceased have predeceased them. If parents are alive, inheritance rules differ."
  4. Values: "Property values used in this report are estimates entered by the user and may not reflect actual market values. Verify with local authorities or certified surveyors."
- Generation metadata at bottom of disclaimer: "Generated on YYYY-MM-DD at HH:MM by Jomi-Bhag (jomi-bhag.netlify.app)"

### Sharing and Protection
- No copy protection, no watermark — fully open, copyable, shareable
- Quality prioritized over file size — full resolution charts, complete font embedding
- Free public service ethos: families should share freely via WhatsApp/email/print

### Claude's Discretion
- PDF library choice (@react-pdf/renderer suggested in roadmap, open to alternatives)
- Chart-to-image conversion approach
- Exact font choices for the formal document (serif vs sans-serif body text)
- Table styling details (borders, alternating rows, column widths)
- Exact spacing, margins, and typography
- Page break fine-tuning within the "keep sections together" rule
- Loading spinner design in the download button
- Mobile button layout (icons only vs text) if header gets crowded

</decisions>

<specifics>
## Specific Ideas

- PDF is the "take it to the lawyer" document — formal, complete, self-contained
- Every share must be traceable: Quranic reference right there in the document, no need to open the app
- Families in BD commonly share documents via WhatsApp — PDF should open and render cleanly on mobile PDF viewers
- "Parents deceased" assumption must be stated clearly — many users won't realize this is an app limitation
- Hanafi school named explicitly — Bangladesh follows Hanafi but users from other backgrounds should know
- Ink-friendly charts for B&W printing — many BD offices/courts still use B&W printers

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ResultsPage.tsx`: Contains all display logic — heir cards, estate breakdown, adjustments, special cases, steps, references
- `FaraidOutput` type: shares[], adjustment, blockedHeirs[], specialCases[], steps[], references[] — all PDF data
- `ShareResult`: heirType, count, sharePerHeir, totalShare, shareType, quranRef, hadithRef, explanation
- `HEIR_TYPE_LABELS`: Maps heir types to display names
- `fractionToPercent()`, `fractionToBDT()`: Display formatting utilities
- `getAllReferences()`: Collects all unique Quran/Hadith references
- `EstateBreakdownCard.tsx`: Property breakdown logic with category totals
- `HeirCard.tsx`: Per-heir display with property distribution details
- `AdjustmentBanner.tsx`, `SpecialCaseCallout.tsx`: Adjustment/special case display logic
- `StepAccordion.tsx`: Step-by-step calculation data
- `IslamicBasisSection.tsx`: Grouped reference display
- `QuranReference.tsx`: Arabic + English reference display with Noto Naskh Arabic font
- `useWizardStore`: Central state with results, properties, totalEstateValue, viewMode
- `motion/react` (Framer Motion): Already installed, could be used for chart animations

### Established Patterns
- Components read from `useWizardStore` directly (anti-prop-drilling)
- `Intl.NumberFormat('en-IN')` for BDT formatting with lakh/crore grouping
- `Math.round(share.valueOf() * propertyTotal)` for integer BDT precision
- Emerald + gold oklch palette (charts use emerald gradient per Phase 6)
- Active shares filtered: `results.shares.filter(s => s.shareType !== 'blocked')`
- No PDF/print library currently installed

### Integration Points
- Results page header bar: add Download PDF + Print buttons next to existing ModeToggle + Edit buttons
- PDF component needs access to same data as ResultsPage: `results`, `properties`, `totalEstateValue` from wizardStore
- Charts from Phase 6 need to be convertible to static images for PDF embedding
- Noto Naskh Arabic font must be embedded in PDF for Quranic Arabic text

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-pdf-export-and-print*
*Context gathered: 2026-03-13*
