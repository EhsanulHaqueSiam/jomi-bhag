# Phase 9: Land Lot Division and Qurah Assignment - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Divide existing property parcels (from Step 4) into groups matching each heir type's Faraid share, assign groups via Qurah (Islamic lot drawing) or manual reassignment, and display results with cash compensation for imbalances. Accessible from Results page when properties exist. Phase 11 adds drag-and-drop interactive redistribution on top of this foundation.

</domain>

<decisions>
## Implementation Decisions

### Parcel Source and Flow
- Parcels ARE the properties from Step 4 — auto-populated, no re-entry needed. Names, areas, and values already exist
- Read-only in division view — to change parcel details, user goes back to Step 4
- "Divide Land" button appears on Results page only when properties exist (hidden otherwise)
- Division flow is a post-results feature, not a wizard step — user calculates shares first, then optionally divides land

### Division Algorithm
- Greedy best-fit by value: sort parcels by value (largest first), assign each to the group most under-filled relative to its Faraid share
- One group per heir TYPE (Sons, Daughters, Wife, etc.) — not per individual heir. Within a group, parcels are shared equally among members
- Value-based only — no qualitative factors (location, fertility). Real-world factors are reflected in the property's estimated value
- Best-fit grouping + cash compensation: assign whole parcels, show difference as cash adjustment (e.g., "Sons group owes Daughters group ৳30,000 cash"). Islamic jurisprudence allows cash compensation for land division imbalances

### Qurah (Lot Drawing) UX
- Islamic ceremony feel: gold-accented UI, bismillah header, animated draw sequence. Respectful and deliberate — not gamified
- All-at-once with staggered reveal: click "Draw Lots (Qurah)" → all groups animate simultaneously (shuffle effect) → results appear one by one with staggered delay
- Unlimited re-draws — families can keep drawing until everyone is comfortable
- Brief Quranic/Hadith reference in a gold-accented box explaining the Qurah practice (consistent with Phase 3 reference display pattern)

### Assignment Results Display
- Card per heir group: one card per heir type listing assigned parcels with names and values, group total vs target share, and cash adjustment if any. Consistent with Phase 3 heir card pattern
- Cash compensation summary banner at top: colored banner above group cards stating who owes whom (e.g., "Sons group received ৳50,000 more in land value — owes Daughters group ৳50,000 cash")
- Simple "Move to..." buttons on each parcel for manual reassignment between groups. Group totals update instantly. Phase 11 adds drag-and-drop on top
- Lot division results included in PDF export as a new "Land Division" section (group assignments, parcel lists, cash adjustments)

### Claude's Discretion
- Exact greedy algorithm implementation details
- Shuffle animation timing and easing
- Gold-accented Qurah UI styling details
- Cash compensation banner color and styling
- "Move to..." dropdown vs button implementation
- PDF section layout for land division
- Mobile responsive behavior for group cards

</decisions>

<specifics>
## Specific Ideas

- The Qurah should feel sacred and respectful — bismillah header, gold accents, not a casino-style random spinner
- Cash compensation is how real BD families settle division imbalances — showing the exact amount owed makes the tool practically useful for family meetings
- "Move to..." buttons provide basic manual control without overlapping Phase 11's drag-and-drop scope
- Group cards should mirror the heir card pattern from Phase 3 — same visual language, just with parcel lists instead of share fractions

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Property` type (src/core/land/types.ts): id, nickname, type, division, upazila, landAreaSqft, landValue, house, trees, pond — full parcel data already available
- `computePropertyTotal()`: calculates total value per property — feeds the grouping algorithm
- `getAllPropertiesTotal()` in wizardStore: sum of all properties
- `HeirCard.tsx`: existing card pattern for heir display — adapt for group display
- `ShareResult` type: heirType, count, sharePerHeir, totalShare — defines target share per group
- `FaraidOutput.shares[]`: array of all heir shares — drives group creation
- `formatBDT()`: currency formatting for compensation amounts
- `motion/react`: Framer Motion for shuffle/reveal animations
- Gold palette (oklch) established in Phase 2/3 for Islamic accents
- PDF components (Phase 7): PdfDocument, PdfPropertySection — extend for land division section

### Established Patterns
- Zustand store for state management — extend for division state
- Component-per-file in src/components/ subdirectories
- motion/react AnimatePresence for enter/exit animations
- Gold-accented callout boxes for Islamic references (Phase 3 special case pattern)
- Colored info banners for adjustments (amber for Awl, blue for Radd — Phase 3)

### Integration Points
- ResultsPage.tsx: "Divide Land" button when properties.length > 0
- New LotDivision component/page accessible from Results
- wizardStore or new store needs division state (group assignments, Qurah results)
- PdfDocument.tsx: new PdfLotDivisionSection component for PDF export
- extractPdfData.ts: needs to extract division data for PDF

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-land-lot-division-and-qurah-assignment*
*Context gathered: 2026-03-13*
