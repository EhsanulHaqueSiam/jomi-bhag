# Phase 13: Land Settlement Methods - Research

**Researched:** 2026-03-14
**Domain:** Land settlement UI + calculation logic (sell & split, physical division, buyout, joint ownership)
**Confidence:** HIGH

## Summary

Phase 13 adds four land settlement methods as expandable sections on each property card within the Phase 11 distribution board. Each property independently gets a settlement method: Sell & Split, Physical Division by Value, Buyout, or Joint Ownership. All calculations derive from the user-entered property value (market price, with mouza auto-suggest from Phase 5).

The codebase already has robust patterns for exactly this kind of feature. The `IndivisibleCard.tsx` component (Phase 10) implements a nearly identical three-option-card pattern with Sell & Divide, Buyout, and Qurah for movable assets. The `calculateBuyout()` function in `src/core/assets/indivisible.ts` computes compensation using Faraid shares. The `CompensationBanner.tsx` displays cash compensation. Phase 13 extends these patterns to land properties with two new methods (Physical Division by Value, Joint Ownership) and enhances the existing Buyout with optional installment support.

**Primary recommendation:** Model settlement as a new `settlement` field on the `Property` type (union of four method-specific interfaces). Build a `SettlementPanel` component that mirrors the `IndivisibleCard` expand/collapse pattern and lives inside the distribution board's property cards. Add a `PdfSettlementSection` for PDF export. Pure calculation logic goes in `src/core/land/settlement.ts` with unit tests.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Per-property settlement: each property can have a different method (sell one, buyout another, keep a third jointly)
- Settlement method selector lives on each property card inside the Phase 11 DnD Kanban distribution board -- expandable section when tapped
- All calculations use the user-entered property value (which has auto-suggestion from Phase 5 mouza rates, but user edits to actual market value)
- Fractional division strictly follows Faraid shares -- every heir's portion is determined by Islamic inheritance rules
- Sell & Split: default shows per-heir payout based on existing property value from Step 4; user can optionally enter actual sale price to recalculate
- Physical Division by Value: user defines sub-parcels with name + area (katha/decimal) + appraised value; auto-suggest number of sub-parcels based on heir count with Faraid-based target values pre-filled; shows value split only (sub-parcels not assigned to specific heirs); cash compensation for imbalance
- Buyout: uses existing property value (no separate market price input); select which heir group takes ownership, show compensation owed to others; enhanced from Phase 10's movable asset buyout with installment option
- Joint Ownership: static ownership percentage display (from Faraid shares); optional income calculator with rent (monthly/yearly) and crop income (for agricultural land)
- PDF output: full "Settlement Plan" section with per-property settlement details
- No interest on installments (Islamic finance compliant)

### Claude's Discretion
- Default settlement state when no method chosen
- Installment payment implementation details
- Crop income period input (annual total vs seasonal breakdown)
- Joint ownership co-ownership agreement level of detail in PDF
- Settlement method selector UI styling and expand/collapse behavior
- Mobile responsive layout for settlement details within property cards

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2 | UI components | Already in project |
| TypeScript | 5.9 | Type safety | Already in project |
| Zustand | 5.0 | State management | Already in project, Property state lives in wizardStore |
| TailwindCSS | 4.2 | Styling | Already in project |
| motion/react | 12.36 | AnimatePresence for expand/collapse | Already in project, used by IndivisibleCard pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-pdf/renderer | 4.3 | PDF generation | PdfSettlementSection component |
| fraction.js | 5.3 | Exact fraction arithmetic | Share calculations use Fraction.valueOf() |
| Intl.NumberFormat | built-in | BDT formatting (en-IN) | All monetary displays |

### Alternatives Considered
None -- this phase uses the existing stack exclusively. No new dependencies needed.

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  core/
    land/
      settlement.ts          # Pure calculation functions (sellSplit, physicalDivision, buyout, jointOwnership)
      settlement-types.ts     # Settlement type definitions (or extend types.ts)
      __tests__/
        settlement.test.ts    # Unit tests for settlement calculations
  components/
    distribution/
      SettlementPanel.tsx     # Main settlement method selector + details (mirrors IndivisibleCard)
      SellSplitDetail.tsx     # Sell & Split detail view
      PhysicalDivisionDetail.tsx  # Physical Division sub-parcel editor
      BuyoutDetail.tsx        # Enhanced buyout with installment support
      JointOwnershipDetail.tsx    # Ownership percentages + income calculator
    pdf/
      PdfSettlementSection.tsx    # PDF settlement plan section
```

### Pattern 1: Settlement Type Discriminated Union
**What:** Model settlement data as a discriminated union on Property, mirroring how `IndivisibleResolution` works for movable assets.
**When to use:** Storing per-property settlement choice and its method-specific data.
**Example:**
```typescript
// Follows the IndivisibleResolution pattern from src/core/assets/types.ts

export type LandSettlementMethod = 'sell_split' | 'physical_division' | 'buyout' | 'joint_ownership'

export interface SellSplitSettlement {
  method: 'sell_split'
  actualSalePrice: number | null  // null = use property value
}

export interface SubParcel {
  id: string
  name: string
  areaSqft: number
  areaInputUnit: LandUnit
  appraisedValue: number
}

export interface PhysicalDivisionSettlement {
  method: 'physical_division'
  subParcels: SubParcel[]
}

export interface BuyoutSettlement {
  method: 'buyout'
  buyerHeirType: HeirType
  useInstallments: boolean
  installmentCount: number  // e.g. 6, 12, 24 months
}

export interface JointOwnershipSettlement {
  method: 'joint_ownership'
  incomeAmount: number | null
  incomeType: 'rent' | 'crop' | null
  incomePeriod: 'monthly' | 'yearly' | null
}

export type LandSettlement =
  | SellSplitSettlement
  | PhysicalDivisionSettlement
  | BuyoutSettlement
  | JointOwnershipSettlement
```

### Pattern 2: Expandable Section on Property Card
**What:** Settlement selector expands inline within the distribution board's property cards, using AnimatePresence.
**When to use:** When user taps a property in the distribution board to configure its settlement.
**Example:**
```typescript
// Follows IndivisibleCard pattern: method selection cards + detail view
// The SettlementPanel receives:
//   - property: Property (with settlement field)
//   - shares: ShareResult[] (for Faraid fraction calculations)
//   - onUpdate: (settlement: LandSettlement | null) => void

// Four method cards in a grid, expanding detail on selection
// motion/react AnimatePresence for smooth expand/collapse (Phase 3 pattern)
```

### Pattern 3: Settlement Calculations as Pure Functions
**What:** All settlement math in pure functions, separate from UI.
**When to use:** Sell & Split payout, buyout compensation, physical division target values, joint ownership percentages.
**Example:**
```typescript
// Mirrors calculateBuyout() from src/core/assets/indivisible.ts

export function calculateSellSplit(
  propertyValue: number,
  shares: ShareResult[],
): { heirType: HeirType; amount: number }[] {
  const activeShares = shares.filter(s => s.shareType !== 'blocked')
  return activeShares.map(s => ({
    heirType: s.heirType,
    amount: Math.round(propertyValue * s.totalShare.valueOf()),
  }))
}

// Physical division: compute target sub-parcel values from Faraid shares
export function computeSubParcelTargets(
  propertyValue: number,
  shares: ShareResult[],
): { heirType: HeirType; targetValue: number }[] {
  const activeShares = shares.filter(s => s.shareType !== 'blocked')
  return activeShares.map(s => ({
    heirType: s.heirType,
    targetValue: Math.round(propertyValue * s.totalShare.valueOf()),
  }))
}

// Reuse existing calculateBuyout for buyout, extend with installment info
export function calculateInstallments(
  totalCompensation: number,
  installmentCount: number,
): { perInstallment: number; total: number } {
  const perInstallment = Math.round(totalCompensation / installmentCount)
  return { perInstallment, total: totalCompensation } // No interest (Islamic)
}

// Joint ownership percentages directly from Faraid shares
export function calculateOwnershipShares(
  shares: ShareResult[],
): { heirType: HeirType; percentage: number }[] {
  const activeShares = shares.filter(s => s.shareType !== 'blocked')
  return activeShares.map(s => ({
    heirType: s.heirType,
    percentage: Math.round(s.totalShare.valueOf() * 10000) / 100, // 2 decimal places
  }))
}
```

### Pattern 4: Property Type Extension
**What:** Add `settlement: LandSettlement | null` field to the existing `Property` interface.
**When to use:** Storing settlement data alongside property data in wizardStore.
**Example:**
```typescript
// In src/core/land/types.ts, extend Property:
export interface Property {
  // ... existing fields ...
  settlement: LandSettlement | null  // NEW: settlement method choice
}

// Default for new properties: settlement: null
// wizardStore.addProperty() sets settlement: null
// wizardStore.updateProperty() can patch settlement
```

### Pattern 5: PDF Settlement Section
**What:** New `PdfSettlementSection` component following the same patterns as `PdfDistributionSection`.
**When to use:** When any property has a non-null settlement.
**Example:**
```typescript
// In pdfTypes.ts, add:
export interface PdfSettlement {
  propertyName: string
  propertyValue: number
  method: string  // display label
  details: PdfSettlementDetail  // method-specific rendered data
}

// In extractPdfData.ts, extract settlement from properties
// In PdfDocument.tsx, render PdfSettlementSection after distribution
```

### Anti-Patterns to Avoid
- **Separate store for settlement data:** Settlement belongs ON the Property in wizardStore (not a separate settlementStore). It persists with the property and exports/imports with it.
- **Assigning sub-parcels to specific heirs in physical division:** Context explicitly says "sub-parcels are not assigned to specific heirs, just listed with values showing how the physical split achieves fair value distribution."
- **Adding a separate market price input for buyout:** Context says "uses existing property value (no separate market price input)."
- **Charging interest on installments:** Explicitly prohibited (Islamic finance compliant).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Buyout compensation calculation | Custom math | Extend existing `calculateBuyout()` from `src/core/assets/indivisible.ts` | Already handles Faraid share proportional compensation correctly |
| BDT currency formatting | Custom formatter | `Intl.NumberFormat('en-IN')` with narrowSymbol | Already used throughout app, handles lakh/crore grouping |
| Expand/collapse animations | Custom transitions | `motion/react` AnimatePresence | Already used in IndivisibleCard, QuranReference patterns |
| Per-heir share calculations | Manual fraction math | `ShareResult.totalShare.valueOf()` from engine output | Faraid engine already computes exact fractions |
| Property value computation | Sum components manually | `computePropertyTotal()` from `src/core/land/types.ts` | Already handles land + house + trees + pond |
| Cash compensation display | Custom banner | `CompensationBanner` component from Phase 9 | Reusable with same CashCompensation type |

**Key insight:** Phase 13 is largely an assembly of existing patterns. The IndivisibleCard + calculateBuyout + CompensationBanner + expandable card section patterns cover 70% of the implementation. The genuinely new work is Physical Division sub-parcel editing, Joint Ownership income calculator, and the PDF Settlement Plan section.

## Common Pitfalls

### Pitfall 1: Property Type Breaking Change
**What goes wrong:** Adding `settlement` field to Property breaks existing property initialization, JSON import/export, and the Zustand persist hydration.
**Why it happens:** Property is used in wizardStore (persisted), JSON export schema, JSON import validation, and PDF extraction.
**How to avoid:** Add `settlement: null` as default. Update `addProperty()` in wizardStore. Update `validateProperty()` in importData.ts to handle missing `settlement` field gracefully (default to null). Update `extractExportData` and ExportData to include settlement. Bump SCHEMA_VERSION if needed (existing imports should handle missing field).
**Warning signs:** TypeScript errors across property creation sites; old localStorage data causing crashes on hydrate.

### Pitfall 2: Sub-Parcel Total Exceeding Property Value
**What goes wrong:** User creates sub-parcels whose total appraised value exceeds or falls short of the property value, leading to incorrect compensation calculations.
**Why it happens:** Sub-parcel values are free-form user input, not constrained.
**How to avoid:** Show a clear comparison: "Total sub-parcel value: X / Property value: Y" with visual indicator. Calculate compensation based on actual sub-parcel values vs Faraid target values. Do NOT enforce exact match -- the point is showing how unequal-sized plots can have different values.
**Warning signs:** Compensation amounts that don't make sense relative to property value.

### Pitfall 3: Settlement Method Not Persisting After Page Navigation
**What goes wrong:** Settlement data stored in component state is lost when navigating away from distribution page.
**Why it happens:** If settlement is stored in local component state instead of wizardStore.
**How to avoid:** Settlement MUST be stored on the Property object in wizardStore (which has persist middleware). This way it survives page navigation, browser refresh, and JSON export/import.
**Warning signs:** Settlement choices resetting when user goes to Results and comes back.

### Pitfall 4: Installment Division Rounding
**What goes wrong:** Dividing BDT 100,000 by 3 installments gives 33,333.33 repeating. Rounding each installment up/down can cause total to not match.
**Why it happens:** Integer BDT division with remainders.
**How to avoid:** Use `Math.round(total / count)` for per-installment, then display total as the original amount. Don't try to make installments add up exactly -- show "approximately X per installment" or make the last installment absorb the remainder.
**Warning signs:** Installment amounts x count not equaling total compensation.

### Pitfall 5: Physical Division Auto-Suggest Confusion
**What goes wrong:** Auto-suggested sub-parcel count (based on heir count) creates confusing default when there are many heir types.
**Why it happens:** If 5 heir groups exist, suggesting 5 sub-parcels may not make sense for a small plot.
**How to avoid:** Auto-suggest is just a hint. Start with the simplest: suggest number of heir groups. Pre-fill target values per Faraid shares. Let user freely add/remove. Show clear "this is a suggestion" language.
**Warning signs:** Users confused by auto-generated parcels that don't match their physical land layout.

### Pitfall 6: Distribution Board Property Card Integration
**What goes wrong:** Settlement panel disrupts the DnD drag behavior on property cards.
**Why it happens:** Settlement panel expand/collapse events could conflict with dnd-kit's drag activation.
**How to avoid:** Settlement panel should be BELOW the drag handle area. Use a click handler on a dedicated "Settlement" button/section, not on the card itself. The drag sensors have `distance: 5` and `delay: 500ms` activation constraints that should prevent accidental expansion.
**Warning signs:** Unable to drag properties after settlement panel is added; accidental expand when trying to drag.

### Pitfall 7: JSON Schema Backward Compatibility
**What goes wrong:** Existing saved data and exported JSON files don't have the `settlement` field, causing import failures.
**Why it happens:** Property type changes.
**How to avoid:** In `validateProperty()` (importData.ts), treat missing `settlement` as `null`. The existing pattern already handles missing optional fields gracefully. No need to bump SCHEMA_VERSION since the field is optional and defaults to null.
**Warning signs:** Import validation errors on old JSON files.

## Code Examples

### Settlement on Property Type
```typescript
// Extend Property in src/core/land/types.ts
// Source: existing Property interface pattern

export interface Property {
  id: string
  nickname: string
  type: PropertyType | null
  division: Division | null
  upazila: string | null
  rateSource: 'govt' | 'manual'
  landAreaSqft: number
  landInputUnit: LandUnit
  landValue: number
  house: HouseDetail | null
  trees: TreeDetail | null
  pond: PondDetail | null
  settlement: LandSettlement | null  // NEW
}
```

### Sell & Split Detail Component Pattern
```typescript
// Follows the sell_divide detail in IndivisibleCard.tsx
// Source: src/components/assets/IndivisibleCard.tsx lines 168-180

function SellSplitDetail({ propertyValue, actualSalePrice, shares, onSalePriceChange }) {
  const effectiveValue = actualSalePrice ?? propertyValue
  const payouts = calculateSellSplit(effectiveValue, shares)

  return (
    <div className="space-y-1 rounded-lg bg-white p-3">
      {/* Optional sale price override */}
      <PropertyValueInput value={actualSalePrice} onChange={onSalePriceChange} />
      {/* Per-heir payouts */}
      {payouts.map(p => (
        <div key={p.heirType} className="flex justify-between text-sm">
          <span>{HEIR_TYPE_LABELS[p.heirType]}</span>
          <span className="font-medium text-emerald-700">BDT {formatBDT(p.amount)}</span>
        </div>
      ))}
    </div>
  )
}
```

### Buyout with Installment Calculation
```typescript
// Extends calculateBuyout pattern from src/core/assets/indivisible.ts
// No interest -- Islamic finance compliant

export interface LandBuyoutResult extends BuyoutCalculation {
  installmentPlan: {
    perInstallment: number
    count: number
    totalOwed: number
  } | null
}

export function calculateLandBuyout(
  propertyValue: number,
  buyerHeirType: HeirType,
  shares: ShareResult[],
  useInstallments: boolean,
  installmentCount: number,
): LandBuyoutResult {
  const base = calculateBuyout(propertyValue, buyerHeirType, shares)
  return {
    ...base,
    installmentPlan: useInstallments ? {
      perInstallment: Math.round(base.compensationOwed / installmentCount),
      count: installmentCount,
      totalOwed: base.compensationOwed,
    } : null,
  }
}
```

### Joint Ownership Income Distribution
```typescript
// Pure function for income distribution based on Faraid shares

export function calculateIncomeDistribution(
  incomeAmount: number,
  shares: ShareResult[],
): { heirType: HeirType; amount: number; percentage: number }[] {
  const activeShares = shares.filter(s => s.shareType !== 'blocked')
  return activeShares.map(s => ({
    heirType: s.heirType,
    amount: Math.round(incomeAmount * s.totalShare.valueOf()),
    percentage: Math.round(s.totalShare.valueOf() * 10000) / 100,
  }))
}
```

### WizardStore Property Default Update
```typescript
// In wizardStore.ts addProperty action, add settlement: null
const newProperty: Property = {
  id,
  nickname: '',
  type: null,
  division: null,
  upazila: null,
  rateSource: 'manual',
  landAreaSqft: 0,
  landInputUnit: 'decimal',
  landValue: 0,
  house: null,
  trees: null,
  pond: null,
  settlement: null,  // NEW
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phase 9 LotDivisionPage (land-only division) | Phase 11 DistributionPage (unified DnD board) | Phase 11 | Settlement integrates into distribution board, not lot division page |
| Phase 10 IndivisibleCard (3 methods) | Phase 13 SettlementPanel (4 methods, land-specific) | This phase | Expanded method set with physical division and joint ownership |
| No installment support | Buyout with optional installments | This phase | Islamic finance compliant (no interest) |
| No income tracking | Joint ownership income calculator | This phase | Rent and crop income distribution |

**Deprecated/outdated:**
- `LotDivisionPage` is effectively superseded by `DistributionPage` (Phase 11 decision). Settlement panel goes on distribution board, not lot division page.
- `ResolutionMethod` type (`'sell_divide' | 'buyout' | 'qurah'`) is for movable assets only. Land settlement uses a separate `LandSettlementMethod` type.

## Discretion Recommendations

### Default Settlement State
**Recommendation:** Default to `null` (no method selected). Show a subtle "Choose settlement method" prompt with the four option cards collapsed. This matches the IndivisibleCard pattern where no method is pre-selected. Rationale: forcing a default method would confuse users who haven't decided yet.

### Installment Payment Implementation
**Recommendation:** Simple implementation. Checkbox "Pay in installments?" with a number input for installment count (preset options: 3, 6, 12, 24 months via select dropdown). Display per-installment amount and total. No complex amortization schedule -- just `total / count` with clear "No interest (Islamic finance)" label. Store `useInstallments: boolean` and `installmentCount: number` on the BuyoutSettlement.

### Crop Income Period
**Recommendation:** Use annual total as default with simple period selector (monthly/yearly). Agricultural land in Bangladesh typically has 2-3 cropping seasons per year (Aus, Aman, Boro rice), but tracking seasonal breakdown adds complexity without clear value for inheritance division. Show annual income entry with optional toggle to "monthly" for rent. This keeps the UI simple while covering the main use case.

### Joint Ownership PDF Detail Level
**Recommendation:** Medium detail. Include: ownership percentages per heir, income type and amount if configured, and per-heir income distribution. Skip formal co-ownership agreement language (that requires legal expertise). Add a note: "Formal co-ownership agreement recommended -- consult a lawyer for legal documentation."

### Settlement Method Selector Styling
**Recommendation:** Match the IndivisibleCard pattern exactly: four cards in a 2x2 grid (sm:grid-cols-2 on mobile, sm:grid-cols-4 on desktop), with icon + label, emerald border when selected, gray when unselected. Expand detail below with AnimatePresence. This is a proven pattern in the codebase.

### Mobile Responsive Layout
**Recommendation:** Settlement panel is a full-width expandable section below each property card in the distribution board. On mobile, the four method cards stack as 2x2 grid. Detail sections are full-width. Sub-parcel editor in physical division uses a simple card list (not a table) on mobile.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1 |
| Config file | vite.config.ts (merged Vite+Vitest config) |
| Quick run command | `npx vitest run src/core/land/__tests__/settlement.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| P13-01 | Sell & Split calculates per-heir payout from property value and Faraid shares | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "sellSplit"` | No - Wave 0 |
| P13-02 | Sell & Split recalculates when actual sale price entered | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "actualSalePrice"` | No - Wave 0 |
| P13-03 | Physical Division computes target sub-parcel values from Faraid shares | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "subParcelTargets"` | No - Wave 0 |
| P13-04 | Physical Division cash compensation for sub-parcel value imbalance | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "physicalCompensation"` | No - Wave 0 |
| P13-05 | Buyout compensation extends calculateBuyout for land | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "landBuyout"` | No - Wave 0 |
| P13-06 | Buyout installment calculation (no interest) | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "installment"` | No - Wave 0 |
| P13-07 | Joint Ownership percentages match Faraid shares | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "ownershipShares"` | No - Wave 0 |
| P13-08 | Joint Ownership income distribution proportional to shares | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "incomeDistribution"` | No - Wave 0 |
| P13-09 | Property type accepts settlement field (null default) | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "propertySettlement"` | No - Wave 0 |
| P13-10 | JSON import handles missing settlement field gracefully | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -t "settlement"` | No - Wave 0 |
| P13-11 | Settlement panel renders in distribution board | manual-only | N/A - visual integration test | N/A |
| P13-12 | PDF settlement section renders per-property details | manual-only | N/A - PDF rendering | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run src/core/land/__tests__/settlement.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/core/land/__tests__/settlement.test.ts` -- covers P13-01 through P13-09
- [ ] Update `src/core/json/__tests__/importData.test.ts` -- covers P13-10 (add settlement field handling test)

## Open Questions

1. **Sub-parcel area unit flexibility**
   - What we know: Properties store area in sqft internally, display in user-chosen unit. Sub-parcels need name + area + appraised value.
   - What's unclear: Should sub-parcels use the parent property's LandUnit or allow independent unit selection?
   - Recommendation: Use the parent property's division and landInputUnit for consistency. Sub-parcel area entry should use the same unit system. Simpler UX.

2. **Settlement data in distribution store fingerprint**
   - What we know: distributionStore fingerprint uses property IDs + values for staleness detection.
   - What's unclear: Should settlement changes trigger distribution recalculation?
   - Recommendation: No. Settlement is metadata about HOW a property is resolved, not about its VALUE in the distribution. The distribution board assigns properties to heir groups; settlement is a separate layer that describes what happens after assignment. Keep fingerprint as-is.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/core/assets/types.ts` - IndivisibleResolution discriminated union pattern
- Codebase analysis: `src/core/assets/indivisible.ts` - calculateBuyout() compensation logic
- Codebase analysis: `src/components/assets/IndivisibleCard.tsx` - 3-method selector UI pattern
- Codebase analysis: `src/components/distribution/DistributionPage.tsx` - distribution board integration point
- Codebase analysis: `src/core/land/types.ts` - Property interface, computePropertyTotal()
- Codebase analysis: `src/components/pdf/extractPdfData.ts` - PDF data extraction pattern
- Codebase analysis: `src/components/pdf/pdfTypes.ts` - PDF data types
- Codebase analysis: `src/core/json/importData.ts` - JSON import validation (validateProperty)
- Codebase analysis: `src/stores/wizardStore.ts` - Property state management, addProperty/updateProperty

### Secondary (MEDIUM confidence)
- Phase 13 CONTEXT.md - User decisions and implementation constraints

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in project, no new deps needed
- Architecture: HIGH - patterns directly mirror existing IndivisibleCard, CompensationBanner, PDF sections
- Pitfalls: HIGH - identified from direct codebase analysis of Property type usage across stores, JSON, and PDF
- Discretion areas: MEDIUM - recommendations based on codebase patterns and UX judgment

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable -- all patterns are internal to this project)
