# Phase 5: Property Valuation - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Estate value calculation with BD government mouza rate auto-suggestion (upazila-level, per property type), user override, estate valuation summary breakdown on Results page, and per-heir expandable per-property monetary distribution. Phase 4 already handles property entry and total computation — this phase adds price intelligence, richer valuation display, and per-property heir breakdown.

</domain>

<decisions>
## Implementation Decisions

### Mouza Rate Data Strategy
- Hardcoded sample data for all 8 BD division HQ districts (Dhaka, Chittagong, Rajshahi, Khulna, Barisal, Sylhet, Rangpur, Mymensingh)
- Upazila-level granularity — rates per upazila within each district, not per-mouza or district-level averages
- Rates differentiated by property type: separate rates for agricultural, residential, and commercial land within the same upazila
- Data extracted from BD govt gazette PDFs — expandable over time as more districts are added
- Rate unit: BDT per decimal (govt-standard unit)

### Price Suggestion UX
- Inline suggestion below the land value input field: shows "৳X/decimal × Y decimal = ৳Z total" with a "Use this rate" button that auto-fills land value
- User can ignore the suggestion and type their own value — suggestion is non-blocking
- Upazila dropdown added to property form after division selection (division → upazila cascade)
- When mouza rate data not available for a location: subtle info message "Govt rates not available for this area — enter your estimated land value"
- Suggestion only appears when division + upazila + property type are all selected AND rate data exists

### Valuation Summary Display
- Estate breakdown card on Results page above heir cards, replacing/enhancing current EstateValueInput
- Default shows category totals: Land: ৳X | Structures: ৳Y | Trees/Crops: ৳Z | Ponds: ৳W | Total: ৳T
- Expandable "View properties" shows per-property contribution to each category
- Override option preserved: "Override total" link lets user enter custom total estate value, breakdown still visible
- Govt rate vs manual badge indicator on each property row: green "Govt rate" badge or gray "Manual" badge next to land value — builds transparency and trust

### Per-Heir Distribution Detail
- HeirCard shows aggregate amount by default: share × total estate value (existing behavior enhanced)
- Expandable "View property shares" section within each heir card
- Per-property rows show: property name (nickname or auto-label) + heir's BDT amount
- For heirs with count > 1: each row shows "Each: ৳X | Total (N): ৳Y" — consistent with existing Each/Total pattern
- When no properties exist but estate value is entered manually: show BDT amounts normally
- When neither properties nor estate value exist: show fractions/percentages only with hint "Add properties or enter estate value to see BDT amounts"

### Claude's Discretion
- Exact upazila list and rate values for each district (from gazette research)
- Breakdown card visual design and animation
- Per-property expansion animation within heir cards
- Badge styling for govt rate vs manual indicators
- Upazila dropdown implementation (searchable vs plain select)
- How to handle the transition from old EstateValueInput to new breakdown card

</decisions>

<specifics>
## Specific Ideas

- Rate suggestion shows the full math transparently: "৳X/decimal × 5.2 decimal = ৳Y total" — users see exactly how the number is computed, building trust
- Badge indicators (Govt rate / Manual) help families and lawyers distinguish auto-suggested vs user-entered values — important for legal documentation
- Per-property breakdown in heir cards bridges the gap between "you get 25%" and "here's what 25% of each property looks like" — practical for family discussions
- The breakdown card replaces the bare number with a structured summary — matches the "professional vs family" dual-audience approach

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EstateValueInput.tsx`: BDT input with auto-calc from properties + override toggle — will be enhanced/replaced by breakdown card
- `PropertyValueInput.tsx`: Reusable BDT input with blur/focus toggle — pattern for any new value fields
- `computePropertyTotal()` in `core/land/types.ts`: Per-property total (land + house + trees + ponds) — foundation for breakdown
- `getAllPropertiesTotal()` in wizardStore: Sum of all property totals — feeds the estate total
- `HeirCard.tsx`: Already shows Each/Total rows for multi-heir groups — extend with per-property expansion
- `formatBDT()` in `core/utils/display.ts`: Currency formatting — reuse for all new monetary displays
- `Tooltip.tsx`, `Button.tsx`: UI primitives for badges and actions
- `bd-land-data.ts`: Division list already exists — extend with upazila data and rate tables
- `core/land/types.ts`: Property type with `division` field — extend with `upazila` field

### Established Patterns
- `Intl.NumberFormat('en-IN')` for BDT lakh/crore formatting
- motion/react AnimatePresence for expand/collapse (QuranReference, StepAccordion, PropertyCard)
- Zustand store with individual field setters — extend for upazila and rate source tracking
- Anti-prop-drilling: components read from store directly
- All area stored internally as sqft (canonical unit), converted for display

### Integration Points
- `Property` type needs `upazila` field added
- `Property` type may need `rateSource: 'govt' | 'manual'` field for badge display
- `wizardStore` needs upazila setter and rate lookup integration
- `ResultsPage.tsx`: Breakdown card replaces/enhances EstateValueInput position
- `HeirCard.tsx`: Needs per-property expansion capability, reading from properties array + share fraction
- New data module: `data/mouza-rates.ts` for upazila-level rate lookup by division + upazila + property type

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-property-valuation*
*Context gathered: 2026-03-13*
