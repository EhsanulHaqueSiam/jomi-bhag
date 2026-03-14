---
phase: quick-3
plan: 01
subsystem: json-import
tags: [bugfix, import, navigation, wizard]
dependency_graph:
  requires: []
  provides: [working-import-flow, post-import-navigation]
  affects: [importData.ts, useJsonImport.ts, importData.test.ts]
tech_stack:
  added: []
  patterns: [getState-calculateShares-after-setState]
key_files:
  modified:
    - src/core/json/importData.ts
    - src/hooks/useJsonImport.ts
    - src/core/json/__tests__/importData.test.ts
decisions:
  - completedSteps set to [1,2,3,4] in parse output so all wizard steps are navigable after import
  - calculateShares() called after setState in confirmImport to auto-compute results and navigate to step 5
metrics:
  duration: 1min
  completed: 2026-03-14T08:09:00Z
  tasks: 2/2
  files_modified: 3
---

# Quick Task 3: Fix JSON Import Not Applying Data Summary

Fixed JSON import landing on step 1 with empty state by setting completedSteps to [1,2,3,4] during parse and calling calculateShares() after setState in confirmImport to auto-navigate to results page.

## Changes Made

### Task 1: Fix completedSteps and add calculateShares call (f3c2e2f)

**importData.ts:** Changed `completedSteps: []` to `completedSteps: [1, 2, 3, 4]` at line 365. After import, all wizard steps are marked complete so users can navigate back to any step via the step indicator.

**useJsonImport.ts:** Added `useWizardStore.getState().calculateShares()` call in `confirmImport` after `setState` and `resetDistribution`, before clearing pending state. This triggers the inheritance calculation engine, sets results on the store, and navigates to step 5 (results page).

### Task 2: Update import tests (568b48c)

Updated the existing `completedSteps` test to assert `[1, 2, 3, 4]` instead of `[]`. Added a new test confirming completedSteps is `[1, 2, 3, 4]` even with minimal import data (bare `{ relationship, sonCount }` object).

All 25 import tests pass. TypeScript compilation clean with no errors.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- 25/25 import tests passing
- TypeScript `tsc --noEmit` clean (no errors)
- Manual verification: Import JSON -> confirm -> app navigates to step 5 with computed shares
