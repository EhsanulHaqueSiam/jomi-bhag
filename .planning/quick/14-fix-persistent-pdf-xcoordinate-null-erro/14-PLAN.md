---
phase: quick-14
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/hooks/usePdfExport.tsx
  - src/hooks/__tests__/usePdfExport.test.ts
autonomous: true
requirements: [fix-pdf-xcoordinate-null-persistent]

must_haves:
  truths:
    - "PDF download completes without xCoordinate null error when charts contain Recharts Tooltip components"
    - "PDF print completes without xCoordinate null error when charts contain Recharts Tooltip components"
    - "Interactive chart tooltips still function normally in the browser UI"
  artifacts:
    - path: "src/hooks/usePdfExport.tsx"
      provides: "Chart capture with Recharts tooltip exclusion filter"
      contains: "recharts-tooltip-wrapper"
  key_links:
    - from: "src/hooks/usePdfExport.tsx"
      to: "html-to-image toPng"
      via: "filter option excluding recharts-tooltip-wrapper nodes"
      pattern: "filter.*recharts-tooltip-wrapper"
---

<objective>
Fix the persistent PDF xCoordinate null error that survived quick-13's fix. The root cause: Recharts `<Tooltip>` components in SharePieChart.tsx (line 63) and MonetaryBarChart.tsx (line 59) render tooltip wrapper DOM nodes. When `html-to-image`'s `toPng()` clones these nodes, Recharts' internal code accesses `tooltipInteractionState.coordinate.xCoordinate` which is null (no mouse interaction during capture), causing a crash.

Purpose: Eliminate the last PDF export crash path without removing tooltips from the interactive UI.
Output: Crash-free PDF chart capture that filters out Recharts tooltip wrappers during DOM snapshot.
</objective>

<execution_context>
@/home/siam/.claude/get-shit-done/workflows/execute-plan.md
@/home/siam/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/hooks/usePdfExport.tsx
@src/hooks/__tests__/usePdfExport.test.ts
@src/components/results/SharePieChart.tsx
@src/components/results/MonetaryBarChart.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add filter option to toPng calls to exclude Recharts tooltip wrappers</name>
  <files>src/hooks/usePdfExport.tsx</files>
  <action>
In `captureCharts()` (lines 11-43 of usePdfExport.tsx), add a `filter` option to both `toPng()` calls (line 24 for pieEl, line 33 for barEl). The filter function excludes DOM nodes that are Recharts tooltip wrappers.

The `html-to-image` filter signature is `filter?: (domNode: HTMLElement) => boolean` where returning `true` keeps the node and `false` excludes it. The Recharts tooltip wrapper has class `recharts-tooltip-wrapper`.

Implementation:
1. Define a reusable filter function above or inside `captureCharts`:
   ```typescript
   const filterRechartsTooltips = (node: HTMLElement): boolean => {
     // Exclude Recharts tooltip wrapper nodes -- their internal code accesses
     // coordinate state that is null during non-interactive capture, causing crashes
     return !node.classList?.contains('recharts-tooltip-wrapper')
   }
   ```
2. Pass `filter: filterRechartsTooltips` in the options object to both `toPng()` calls alongside existing `pixelRatio: 2` and `backgroundColor: '#ffffff'`.

Do NOT modify SharePieChart.tsx or MonetaryBarChart.tsx -- the Tooltip components must remain for interactive UI use. The fix is purely in the capture layer.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/hooks/__tests__/usePdfExport.test.ts --reporter=verbose 2>&1 | tail -20</automated>
  </verify>
  <done>Both toPng calls in captureCharts include filter option that excludes recharts-tooltip-wrapper nodes. Existing tests still pass.</done>
</task>

<task type="auto">
  <name>Task 2: Add test verifying tooltip filter is passed to toPng</name>
  <files>src/hooks/__tests__/usePdfExport.test.ts</files>
  <action>
Add a test case to the existing usePdfExport test suite that verifies the `toPng` calls include the `filter` option and that the filter correctly excludes Recharts tooltip wrapper elements.

Test: "toPng is called with filter that excludes recharts-tooltip-wrapper"
1. Set up store state with valid results (use existing `makeFaraidOutput()` helper)
2. Create two DOM elements with ids `pdf-pie-chart` and `pdf-bar-chart`, set their offsetHeight > 0 (use Object.defineProperty), and append to document.body
3. Import the mock for `toPng` from `html-to-image` and access it via `vi.mocked()`
4. Call `downloadPdf()` (which internally calls `captureCharts()`)
5. Assert that `toPng` was called and the second argument (options) includes a `filter` function
6. Create a mock HTMLElement with `classList.contains` that returns true for `'recharts-tooltip-wrapper'` and verify `filter(mockElement)` returns `false`
7. Create a mock HTMLElement with `classList.contains` that returns false for `'recharts-tooltip-wrapper'` and verify `filter(mockElement)` returns `true`
8. Clean up the DOM elements

This ensures the filter is wired in and functions correctly.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/hooks/__tests__/usePdfExport.test.ts --reporter=verbose 2>&1 | tail -25</automated>
  </verify>
  <done>New test passes, confirming toPng receives filter option that excludes recharts-tooltip-wrapper nodes and includes all other nodes. Full usePdfExport test suite green.</done>
</task>

</tasks>

<verification>
Run full test suite to confirm no regressions:
```bash
cd /home/siam/Personal/jomi-bhag && npx vitest run 2>&1 | tail -5
```

Verify TypeScript compiles cleanly:
```bash
cd /home/siam/Personal/jomi-bhag && npx tsc --noEmit 2>&1 | tail -5
```
</verification>

<success_criteria>
- toPng calls in captureCharts include filter option excluding recharts-tooltip-wrapper
- New test validates filter behavior (excludes tooltip wrappers, includes other nodes)
- All existing usePdfExport tests pass
- Full test suite passes with 0 failures
- No TypeScript errors
- SharePieChart and MonetaryBarChart Tooltip components remain untouched for interactive use
</success_criteria>

<output>
After completion, create `.planning/quick/14-fix-persistent-pdf-xcoordinate-null-erro/14-SUMMARY.md`
</output>
