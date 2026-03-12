# Phase 4: Property Input System - Research

**Researched:** 2026-03-13
**Domain:** Multi-property CRUD with Bangladesh land unit conversion and regional variations
**Confidence:** HIGH

## Summary

Phase 4 introduces a multi-property entry system as wizard Step 4, with Bangladesh-specific land units (decimal/shotangsho, katha, bigha), regional katha/bigha variations across 8 divisions, and sub-item detail entry for houses/structures, trees/crops, and ponds. The core technical challenges are: (1) managing a dynamic array of complex property objects in Zustand, (2) implementing accurate regional land unit conversion with two distinct katha standards, and (3) building an expand/collapse card UI for inline property editing.

The existing codebase provides strong foundations: Zustand store patterns with individual setters, motion/react AnimatePresence for expand/collapse, BDT currency formatting with lakh/crore grouping, Tooltip and StepperButton primitives, and the EstateValueInput pattern for numeric inputs. No new dependencies are needed. The land unit conversion logic is pure arithmetic that belongs in a dedicated `src/core/land/` module with comprehensive unit tests.

**Primary recommendation:** Build a `src/core/land/units.ts` conversion module with division-keyed katha/bigha lookup, extend WizardState with a `properties: Property[]` array and CRUD actions, then compose the UI from existing primitives (StepperButton for counts, Tooltip for unit explanations, EstateValueInput pattern for BDT values).

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Insert as Step 4 (Properties), push Results to Step 5. Linear wizard: Relationship -> Family -> Siblings -> Properties -> Results
- Always show 5 steps in the step indicator from the start (no dynamic appearance)
- Property input is optional -- "Skip to Results" button skips to fractions/percentages only (no BDT amounts)
- When properties exist, EstateValueInput on Results page shows auto-calculated total from property values, with editable override option
- Card list pattern: empty state -> "Add Property" button -> summary cards for each property
- Inline expansion: tapping a card or "Add Property" expands the form in-place (no modal/slide-up)
- Type selector first: user picks property type before form fields appear -- form adapts to show relevant sub-sections
- No hard limit on property count
- Running total displayed at bottom of property list
- Division-level region selector (8 divisions)
- Region selection is per-property
- Default input unit: Decimal, with dropdown to switch to Katha/Bigha/sqft
- Live conversion display: show 2-3 key conversions below area input, with "More units" expandable
- Tooltip on unit dropdown (?) explaining BD land units
- Hybrid approach for all sub-items: simple default (estimated value), expandable for detail
- House/structure: estimated value + optional details (area, construction type, floors, condition)
- Trees/crops: total estimated value + optional "Itemize by species"
- Pond/water body: area + estimated value
- Values are additive: Property total = land value + house value + tree value + pond value
- Optional nickname field at top of each property card
- If empty, auto-labeled as "Residential #1", "Agricultural #2", etc.
- Required: land area > 0, at least one value > 0, region selected
- Delete confirmation only if property has data entered

### Claude's Discretion
- Exact animation for card expand/collapse (motion/react pattern already established)
- Property type icons/emoji choice
- Exact form field ordering within expanded cards
- Mobile responsive breakpoints for property cards
- How "More units" conversion expansion looks
- Tree species list (common BD species)
- Construction type and condition option lists

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROP-01 | User can input land area in BD units (decimal/shotangsho, katha, bigha) with auto-conversion | Land unit conversion module with division-keyed lookup; conversion display component |
| PROP-02 | User can add multiple property entries of different types (agricultural, residential, commercial, mixed) | Zustand array CRUD pattern; Property type discriminator; card list UI |
| PROP-03 | User can input house/structure details (area, condition, estimated value) on land | Hybrid detail pattern: simple value + expandable detail fields |
| PROP-04 | User can input tree/crop details (type, count, estimated value) | Species picker with StepperButton counts; BD common species data |
| PROP-05 | User can input pond/water body details with area and estimated value | Pond sub-section reusing land unit system for area + BDT input |
| PROP-06 | App handles regional land unit variations (1 Katha = 720 sqft Dhaka vs 1620 sqft Rajshahi) | Division-keyed conversion table; per-property region selector |

</phase_requirements>

## Standard Stack

### Core (already installed -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI framework | Already in use |
| Zustand | 5.0.11 | State management | Established pattern with individual setters |
| motion (motion/react) | 12.36.0 | Animations | AnimatePresence expand/collapse pattern established |
| TailwindCSS | 4.2.1 | Styling | Design system already defined |
| Vitest | 4.1.0 | Testing | Test infrastructure with 260 passing tests |

### Supporting (no new packages)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.3.2 | Component tests | Test property form interactions |
| Intl.NumberFormat('en-IN') | Built-in | BDT formatting | All currency value inputs/displays |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual form state | react-hook-form | Overkill -- Zustand store pattern handles forms adequately, adding a form library introduces pattern inconsistency |
| Manual ID generation | uuid/nanoid | Unnecessary -- `crypto.randomUUID()` is built into modern browsers and sufficient for client-side property IDs |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── core/
│   └── land/
│       ├── types.ts          # Property, LandUnit, Division, TreeSpecies types
│       ├── units.ts           # Conversion functions, division-keyed lookup tables
│       └── __tests__/
│           └── units.test.ts  # Conversion accuracy tests
├── stores/
│   └── wizardStore.ts         # Extended with properties[] + CRUD actions
├── types/
│   └── wizard.ts              # WizardState extended, WIZARD_STEPS updated to 5
├── data/
│   └── bd-land-data.ts        # Division list, species list, construction types
└── components/
    └── property/
        ├── StepProperties.tsx          # Main step component (empty state + card list)
        ├── PropertyCard.tsx            # Collapsed summary / expanded form
        ├── PropertyTypeSelector.tsx    # Type picker (Agricultural/Residential/Commercial/Mixed)
        ├── LandAreaInput.tsx           # Area input + unit dropdown + live conversions
        ├── ConversionDisplay.tsx       # Live unit conversion display below area input
        ├── HouseDetailSection.tsx      # House/structure sub-section (hybrid)
        ├── TreeCropSection.tsx         # Tree/crop sub-section (hybrid)
        ├── PondSection.tsx             # Pond/water body sub-section
        └── PropertyRunningTotal.tsx    # Bottom total display
```

### Pattern 1: Zustand Array CRUD for Properties
**What:** Manage a `properties: Property[]` array with add/update/remove actions in the existing wizard store, using property ID for targeted updates.
**When to use:** Any time the store needs a dynamic collection of entities.
**Example:**
```typescript
// In types/wizard.ts or core/land/types.ts
interface Property {
  id: string
  nickname: string
  type: PropertyType | null
  division: Division | null
  landArea: number          // stored in sqft (canonical unit)
  landInputUnit: LandUnit   // user's chosen display unit
  landValue: number         // BDT
  house: HouseDetail | null
  trees: TreeDetail | null
  pond: PondDetail | null
}

// In stores/wizardStore.ts -- new actions
interface PropertyActions {
  addProperty: () => string              // returns new ID
  removeProperty: (id: string) => void
  updateProperty: (id: string, patch: Partial<Property>) => void
  getPropertyTotal: (id: string) => number  // land + house + trees + pond
  getAllPropertiesTotal: () => number
}

// Implementation pattern (Zustand immer-less approach):
addProperty: () => {
  const id = crypto.randomUUID()
  const newProperty: Property = {
    id,
    nickname: '',
    type: null,
    division: null,
    landArea: 0,
    landInputUnit: 'decimal',
    landValue: 0,
    house: null,
    trees: null,
    pond: null,
  }
  set((state) => ({
    properties: [...state.properties, newProperty],
  }))
  return id
},

updateProperty: (id, patch) => {
  set((state) => ({
    properties: state.properties.map((p) =>
      p.id === id ? { ...p, ...patch } : p
    ),
  }))
},

removeProperty: (id) => {
  set((state) => ({
    properties: state.properties.filter((p) => p.id !== id),
  }))
},
```

### Pattern 2: Canonical Internal Unit with Display Conversion
**What:** Store all area values internally in square feet (the universal base), convert for display in user-selected units per property. The conversion functions handle regional katha/bigha variations via division parameter.
**When to use:** Any time a single value needs multiple display representations.
**Example:**
```typescript
// core/land/units.ts
export type LandUnit = 'decimal' | 'katha' | 'bigha' | 'sqft'
export type Division = 'dhaka' | 'chittagong' | 'rajshahi' | 'khulna'
  | 'barisal' | 'sylhet' | 'rangpur' | 'mymensingh'

// 1 Decimal = 435.6 sqft (fixed nationwide)
const SQFT_PER_DECIMAL = 435.6

// Division-keyed katha values (sqft per katha)
const KATHA_SQFT: Record<Division, number> = {
  dhaka: 720,
  chittagong: 720,
  sylhet: 720,
  barisal: 720,
  mymensingh: 720,
  rajshahi: 1620,
  khulna: 1620,
  rangpur: 1620,
}

// Bigha = 20 Katha in all regions (but katha size differs)
const KATHA_PER_BIGHA = 20

export function toSqft(value: number, unit: LandUnit, division: Division): number {
  switch (unit) {
    case 'sqft': return value
    case 'decimal': return value * SQFT_PER_DECIMAL
    case 'katha': return value * KATHA_SQFT[division]
    case 'bigha': return value * KATHA_SQFT[division] * KATHA_PER_BIGHA
  }
}

export function fromSqft(sqft: number, unit: LandUnit, division: Division): number {
  switch (unit) {
    case 'sqft': return sqft
    case 'decimal': return sqft / SQFT_PER_DECIMAL
    case 'katha': return sqft / KATHA_SQFT[division]
    case 'bigha': return sqft / (KATHA_SQFT[division] * KATHA_PER_BIGHA)
  }
}

/** Get all conversions for display below the input */
export function getConversions(
  sqft: number,
  division: Division
): { unit: LandUnit; value: number; label: string }[] {
  return [
    { unit: 'decimal', value: fromSqft(sqft, 'decimal', division), label: 'Decimal' },
    { unit: 'katha', value: fromSqft(sqft, 'katha', division), label: `Katha (${divisionLabel(division)})` },
    { unit: 'sqft', value: sqft, label: 'Square Feet' },
    { unit: 'bigha', value: fromSqft(sqft, 'bigha', division), label: `Bigha (${divisionLabel(division)})` },
  ]
}
```

### Pattern 3: Inline Expand/Collapse Card (motion/react)
**What:** Property cards expand in-place when tapped, using AnimatePresence + motion.div with height auto-animation. Follows the established QuranReference pattern.
**When to use:** Property card expand/collapse and sub-section detail expansion.
**Example:**
```typescript
// Follows established QuranReference pattern
import { AnimatePresence, motion } from 'motion/react'

function PropertyCard({ property, isExpanded, onToggle }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Collapsed summary -- always visible */}
      <button onClick={onToggle} className="w-full p-4 text-left">
        <span>{property.nickname || autoLabel(property)}</span>
        <span>{formatBDT(getPropertyTotal(property))}</span>
      </button>

      {/* Expanded form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {/* Form fields here */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Prop-drilling property fields:** Components should read from the Zustand store directly (established anti-prop-drilling pattern). Pass only the property `id` as a prop, let the component select its own data.
- **Storing area in user-selected units:** Store in sqft internally, convert for display. Otherwise changing division or unit requires recomputing stored values and introduces rounding errors.
- **Modal/slide-up for property forms:** Decision locked -- inline expansion only. Modals break mobile scroll context.
- **Global region selector:** Region is per-property (families have land in multiple divisions). Never use a single global region.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unique IDs for properties | Custom counter | `crypto.randomUUID()` | Built-in, collision-free, no dependencies |
| Currency formatting | Manual comma insertion | `Intl.NumberFormat('en-IN')` | Already used in EstateValueInput, handles lakh/crore grouping |
| Expand/collapse animation | CSS transitions | `motion/react` AnimatePresence | Already established pattern in QuranReference, handles height: auto |
| Form state management | Separate form library | Zustand store extension | Consistent with established pattern; no need for react-hook-form |

**Key insight:** The existing codebase already has all the UI primitives and patterns needed. This phase is primarily about composing existing patterns into a new domain (property entry) with a new pure-logic module (land unit conversion).

## Common Pitfalls

### Pitfall 1: Katha Regional Confusion
**What goes wrong:** Treating katha as a fixed unit (720 sqft everywhere) when it varies 2.25x between divisions.
**Why it happens:** Most online converters use a single national standard. The Dhaka value (720 sqft) dominates web results.
**How to avoid:** Always require a division parameter for katha and bigha conversions. Make the conversion function signature enforce it: `toSqft(value, unit, division)` -- no optional division parameter.
**Warning signs:** Any conversion function for katha/bigha that does not accept a division/region argument.

### Pitfall 2: Floating Point Display Artifacts
**What goes wrong:** Showing "1.6499999999 decimal" instead of "1.65 decimal" in conversion display.
**Why it happens:** IEEE 754 floating point arithmetic. `720 / 435.6` is not exactly representable.
**How to avoid:** Round conversion display values to 2-3 decimal places using `toFixed()` or `Math.round(value * 100) / 100`. The internal sqft storage can be a precise number; only the display needs rounding.
**Warning signs:** Unreasonably long decimal strings in the conversion display.

### Pitfall 3: Step Index Off-By-One After Adding Step 4
**What goes wrong:** Results page breaks because it was hardcoded as step 4, but now step 4 is Properties and step 5 is Results.
**Why it happens:** The current code has `currentStep === 4` checks for Results (e.g., hiding FamilyTree, hiding nav bars). Adding a new step shifts Results to 5.
**How to avoid:** Update ALL step-number references in WizardShell.tsx, StepIndicator, and calculateShares. Grep for `=== 4` and `currentStep` across the codebase. Update WIZARD_STEPS array from 4 to 5 entries.
**Warning signs:** FamilyTree appearing on Results page, navigation bars appearing on Results page, "Calculate Shares" button not appearing on the correct step.

### Pitfall 4: Property Validation Blocking Results
**What goes wrong:** User cannot reach Results because the property step validation is too strict, or user cannot skip properties.
**Why it happens:** Making property step validation required when it should be optional (Skip to Results must work).
**How to avoid:** Step 4 (Properties) is ALWAYS valid -- it is optional. The "Skip to Results" button should call calculateShares directly. Individual property validation (area > 0, region selected) only applies within a property card, not as a step-level gate.
**Warning signs:** "Next" or "Skip" button disabled on the Properties step when no properties are entered.

### Pitfall 5: EstateValueInput Dual Mode Regression
**What goes wrong:** Breaking the existing manual entry mode when adding auto-calculated mode.
**Why it happens:** EstateValueInput currently always allows free editing. Adding auto-calculation from properties introduces conditional behavior.
**How to avoid:** When properties exist and have values, show the auto-calculated total with a clear indicator. Allow override by tapping/clicking the value (entering edit mode). When no properties exist, behave exactly as before (free text input).
**Warning signs:** Estate value input becomes read-only with no way to override, or auto-calculated value does not update when property values change.

### Pitfall 6: Stale Expanded Property Card After Delete
**What goes wrong:** Deleting a property while another is expanded causes the wrong card to expand, or a phantom card remains.
**Why it happens:** Using array index as the expanded state key instead of property ID.
**How to avoid:** Track expanded state by property ID (`expandedPropertyId: string | null`), not by array index.
**Warning signs:** Deleting property #2 of 3 causes property #3 to suddenly show #2's form.

## Code Examples

### Example 1: Division Data Constants
```typescript
// src/data/bd-land-data.ts
export const BD_DIVISIONS = [
  { value: 'dhaka', label: 'Dhaka', bangla: 'ঢাকা' },
  { value: 'chittagong', label: 'Chittagong', bangla: 'চট্টগ্রাম' },
  { value: 'rajshahi', label: 'Rajshahi', bangla: 'রাজশাহী' },
  { value: 'khulna', label: 'Khulna', bangla: 'খুলনা' },
  { value: 'barisal', label: 'Barisal', bangla: 'বরিশাল' },
  { value: 'sylhet', label: 'Sylhet', bangla: 'সিলেট' },
  { value: 'rangpur', label: 'Rangpur', bangla: 'রংপুর' },
  { value: 'mymensingh', label: 'Mymensingh', bangla: 'ময়মনসিংহ' },
] as const

export const PROPERTY_TYPES = [
  { value: 'agricultural', label: 'Agricultural', icon: '🌾' },
  { value: 'residential', label: 'Residential', icon: '🏠' },
  { value: 'commercial', label: 'Commercial', icon: '🏢' },
  { value: 'mixed', label: 'Mixed', icon: '🏘️' },
] as const

export const CONSTRUCTION_TYPES = [
  { value: 'brick', label: 'Brick (Pucca)' },
  { value: 'tin', label: 'Tin Shed' },
  { value: 'mud', label: 'Mud/Kacha' },
  { value: 'semi_pucca', label: 'Semi-Pucca' },
] as const

export const CONDITION_OPTIONS = [
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
] as const

export const TREE_SPECIES = [
  { value: 'mango', label: 'Mango (আম)' },
  { value: 'jackfruit', label: 'Jackfruit (কাঁঠাল)' },
  { value: 'coconut', label: 'Coconut (নারিকেল)' },
  { value: 'bamboo', label: 'Bamboo (বাঁশ)' },
  { value: 'betelnut', label: 'Betelnut (সুপারি)' },
  { value: 'litchi', label: 'Litchi (লিচু)' },
  { value: 'guava', label: 'Guava (পেয়ারা)' },
  { value: 'banana', label: 'Banana (কলা)' },
  { value: 'teak', label: 'Teak (সেগুন)' },
  { value: 'mahogany', label: 'Mahogany (মেহগনি)' },
  { value: 'other', label: 'Other' },
] as const
```

### Example 2: Property Type Definitions
```typescript
// src/core/land/types.ts
export type PropertyType = 'agricultural' | 'residential' | 'commercial' | 'mixed'
export type LandUnit = 'decimal' | 'katha' | 'bigha' | 'sqft'
export type Division =
  | 'dhaka' | 'chittagong' | 'rajshahi' | 'khulna'
  | 'barisal' | 'sylhet' | 'rangpur' | 'mymensingh'
export type ConstructionType = 'brick' | 'tin' | 'mud' | 'semi_pucca'
export type Condition = 'good' | 'fair' | 'poor'

export interface HouseDetail {
  estimatedValue: number
  areaSqft: number | null
  constructionType: ConstructionType | null
  floors: number | null
  condition: Condition | null
}

export interface TreeItem {
  species: string
  count: number
  estimatedValue: number
}

export interface TreeDetail {
  totalEstimatedValue: number
  items: TreeItem[]       // empty = simple mode, populated = itemized mode
  isItemized: boolean
}

export interface PondDetail {
  areaSqft: number        // internal canonical unit
  areaInputUnit: LandUnit
  estimatedValue: number
}

export interface Property {
  id: string
  nickname: string
  type: PropertyType | null
  division: Division | null
  landAreaSqft: number      // canonical: always in sqft
  landInputUnit: LandUnit   // user's chosen input unit
  landValue: number         // BDT
  house: HouseDetail | null
  trees: TreeDetail | null
  pond: PondDetail | null
}

/** Compute total value for a single property */
export function computePropertyTotal(property: Property): number {
  let total = property.landValue
  if (property.house) total += property.house.estimatedValue
  if (property.trees) {
    total += property.trees.isItemized
      ? property.trees.items.reduce((sum, item) => sum + item.estimatedValue, 0)
      : property.trees.totalEstimatedValue
  }
  if (property.pond) total += property.pond.estimatedValue
  return total
}
```

### Example 3: WIZARD_STEPS Update
```typescript
// src/types/wizard.ts -- updated from 4 to 5 steps
export const WIZARD_STEPS: WizardStep[] = [
  { number: 1, label: 'Relationship', shortLabel: 'Relationship' },
  { number: 2, label: 'Family', shortLabel: 'Family' },
  { number: 3, label: 'Siblings', shortLabel: 'Siblings' },
  { number: 4, label: 'Properties', shortLabel: 'Properties' },
  { number: 5, label: 'Results', shortLabel: 'Results' },
]
```

### Example 4: Auto-Label Generation
```typescript
/** Generate auto-label like "Residential #1", "Agricultural #2" */
export function autoPropertyLabel(
  property: Property,
  allProperties: Property[],
): string {
  if (property.nickname.trim()) return property.nickname
  if (!property.type) return 'New Property'

  const sameType = allProperties.filter((p) => p.type === property.type)
  const index = sameType.findIndex((p) => p.id === property.id)
  const typeLabel = property.type.charAt(0).toUpperCase() + property.type.slice(1)
  return `${typeLabel} #${index + 1}`
}
```

## Bangladesh Land Unit Conversion Reference

### Fixed Nationwide Conversions (HIGH confidence)
| From | To | Factor |
|------|----|--------|
| 1 Decimal (Shotangsho/Shotok) | Square Feet | 435.6 |
| 1 Acre | Decimal | 100 |
| 1 Bigha | Katha | 20 |
| 1 Katha | Gonda | 1.2 (= 20 Gonda per Bigha) |

### Regional Katha Variation (MEDIUM-HIGH confidence)
| Division | 1 Katha (sqft) | 1 Bigha (sqft) | 1 Katha (decimal) | Notes |
|----------|----------------|-----------------|-------------------|-------|
| Dhaka | 720 | 14,400 | ~1.65 | Standard urban unit |
| Chittagong | 720 | 14,400 | ~1.65 | Same as Dhaka |
| Sylhet | 720 | 14,400 | ~1.65 | Same as Dhaka |
| Barisal | 720 | 14,400 | ~1.65 | Same as Dhaka |
| Mymensingh | 720 | 14,400 | ~1.65 | Same as Dhaka |
| Rajshahi | 1,620 | 32,400 | ~3.72 | Northern standard |
| Khulna | 1,620 | 32,400 | ~3.72 | Northern standard |
| Rangpur | 1,620 | 32,400 | ~3.72 | Northern standard |

**Key insight:** There are effectively TWO katha standards: "Dhaka standard" (720 sqft, 5 divisions) and "Northern standard" (1,620 sqft, 3 divisions: Rajshahi, Khulna, Rangpur). The northern katha is 2.25x larger. Decimal/shotangsho is the government-standard unit and is fixed at 435.6 sqft nationwide with no regional variation.

**Confidence note on Chittagong/Sylhet/Barisal/Mymensingh:** Multiple sources group these with Dhaka at 720 sqft/katha, but district-level micro-variations may exist. For this app's purposes, division-level grouping is appropriate. The user can always input in decimal (no regional variation) for maximum precision.

### Conversion Logic Principles
1. **Decimal is the anchor:** Government deeds use decimal. It never varies by region. When in doubt, encourage decimal input.
2. **Katha and Bigha are regional:** Always require division context for conversion.
3. **Square feet is the internal canonical unit:** Store all areas in sqft, convert for display.
4. **Bigha = 20 Katha everywhere:** The katha-to-bigha ratio is constant (20:1). Only the katha-to-sqft ratio varies.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Step 4 = Results | Step 4 = Properties, Step 5 = Results | This phase | Must update all step-number references |
| Manual estate value only | Auto-calculated from properties + override | This phase | EstateValueInput needs dual mode |
| No property state | properties[] in WizardState | This phase | Store extension with CRUD actions |

**Integration changes required:**
- `WIZARD_STEPS` array: 4 entries -> 5 entries
- `WizardShell.tsx`: Add Step 4 rendering, shift Results to Step 5, update all `=== 4` checks to `=== 5`
- `calculateShares()`: Should advance to step 5 instead of step 4
- `isStepValid()`: Step 4 (Properties) always returns true (optional step)
- `WizardShell` nav: "Calculate Shares" button moves from step 3 to step 4 (or keep on step 3 with an additional "Skip" path), plus add a "Skip to Results" on step 4
- `ResultsPage`: Hidden elements should check `currentStep !== 5` instead of `!== 4`
- `EstateValueInput`: Conditional auto-calc mode when properties have values

## Open Questions

1. **Exact katha values for Chittagong, Sylhet, Barisal, Mymensingh**
   - What we know: Multiple sources group them with Dhaka at 720 sqft. No source contradicts this.
   - What's unclear: Whether any of these divisions have sub-regional variations we're missing.
   - Recommendation: Use 720 sqft for these 5 divisions. This matches the CONTEXT.md decision (Dhaka 720 vs Rajshahi 1620 as the key variation). Users can always input in decimal for precision.

2. **"Skip to Results" navigation flow**
   - What we know: Decision says "Skip to Results" skips to fractions/percentages only (no BDT amounts).
   - What's unclear: Should "Skip to Results" call `calculateShares()` (which sets results and advances step), or just advance the step? If properties exist but user skips, should partial property data be preserved or discarded?
   - Recommendation: "Skip to Results" should call `calculateShares()` exactly as the existing "Calculate Shares" does. Properties entered are preserved in state. Estate value auto-calculation uses whatever properties exist (including zero if none). The "no BDT amounts" note means: without properties, totalEstateValue stays 0, so monetary amounts show as empty.

3. **Navigate back from Results to Properties**
   - What we know: Results page has "Edit Heirs" button that goes to step 1.
   - What's unclear: Should there also be an "Edit Properties" button on Results?
   - Recommendation: Yes, add an "Edit Properties" link on Results (analogous to "Edit Heirs"). This is a natural UX addition but is not explicitly mandated. The planner should include it.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | vite.config.ts (merged Vite+Vitest) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROP-01 | Land area input with BD units + auto-conversion | unit | `npx vitest run src/core/land/__tests__/units.test.ts -t "PROP-01" -x` | Wave 0 |
| PROP-02 | Add multiple property entries of different types | integration | `npx vitest run src/components/__tests__/property.test.tsx -t "PROP-02" -x` | Wave 0 |
| PROP-03 | House/structure detail input | integration | `npx vitest run src/components/__tests__/property.test.tsx -t "PROP-03" -x` | Wave 0 |
| PROP-04 | Tree/crop detail input | integration | `npx vitest run src/components/__tests__/property.test.tsx -t "PROP-04" -x` | Wave 0 |
| PROP-05 | Pond/water body detail input | integration | `npx vitest run src/components/__tests__/property.test.tsx -t "PROP-05" -x` | Wave 0 |
| PROP-06 | Regional land unit variations | unit | `npx vitest run src/core/land/__tests__/units.test.ts -t "PROP-06" -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green (all 260+ existing tests + new PROP tests) before verify

### Wave 0 Gaps
- [ ] `src/core/land/__tests__/units.test.ts` -- covers PROP-01 (conversion accuracy), PROP-06 (regional variations)
- [ ] `src/components/__tests__/property.test.tsx` -- covers PROP-02 (multi-property CRUD), PROP-03 (house detail), PROP-04 (tree/crop), PROP-05 (pond)
- [ ] `src/stores/__tests__/propertyStore.test.ts` -- covers store CRUD actions, total computation, property validation

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `src/stores/wizardStore.ts`, `src/types/wizard.ts`, `src/components/results/EstateValueInput.tsx`, `src/components/results/QuranReference.tsx` -- patterns for store design, animation, currency input
- [kgrebd.com - Bangladesh Land Area Unit Conversion](https://kgrebd.com/bangladesh-land-area-unit-conversion/) -- Dhaka 720 sqft, Rajshahi/Khulna 1620 sqft, decimal = 435.6 sqft
- [kgrebd.com - Understanding the Land Measurement Puzzle](https://kgrebd.com/land-measurement-units-in-bangladesh/) -- Confirms regional variation pattern, Rangpur grouped with Rajshahi

### Secondary (MEDIUM confidence)
- [JCX Developments - Katha vs Square Feet](https://jcxbd.com/katha-vs-square-feet/) -- Dhaka ~720 sqft, Chittagong ~721 sqft (marginal difference confirming same standard)
- [LegalSeba - Land Measurement System](https://legalseba.com/bd-services/land-measurement-system-in-bangladesh/) -- Confirms 1 Bigha = 20 Kattah, 1 Decimal = 435.6 sqft
- [Area Convert - Katha to Square Feet](https://www.areaconvert.com/2019/08/katha-to-square-feet-katha-to-satak.html) -- 1 Katha = 720 sqft = 1.65289 Satak

### Tertiary (LOW confidence)
- [lekhnath.com - BD Land Converter](https://www.lekhnath.com/bd/land/) -- Claims "Bangladesh has consistent measurements nationwide" (contradicts regional variation evidence; likely oversimplified)
- Exact katha values for Barisal, Mymensingh, Sylhet divisions -- assumed 720 sqft based on grouping with Dhaka in multiple sources, but no explicit per-division confirmation found

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all patterns established in codebase
- Architecture: HIGH -- extends proven Zustand + motion/react patterns
- Land unit conversions (Dhaka/Rajshahi): HIGH -- multiple sources confirm 720 vs 1620 sqft
- Land unit conversions (other divisions): MEDIUM -- grouped by inference, not explicit per-division data
- Pitfalls: HIGH -- identified through actual code analysis of step-number dependencies
- UI patterns: HIGH -- directly reusing existing component patterns

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable domain -- BD land units don't change frequently)
