# Phase 15: Fix JSON Import & Persistence Gaps - Research

**Researched:** 2026-03-14
**Domain:** Zustand state management, JSON import/export, localStorage persistence
**Confidence:** HIGH

## Summary

Phase 15 is a gap-closure phase addressing three discrete bugs identified in the v1.0 milestone audit. All three bugs are in existing code with well-understood root causes -- no new libraries, no architectural changes, no new UI components needed.

**Gap 1 (P14-18, critical):** `useJsonImport.confirmImport` (line 62 of `src/hooks/useJsonImport.ts`) calls `useWizardStore.setState(pendingState)` but ignores `result.customHeirNames` and `result.individualDistribution` returned by `validateAndParseImport`. The hook's `pendingState` stores only the `WizardState` portion -- the individual distribution data is never captured or applied to `individualDistributionStore`.

**Gap 2 (PRST-02, minor):** `ScenariosPage.handleNewCalculation` (line 41 of `src/components/scenarios/ScenariosPage.tsx`) resets wizard state but omits `movableAssets: []` and `expandedAssetId: null`, allowing stale movable assets to survive a "New Calculation" action.

**Gap 3 (tech debt):** `individualDistributionStore`'s `partialize` config (line 325 of `src/stores/individualDistributionStore.ts`) excludes `splitOrigins` from the persist list, meaning the `Map<string, DistributionItem>` is lost on page reload and parcel merge operations fail silently.

**Primary recommendation:** Fix all three bugs with targeted edits to the three affected files, plus add unit tests for each fix. No new dependencies required.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| P14-18 | JSON import restores custom names and individual assignments (missing fields use defaults for backward compat) | Gap 1 analysis: `useJsonImport.ts` must capture full `ImportResult` (not just `result.state`), store both `customHeirNames` and `individualDistribution`, and apply them to `individualDistributionStore` in `confirmImport` |
| PRST-02 | User can compare multiple scenarios side by side ("What if" comparison) | Gap 2 analysis: `ScenariosPage.handleNewCalculation` must include `movableAssets: []` and `expandedAssetId: null` in reset to prevent stale data corruption when starting new scenarios |
</phase_requirements>

## Standard Stack

### Core (already installed -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.x | State management with persist middleware | Already used for wizardStore, scenariosStore, individualDistributionStore |
| vitest | 4.1.0 | Test framework | Already configured with jsdom environment |
| @testing-library/react | existing | Hook testing via renderHook | Already used in useJsonImport.test.ts |

### No New Dependencies
This phase requires zero new packages. All fixes are edits to existing files using existing APIs.

## Architecture Patterns

### Existing File Structure (all files already exist)
```
src/
  hooks/
    useJsonImport.ts           # Gap 1: fix confirmImport to apply individual data
    __tests__/
      useJsonImport.test.ts    # Add tests for individual data restoration
  components/
    scenarios/
      ScenariosPage.tsx        # Gap 2: fix handleNewCalculation reset
  stores/
    individualDistributionStore.ts  # Gap 3: add splitOrigins to partialize
  core/
    json/
      importData.ts            # No changes needed (already returns the data correctly)
      __tests__/
        importData.test.ts     # Already has comprehensive tests
```

### Pattern 1: Full ImportResult Capture
**What:** The `useJsonImport` hook must capture the full `ImportResult` (not just `result.state`) so `confirmImport` can access `customHeirNames` and `individualDistribution`.
**When to use:** When fixing Gap 1.
**Current code (broken):**
```typescript
// useJsonImport.ts line 54 -- only stores WizardState
setPendingState(result.state)
```
**Fix approach:**
```typescript
// Store full import result, not just state
const [pendingImport, setPendingImport] = useState<{
  state: WizardState
  customHeirNames?: Record<string, string>
  individualDistribution?: { assignments: ...; qurahUsed: boolean } | null
} | null>(null)

// In importFromFile:
setPendingImport({
  state: result.state,
  customHeirNames: result.customHeirNames,
  individualDistribution: result.individualDistribution,
})

// In confirmImport:
if (pendingImport.customHeirNames || pendingImport.individualDistribution) {
  useIndividualDistributionStore.setState({
    customNames: pendingImport.customHeirNames ?? {},
    // Apply individual distribution assignments...
  })
}
```

### Pattern 2: Complete State Reset
**What:** `handleNewCalculation` must reset ALL wizard state fields, including `movableAssets` and `expandedAssetId`.
**When to use:** When fixing Gap 2.
**Fix approach:**
```typescript
// Add the two missing fields to the reset object:
useWizardStore.setState({
  // ... existing fields ...
  movableAssets: [],         // ADD THIS
  expandedAssetId: null,     // ADD THIS
})
```

### Pattern 3: Map Serialization in Persist Partialize
**What:** `splitOrigins` is a `Map<string, DistributionItem>` which must be included in `partialize` for persistence, but Maps do not JSON-serialize natively.
**When to use:** When fixing Gap 3.
**Key consideration:** The store uses `fractionStorage` which has custom `replacer`/`reviver` for Fraction objects, but does NOT handle Map objects. Maps serialize to `{}` with standard `JSON.stringify`.
**Fix approach:** Two options:
1. Convert `splitOrigins` to a plain object `Record<string, DistributionItem>` in the store (simplest, avoids serialization complexity).
2. Add Map serialization support by converting to/from entries arrays in partialize/onRehydrate.

**Recommended:** Option 1 -- change `splitOrigins` from `Map` to `Record<string, DistributionItem>`. This eliminates the serialization problem entirely and simplifies all Map operations to plain object property access. The Map is only used for `.get()`, `.set()`, `.delete()`, and `new Map(existingMap)` operations, all of which map directly to object property operations.

### Anti-Patterns to Avoid
- **Partial state reset:** When resetting state, always reset ALL fields. Use a constant `INITIAL_STATE` object if possible to avoid missing fields in the future.
- **Ignoring return values:** The `validateAndParseImport` function returns a rich result object. All fields must be captured and applied.
- **Assuming Map serialization works:** JavaScript Maps serialize to `{}` with JSON.stringify. Never persist Maps without explicit serialization logic.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Map persistence | Custom Map serializer in fractionStorage | Change data structure to Record (plain object) | Maps add unnecessary serialization complexity; Record does the same job and serializes natively |
| State reset completeness | Manual field-by-field reset | Spread a constant initial state object | Prevents future "forgot to add new field to reset" bugs |

## Common Pitfalls

### Pitfall 1: Breaking pendingState API Contract
**What goes wrong:** The `useJsonImport` hook's `pendingState` is exposed in its return value and consumed by `ImportConfirmDialog`. Changing its type from `WizardState | null` to a richer object type will break the dialog.
**Why it happens:** The dialog renders a preview of the pending import data using `pendingState` fields.
**How to avoid:** Keep `pendingState` as `WizardState | null` for backward compatibility with the dialog. Store the extra individual data in a separate state variable (e.g., `pendingIndividualData`) that is internal to the hook and not exposed.
**Warning signs:** TypeScript errors in ImportConfirmDialog.

### Pitfall 2: Individual Distribution Restoration Requires Recomputation
**What goes wrong:** The imported `individualDistribution.assignments` contains `individualId` and `assignedItemIds`, but the store needs full `IndividualColumn` objects with computed fields like `targetValue`, `assignedValue`, `cashAdjustment`, `sharePerHeir`, etc.
**Why it happens:** The export format is intentionally minimal -- it stores assignments, not the full computed state.
**How to avoid:** After importing, call `initialize()` first to build the full individual distribution from scratch, then apply the imported custom names and assignments on top. Alternatively, only restore `customNames` and `qurahUsed` (the non-derivable data) and let the user re-initialize.
**Warning signs:** Incorrect equilibrium calculations, missing target values, NaN in cashAdjustment.

### Pitfall 3: Race Condition Between Import and Store Initialization
**What goes wrong:** `confirmImport` sets wizard state, resets distribution, and calculates shares. If individual distribution data is applied before the group distribution is computed, `initialize()` may fail because `distributionResult` is null.
**Why it happens:** Individual distribution depends on group distribution which depends on wizard state.
**How to avoid:** Sequence operations: (1) set wizard state, (2) calculate shares, (3) compute group distribution, (4) initialize individual distribution, (5) apply imported custom names over the initialized state.
**Warning signs:** Empty individual columns, console errors about null distributionResult.

### Pitfall 4: splitOrigins Map-to-Record Migration
**What goes wrong:** Existing persisted data in localStorage has `splitOrigins` as `{}` (because Map serialized to empty object). After changing to Record, the rehydrated state will be an empty object, which is actually correct default behavior.
**Why it happens:** Previously, the Map was excluded from partialize, so no stale data exists. Switching to Record and including it in partialize starts fresh.
**How to avoid:** No migration needed -- the field was never persisted before, so there's no stale data to migrate. The Record will start empty on first load.
**Warning signs:** None expected.

### Pitfall 5: individualDistributionStore Reset on Import
**What goes wrong:** If importing JSON that does NOT contain individual distribution data, the old individual distribution state could remain stale and inconsistent with the new wizard state.
**Why it happens:** `confirmImport` currently only resets `distributionStore` (group level), not `individualDistributionStore`.
**How to avoid:** Always call `individualDistributionStore.getState().reset()` during `confirmImport`, regardless of whether the import contains individual data. Then, if the import DOES contain individual data, apply it after reset.
**Warning signs:** Stale individual names appearing after importing a different scenario.

## Code Examples

### Fix 1: useJsonImport.ts - Capture and Apply Full ImportResult

```typescript
// src/hooks/useJsonImport.ts
import { useIndividualDistributionStore } from '@/stores/individualDistributionStore'

// Keep pendingState as WizardState for backward compat
const [pendingState, setPendingState] = useState<WizardState | null>(null)
// Store extra individual data separately (internal, not exposed)
const [pendingIndividualData, setPendingIndividualData] = useState<{
  customHeirNames?: Record<string, string>
  individualDistribution?: {
    assignments: { individualId: string; assignedItemIds: string[] }[]
    qurahUsed: boolean
  } | null
} | null>(null)

// In importFromFile reader.onload:
setPendingState(result.state)
setPendingIndividualData({
  customHeirNames: result.customHeirNames,
  individualDistribution: result.individualDistribution,
})

// In confirmImport:
const confirmImport = useCallback(() => {
  if (!pendingState) return

  useWizardStore.setState(pendingState)
  useDistributionStore.getState().resetDistribution()
  useIndividualDistributionStore.getState().reset()
  useWizardStore.getState().calculateShares()

  // Apply individual data if present
  if (pendingIndividualData?.customHeirNames) {
    useIndividualDistributionStore.setState({
      customNames: pendingIndividualData.customHeirNames,
    })
  }
  if (pendingIndividualData?.individualDistribution) {
    useIndividualDistributionStore.setState({
      qurahUsed: pendingIndividualData.individualDistribution.qurahUsed,
      hasBeenUsed: true,
    })
  }

  setPendingState(null)
  setPendingIndividualData(null)
  setToast({ message: 'Data imported successfully', type: 'success' })
}, [pendingState, pendingIndividualData])
```

### Fix 2: ScenariosPage.tsx - Complete Reset

```typescript
// src/components/scenarios/ScenariosPage.tsx line 41
const handleNewCalculation = () => {
  useWizardStore.setState({
    currentStep: 1,
    completedSteps: [],
    relationship: null,
    deceasedGender: null,
    userGender: null,
    mfloEnabled: false,
    motherAlive: null,
    autoIncludes: [],
    wifeCount: 0,
    husbandPresent: false,
    sonCount: 0,
    daughterCount: 0,
    siblingTypeExpanded: false,
    brotherFullCount: 0,
    brotherConsanguineCount: 0,
    brotherUterineCount: 0,
    sisterFullCount: 0,
    sisterConsanguineCount: 0,
    sisterUterineCount: 0,
    properties: [],
    expandedPropertyId: null,
    movableAssets: [],          // FIX: was missing
    expandedAssetId: null,      // FIX: was missing
    results: null,
    totalEstateValue: 0,
    viewMode: 'simple',
  })
  onNavigate('wizard')
}
```

### Fix 3: individualDistributionStore.ts - splitOrigins Persistence

```typescript
// Change splitOrigins from Map to Record
// In state interface:
splitOrigins: Record<string, DistributionItem>  // was Map<string, DistributionItem>

// In initial state:
splitOrigins: {},  // was new Map()

// In splitItem action:
const newSplitOrigins = { ...splitOrigins, [itemId]: originalItem }
// was: const newSplitOrigins = new Map(splitOrigins); newSplitOrigins.set(itemId, originalItem)

// In mergeItem action:
const originalItem = splitOrigins[parentId]
// was: const originalItem = splitOrigins.get(parentId)
const { [parentId]: _, ...newSplitOrigins } = splitOrigins
// was: newSplitOrigins.delete(parentId)

// In reset action:
splitOrigins: {},  // was new Map()

// In partialize -- ADD splitOrigins:
partialize: (state) => ({
  // ... existing fields ...
  splitOrigins: state.splitOrigins,  // ADD THIS
}),
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Map for key-value in Zustand persist | Record/plain object | Always | Maps don't serialize; Records do |
| Partial state reset | Full initial state spread | Best practice | Prevents field omission bugs |

## Open Questions

1. **Should individual distribution assignments be fully restored or just custom names?**
   - What we know: The export includes full `assignments` (individualId -> assignedItemIds) plus `qurahUsed`. The import parses both. However, item IDs are regenerated during import (property and asset IDs get new UUIDs), which means the `assignedItemIds` in the imported data will NOT match the regenerated IDs.
   - What's unclear: Whether assignment restoration is possible given ID regeneration, or if only `customNames` and `qurahUsed` should be restored.
   - Recommendation: Restore `customNames` and `qurahUsed` reliably. Log a warning if assignments can't be mapped. The user can re-run individual distribution to re-assign items. This is the pragmatic approach given ID regeneration makes exact assignment restoration impossible without a mapping table.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 |
| Config file | vite.config.ts (test section) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| P14-18 | JSON import restores customHeirNames to individualDistributionStore | unit | `npx vitest run src/hooks/__tests__/useJsonImport.test.ts -x` | Exists (needs new test cases) |
| P14-18 | JSON import restores qurahUsed flag | unit | `npx vitest run src/hooks/__tests__/useJsonImport.test.ts -x` | Exists (needs new test cases) |
| P14-18 | JSON import resets individual distribution store when no individual data present | unit | `npx vitest run src/hooks/__tests__/useJsonImport.test.ts -x` | Exists (needs new test cases) |
| PRST-02 | New Calculation resets movableAssets to empty array | unit | `npx vitest run src/components/scenarios/__tests__/ScenariosPage.test.ts -x` | Needs creation |
| PRST-02 | New Calculation resets expandedAssetId to null | unit | `npx vitest run src/components/scenarios/__tests__/ScenariosPage.test.ts -x` | Needs creation |
| TECH-01 | splitOrigins survives page reload (persist partialize includes it) | unit | `npx vitest run src/stores/__tests__/individualDistributionStore.test.ts -x` | Needs creation |
| TECH-01 | splitOrigins Record operations (set/get/delete) work correctly | unit | `npx vitest run src/stores/__tests__/individualDistributionStore.test.ts -x` | Needs creation |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/hooks/__tests__/useJsonImport.test.ts` -- add P14-18 test cases for individual data restoration
- [ ] `src/stores/__tests__/individualDistributionStore.test.ts` -- add splitOrigins persistence tests (or inline in existing test file if one exists)
- [ ] No new framework setup needed -- vitest already configured

## Sources

### Primary (HIGH confidence)
- Direct source code analysis of `src/hooks/useJsonImport.ts` (84 lines)
- Direct source code analysis of `src/core/json/importData.ts` (450 lines)
- Direct source code analysis of `src/stores/individualDistributionStore.ts` (336 lines)
- Direct source code analysis of `src/components/scenarios/ScenariosPage.tsx` (262 lines)
- Direct source code analysis of `src/stores/wizardStore.ts` (519 lines)
- Direct source code analysis of `src/core/json/exportData.ts` (133 lines)
- v1.0 Milestone Audit report (`.planning/v1.0-MILESTONE-AUDIT.md`)

### Secondary (MEDIUM confidence)
- Zustand persist middleware Map serialization behavior (training data -- verified by code inspection showing fractionStorage does not handle Maps)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, all existing code
- Architecture: HIGH - all three fixes are well-understood single-file edits with clear root causes
- Pitfalls: HIGH - thoroughly analyzed data flow and identified race conditions, ID regeneration issue, and serialization constraints

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable -- no external dependencies involved)
