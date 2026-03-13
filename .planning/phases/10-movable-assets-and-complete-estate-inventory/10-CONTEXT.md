# Phase 10: Movable Assets and Complete Estate Inventory - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Input all non-land assets of the deceased by category (gold/silver, cash, vehicles, jewelry, furniture, livestock, custom items), value each with guided estimation, combine with land properties into total estate, and handle indivisible assets per Islamic jurisprudence (sell & divide, buyout, or Qurah). Lives within the existing Step 4 alongside property input.

</domain>

<decisions>
## Implementation Decisions

### Asset Categories and Forms
- Core BD categories: gold/silver, cash/bank deposits, vehicles, jewelry (non-gold), furniture/household items, livestock, plus a "Custom" category for anything else
- Gold/silver: weight (default Vori/11.664g, switchable to grams/tola) + purity (24K, 22K, 18K) + auto-calculated value from hardcoded BD market rate. User can override value
- Vehicles: type dropdown (car, motorcycle, CNG/auto-rickshaw, truck, bicycle, boat) + estimated market value
- Livestock: type dropdown (cow, goat, chicken, duck, pigeon, fish pond stock) + count + per-unit estimated value. Total auto-calculated
- Custom items: multiple free-form entries, each with name + value (e.g., "Sewing machine ৳15,000", "Generator ৳40,000")
- Cash/bank deposits: simple BDT value entry
- Furniture/household: simple BDT value entry (lump sum)
- Jewelry (non-gold): simple BDT value entry

### Indivisible Asset Handling
- Auto-flag by category: vehicles, individual jewelry pieces, livestock, and custom items flagged as indivisible. Gold/silver by weight and cash always divisible. User can override the flag
- Per-item choice cards for each indivisible item: three option cards — "Sell & Divide" (show per-heir amount), "Buyout" (select heir group from dropdown, app calculates compensation), "Qurah" (Islamic lot drawing)
- Buyout: user selects which heir group buys via dropdown. App calculates what that group pays each other group
- Qurah: reuse the same gold-accented, bismillah, staggered-reveal ceremony from Phase 9

### Combined Estate Integration
- Movable assets live in the same Step 4 as properties — expand step from "Properties" to "Estate Inventory" with two sections/tabs: "Land & Properties" (existing) + "Movable Assets" (new)
- Fully optional — user can skip movable assets entirely, just like properties. App works with land only, movable only, both, or neither (fractions-only mode)
- Enhanced estate breakdown card on Results: Land: ৳X | Structures: ৳Y | Trees: ৳Z | Movable Assets: ৳W | Total: ৳T. Expandable for per-category movable detail
- Per-heir cards extend with movable asset breakdown: HeirCard's expandable section shows per-asset amounts alongside per-property amounts

### Valuation Guidance
- Gold/silver: hardcoded BD market rate per vori (updated with app releases, not live API). Matches Phase 5 mouza rate pattern — suggestion, not requirement
- Default gold unit: Vori (BD standard). Dropdown to switch to grams or tola. Live conversion display below input (matching Phase 4 land unit pattern)
- Transparent math inline: "৳110,000/vori × 5.5 vori × 22K purity = ৳605,000". User sees exactly how value is computed (matching Phase 5 rate transparency)
- No external API dependencies — all prices hardcoded for offline reliability

### Claude's Discretion
- Exact gold/silver market rates to hardcode
- Tab vs section layout for Land/Movable within Step 4
- Indivisible item card styling and option card design
- Livestock type list and common BD species
- Vehicle type icons
- Mobile layout for asset entry forms
- How movable asset totals flow into existing `getAllPropertiesTotal()` computation
- PDF section additions for movable assets

</decisions>

<specifics>
## Specific Ideas

- Vori is THE unit BD families use for gold — "amader 5 vori shona ache" (we have 5 vori of gold) is how every family describes their gold holdings
- Transparent math builds trust — same principle as Phase 5's mouza rate suggestion where users see "৳X/decimal × Y decimal = ৳Z"
- Indivisible asset options should be practical: families actually discuss "should we sell the car or should one of you keep it and pay the others?" — the app models this real conversation
- Livestock is surprisingly common in BD estates, especially rural. Cows are the most valuable (৳50,000-200,000 each), goats next (৳10,000-30,000)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Property` type and `computePropertyTotal()` (src/core/land/types.ts): pattern for structured asset types with value computation
- `PropertyCard` components (src/components/property/): card expansion, inline form, summary pattern — adapt for movable asset cards
- `EstateBreakdownCard` (src/components/results/): already shows land categories — extend with movable assets
- `HeirCard.tsx`: per-property expansion pattern — extend for per-asset expansion
- `formatBDT()`, `PropertyValueInput`: BDT input with formatting — reuse for all value fields
- `bd-land-data.ts`: data constants pattern — use same approach for gold rates, vehicle types, livestock types
- Qurah ceremony components (Phase 9): reuse for indivisible asset Qurah
- `StepperButton`: count input — reuse for livestock count

### Established Patterns
- Zustand store with individual field setters — extend for movable asset state
- Card list with inline expansion (Phase 4 property pattern)
- Auto-suggestion with "Use this rate" button (Phase 5 mouza rate pattern)
- Live unit conversion display below input (Phase 4 land unit pattern)
- Transparent math display: "rate × quantity = total" (Phase 5)
- Component-per-file in src/components/ subdirectories

### Integration Points
- Step 4 needs expansion: "Estate Inventory" with land and movable sections
- wizardStore needs movable asset CRUD actions and total computation
- `getAllPropertiesTotal()` needs to include movable asset values in combined estate total
- EstateBreakdownCard needs new movable asset category row
- HeirCard needs movable asset expansion alongside property expansion
- New data module for gold rates, vehicle types, livestock types
- PdfDocument needs movable asset section in export

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-movable-assets-and-complete-estate-inventory*
*Context gathered: 2026-03-13*
