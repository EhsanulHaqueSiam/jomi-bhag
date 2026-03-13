# Phase 14: Per-Heir Asset Breakdown - Research

**Researched:** 2026-03-14
**Domain:** Individual-level asset distribution kanban with DnD, parcel splitting, and cash compensation
**Confidence:** HIGH

## Summary

Phase 14 adds an individual-level distribution view as a tab/toggle alongside the existing group-level Phase 11 distribution board. The existing codebase provides all the building blocks: `@dnd-kit/core` 6.x for drag-and-drop, Zustand 5.x stores with persist middleware, `motion/react` (Framer Motion 12.x) for animations, and established patterns for equilibrium bars, summary banners, mobile fallbacks, and PDF generation. No new library installs are required.

The key architectural challenge is designing the new `individualDistributionStore` to be independent from but initialized from the existing `distributionStore`. The store needs its own state for individual columns (expanded from group columns), parcel splitting logic, custom heir names, Qurah ceremony state, and an undo stack. The fingerprint must include heir type counts in addition to property/asset IDs+values so that changes to heir composition invalidate the individual distribution.

The domain-specific complexity centers on three areas: (1) the parcel split/merge algorithm that creates sub-parcels from properties for precise area-based division, (2) the individual-level cash compensation calculation using a greedy minimum-transfer algorithm, and (3) the Qurah ceremony adapted for individual columns with faster stagger timing. All of these can be built using existing patterns from Phases 9, 11, and 13.

**Primary recommendation:** Build the individualDistributionStore as an independent Zustand store (no persist middleware initially -- ephemeral like distributionStore) that snapshots from distributionStore on initialization. Add a segmented control toggle to DistributionPage. Reuse AssetCard, EquilibriumBar, SummaryBanner components. Create new IndividualColumn, IndividualBoard, ParcelSplitDialog, and IndividualQurahCeremony components.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**View & Navigation:**
- Tab/toggle on distribution page: "By Group" vs "By Individual" segmented control (role='tablist' for accessibility)
- Both views are fully independent -- switching views never affects the other's state
- Individual view initializes by snapshotting from group distribution, splitting each group's assets equally among its members
- If group distribution doesn't exist when individual view is selected, auto-compute it first, then snapshot
- Individual view has its own Qurah (Draw Lots) and Undo controls in the top controls bar
- No separate Randomize button -- Qurah replaces Randomize in individual view (global, all items across all individuals)
- All heirs shown including single-count types (wife gets her own column)
- Hide toggle entirely when no assets exist (same as Phase 11's "Distribute Assets" button behavior)
- Grouped with heir type section headers ("Sons", "Daughters", etc.) -- individuals grouped visually under their type
- Desktop: horizontal scroll for columns (same as Phase 11)
- Mobile: vertical stack with section headers, "Move to..." dropdown is primary interaction (DnD de-emphasized)
- Mobile "Move to..." dropdown: flat list of all individual heir names

**Individual Identification:**
- Auto-numbered per subtype: "Full Brother 1", "Consanguine Brother 1", "Son 1", "Daughter 1"
- Optional inline rename: click name text to edit, Enter to save, Escape to cancel. Full keyboard support (Enter/Space to activate)
- When renamed, custom name is primary, original type+number as subtitle (e.g., "Rahim" with "Son 1" subtitle)
- Male/female heir icon on each individual card (reuse HeirIcon from HeirCard)
- Faraid share fraction and percentage shown on each individual column header
- Per-subtype numbering (Full Brother 1, Consanguine Brother 1 -- not combined "Brother 1, 2, 3")
- Custom names included in JSON export/import for round-trip fidelity
- Custom names saved with scenario (Phase 8 persistence)

**Drag-and-Drop Interaction:**
- Full DnD between ALL individuals -- cross-type allowed (Son 1 to Daughter 2)
- Same DnD sensors as Phase 11: PointerSensor(distance:5), TouchSensor(delay:500ms), KeyboardSensor
- AssetCard and IndividualColumn wrapped in React.memo for performance
- No virtualization needed -- typical cases have <=10 heirs and <=60 assets

**Value-Based Equilibrium:**
- Equilibrium measured by BDT value (same as Phase 11) -- properties have monetary values from mouza rates or user-entered market prices
- Per-individual equilibrium bars: green within +-2% of target BDT value, amber within +-5%, red beyond +-5%
- Summary banner at top: "5/7 heirs balanced" pattern
- Celebratory animation when all individuals are green (same pattern as Phase 11)
- Cross-type moves allowed freely -- equilibrium bars show deviations, no warnings or restrictions
- Empty columns show "Drag items here" drop zone, equilibrium at 0% (red)
- Blocked heirs excluded from individual view (only heirs with actual shares appear)
- No column scroll limit -- scrollable within column (maxHeight like Phase 11)

**Parcel Splitting:**
- Users can SPLIT a parcel into sub-parcels within the individual view for precise area-based division
- Split action on parcel card (button or context menu) -- user enters split amounts (e.g., "Beki 9 shotok" -> "Beki 5 shotok" + "Beki 4 shotok")
- Each sub-parcel becomes a separate draggable card
- Split preserves the original parcel name with area annotation
- Essential for achieving exact Faraid area targets when whole parcels don't divide evenly
- Splits are reversible (merge sub-parcels back)

**Cash Compensation:**
- Pairwise net settlements between individuals: "Son 1 -> Daughter 1: BDT 30,000"
- Minimize number of transfers using greedy algorithm
- Cash compensation is the fallback when even with parcel splitting, perfect area balance isn't achievable

**Within-Group Subdivision (Initial Split):**
- Equal target within same heir type: 3 sons = each targets 1/3 of Sons group total area
- Indivisible items (if any movable assets) assigned to first individual + cash compensation to others
- Divisible value assets split into individual cards (each person gets their share card)
- Round-robin by value for remainder items when count doesn't divide evenly
- Auto-recompute on wizard data changes (properties added/removed, heir counts changed)

**Qurah Ceremony (Individual View):**
- Full overlay ceremony: bismillah header, shuffle animation, staggered reveal across all columns
- Global scope: Qurah redistributes ALL items across ALL individuals (cross-type)
- Faster stagger: ~200ms per column (vs Phase 9's 400ms) -- 7 columns = 1.4s total reveal
- Quranic/Hadith reference included in overlay
- Unlimited redraws via "Draw Again" button
- Button label: "Draw Lots (Qurah)" -- same as Phase 9
- Respects prefers-reduced-motion: instant reveal, no animations

**Accessibility:**
- Tab through cards, arrow keys between columns for keyboard DnD
- @dnd-kit live announcements for drag operations ("Picked up Gold from Son 1...")
- ARIA section announcements when focus enters new type group
- Inline rename: full keyboard support (Enter/Space activate, Escape cancel)
- Screen reader fallback: MobileFallback select lists individual heir names

**State & Persistence:**
- New individualDistributionStore (separate Zustand store with persist middleware)
- Independent from distributionStore -- own groups, items, undo stack, custom names
- Separate one-level undo stack from group view
- Fingerprint includes property IDs+values, movable asset IDs+values, AND heir type counts
- Saved with Phase 8 scenarios (localStorage persist)
- Full restoration on JSON import (assignments, names, distribution state)
- Scenario comparison includes individual-level differences (show all, mark extras for mismatched heir counts)

**Type-Based Colors:**
- Different Tailwind built-in accent colors per heir type section (Sons=emerald, Daughters=rose, Wife=blue, etc.)
- Subtle color on section headers and column borders
- Equilibrium bars stay standard (green/amber/red) regardless of section color

**PDF Output:**
- "Individual Asset Breakdown" section appears ONLY when individual view was used
- Placed after Distribution Summary (Phase 11 groups) section
- Individual sections grouped by heir type with section breaks per type (new page per type if needed)
- Each heir: name with type subtitle -- "Rahim (Son 1)" or "Son 1" if not renamed
- Colored equilibrium status indicator per heir
- Full pairwise compensation details ("Son 1 -> Dtr 1: BDT 30,000")
- Overall summary line at bottom: "6/7 heirs balanced | Total: 332.5 shotok | Compensation: BDT 120,000"
- Islamic-accented section title with Quranic reference
- Qurah reference included when mini Qurah was used
- Asset list format per heir: Claude's discretion (table vs bulleted list)

**Testing:**
- Full E2E: unit tests (individual distribution algorithm, split logic, compensation), component tests (board, columns, rename, toggle), integration tests (DnD interactions, Qurah ceremony, PDF generation)
- DnD tests: simulate events via fireEvent/userEvent (same as Phase 11)

### Claude's Discretion
- Toggle label text ("By Group" / "By Individual" or similar)
- View state persistence behavior (reset on group change vs always preserve)
- Store coupling approach (direct distributionStore read vs pure input)
- Component file structure (same distribution/ dir vs new subdirectory)
- Responsive breakpoints (same as Phase 11 or adjusted)
- Compensation banner format (all transfers vs net per individual)
- Split parcel merge/undo UX
- Results page HeirCard link to individual view
- Drag overlay styling
- PDF asset list format (table vs bullets)
- Column width (same 280px min or narrower)
- Mobile toggle placement
- Section header group share info

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop between individual columns | Already installed, same sensors as Phase 11 |
| zustand | ^5.0.11 | individualDistributionStore with persist middleware | Project standard, per-domain store pattern |
| motion/react | ^12.36.0 | Animations (staggered reveal, equilibrium bars, banners) | Already used extensively throughout app |
| react | ^19.2.4 | UI components with React.memo optimization | Project framework |
| @react-pdf/renderer | ^4.3.2 | PdfIndividualSection for individual breakdown | Existing PDF pipeline |
| tailwindcss | ^4.2.1 | Type-based accent colors, responsive layout | Project styling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fraction.js | ^5.3.4 | Faraid share fraction arithmetic | Individual target calculations |
| @dnd-kit/utilities | ^3.2.2 | CSS transform utilities for drag overlay | Drag overlay styling |
| vitest | ^4.1.0 | Unit/component/integration tests | All test files |
| @testing-library/react | ^16.3.2 | Component rendering and interaction tests | Component tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate store | Extended distributionStore | Separate store avoids coupling and complexity of merging two distribution levels into one store |
| @dnd-kit columns as droppables | Sortable containers | Droppable columns (current pattern) is simpler, sortable adds unnecessary ordering within columns |
| Persist middleware | Ephemeral store | CONTEXT.md locks: persist middleware for scenario save/restore and custom name persistence |

**Installation:**
No new packages needed. All dependencies already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    distribution/
      IndividualBoard.tsx          # DndContext + individual columns grid (mirrors DistributionBoard)
      IndividualColumn.tsx         # Per-individual droppable column with rename, icon, equilibrium
      IndividualControls.tsx       # Qurah + Undo controls for individual view
      IndividualQurahCeremony.tsx  # Bismillah + staggered reveal (200ms) adapted from QurahCeremony
      IndividualSummaryBanner.tsx  # "5/7 heirs balanced" with heir-type accent colors
      ParcelSplitDialog.tsx        # Modal/inline form: split parcel into sub-parcels by area
      IndividualCompensationBanner.tsx  # Pairwise compensation list between individuals
      ViewToggle.tsx               # Segmented control "By Group" | "By Individual" (role='tablist')
      # Existing files (reused directly):
      # AssetCard.tsx, EquilibriumBar.tsx, MobileFallback.tsx (extended), DistributionPage.tsx (modified)
    pdf/
      PdfIndividualSection.tsx     # PDF output for individual breakdown
  core/
    distribution/
      individual-algorithm.ts      # Initialization, split, merge, compensation, qurah for individuals
      individual-types.ts          # IndividualColumn, IndividualDistribution, SplitParcel types
  stores/
    individualDistributionStore.ts # Separate Zustand store with persist middleware
```

### Pattern 1: Independent Zustand Store with Persist
**What:** `individualDistributionStore` follows the same pattern as `scenariosStore` (persist middleware) but is domain-independent from `distributionStore`.
**When to use:** When state must survive page refreshes and be saveable to scenarios.
**Example:**
```typescript
// Pattern from scenariosStore.ts and wizardStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fractionStorage } from './fractionStorage'

interface IndividualDistributionState {
  individuals: IndividualColumn[]
  items: DistributionItem[]        // includes split sub-parcels
  compensations: IndividualCompensation[]
  customNames: Record<string, string>  // individualId -> custom name
  previousSnapshot: IndividualColumn[] | null
  fingerprint: string | null
  qurahMap: Map<number, string> | null
  isRevealed: boolean
  revealedCount: number
  hasBeenUsed: boolean             // tracks if individual view was ever used (for PDF)
}

export const useIndividualDistributionStore = create<IndividualDistributionStore>()(
  persist(
    (set, get) => ({ /* actions */ }),
    {
      name: 'jomi-bhag-individual-distribution',
      storage: fractionStorage,
      partialize: (state) => ({
        individuals: state.individuals,
        items: state.items,
        compensations: state.compensations,
        customNames: state.customNames,
        fingerprint: state.fingerprint,
        hasBeenUsed: state.hasBeenUsed,
      }),
    },
  ),
)
```

### Pattern 2: Snapshot-Based Initialization
**What:** Individual view initializes by reading group distributionStore state and expanding each group into per-individual columns.
**When to use:** On first toggle to "By Individual" or when fingerprint is stale.
**Example:**
```typescript
// Algorithm: expand groups to individuals
function expandGroupsToIndividuals(
  groups: DistributionGroup[],
  items: DistributionItem[],
  shares: ShareResult[],
  totalEstateValue: number,
): IndividualColumn[] {
  const individuals: IndividualColumn[] = []
  for (const group of groups) {
    const share = shares.find(s => s.heirType === group.heirType)
    if (!share) continue
    for (let i = 0; i < group.count; i++) {
      const individualTarget = group.targetValue / group.count
      individuals.push({
        id: `${group.heirType}_${i}`,
        heirType: group.heirType,
        index: i,
        displayName: `${HEIR_TYPE_LABELS[group.heirType]} ${i + 1}`,
        customName: null,
        targetValue: individualTarget,
        sharePerHeir: share.sharePerHeir,
        assignedItems: [],
        assignedValue: 0,
        cashAdjustment: 0,
      })
    }
  }
  return individuals
}
```

### Pattern 3: Parcel Split as Virtual Items
**What:** When a property is split, create new `DistributionItem` entries with parent reference. Original item is removed from assignable list.
**When to use:** Parcel split action.
**Example:**
```typescript
interface SplitParcel {
  id: string          // crypto.randomUUID()
  parentId: string    // original property ID
  label: string       // "Beki (5 shotok)"
  areaSqft: number    // split area
  value: number       // proportional value based on area ratio
}
// Items array maintains both original and split items
// Split items have type: 'split_parcel' and reference parentId
```

### Pattern 4: Greedy Minimum Transfer Compensation
**What:** Calculate pairwise cash compensation between individuals minimizing the number of transfers.
**When to use:** After any item move or redistribution.
**Example:**
```typescript
// Greedy algorithm: match largest surplus with largest deficit
function calculateIndividualCompensations(
  individuals: IndividualColumn[],
): IndividualCompensation[] {
  const compensations: IndividualCompensation[] = []
  const surpluses = individuals.map(ind => ({
    id: ind.id,
    remaining: ind.cashAdjustment,
  }))
  const overfilled = surpluses.filter(s => s.remaining > 0).sort((a, b) => b.remaining - a.remaining)
  const underfilled = surpluses.filter(s => s.remaining < 0).sort((a, b) => a.remaining - b.remaining)
  // Greedy matching...
  return compensations
}
```

### Pattern 5: Segmented Control with role='tablist'
**What:** Accessible toggle between group and individual views.
**When to use:** DistributionPage header area.
**Example:**
```typescript
<div role="tablist" aria-label="Distribution view">
  <button
    role="tab"
    aria-selected={view === 'group'}
    onClick={() => setView('group')}
  >
    By Group
  </button>
  <button
    role="tab"
    aria-selected={view === 'individual'}
    onClick={() => setView('individual')}
  >
    By Individual
  </button>
</div>
```

### Anti-Patterns to Avoid
- **Mutating group distributionStore from individual view:** The two stores are independent. Individual view ONLY reads from distributionStore during initialization. Never write back.
- **Using heirType as unique column ID:** In individual view, multiple columns have the same heirType (e.g., 3 sons). Use composite IDs like `son_0`, `son_1`, `son_2`.
- **Splitting original Property objects:** Parcel splits are virtual -- they create new DistributionItems, not new Property entries in wizardStore. The original property data is never modified.
- **Coupling Qurah state to divisionStore:** Individual view has its own Qurah state in individualDistributionStore. Don't reuse divisionStore's qurahMap.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop | Custom mouse/touch handlers | @dnd-kit/core DndContext + useDraggable/useDroppable | Already configured with correct sensors, accessibility built in |
| Equilibrium calculation | Custom percentage logic | `getEquilibriumStatus()` from `@/core/distribution/algorithm` | Already handles edge cases (zero target, rounding) |
| BDT formatting | `toLocaleString()` | `Intl.NumberFormat('en-IN', { currency: 'BDT' })` pattern | Consistent lakh/crore grouping across app |
| Fraction arithmetic | Floating point math | `fraction.js` Fraction objects | Exact arithmetic needed for Faraid share calculations |
| Animation stagger | Manual setTimeout chains | motion/react `staggerChildren` variant + `setInterval` reveal pattern | LotDivisionPage already has this exact pattern |
| UUID generation | Incrementing counters | `crypto.randomUUID()` | Used everywhere for IDs, no collision risk |

**Key insight:** Phase 14 is architecturally a superset of Phase 11's distribution board. Every UI primitive (AssetCard, EquilibriumBar, MobileFallback, SummaryBanner) already exists. The work is in the new store, the initialization algorithm, parcel splitting logic, and connecting it all together with the toggle.

## Common Pitfalls

### Pitfall 1: Droppable ID Collisions
**What goes wrong:** Using `heirType` as the droppable `id` causes collisions when multiple individuals share the same heirType (e.g., 3 sons).
**Why it happens:** Phase 11's `HeirColumn` uses `group.heirType` as the droppable ID, which works because each group has a unique heirType.
**How to avoid:** Use composite individual IDs like `son_0`, `son_1` for droppable IDs. The `handleDragEnd` must look up the individual by this composite ID.
**Warning signs:** Items snapping to wrong columns, or only the first column of a type being a valid drop target.

### Pitfall 2: Stale Fingerprint on Heir Count Changes
**What goes wrong:** Adding/removing heirs doesn't invalidate individual distribution because fingerprint only includes property/asset data.
**Why it happens:** distributionStore fingerprint was designed for Phase 11 where heir counts don't change column structure.
**How to avoid:** individualDistributionStore fingerprint MUST include heir type counts: `{ ...propertyIds, ...assetIds, sonCount, daughterCount, wifeCount, ... }`.
**Warning signs:** Changing son count from 3 to 5 but individual view still shows 3 son columns.

### Pitfall 3: Split Parcel Value Inconsistency
**What goes wrong:** Split parcels don't sum to original parcel value due to rounding.
**Why it happens:** Proportional value calculation: `(splitArea / totalArea) * totalValue` with floating point.
**How to avoid:** Use the last sub-parcel as remainder: `originalValue - sumOfOtherSplits`. This guarantees conservation.
**Warning signs:** Equilibrium bars show unexpected deviations after splitting.

### Pitfall 4: Zustand Selector Infinite Rerender with Empty Arrays
**What goes wrong:** Components rerender infinitely when Zustand selector returns a new empty array reference each time.
**Why it happens:** `[]` literal creates a new reference every render.
**How to avoid:** Use stable empty constants: `const EMPTY_INDIVIDUALS: IndividualColumn[] = []`. This pattern is already used in DistributionPage (`EMPTY_SHARES`).
**Warning signs:** "Maximum update depth exceeded" React errors.

### Pitfall 5: persist Middleware with Map Objects
**What goes wrong:** `qurahMap` (Map type) doesn't serialize to JSON natively, causing persistence failures.
**Why it happens:** JSON.stringify doesn't handle Map objects.
**How to avoid:** Either exclude qurahMap from partialize, or convert to/from plain object in the storage adapter. Since qurahMap is ephemeral ceremony state, exclude it from persistence.
**Warning signs:** Error on page refresh, or qurahMap always null after restore.

### Pitfall 6: Cross-type Compensation Complexity
**What goes wrong:** With 7+ individuals, greedy compensation produces too many tiny transfers.
**Why it happens:** Each pair with non-zero surplus/deficit generates a compensation entry.
**How to avoid:** Filter out compensations below a minimum threshold (e.g., BDT 100), and sort by amount descending for display.
**Warning signs:** Compensation banner showing 15+ tiny transfers that are impractical.

### Pitfall 7: DnD Event Conflicts with Inline Rename
**What goes wrong:** Clicking to rename a column header triggers drag start instead.
**Why it happens:** The column header area might be within the droppable zone.
**How to avoid:** Rename input should be separate from any draggable/droppable area. Use `stopPropagation` on the rename input's mousedown/pointerdown events.
**Warning signs:** Can't click to rename, or renaming triggers drag.

## Code Examples

### Existing Components to Reuse Directly

**AssetCard** (`src/components/distribution/AssetCard.tsx`): Fully reusable. Same draggable card with category icon, label, BDT value. Settlement panel can be disabled for individual view (settlement is per-property-group, not per-individual).

**EquilibriumBar** (`src/components/distribution/EquilibriumBar.tsx`): Fully reusable. Same green/amber/red thresholds (2%/5%). Used in IndividualColumn header.

**getColumnBorderColor** (from EquilibriumBar.tsx): Reusable for type-colored borders, but individual view adds heir-type accent colors on top.

**HeirIcon** (from `src/components/results/HeirCard.tsx`): Extract the `HeirIcon` component and `feminineHeirs` set into a shared location (e.g., `src/components/ui/HeirIcon.tsx`) so both HeirCard and IndividualColumn can use it.

### Individual Column Target Calculation
```typescript
// Each individual's target = group targetValue / group count
// Son group: targetValue=600000, count=3 -> each son targets 200000
// Individual share = share.sharePerHeir (Fraction from engine output)
function computeIndividualTarget(
  groupTargetValue: number,
  groupCount: number,
): number {
  return Math.round(groupTargetValue / groupCount)
}
```

### Parcel Split Algorithm
```typescript
interface SplitInput {
  originalItem: DistributionItem
  splits: { areaSqft: number }[]   // user-entered split areas
  totalAreaSqft: number             // original property's total area
}

function splitParcel(input: SplitInput): DistributionItem[] {
  const { originalItem, splits, totalAreaSqft } = input
  let remainingValue = originalItem.value

  return splits.map((split, idx) => {
    const isLast = idx === splits.length - 1
    const proportionalValue = isLast
      ? remainingValue  // remainder to avoid rounding errors
      : Math.round((split.areaSqft / totalAreaSqft) * originalItem.value)

    remainingValue -= proportionalValue

    return {
      id: crypto.randomUUID(),
      type: 'property' as const,
      category: originalItem.category,
      label: `${originalItem.label} (${formatArea(split.areaSqft)})`,
      value: proportionalValue,
      parentId: originalItem.id,     // track original for merge
      areaSqft: split.areaSqft,
    }
  })
}
```

### Individual Qurah Shuffle
```typescript
// Adapted from smartShuffle but operates on individuals instead of groups
function individualQurahShuffle(
  items: DistributionItem[],
  individuals: IndividualColumn[],
): IndividualColumn[] {
  // Same algorithm as smartShuffle but with individual columns
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const newIndividuals = individuals.map(ind => ({
    ...ind,
    assignedItems: [] as string[],
    assignedValue: 0,
    cashAdjustment: 0,
  }))

  const values = new Map(newIndividuals.map(ind => [ind.id, 0]))

  for (const item of sorted) {
    const candidates = newIndividuals
      .map(ind => ({ id: ind.id, gap: ind.targetValue - (values.get(ind.id) ?? 0) }))
      .sort((a, b) => b.gap - a.gap)

    const bestGap = candidates[0].gap
    const threshold = bestGap * 0.8
    const top = candidates.filter(c => c.gap >= threshold)
    const chosen = top[Math.floor(Math.random() * top.length)]

    const individual = newIndividuals.find(ind => ind.id === chosen.id)!
    individual.assignedItems.push(item.id)
    values.set(chosen.id, (values.get(chosen.id) ?? 0) + item.value)
  }

  // Recalculate values
  const itemMap = new Map(items.map(i => [i.id, i]))
  for (const ind of newIndividuals) {
    ind.assignedValue = ind.assignedItems.reduce(
      (sum, id) => sum + (itemMap.get(id)?.value ?? 0), 0)
    ind.cashAdjustment = Math.round(ind.assignedValue - ind.targetValue)
  }

  return newIndividuals
}
```

### Inline Rename Component Pattern
```typescript
function InlineRename({
  value, onSave
}: { value: string; onSave: (name: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setEditing(true)
          }
        }}
        className="cursor-pointer text-left font-semibold hover:underline"
      >
        {value}
      </button>
    )
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { onSave(draft); setEditing(false) }
        if (e.key === 'Escape') { setDraft(value); setEditing(false) }
      }}
      onBlur={() => { onSave(draft); setEditing(false) }}
      onPointerDown={(e) => e.stopPropagation()}  // prevent DnD conflict
      className="w-full rounded border px-1 text-sm font-semibold"
    />
  )
}
```

### Type-Based Color Mapping
```typescript
// Tailwind built-in accent colors per heir type
const HEIR_TYPE_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  son: { border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  daughter: { border: 'border-rose-300', bg: 'bg-rose-50', text: 'text-rose-700' },
  wife: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700' },
  husband: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700' },
  brother_full: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' },
  brother_consanguine: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' },
  brother_uterine: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' },
  sister_full: { border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-700' },
  sister_consanguine: { border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-700' },
  sister_uterine: { border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-700' },
  // ... remaining types
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @dnd-kit v5 | @dnd-kit v6 (^6.3.1) | 2024 | v6 has improved collision detection, this project already uses v6 |
| framer-motion | motion/react (^12.36.0) | 2024 | Project already uses new import path |
| zustand v4 | zustand v5 (^5.0.11) | 2024 | Project already uses v5 create syntax |

**Deprecated/outdated:**
- None relevant. All project dependencies are current.

## Discretion Recommendations

Based on the codebase analysis and CONTEXT.md, here are recommendations for Claude's discretion areas:

| Area | Recommendation | Rationale |
|------|----------------|-----------|
| Toggle label text | "By Group" / "By Individual" | Clear, concise, matches CONTEXT.md language |
| View state persistence | Reset individual view when group distribution changes (stale fingerprint) but preserve on simple toggle | Prevents confusion from stale data |
| Store coupling | Pure input via snapshot -- read distributionStore.getState() during init only, no subscriptions | Cleaner separation, no cascading updates |
| Component file structure | Same `src/components/distribution/` directory with `Individual` prefix | Follows flat structure pattern, avoids nesting |
| Responsive breakpoints | Same as Phase 11 (md:grid-cols-2, lg:flex-row) | Consistency |
| Compensation banner format | Net per individual with expand to show all transfers | Reduces visual noise for complex cases |
| Split parcel merge UX | "Merge back" button on sub-parcel cards showing original name | Simple undo without complex merge UI |
| Drag overlay styling | Shadow + ring (same as Phase 11 AssetCard isOverlay) | Consistency |
| PDF asset list format | Table format (matching PdfDistributionSection pattern) | Consistency with existing PDF |
| Column width | Same 280px min as Phase 11 | Consistency |
| Mobile toggle placement | Above controls bar, below "Asset Distribution" heading | Natural reading order |
| Section header group share info | Show group total: "Sons (2/7 each = 4/7 total)" | Provides context for why individual targets differ |

## Open Questions

1. **Store persistence scope for scenarios**
   - What we know: CONTEXT.md says "saved with Phase 8 scenarios" and "full restoration on JSON import"
   - What's unclear: The `Scenario` type currently only stores `WizardState`. Individual distribution state is NOT part of WizardState.
   - Recommendation: Either extend `Scenario` to include individual distribution state, or save individual state in its own persist key and link via fingerprint. The simpler approach is extending the Scenario type with an optional `individualDistribution` field, and adding individual state to the export schema.

2. **JSON export schema version bump**
   - What we know: Current schema version is 1. Adding custom names and individual distribution to export requires new fields.
   - What's unclear: Whether to bump to version 2 or keep backward-compatible optional fields.
   - Recommendation: Keep version 1, add optional fields (`customHeirNames`, `individualDistribution`). Import ignores missing fields per existing pattern.

3. **Interaction between settlement methods and individual view**
   - What we know: Settlement methods (Phase 13) are per-property-group, not per-individual.
   - What's unclear: Should settlement panel appear in individual view cards?
   - Recommendation: Hide settlement panel in individual view. Settlement is a group-level decision. Individual view focuses on which specific parcels go to which specific person.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | vite.config.ts (unified Vite+Vitest) |
| Quick run command | `npx vitest run src/core/distribution/__tests__/individual-algorithm.test.ts --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| P14-01 | Toggle between group and individual views | component | `npx vitest run src/components/__tests__/individual-distribution.test.tsx -x` | Wave 0 |
| P14-02 | Individual columns created from group expansion | unit | `npx vitest run src/core/distribution/__tests__/individual-algorithm.test.ts -x` | Wave 0 |
| P14-03 | DnD between individual columns | component | `npx vitest run src/components/__tests__/individual-distribution.test.tsx -x` | Wave 0 |
| P14-04 | Parcel split/merge creates sub-parcel items | unit | `npx vitest run src/core/distribution/__tests__/individual-algorithm.test.ts -x` | Wave 0 |
| P14-05 | Per-individual equilibrium bars (2%/5% thresholds) | unit | `npx vitest run src/core/distribution/__tests__/individual-algorithm.test.ts -x` | Wave 0 (reuses getEquilibriumStatus) |
| P14-06 | Cash compensation between individuals (greedy min transfers) | unit | `npx vitest run src/core/distribution/__tests__/individual-algorithm.test.ts -x` | Wave 0 |
| P14-07 | Inline rename with keyboard support | component | `npx vitest run src/components/__tests__/individual-distribution.test.tsx -x` | Wave 0 |
| P14-08 | Qurah ceremony with 200ms stagger | component | `npx vitest run src/components/__tests__/individual-distribution.test.tsx -x` | Wave 0 |
| P14-09 | Custom names persist in store and JSON export | unit | `npx vitest run src/stores/__tests__/individualDistributionStore.test.ts -x` | Wave 0 |
| P14-10 | PDF individual breakdown section | component | `npx vitest run src/components/__tests__/pdf-individual.test.tsx -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/core/distribution/__tests__/individual-algorithm.test.ts` -- covers P14-02, P14-04, P14-05, P14-06
- [ ] `src/components/__tests__/individual-distribution.test.tsx` -- covers P14-01, P14-03, P14-07, P14-08
- [ ] `src/stores/__tests__/individualDistributionStore.test.ts` -- covers P14-09
- [ ] `src/components/__tests__/pdf-individual.test.tsx` -- covers P14-10

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of all files in `src/stores/`, `src/components/distribution/`, `src/core/distribution/`, `src/components/pdf/`, `src/core/json/`
- `package.json` for exact library versions
- `vite.config.ts` for test framework configuration
- `14-CONTEXT.md` for all user decisions and implementation constraints

### Secondary (MEDIUM confidence)
- @dnd-kit v6 API knowledge (DndContext, useDraggable, useDroppable, sensors) -- verified by existing usage in DistributionBoard.tsx
- Zustand v5 persist middleware -- verified by existing usage in wizardStore.ts and scenariosStore.ts

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and used in Phase 11
- Architecture: HIGH -- direct extension of existing distribution board pattern with well-understood Zustand store patterns
- Pitfalls: HIGH -- identified from actual codebase patterns and known React/DnD issues
- Individual algorithm: HIGH -- greedy shuffle, equilibrium calculation, and compensation are direct adaptations of existing Phase 11 code
- Parcel splitting: MEDIUM -- new domain logic, but conceptually simple (area-proportional value split)
- Persistence/scenarios integration: MEDIUM -- extending existing types, but requires careful schema design

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable stack, no external dependency changes expected)
