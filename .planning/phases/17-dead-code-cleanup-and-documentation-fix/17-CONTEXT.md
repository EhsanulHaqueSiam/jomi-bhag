# Phase 17: Dead Code Cleanup & Documentation Fix - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove unreachable dead code left by Phase 11 superseding Phase 9 and Quick-8 merging wizard steps, fix MonetaryBarChart coloring, remove stale comment, and update REQUIREMENTS.md traceability to reflect completion. No new features, no behavior changes.

</domain>

<decisions>
## Implementation Decisions

### Cleanup scope
- Full cascade removal: delete all files AND all references that are only alive because of divisionStore/LotDivisionPage
- Files to delete: LotDivisionPage.tsx, divisionStore.ts, StepFamily.tsx, StepSiblings.tsx, PdfLotDivisionSection.tsx, division.test.tsx
- Code to clean: remove PdfLotDivision types from pdfTypes.ts, remove divisionResult param from extractPdfData, remove divisionStore import from usePdfExport, remove divisionStore mock from usePdfExport.test.ts, remove LotDivisionPage import and route from App.tsx

### Bar chart coloring
- Use graded emerald shades from EMERALD_COLORS array (same approach as pie chart)
- Add Recharts Cell components inside Bar element, one per data entry, cycling through EMERALD_COLORS

### Stale comment
- Remove "Stub - types to be implemented" from src/core/distribution/types.ts line 1

### REQUIREMENTS.md updates
- Change "Planned" to "Complete" for all Phase 9-14 requirements in traceability table
- Check boxes for P14-16 through P14-20

### Claude's Discretion
- Exact order of file deletions and edits
- Whether to add fill prop vs Cell components for bar chart (implementation detail)
- Any additional dead imports discovered during cleanup

</decisions>

<specifics>
## Specific Ideas

No specific requirements — the audit provides the authoritative checklist of items to clean up.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EMERALD_COLORS` array in `chartData.ts`: hex emerald gradient already used by pie chart, reuse for bar chart Cell components

### Established Patterns
- Recharts Cell pattern: pie chart already uses `<Cell fill={color} />` inside `<Pie>` — bar chart should mirror this inside `<Bar>`
- Dynamic import pattern in usePdfExport: currently imports divisionStore — remove that import line

### Integration Points
- App.tsx: remove `page === 'division'` route and LotDivisionPage import
- usePdfExport.tsx line 55: remove divisionStore getState() call
- extractPdfData.ts: remove divisionResult parameter and lotDivision mapping logic
- PdfDocument.tsx: remove PdfLotDivisionSection import and rendering

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-dead-code-cleanup-and-documentation-fix*
*Context gathered: 2026-03-14*
