# Phase 11: Interactive Asset Distribution with Drag-and-Drop Equilibrium - Research

**Researched:** 2026-03-13
**Domain:** Drag-and-drop Kanban UI, equilibrium algorithms, real-time state management
**Confidence:** HIGH

## Summary

Phase 11 transforms the Phase 9 land division page into a full Kanban-style drag-and-drop distribution board that handles ALL assets (land parcels from Phase 4 + movable assets from Phase 10). Users drag individual asset cards between heir group columns, with real-time progress bars showing how close each group is to its Faraid share target. A "Randomize" button provides smart shuffling toward equilibrium, and one-level undo supports iterative adjustment.

The existing codebase provides a strong foundation: `divisionStore.ts` already manages group assignments with `moveParcel`, `divideParcels` for greedy best-fit initial assignment, and `calculateCompensations` for cash adjustment computation. The main work is (1) extending the division algorithm to handle movable assets alongside land parcels, (2) replacing the "Move to..." select UI with dnd-kit Kanban columns, (3) adding equilibrium progress bars with color-coded tolerance ranges, and (4) a smart randomize algorithm.

**Primary recommendation:** Use `@dnd-kit/core` (v6.3.1, stable) + `@dnd-kit/sortable` (v10.0.0) for drag-and-drop. These are the mature, stable packages with React 19 peer dependency support (`>=16.8.0`). Avoid the beta `@dnd-kit/react` (v0.3.2) as it is not yet stable. Combine with the existing `motion/react` (Framer Motion) for animations.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Individual items dragged: each asset (land parcel, vehicle, gold entry, etc.) is a draggable card. User drags one item at a time between heir group columns
- Horizontal column layout (Kanban-style): each heir group is a vertical column side by side. Items stack vertically within each column. Scrollable if many items
- Mobile: long-press (500ms) to activate drag mode. Item follows finger, drop zones highlight. Fallback: "Move to..." buttons from Phase 9 always available
- One-level undo: "Undo" button appears after each move, reverting the last drag. Disappears after the next action
- Tolerance range: green when within +/-2% of Faraid share target, amber within +/-5%, red when further off
- Top border bar with percentage: colored bar at the top of each heir group column showing fill level relative to target. Label shows "98% of target"
- Over-allocation visible: bar extends beyond 100% with red/amber tint for surplus. Text shows "+BDT50,000 over target"
- Overall summary banner above all columns: "3/4 groups balanced" or "All groups balanced!" with celebratory animation when all groups hit green
- Smart shuffle toward equilibrium: randomly redistribute all items but weighted toward balance -- larger items assigned to under-filled groups first, smaller items fill gaps
- Unlimited re-randomize: each click produces a new distribution. Undo reverts to pre-randomize state
- Simple action button (no Qurah ceremony): "Randomize" is a utility action with brief shuffle animation
- Cash compensation alongside DnD: remaining imbalance after manual DnD adjustments shows as cash compensation (Phase 9 pattern)
- Replaces and upgrades Phase 9's UI: Phase 9's greedy best-fit algorithm runs as the initial assignment, but the UI becomes DnD Kanban columns
- All assets combined: one DnD board with ALL assets -- land parcels, vehicles, gold, livestock, custom items. Items visually distinguished by category (color/icon)
- Entry point: "Distribute Assets" button on Results page (replaces Phase 9's "Divide Land" button). Only appears when properties or movable assets exist
- Saved and in PDF: distribution state saved with scenario (Phase 8 persistence). PDF includes "Distribution Summary" section showing group assignments + cash adjustments

### Claude's Discretion
- DnD library choice (dnd-kit, react-beautiful-dnd, or native HTML5 DnD)
- Item card visual design and category color/icon scheme
- Shuffle animation timing and easing
- Kanban column responsive breakpoints
- Celebratory animation when all groups balanced
- How DnD state integrates with Zustand store
- PDF distribution summary layout
- Touch drag sensitivity and drop zone sizing

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | 6.3.1 | DnD context, sensors, collision detection | Stable, mature, peer dep `>=16.8.0` covers React 19. 10kB min+gzip. Built-in touch/pointer/keyboard sensors |
| @dnd-kit/sortable | 10.0.0 | Sortable preset for reorderable items within columns | Works on top of @dnd-kit/core. Provides useSortable, SortableContext, sortingStrategies |
| @dnd-kit/utilities | (bundled) | CSS transform utilities for drag overlays | Provides CSS.Transform.toString() for performant transforms |
| motion/react | 12.36.0 | Shuffle animation, undo feedback, celebration, layout transitions | Already in project. AnimatePresence, layout animations, spring physics |
| zustand | 5.0.11 | Distribution board state (extends existing divisionStore) | Already in project. Ephemeral store pattern established |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @dnd-kit/modifiers | latest | Restrict drag axis, snap to grid | Only if needed for constraining drag behavior |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit/core (stable) | @dnd-kit/react (beta 0.3.2) | New API is nicer but beta, not production-ready. Stick with stable |
| @dnd-kit/core | react-beautiful-dnd | Deprecated by Atlassian, archived Aug 2025. No React 19 support |
| @dnd-kit/core | @hello-pangea/dnd | Community fork of rbd, maintained but less ecosystem/docs than dnd-kit |
| @dnd-kit/core | pragmatic-drag-and-drop | Atlassian's new headless lib (4.7kB). Good but less mature ecosystem for Kanban pattern |
| @dnd-kit/core | HTML5 native DnD | No touch support on mobile. No keyboard accessibility. No drag overlay customization |

**Installation:**
```bash
bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── distribution/           # NEW - replaces/upgrades division/
│       ├── DistributionBoard.tsx    # Main DnD board with DndContext
│       ├── HeirColumn.tsx           # Droppable column per heir group
│       ├── AssetCard.tsx            # Draggable card for any asset
│       ├── EquilibriumBar.tsx       # Progress bar with green/amber/red
│       ├── SummaryBanner.tsx        # "3/4 groups balanced" banner
│       ├── DistributionControls.tsx # Randomize + Undo buttons
│       └── MobileFallback.tsx       # "Move to..." select for mobile fallback
├── core/
│   └── distribution/            # NEW - unified distribution logic
│       ├── types.ts             # DistributionItem, DistributionGroup, etc.
│       ├── algorithm.ts         # Smart shuffle, equilibrium calculation
│       └── __tests__/
│           └── algorithm.test.ts
├── stores/
│   └── distributionStore.ts     # NEW - replaces/extends divisionStore
```

### Pattern 1: Unified Asset Item Model
**What:** A single `DistributionItem` type that wraps both Property and MovableAsset into a common draggable item with id, label, value, category, and source reference.
**When to use:** Throughout the distribution board. All algorithms and UI operate on DistributionItem, not raw Property/MovableAsset.
**Example:**
```typescript
// Source: Project architecture pattern
interface DistributionItem {
  id: string              // property.id or asset.id
  type: 'property' | 'movable'
  category: string        // 'residential', 'gold_silver', 'vehicle', etc.
  label: string           // display name
  value: number           // BDT value from computePropertyTotal or computeAssetValue
  sourceId: string        // original property/asset id for lookup
}

// Convert from existing data:
function buildDistributionItems(
  properties: Property[],
  movableAssets: MovableAsset[],
): DistributionItem[]
```

### Pattern 2: DndContext with Multi-Container Droppable
**What:** DndContext wraps the entire board. Each heir column is a droppable container. Items are draggable within and between containers.
**When to use:** Core DnD interaction pattern.
**Example:**
```typescript
// Source: dnd-kit docs + kanban patterns
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { useSensor, useSensors, PointerSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core'

function DistributionBoard() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Heir columns */}
      <DragOverlay>
        {activeItem ? <AssetCard item={activeItem} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
```

### Pattern 3: TouchSensor with Long-Press Activation
**What:** Touch drag requires 500ms long-press to activate, per user decision. This distinguishes scroll from drag on mobile.
**When to use:** Mobile touch interaction.
**Example:**
```typescript
// Source: @dnd-kit/core sensors documentation
useSensor(TouchSensor, {
  activationConstraint: {
    delay: 500,       // 500ms long-press per CONTEXT.md decision
    tolerance: 5,     // 5px movement tolerance during delay
  },
})
```

### Pattern 4: Equilibrium Calculation
**What:** Compute fill percentage and status (green/amber/red) for each group relative to its Faraid target.
**When to use:** Real-time after every item move or randomize.
**Example:**
```typescript
type EquilibriumStatus = 'balanced' | 'close' | 'off'

function getEquilibriumStatus(
  assignedValue: number,
  targetValue: number,
): { status: EquilibriumStatus; percentage: number; delta: number } {
  if (targetValue === 0) return { status: 'balanced', percentage: 100, delta: 0 }
  const percentage = (assignedValue / targetValue) * 100
  const deviation = Math.abs(percentage - 100)

  if (deviation <= 2) return { status: 'balanced', percentage, delta: assignedValue - targetValue }
  if (deviation <= 5) return { status: 'close', percentage, delta: assignedValue - targetValue }
  return { status: 'off', percentage, delta: assignedValue - targetValue }
}
// green = balanced (within +/-2%), amber = close (within +/-5%), red = off (beyond +/-5%)
```

### Pattern 5: Smart Shuffle Algorithm
**What:** Randomize distribution weighted toward equilibrium. Not a pure random -- larger items go to under-filled groups first, smaller items fill gaps, with randomization in the selection process.
**When to use:** "Randomize" button click.
**Example:**
```typescript
function smartShuffle(
  items: DistributionItem[],
  groups: DistributionGroup[],
): Map<string, string> {  // itemId -> groupHeirType
  // 1. Sort items by value descending (largest first)
  const sorted = [...items].sort((a, b) => b.value - a.value)

  // 2. Reset all group assigned values
  const assignments = new Map<string, string[]>() // heirType -> itemIds
  const groupValues = new Map<string, number>()    // heirType -> current value

  // 3. For each item, find groups most under-target, pick randomly among top candidates
  for (const item of sorted) {
    // Compute remaining capacity for each group
    const candidates = groups
      .map(g => ({
        heirType: g.heirType,
        gap: g.targetValue - (groupValues.get(g.heirType) ?? 0),
      }))
      .sort((a, b) => b.gap - a.gap)

    // Pick randomly from top N candidates (those within 80% of best gap)
    const bestGap = candidates[0].gap
    const threshold = bestGap * 0.8
    const topCandidates = candidates.filter(c => c.gap >= threshold)
    const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)]

    // Assign
    const existing = assignments.get(chosen.heirType) ?? []
    existing.push(item.id)
    assignments.set(chosen.heirType, existing)
    groupValues.set(chosen.heirType, (groupValues.get(chosen.heirType) ?? 0) + item.value)
  }

  return assignments
}
```

### Pattern 6: One-Level Undo with Previous State Snapshot
**What:** Store previous distribution state snapshot. Undo button reverts to it. Cleared on next action.
**When to use:** After every move or randomize action.
**Example:**
```typescript
// In distributionStore:
interface DistributionState {
  groups: DistributionGroup[]
  previousSnapshot: DistributionGroup[] | null  // one-level undo
  // ...
}

// On any action (move/randomize):
set({
  previousSnapshot: structuredClone(get().groups),
  groups: newGroups,
})

// On undo:
set({
  groups: get().previousSnapshot!,
  previousSnapshot: null,
})
```

### Anti-Patterns to Avoid
- **Mutating group arrays directly:** Always create new arrays/objects when updating groups. The existing `moveParcel` function already follows this immutable pattern -- preserve it.
- **Recomputing from scratch on every drag:** Cache computation results. Only recompute assignedValue and cashAdjustment for the two affected groups, not all groups.
- **Using sortable within columns when sorting order doesn't matter:** The items within a column don't need sorted order -- they're just assigned to a group. Use `useDroppable` for columns and `useDraggable` for items. Only use `@dnd-kit/sortable` if you want visual reordering within columns. Simpler approach: plain droppable columns + draggable items.
- **Storing DnD visual state in Zustand:** Transient drag state (activeItem, drag position) should live in React component state or DndContext, not the store.
- **Forgetting mobile fallback:** DnD on mobile can be frustrating. Always keep the "Move to..." select as a fallback alongside DnD.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop interaction | Custom pointer event tracking | @dnd-kit/core sensors | Touch delay, keyboard accessibility, collision detection, drag overlay are deceptively complex |
| Touch long-press detection | Custom touch timer with touchstart/touchmove/touchend | @dnd-kit/core TouchSensor with activationConstraint.delay | Handles edge cases: scroll prevention, multi-touch, viewport changes |
| Collision detection | Custom hitbox math | @dnd-kit/core closestCorners | Handles overlapping drop zones, edge cases with scrolling containers |
| Drag overlay rendering | Absolute-positioned clone div | DragOverlay component | Handles z-index, portal rendering, transform origin, animations |
| Accessible drag announcements | Custom aria-live regions | @dnd-kit/core accessibility | Built-in screen reader announcements for drag start/over/end |

**Key insight:** DnD libraries handle an enormous surface area of edge cases (scroll during drag, viewport boundaries, touch vs mouse vs keyboard, accessibility announcements, z-index management, collision detection algorithms). Building custom DnD from pointer events is a well-known trap.

## Common Pitfalls

### Pitfall 1: DragOverlay Not Rendering During Cross-Container Moves
**What goes wrong:** Items disappear during drag if you rely on the original item's position. When dragging between containers, the item is temporarily in neither container.
**Why it happens:** The item is removed from the source container before being added to the destination during onDragOver.
**How to avoid:** Always use DragOverlay to render a floating copy of the dragged item. Keep the original item in place (hidden or dimmed) until onDragEnd confirms the drop.
**Warning signs:** Item flickers or disappears during cross-column drag.

### Pitfall 2: Mobile Scroll Interference
**What goes wrong:** Users try to scroll the Kanban columns but accidentally trigger drag on touch devices.
**Why it happens:** Touch events for scrolling and dragging conflict.
**How to avoid:** Use TouchSensor with `activationConstraint: { delay: 500, tolerance: 5 }` per the user's decision. The 500ms delay clearly separates scroll (immediate) from drag (hold). Also provide the "Move to..." fallback buttons.
**Warning signs:** Users report accidentally moving items when trying to scroll.

### Pitfall 3: Over-Allocation Progress Bar Exceeding Container
**What goes wrong:** When a group has more than 100% of its target, the progress bar overflows its container.
**Why it happens:** Naive `width: ${percentage}%` exceeds 100%.
**How to avoid:** Cap the bar width at 100% but change the color to indicate over-allocation. Show the actual percentage as text. Use `Math.min(percentage, 100)` for CSS width, and conditionally apply red/amber tint when over 100%.
**Warning signs:** Bar breaks layout or extends beyond its container.

### Pitfall 4: Stale Equilibrium After Randomize
**What goes wrong:** Progress bars show old values after randomize because state update is batched.
**Why it happens:** React batches state updates, and derived values may lag.
**How to avoid:** Compute equilibrium status directly from the groups array in a selector or derived function, not as a separate state field. Use `useMemo` or a Zustand selector that derives from groups.
**Warning signs:** Bars flash old colors briefly after randomize.

### Pitfall 5: Division Store Fingerprint Mismatch After Adding Movable Assets
**What goes wrong:** The existing `divisionStore.isStale()` only checks property fingerprints (land parcels), not movable assets. Adding a movable asset won't trigger re-computation.
**Why it happens:** `computeFingerprint()` in divisionStore only maps `properties`.
**How to avoid:** The new distributionStore must include movable assets in its fingerprint computation.
**Warning signs:** Distribution board shows stale data after editing movable assets.

### Pitfall 6: Persisting DnD State Across Sessions
**What goes wrong:** Distribution state is saved but references stale property/asset IDs after edits.
**Why it happens:** User adds/removes properties between sessions.
**How to avoid:** Use fingerprint-based staleness detection (like the existing divisionStore pattern). When stale, recompute from scratch. Store distribution as ephemeral state (derivable from wizardStore), same pattern as current divisionStore.
**Warning signs:** Distribution board shows items that no longer exist.

## Code Examples

### Unified Item Builder
```typescript
// Source: Project architecture pattern
import type { Property } from '@/core/land/types'
import { computePropertyTotal } from '@/core/land/types'
import type { MovableAsset } from '@/core/assets/types'
import { computeAssetValue } from '@/core/assets/valuation'

export interface DistributionItem {
  id: string
  type: 'property' | 'movable'
  category: string
  label: string
  value: number
}

export function buildDistributionItems(
  properties: Property[],
  movableAssets: MovableAsset[],
): DistributionItem[] {
  const propertyItems: DistributionItem[] = properties.map((p, i) => ({
    id: p.id,
    type: 'property' as const,
    category: p.type ?? 'land',
    label: p.nickname || `Property #${i + 1}`,
    value: computePropertyTotal(p),
  }))

  const assetItems: DistributionItem[] = movableAssets.map((a) => ({
    id: a.id,
    type: 'movable' as const,
    category: a.category,
    label: getAssetLabel(a),
    value: computeAssetValue(a),
  }))

  return [...propertyItems, ...assetItems]
}
```

### Equilibrium Bar Component
```typescript
// Source: Project pattern + CONTEXT.md decisions
const STATUS_COLORS = {
  balanced: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-700' },
  close:    { bg: 'bg-amber-400',   border: 'border-amber-400',   text: 'text-amber-700' },
  off:      { bg: 'bg-red-500',     border: 'border-red-500',     text: 'text-red-700' },
} as const

function EquilibriumBar({ assigned, target }: { assigned: number; target: number }) {
  const { status, percentage, delta } = getEquilibriumStatus(assigned, target)
  const colors = STATUS_COLORS[status]
  const barWidth = Math.min(percentage, 100)

  return (
    <div className={`rounded-t-xl border-t-4 ${colors.border} px-3 py-1.5`}>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <motion.div
          className={`h-full rounded-full ${colors.bg}`}
          initial={false}
          animate={{ width: `${barWidth}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
      <span className={`text-xs font-medium ${colors.text}`}>
        {Math.round(percentage)}% of target
        {delta > 0 && ` (+${formatBDT(delta)} over)`}
      </span>
    </div>
  )
}
```

### Category Color/Icon Scheme
```typescript
// Source: Design decision (Claude's discretion)
export const CATEGORY_STYLES: Record<string, { color: string; icon: string }> = {
  residential:  { color: 'bg-blue-100 text-blue-700 border-blue-200',   icon: 'house' },
  agricultural: { color: 'bg-green-100 text-green-700 border-green-200', icon: 'tree' },
  commercial:   { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'building' },
  mixed:        { color: 'bg-gray-100 text-gray-700 border-gray-200',   icon: 'grid' },
  gold_silver:  { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: 'coins' },
  cash:         { color: 'bg-teal-100 text-teal-700 border-teal-200',   icon: 'banknote' },
  vehicle:      { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: 'car' },
  jewelry:      { color: 'bg-pink-100 text-pink-700 border-pink-200',   icon: 'gem' },
  furniture:    { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'armchair' },
  livestock:    { color: 'bg-lime-100 text-lime-700 border-lime-200',   icon: 'beef' },
  custom:       { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'box' },
}
```

### DnD Kanban Column with Droppable
```typescript
// Source: @dnd-kit/core docs
import { useDroppable } from '@dnd-kit/core'

function HeirColumn({ group, items }: { group: DistributionGroup; items: DistributionItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: group.heirType })

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] flex-col rounded-xl border bg-white shadow-sm ${
        isOver ? 'border-emerald-400 bg-emerald-50/30' : 'border-gray-200'
      }`}
    >
      <EquilibriumBar assigned={group.assignedValue} target={group.targetValue} />
      <div className="p-3">
        <h3 className="font-semibold text-gray-900">{group.label}</h3>
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <AssetCard key={item.id} item={item} groupId={group.heirType} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Responsive Kanban Layout
```typescript
// Source: Design decision (Claude's discretion)
// Mobile: vertical stack (1 column), Tablet: 2 columns, Desktop: horizontal scroll
<div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:flex lg:flex-row">
  {groups.map((group) => (
    <div key={group.heirType} className="min-w-[280px] flex-shrink-0 lg:flex-1">
      <HeirColumn group={group} items={getItemsForGroup(group.heirType)} />
    </div>
  ))}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit/core + @dnd-kit/sortable | Atlassian deprecated rbd Aug 2025 | dnd-kit is the ecosystem standard for React DnD |
| @dnd-kit/core (legacy API) | @dnd-kit/react (new API) | 2024, beta | New API is cleaner but beta -- stick with stable @dnd-kit/core for production |
| Manual touch handling | @dnd-kit TouchSensor with delay constraint | Built-in | Handles all edge cases: scroll prevention, multi-touch |

**Deprecated/outdated:**
- react-beautiful-dnd: Archived by Atlassian Aug 2025. Do not use for new projects.
- react-dnd: Low maintenance, complex API. Not recommended over dnd-kit.

## Open Questions

1. **How should divisible movable assets be handled in distribution?**
   - What we know: Gold/silver, cash, and furniture are marked `defaultIndivisible: false`. They can be split proportionally per Faraid shares.
   - What's unclear: Should divisible assets appear as draggable cards at all, or should they be auto-distributed as cash-equivalent? If draggable, they represent their full value in one group.
   - Recommendation: Include ALL assets as draggable cards for simplicity and user control. Divisible assets are still whole items in the DnD board (e.g., "Gold 5 vori 22K" is one card). The fact that they could be physically divided is a real-world decision, not a software constraint. Cash compensation handles the remainder.

2. **Should the distribution page replace or coexist with the existing LotDivisionPage?**
   - What we know: CONTEXT.md says "replaces and upgrades Phase 9's UI". The Qurah ceremony components remain available.
   - What's unclear: Whether to modify LotDivisionPage in-place or create a new DistributionBoard and redirect the navigation.
   - Recommendation: Create a new `DistributionBoard` component and update the `AppPage` type from `'division'` to `'distribution'` (or keep as `'division'` and swap the component). Keep old division components as-is for now since the Qurah ceremony is separate.

3. **PDF distribution summary layout**
   - What we know: CONTEXT.md says PDF should include distribution summary. Existing PdfLotDivisionSection shows groups with assigned properties.
   - What's unclear: How to show the mixed asset types (land + movable) in PDF table format.
   - Recommendation: Extend the existing PdfLotDivisionSection pattern. Table per group showing all assigned items (both properties and movable assets) with category badges.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | vite.config.ts (test section) |
| Quick run command | `bunx vitest run src/core/distribution/ src/components/__tests__/distribution.test.tsx` |
| Full suite command | `bunx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| P11-01 | Unified distribution items from properties + movable assets | unit | `bunx vitest run src/core/distribution/__tests__/algorithm.test.ts -x` | Wave 0 |
| P11-02 | Smart shuffle produces near-equilibrium distribution | unit | `bunx vitest run src/core/distribution/__tests__/algorithm.test.ts -x` | Wave 0 |
| P11-03 | Equilibrium status calculation (green/amber/red) | unit | `bunx vitest run src/core/distribution/__tests__/algorithm.test.ts -x` | Wave 0 |
| P11-04 | DnD board renders heir columns with items | integration | `bunx vitest run src/components/__tests__/distribution.test.tsx -x` | Wave 0 |
| P11-05 | Move item between groups updates state and equilibrium | integration | `bunx vitest run src/components/__tests__/distribution.test.tsx -x` | Wave 0 |
| P11-06 | One-level undo reverts last action | unit | `bunx vitest run src/stores/__tests__/distributionStore.test.ts -x` | Wave 0 |
| P11-07 | Distribute Assets button appears when assets exist | integration | `bunx vitest run src/components/__tests__/distribution.test.tsx -x` | Wave 0 |
| P11-08 | Mobile fallback "Move to..." buttons functional | integration | `bunx vitest run src/components/__tests__/distribution.test.tsx -x` | Wave 0 |
| P11-09 | PDF distribution summary with mixed assets | unit | `bunx vitest run src/components/__tests__/pdf.test.tsx -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `bunx vitest run src/core/distribution/ src/stores/__tests__/distributionStore.test.ts src/components/__tests__/distribution.test.tsx`
- **Per wave merge:** `bunx vitest run`
- **Phase gate:** Full suite green before /gsd:verify-work

### Wave 0 Gaps
- [ ] `src/core/distribution/__tests__/algorithm.test.ts` -- covers P11-01, P11-02, P11-03
- [ ] `src/stores/__tests__/distributionStore.test.ts` -- covers P11-06
- [ ] `src/components/__tests__/distribution.test.tsx` -- covers P11-04, P11-05, P11-07, P11-08 (extends existing division.test.tsx)
- [ ] PDF distribution tests added to existing `src/components/__tests__/pdf.test.tsx` -- covers P11-09

## Sources

### Primary (HIGH confidence)
- npm registry: @dnd-kit/core 6.3.1 (peer dep `react >=16.8.0`), @dnd-kit/sortable 10.0.0, @dnd-kit/react 0.3.2-beta
- Existing project code: divisionStore.ts, division.ts, types.ts, wizardStore.ts, App.tsx, ResultsPage.tsx
- @dnd-kit official docs (dndkit.com) -- installation, sensors, sortable preset

### Secondary (MEDIUM confidence)
- [Kanban board tutorial with dnd-kit](https://radzion.com/blog/kanban/) -- verified DndContext + DragOverlay + closestCorners pattern
- [dnd-kit kanban with tailwind + shadcn](https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui) -- verified multi-column pattern
- [Motion/React Reorder docs](https://motion.dev/docs/react-reorder) -- confirmed Reorder lacks cross-list support, validates dnd-kit choice

### Tertiary (LOW confidence)
- @dnd-kit/react beta status and timeline -- the beta may stabilize soon but no confirmed date

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - npm registry versions verified, peer dependencies confirmed compatible with React 19
- Architecture: HIGH - based on existing project patterns (divisionStore, GroupCard) and well-documented dnd-kit Kanban patterns
- Pitfalls: HIGH - based on known dnd-kit gotchas and existing project patterns (fingerprint staleness, mobile touch)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable ecosystem, 30 days)
