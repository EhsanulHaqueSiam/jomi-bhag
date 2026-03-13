---
phase: 08-persistence-and-scenarios
plan: 01
subsystem: database
tags: [zustand, persist, localStorage, fraction.js, serialization, scenarios]

# Dependency graph
requires:
  - phase: 01-faraid-engine
    provides: Fraction objects, FaraidOutput type
  - phase: 02-wizard-and-layout
    provides: WizardState type, useWizardStore
provides:
  - fractionStorage utility for Fraction-aware localStorage serialization
  - Scenario/ScenarioSummary/AppPage types
  - wizardStore with auto-save persist middleware
  - scenariosStore with full CRUD, comparison selection, fingerprinting
affects: [08-02-PLAN, scenarios-ui, pdf-export]

# Tech tracking
tech-stack:
  added: [zustand/middleware persist, createJSONStorage]
  patterns: [fraction-tagged-json, state-fingerprinting, scenario-snapshot]

key-files:
  created:
    - src/stores/fractionStorage.ts
    - src/types/scenario.ts
    - src/stores/scenariosStore.ts
    - src/stores/__tests__/fractionStorage.test.ts
    - src/stores/__tests__/scenariosStore.test.ts
  modified:
    - src/stores/wizardStore.ts
    - src/stores/__tests__/wizardStore.test.ts
    - src/test-setup.ts

key-decisions:
  - "Fraction serialization uses __frac__ tag with toFraction() string representation"
  - "Zustand persist partialize explicitly lists all WizardState fields to exclude action functions"
  - "Node 25 localStorage polyfill in test-setup.ts for jsdom compatibility"
  - "State fingerprint uses JSON.stringify of key heir/property counts for fast change detection"
  - "ScenarioSummary built from raw heir counts (not auto-includes) for display accuracy"

patterns-established:
  - "fractionStorage: reusable Fraction-aware createJSONStorage for any Zustand store"
  - "pickWizardState: extract only data fields from full store state for snapshots"
  - "computeStateFingerprint: deterministic hash from heir configuration for diff detection"

requirements-completed: [PRST-01, PRST-03]

# Metrics
duration: 7min
completed: 2026-03-13
---

# Phase 08 Plan 01: Persistence & Scenarios Data Layer Summary

**Fraction-aware localStorage persistence for wizardStore auto-save and scenariosStore CRUD with 20-scenario limit, name generation, and unsaved changes detection**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-13T09:15:10Z
- **Completed:** 2026-03-13T09:22:37Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- fractionStorage utility correctly serializes/deserializes Fraction objects through localStorage using __frac__ tagged JSON
- wizardStore auto-saves all state to localStorage on every change via Zustand persist middleware
- scenariosStore provides full CRUD: save, load, delete, clearAll, duplicate, rename with MAX_SCENARIOS=20 enforcement
- Unsaved changes detection via state fingerprinting (computeStateFingerprint)
- Scenario auto-naming from heir summary (e.g. "2 Sons, 1 Daughter, 1 Wife -- Mar 13")
- Comparison selection logic: max 2 toggleable, startCompare/stopCompare transitions
- All 418 tests pass (103 store tests including 45 new + existing)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fraction storage utility, scenario types, and wizardStore persist middleware**
   - `246e330` (test) - RED: failing fractionStorage tests
   - `8d11bf1` (feat) - GREEN: fractionStorage, scenario types, wizardStore persist

2. **Task 2: Scenarios store with full CRUD, name generation, and unsaved changes detection**
   - `48dc1d9` (test) - RED: failing scenariosStore tests
   - `cb133ce` (feat) - GREEN: scenariosStore with full CRUD and comparison

## Files Created/Modified
- `src/stores/fractionStorage.ts` - Fraction-aware JSON replacer/reviver for Zustand persist
- `src/types/scenario.ts` - Scenario, ScenarioSummary, AppPage type definitions
- `src/stores/wizardStore.ts` - Added persist middleware wrapping existing store
- `src/stores/scenariosStore.ts` - Scenario CRUD store with persist, comparison, fingerprinting
- `src/stores/__tests__/fractionStorage.test.ts` - 12 tests for serialization round-trips
- `src/stores/__tests__/wizardStore.test.ts` - Added localStorage cleanup + 3 persist tests
- `src/stores/__tests__/scenariosStore.test.ts` - 30 tests for CRUD, comparison, fingerprinting
- `src/test-setup.ts` - Node 25 localStorage polyfill for jsdom compatibility

## Decisions Made
- Fraction serialization uses `__frac__` tag with `toFraction()` string (e.g. `{ "__frac__": "1/3" }`)
- partialize explicitly lists all 24 WizardState data fields to exclude ~20 action functions
- Node 25's native localStorage stub (lacks .clear/.getItem) polyfilled in test-setup.ts
- State fingerprint uses JSON.stringify of 18 key fields for O(1) unsaved-changes check
- ScenarioSummary heirCount includes auto-includes for accurate totals

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Node 25 localStorage polyfill for test environment**
- **Found during:** Task 1
- **Issue:** Node 25 ships a native `localStorage` stub that lacks `clear()`, `getItem()`, `setItem()` methods when no `--localstorage-file` is provided. This shadows jsdom's proper Storage implementation, causing all localStorage tests to fail with "localStorage.clear is not a function".
- **Fix:** Added in-memory Storage polyfill in `src/test-setup.ts` that detects and replaces the broken native localStorage with a Map-backed implementation.
- **Files modified:** src/test-setup.ts
- **Verification:** All 418 tests pass including localStorage round-trip tests
- **Committed in:** 8d11bf1 (Task 1 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for test environment compatibility with Node 25. No scope creep.

## Issues Encountered
None beyond the Node 25 localStorage polyfill issue described above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- fractionStorage and scenario types ready for Plan 02 (scenarios UI)
- wizardStore persist active - any state change auto-saves to localStorage
- scenariosStore API complete for save/load/delete/duplicate/rename UI
- Comparison selection (toggleSelected, startCompare, stopCompare) ready for comparison UI

---
*Phase: 08-persistence-and-scenarios*
*Completed: 2026-03-13*
