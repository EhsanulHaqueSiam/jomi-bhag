---
phase: 01-faraid-engine-and-project-foundation
plan: 01
subsystem: faraid-engine
tags: [fraction.js, vitest, vite, react, tailwindcss-4, typescript, faraid, islamic-inheritance]

# Dependency graph
requires:
  - phase: none
    provides: greenfield project
provides:
  - Complete Faraid type system (HeirType, FaraidInput, FaraidOutput, ShareResult, etc.)
  - Fraction utility with 6 Quranic constants and domain helpers
  - Quranic reference data (4:11, 4:12, 4:176) with Arabic text
  - Hadith reference data (father-as-Asaba, grandmother's 1/6, Umariyyatayn, Hanafi grandfather-siblings)
  - Declarative rule table for all 17 heir types with conditional shares
  - Input validation module (structural checks)
  - Reference lookup functions (getShareReference, getBlockingReference, etc.)
  - Configured build toolchain (Vite 8, React 19, TailwindCSS 4, Vitest 4)
affects: [01-02-PLAN, 01-03-PLAN, phase-2, phase-3]

# Tech tracking
tech-stack:
  added: [fraction.js v5.3.4, vitest v4.1.0, tailwindcss v4.2.1, @tailwindcss/vite v4.2.1, react v19.2.4, vite v8.0.0, typescript v5.9.3]
  patterns: [data-driven rule table, fraction wrapper for domain clarity, type-only imports with verbatimModuleSyntax]

key-files:
  created:
    - src/core/faraid/types.ts
    - src/core/utils/fraction.ts
    - src/core/faraid/validation.ts
    - src/core/faraid/references.ts
    - src/data/quran-references.ts
    - src/data/hadith-references.ts
    - src/data/faraid-rules.ts
    - src/core/faraid/__tests__/types-and-utils.test.ts
    - src/core/faraid/__tests__/validation.test.ts
    - vite.config.ts
    - package.json
    - tsconfig.app.json
    - public/_redirects
    - src/App.tsx
    - src/index.css
  modified: []

key-decisions:
  - "Used vitest/config defineConfig for merged Vite+Vitest types in single config file"
  - "HeirType modeled as string union (17 values) covering complete Hanafi taxonomy including son_of_son and daughter_of_son for MFLO"
  - "Fraction constants created as new Fraction() instances, not shared references, to avoid mutation risks"
  - "Rule table conditions ordered by specificity (most specific first) for first-match evaluation"
  - "Umariyyatayn handled as ONE_THIRD default in rule table with note that engine adjusts for special case"

patterns-established:
  - "Data-driven rule table: all Faraid rules as declarative data in src/data/faraid-rules.ts"
  - "Fraction wrapper pattern: domain-specific helpers wrapping fraction.js in src/core/utils/fraction.ts"
  - "Type-only imports enforced by verbatimModuleSyntax"
  - "Path alias @/* -> src/* for clean imports"
  - "TDD workflow: RED (failing tests) -> GREEN (implementation) -> REFACTOR"

requirements-completed: [FARD-01, FARD-07, FARD-08, DSGN-04]

# Metrics
duration: 12min
completed: 2026-03-12
---

# Phase 1 Plan 01: Project Scaffolding and Faraid Type System Summary

**Vite 8 + React 19 project with complete Faraid type system, fraction.js-backed Quranic constants, declarative rule table for 17 heir types, Quranic/Hadith reference data with Arabic text, and input validation -- all tested with 35 passing Vitest tests**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-12T15:52:57Z
- **Completed:** 2026-03-12T16:05:00Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments
- Project scaffolded with Vite 8, React 19, TypeScript 5.9, TailwindCSS 4, and Vitest 4 -- builds to deployable static site
- Complete Faraid type system covering all 17 heir types with full/consanguine/uterine sibling distinction
- Fraction utility wrapping fraction.js with 6 Quranic constants (HALF, QUARTER, EIGHTH, TWO_THIRDS, ONE_THIRD, ONE_SIXTH) and zero floating-point arithmetic
- Quranic reference data for Surah An-Nisa 4:11, 4:12, 4:176 with actual Arabic text and English translations
- Hadith reference data covering father-as-Asaba, grandmother's 1/6, Umariyyatayn, and Hanafi grandfather-sibling blocking
- Declarative rule table for all 17 heir types with conditional shares using predicate functions
- Input validation module rejecting invalid inputs (negative counts, >4 wives, gender-spouse mismatch)
- 35 tests passing covering fraction constants, helpers, rule completeness, and validation

## Task Commits

Each task was committed atomically:

1. **Task 1: Project scaffolding** - `013b176` (feat)
2. **Task 2 RED: Failing tests** - `594b781` (test)
3. **Task 2 GREEN: Implementation** - `721351c` (feat)

## Files Created/Modified
- `package.json` - Project config with test scripts and dependencies
- `vite.config.ts` - Vite + React + TailwindCSS + Vitest unified config
- `tsconfig.app.json` - TypeScript config with path aliases
- `index.html` - Entry HTML with app title
- `public/_redirects` - Netlify SPA routing
- `src/index.css` - TailwindCSS 4 import + Noto Naskh Arabic font
- `src/App.tsx` - Minimal placeholder with Arabic Bismillah
- `src/main.tsx` - React entry point
- `src/vite-env.d.ts` - Vite client type reference
- `src/core/faraid/types.ts` - Complete Faraid type system (17 heir types, all interfaces)
- `src/core/utils/fraction.ts` - Fraction.js wrapper with 6 Quranic constants and helpers
- `src/core/faraid/validation.ts` - Input validation (structural checks)
- `src/core/faraid/references.ts` - Reference lookup functions
- `src/data/quran-references.ts` - Quranic verse data with Arabic text
- `src/data/hadith-references.ts` - Hadith citation data
- `src/data/faraid-rules.ts` - Declarative rule table for all heir types
- `src/core/faraid/__tests__/types-and-utils.test.ts` - Fraction and rule completeness tests
- `src/core/faraid/__tests__/validation.test.ts` - Validation tests

## Decisions Made
- Used `vitest/config` `defineConfig` to get merged Vite+Vitest type support in single config file
- HeirType modeled as 17-value string union type (not enum) for better TypeScript ergonomics
- Rule table conditions ordered most-specific-first for deterministic first-match evaluation
- Umariyyatayn noted as engine-level special case, with ONE_THIRD as default mother share in rule table
- Noto Naskh Arabic chosen as Arabic font for Quranic text display

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript verbatimModuleSyntax import errors**
- **Found during:** Task 2 GREEN phase
- **Issue:** TypeScript strict mode requires `import type` for type-only imports
- **Fix:** Changed `import { HeirType }` to `import type { HeirType }` in test file, removed unused `Fraction` import from faraid-rules.ts
- **Files modified:** src/core/faraid/__tests__/types-and-utils.test.ts, src/data/faraid-rules.ts
- **Verification:** `bun run build` passes with zero errors
- **Committed in:** 721351c (part of Task 2 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor TypeScript strictness fix. No scope creep.

## Issues Encountered
- TailwindCSS 4 produces a CSS warning about `@import url()` ordering (the Google Fonts import appears after Tailwind's generated `@property` rules). This is a known Tailwind 4 behavior and does not affect functionality. The font loads correctly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Type system ready for Plans 02 and 03 to import without modification
- Rule table ready for engine to evaluate conditions against HeirContext
- Fraction utilities ready for all share calculations
- Reference data ready for per-heir annotation in engine output
- Validation module ready for engine input checking
- Test infrastructure (Vitest) configured and running
- Build produces deployable static site

## Self-Check: PASSED

All 16 claimed files verified on disk. All 3 commit hashes (013b176, 594b781, 721351c) found in git log.

---
*Phase: 01-faraid-engine-and-project-foundation*
*Completed: 2026-03-12*
