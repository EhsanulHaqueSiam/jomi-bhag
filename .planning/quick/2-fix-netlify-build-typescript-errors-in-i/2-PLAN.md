---
phase: quick-fix
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - src/core/json/importData.ts
  - src/hooks/useJsonImport.ts
autonomous: true
requirements: [BUILD-FIX]
---

<objective>
Fix two TypeScript compilation errors breaking the Netlify production build.

Error 1: importData.ts:208 — TS2352 type assertion through Record<string, unknown>
Error 2: useJsonImport.ts:65 — TS2769 Zustand setState overload mismatch
</objective>

<tasks>
<task type="auto">
  <name>Fix TypeScript compilation errors</name>
  <files>src/core/json/importData.ts, src/hooks/useJsonImport.ts</files>
  <action>
    1. importData.ts:208 — add intermediate `unknown` cast
    2. useJsonImport.ts:65 — use partial setState instead of replace
  </action>
  <verify>tsc -b passes, related tests pass</verify>
  <done>Both errors resolved, build succeeds</done>
</task>
</tasks>
