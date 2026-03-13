---
phase: 09-land-lot-division-and-qurah-assignment
plan: 01
subsystem: land-division
tags: [greedy-algorithm, qurah, zustand, division, cash-compensation, fisher-yates]

requires:
  - phase: 04-land-property-entry
    provides: Property type and computePropertyTotal function
  - phase: 01-faraid-engine
    provides: ShareResult, HeirType, and FaraidOutput types
provides:
  - Pure division algorithm (divideParcels, qurahShuffle, moveParcel, calculateCompensations)
  - DivisionGroup, CashCompensation, DivisionResult types
  - useDivisionStore Zustand store for division state management
affects: [09-02-division-ui, 11-drag-and-drop, 07-pdf-export]

tech-stack:
  added: []
  patterns: [greedy-best-fit-decreasing, constrained-shuffle, ephemeral-zustand-store]

key-files:
  created:
    - src/core/land/division.ts
    - src/core/land/__tests__/division.test.ts
    - src/stores/divisionStore.ts
  modified: []

key-decisions:
  - "Division algorithm uses greedy best-fit decreasing (largest-value property first to most under-target group)"
  - "calculateCompensations works on copies of cashAdjustment to avoid mutating DivisionGroup state"
  - "qurahShuffle uses Fisher-Yates for fair randomization, constrained to same-targetValue groups only"
  - "moveParcel recalculates all groups (not just affected pair) for consistent cashAdjustment totals"
  - "divisionStore is ephemeral (no localStorage persist) -- state derivable from wizardStore"
  - "getDisplayGroups remaps heirType/label/count from Qurah map, preserving parcel assignments"

patterns-established:
  - "Ephemeral Zustand store: no persist for derivable state (division is recalculable from properties+shares)"
  - "Fingerprint-based staleness: JSON hash of property IDs and values for change detection"

requirements-completed: [P9-SC1, P9-SC2, P9-SC3, P9-SC4]

duration: 3min
completed: 2026-03-13
---

# Phase 9 Plan 01: Division Algorithm and Store Summary

**Greedy best-fit land division algorithm with Qurah shuffle, cash compensation pairing, and ephemeral Zustand store**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-13T11:05:47Z
- **Completed:** 2026-03-13T11:08:33Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Pure division algorithm that groups properties into heir-type groups using greedy best-fit decreasing
- Cash compensation system that pairs overfilled groups with underfilled groups for balanced settlements
- Qurah (Islamic lot drawing) shuffle constrained to same-fraction groups for fairness
- Immutable moveParcel function for manual parcel reassignment between groups
- Ephemeral Zustand store integrating with wizardStore via getState() for non-reactive reads

## Task Commits

Each task was committed atomically:

1. **Task 1: Division algorithm** - `18562b0` (test) + `9a8c218` (feat) -- TDD RED/GREEN
2. **Task 2: Division Zustand store** - `cd03a7f` (feat)

## Files Created/Modified
- `src/core/land/division.ts` - Pure division algorithm: divideParcels, calculateCompensations, qurahShuffle, moveParcel
- `src/core/land/__tests__/division.test.ts` - 9 unit tests covering all algorithm functions and edge cases
- `src/stores/divisionStore.ts` - Zustand store: compute, Qurah, reveal, move, reset, getDisplayGroups, isStale

## Decisions Made
- calculateCompensations operates on copies of cashAdjustment values (not original group objects) to keep the function side-effect-free
- moveParcel recalculates assignedValue for ALL groups (not just the two affected) to maintain consistency
- divisionStore uses no persistence middleware -- division state is ephemeral and recalculable
- getDisplayGroups maps Qurah assignments by looking up original groups to get correct heir count

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Division algorithm and store ready for Plan 02 UI components to consume
- All exports (divideParcels, qurahShuffle, moveParcel, calculateCompensations, useDivisionStore) available for import
- 9 unit tests provide regression safety for UI integration

## Self-Check: PASSED

All 3 created files verified on disk. All 3 commit hashes (18562b0, 9a8c218, cd03a7f) verified in git log.

---
*Phase: 09-land-lot-division-and-qurah-assignment*
*Completed: 2026-03-13*
