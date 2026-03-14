---
phase: 15-fix-json-import-and-persistence-gaps
plan: 01
subsystem: data-persistence
tags: [zustand, json-import, serialization, react-hooks, state-management]

# Dependency graph
requires:
  - phase: 14-per-heir-asset-breakdown
    provides: individualDistributionStore, splitOrigins, customNames
  - phase: 12-json-import-export
    provides: validateAndParseImport, useJsonImport hook
provides:
  - JSON import restores customHeirNames and qurahUsed to individualDistributionStore
  - ScenariosPage New Calculation fully resets movableAssets and expandedAssetId
  - splitOrigins persists across page reloads (Record instead of Map)
affects: [json-import, distribution, scenarios]

# Tech tracking
tech-stack:
  added: []
  patterns: [zustand-record-over-map, import-side-effect-restoration]

key-files:
  created:
    - src/components/scenarios/__tests__/ScenariosPage.test.tsx
  modified:
    - src/hooks/useJsonImport.ts
    - src/stores/individualDistributionStore.ts
    - src/components/scenarios/ScenariosPage.tsx
    - src/components/distribution/IndividualColumn.tsx
    - src/components/distribution/IndividualBoard.tsx
    - src/hooks/__tests__/useJsonImport.test.ts
    - src/stores/__tests__/individualDistributionStore.test.ts
    - src/components/__tests__/individual-distribution.test.tsx

key-decisions:
  - "Only restore customNames and qurahUsed from import (not assignments) because item IDs are regenerated"
  - "splitOrigins converted from Map to Record for JSON serialization compatibility with Zustand persist"
  - "pendingIndividualData kept internal to useJsonImport (not exposed in return value) for ImportConfirmDialog backward compatibility"

patterns-established:
  - "Use Record<string, T> instead of Map<string, T> for Zustand-persisted state"

requirements-completed: [P14-18, PRST-02]

# Metrics
duration: 6min
completed: 2026-03-14
---

# Phase 15 Plan 01: Fix JSON Import and Persistence Gaps Summary

**Three bug fixes: JSON import restores individual distribution data (customHeirNames + qurahUsed), scenario reset clears movable assets, splitOrigins uses Record for Zustand persistence**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-14T12:44:19Z
- **Completed:** 2026-03-14T12:50:39Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- JSON import now fully restores customHeirNames and qurahUsed from imported data to individualDistributionStore
- ScenariosPage "New Calculation" resets movableAssets to [] and expandedAssetId to null, preventing stale asset data
- splitOrigins converted from Map to Record throughout codebase, included in partialize config for Zustand persistence
- 9 new tests added covering all three bug fixes (4 import tests, 4 splitOrigins tests, 1 ScenariosPage test)
- All 729+ existing tests continue to pass, zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix all three bugs -- useJsonImport, ScenariosPage reset, splitOrigins persistence** - `effd0f4` (fix)
2. **Task 2: Add test coverage for all three fixes** - `39f65b0` (test)

## Files Created/Modified
- `src/hooks/useJsonImport.ts` - Added pendingIndividualData state, import for individualDistributionStore, restoration logic in confirmImport
- `src/stores/individualDistributionStore.ts` - splitOrigins Map->Record, added to partialize, all Map operations converted to object operations
- `src/components/scenarios/ScenariosPage.tsx` - Added movableAssets: [] and expandedAssetId: null to handleNewCalculation
- `src/components/distribution/IndividualColumn.tsx` - Updated splitOrigins prop type to Record, canMerge uses Object.entries
- `src/components/distribution/IndividualBoard.tsx` - Updated splitOrigins prop type to Record
- `src/hooks/__tests__/useJsonImport.test.ts` - 4 new tests for individual data restoration
- `src/stores/__tests__/individualDistributionStore.test.ts` - 4 new tests for splitOrigins persistence
- `src/components/scenarios/__tests__/ScenariosPage.test.tsx` - New test file for reset verification
- `src/components/__tests__/individual-distribution.test.tsx` - Fixed splitOrigins initialization from Map to object

## Decisions Made
- Only restore customNames and qurahUsed from import (not assignments) because imported item IDs are regenerated and won't match
- splitOrigins converted from Map to Record for JSON serialization compatibility with Zustand persist
- pendingIndividualData kept internal to useJsonImport (not exposed in return value) to preserve ImportConfirmDialog backward compatibility
- customHeirNames and individualDistribution are inside the `data` field in JSON export format (matches existing export structure)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated IndividualColumn and IndividualBoard splitOrigins prop types and usage**
- **Found during:** Task 2 (test coverage verification)
- **Issue:** IndividualColumn.tsx used Map iteration (`for...of splitOrigins`) and `splitOrigins.get()` which broke after Map-to-Record conversion. IndividualBoard.tsx had Map type annotation.
- **Fix:** Changed prop type to `Record<string, DistributionItem>`, converted iteration to `Object.entries()`, removed `.get()` call
- **Files modified:** src/components/distribution/IndividualColumn.tsx, src/components/distribution/IndividualBoard.tsx
- **Verification:** Full test suite passes (729+ tests), tsc --noEmit clean
- **Committed in:** 39f65b0 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed individual-distribution test splitOrigins initialization**
- **Found during:** Task 2 (test coverage verification)
- **Issue:** Test file used `splitOrigins: new Map()` which no longer matches the Record type
- **Fix:** Changed to `splitOrigins: {}`
- **Files modified:** src/components/__tests__/individual-distribution.test.tsx
- **Committed in:** 39f65b0 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes necessary for Map-to-Record migration completeness. No scope creep.

## Issues Encountered
- Pre-existing usePdfExport test failures (3 tests) unrelated to this plan -- documented but not fixed (out of scope)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three persistence gaps closed
- JSON import fully restores individual distribution metadata
- Scenario reset is complete
- splitOrigins survives page reloads

---
*Phase: 15-fix-json-import-and-persistence-gaps*
*Completed: 2026-03-14*
