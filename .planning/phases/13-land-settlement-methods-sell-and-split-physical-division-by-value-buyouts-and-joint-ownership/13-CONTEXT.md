# Phase 13: Land Settlement Methods - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Add 4 land settlement methods (Sell & Split, Physical Division by Value, Buyout, Joint Ownership) as actionable options on each property card within the Phase 11 distribution board. Each property can have a different settlement method. All calculations use the user-entered property value (market price with auto-suggestion from Phase 5 mouza rates). This is a distribution platform where users distribute land to each heir according to Islamic Faraid rules. Includes a full PDF "Settlement Plan" section.

</domain>

<decisions>
## Implementation Decisions

### Settlement Flow & Entry
- Per-property settlement: each property can have a different method (sell one, buyout another, keep a third jointly)
- Settlement method selector lives on each property card inside the Phase 11 DnD Kanban distribution board — expandable section when tapped
- Default state when no method chosen: Claude's discretion
- All calculations use the user-entered property value (which has auto-suggestion from Phase 5 mouza rates, but user edits to actual market value)
- Fractional division strictly follows Faraid shares — every heir's portion is determined by Islamic inheritance rules

### Sell & Split
- Default shows per-heir payout based on existing property value from Step 4
- User can optionally enter actual sale price to recalculate the split
- Per-heir BDT amounts shown based on Faraid share fractions

### Physical Division by Value
- User defines sub-parcels with name + area (katha/decimal) + appraised value
- Auto-suggest number of sub-parcels based on heir count, with Faraid-based target values pre-filled. User can add/remove sub-parcels
- Shows value split only — sub-parcels are not assigned to specific heirs, just listed with values showing how the physical split achieves fair value distribution
- Cash compensation for any imbalance (same as Phase 9 pattern)

### Buyout
- Enhanced from Phase 10's movable asset buyout: includes installment option and more detail
- Uses existing property value (no separate market price input)
- Select which heir group takes ownership, show compensation owed to others
- Installment payment support: Claude's discretion on whether to include
- No interest on installments (Islamic finance compliant)

### Joint Ownership
- Static ownership percentage display (from Faraid shares) showing each heir's stake
- Optional income calculator: user enters income amount → app shows per-heir distribution
- Two income types: rent (monthly/yearly for buildings) and crop income (for agricultural land)
- Crop income period (annual vs seasonal): Claude's discretion
- Co-ownership agreement in PDF: Claude's discretion on detail level

### PDF Output
- Full "Settlement Plan" section in PDF export: per-property settlement details including method, sub-parcels for physical split, buyer for buyout, income shares for joint ownership
- Comprehensive enough for family meetings and legal reference

### Claude's Discretion
- Default settlement state when no method chosen
- Installment payment implementation details
- Crop income period input (annual total vs seasonal breakdown)
- Joint ownership co-ownership agreement level of detail in PDF
- Settlement method selector UI styling and expand/collapse behavior
- Mobile responsive layout for settlement details within property cards

</decisions>

<specifics>
## Specific Ideas

- This should feel like a distribution platform — the user is actively distributing land to each person according to Islamic rules, not just viewing static calculations
- Physical division shows how unequal-sized plots can have equal value (road-facing small plot vs larger back plot)
- Sell & Split is the simplest method — just a price and per-heir payout. Most families start here
- Cash compensation is the Islamic-approved mechanism for handling any division imbalance
- Market value is the foundation — user enters it (with mouza rate auto-suggestion), and all methods calculate from that value

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `IndivisibleCard.tsx`: Phase 10's buyout/sell_divide UI for movable assets — adapt pattern for land
- `calculateBuyout()` (src/core/assets/indivisible.ts): buyout compensation calculation — extend for land
- `ResolutionMethod` type: `'sell_divide' | 'buyout' | 'qurah'` — extend with `'physical_split' | 'joint_ownership'`
- `CompensationBanner.tsx`: cash compensation display from Phase 9 — reuse for physical division imbalance
- `formatBDT()`: currency formatting for all monetary displays
- `computePropertyTotal()`: property value calculation — foundation for all settlement methods
- `DistributionPage.tsx`: Phase 11 Kanban board — settlement selector integrates here
- PDF components: `PdfLotDivisionSection`, `PdfDistributionSection` — extend for settlement plan section
- `extractPdfData.ts`: data extraction pattern — add settlement data extraction

### Established Patterns
- Zustand stores for state (wizardStore, distributionStore, divisionStore)
- Expandable card sections (Phase 10 IndivisibleCard pattern)
- Cash compensation calculation and display (Phase 9)
- Per-heir payout calculation from Faraid shares
- motion/react AnimatePresence for expand/collapse animations

### Integration Points
- Phase 11 DistributionPage: settlement method expandable on each property card
- Property type in wizardStore: needs settlement method + details fields
- PDF export: new PdfSettlementSection component
- extractPdfData.ts: extract settlement data per property

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 13-land-settlement-methods-sell-and-split-physical-division-by-value-buyouts-and-joint-ownership*
*Context gathered: 2026-03-13*
