# Phase 8: Persistence and Scenarios - Research

**Researched:** 2026-03-13
**Domain:** Browser state persistence (localStorage), scenario management, Zustand persist middleware
**Confidence:** HIGH

## Summary

Phase 8 adds localStorage persistence for the wizard store (auto-save), a scenario management system (save/load/duplicate/delete), and a side-by-side comparison view for two scenarios. The app currently uses Zustand v5.0.11 with a single `useWizardStore` -- no persist middleware, no router, and no page-level navigation beyond the wizard steps.

The core technical challenge is twofold: (1) adding Zustand's `persist` middleware to auto-save the current wizard state while handling non-serializable `Fraction` objects in `FaraidOutput`, and (2) building a separate scenario storage system that manages multiple named snapshots in localStorage alongside the auto-saved current state.

**Primary recommendation:** Use Zustand `persist` middleware with custom `replacer`/`reviver` for Fraction serialization on the wizard store (auto-save slot), and a separate Zustand store (`useScenariosStore`) with its own persist for the named scenarios list. Add a simple "page" state to App.tsx for wizard vs. scenarios view switching -- no router needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Auto-save always: current wizard state saved continuously to localStorage as user fills inputs (like Google Docs -- never lose work)
- Full state stored: all wizard inputs (heirs, properties, estate value, view mode) + computed results. User loads and sees everything exactly as they left it
- Loading a saved scenario replaces current state with a warning: "You have unsaved changes. Save current scenario before loading?"
- Duplicate button per scenario: creates a copy with "(Copy)" suffix for "what if" exploration
- Auto-generated name from heir summary + editable: e.g. "3 Brothers, 2 Sisters -- Mar 13", user can rename to something meaningful like "Boro Bhai's family"
- Maximum 20 saved scenarios -- shows warning when approaching limit
- Compact card preview in list: name, date, heir count summary (e.g. "2 sons, 1 daughter, 1 wife"), and total estate value. Helps identify without loading
- Delete with confirmation dialog. "Clear all" option with stronger warning
- Compare exactly 2 scenarios at a time -- two-column layout on desktop, stacked on mobile
- Show heir shares (fraction, percentage, BDT) + estate totals + adjustments (Awl/Radd) in each column. Not full results mirror
- Subtle highlight on differences: values that differ get a light background tint (pale amber). No highlight on matching values
- Selection via checkboxes in scenario list -- check exactly 2, then click "Compare"
- Dedicated "My Scenarios" page accessible from top nav bar (mobile: bottom nav icon)
- Comparison view appears inline on the same page (below or replacing the list) -- no separate route
- "+ New Calculation" button at top of scenarios page -- resets wizard to step 1 with empty state

### Claude's Discretion
- Zustand persist middleware configuration details
- Scenario card layout and spacing
- Comparison table exact styling
- Empty state design for "no saved scenarios"
- localStorage key naming and versioning strategy
- Mobile stacking behavior for comparison view

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PRST-01 | App saves calculations to browser localStorage without requiring login | Zustand persist middleware with custom Fraction serializer on wizardStore; auto-save on every state change |
| PRST-02 | User can compare multiple scenarios side by side ("What if" comparison) | Separate scenariosStore with comparison state; two-column layout with diff highlighting |
| PRST-03 | User can load and modify previously saved calculations | Load replaces wizardStore state via setState; unsaved-changes detection via dirty tracking |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.11 | State management + persist middleware | Already installed; persist middleware is built-in |
| zustand/middleware | (bundled) | `persist` + `createJSONStorage` | Official middleware, no extra dependency |
| fraction.js | ^5.3.4 | Fraction reconstruction from serialized strings | Already installed; `new Fraction("1/3")` reconstructs from `toFraction()` output |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion/react | ^12.36.0 | Page transitions, card animations | Already installed; use for wizard/scenarios page switch animation |
| react (useState) | ^19.2.4 | Page-level view state in App.tsx | No router needed; simple conditional rendering |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useState page switching | react-router-dom | Router adds ~15KB, URL-based routing, but overkill for 2 views with no deep linking needs. The app deploys as a static site on Netlify and currently has zero routing. |
| Separate scenarios store | Single merged store | Single store would bloat the wizard store with scenario management concerns. Two stores keeps responsibilities clean and localStorage keys separate. |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  stores/
    wizardStore.ts          # MODIFY: add persist middleware with Fraction serializer
    scenariosStore.ts       # NEW: scenario CRUD + comparison state
  types/
    scenario.ts             # NEW: Scenario, ScenarioSummary types
  components/
    scenarios/
      ScenariosPage.tsx     # NEW: main scenarios list page
      ScenarioCard.tsx      # NEW: compact card with name, date, heir summary
      ComparisonView.tsx    # NEW: side-by-side comparison table
      EmptyState.tsx        # NEW: empty state when no scenarios saved
    layout/
      AppLayout.tsx         # MODIFY: add nav bar with Scenarios link
  App.tsx                   # MODIFY: add page-level view switching
```

### Pattern 1: Zustand Persist with Custom Fraction Serializer
**What:** The `FaraidOutput` type contains `Fraction` objects (from fraction.js) which are not JSON-serializable. Use `createJSONStorage` with custom `replacer`/`reviver` to convert Fraction instances to/from string representations.
**When to use:** Any Zustand store that persists state containing Fraction objects.
**Example:**
```typescript
// Source: Zustand persist docs + fraction.js constructor docs
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Fraction from 'fraction.js'

const FRACTION_TAG = '__fraction__'

const storage = createJSONStorage(() => localStorage, {
  replacer: (_key: string, value: unknown) => {
    if (value instanceof Fraction) {
      return { [FRACTION_TAG]: value.toFraction() }
    }
    return value
  },
  reviver: (_key: string, value: unknown) => {
    if (value && typeof value === 'object' && FRACTION_TAG in value) {
      return new Fraction((value as Record<string, string>)[FRACTION_TAG])
    }
    return value
  },
})

const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      // ... existing store definition unchanged
    }),
    {
      name: 'jomi-bhag-wizard',
      storage,
      version: 1,
    }
  )
)
```

### Pattern 2: Two-Store Architecture (Wizard + Scenarios)
**What:** Keep the wizard store (auto-saved current state) separate from the scenarios store (list of named snapshots). The wizard store auto-saves on every change. The scenarios store holds the array of saved scenarios.
**When to use:** When auto-save and explicit save are different concerns.
**Example:**
```typescript
// scenariosStore.ts
interface Scenario {
  id: string
  name: string
  createdAt: string        // ISO date string
  updatedAt: string        // ISO date string
  wizardState: SerializedWizardState  // snapshot of WizardState (Fractions as strings)
  summary: ScenarioSummary            // pre-computed for card display
}

interface ScenarioSummary {
  heirSummary: string      // "2 sons, 1 daughter, 1 wife"
  totalEstateValue: number
  adjustment: 'none' | 'awl' | 'radd'
  heirCount: number
}
```

### Pattern 3: Page-Level View Switching Without Router
**What:** Use a simple state variable in App.tsx to switch between wizard and scenarios views. No router dependency needed.
**When to use:** App has only 2-3 top-level views with no need for URL-based navigation or deep linking.
**Example:**
```typescript
// App.tsx
type AppPage = 'wizard' | 'scenarios'

function App() {
  const [page, setPage] = useState<AppPage>('wizard')

  return (
    <AppLayout page={page} onNavigate={setPage}>
      <AnimatePresence mode="wait">
        {page === 'wizard' && <WizardShell key="wizard" />}
        {page === 'scenarios' && <ScenariosPage key="scenarios" onNavigate={setPage} />}
      </AnimatePresence>
    </AppLayout>
  )
}
```

### Pattern 4: Unsaved Changes Detection
**What:** Track whether current wizard state has been modified since last save. Compare current state hash/timestamp against last saved version.
**When to use:** Before loading a different scenario, warn user if they have unsaved changes.
**Example:**
```typescript
// In scenariosStore:
interface ScenariosState {
  scenarios: Scenario[]
  lastSavedStateHash: string | null  // hash of wizard state at last save
  // ...
}

// Simple hash: JSON.stringify the serializable wizard state and use a short hash
function computeStateHash(state: WizardState): string {
  const serializable = extractSerializableState(state)
  // Simple approach: use JSON.stringify length + key fields
  return `${serializable.relationship}-${serializable.sonCount}-${serializable.properties.length}-${serializable.totalEstateValue}`
}
```

### Pattern 5: Auto-Generated Scenario Names
**What:** Generate a human-readable name from the heir composition when saving.
**When to use:** When creating a new scenario or duplicating one.
**Example:**
```typescript
function generateScenarioName(state: WizardState): string {
  const parts: string[] = []
  if (state.sonCount > 0) parts.push(`${state.sonCount} Son${state.sonCount > 1 ? 's' : ''}`)
  if (state.daughterCount > 0) parts.push(`${state.daughterCount} Daughter${state.daughterCount > 1 ? 's' : ''}`)
  if (state.wifeCount > 0) parts.push(`${state.wifeCount} Wife`)
  if (state.husbandPresent) parts.push('Husband')
  // ... siblings
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return parts.length > 0 ? `${parts.join(', ')} -- ${date}` : `Scenario -- ${date}`
}
```

### Anti-Patterns to Avoid
- **Storing Fraction objects directly in localStorage:** Fraction.js instances serialize to `{}` with JSON.stringify. Always use custom replacer/reviver.
- **Single monolithic store for everything:** Mixing wizard state, scenario list, and comparison state in one store creates coupling and makes persistence configuration complex.
- **Using react-router for 2 views:** Adds unnecessary dependency, bundle size, and complexity for a simple wizard/scenarios toggle.
- **Re-computing results on load:** Store the full results (including Fraction objects) so loading a scenario shows results instantly. Don't force a recalculation that requires the user to click "Calculate" again.
- **Storing functions in persisted state:** Zustand `partialize` must exclude action functions from serialization. With the current store shape where actions are mixed into the state object, `partialize` must explicitly pick only data fields.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State persistence | Custom localStorage sync logic with event listeners | Zustand `persist` middleware | Handles hydration, race conditions, storage errors, tab sync |
| JSON serialization of Fraction | Manual pre/post processing on every save/load | `createJSONStorage` replacer/reviver | Integrated into persist lifecycle, handles nested Fractions automatically |
| State versioning/migration | Manual version checking on app load | `persist` middleware `version` + `migrate` | Built-in version comparison, migration pipeline, handles missing version |
| UUID generation | Custom ID generator | `crypto.randomUUID()` | Already used in the codebase for property IDs |
| Confirmation dialogs | Custom modal system | Native `window.confirm()` or simple inline confirm component | Phase scope is persistence, not modal infrastructure |

**Key insight:** Zustand's persist middleware handles the entire persistence lifecycle (serialize, write, read, deserialize, hydrate, migrate) with well-tested edge case handling. The only custom work needed is the Fraction replacer/reviver.

## Common Pitfalls

### Pitfall 1: Fraction Objects Serialize to Empty Objects
**What goes wrong:** `JSON.stringify(new Fraction(1, 3))` produces `{"s":1,"n":1,"d":3}` (internal fields) or `{}` depending on version. On deserialization, you get a plain object, not a Fraction instance.
**Why it happens:** Fraction.js instances are class objects without a `toJSON()` method. JSON.stringify captures enumerable properties but not the prototype.
**How to avoid:** Use `createJSONStorage` with `replacer` that detects `instanceof Fraction` and converts to `{ __fraction__: "1/3" }`, plus `reviver` that reconstructs via `new Fraction("1/3")`.
**Warning signs:** Results page shows NaN or crashes after page refresh. `sharePerHeir.valueOf()` throws "not a function" error.

### Pitfall 2: Persisting Action Functions
**What goes wrong:** If `partialize` is not configured, Zustand persist tries to serialize action functions (like `setStep`, `calculateShares`), which fail or produce garbage.
**Why it happens:** The WizardStore type mixes state data and action functions in the same object. Default persist serializes everything.
**How to avoid:** Use `partialize` to explicitly pick only data fields, excluding all action functions. Alternatively, since the current store already has a clean separation between `WizardState` (data) and `WizardActions` (functions), use the `WizardState` interface as a guide.
**Warning signs:** localStorage shows huge stringified values with function bodies, or `persist` throws during serialization.

### Pitfall 3: Hydration Timing with React StrictMode
**What goes wrong:** In development, React StrictMode double-renders components. If persist hydration triggers a re-render during the first render, components may flash with default state then hydrated state.
**Why it happens:** Persist middleware reads from localStorage asynchronously (even with sync storage, the hydration callback is async-like in its lifecycle).
**How to avoid:** Use `onRehydrateStorage` callback or `useStore.persist.hasHydrated()` to gate rendering until hydration completes. For this app, a brief flash is acceptable since it's client-only.
**Warning signs:** Users see empty wizard for a split second before their saved data appears.

### Pitfall 4: Loading Scenario Overwrites Auto-Save Before User Can Cancel
**What goes wrong:** If `setState` is called to load a scenario, the persist middleware immediately auto-saves the new state, destroying the previous auto-save.
**Why it happens:** Persist middleware fires on every state change. Loading a scenario IS a state change.
**How to avoid:** Before loading, capture the current state snapshot. If the user had unsaved changes, offer to save as a scenario first. The "save before load" flow must happen BEFORE calling `setState`.
**Warning signs:** User loses their current work when they accidentally tap "Load" on a scenario.

### Pitfall 5: localStorage Quota Exceeded
**What goes wrong:** With 20 scenarios, each containing full wizard state (properties, results, etc.), localStorage (typically 5-10MB) could be approached.
**Why it happens:** Each scenario stores the full serialized state including properties array, Fraction objects, and calculation results.
**How to avoid:** The 20-scenario limit is a good guardrail. Estimate: each scenario is roughly 5-15KB serialized, so 20 scenarios = ~300KB max -- well within limits. Add a try/catch around localStorage.setItem to handle quota errors gracefully.
**Warning signs:** `DOMException: QuotaExceededError` in console.

### Pitfall 6: Tab Synchronization Conflicts
**What goes wrong:** User opens two tabs, edits in both, and the auto-save from one tab overwrites the other.
**Why it happens:** Both tabs write to the same localStorage key on every state change.
**How to avoid:** For v1, this is acceptable behavior -- document it as a known limitation. The persist middleware does not handle cross-tab sync by default. The `storage` event could be used for future improvement.
**Warning signs:** Users report "lost data" when using multiple tabs.

## Code Examples

Verified patterns from official sources and codebase analysis:

### Adding Persist Middleware to Existing Store
```typescript
// Source: Zustand persist docs (https://zustand.docs.pmnd.rs/reference/middlewares/persist)
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Fraction from 'fraction.js'

const FRACTION_TAG = '__frac__'

const fractionStorage = createJSONStorage(() => localStorage, {
  replacer: (_key: string, value: unknown) => {
    if (value instanceof Fraction) {
      return { [FRACTION_TAG]: value.toFraction() }
    }
    return value
  },
  reviver: (_key: string, value: unknown) => {
    if (
      value !== null &&
      typeof value === 'object' &&
      FRACTION_TAG in (value as Record<string, unknown>)
    ) {
      return new Fraction(
        (value as Record<string, string>)[FRACTION_TAG],
      )
    }
    return value
  },
})

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      // ... all existing state and actions unchanged
    }),
    {
      name: 'jomi-bhag-wizard',
      storage: fractionStorage,
      version: 1,
      partialize: (state) => ({
        // Only data fields from WizardState, no action functions
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        relationship: state.relationship,
        deceasedGender: state.deceasedGender,
        userGender: state.userGender,
        mfloEnabled: state.mfloEnabled,
        motherAlive: state.motherAlive,
        autoIncludes: state.autoIncludes,
        wifeCount: state.wifeCount,
        husbandPresent: state.husbandPresent,
        sonCount: state.sonCount,
        daughterCount: state.daughterCount,
        siblingTypeExpanded: state.siblingTypeExpanded,
        brotherFullCount: state.brotherFullCount,
        brotherConsanguineCount: state.brotherConsanguineCount,
        brotherUterineCount: state.brotherUterineCount,
        sisterFullCount: state.sisterFullCount,
        sisterConsanguineCount: state.sisterConsanguineCount,
        sisterUterineCount: state.sisterUterineCount,
        properties: state.properties,
        expandedPropertyId: state.expandedPropertyId,
        results: state.results,
        totalEstateValue: state.totalEstateValue,
        viewMode: state.viewMode,
      }),
    }
  )
)
```

### Scenario Type Definition
```typescript
// Source: project analysis + CONTEXT.md decisions
interface Scenario {
  id: string                          // crypto.randomUUID()
  name: string                        // auto-generated or user-edited
  createdAt: string                   // ISO 8601
  updatedAt: string                   // ISO 8601
  state: SerializedWizardState        // full wizard data snapshot
}

// SerializedWizardState is WizardState but with Fractions already
// converted to strings by the storage serializer -- OR, store
// a pre-serialized copy. Since the scenariosStore also uses the
// same fractionStorage, Fraction objects are handled automatically.
type SerializedWizardState = WizardState
```

### Scenarios Store
```typescript
// Source: Zustand persist docs
interface ScenariosState {
  scenarios: Scenario[]
  selectedIds: string[]               // for comparison (max 2)
  isComparing: boolean
}

interface ScenariosActions {
  saveScenario: (name: string, wizardState: WizardState) => string
  loadScenario: (id: string) => WizardState | null
  deleteScenario: (id: string) => void
  clearAll: () => void
  duplicateScenario: (id: string) => string
  renameScenario: (id: string, name: string) => void
  toggleSelected: (id: string) => void
  startCompare: () => void
  stopCompare: () => void
}

export const useScenariosStore = create<ScenariosState & ScenariosActions>()(
  persist(
    (set, get) => ({
      scenarios: [],
      selectedIds: [],
      isComparing: false,
      // ... actions
    }),
    {
      name: 'jomi-bhag-scenarios',
      storage: fractionStorage, // same Fraction serializer
      version: 1,
    }
  )
)
```

### Unsaved Changes Detection
```typescript
// Track the last-saved wizard state hash
// Compare against current state to detect unsaved changes

function hasUnsavedChanges(): boolean {
  const wizardState = useWizardStore.getState()
  const lastSavedHash = useScenariosStore.getState().lastSavedHash
  if (!lastSavedHash) return wizardState.relationship !== null // any input = unsaved
  return computeStateFingerprint(wizardState) !== lastSavedHash
}

function computeStateFingerprint(state: WizardState): string {
  // Use key fields that meaningfully change the calculation
  return JSON.stringify({
    r: state.relationship,
    dg: state.deceasedGender,
    ug: state.userGender,
    m: state.mfloEnabled,
    ma: state.motherAlive,
    wc: state.wifeCount,
    hp: state.husbandPresent,
    sc: state.sonCount,
    dc: state.daughterCount,
    bfc: state.brotherFullCount,
    bcc: state.brotherConsanguineCount,
    buc: state.brotherUterineCount,
    sfc: state.sisterFullCount,
    scc: state.sisterConsanguineCount,
    suc: state.sisterUterineCount,
    se: state.siblingTypeExpanded,
    p: state.properties.length,
    te: state.totalEstateValue,
  })
}
```

### Comparison Diff Detection
```typescript
// For the comparison view -- detecting which values differ between two scenarios
function getComparisonData(scenarioA: Scenario, scenarioB: Scenario) {
  const sharesA = scenarioA.state.results?.shares ?? []
  const sharesB = scenarioB.state.results?.shares ?? []

  // Build a map of heir type -> shares for each scenario
  const mapA = new Map(sharesA.map(s => [s.heirType, s]))
  const mapB = new Map(sharesB.map(s => [s.heirType, s]))

  // All unique heir types across both
  const allHeirs = new Set([...mapA.keys(), ...mapB.keys()])

  return Array.from(allHeirs).map(heirType => {
    const a = mapA.get(heirType)
    const b = mapB.get(heirType)
    const differs = !a || !b ||
      !a.totalShare.equals(b.totalShare) ||
      a.count !== b.count
    return { heirType, a, b, differs }
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual localStorage.setItem/getItem | Zustand persist middleware | Zustand v3+ (2021) | Eliminates boilerplate, handles edge cases |
| IndexedDB for complex data | localStorage with JSON for small-medium apps | Stable | localStorage is simpler, sufficient for <5MB |
| react-router for all navigation | Conditional rendering for simple apps | Always valid | Avoids unnecessary dependency for 2-view apps |

**Deprecated/outdated:**
- Zustand v4 persist API used `getStorage` instead of `storage` option -- v5 uses `storage` directly with `createJSONStorage`
- The old `serialize`/`deserialize` options in persist are replaced by `createJSONStorage` with `replacer`/`reviver`

## Open Questions

1. **Exact import path for createJSONStorage in Zustand v5**
   - What we know: The docs show `import { createJSONStorage } from 'zustand/middleware'` (same module as persist)
   - What's unclear: Some sources show `'zustand/middleware/persist'` as an alternative path
   - Recommendation: Use `import { persist, createJSONStorage } from 'zustand/middleware'` -- both exports come from the same middleware module in v5

2. **Fraction serialization roundtrip fidelity**
   - What we know: `new Fraction("1/3").equals(new Fraction(1, 3))` is true per fraction.js docs. The `toFraction()` method produces strings like `"1/3"` that the constructor can parse.
   - What's unclear: Edge cases with negative fractions or zero
   - Recommendation: Write a unit test that round-trips all common Fraction values (0, 1/2, 1/3, 2/3, -1/4) through JSON.stringify/parse with the custom replacer/reviver

3. **Test store reset with persist middleware**
   - What we know: Current tests use `useWizardStore.setState(initialState, true)` in `beforeEach`. With persist middleware, this may trigger a write to localStorage.
   - What's unclear: Whether jsdom provides localStorage in vitest (it does -- jsdom includes a working localStorage implementation)
   - Recommendation: In tests, clear localStorage before each test and ensure `beforeEach` still works with persist. May need `useWizardStore.persist.clearStorage()` in test setup.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | vite.config.ts (test section) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PRST-01 | Wizard state persists to localStorage and survives reload | unit | `npx vitest run src/stores/__tests__/wizardStore.test.ts -t "persist" -x` | Needs update (Wave 0) |
| PRST-01 | Fraction objects serialize/deserialize correctly | unit | `npx vitest run src/stores/__tests__/fractionStorage.test.ts -x` | Wave 0 |
| PRST-02 | Save, load, duplicate, delete, rename scenarios | unit | `npx vitest run src/stores/__tests__/scenariosStore.test.ts -x` | Wave 0 |
| PRST-02 | Compare 2 scenarios side by side with diff highlighting | unit | `npx vitest run src/components/__tests__/scenarios.test.tsx -x` | Wave 0 |
| PRST-03 | Load scenario replaces wizard state; unsaved changes warning | unit | `npx vitest run src/stores/__tests__/scenariosStore.test.ts -t "load" -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/stores/__tests__/fractionStorage.test.ts` -- Fraction replacer/reviver roundtrip tests
- [ ] `src/stores/__tests__/scenariosStore.test.ts` -- scenario CRUD operations, 20-scenario limit, comparison selection
- [ ] `src/components/__tests__/scenarios.test.tsx` -- ScenariosPage rendering, comparison view, empty state
- [ ] Update `src/stores/__tests__/wizardStore.test.ts` -- persist middleware integration (beforeEach needs localStorage.clear())

## Sources

### Primary (HIGH confidence)
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) -- full API reference, configuration options, TypeScript types
- [Zustand persist middleware DeepWiki](https://deepwiki.com/pmndrs/zustand/3.1-persist-middleware) -- verified API details, createJSONStorage helper, version/migrate options
- [fraction.js npm](https://www.npmjs.com/package/fraction.js) -- constructor accepts string input from toFraction(), enables roundtrip serialization
- Project codebase analysis -- wizardStore.ts, types/wizard.ts, faraid/types.ts (Fraction usage patterns)

### Secondary (MEDIUM confidence)
- [Zustand GitHub persist docs](https://github.com/pmndrs/zustand/blob/main/docs/reference/integrations/persisting-store-data.md) -- additional examples for partialize and merge
- [Vitest localStorage testing](https://runthatline.com/vitest-mock-localstorage/) -- jsdom includes working localStorage; no mock needed

### Tertiary (LOW confidence)
- Cross-tab sync behavior -- not verified with Zustand v5 persist, but not needed for v1

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Zustand persist is the obvious and only reasonable choice given existing stack
- Architecture: HIGH -- two-store pattern is well-established, Fraction serialization approach verified against both Zustand and fraction.js docs
- Pitfalls: HIGH -- Fraction serialization, partialize, and hydration timing are well-documented concerns in the Zustand ecosystem

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable domain, no fast-moving dependencies)
