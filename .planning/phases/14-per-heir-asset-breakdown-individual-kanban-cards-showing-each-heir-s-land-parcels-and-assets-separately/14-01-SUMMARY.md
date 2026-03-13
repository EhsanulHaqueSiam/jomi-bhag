---
phase: 14-per-heir-asset-breakdown
plan: 01
subsystem: distribution
tags: [zustand, typescript, tdd, individual-distribution, parcel-splitting, compensation]

requires:
  - phase: 11-interactive-asset-distribution
    provides: distributionStore, DistributionItem, DistributionGroup, smartShuffle algorithm
  - phase: 09-land-lot-division
    provides: CashCompensation type, qurah ceremony pattern
provides:
  - IndividualColumn, SplitParcel, IndividualCompensation, IndividualDistributionResult types
  - Pure algorithm functions for individual distribution (expand, subdivide, split, merge, shuffle, compensate, move, fingerprint)
  - useIndividualDistributionStore Zustand store with persist middleware
affects: [14-02-ui-components, 14-03-pdf-integration, json-export-import]

tech-stack:
  added: []
  patterns: [individual-level distribution from group snapshots, parcel split with remainder-last rounding, greedy min-transfer compensation]

key-files:
  created:
    - src/core/distribution/individual-types.ts
    - src/core/distribution/individual-algorithm.ts
    - src/core/distribution/__tests__/individual-algorithm.test.ts
    - src/stores/individualDistributionStore.ts
    - src/stores/__tests__/individualDistributionStore.test.ts
  modified: []

key-decisions:
  - "splitParcel last sub-parcel gets remainder value to prevent floating point rounding drift"
  - "COMPENSATION_THRESHOLD set at 100 BDT to filter trivial transfers"
  - "computeIndividualFingerprint includes heir type counts so heir additions/removals invalidate state"
  - "splitOrigins Map tracks original items for merge reversal (not persisted, ephemeral)"
  - "Stable empty array constants (EMPTY_INDIVIDUALS, EMPTY_ITEMS, EMPTY_COMPENSATIONS) prevent Zustand selector infinite rerender"

patterns-established:
  - "Individual distribution snapshot pattern: initialize from group distributionStore via getState() read"
  - "Parcel split/merge with origin tracking via in-memory Map"
  - "Individual column ID convention: ${heirType}_${index} (e.g. son_0, daughter_1)"

requirements-completed: [P14-02, P14-04, P14-05, P14-06, P14-07]

duration: 7min
completed: 2026-03-14
---

# Phase 14 Plan 01: Individual Distribution Data Foundation Summary

**Pure algorithm functions and Zustand store for per-heir individual distribution with parcel splitting, greedy min-transfer compensation, and fingerprinted staleness detection**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-13T21:16:38Z
- **Completed:** 2026-03-13T21:23:12Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- 9 pure algorithm functions (expand, subdivide, split, merge, shuffle, compensate, move, fingerprint, initialize) with 22 unit tests
- Zustand store with persist middleware, one-level undo, split/merge, rename, Qurah shuffle, and staleness detection with 13 unit tests
- Full test suite (646 tests across 38 files) passes with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Individual distribution types and pure algorithm functions** - `ad50397` (feat)
2. **Task 2: Individual distribution Zustand store with persist middleware** - `fa533b2` (feat)

## Files Created/Modified
- `src/core/distribution/individual-types.ts` - IndividualColumn, SplitParcel, IndividualCompensation, IndividualDistributionResult types + COMPENSATION_THRESHOLD constant
- `src/core/distribution/individual-algorithm.ts` - 9 pure functions: expandGroupsToIndividuals, subdivideGroupItems, splitParcel, mergeParcel, individualQurahShuffle, calculateIndividualCompensations, moveIndividualItem, computeIndividualFingerprint, initializeIndividualDistribution
- `src/core/distribution/__tests__/individual-algorithm.test.ts` - 22 tests covering expansion, subdivision, split/merge, shuffle, compensation, move, fingerprint, and initialization
- `src/stores/individualDistributionStore.ts` - Zustand store with persist middleware: initialize, moveItem, qurahShuffle, undo, splitItem, mergeItem, renameIndividual, isStale, getEquilibriumSummary, reset
- `src/stores/__tests__/individualDistributionStore.test.ts` - 13 tests covering all store actions and staleness detection

## Decisions Made
- splitParcel assigns remainder to last sub-parcel to guarantee exact value conservation (no floating point drift)
- COMPENSATION_THRESHOLD at 100 BDT filters negligible transfers from compensation output
- Individual fingerprint includes all heir type counts (sonCount, daughterCount, wifeCount, etc.) so adding/removing heirs invalidates the individual distribution
- splitOrigins Map is ephemeral (not persisted) -- tracks original items for merge reversal within a session
- Stable empty array constants prevent Zustand selector infinite re-render when store has no data

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered
- Initial compensation test data used amounts below COMPENSATION_THRESHOLD (100 BDT), causing tests to fail because small transfers were correctly filtered out. Fixed by increasing test amounts to be above threshold.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Types and algorithms ready for UI components (14-02: IndividualBoard, IndividualColumn, toggle control)
- Store ready for integration with DistributionPage tab/toggle
- All exports documented in must_haves artifacts for downstream consumption

## Self-Check: PASSED

All 5 files verified present. Both task commits (ad50397, fa533b2) verified in git log.

---
*Phase: 14-per-heir-asset-breakdown*
*Completed: 2026-03-14*
