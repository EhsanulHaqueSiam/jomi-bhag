# Phase 5: Property Valuation - Research

**Researched:** 2026-03-13
**Domain:** BD government mouza rate data, estate valuation engine, per-heir monetary distribution
**Confidence:** HIGH

## Summary

Phase 5 adds property valuation intelligence to the existing property input system built in Phase 4. The core work divides into three domains: (1) a mouza rate data module that maps division+upazila+property type to BDT-per-decimal government rates, (2) integration of rate suggestions into the property entry form with upazila dropdown cascading from division, and (3) a richer results display with estate breakdown card and per-property heir distribution.

The existing codebase provides strong foundations. The `Property` type, `computePropertyTotal()`, `getAllPropertiesTotal()`, `formatBDT`/`fractionToBDT`, and the `LandAreaInput` component with its division dropdown are all ready to extend. The `HeirCard` already handles the Each/Total pattern for multi-heir groups. The main additions are: extending the `Property` type with `upazila` and `rateSource` fields, creating a mouza rate lookup module, adding the rate suggestion UI inline below land value input, replacing `EstateValueInput` with a richer breakdown card on the Results page, and adding per-property expandable sections within `HeirCard`.

**Primary recommendation:** Structure as two plans -- Plan 01 for data module + rate suggestion integration in the property form (VALP-01, VALP-02), Plan 02 for results page breakdown card + per-heir distribution detail (VALP-03, VALP-04).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Hardcoded sample data for all 8 BD division HQ districts (Dhaka, Chittagong, Rajshahi, Khulna, Barisal, Sylhet, Rangpur, Mymensingh)
- Upazila-level granularity -- rates per upazila within each district, not per-mouza or district-level averages
- Rates differentiated by property type: separate rates for agricultural, residential, and commercial land within the same upazila
- Data extracted from BD govt gazette PDFs -- expandable over time as more districts are added
- Rate unit: BDT per decimal (govt-standard unit)
- Inline suggestion below the land value input field: shows "X/decimal x Y decimal = Z total" with a "Use this rate" button
- User can ignore suggestion and type own value -- suggestion is non-blocking
- Upazila dropdown added to property form after division selection (division -> upazila cascade)
- When mouza rate data not available: subtle info message "Govt rates not available for this area"
- Suggestion only appears when division + upazila + property type are all selected AND rate data exists
- Estate breakdown card on Results page above heir cards, replacing/enhancing current EstateValueInput
- Default shows category totals: Land | Structures | Trees/Crops | Ponds | Total
- Expandable "View properties" shows per-property contribution to each category
- Override option preserved: "Override total" link lets user enter custom total
- Govt rate vs manual badge indicator on each property row (green "Govt rate" / gray "Manual")
- HeirCard shows aggregate amount by default: share x total estate value
- Expandable "View property shares" section within each heir card
- Per-property rows show: property name + heir's BDT amount
- For heirs with count > 1: each row shows "Each: X | Total (N): Y"
- When no properties but estate value entered manually: show BDT amounts normally
- When neither properties nor estate value: show fractions/percentages only with hint

### Claude's Discretion
- Exact upazila list and rate values for each district (from gazette research)
- Breakdown card visual design and animation
- Per-property expansion animation within heir cards
- Badge styling for govt rate vs manual indicators
- Upazila dropdown implementation (searchable vs plain select)
- How to handle the transition from old EstateValueInput to new breakdown card

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VALP-01 | App auto-suggests property prices from BD govt mouza rates by district/upazila | Mouza rate data module with lookup by division+upazila+propertyType; inline suggestion UI in LandAreaInput |
| VALP-02 | User can override auto-suggested price with actual market value | Non-blocking suggestion UX; rateSource field tracks 'govt' vs 'manual' on Property type |
| VALP-03 | App calculates total estate value from all property entries combined | Estate breakdown card replaces EstateValueInput; uses existing computePropertyTotal + getAllPropertiesTotal |
| VALP-04 | App shows per-heir monetary amount based on share fraction x total estate value | Per-property expandable section in HeirCard; uses ShareResult.totalShare/sharePerHeir x property values |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.x | UI framework | Already in project |
| TypeScript | 5.9.x | Type safety | Already in project |
| Zustand | 5.0.x | State management | Already in project, anti-prop-drilling pattern |
| motion/react | 12.36.x | AnimatePresence for expand/collapse | Already used in PropertyCard, QuranReference |
| TailwindCSS | 4.2.x | Styling | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fraction.js | 5.3.x | Exact share arithmetic | Already used for Faraid shares; per-property BDT = share.valueOf() * propertyTotal |
| Intl.NumberFormat('en-IN') | built-in | BDT lakh/crore formatting | All monetary display -- reuse existing formatBDT pattern |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain `<select>` for upazila | Searchable combobox (headless-ui, downshift) | Plain select is simpler and consistent with existing Division dropdown; 5-15 upazilas per district is manageable without search. Use plain select. |
| Hardcoded rate data | API/JSON file fetch | No public API exists for mouza rates; hardcoded data is the only viable option per CONTEXT.md decision |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  data/
    bd-land-data.ts        # Existing -- extend with upazila data
    mouza-rates.ts         # NEW: rate lookup by division+upazila+propertyType
  core/
    land/
      types.ts             # Extend Property with upazila + rateSource fields
      valuation.ts         # NEW: estate breakdown computation helpers
  components/
    property/
      LandAreaInput.tsx     # Extend with upazila dropdown + rate suggestion
      MouzaRateSuggestion.tsx  # NEW: inline rate suggestion component
    results/
      EstateBreakdownCard.tsx  # NEW: replaces EstateValueInput
      HeirCard.tsx             # Extend with per-property expansion
```

### Pattern 1: Mouza Rate Data Module
**What:** A typed data module exporting upazila lists and rate lookup functions per district
**When to use:** Whenever rate suggestion needs to look up a price
**Example:**
```typescript
// src/data/mouza-rates.ts
import type { Division, PropertyType } from '@/core/land/types'

export type Upazila = string  // e.g., 'savar', 'keraniganj'

export interface UpazilaInfo {
  value: Upazila
  label: string
  bangla: string
}

export interface MouzaRate {
  agricultural: number  // BDT per decimal
  residential: number
  commercial: number
}

// Division -> Upazila[] mapping
export const UPAZILA_BY_DIVISION: Record<Division, UpazilaInfo[]> = {
  dhaka: [
    { value: 'dhamrai', label: 'Dhamrai', bangla: 'ধামরাই' },
    { value: 'dohar', label: 'Dohar', bangla: 'দোহার' },
    { value: 'keraniganj', label: 'Keraniganj', bangla: 'কেরানীগঞ্জ' },
    { value: 'nawabganj', label: 'Nawabganj', bangla: 'নবাবগঞ্জ' },
    { value: 'savar', label: 'Savar', bangla: 'সাভার' },
  ],
  // ... other divisions
}

// Division -> Upazila -> MouzaRate mapping
const MOUZA_RATES: Partial<Record<Division, Record<Upazila, MouzaRate>>> = {
  dhaka: {
    savar: { agricultural: 150000, residential: 800000, commercial: 1500000 },
    keraniganj: { agricultural: 200000, residential: 1200000, commercial: 2000000 },
    // ...
  },
  // ...
}

/** Look up mouza rate. Returns null if no data. */
export function getMouzaRate(
  division: Division,
  upazila: Upazila,
  propertyType: PropertyType,
): number | null {
  const divRates = MOUZA_RATES[division]
  if (!divRates) return null
  const upazilaRate = divRates[upazila]
  if (!upazilaRate) return null
  // 'mixed' type has no single rate
  if (propertyType === 'mixed') return null
  return upazilaRate[propertyType]
}
```

### Pattern 2: Rate Suggestion Inline Component
**What:** A small component rendered below the land value input that shows rate calculation and "Use this rate" button
**When to use:** When division + upazila + propertyType are all set and rate data exists
**Example:**
```typescript
// src/components/property/MouzaRateSuggestion.tsx
interface MouzaRateSuggestionProps {
  ratePerDecimal: number
  areaInDecimals: number
  onApply: (totalValue: number) => void
}

export function MouzaRateSuggestion({ ratePerDecimal, areaInDecimals, onApply }: Props) {
  const suggestedTotal = Math.round(ratePerDecimal * areaInDecimals)
  const formatter = new Intl.NumberFormat('en-IN')

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
      <div className="text-gray-700">
        <span className="font-medium">Govt rate:</span>{' '}
        ৳{formatter.format(ratePerDecimal)}/decimal × {areaInDecimals.toFixed(2)} decimal
        = <span className="font-semibold text-emerald-700">৳{formatter.format(suggestedTotal)}</span>
      </div>
      <button onClick={() => onApply(suggestedTotal)}
        className="mt-1 text-xs font-medium text-emerald-700 underline">
        Use this rate
      </button>
    </div>
  )
}
```

### Pattern 3: Estate Breakdown Card
**What:** A card component that replaces EstateValueInput on the Results page, showing category totals with expandable per-property detail
**When to use:** On the Results page, always shown above heir cards
**Example:**
```typescript
// Compute breakdown from properties array
function computeEstateBreakdown(properties: Property[]) {
  let land = 0, structures = 0, trees = 0, ponds = 0
  for (const p of properties) {
    land += p.landValue
    if (p.house) structures += p.house.estimatedValue
    if (p.trees) {
      trees += p.trees.isItemized
        ? p.trees.items.reduce((s, i) => s + i.estimatedValue, 0)
        : p.trees.totalEstimatedValue
    }
    if (p.pond) ponds += p.pond.estimatedValue
  }
  return { land, structures, trees, ponds, total: land + structures + trees + ponds }
}
```

### Pattern 4: Per-Property Heir Distribution
**What:** Expandable section within HeirCard showing what each property contributes to that heir's share
**When to use:** When properties array is non-empty and totalEstateValue > 0
**Example:**
```typescript
// For each property, heir gets: share.totalShare.valueOf() * computePropertyTotal(property)
// For multi-heir groups: sharePerHeir.valueOf() * computePropertyTotal(property)
function computeHeirPropertyAmounts(
  share: ShareResult,
  properties: Property[],
): { property: Property; totalAmount: number; eachAmount: number }[] {
  return properties.map(p => {
    const propTotal = computePropertyTotal(p)
    const totalAmount = Math.round(share.totalShare.valueOf() * propTotal)
    const eachAmount = share.count > 1
      ? Math.round(share.sharePerHeir.valueOf() * propTotal)
      : totalAmount
    return { property: p, totalAmount, eachAmount }
  })
}
```

### Anti-Patterns to Avoid
- **Fetching rate data dynamically:** No API exists. Hardcode the data. Do not create a fake API layer.
- **Overcomplicating the Property type:** Add only `upazila` and `rateSource` fields. Do not create a nested valuation object.
- **Breaking existing auto-calc:** The existing `EstateValueInput` auto-calculates from properties. The new breakdown card must preserve this behavior exactly -- just richer display.
- **Making suggestion mandatory:** The rate suggestion must be purely advisory. Never auto-fill without user clicking "Use this rate".
- **Separate valuation store:** Do not create a new Zustand store for valuation. Extend the existing `wizardStore` with upazila setter. All property data stays in the `properties[]` array.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| BDT formatting | Custom number formatter | `Intl.NumberFormat('en-IN')` / existing `fractionToBDT()` | Already handles lakh/crore grouping correctly |
| Expand/collapse animation | CSS transitions | `motion/react` AnimatePresence | Consistent with PropertyCard, QuranReference patterns |
| Fraction arithmetic | Manual float multiplication | `fraction.js` `.valueOf()` for BDT conversion | Avoids floating-point rounding issues in share fractions |
| Area-to-decimal conversion | Manual division | Existing `fromSqft(sqft, 'decimal', division)` | Already handles the sqft-to-decimal conversion |

**Key insight:** Nearly everything this phase needs is already built in the codebase. The core work is data entry (mouza rates), type extension (2 new fields), and UI composition (reusing existing patterns in new arrangements).

## Common Pitfalls

### Pitfall 1: Rate Suggestion Shows for Mixed Type
**What goes wrong:** Mixed properties span multiple use types; there is no single govt rate.
**Why it happens:** The property type `mixed` has no corresponding mouza rate category.
**How to avoid:** `getMouzaRate()` returns null for `mixed` type. Suggestion component renders nothing when rate is null.
**Warning signs:** A rate showing for mixed-type properties.

### Pitfall 2: Area Stored as Sqft but Rates are Per Decimal
**What goes wrong:** Multiplying BDT/decimal by sqft gives wildly wrong numbers.
**Why it happens:** Internal canonical storage is sqft, but govt rates are BDT per decimal (1 decimal = 435.6 sqft).
**How to avoid:** Always convert sqft to decimal using `fromSqft(landAreaSqft, 'decimal', division)` before multiplying by rate. This is a fixed conversion (435.6 sqft/decimal) that does NOT vary by division.
**Warning signs:** Suggested values that are 435x too high or too low.

### Pitfall 3: Rounding Drift in Per-Property Distribution
**What goes wrong:** Sum of per-property heir amounts does not equal heir's total BDT amount.
**Why it happens:** Rounding `Math.round(share * propertyTotal)` for each property independently.
**How to avoid:** Accept minor rounding differences (usually 1-2 BDT). Do NOT try to force-balance. The aggregate display uses `fractionToBDT(share, totalEstateValue)` which rounds the overall amount. Per-property breakdown is informational, not exact.
**Warning signs:** Total of per-property amounts differs from aggregate by more than property count BDT.

### Pitfall 4: Breaking the Override Flow
**What goes wrong:** The new breakdown card loses the ability to override total estate value.
**Why it happens:** `EstateValueInput` has `isOverriding` state that switches between auto-calc and manual entry.
**How to avoid:** The new `EstateBreakdownCard` must preserve the same override pattern: show auto-calculated breakdown by default, provide "Override total" link that switches to manual input mode. When overriding, the breakdown categories still display but the total is user-entered.
**Warning signs:** User cannot enter a custom total when they disagree with the property-based calculation.

### Pitfall 5: Upazila Dropdown Not Resetting on Division Change
**What goes wrong:** User selects Dhaka -> Savar, then switches to Rajshahi. Upazila still shows "Savar" which does not exist in Rajshahi.
**Why it happens:** Upazila value persists across division changes.
**How to avoid:** When division changes, clear the upazila field (set to null). This also clears the rate suggestion since upazila is required for lookup.
**Warning signs:** Rate suggestion showing rates from the wrong district.

### Pitfall 6: Rate Suggestion Flickers During Input
**What goes wrong:** As user types area, rate suggestion recalculates on every keystroke showing rapidly changing numbers.
**Why it happens:** Area change triggers re-render of suggestion component on each character.
**How to avoid:** This is acceptable behavior -- the suggestion should update live as the area changes. The math is simple multiplication, no debouncing needed. But ensure the suggestion only shows when area > 0.
**Warning signs:** Suggestion showing "0/decimal x 0 = 0".

## Code Examples

### Extending Property Type
```typescript
// In src/core/land/types.ts -- add two fields
export interface Property {
  id: string
  nickname: string
  type: PropertyType | null
  division: Division | null
  upazila: string | null          // NEW
  rateSource: 'govt' | 'manual'   // NEW
  landAreaSqft: number
  landInputUnit: LandUnit
  landValue: number
  house: HouseDetail | null
  trees: TreeDetail | null
  pond: PondDetail | null
}
```

### Updating wizardStore.addProperty()
```typescript
addProperty: () => {
  const id = crypto.randomUUID()
  const newProperty: Property = {
    id,
    nickname: '',
    type: null,
    division: null,
    upazila: null,          // NEW
    rateSource: 'manual',   // NEW: default to manual until govt rate applied
    landAreaSqft: 0,
    landInputUnit: 'decimal',
    landValue: 0,
    house: null,
    trees: null,
    pond: null,
  }
  // ...
}
```

### Estate Breakdown Computation
```typescript
// src/core/land/valuation.ts
import type { Property } from './types'
import { computePropertyTotal } from './types'

export interface EstateBreakdown {
  land: number
  structures: number
  trees: number
  ponds: number
  total: number
  byProperty: {
    property: Property
    land: number
    structures: number
    trees: number
    ponds: number
    total: number
  }[]
}

export function computeEstateBreakdown(properties: Property[]): EstateBreakdown {
  const byProperty = properties.map(p => {
    const treesVal = p.trees
      ? p.trees.isItemized
        ? p.trees.items.reduce((s, i) => s + i.estimatedValue, 0)
        : p.trees.totalEstimatedValue
      : 0
    return {
      property: p,
      land: p.landValue,
      structures: p.house?.estimatedValue ?? 0,
      trees: treesVal,
      ponds: p.pond?.estimatedValue ?? 0,
      total: computePropertyTotal(p),
    }
  })

  return {
    land: byProperty.reduce((s, p) => s + p.land, 0),
    structures: byProperty.reduce((s, p) => s + p.structures, 0),
    trees: byProperty.reduce((s, p) => s + p.trees, 0),
    ponds: byProperty.reduce((s, p) => s + p.ponds, 0),
    total: byProperty.reduce((s, p) => s + p.total, 0),
    byProperty,
  }
}
```

### Division Change Clearing Upazila
```typescript
// In LandAreaInput.tsx handleDivisionChange
const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const newDiv = e.target.value as Division
  if (!newDiv) return
  // Recompute sqft from current display value with new division
  const currentDisplay = /* ... existing logic ... */
  const newSqft = currentDisplay > 0 ? toSqft(currentDisplay, landInputUnit, newDiv) : 0
  updateProperty(propertyId, {
    division: newDiv,
    landAreaSqft: newSqft,
    upazila: null,        // Clear upazila on division change
    rateSource: 'manual', // Reset rate source since location changed
  })
}
```

### Per-Heir Property Distribution in HeirCard
```typescript
// Inside HeirCard, new expandable section
const properties = useWizardStore(s => s.properties)
const [showProperties, setShowProperties] = useState(false)

// Only show when properties exist and estate value > 0
const hasPropertyBreakdown = properties.length > 0 && totalEstateValue > 0

// For each property, compute heir's monetary amount
const propertyAmounts = properties.map(p => {
  const propTotal = computePropertyTotal(p)
  return {
    name: p.nickname || getAutoLabel(p.type, /* index */),
    eachAmount: Math.round(share.sharePerHeir.valueOf() * propTotal),
    totalAmount: Math.round(share.totalShare.valueOf() * propTotal),
  }
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single estate value input | Auto-calc from properties + override | Phase 4 (current) | EstateValueInput already handles this |
| Flat property list | Properties with sub-sections | Phase 4 (current) | PropertyCard already has house/trees/ponds |
| Division-only location | Division + Upazila | Phase 5 (this phase) | Enables rate lookup |
| Manual land value only | Govt rate suggestion + manual | Phase 5 (this phase) | VALP-01/02 |

**Key context on BD mouza rates:**
- Official rates were last comprehensively set in 2016 by the Directorate of Registration
- Rates are organized by mouza within each sub-registrar office area
- Official rates are typically significantly lower than actual market prices
- The app provides these as minimum reference points, not market valuations
- Rate data is published in gazette PDFs, not via API -- hardcoding is the only approach
- Categories in gazettes: typically homestead/elevated, agricultural, commercial, with more granular sub-categories

## BD District HQ Upazila Data (Research Findings)

For the 8 division HQ districts, verified upazila counts:

| Division (District) | Upazilas | Example Upazilas |
|---------------------|----------|-------------------|
| Dhaka | 5 | Dhamrai, Dohar, Keraniganj, Nawabganj, Savar |
| Chittagong | 15 | Anwara, Banshkhali, Boalkhali, Fatikchhari, Hathazari, Mirsharai, Patiya, Rangunia, Raozan, Sandwip, Satkania, Sitakunda, Chandanaish, Lohagara, (+1 more) |
| Rajshahi | ~10 | Bagha, Bagmara, Charghat, Durgapur, Godagari, Mohanpur, Paba, Puthia, Tanore |
| Khulna | ~10 | Batiaghata, Dacope, Dumuria, Dighalia, Koyra, Paikgachha, Phultala, Rupsa, Terokhada |
| Barisal | ~10 | Agailjhara, Babuganj, Bakerganj, Banaripara, Gaurnadi, Hizla, Mehendiganj, Muladi, Wazirpur |
| Sylhet | ~13 | Balaganj, Beanibazar, Bishwanath, Companiganj, Fenchuganj, Golapganj, Gowainghat, Jaintiapur, Kanaighat, Osmani Nagar, South Surma, Zakiganj |
| Rangpur | ~8 | Badarganj, Gangachara, Kaunia, Mithapukur, Pirgachha, Pirganj, Taraganj |
| Mymensingh | ~13 | Bhaluka, Dhobaura, Fulbaria, Gaffargaon, Gauripur, Haluaghat, Ishwarganj, Muktagachha, Nandail, Phulpur, Trishal |

**Confidence: MEDIUM** -- upazila lists sourced from web search, cross-referenced with multiple sources. Exact counts should be validated during implementation. Rate values will need to be researched from gazette PDFs or reference sites -- use realistic representative values for the 8 districts.

## Mouza Rate Data Strategy

Since no public API exists and gazette PDFs are the only source, the recommended approach:

1. **Data structure:** `Record<Division, Record<Upazila, MouzaRate>>` where `MouzaRate = { agricultural: number, residential: number, commercial: number }` (BDT per decimal)
2. **Completeness:** Cover all upazilas for the 8 division HQ districts. ~80-90 total upazilas.
3. **Rate values:** Use realistic representative rates. Dhaka area rates are highest (100K-2M+ per decimal), rural areas lowest (10K-100K per decimal). Agricultural < Residential < Commercial in all areas.
4. **Mixed type:** No rate for mixed -- return null from lookup, show "enter manually" message.
5. **Expandability:** The data structure supports adding more districts later by adding entries to the Record.

**Typical rate ranges by area:**
- Dhaka district upazilas: Agricultural 80K-300K, Residential 500K-5M+, Commercial 1M-10M+ per decimal
- Other division HQs: Agricultural 20K-100K, Residential 100K-800K, Commercial 200K-2M per decimal
- Note: These are government minimum rates, not market prices. Actual prices can be 2-10x higher.

## Open Questions

1. **Exact rate values per upazila**
   - What we know: Rate structure (agricultural/residential/commercial per decimal), approximate ranges by area
   - What's unclear: Precise BDT values for each of the ~80 upazila entries
   - Recommendation: Use realistic representative values. The app clearly labels these as "Govt rate" (not market price). Values should be internally consistent (rural < suburban < urban) and realistic. Claude can research specific rates during implementation from gazette reference sites.

2. **Upazila dropdown for division HQ city areas**
   - What we know: Some division capitals (Dhaka, Chittagong) have city corporation areas that are not technically "upazilas"
   - What's unclear: Whether to include metro/city corporation areas as pseudo-upazilas
   - Recommendation: Include the city corporation area as a separate entry (e.g., "Dhaka City Corp" for Dhaka, "Chittagong City Corp" for Chittagong). This is where many users' properties will be.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.x + @testing-library/react 16.3.x |
| Config file | vite.config.ts (test section) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VALP-01 | getMouzaRate returns correct BDT/decimal for division+upazila+type | unit | `npx vitest run src/data/__tests__/mouza-rates.test.ts -x` | Wave 0 |
| VALP-01 | Rate suggestion appears when division+upazila+type set and rate exists | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | Wave 0 |
| VALP-01 | Rate suggestion hidden when data unavailable (wrong location or mixed type) | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | Wave 0 |
| VALP-02 | User can type own value ignoring suggestion; rateSource tracks 'manual' vs 'govt' | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | Wave 0 |
| VALP-02 | "Use this rate" button auto-fills land value and sets rateSource to 'govt' | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | Wave 0 |
| VALP-03 | computeEstateBreakdown returns correct category totals | unit | `npx vitest run src/core/land/__tests__/valuation.test.ts -x` | Wave 0 |
| VALP-03 | Estate breakdown card shows Land/Structures/Trees/Ponds/Total | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | Wave 0 |
| VALP-03 | Override flow preserved in new breakdown card | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | Wave 0 |
| VALP-04 | Per-property amounts in HeirCard match share x propertyTotal | unit | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | Wave 0 |
| VALP-04 | Each/Total pattern for multi-heir groups in per-property rows | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | Wave 0 |
| VALP-04 | Hint shown when no properties and no estate value entered | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/data/__tests__/mouza-rates.test.ts` -- covers VALP-01 (rate lookup unit tests)
- [ ] `src/core/land/__tests__/valuation.test.ts` -- covers VALP-03 (breakdown computation)
- [ ] `src/components/__tests__/valuation.test.tsx` -- covers VALP-01/02/03/04 (integration tests)

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/core/land/types.ts`, `src/data/bd-land-data.ts`, `src/stores/wizardStore.ts`, `src/components/results/EstateValueInput.tsx`, `src/components/results/HeirCard.tsx`, `src/components/property/LandAreaInput.tsx`
- Phase 5 CONTEXT.md -- user decisions and integration points

### Secondary (MEDIUM confidence)
- [ReportBD mouza rate article](https://reportbd.net/mouza-rate-by-district-bd/) -- confirms gazette-based rate structure
- [InfoJashore mouza rate calculator](https://www.infojashore.com/mowjarate) -- confirms upazila-level granularity with land type categories
- [Business Insider BD article](https://www.businessinsiderbd.com/bangladesh/news/30761/market-value-of-land-likely-to-determine-official-prices) -- confirms rates last comprehensively set in 2016
- [Chittagong gov upazila list](https://www.chittagong.gov.bd/en/site/page/4aSX-%E0%A6%89%E0%A6%AA%E0%A6%9C%E0%A7%87%E0%A6%B2%E0%A6%BE%E0%A6%B0-%E0%A6%A4%E0%A6%BE%E0%A6%B2%E0%A6%BF%E0%A6%95%E0%A6%BE) -- 15 upazilas in Chittagong district
- [Dhaka district info](http://www.kabirhat.com/bangladesh-district/dhaka.html) -- 5 upazilas in Dhaka district
- [BD land ministry mouza page](https://minland.gov.bd/site/page/c14f084e-8974-4255-8183-bae66d436ebb/nolink/%E0%A6%AE%E0%A7%8C%E0%A6%9C%E0%A6%BE) -- official ministry reference

### Tertiary (LOW confidence)
- Exact BDT rate values per upazila -- will need gazette PDF research during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all patterns established in prior phases
- Architecture: HIGH -- extending existing types and components, clear integration points
- Mouza rate data structure: HIGH -- confirmed upazila-level, per-property-type structure from multiple sources
- Mouza rate values: LOW -- specific BDT amounts need gazette research, will use representative values
- Upazila lists: MEDIUM -- sourced from web, cross-verified, but exact completeness not guaranteed
- Pitfalls: HIGH -- directly derived from codebase analysis (sqft vs decimal, override flow, etc.)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable domain, no fast-moving dependencies)
