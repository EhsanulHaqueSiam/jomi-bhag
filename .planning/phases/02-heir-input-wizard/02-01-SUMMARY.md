---
phase: 02-heir-input-wizard
plan: 01
subsystem: ui
tags: [zustand, tailwindcss, wizard, state-management, faraid-input]

# Dependency graph
requires:
  - phase: 01-faraid-engine
    provides: "FaraidInput, HeirInput, HeirType types from core/faraid/types.ts"
provides:
  - "useWizardStore Zustand store with complete wizard state management"
  - "RelationshipType, WizardState, WizardStep type definitions"
  - "deriveDeceasedGender, deriveUserGender, getAutoIncludes pure functions"
  - "buildFaraidInput() producing valid FaraidInput from wizard state"
  - "TailwindCSS 4 @theme with gold accent palette and Inter/Noto Naskh Arabic fonts"
affects: [02-02-PLAN, 02-03-PLAN, 03-results-display]

# Tech tracking
tech-stack:
  added: [zustand@5.0.11, motion@12.36.0]
  patterns: [zustand-store-as-state-machine, pure-derivation-functions, auto-include-tracking, additive-heir-merging]

key-files:
  created:
    - src/types/wizard.ts
    - src/stores/wizardStore.ts
    - src/stores/__tests__/wizardStore.test.ts
    - src/types/__tests__/wizard.test.ts
  modified:
    - src/index.css
    - package.json
    - bun.lock

key-decisions:
  - "deriveDeceasedGender follows plan spec: husband->female, wife->male (user IS the heir type)"
  - "Auto-includes tracked as separate array for clean replacement on relationship change"
  - "buildFaraidInput merges auto-includes with manual counts additively via Map"
  - "completedSteps stored as number[] (not Set) for Zustand serialization"
  - "CSS @import order: font imports before tailwindcss import to avoid warnings"
  - "Gold palette added as custom oklch values; emerald uses TailwindCSS 4 built-in"

patterns-established:
  - "Pure derivation functions in types file, store imports and uses them"
  - "Store tested via getState()/setState() without component rendering"
  - "Auto-includes are additive with manual counts in buildFaraidInput"
  - "Bounds checking enforced in setter functions (wifeCount max 4, all mins 0)"

requirements-completed: [HEIR-01, HEIR-02, HEIR-03, HEIR-04, HEIR-05, DSGN-01]

# Metrics
duration: 8min
completed: 2026-03-12
---

# Phase 2 Plan 01: Wizard Store & Design System Summary

**Zustand wizard store with relationship derivation, auto-include logic, FaraidInput building, and TailwindCSS 4 gold/emerald design system**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-12T17:34:30Z
- **Completed:** 2026-03-12T17:42:38Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Zustand store with complete 3-step wizard state management (navigation, relationship derivation, auto-includes, heir counts, MFLO toggle, FaraidInput building)
- Pure derivation functions (deriveDeceasedGender, deriveUserGender, getAutoIncludes) covering all 7 relationship types
- Auto-include logic correctly adds user as heir and mother-as-wife when applicable, with clean reset on relationship change
- 75 total tests (26 type tests + 49 store tests) all passing alongside 158 existing Phase 1 tests
- TailwindCSS 4 @theme with gold-50 through gold-600 oklch palette and Inter + Noto Naskh Arabic font families

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies, create wizard types, and design system** - `5419e51` (feat)
2. **Task 2: Create Zustand wizard store with unit tests** - `3a3c255` (feat)

_Note: TDD tasks had RED/GREEN phases within each commit._

## Files Created/Modified
- `src/types/wizard.ts` - RelationshipType, WizardStep, WizardState, deriveDeceasedGender, deriveUserGender, getAutoIncludes
- `src/types/__tests__/wizard.test.ts` - 26 unit tests for pure derivation and auto-include functions
- `src/stores/wizardStore.ts` - Zustand store with all wizard state, actions, and buildFaraidInput
- `src/stores/__tests__/wizardStore.test.ts` - 49 unit tests for store logic, auto-includes, FaraidInput building, step validation
- `src/index.css` - TailwindCSS 4 @theme with gold palette, font families, slide-in animation
- `package.json` - Added zustand@5.0.11 and motion@12.36.0 dependencies
- `bun.lock` - Updated lockfile

## Decisions Made
- **Relationship semantics:** "husband" means user IS the husband (male), deceased is female; "wife" means user IS the wife (female), deceased is male. This follows the plan spec which differs from RESEARCH.md's mapping.
- **Auto-include tracking:** Stored as separate `autoIncludes` array in state, recalculated whenever relationship, userGender, or motherAlive changes. Merged additively with manual counts in buildFaraidInput via Map.
- **Relationship change resets:** Reset autoIncludes, motherAlive, wifeCount, husbandPresent. Do NOT reset sonCount/daughterCount/sibling counts (user may have entered those already).
- **CSS import order:** Google Font imports placed before `@import "tailwindcss"` to avoid CSS spec @import ordering warnings.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused import TypeScript error**
- **Found during:** Task 1 (wizard types)
- **Issue:** Test file imported `type RelationshipType` which triggered `noUnusedLocals` TS error
- **Fix:** Removed the unused type import from the test file
- **Files modified:** src/types/__tests__/wizard.test.ts
- **Verification:** `bun run build` passes cleanly
- **Committed in:** 5419e51 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed CSS @import ordering warnings**
- **Found during:** Task 1 (design system)
- **Issue:** Google Font @import rules placed after `@import "tailwindcss"` caused CSS spec warnings about @import rule ordering
- **Fix:** Moved font @import rules before the tailwindcss import
- **Files modified:** src/index.css
- **Verification:** `bun run build` produces no warnings
- **Committed in:** 5419e51 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for clean build. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Wizard store and types are ready for UI component consumption (Plan 02-02)
- All exports match expected interfaces: useWizardStore, RelationshipType, deriveDeceasedGender, deriveUserGender, getAutoIncludes, WizardState
- Design system tokens available via TailwindCSS utility classes (text-gold-500, font-arabic, etc.)
- 233 total tests passing (158 Phase 1 + 75 Phase 2 Plan 01)

## Self-Check: PASSED

All files verified present. All commits verified in git log. SUMMARY.md exists.

---
*Phase: 02-heir-input-wizard*
*Completed: 2026-03-12*
