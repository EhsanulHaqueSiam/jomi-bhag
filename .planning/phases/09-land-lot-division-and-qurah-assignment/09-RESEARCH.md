# Phase 9: Land Lot Division and Qurah Assignment - Research

**Researched:** 2026-03-13
**Domain:** Fair division algorithm, Qurah (Islamic lot drawing) UI, Zustand state extension, PDF section addition
**Confidence:** HIGH

## Summary

Phase 9 builds a land division feature that groups existing properties (from Step 4) into heir-type groups matching Faraid shares, then assigns groups via Qurah (Islamic lot drawing) or manual reassignment. The feature lives on the Results page as a post-calculation flow ("Divide Land" button), not as a wizard step.

The core technical challenge is the greedy best-fit grouping algorithm: sort properties by value descending, assign each to the group most under-target. Because parcels are whole (not split), cash compensation bridges the gap between group value and target share value. The UX challenge is the Qurah ceremony -- a gold-accented, sacred-feeling UI with bismillah header, shuffle animation, and staggered group reveal using `motion/react` (Framer Motion).

**Primary recommendation:** Implement the division algorithm as a pure function in `src/core/land/division.ts`, store division state in a new `divisionStore` (Zustand), build the UI as `src/components/division/` components accessible from ResultsPage, and extend PdfDocument with a `PdfLotDivisionSection`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Parcels ARE the properties from Step 4 -- auto-populated, no re-entry needed. Names, areas, and values already exist
- Read-only in division view -- to change parcel details, user goes back to Step 4
- "Divide Land" button appears on Results page only when properties exist (hidden otherwise)
- Division flow is a post-results feature, not a wizard step -- user calculates shares first, then optionally divides land
- Greedy best-fit by value: sort parcels by value (largest first), assign each to the group most under-filled relative to its Faraid share
- One group per heir TYPE (Sons, Daughters, Wife, etc.) -- not per individual heir. Within a group, parcels are shared equally among members
- Value-based only -- no qualitative factors (location, fertility). Real-world factors are reflected in the property's estimated value
- Best-fit grouping + cash compensation: assign whole parcels, show difference as cash adjustment (e.g., "Sons group owes Daughters group BDT 30,000 cash"). Islamic jurisprudence allows cash compensation for land division imbalances
- Islamic ceremony feel: gold-accented UI, bismillah header, animated draw sequence. Respectful and deliberate -- not gamified
- All-at-once with staggered reveal: click "Draw Lots (Qurah)" -> all groups animate simultaneously (shuffle effect) -> results appear one by one with staggered delay
- Unlimited re-draws -- families can keep drawing until everyone is comfortable
- Brief Quranic/Hadith reference in a gold-accented box explaining the Qurah practice (consistent with Phase 3 reference display pattern)
- Card per heir group: one card per heir type listing assigned parcels with names and values, group total vs target share, and cash adjustment if any. Consistent with Phase 3 heir card pattern
- Cash compensation summary banner at top: colored banner above group cards stating who owes whom (e.g., "Sons group received BDT 50,000 more in land value -- owes Daughters group BDT 50,000 cash")
- Simple "Move to..." buttons on each parcel for manual reassignment between groups. Group totals update instantly. Phase 11 adds drag-and-drop on top
- Lot division results included in PDF export as a new "Land Division" section (group assignments, parcel lists, cash adjustments)

### Claude's Discretion
- Exact greedy algorithm implementation details
- Shuffle animation timing and easing
- Gold-accented Qurah UI styling details
- Cash compensation banner color and styling
- "Move to..." dropdown vs button implementation
- PDF section layout for land division
- Mobile responsive behavior for group cards

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

Phase 9 does not have formal requirement IDs in REQUIREMENTS.md (all v1 requirements are already complete through Phase 8). This phase implements post-v1 functionality described in the roadmap. The success criteria from the phase description serve as the requirements:

| ID | Description | Research Support |
|----|-------------|-----------------|
| P9-SC1 | Parcels auto-populated from Step 4 properties with name, area, market price | Property type already has all needed fields; computePropertyTotal() calculates values |
| P9-SC2 | App divides land parcels into groups matching each heir's Faraid share as closely as possible | Greedy best-fit decreasing algorithm; ShareResult.totalShare provides target fractions |
| P9-SC3 | User can randomly assign groups to heirs (Qurah) or manually assign each group | Shuffle + staggered reveal animation; "Move to..." manual reassignment buttons |
| P9-SC4 | Division and assignment strictly follow Islamic rules for fair property division | Cash compensation for imbalances; Qurah reference from Hadith (Bukhari/Muslim) |
</phase_requirements>

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.4 | UI framework | Already used throughout project |
| TypeScript | ~5.9.3 | Type safety | Already used throughout project |
| Zustand | ^5.0.11 | State management | Established pattern -- wizardStore, scenariosStore |
| motion/react | ^12.36.0 | Animations | Framer Motion -- used in WizardShell, HeirCard, QuranReference |
| TailwindCSS | ^4.2.1 | Styling | Utility-first CSS, gold palette already configured |
| @react-pdf/renderer | ^4.3.2 | PDF generation | PdfDocument already structured with composable sections |
| fraction.js | ^5.3.4 | Exact fractions | ShareResult.totalShare is a Fraction for precise share math |

### Supporting (no new dependencies needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Intl.NumberFormat | built-in | BDT formatting | Cash compensation display (en-IN, BDT, narrowSymbol) |

**No new packages required.** Everything needed is already in the project.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── core/land/
│   └── division.ts          # Pure division algorithm (no React, no Zustand)
├── stores/
│   └── divisionStore.ts     # Zustand store for division + Qurah state
├── components/division/
│   ├── LotDivisionPage.tsx  # Main container (accessible from ResultsPage)
│   ├── QurahCeremony.tsx    # Bismillah header + shuffle animation + draw button
│   ├── GroupCard.tsx         # Per-heir-type card with parcels and cash adjustment
│   ├── CompensationBanner.tsx # Cash compensation summary banner
│   ├── QurahReference.tsx   # Gold-accented Islamic reference box
│   └── ParcelRow.tsx        # Single parcel with "Move to..." control
├── components/pdf/
│   └── PdfLotDivisionSection.tsx # PDF section for division results
└── components/results/
    └── ResultsPage.tsx       # Add "Divide Land" button
```

### Pattern 1: Pure Division Algorithm
**What:** The grouping algorithm is a pure function with no side effects -- takes properties and shares, returns group assignments.
**When to use:** Always for the core logic. Separation enables easy unit testing.
**Example:**
```typescript
// src/core/land/division.ts
import type { Property } from '@/core/land/types'
import { computePropertyTotal } from '@/core/land/types'
import type { ShareResult, HeirType } from '@/core/faraid/types'

export interface ParcelAssignment {
  propertyId: string
  groupHeirType: HeirType
}

export interface DivisionGroup {
  heirType: HeirType
  label: string
  count: number              // number of individual heirs in this group
  targetValue: number        // Faraid share * total estate
  assignedProperties: string[] // property IDs
  assignedValue: number      // sum of assigned property values
  cashAdjustment: number     // positive = owes others, negative = owed by others
}

export interface DivisionResult {
  groups: DivisionGroup[]
  totalEstateValue: number
  compensations: CashCompensation[]
}

export interface CashCompensation {
  fromGroup: HeirType
  toGroup: HeirType
  amount: number
}

/**
 * Greedy best-fit decreasing: sort properties by value (largest first),
 * assign each to the group most under-filled relative to its target.
 */
export function divideParcels(
  properties: Property[],
  shares: ShareResult[],
  totalEstateValue: number,
): DivisionResult {
  // 1. Create groups from active (non-blocked) shares
  // 2. Sort properties by value descending
  // 3. For each property, find group with largest (targetValue - assignedValue)
  // 4. Assign property to that group
  // 5. Calculate cash compensations from group imbalances
}
```

### Pattern 2: Separate Zustand Store for Division State
**What:** Division state (group assignments, Qurah draw state, manual overrides) lives in a dedicated store, not in wizardStore.
**When to use:** Always. wizardStore is already large (389 lines). Division state is conceptually separate and has different persistence needs.
**Example:**
```typescript
// src/stores/divisionStore.ts
import { create } from 'zustand'
import type { DivisionResult } from '@/core/land/division'
import type { HeirType } from '@/core/faraid/types'

interface DivisionState {
  divisionResult: DivisionResult | null
  qurahAssignment: Map<HeirType, HeirType> | null  // maps group -> assigned heir type
  qurahRevealed: boolean
  revealedGroups: HeirType[]  // for staggered reveal
}

interface DivisionActions {
  computeDivision: () => void
  performQurah: () => void        // randomize assignment
  revealNextGroup: () => void     // staggered reveal
  moveParcel: (propertyId: string, fromGroup: HeirType, toGroup: HeirType) => void
  resetDivision: () => void
}
```

### Pattern 3: Qurah as Group Shuffle (Not Parcel Shuffle)
**What:** Qurah randomizes which heir type gets which pre-computed group -- it does NOT re-divide the parcels. The groups stay the same; only the assignment of "Group A goes to Sons" vs "Group A goes to Daughters" changes.
**When to use:** This matches the Islamic practice of lot drawing, where divisions are made fairly first, then lots are drawn to assign divisions to people.
**How it works:**
1. Algorithm creates N groups optimized for fair value distribution
2. Each group has a target share (e.g., 1/2, 1/4, 1/6)
3. Qurah shuffles which heir type gets assigned to which group
4. Groups with matching share fractions are interchangeable (e.g., two groups both targeting 1/6)
5. Cash compensation recalculates based on new assignment

### Pattern 4: Staggered Reveal with motion/react
**What:** After Qurah draw, groups reveal one by one using AnimatePresence and staggered delays.
**When to use:** For the Qurah reveal animation.
**Example:**
```typescript
// Parent container with staggered children
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.4,  // 400ms between each child
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

// In JSX:
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {revealedGroups.map((group) => (
    <motion.div key={group.heirType} variants={cardVariants}>
      <GroupCard group={group} />
    </motion.div>
  ))}
</motion.div>
```

### Pattern 5: Consistent Card Pattern (from HeirCard)
**What:** GroupCard follows the same visual structure as HeirCard -- rounded-xl border, shadow-sm, icon + header + content layout.
**When to use:** For all group display cards. Reuse the styling patterns, not the component itself (different data shape).

### Anti-Patterns to Avoid
- **Putting division state in wizardStore:** wizardStore is already large and handles wizard flow. Division is a post-results feature with separate lifecycle.
- **Splitting parcels:** User decision says "whole parcels" with cash compensation. Never split a single property across groups.
- **Re-dividing on Qurah:** Qurah shuffles group-to-heir-type assignment, not the parcels within groups. This is the Islamic practice.
- **Making Qurah feel gamified:** No spinning wheels, slot machines, or casino aesthetics. Respectful gold-accented ceremony feel.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| BDT formatting | Custom number formatter | `Intl.NumberFormat('en-IN', { currency: 'BDT' })` | Already used throughout (HeirCard, PdfPropertySection); handles lakh/crore grouping correctly |
| Property value calculation | Manual sum of sub-values | `computePropertyTotal(property)` | Already exists in src/core/land/types.ts; handles house, trees, pond sub-components |
| Fraction-to-number conversion | Manual fraction parsing | `share.totalShare.valueOf()` | fraction.js already in stack; .valueOf() gives float for multiplication |
| Animation orchestration | setTimeout chains | motion/react variants + staggerChildren | Already used in project; handles cleanup, interruption, and accessibility automatically |
| Random shuffle | Custom Fisher-Yates | `array.sort(() => Math.random() - 0.5)` | Good enough for small arrays (max 17 heir types). For true fairness, Fisher-Yates is trivial but overkill for N < 20 |

**Key insight:** This phase has zero new dependencies. Every building block (state management, animations, formatting, PDF rendering) is already in the project. The work is composition and algorithm, not infrastructure.

## Common Pitfalls

### Pitfall 1: Floating Point Rounding in Cash Compensation
**What goes wrong:** Fraction share * total estate value produces floating point results. Multiple groups' compensations don't sum to zero.
**Why it happens:** JavaScript floating point arithmetic is imprecise. `1/3 * 300000 + 1/3 * 300000 + 1/3 * 300000 !== 300000`.
**How to avoid:** Use `Math.round()` for all BDT amounts (already the project pattern -- see HeirCard line 109). Calculate compensation as `assignedValue - targetValue` per group, then round. Accept that rounding means compensations may be off by 1 BDT -- this is acceptable for practical use.
**Warning signs:** Cash compensations don't balance to zero. Test with edge cases (3 groups dividing odd totals).

### Pitfall 2: Empty Groups When Fewer Properties Than Heir Types
**What goes wrong:** If there are 2 properties but 5 heir types, some groups get zero properties.
**Why it happens:** Greedy best-fit assigns whole parcels. With more groups than parcels, some groups must be empty.
**How to avoid:** This is expected behavior. Empty groups get zero assigned value and full cash compensation owed to them. Display should show "No land parcels assigned -- full cash compensation: BDT X" rather than hiding the group.
**Warning signs:** UI shows blank cards with no explanation.

### Pitfall 3: Qurah Shuffle Ignoring Share Fraction Constraints
**What goes wrong:** If "Sons" share is 1/2 and "Wife" share is 1/8, Qurah naively shuffles all groups, potentially assigning the 1/8-target group to Sons (who need 1/2).
**Why it happens:** Random shuffle without constraint matching.
**How to avoid:** Groups are created with specific target values. Qurah should only shuffle groups with MATCHING target fractions (e.g., if two groups both have 1/6, they can swap). Groups with unique fractions are fixed to their heir type and not shuffled. Alternatively (simpler): skip Qurah entirely when all groups have unique fractions, and only shuffle when there are groups with identical shares.
**Warning signs:** After Qurah, a group assigned to an heir type has a wildly different target than expected.

### Pitfall 4: Division Store Not Syncing with Property Changes
**What goes wrong:** User divides land, goes back to Step 4, edits a property, returns to division -- stale assignments.
**Why it happens:** Division store caches results but doesn't watch for property changes.
**How to avoid:** Division store should invalidate (reset) whenever properties change. Simple approach: store a fingerprint (JSON hash of property IDs + values) and check on mount.
**Warning signs:** Group totals don't match actual property values after editing.

### Pitfall 5: PDF Data Extraction Missing Division State
**What goes wrong:** PDF doesn't include land division section because extractPdfData doesn't know about divisionStore.
**Why it happens:** extractPdfData is a pure function that takes explicit parameters. It needs to be extended.
**How to avoid:** Add optional divisionResult parameter to extractPdfData. PdfData type gets optional `lotDivision` field. PdfDocument conditionally renders PdfLotDivisionSection.
**Warning signs:** PDF export silently drops division data.

## Code Examples

### Greedy Best-Fit Decreasing Algorithm
```typescript
// Source: Algorithm design -- standard bin-packing variant adapted for fair division
function greedyBestFit(
  properties: Property[],
  groups: DivisionGroup[],
): DivisionGroup[] {
  // Sort properties by value, largest first (decreasing order)
  const sorted = [...properties].sort(
    (a, b) => computePropertyTotal(b) - computePropertyTotal(a),
  )

  // Deep copy groups to avoid mutation
  const result = groups.map((g) => ({ ...g, assignedProperties: [...g.assignedProperties] }))

  for (const property of sorted) {
    const value = computePropertyTotal(property)

    // Find the group with the largest remaining capacity (targetValue - assignedValue)
    let bestIdx = 0
    let bestGap = -Infinity
    for (let i = 0; i < result.length; i++) {
      const gap = result[i].targetValue - result[i].assignedValue
      if (gap > bestGap) {
        bestGap = gap
        bestIdx = i
      }
    }

    result[bestIdx].assignedProperties.push(property.id)
    result[bestIdx].assignedValue += value
  }

  // Calculate cash adjustments
  for (const group of result) {
    group.cashAdjustment = Math.round(group.assignedValue - group.targetValue)
  }

  return result
}
```

### Cash Compensation Calculation
```typescript
// Source: Project pattern -- Math.round for BDT amounts
function calculateCompensations(groups: DivisionGroup[]): CashCompensation[] {
  const compensations: CashCompensation[] = []
  const overfilled = groups.filter((g) => g.cashAdjustment > 0)
  const underfilled = groups.filter((g) => g.cashAdjustment < 0)

  // Match overfilled to underfilled
  for (const over of overfilled) {
    for (const under of underfilled) {
      if (over.cashAdjustment <= 0) break
      const amount = Math.min(over.cashAdjustment, Math.abs(under.cashAdjustment))
      if (amount > 0) {
        compensations.push({
          fromGroup: over.heirType,
          toGroup: under.heirType,
          amount,
        })
        over.cashAdjustment -= amount
        under.cashAdjustment += amount
      }
    }
  }

  return compensations
}
```

### Qurah Shuffle (Constrained by Matching Fractions)
```typescript
// Source: Islamic Qurah practice -- shuffle only interchangeable groups
function qurahShuffle(groups: DivisionGroup[]): Map<number, HeirType> {
  // Group indices by target value (groups with same target are interchangeable)
  const byTarget = new Map<number, number[]>()
  for (let i = 0; i < groups.length; i++) {
    const key = groups[i].targetValue
    const arr = byTarget.get(key) ?? []
    arr.push(i)
    byTarget.set(key, arr)
  }

  // For each set of same-target groups, shuffle the heir type assignments
  const assignment = new Map<number, HeirType>()
  for (const indices of byTarget.values()) {
    const heirTypes = indices.map((i) => groups[i].heirType)
    // Fisher-Yates shuffle
    for (let i = heirTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[heirTypes[i], heirTypes[j]] = [heirTypes[j], heirTypes[i]]
    }
    indices.forEach((idx, i) => assignment.set(idx, heirTypes[i]))
  }

  return assignment
}
```

### Gold-Accented Qurah UI (Bismillah Header)
```typescript
// Source: Project gold palette (oklch) from index.css + Phase 3 SpecialCaseCallout pattern
function QurahHeader() {
  return (
    <div className="rounded-xl border border-gold-200 bg-gold-50 p-6 text-center">
      <p
        dir="rtl"
        lang="ar"
        className="font-arabic text-2xl leading-loose text-gold-600"
      >
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
      </p>
      <p className="mt-2 text-sm font-medium text-gold-500">
        In the name of Allah, the Most Gracious, the Most Merciful
      </p>
    </div>
  )
}
```

### BDT Formatter (Reuse Existing Pattern)
```typescript
// Source: HeirCard.tsx lines 17-23 -- already established
const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
// Usage: bdtFormatter.format(50000) => "৳50,000"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion/react` import | motion v12 | Project already uses `motion/react` -- all imports use this path |
| Zustand v4 `create` | Zustand v5 `create` | Zustand 5.0 | Project already on v5 -- no migration needed |
| Custom persist middleware | `zustand/middleware` persist | Zustand 5.0 | wizardStore already uses persist with custom fractionStorage |

**Deprecated/outdated:**
- `framer-motion` package name: Now `motion` with `motion/react` imports. Project already uses the new name.

## Open Questions

1. **Should division state persist to localStorage?**
   - What we know: wizardStore persists (for scenario save/restore). Division is derived from properties + shares.
   - What's unclear: Should Qurah results survive page refresh? Manual parcel moves?
   - Recommendation: Do NOT persist division state. It's derivable from properties + shares. Qurah can be re-run. Manual moves are ephemeral until the user exports to PDF. This avoids sync complexity with wizardStore changes.

2. **Qurah when all groups have unique share fractions**
   - What we know: If each heir type has a unique share fraction, shuffling is meaningless (each group can only go to one heir type).
   - What's unclear: Should we still show the Qurah ceremony for visual effect?
   - Recommendation: Show Qurah regardless but with a note when no meaningful shuffle is possible ("All groups have unique share fractions -- assignment is fixed"). The ceremony itself has spiritual significance beyond randomization.

3. **PDF section placement**
   - What we know: PdfDocument currently has 7 sections (Header, HeirTable, Charts, PropertyBreakdown, Steps, References, Disclaimer).
   - What's unclear: Where does "Land Division" go?
   - Recommendation: After PropertyBreakdown (section 4), before Steps. It's a natural extension of property information. Use `break` prop for page hints.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | vite.config.ts (test section) |
| Quick run command | `npx vitest run src/core/land/__tests__/division.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| P9-SC1 | Properties auto-populated into division groups | unit | `npx vitest run src/core/land/__tests__/division.test.ts -t "creates groups from shares"` | Wave 0 |
| P9-SC2 | Greedy best-fit assigns parcels to groups | unit | `npx vitest run src/core/land/__tests__/division.test.ts -t "greedy best-fit"` | Wave 0 |
| P9-SC2 | Cash compensation calculated correctly | unit | `npx vitest run src/core/land/__tests__/division.test.ts -t "cash compensation"` | Wave 0 |
| P9-SC3 | Qurah shuffle respects fraction constraints | unit | `npx vitest run src/core/land/__tests__/division.test.ts -t "qurah shuffle"` | Wave 0 |
| P9-SC3 | Manual parcel move updates groups | unit | `npx vitest run src/core/land/__tests__/division.test.ts -t "move parcel"` | Wave 0 |
| P9-SC3 | LotDivisionPage renders with Qurah and group cards | component | `npx vitest run src/components/__tests__/division.test.tsx` | Wave 0 |
| P9-SC4 | Compensation banner shows correct who-owes-whom | component | `npx vitest run src/components/__tests__/division.test.tsx -t "compensation banner"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/core/land/__tests__/division.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/core/land/__tests__/division.test.ts` -- covers P9-SC1, P9-SC2, P9-SC3 (algorithm), P9-SC4
- [ ] `src/components/__tests__/division.test.tsx` -- covers P9-SC3 (UI), P9-SC4 (banner)
- No framework install needed -- Vitest already configured
- No shared fixtures needed beyond existing test-setup.ts

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/core/land/types.ts` (Property type, computePropertyTotal)
- Project codebase: `src/core/faraid/types.ts` (ShareResult, HeirType, FaraidOutput)
- Project codebase: `src/stores/wizardStore.ts` (store pattern, persist configuration)
- Project codebase: `src/components/results/HeirCard.tsx` (card pattern, BDT formatting)
- Project codebase: `src/components/results/SpecialCaseCallout.tsx` (gold-accented callout pattern)
- Project codebase: `src/components/results/QuranReference.tsx` (Islamic reference UI pattern)
- Project codebase: `src/components/pdf/PdfDocument.tsx` (PDF section composition)
- Project codebase: `src/components/pdf/pdfTypes.ts` (PdfData interface for extension)
- Project codebase: `src/index.css` (gold-50 through gold-600 oklch palette)
- CONTEXT.md: All locked decisions from user discussion

### Secondary (MEDIUM confidence)
- [Framer Motion stagger docs](https://motion.dev/motion/stagger/) -- staggerChildren + variants API for reveal animation
- [Wikipedia: Best-fit bin packing](https://en.wikipedia.org/wiki/Best-fit_bin_packing) -- algorithm correctness reference
- [IslamQA: Casting lots among wives](https://islamqa.info/en/answers/235828/) -- Hadith reference for Qurah practice (Bukhari/Muslim)
- [Al-Islam.org: Chapter 13 Casting Lots](https://al-islam.org/thirty-principles-islamic-jurisprudence-sayyid-fadhil-milani/chapter-13-casting-lots) -- Islamic jurisprudence of Qur'ah

### Tertiary (LOW confidence)
- [QuranGallery: Drawing lots distinction](https://qurangallery.app/topics/drawing-lots-islam-istiqsam-divination-qurah-forbidden) -- Qurah vs Istiqsam distinction (needs scholar validation for exact text)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all libraries already in project and verified from codebase
- Architecture: HIGH -- follows established project patterns (separate store, component-per-file, pure algorithm functions)
- Algorithm: HIGH -- greedy best-fit decreasing is well-studied; implementation is straightforward for small N
- Pitfalls: HIGH -- identified from codebase analysis (floating point, empty groups, stale state)
- Qurah Islamic practice: MEDIUM -- Hadith references verified from multiple sources but exact Arabic text for display should be confirmed

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable -- no fast-moving dependencies)
