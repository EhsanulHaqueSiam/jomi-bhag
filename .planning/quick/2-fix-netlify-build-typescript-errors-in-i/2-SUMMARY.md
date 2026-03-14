# Quick Task 2: Fix Netlify Build TypeScript Errors

## Changes

### src/core/json/importData.ts (line 208)
- **Error:** `TS2352` — `Record<string, unknown>` to `IndivisibleResolution | null` cast rejected
- **Fix:** Added intermediate `unknown` cast: `as unknown as MovableAsset['indivisibleResolution']`

### src/hooks/useJsonImport.ts (line 65)
- **Error:** `TS2769` — `setState(pendingState, true)` overload mismatch; `WizardState` missing action properties required by `WizardStore`
- **Fix:** Changed `setState(pendingState, true)` to `setState(pendingState)` — partial merge applies all state fields without requiring action functions

## Verification
- `tsc -b` passes with zero errors
- All 43 related tests pass (importData + hooks)
