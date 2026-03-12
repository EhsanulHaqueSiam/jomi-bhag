---
phase: 01-faraid-engine-and-project-foundation
plan: 03
subsystem: faraid-engine
tags: [asaba, awl, radd, mflo, residuary, adjustments, engine, fraction.js, vitest, hanafi, integration-tests]

# Dependency graph
requires:
  - phase: 01-01
    provides: Complete Faraid type system, fraction utility, declarative rule table
  - phase: 01-02
    provides: Hajb blocking rules, fixed share assignment, special cases (Umariyyatayn, Mushtarakah, Kalalah)
provides:
  - Asaba distribution for three types (bi-nafsihi, bi-ghayrihi, ma'a ghayrihi) with priority ordering
  - Awl proportional reduction algorithm for base denominators 6, 12, 24
  - Radd surplus redistribution with Hanafi spouse exclusion
  - MFLO Section 4 orphaned grandchildren per stirpes calculation (opt-in toggle)
  - calculateInheritance() single entry point running complete pipeline
  - End-to-end integration tests proving correctness against textbook Faraid examples
  - Complete Faraid engine ready for UI consumption in Phase 2
affects: [phase-2, phase-3, phase-4]

# Tech tracking
tech-stack:
  added: []
  patterns: [pipeline orchestration, bi-ghayrihi 2:1 distribution, Awl common denominator algorithm, Radd proportional redistribution]

key-files:
  created:
    - src/core/faraid/residuary.ts
    - src/core/faraid/adjustments.ts
    - src/core/faraid/mflo.ts
    - src/core/faraid/engine.ts
    - src/core/faraid/__tests__/residuary.test.ts
    - src/core/faraid/__tests__/awl.test.ts
    - src/core/faraid/__tests__/radd.test.ts
    - src/core/faraid/__tests__/mflo.test.ts
    - src/core/faraid/__tests__/integration.test.ts
  modified:
    - src/core/faraid/types.ts

key-decisions:
  - "Asaba priority ordering: son(1) > son_of_son(2) > father(3) > grandfather(4) > brother_full(5) > brother_consanguine(6) -- lower priority Asaba get ZERO when higher exists"
  - "Awl uses BigInt LCM of share denominators for exact common denominator computation -- always produces 6, 12, or 24 as base"
  - "Radd Bait-ul-Maal case: when only spouse exists, remainder is NOT redistributed -- total shares < 1 with explanatory note"
  - "FaraidInput extended with optional predeceasedChildren field for MFLO Section 4 without breaking existing API"
  - "Engine pipeline: validate -> build context -> detect special cases -> MFLO -> block -> assign fard -> apply special cases -> assign residuary -> adjust -> collect references -> build output"

patterns-established:
  - "Pipeline orchestration: calculateInheritance() calls each module in strict order, building steps[] throughout"
  - "Sum verification: every adjustment (Awl/Radd) must produce shares summing to exactly 1 (fraction.js equals check)"
  - "Educational explanations: every Awl/Radd adjustment includes detailed calculation step with original vs adjusted values"
  - "MFLO as opt-in toggle: pure Hanafi by default, MFLO Section 4 activated by boolean flag with warning annotation"

requirements-completed: [FARD-02, FARD-03, FARD-04, FARD-08]

# Metrics
duration: 10min
completed: 2026-03-12
---

# Phase 1 Plan 03: Residuary Distribution, Adjustments, MFLO, and Engine Orchestrator Summary

**Complete Faraid engine with Asaba 3-type distribution, Awl/Radd exact-fraction adjustments, MFLO Section 4 per stirpes toggle, and calculateInheritance() single entry point -- 158 tests passing across 10 test files with zero regressions**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-12T16:21:57Z
- **Completed:** 2026-03-12T16:32:48Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Asaba (residuary) distribution handling all three types: bi-nafsihi (males in priority order), bi-ghayrihi (2:1 male/female ratio per Quran 4:11), ma'a ghayrihi (sisters with daughters)
- Awl proportional reduction using BigInt LCM for exact fraction arithmetic across base denominators 6, 12, and 24 -- verified against textbook worked examples (base 6->7, 12->13, 24->27)
- Radd surplus redistribution with Hanafi spouse exclusion and Bait-ul-Maal handling when only spouse exists
- MFLO Section 4 orphaned grandchildren per stirpes calculation as opt-in toggle with warning annotation
- calculateInheritance() orchestrating the complete 10-step pipeline from validation to reference collection
- 56 new tests across 5 test files (residuary: 21, awl: 7, radd: 10, mflo: 5, integration: 13)
- Integration tests covering simple, Awl, Radd, blocking, Kalalah, Umariyyatayn, complex, and polygamy scenarios
- Every integration test verifies: shares sum to exactly 1, steps >= 3, references populated

## Task Commits

Each task was committed atomically:

1. **Task 1: Asaba distribution, Awl reduction, and Radd redistribution** - `b93041c` (feat)
2. **Task 2: MFLO Section 4, engine orchestrator, and integration tests** - `cbec5d0` (feat)

## Files Created/Modified
- `src/core/faraid/residuary.ts` - Asaba classification (classifyAsaba) and remainder distribution (assignResiduary) for 3 Asaba types
- `src/core/faraid/adjustments.ts` - Awl proportional reduction, Radd surplus redistribution, unified applyAdjustment dispatcher
- `src/core/faraid/mflo.ts` - MFLO Section 4 orphaned grandchildren per stirpes calculation
- `src/core/faraid/engine.ts` - Main calculateInheritance() orchestrator with step-by-step trace and reference collection
- `src/core/faraid/types.ts` - Extended FaraidInput with optional predeceasedChildren for MFLO support
- `src/core/faraid/__tests__/residuary.test.ts` - 21 tests for Asaba classification and distribution
- `src/core/faraid/__tests__/awl.test.ts` - 7 tests for Awl with worked textbook examples
- `src/core/faraid/__tests__/radd.test.ts` - 10 tests for Radd with Hanafi spouse exclusion
- `src/core/faraid/__tests__/mflo.test.ts` - 5 tests for MFLO Section 4
- `src/core/faraid/__tests__/integration.test.ts` - 13 end-to-end tests via calculateInheritance()

## Decisions Made
- Asaba priority numbering (son=1 through consanguine_brother=6) with strict highest-priority-takes-all when multiple Asaba types present at different priorities
- Awl algorithm uses BigInt GCD/LCM for denominator computation rather than fraction.js's LCM method, ensuring exact results with Faraid's specific denominator set
- MFLO modeled as separate calculation producing pool-relative shares (fraction of children's collective share) rather than absolute estate fractions, allowing clean composition with the main pipeline
- Engine converts fard_and_asaba to fard in final output (ShareResult) for simpler downstream consumption

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript unused import warnings in new files**
- **Found during:** Task 1 and Task 2 (build verification)
- **Issue:** TypeScript strict mode (verbatimModuleSyntax) flags unused imports as errors
- **Fix:** Removed unused imports (Fraction, FaraidInput, ZERO, QUARTER, etc.) from test files and source files
- **Files modified:** residuary.test.ts, awl.test.ts, radd.test.ts, mflo.test.ts, adjustments.ts, engine.ts, mflo.ts
- **Verification:** `bun run build` shows zero errors for new files
- **Committed in:** b93041c and cbec5d0

---

**Total deviations:** 1 auto-fixed (TypeScript strictness)
**Impact on plan:** Minor import cleanup. No scope creep.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 1 Faraid engine is COMPLETE: calculateInheritance() accepts any valid heir combination and returns correct shares with explanations and references
- Engine has zero React imports -- pure TypeScript computation ready for UI consumption
- Single entry point: `import { calculateInheritance } from '@/core/faraid/engine'`
- Input: FaraidInput (deceasedGender, heirs[], mfloEnabled?, predeceasedChildren?)
- Output: FaraidOutput (shares[], adjustment, steps[], references[], blockedHeirs[], specialCases[], mfloApplied)
- All 158 tests green across blocking, shares, special cases, residuary, Awl, Radd, MFLO, and integration
- Ready for Phase 2 (Heir Input Wizard) to build UI around the engine

## Self-Check: PASSED

All 10 claimed files verified on disk. Both commit hashes (b93041c, cbec5d0) found in git log.

---
*Phase: 01-faraid-engine-and-project-foundation*
*Completed: 2026-03-12*
