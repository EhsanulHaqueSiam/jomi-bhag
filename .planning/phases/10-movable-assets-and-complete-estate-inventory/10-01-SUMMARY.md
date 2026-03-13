---
phase: 10-movable-assets-and-complete-estate-inventory
plan: 01
subsystem: core, data, state
tags: [typescript, zustand, discriminated-union, gold-valuation, buyout-math, tdd]

# Dependency graph
requires:
  - phase: 04-property-data-model-and-valuation
    provides: Property type, computePropertyTotal, wizardStore CRUD pattern
  - phase: 08-persist-scenarios-and-comparison
    provides: persist partialize pattern, fractionStorage, scenario fingerprint
provides:
  - MovableAsset discriminated union covering 7 BD asset categories
  - computeAssetValue and computeMovableAssetsTotal valuation functions
  - Gold/silver rate data and unit conversion (vori/gram/tola)
  - calculateBuyout for indivisible asset compensation distribution
  - wizardStore CRUD actions for movable assets with persist
  - getAllPropertiesTotal now returns land + movable combined total
affects: [10-02 (asset UI forms), 10-03 (results integration), 11 (distribution)]

# Tech tracking
tech-stack:
  added: []
  patterns: [discriminated-union-with-switch-valuation, proportional-buyout-compensation]

key-files:
  created:
    - src/core/assets/types.ts
    - src/core/assets/valuation.ts
    - src/core/assets/indivisible.ts
    - src/data/movable-asset-data.ts
    - src/core/assets/__tests__/valuation.test.ts
    - src/core/assets/__tests__/indivisible.test.ts
  modified:
    - src/types/wizard.ts
    - src/stores/wizardStore.ts
    - src/stores/scenariosStore.ts
    - src/stores/__tests__/wizardStore.test.ts

key-decisions:
  - "Tola equals vori in BD context (both = 11.664g) -- kept as separate unit options for user familiarity"
  - "BAJUS approximate rates hardcoded (22K gold: 133000 BDT/vori) -- user can always override"
  - "Buyout compensation uses Math.round for integer BDT amounts in proportional distribution"

patterns-established:
  - "Discriminated union on category field with switch-based valuation: computeAssetValue delegates per category"
  - "Buyout formula: compensationOwed = assetValue * (1 - buyerFraction), distributed proportionally to other heir groups"

requirements-completed: [P10-SC1, P10-SC2, P10-SC3, P10-SC5]

# Metrics
duration: 4min
completed: 2026-03-13
---

# Phase 10 Plan 01: Movable Asset Data Foundation Summary

**Discriminated union for 7 BD asset categories with gold purity valuation, indivisible buyout math, and wizardStore CRUD with persist and fingerprint integration**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T12:38:17Z
- **Completed:** 2026-03-13T12:42:40Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Discriminated union covering all 7 BD asset categories (gold/silver, cash, vehicle, jewelry, furniture, livestock, custom) with type-safe fields per category
- Gold/silver valuation with purity rates (24K/22K/18K), weight unit conversion (vori/gram/tola), and user override support
- Buyout compensation calculation that deducts buyer's Faraid share and distributes remainder proportionally to other heir groups
- WizardStore extended with full movable asset CRUD, combined estate total, persist partialize, and scenario fingerprint

## Task Commits

Each task was committed atomically:

1. **Task 1: Movable asset types, data constants, valuation logic, and indivisible buyout math**
   - `f896d29` (test) - Failing tests for valuation and buyout
   - `59cc8da` (feat) - Implementation passing all 27 tests
2. **Task 2: WizardStore extension with movable asset CRUD, persist, and fingerprint** - `6189bec` (feat)

## Files Created/Modified

- `src/core/assets/types.ts` - MovableAsset discriminated union, IndivisibleResolution types, all category interfaces
- `src/core/assets/valuation.ts` - computeAssetValue, computeGoldValue, convertToVori, computeMovableAssetsTotal
- `src/core/assets/indivisible.ts` - calculateBuyout with proportional compensation distribution
- `src/data/movable-asset-data.ts` - GOLD_RATES, SILVER_RATES, GOLD_UNIT_CONVERSIONS, VEHICLE_TYPES, LIVESTOCK_TYPES, ASSET_CATEGORIES
- `src/core/assets/__tests__/valuation.test.ts` - 23 tests covering all valuation branches and data constants
- `src/core/assets/__tests__/indivisible.test.ts` - 4 tests covering buyout calculation, blocked shares, error handling
- `src/types/wizard.ts` - Added movableAssets/expandedAssetId to WizardState, updated Step 4 label to Estate Inventory
- `src/stores/wizardStore.ts` - Added 5 new CRUD actions, updated getAllPropertiesTotal, updated persist partialize
- `src/stores/scenariosStore.ts` - Added movable asset count to state fingerprint, updated pickWizardState
- `src/stores/__tests__/wizardStore.test.ts` - Added 9 new tests for movable asset CRUD, totals, and step label

## Decisions Made

- Tola equals vori in BD context (both = 11.664g) -- kept as separate unit options for user familiarity
- BAJUS approximate rates hardcoded (22K gold: 133000 BDT/vori) -- user can always override via transparent math display
- Buyout compensation uses Math.round for integer BDT amounts in proportional distribution
- Furniture defaults to divisible (defaultIndivisible: false) per CONTEXT.md (lump sum valuation)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Complete data foundation ready for Plan 02 to build UI forms (asset cards, gold/silver form, vehicle form, etc.)
- Store CRUD actions ready for component wiring
- Valuation functions ready for display in transparent math components
- All 484 tests pass with zero regressions

---
*Phase: 10-movable-assets-and-complete-estate-inventory*
*Completed: 2026-03-13*
