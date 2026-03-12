---
phase: 01-faraid-engine-and-project-foundation
plan: 02
subsystem: faraid-engine
tags: [hajb, blocking, shares, umariyyatayn, mushtarakah, kalalah, fraction.js, vitest, hanafi]

# Dependency graph
requires:
  - phase: 01-01
    provides: Complete Faraid type system, fraction utility, declarative rule table, HeirType/HeirContext/BlockingRule types
provides:
  - 14 Hajb Hirman total blocking rules covering all 16 logical rules (Hanafi)
  - 5 Hajb Nuqsan partial reduction rules with predicate-driven evaluation
  - applyHajb function returning active heirs, blocked list, and reduction info
  - buildHeirContext converting FaraidInput to flat context for predicate evaluation
  - assignFixedShares evaluating rule table predicates for all 12 Dhawul Furud types
  - Polygamy support (wife share divided equally among multiple wives)
  - Umariyyatayn special case (mother gets 1/3 of remainder per Omar's ruling)
  - Mushtarakah special case (Hanafi: full siblings get nothing, with Shafi'i/Maliki note)
  - Kalalah detection function for uterine sibling share conditions
  - detectSpecialCases returning array of applicable case names
affects: [01-03-PLAN, phase-2, phase-3]

# Tech tracking
tech-stack:
  added: []
  patterns: [data-driven blocking rules, pipeline blocking-before-shares, special case post-processing]

key-files:
  created:
    - src/core/faraid/blocking.ts
    - src/core/faraid/shares.ts
    - src/core/faraid/special-cases.ts
    - src/core/faraid/__tests__/blocking.test.ts
    - src/core/faraid/__tests__/shares.test.ts
    - src/core/faraid/__tests__/special.test.ts
  modified: []

key-decisions:
  - "Rules 2 and 4 (deeper grandson blocking) not modeled as HeirType taxonomy stops at son_of_son/daughter_of_son -- 14 array entries cover all 16 logical rules"
  - "Rule 5 exception implemented inline: daughter_of_son NOT blocked when son_of_son present (she becomes Asaba bi-ghayrihi)"
  - "Rule 11 conditional blocking: full sister only blocks consanguine siblings when she is Asaba ma'a ghayrihi (with daughters, no sons/father/grandfather)"
  - "Umariyyatayn detection uses post-blocking heir state -- siblings present but blocked by father still allows special case"
  - "Mushtarakah detection checks for husband + mother/grandmother + 2+ uterine siblings + full siblings"

patterns-established:
  - "Pipeline enforcement: blocking MUST run before share assignment -- applyHajb returns activeHeirs that assignFixedShares consumes"
  - "Special case post-processing: detectSpecialCases + applyUmariyyatayn/applyMushtarakah run after share assignment"
  - "Reduction info passed through pipeline: blocking produces ReductionInfo[], shares consumes it"

requirements-completed: [FARD-01, FARD-05, FARD-06, FARD-07, FARD-08]

# Metrics
duration: 8min
completed: 2026-03-12
---

# Phase 1 Plan 02: Hajb Blocking Rules, Fixed Shares, and Special Cases Summary

**All 16 Hajb Hirman + 5 Hajb Nuqsan blocking rules, fixed share assignment for 12 Dhawul Furud heir types, and Umariyyatayn/Mushtarakah/Kalalah special case handlers -- 67 tests passing with exact fraction arithmetic**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-12T16:09:33Z
- **Completed:** 2026-03-12T16:17:10Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Complete Hajb blocking module with 14 data-driven rule entries covering all 16 logical total blocking rules and 5 partial reduction rules
- Hanafi-specific rules (8: grandfather blocks siblings, 16: father blocks paternal grandmother) annotated with alternative school opinions
- Fixed share assignment consuming the declarative rule table with first-match predicate evaluation for all 12 Dhawul Furud types
- Polygamy handling: wife share (1/4 or 1/8) divided equally among multiple wives
- Umariyyatayn correctly gives mother 1/3 of remainder (not 1/3 of estate) per Omar's (RA) ruling
- Mushtarakah follows strict Hanafi (full siblings get nothing) with annotated Shafi'i/Maliki alternative
- buildHeirContext providing a flat, precomputed context object for all predicate evaluations
- 67 new tests across blocking, shares, and special cases (102 total suite)

## Task Commits

Each task was committed atomically:

1. **Task 1: Hajb blocking rules** - `d11a133` (feat)
2. **Task 2: Fixed share assignment and special cases** - `5c1b8f3` (feat)

## Files Created/Modified
- `src/core/faraid/blocking.ts` - 14 total blocking rules, 5 partial reduction rules, applyHajb function
- `src/core/faraid/shares.ts` - buildHeirContext, assignFixedShares with rule table evaluation
- `src/core/faraid/special-cases.ts` - isKalalah, detectSpecialCases, applyUmariyyatayn, applyMushtarakah
- `src/core/faraid/__tests__/blocking.test.ts` - 33 tests for all blocking rules and edge cases
- `src/core/faraid/__tests__/shares.test.ts` - 24 tests for all heir type share assignments
- `src/core/faraid/__tests__/special.test.ts` - 10 tests for Umariyyatayn, Mushtarakah, Kalalah

## Decisions Made
- Rules 2 and 4 (deeper grandson blocking) not modeled since HeirType taxonomy stops at son_of_son/daughter_of_son level; 14 array entries cover all 16 applicable logical rules
- Rule 5 exception (daughter_of_son NOT blocked when son_of_son present) implemented as inline condition check in applyHajb rather than separate rule
- Umariyyatayn detection uses post-blocking context -- siblings present but blocked by father don't prevent the special case from applying (correct Hanafi behavior)
- ShareAssignment type introduced with shareType discriminator for fard/asaba/fard_and_asaba to support Plan 03's residuary distribution

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Blocking module ready for engine orchestrator to call before share assignment
- Share assignment ready to feed into Awl/Radd adjustment (Plan 03)
- Special cases ready for engine-level integration
- Pipeline order enforced: blocking -> shares -> special cases -> adjustments (Plan 03)
- All exports typed and documented for Plan 03 consumption

## Self-Check: PASSED

All 6 claimed files verified on disk. Both commit hashes (d11a133, 5c1b8f3) found in git log.

---
*Phase: 01-faraid-engine-and-project-foundation*
*Completed: 2026-03-12*
