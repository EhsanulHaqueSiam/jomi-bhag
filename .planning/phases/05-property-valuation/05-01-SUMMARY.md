---
phase: 05-property-valuation
plan: 01
subsystem: ui, data
tags: [mouza-rates, upazila, property-valuation, bd-land, rate-suggestion]

# Dependency graph
requires:
  - phase: 04-property-input-system
    provides: Property type, LandAreaInput, PropertyCard, wizardStore with property CRUD
provides:
  - Mouza rate data module with 84 upazila entries across 8 BD division HQ districts
  - getMouzaRate lookup function (division+upazila+propertyType -> BDT/decimal)
  - computeEstateBreakdown helper for category totals and per-property breakdown
  - Property type extended with upazila and rateSource fields
  - Upazila cascade dropdown in LandAreaInput
  - MouzaRateSuggestion inline component with transparent math and "Use this rate"
  - Govt rate / Manual badge on PropertyCard
affects: [05-property-valuation, results-page, heir-distribution]

# Tech tracking
tech-stack:
  added: []
  patterns: [mouza-rate-lookup, upazila-cascade-dropdown, rate-suggestion-inline]

key-files:
  created:
    - src/data/mouza-rates.ts
    - src/data/__tests__/mouza-rates.test.ts
    - src/core/land/valuation.ts
    - src/core/land/__tests__/valuation.test.ts
    - src/components/property/MouzaRateSuggestion.tsx
  modified:
    - src/core/land/types.ts
    - src/stores/wizardStore.ts
    - src/components/property/LandAreaInput.tsx
    - src/components/property/PropertyCard.tsx
    - src/components/__tests__/property.test.tsx

key-decisions:
  - "Mouza rate data hardcoded for 84 upazilas across 8 BD division HQ districts with representative govt minimum rates"
  - "City corporation entries included for Dhaka, Chittagong, Rajshahi, Khulna, Sylhet, Barisal, Rangpur, Mymensingh"
  - "Rate ordering enforced: agricultural < residential < commercial for all upazilas"
  - "rateSource tracks govt vs manual on Property type; division change resets upazila and rateSource"

patterns-established:
  - "Mouza rate lookup: getMouzaRate(division, upazila, propertyType) returns BDT/decimal or null"
  - "Upazila cascade: dropdown appears when division selected, clears on division change"
  - "Rate suggestion inline: MouzaRateSuggestion renders below land value when conditions met"

requirements-completed: [VALP-01, VALP-02]

# Metrics
duration: 5min
completed: 2026-03-13
---

# Phase 5 Plan 01: Mouza Rate Data and Rate Suggestion UI Summary

**84-upazila mouza rate data module with upazila cascade dropdown, inline BDT/decimal rate suggestion, and govt/manual rate source tracking on Property type**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-12T23:04:03Z
- **Completed:** 2026-03-12T23:09:36Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Mouza rate data module covering all 8 BD division HQ districts with 84 upazila entries and realistic government minimum rates
- Property type extended with upazila (string|null) and rateSource (govt|manual) fields
- computeEstateBreakdown helper ready for Plan 02 consumption (category totals + per-property breakdown)
- Upazila cascade dropdown in LandAreaInput with automatic reset on division change
- Inline rate suggestion showing transparent math (BDT/decimal x area = total) with "Use this rate" button
- Govt rate / Manual badge on PropertyCard header with upazila label display
- 31 new tests (19 unit + 12 integration) all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Mouza rate data module, Property type extension, and valuation helper** - `a535fd8` (test: failing tests), `ac49da0` (feat: implementation)
2. **Task 2: Upazila dropdown, rate suggestion UI, and property form integration** - `245a5a8` (feat)

_Note: Task 1 followed TDD (test -> feat commits)_

## Files Created/Modified
- `src/data/mouza-rates.ts` - Mouza rate data module with UPAZILA_BY_DIVISION, getMouzaRate lookup
- `src/data/__tests__/mouza-rates.test.ts` - Unit tests for rate lookup and upazila data
- `src/core/land/valuation.ts` - computeEstateBreakdown for category totals and per-property breakdown
- `src/core/land/__tests__/valuation.test.ts` - Unit tests for estate breakdown computation
- `src/core/land/types.ts` - Property interface extended with upazila and rateSource fields
- `src/stores/wizardStore.ts` - addProperty defaults updated with upazila: null, rateSource: manual
- `src/components/property/MouzaRateSuggestion.tsx` - Inline rate suggestion component
- `src/components/property/LandAreaInput.tsx` - Upazila dropdown, rate suggestion integration
- `src/components/property/PropertyCard.tsx` - Govt rate/Manual badge, upazila label in header
- `src/components/__tests__/property.test.tsx` - 12 new integration tests for VALP-01/02

## Decisions Made
- Mouza rate data hardcoded for 84 upazilas with representative govt minimum rates (no API exists)
- City corporation entries added for all 8 division capitals
- Rate ordering enforced: agricultural < residential < commercial across all upazilas
- Dhaka area rates highest (80K-5M/decimal), rural areas lowest (15K-300K/decimal)
- Division change clears upazila and resets rateSource to manual
- Manual land value entry always sets rateSource to manual; only "Use this rate" sets govt

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- computeEstateBreakdown helper ready for Plan 02 (estate breakdown card on Results page)
- Property type with upazila/rateSource fields available for per-heir distribution display
- All 339 tests green, TypeScript clean

## Self-Check: PASSED

All 10 created/modified files verified present. All 3 task commits (a535fd8, ac49da0, 245a5a8) verified in git log.

---
*Phase: 05-property-valuation*
*Completed: 2026-03-13*
