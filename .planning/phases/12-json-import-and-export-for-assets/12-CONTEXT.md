# Phase 12: JSON Import and Export for Assets - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Allow users to export their full estate data (heirs, properties, movable assets, distribution state) as a pretty-printed JSON file for backup and portability, and import JSON files (even with partial fields) to populate the wizard GUI for editing and recalculation. Lives on the Results page (export) and Step 1 (import).

</domain>

<decisions>
## Implementation Decisions

### Use Cases & Audience
- Primary use case: backup & portability — users export their own data to re-import on another device/browser
- Not a professional template system or sharing tool — personal data safety net alongside Phase 8 localStorage
- File should feel trustworthy and transparent when opened in a text editor

### Export Scope & Format
- Full state exported: heirs (relationship, gender, counts), all properties (land + house/tree/pond), movable assets (Phase 10), distribution assignments (Phase 11), estate value
- Inputs only — computed results (Faraid shares, adjustments, steps, references) are NOT exported. Import triggers fresh Faraid engine recalculation. Guarantees consistency across engine versions
- Pretty-printed JSON (indented, human-readable)
- Standard `.json` file extension
- Metadata included: `schemaVersion: 1`, app version string, export date (ISO 8601)
- Default filename auto-generated from scenario name: e.g., `3-brothers-2-sisters-2026-03-13.json` (matches Phase 8 auto-naming pattern)

### Import Flexibility & Validation
- Partial data accepted: if JSON has heirs but no properties, import heirs and leave properties empty. Missing fields get sensible defaults (zero counts, empty arrays)
- Import replaces current data with confirmation dialog: "Importing will replace your current data. Continue?" — matches Phase 8 load-scenario pattern
- Basic type validation only on import: check numbers are numbers, strings are strings, enums are valid values. Don't check business logic (max wife count, etc.) — let the wizard's existing validation catch those when user edits
- Invalid/corrupted JSON shows a toast notification: "Invalid file — could not parse JSON" or "Missing required fields". Non-blocking, dismissable

### UI Placement & Flow
- Export button on Results page near existing "Download PDF" and "Print" buttons. Consistent with Phase 7 export placement
- Import on Step 1 (start/welcome screen): "Import from file" as an alternative to filling the wizard manually
- File selection: drag-and-drop zone ("Drag file here or click to browse") with visual feedback on drag-over, falling back to button click
- Post-import destination: Claude's discretion (Step 1 with data filled for review, or straight to Results)

### Claude's Discretion
- Post-import navigation (Step 1 vs Results)
- Drag-and-drop zone styling and animation
- Toast notification styling and duration
- Confirmation dialog design
- JSON key naming convention (camelCase vs snake_case)
- How distribution state (Phase 11) serializes to JSON
- Schema migration strategy for future schemaVersion bumps
- Export button icon and label text

</decisions>

<specifics>
## Specific Ideas

- Filename from scenario name (e.g., "3-brothers-2-sisters-2026-03-13.json") makes files identifiable in a downloads folder — users can tell which calculation each file represents
- Pretty-printed JSON builds trust — users can open the file and see their data laid out clearly, not a wall of minified text
- Schema version field is low effort now but crucial safety net if the data format evolves — import can detect old formats and migrate
- Partial import with defaults makes the tool forgiving — a user who only has heir data can still use import without needing to craft a complete JSON by hand

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useWizardStore` (src/stores/wizardStore.ts): full state shape already defined — serialize/deserialize this
- `usePdfExport` hook (src/hooks/usePdfExport.tsx): download pattern (anchor click) — reuse for JSON download
- `extractPdfData.ts`: data extraction pattern from store — adapt for JSON extraction
- `PdfData` type (src/components/pdf/pdfTypes.ts): serialization pattern (Fraction → string conversion)
- `formatBDT()`, `HEIR_TYPE_LABELS`: display utilities for auto-naming
- `Property` type with nested `HouseDetail`, `TreeDetail`, `PondDetail` — complex nested structures to serialize
- `completedSteps` stored as `number[]` (not Set) — already serialization-friendly

### Established Patterns
- Zustand store with individual field setters — import needs to call multiple setters or use a bulk-load action
- Anchor click pattern for file download (Phase 7 PDF)
- Confirmation dialogs via state-driven modals
- Toast notifications (if existing) or implement simple toast component

### Integration Points
- ResultsPage.tsx: "Export JSON" button alongside PDF/Print buttons
- Step 1 component: import drop zone + file picker
- wizardStore: needs `importState(data)` action for bulk state loading
- New utility: `extractExportData()` to serialize store state to JSON-ready object
- New utility: `validateImportData()` for type-level validation on import
- Schema version constant shared between export and import

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-json-import-and-export-for-assets*
*Context gathered: 2026-03-13*
