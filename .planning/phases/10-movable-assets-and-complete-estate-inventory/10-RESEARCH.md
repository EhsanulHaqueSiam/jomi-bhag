# Phase 10: Movable Assets and Complete Estate Inventory - Research

**Researched:** 2026-03-13
**Domain:** Movable asset input forms, gold/silver valuation, indivisible asset handling, estate integration
**Confidence:** HIGH

## Summary

Phase 10 extends the existing Step 4 (Properties) to become a full "Estate Inventory" with two sections: Land & Properties (existing) and Movable Assets (new). The phase introduces typed asset categories (gold/silver, cash, vehicles, jewelry, furniture, livestock, custom), each with category-specific input forms. Gold/silver has the most complex form with weight-in-vori, purity selection, and transparent rate calculation. Indivisible assets (vehicles, jewelry pieces, livestock, custom items) get per-item resolution cards offering three Islamic options: sell & divide, heir-buyout, or Qurah lot drawing.

The existing codebase provides strong patterns to follow: PropertyCard's expand/collapse pattern for asset cards, MouzaRateSuggestion's "transparent math + Use this rate" pattern for gold rate suggestion, StepperButton for livestock count, PropertyValueInput for BDT inputs, and the Phase 9 Qurah ceremony for indivisible asset lot drawing. The Zustand store extension follows the established individual-setter pattern with persist partialize.

**Primary recommendation:** Model movable assets as a typed union (discriminated by category), store them in a new `movableAssets` array on WizardState, and expose a `getMovableAssetsTotal()` action that `getAllPropertiesTotal()` (renamed conceptually to `getTotalEstateValue()`) aggregates with property totals.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Core BD categories: gold/silver, cash/bank deposits, vehicles, jewelry (non-gold), furniture/household items, livestock, plus a "Custom" category for anything else
- Gold/silver: weight (default Vori/11.664g, switchable to grams/tola) + purity (24K, 22K, 18K) + auto-calculated value from hardcoded BD market rate. User can override value
- Vehicles: type dropdown (car, motorcycle, CNG/auto-rickshaw, truck, bicycle, boat) + estimated market value
- Livestock: type dropdown (cow, goat, chicken, duck, pigeon, fish pond stock) + count + per-unit estimated value. Total auto-calculated
- Custom items: multiple free-form entries, each with name + value (e.g., "Sewing machine 15,000", "Generator 40,000")
- Cash/bank deposits: simple BDT value entry
- Furniture/household: simple BDT value entry (lump sum)
- Jewelry (non-gold): simple BDT value entry
- Auto-flag by category: vehicles, individual jewelry pieces, livestock, and custom items flagged as indivisible. Gold/silver by weight and cash always divisible. User can override the flag
- Per-item choice cards for each indivisible item: three option cards -- "Sell & Divide" (show per-heir amount), "Buyout" (select heir group from dropdown, app calculates compensation), "Qurah" (Islamic lot drawing)
- Buyout: user selects which heir group buys via dropdown. App calculates what that group pays each other group
- Qurah: reuse the same gold-accented, bismillah, staggered-reveal ceremony from Phase 9
- Movable assets live in the same Step 4 as properties -- expand step from "Properties" to "Estate Inventory" with two sections/tabs: "Land & Properties" (existing) + "Movable Assets" (new)
- Fully optional -- user can skip movable assets entirely, just like properties. App works with land only, movable only, both, or neither (fractions-only mode)
- Enhanced estate breakdown card on Results: Land: X | Structures: Y | Trees: Z | Movable Assets: W | Total: T. Expandable for per-category movable detail
- Per-heir cards extend with movable asset breakdown: HeirCard's expandable section shows per-asset amounts alongside per-property amounts
- Gold/silver: hardcoded BD market rate per vori (updated with app releases, not live API). Matches Phase 5 mouza rate pattern -- suggestion, not requirement
- Default gold unit: Vori (BD standard). Dropdown to switch to grams or tola. Live conversion display below input (matching Phase 4 land unit pattern)
- Transparent math inline: "110,000/vori x 5.5 vori x 22K purity = 605,000". User sees exactly how value is computed (matching Phase 5 rate transparency)
- No external API dependencies -- all prices hardcoded for offline reliability

### Claude's Discretion
- Exact gold/silver market rates to hardcode
- Tab vs section layout for Land/Movable within Step 4
- Indivisible item card styling and option card design
- Livestock type list and common BD species
- Vehicle type icons
- Mobile layout for asset entry forms
- How movable asset totals flow into existing `getAllPropertiesTotal()` computation
- PDF section additions for movable assets

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.4 | UI framework | Already in project |
| TypeScript | ~5.9.3 | Type safety | Already in project |
| Zustand | ^5.0.11 | State management | Already in project, persist middleware used |
| TailwindCSS | ^4.2.1 | Styling | Already in project |
| motion/react | ^12.36.0 | Animations (expand/collapse) | Already in project for AnimatePresence |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-pdf/renderer | ^4.3.2 | PDF export | Extend existing PDF for movable assets section |
| fraction.js | ^5.3.4 | Exact fraction arithmetic | Share calculations on combined estate |
| Intl.NumberFormat | Built-in | BDT formatting (en-IN) | All monetary display (lakh/crore grouping) |

### No New Dependencies
This phase requires zero new npm packages. All functionality builds on the existing stack. The primary work is new TypeScript types, Zustand store extensions, and React components following established patterns.

## Architecture Patterns

### Recommended Project Structure
```
src/
  core/
    assets/
      types.ts              # MovableAsset union type, category types, helpers
      valuation.ts           # computeMovableAssetsTotal(), computeAssetValue()
      indivisible.ts         # IndivisibleResolution type, buyout/sell calculations
      __tests__/
        types.test.ts
        valuation.test.ts
        indivisible.test.ts
  data/
    movable-asset-data.ts    # Gold rates, vehicle types, livestock types, category metadata
  components/
    assets/
      StepEstateInventory.tsx # Tab/section wrapper replacing StepProperties in WizardShell
      MovableAssetList.tsx    # List of asset cards with add-asset controls
      MovableAssetCard.tsx    # Expand/collapse card per asset (like PropertyCard)
      GoldSilverForm.tsx      # Weight + purity + rate calculation form
      VehicleForm.tsx         # Vehicle type + value form
      LivestockForm.tsx       # Type + count + per-unit value form
      CustomItemForm.tsx      # Name + value free-form entries
      SimpleValueForm.tsx     # Cash / furniture / jewelry BDT-only form
      GoldUnitConversion.tsx  # Live conversion display (vori/gram/tola)
      GoldRateSuggestion.tsx  # Transparent math display + "Use this rate"
      IndivisibleCard.tsx     # Per-item resolution (sell/buyout/qurah) cards
      AssetRunningTotal.tsx   # Running total for movable assets section
    __tests__/
      assets.test.tsx         # Tests for movable asset components
```

### Pattern 1: Discriminated Union for Asset Categories
**What:** Model each asset type as a discriminated union on `category` field
**When to use:** Any time you need category-specific data shapes
**Example:**
```typescript
// src/core/assets/types.ts
export type GoldUnit = 'vori' | 'gram' | 'tola'
export type GoldPurity = '24K' | '22K' | '18K'
export type VehicleType = 'car' | 'motorcycle' | 'cng_rickshaw' | 'truck' | 'bicycle' | 'boat'
export type LivestockType = 'cow' | 'goat' | 'chicken' | 'duck' | 'pigeon' | 'fish_pond'

export type AssetCategory =
  | 'gold_silver'
  | 'cash'
  | 'vehicle'
  | 'jewelry'
  | 'furniture'
  | 'livestock'
  | 'custom'

export interface BaseAsset {
  id: string
  category: AssetCategory
  isIndivisible: boolean        // auto-set by category, user can override
  indivisibleResolution: IndivisibleResolution | null
}

export interface GoldSilverAsset extends BaseAsset {
  category: 'gold_silver'
  metalType: 'gold' | 'silver'
  weight: number                // in current unit
  weightUnit: GoldUnit          // default 'vori'
  purity: GoldPurity
  useAutoRate: boolean
  overrideValue: number | null  // user override of calculated value
}

export interface CashAsset extends BaseAsset {
  category: 'cash'
  value: number
}

export interface VehicleAsset extends BaseAsset {
  category: 'vehicle'
  vehicleType: VehicleType
  description: string           // optional description
  estimatedValue: number
}

export interface JewelryAsset extends BaseAsset {
  category: 'jewelry'
  value: number
}

export interface FurnitureAsset extends BaseAsset {
  category: 'furniture'
  value: number
}

export interface LivestockAsset extends BaseAsset {
  category: 'livestock'
  livestockType: LivestockType
  count: number
  perUnitValue: number
}

export interface CustomAsset extends BaseAsset {
  category: 'custom'
  name: string
  estimatedValue: number
}

export type MovableAsset =
  | GoldSilverAsset
  | CashAsset
  | VehicleAsset
  | JewelryAsset
  | FurnitureAsset
  | LivestockAsset
  | CustomAsset
```

### Pattern 2: Indivisible Resolution Type
**What:** Each indivisible asset gets a resolution choice
**When to use:** For vehicles, livestock, jewelry, custom items flagged as indivisible
**Example:**
```typescript
export type ResolutionMethod = 'sell_divide' | 'buyout' | 'qurah'

export interface SellDivideResolution {
  method: 'sell_divide'
}

export interface BuyoutResolution {
  method: 'buyout'
  buyerHeirType: HeirType       // which heir group buys
}

export interface QurahResolution {
  method: 'qurah'
  assignedHeirType: HeirType | null  // set after drawing
}

export type IndivisibleResolution =
  | SellDivideResolution
  | BuyoutResolution
  | QurahResolution
```

### Pattern 3: Store Extension (Following wizardStore Pattern)
**What:** Add movable assets to WizardState with CRUD actions
**When to use:** Extending the wizard store
**Example:**
```typescript
// In WizardState interface:
movableAssets: MovableAsset[]
expandedAssetId: string | null

// In WizardActions interface:
addMovableAsset: (category: AssetCategory) => string
removeMovableAsset: (id: string) => void
updateMovableAsset: (id: string, patch: Partial<MovableAsset>) => void
setExpandedAssetId: (id: string | null) => void
getMovableAssetsTotal: () => number

// getAllPropertiesTotal becomes getFullEstateTotal:
// returns computePropertiesTotal() + getMovableAssetsTotal()
```

### Pattern 4: Tab/Section Layout for Step 4
**What:** StepEstateInventory wraps both StepProperties and MovableAssetList
**When to use:** Step 4 rendering in WizardShell
**Recommendation:** Use section layout (vertically stacked with clear headers) rather than tabs. Rationale: on mobile, tabs add navigation complexity; sections let the user scroll through everything naturally. The two sections have clear headers with dividers.
**Example:**
```typescript
// StepEstateInventory.tsx
export function StepEstateInventory() {
  return (
    <div className="space-y-8">
      {/* Section 1: Land & Properties */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Land & Properties
        </h3>
        <StepProperties />
      </section>

      <div className="border-t border-gray-200" />

      {/* Section 2: Movable Assets */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Movable Assets
        </h3>
        <MovableAssetList />
      </section>
    </div>
  )
}
```

### Pattern 5: Transparent Gold Math (Following MouzaRateSuggestion)
**What:** Show computation breakdown inline: "rate x weight x purity = value"
**When to use:** Gold/silver form when rate, weight, and purity are all set
**Example:**
```typescript
// GoldRateSuggestion.tsx
function GoldRateSuggestion({ rate, weight, purity, onApply }) {
  const purityFactor = PURITY_FACTORS[purity] // { '24K': 1.0, '22K': 0.9167, '18K': 0.75 }
  const calculated = Math.round(rate * weight * purityFactor)
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
      <div className="text-gray-700">
        &#2547;{format(rate)}/vori &times; {weight} vori &times; {purity} purity ={' '}
        <span className="font-semibold text-emerald-700">&#2547;{format(calculated)}</span>
      </div>
      <button onClick={() => onApply(calculated)} className="...">Use this rate</button>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Separate Zustand store for movable assets:** Don't create a movableAssetsStore. Keep all wizard state in wizardStore for unified persist/serialization. The divisionStore is separate because it's ephemeral; movable assets must persist.
- **Deeply nested state updates:** Don't mutate nested asset objects in place. Use the same `updateMovableAsset(id, patch)` pattern as `updateProperty(id, patch)`.
- **Complex category-specific store actions:** Don't create `setGoldWeight`, `setVehicleType`, etc. Use a single `updateMovableAsset` with partial patches. Category-specific logic lives in components, not the store.
- **Re-implementing the Qurah ceremony:** Reuse `QurahCeremony` component from Phase 9. Don't duplicate the bismillah, staggered reveal, or Fisher-Yates shuffle.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| BDT formatting | Custom number formatter | `Intl.NumberFormat('en-IN')` | Already used throughout, handles lakh/crore grouping |
| Expand/collapse animation | Manual CSS transitions | `AnimatePresence + motion.div` from motion/react | Already used in PropertyCard, HeirCard |
| BDT input with blur/focus | Custom input component | `PropertyValueInput` component | Already exists, reusable |
| Count stepper (livestock) | Custom +/- buttons | `StepperButton` component | Already exists with Tooltip support |
| UUID generation | Custom ID logic | `crypto.randomUUID()` | Already used in addProperty |
| Qurah ceremony UI | New ceremony component | `QurahCeremony` from division/ | Already built with bismillah, gold accent |
| Fisher-Yates shuffle | Custom randomization | `qurahShuffle` from division.ts | Already implemented and tested |

**Key insight:** This phase is primarily a data modeling + form-building exercise. Nearly all infrastructure (animation, input patterns, styling, Qurah ceremony, PDF generation pipeline) already exists and should be reused, not rebuilt.

## Common Pitfalls

### Pitfall 1: Store Persist Partialize Breakage
**What goes wrong:** Adding new fields to WizardState without adding them to the `partialize` function in wizardStore causes them to not persist to localStorage.
**Why it happens:** The persist middleware's `partialize` function explicitly lists every field. New fields are silently dropped.
**How to avoid:** When adding `movableAssets` and `expandedAssetId` to WizardState, also add them to the `partialize` object in the `persist()` config.
**Warning signs:** Movable assets disappear on page refresh.

### Pitfall 2: Scenario Fingerprint Not Updated
**What goes wrong:** The scenariosStore uses a state fingerprint for change detection. If movable assets aren't included, saving scenarios won't capture movable asset changes.
**Why it happens:** The fingerprint is computed from `JSON.stringify` of key state fields.
**How to avoid:** Update the fingerprint computation to include movable asset state (at minimum, count and total value).
**Warning signs:** "Save" button doesn't detect movable asset changes.

### Pitfall 3: Gold Purity Factor Math
**What goes wrong:** Purity factor applied incorrectly, leading to wrong gold values.
**Why it happens:** BD gold market rate per vori is already quoted for a specific purity (typically 22K). Applying purity factor to 22K rate means: 24K should cost MORE than the quoted rate, not less.
**How to avoid:** Use BAJUS standard: 22K rate is the base. 24K rate = 22K_rate / 0.9167. 18K rate = 22K_rate * (0.75 / 0.9167). Or simpler: hardcode separate rates per purity level.
**Warning signs:** 24K gold showing lower value than 22K for same weight.

### Pitfall 4: Estate Total Double-Counting
**What goes wrong:** Movable assets counted twice in total estate value -- once from getMovableAssetsTotal() and once from totalEstateValue manual entry.
**Why it happens:** EstateBreakdownCard has an "override total" feature. If movable assets are added to auto-calculation but override is active, the override might not include them.
**How to avoid:** The auto-calculated total should include BOTH properties and movable assets. When `isOverriding` is true, that manual value replaces the auto total entirely. Clear pattern: `autoTotal = propertiesTotal + movableAssetsTotal`, `displayed = isOverriding ? overrideValue : autoTotal`.
**Warning signs:** Estate total jumps when switching override on/off.

### Pitfall 5: Indivisible Buyout Compensation Calculation
**What goes wrong:** Buyout compensation shows wrong amounts per heir group.
**Why it happens:** Must account for the buying group's own share. If a son buys a car worth 100,000 and his share is 1/3, he owes 100,000 * (1 - 1/3) = 66,667 to other heirs, not 100,000.
**How to avoid:** Buyout formula: `compensationOwed = assetValue * (1 - buyerShareFraction)`, then distribute that amount among other heir groups proportionally to their shares.
**Warning signs:** Sum of all payments not equaling total asset value minus buyer's share.

### Pitfall 6: Zustand Partialize with Discriminated Unions
**What goes wrong:** Serializing discriminated union types through JSON works fine, but the `category` discriminant must survive serialization.
**Why it happens:** JSON.stringify/parse preserves plain objects correctly, but TypeScript type narrowing is lost at runtime.
**How to avoid:** Ensure `computeAssetValue()` and similar functions check `asset.category` at runtime (switch statement), not relying on TypeScript narrowing alone. The fractionStorage already handles custom serialization, but MovableAsset is plain JSON -- no special handling needed.
**Warning signs:** Runtime errors after loading persisted state.

## Code Examples

### Gold/Silver Value Computation
```typescript
// src/core/assets/valuation.ts

// Conversion: 1 vori = 11.664 grams = 0.9489 tola
const VORI_TO_GRAMS = 11.664
const VORI_TO_TOLA = 0.9489  // 1 tola = 11.664 / 0.9489 ~ 12.29 grams (BD tola)

export function convertToVori(weight: number, unit: GoldUnit): number {
  switch (unit) {
    case 'vori': return weight
    case 'gram': return weight / VORI_TO_GRAMS
    case 'tola': return weight / VORI_TO_TOLA
  }
}

export function computeGoldValue(asset: GoldSilverAsset): number {
  if (asset.overrideValue !== null) return asset.overrideValue
  const weightInVori = convertToVori(asset.weight, asset.weightUnit)
  const rate = asset.metalType === 'gold'
    ? GOLD_RATES[asset.purity]
    : SILVER_RATES[asset.purity]
  return Math.round(weightInVori * rate)
}

export function computeAssetValue(asset: MovableAsset): number {
  switch (asset.category) {
    case 'gold_silver': return computeGoldValue(asset)
    case 'cash': return asset.value
    case 'vehicle': return asset.estimatedValue
    case 'jewelry': return asset.value
    case 'furniture': return asset.value
    case 'livestock': return asset.count * asset.perUnitValue
    case 'custom': return asset.estimatedValue
  }
}

export function computeMovableAssetsTotal(assets: MovableAsset[]): number {
  return assets.reduce((sum, a) => sum + computeAssetValue(a), 0)
}
```

### Hardcoded Gold/Silver Rates (BD Market)
```typescript
// src/data/movable-asset-data.ts

// BAJUS rates as of early 2026 (updated with app releases)
// Gold rates per vori (bhori) in BDT
export const GOLD_RATES: Record<GoldPurity, number> = {
  '24K': 145000,   // ~145,000 BDT/vori for 24K (pure)
  '22K': 133000,   // ~133,000 BDT/vori for 22K (standard jewelry)
  '18K': 109000,   // ~109,000 BDT/vori for 18K
}

// Silver rates per vori in BDT
export const SILVER_RATES: Record<GoldPurity, number> = {
  '24K': 3500,     // ~3,500 BDT/vori for pure silver
  '22K': 3200,     // ~3,200 BDT/vori for 22K silver
  '18K': 2600,     // ~2,600 BDT/vori for 18K silver
}

// NOTE: These are approximate baseline rates meant as guidance.
// Actual rates fluctuate daily. User can always override.
// Pattern matches Phase 5 mouza rates: suggestion, not requirement.
```

### Indivisible Buyout Calculation
```typescript
// src/core/assets/indivisible.ts
import type { ShareResult, HeirType } from '@/core/faraid/types'

export interface BuyoutCalculation {
  assetValue: number
  buyerHeirType: HeirType
  buyerShare: number        // fraction value of buyer's total share
  compensationOwed: number  // what buyer pays to others total
  perGroupPayments: { heirType: HeirType; amount: number }[]
}

export function calculateBuyout(
  assetValue: number,
  buyerHeirType: HeirType,
  shares: ShareResult[],
): BuyoutCalculation {
  const activeShares = shares.filter(s => s.shareType !== 'blocked')
  const buyerShare = activeShares.find(s => s.heirType === buyerHeirType)
  if (!buyerShare) throw new Error(`Buyer ${buyerHeirType} not found in shares`)

  const buyerFraction = buyerShare.totalShare.valueOf()
  const compensationOwed = Math.round(assetValue * (1 - buyerFraction))

  // Distribute compensation proportionally to other groups
  const otherShares = activeShares.filter(s => s.heirType !== buyerHeirType)
  const otherTotal = otherShares.reduce((sum, s) => sum + s.totalShare.valueOf(), 0)

  const perGroupPayments = otherShares.map(s => ({
    heirType: s.heirType,
    amount: Math.round(compensationOwed * (s.totalShare.valueOf() / otherTotal)),
  }))

  return {
    assetValue,
    buyerHeirType,
    buyerShare: buyerFraction,
    compensationOwed,
    perGroupPayments,
  }
}
```

### Asset Card Component (Following PropertyCard Pattern)
```typescript
// src/components/assets/MovableAssetCard.tsx
// Follows exact same expand/collapse pattern as PropertyCard
export function MovableAssetCard({ assetId }: { assetId: string }) {
  const asset = useWizardStore(s => s.movableAssets.find(a => a.id === assetId))
  const expandedAssetId = useWizardStore(s => s.expandedAssetId)
  const setExpandedAssetId = useWizardStore(s => s.setExpandedAssetId)
  const updateMovableAsset = useWizardStore(s => s.updateMovableAsset)
  const removeMovableAsset = useWizardStore(s => s.removeMovableAsset)

  if (!asset) return null

  const isExpanded = expandedAssetId === assetId
  const value = computeAssetValue(asset)

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Collapsed header (same button pattern as PropertyCard) */}
      <button type="button" onClick={() => setExpandedAssetId(isExpanded ? null : assetId)} ...>
        {/* icon + label + value */}
      </button>

      {/* Expanded form (AnimatePresence + motion.div) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div ...>
            {/* Category-specific form */}
            {asset.category === 'gold_silver' && <GoldSilverForm asset={asset} onUpdate={...} />}
            {asset.category === 'vehicle' && <VehicleForm asset={asset} onUpdate={...} />}
            {/* ... etc */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

## Data Constants

### Vehicle Types (BD Common)
```typescript
export const VEHICLE_TYPES = [
  { value: 'car', label: 'Car', icon: 'car-icon' },
  { value: 'motorcycle', label: 'Motorcycle', icon: 'motorcycle-icon' },
  { value: 'cng_rickshaw', label: 'CNG/Auto-Rickshaw', icon: 'rickshaw-icon' },
  { value: 'truck', label: 'Truck', icon: 'truck-icon' },
  { value: 'bicycle', label: 'Bicycle', icon: 'bicycle-icon' },
  { value: 'boat', label: 'Boat', icon: 'boat-icon' },
] as const
```

### Livestock Types (BD Common)
```typescript
export const LIVESTOCK_TYPES = [
  { value: 'cow', label: 'Cow' },
  { value: 'goat', label: 'Goat' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'duck', label: 'Duck' },
  { value: 'pigeon', label: 'Pigeon' },
  { value: 'fish_pond', label: 'Fish Pond Stock' },
] as const
```

### Asset Category Metadata
```typescript
export const ASSET_CATEGORIES = [
  { value: 'gold_silver', label: 'Gold/Silver', icon: 'ring-icon', defaultIndivisible: false },
  { value: 'cash', label: 'Cash/Bank Deposits', icon: 'cash-icon', defaultIndivisible: false },
  { value: 'vehicle', label: 'Vehicle', icon: 'car-icon', defaultIndivisible: true },
  { value: 'jewelry', label: 'Jewelry (non-gold)', icon: 'gem-icon', defaultIndivisible: true },
  { value: 'furniture', label: 'Furniture/Household', icon: 'furniture-icon', defaultIndivisible: false },
  { value: 'livestock', label: 'Livestock', icon: 'livestock-icon', defaultIndivisible: true },
  { value: 'custom', label: 'Custom Item', icon: 'custom-icon', defaultIndivisible: true },
] as const
```

### Gold Unit Conversions
```typescript
// 1 Vori (Bhori) = 11.664 grams
// 1 Tola = ~11.664 grams in BD (same as Vori effectively, though technically 1 Tola = 11.6638 grams)
// For BD practical purposes: 1 Vori ~ 1 Tola (used interchangeably in some regions)
// But keeping them separate for precision
export const GOLD_UNIT_CONVERSIONS = {
  vori_to_gram: 11.664,
  tola_to_gram: 11.664,  // BD tola = BD vori
  gram_to_vori: 1 / 11.664,
  gram_to_tola: 1 / 11.664,
} as const
```

## Integration Points

### 1. WizardState Extension
Add to `WizardState` interface in `src/types/wizard.ts`:
```typescript
// Step 4 (Estate Inventory - Movable Assets)
movableAssets: MovableAsset[]
expandedAssetId: string | null
```

### 2. WizardStore Extension
Add to `wizardStore.ts`:
- Initialize: `movableAssets: []`, `expandedAssetId: null`
- Add CRUD actions: `addMovableAsset`, `removeMovableAsset`, `updateMovableAsset`, `setExpandedAssetId`
- Add `getMovableAssetsTotal()` action
- Modify `getAllPropertiesTotal()` to include movable assets, OR rename it and create new aggregation

### 3. WizardShell Step 4 Swap
In `WizardShell.tsx`, replace `<StepProperties />` with `<StepEstateInventory />` which wraps both sections.

### 4. Step Label Update
In `src/types/wizard.ts`, update `WIZARD_STEPS[3]`:
```typescript
{ number: 4, label: 'Estate Inventory', shortLabel: 'Estate' },
```

### 5. EstateBreakdownCard Extension
Add "Movable Assets" as a new category row alongside Land, Structures, Trees, Ponds. The expandable detail shows per-category movable totals (Gold: X, Vehicles: Y, etc.).

### 6. HeirCard Extension
The per-property expansion adds movable asset amounts. Each heir's share of each movable asset type is shown.

### 7. PDF Extension
- Add `movableAssets` to `PdfData` interface
- Add extraction logic in `extractPdfData.ts`
- Create `PdfMovableAssetsSection.tsx` component
- Include in `PdfDocument.tsx` after property section

### 8. Persist Partialize
Add `movableAssets` and `expandedAssetId` to the `partialize` function.

### 9. Scenario Fingerprint
Update fingerprint in `scenariosStore` to include movable asset data.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Step 4: "Properties" only | Step 4: "Estate Inventory" (properties + movable assets) | Phase 10 | Step label and content changes |
| `getAllPropertiesTotal()` returns land only | Returns land + movable assets combined | Phase 10 | All downstream consumers automatically get combined total |
| EstateBreakdown: 4 categories | 5 categories (+ Movable Assets) | Phase 10 | Breakdown card shows fuller picture |
| Simple sell/keep choice for assets | Three Islamic options (sell, buyout, Qurah) | Phase 10 | Faithful to Islamic jurisprudence |

## Open Questions

1. **Gold rate values to hardcode**
   - What we know: Current BD market (March 2026) shows 22K gold at approximately 133,000-267,000 BDT/vori depending on source and date. Prices have been volatile.
   - What's unclear: Exact BAJUS official rate to use as baseline, since it changes daily.
   - Recommendation: Hardcode conservative mid-range values (e.g., 22K: 133,000 BDT/vori) with a clear comment that these are approximate baseline rates. The transparent math display and user override capability make the exact hardcoded value less critical -- it's a starting suggestion, not a binding price.

2. **BD Tola vs Vori equivalence**
   - What we know: In Bangladesh, 1 Vori = 1 Tola = 11.664 grams. They are used interchangeably in BD context.
   - What's unclear: Whether to show them as separate options or combine them.
   - Recommendation: Keep both as unit options since some users may think in terms of one vs the other, but note they are equivalent in BD. The conversion display below the input will make this clear.

3. **Furniture/Household as lump sum vs itemized**
   - What we know: User decided on "simple BDT value entry (lump sum)" for furniture.
   - What's unclear: Whether families will want to itemize furniture (e.g., "TV 50,000, Fridge 30,000").
   - Recommendation: Keep as lump sum per CONTEXT.md decision. If users need itemization, they can use the "Custom" category for individual items.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 |
| Config file | vite.config.ts (test section) |
| Quick run command | `npx vitest run src/core/assets/` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SC-1 | Asset categories render with correct forms | unit | `npx vitest run src/components/__tests__/assets.test.tsx -x` | Wave 0 |
| SC-1 | Gold weight + purity + rate computes correct value | unit | `npx vitest run src/core/assets/__tests__/valuation.test.ts -x` | Wave 0 |
| SC-2 | Market value estimation (gold rate suggestion) | unit | `npx vitest run src/core/assets/__tests__/valuation.test.ts -x` | Wave 0 |
| SC-3 | Combined estate total includes land + movable | unit | `npx vitest run src/stores/__tests__/wizardStore.test.ts -x` | Extend existing |
| SC-4 | Indivisible buyout calculates correct compensation | unit | `npx vitest run src/core/assets/__tests__/indivisible.test.ts -x` | Wave 0 |
| SC-4 | Sell & divide shows per-heir amount | unit | `npx vitest run src/core/assets/__tests__/indivisible.test.ts -x` | Wave 0 |
| SC-5 | All asset types produce correct total via Faraid | unit | `npx vitest run src/core/assets/__tests__/valuation.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/core/assets/ src/components/__tests__/assets.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/core/assets/__tests__/valuation.test.ts` -- covers gold value computation, asset total, unit conversion
- [ ] `src/core/assets/__tests__/indivisible.test.ts` -- covers buyout calculation, sell & divide amounts
- [ ] `src/components/__tests__/assets.test.tsx` -- covers asset card rendering, form rendering, store integration

## Sources

### Primary (HIGH confidence)
- Project codebase analysis -- read all relevant source files: wizardStore.ts, types/wizard.ts, core/land/types.ts, EstateBreakdownCard.tsx, HeirCard.tsx, PropertyCard.tsx, StepProperties.tsx, divisionStore.ts, QurahCeremony.tsx, pdfTypes.ts, extractPdfData.ts, and all supporting components
- CONTEXT.md -- user decisions from discussion phase

### Secondary (MEDIUM confidence)
- [BD Gold Prices](https://www.bdtask.com/blog/gold-price-in-bangladesh) -- gold price ranges for rate calibration
- [Gold Price History BD](https://gold-price.sakib.dev/) -- historical BD gold prices
- [Silver Prices BD](https://goldpricez.com/silver-rates/bangladesh) -- silver price per vori data
- [150currency.com BD Gold](https://www.150currency.com/gold-price/bangladesh/) -- cross-reference for gold rates

### Tertiary (LOW confidence)
- Exact gold/silver rates: Market prices fluctuate daily; hardcoded values are approximate baselines. The transparent math display and user override make precision less critical.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing libraries
- Architecture: HIGH -- follows established project patterns exactly (PropertyCard, MouzaRateSuggestion, StepperButton, QurahCeremony)
- Asset type modeling: HIGH -- discriminated union is standard TypeScript pattern, matches project's existing type patterns
- Gold valuation math: MEDIUM -- purity factor calculation and BD market rate conventions need validation against BAJUS standards
- Indivisible buyout math: HIGH -- straightforward proportional calculation from Faraid shares
- Pitfalls: HIGH -- identified from direct codebase analysis (partialize, fingerprint, double-counting patterns)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable -- no fast-moving dependencies)
