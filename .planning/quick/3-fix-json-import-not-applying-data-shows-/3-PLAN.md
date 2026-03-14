---
phase: quick-3
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/core/json/importData.ts
  - src/hooks/useJsonImport.ts
  - src/core/json/__tests__/importData.test.ts
autonomous: true
requirements: [QUICK-3]
must_haves:
  truths:
    - "After JSON import and confirm, user sees the results page (step 5) with computed shares"
    - "After JSON import, all wizard steps (1-4) are navigable via step indicator"
    - "Imported data (heirs, properties, assets) is preserved and visible in results"
  artifacts:
    - path: "src/core/json/importData.ts"
      provides: "completedSteps:[1,2,3,4] in parsed import state"
      contains: "completedSteps: [1, 2, 3, 4]"
    - path: "src/hooks/useJsonImport.ts"
      provides: "calculateShares() call after setState in confirmImport"
      contains: "calculateShares"
  key_links:
    - from: "src/hooks/useJsonImport.ts"
      to: "src/stores/wizardStore.ts"
      via: "getState().calculateShares() after setState"
      pattern: "calculateShares"
---

<objective>
Fix JSON import appearing to reset state after successful import. The data is correctly applied to the store, but the user sees step 1 with empty completedSteps and no results. After import+confirm, the app should auto-calculate inheritance shares and navigate to the results page (step 5).

Purpose: Users importing saved JSON data expect to immediately see their results, not be sent back to step 1.
Output: Working import flow that lands on results page with computed shares.
</objective>

<execution_context>
@/home/siam/.claude/get-shit-done/workflows/execute-plan.md
@/home/siam/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/core/json/importData.ts
@src/hooks/useJsonImport.ts
@src/stores/wizardStore.ts

<interfaces>
From src/stores/wizardStore.ts:
```typescript
// calculateShares computes inheritance results and navigates to step 5
calculateShares: () => void
// Implementation: calls buildFaraidInput(), runs calculateInheritance(),
// sets { results, currentStep: 5, completedSteps: [..., 3, 4] }

// Direct state access outside React:
useWizardStore.getState().calculateShares()
useWizardStore.setState(partialState)
```

From src/core/json/importData.ts:
```typescript
export type ImportResult =
  | { success: true; state: WizardState; customHeirNames?: Record<string, string>; individualDistribution?: {...} | null }
  | { success: false; error: string }

// Line 362-365 currently sets:
// currentStep: 1,
// completedSteps: [],
```

From src/hooks/useJsonImport.ts:
```typescript
// confirmImport currently:
// 1. useWizardStore.setState(pendingState)
// 2. useDistributionStore.getState().resetDistribution()
// 3. setPendingState(null)
// 4. Shows success toast
// Missing: calculateShares() call to compute results + navigate to step 5
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix completedSteps in importData.ts and add calculateShares call in confirmImport</name>
  <files>src/core/json/importData.ts, src/hooks/useJsonImport.ts</files>
  <action>
Two changes:

1. In `src/core/json/importData.ts` line 365, change `completedSteps: []` to `completedSteps: [1, 2, 3, 4]`. This marks all data-entry steps as completed so the user can navigate back to any step via the step indicator after import.

2. In `src/hooks/useJsonImport.ts`, in the `confirmImport` callback (line 62-69), after `useWizardStore.setState(pendingState)` and `useDistributionStore.getState().resetDistribution()`, add a call to `useWizardStore.getState().calculateShares()`. This will:
   - Build FaraidInput from the imported state
   - Run the inheritance calculation engine
   - Set results on the store
   - Navigate to step 5 (results page)

The order in confirmImport should be:
```
useWizardStore.setState(pendingState)           // Apply imported data
useDistributionStore.getState().resetDistribution()  // Reset distribution
useWizardStore.getState().calculateShares()     // Compute results + navigate to step 5
setPendingState(null)
setToast({ message: 'Data imported successfully', type: 'success' })
```

Note: calculateShares() internally calls get() which will read the freshly-set pendingState, then sets currentStep:5 and adds steps 3,4 to completedSteps. Since we already set completedSteps:[1,2,3,4] in importData.ts, the final state will have all steps accessible.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/core/json/__tests__/importData.test.ts --reporter=verbose 2>&1 | tail -20</automated>
  </verify>
  <done>
    - importData.ts sets completedSteps: [1, 2, 3, 4] instead of []
    - confirmImport calls calculateShares() after setState, causing navigation to step 5 with computed results
    - Existing import tests still pass
  </done>
</task>

<task type="auto">
  <name>Task 2: Update import test to verify completedSteps includes all data steps</name>
  <files>src/core/json/__tests__/importData.test.ts</files>
  <action>
Find the existing test that asserts `completedSteps` behavior (likely checking for `[]`). Update it to expect `[1, 2, 3, 4]` instead.

If no existing test covers completedSteps, add a focused test:

```typescript
it('sets completedSteps to [1,2,3,4] for navigability after import', () => {
  const result = validateAndParseImport({
    relationship: 'father',
    sonCount: 2,
  })
  expect(result.success).toBe(true)
  if (result.success) {
    expect(result.state.completedSteps).toEqual([1, 2, 3, 4])
    expect(result.state.currentStep).toBe(1)
  }
})
```

Note: currentStep remains 1 in the parsed state because `confirmImport` in useJsonImport.ts handles navigation to step 5 via `calculateShares()`. The importData module only parses -- it does not navigate.

Also run `npx tsc --noEmit` to verify no TypeScript errors (previous quick fix 2 addressed TS errors in these files).
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/core/json/__tests__/importData.test.ts --reporter=verbose 2>&1 | tail -30 && npx tsc --noEmit 2>&1 | tail -10</automated>
  </verify>
  <done>
    - Test explicitly verifies completedSteps is [1, 2, 3, 4] after import parse
    - All existing import tests pass
    - TypeScript compilation succeeds with no errors
  </done>
</task>

</tasks>

<verification>
1. `npx vitest run src/core/json/__tests__/importData.test.ts` -- all import tests pass
2. `npx tsc --noEmit` -- no TypeScript errors
3. Manual: Import a JSON file, confirm import, verify app navigates to results page (step 5) with computed shares
</verification>

<success_criteria>
- JSON import + confirm navigates to step 5 (results) instead of step 1
- All wizard steps (1-4) are accessible via step indicator after import
- Inheritance shares are computed and displayed
- No TypeScript errors, all tests pass
</success_criteria>

<output>
After completion, create `.planning/quick/3-fix-json-import-not-applying-data-shows-/3-SUMMARY.md`
</output>
