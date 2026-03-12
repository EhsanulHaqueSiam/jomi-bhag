# Phase 4: Property Input System - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Multi-property entry system with Bangladesh-specific land units (decimal, katha, bigha), regional unit variations across 8 divisions, and sub-item entry for houses/structures, trees/crops, and ponds. Users can add multiple properties of different types (agricultural, residential, commercial, mixed) with per-property values that auto-sum into total estate value. Property valuation auto-suggestion from govt data is Phase 5, not this phase.

</domain>

<decisions>
## Implementation Decisions

### Wizard Flow Placement
- Insert as Step 4 (Properties), push Results to Step 5. Linear wizard: Relationship → Family → Siblings → Properties → Results
- Always show 5 steps in the step indicator from the start (no dynamic appearance)
- Property input is optional — "Skip to Results" button skips to fractions/percentages only (no BDT amounts)
- When properties exist, EstateValueInput on Results page shows auto-calculated total from property values, with editable override option (user can tap to manually adjust)

### Multi-Property Entry UX
- Card list pattern: empty state → "Add Property" button → summary cards for each property
- Inline expansion: tapping a card or "Add Property" expands the form in-place (no modal/slide-up)
- Type selector first: user picks property type (Agricultural, Residential, Commercial, Mixed) before form fields appear — form adapts to show relevant sub-sections
- No hard limit on property count — users can add as many as needed (BD families often have 5-10+ parcels)
- Running total displayed at bottom of property list

### BD Land Units & Regional Handling
- Division-level region selector (8 divisions: Dhaka, Chittagong, Rajshahi, Khulna, Barisal, Sylhet, Rangpur, Mymensingh)
- Region selection is per-property (families often have land in multiple divisions)
- Default input unit: Decimal (govt-standard unit used in deeds), with dropdown to switch to Katha/Bigha/sqft
- Live conversion display: show 2-3 key conversions (local katha equivalent + sqft) below the area input, with "More units" expandable link
- Tooltip on unit dropdown (?) explaining BD land units — consistent with Phase 2 tooltip pattern

### Structure/Tree/Pond Detail
- Hybrid approach for all sub-items: simple default (estimated value), expandable for detail
- **House/structure:** Estimated value + optional "Add details" expanding to area (sqft), construction type (brick/tin/mud), floors, condition (good/fair/poor)
- **Trees/crops:** Total estimated value + optional "Itemize by species" expanding to species picker + count + per-species value rows. Common BD species: mango, jackfruit, coconut, bamboo, betelnut, etc.
- **Pond/water body:** Area (using same unit system as land) + estimated value
- Values are additive: Property total = land value + house value + tree value + pond value, auto-summed

### Empty State & Guidance
- Centered friendly prompt with icon: "Add your family's properties to calculate monetary shares" + [Add Property] + [Skip to Results →]
- Tooltip-based help for land units (?) icon next to unit dropdown, not inline reference table

### Property Naming
- Optional nickname field at top of each property card (e.g., "Bari-er Jomi", "Nana-bari")
- If empty, auto-labeled as "Residential #1", "Agricultural #2", etc.
- Nickname appears on collapsed card summary and carries through to PDF report (Phase 7)

### Validation
- Required: land area > 0, at least one value > 0 (land OR house OR tree OR pond), region selected
- Optional: name, structure details, tree species breakdown, pond area
- Delete confirmation: only if property has data entered; empty properties delete immediately

### Claude's Discretion
- Exact animation for card expand/collapse (motion/react pattern already established)
- Property type icons/emoji choice
- Exact form field ordering within expanded cards
- Mobile responsive breakpoints for property cards
- How "More units" conversion expansion looks
- Tree species list (common BD species)
- Construction type and condition option lists

</decisions>

<specifics>
## Specific Ideas

- BD families commonly have scattered land: ancestral agricultural land in one division + city residential in another — per-property region is critical
- Decimal is the deed unit (what government records use) but katha is what people say colloquially — both must be first-class
- 1 Katha varies dramatically: 720 sqft in Dhaka vs 1620 sqft in Rajshahi — this is THE key regional variation that catches people off guard
- Property nicknames like "Bari-er Jomi" (homestead land) or "Nana-bari" (maternal grandparents' house) are how BD families actually refer to properties
- The hybrid detail approach (simple default, expand for more) matches how professionals vs families use the tool: lawyers want structured breakdown, families just know "the house is worth 25 lakh"

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/StepperButton.tsx`: `[-] count [+]` pattern — could adapt for tree counts or floor counts
- `src/components/ui/Tooltip.tsx`: Click-outside tooltip with useState — reuse for land unit explanations
- `src/components/ui/Button.tsx`: Existing button component
- `src/components/results/EstateValueInput.tsx`: BDT currency input with lakh/crore formatting — reuse pattern for all value inputs
- `src/core/utils/display.ts`: `formatBDT()` function for currency display — reuse for property value display
- `src/components/ui/StepIndicator.tsx`: Currently shows 4 steps — needs update to 5

### Established Patterns
- Zustand store with individual field setters (wizardStore.ts) — extend for property state
- `Intl.NumberFormat('en-IN')` for BDT currency formatting with lakh/crore grouping
- motion/react AnimatePresence for expand/collapse animations (QuranReference, StepAccordion)
- Components read from store independently (anti-prop-drilling pattern from Phase 2)
- `completedSteps` stored as `number[]` for serialization

### Integration Points
- `src/types/wizard.ts`: WizardState needs property fields + WIZARD_STEPS array needs 5th step
- `src/stores/wizardStore.ts`: Needs property CRUD actions + total estate value computation
- `src/components/wizard/WizardShell.tsx`: Needs Step 4 routing to property component + Step 5 for results
- `src/components/results/EstateValueInput.tsx`: Needs conditional behavior (auto-calculated when properties exist, editable override)
- `src/components/results/ResultsPage.tsx`: Needs to read property-derived total estate value

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-property-input-system*
*Context gathered: 2026-03-13*
