---
phase: quick-15
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/hooks/usePdfExport.tsx
  - src/hooks/__tests__/usePdfExport.test.ts
autonomous: true
requirements: [fix-xcoordinate-null-pdf-crash]

must_haves:
  truths:
    - "PDF download completes without xCoordinate null error"
    - "PDF print completes without xCoordinate null error"
    - "Charts in the generated PDF contain valid chart images (not blank)"
    - "Interactive tooltips still work in the browser UI"
  artifacts:
    - path: "src/hooks/usePdfExport.tsx"
      provides: "captureCharts with DOM-level tooltip removal before toPng"
    - path: "src/hooks/__tests__/usePdfExport.test.ts"
      provides: "Test verifying tooltip DOM nodes are removed before capture"
  key_links:
    - from: "src/hooks/usePdfExport.tsx"
      to: "html-to-image toPng"
      via: "DOM manipulation before/after capture"
      pattern: "querySelectorAll.*recharts-tooltip"
---

<objective>
Definitively fix the recurring PDF xCoordinate null crash by removing Recharts tooltip DOM elements from the live DOM before html-to-image capture and restoring them after.

Purpose: This is the THIRD attempt to fix this error (quick-13 and quick-14 failed). Previous approaches (removing SVG Label, per-chart try/catch, toPng filter option) are insufficient because Recharts 3.x internally uses Redux selectors that access tooltipInteractionState.coordinate during React reconciliation in the cloned DOM -- before the html-to-image filter callback can exclude them. The definitive fix removes tooltip nodes from the DOM entirely before toPng runs, eliminating the crash at its source.

Output: Crash-free PDF export with chart images intact.
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

Prior fix history (context only, do not re-read):
- quick-13: Removed redundant SVG Label, added per-chart try/catch and dimension checks
- quick-14: Added filter option to toPng excluding recharts-tooltip-wrapper class nodes
- Both fixes were insufficient -- the error persists because Recharts 3.x Redux selectors
  run during DOM cloning before filters apply
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace toPng filter with DOM-level tooltip removal in captureCharts</name>
  <files>src/hooks/usePdfExport.tsx</files>
  <action>
In `captureCharts()` in `src/hooks/usePdfExport.tsx`, replace the current `filterRechartsTooltips` approach with direct DOM manipulation:

1. REMOVE the `filterRechartsTooltips` function entirely (lines 20-22).

2. REMOVE the `filter: filterRechartsTooltips` option from both `toPng()` calls (lines 30, 39).

3. BEFORE the toPng calls (after the `toPng` import, before the pieEl lookup), add DOM removal logic:
   - Query ALL `.recharts-tooltip-wrapper` elements inside `#pdf-pie-chart` and `#pdf-bar-chart`
   - For each, remove from DOM and store in an array with their parentNode and nextSibling for restoration
   - Also query and hide any `.recharts-tooltip-cursor` elements (set display:none, store original)

4. AFTER BOTH toPng try/catch blocks (before the return statement), add restoration logic:
   - Re-insert each removed tooltip wrapper at its original position using parentNode.insertBefore(node, nextSibling)
   - Restore display on cursor elements

5. Wrap the entire capture+restore in a try/finally to guarantee DOM restoration even if toPng throws.

The function should look like:

```typescript
async function captureCharts(): Promise<{ pieChartImage: string | null; barChartImage: string | null }> {
  let pieChartImage: string | null = null
  let barChartImage: string | null = null

  try {
    const { toPng } = await import('html-to-image')

    // Remove tooltip DOM nodes before capture to prevent Recharts Redux
    // selectors from accessing null tooltipInteractionState during cloning
    const removedNodes: Array<{ node: Element; parent: Node; next: Node | null }> = []
    const chartContainers = ['pdf-pie-chart', 'pdf-bar-chart']
    for (const id of chartContainers) {
      const container = document.getElementById(id)
      if (!container) continue
      container.querySelectorAll('.recharts-tooltip-wrapper, .recharts-tooltip-cursor').forEach((node) => {
        if (node.parentNode) {
          removedNodes.push({ node, parent: node.parentNode, next: node.nextSibling })
          node.parentNode.removeChild(node)
        }
      })
    }

    try {
      const pieEl = document.getElementById('pdf-pie-chart')
      if (pieEl && pieEl.offsetHeight > 0) {
        try {
          pieChartImage = await toPng(pieEl, { pixelRatio: 2, backgroundColor: '#ffffff' })
        } catch {
          // Individual chart capture failure is non-critical
        }
      }

      const barEl = document.getElementById('pdf-bar-chart')
      if (barEl && barEl.offsetHeight > 0) {
        try {
          barChartImage = await toPng(barEl, { pixelRatio: 2, backgroundColor: '#ffffff' })
        } catch {
          // Individual chart capture failure is non-critical
        }
      }
    } finally {
      // Restore tooltip DOM nodes so interactive tooltips continue working
      for (const { node, parent, next } of removedNodes) {
        try {
          parent.insertBefore(node, next)
        } catch {
          // If parent was also removed or DOM changed, skip silently
        }
      }
    }
  } catch {
    // html-to-image import failure is non-critical
  }

  return { pieChartImage, barChartImage }
}
```

This approach is definitive because it removes the tooltip elements BEFORE html-to-image ever touches the DOM, so Recharts selectors have nothing to run against in the cloned tree.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/hooks/__tests__/usePdfExport.test.ts --reporter=verbose 2>&1 | tail -30</automated>
  </verify>
  <done>captureCharts removes tooltip DOM nodes before toPng and restores them after; no filterRechartsTooltips function; no filter option in toPng calls; existing tests pass</done>
</task>

<task type="auto">
  <name>Task 2: Update test to verify DOM-level tooltip removal instead of filter option</name>
  <files>src/hooks/__tests__/usePdfExport.test.ts</files>
  <action>
Replace the existing test "toPng is called with filter that excludes recharts-tooltip-wrapper" (lines 177-231) with a new test that verifies the DOM-level removal approach:

```typescript
it('removes recharts-tooltip-wrapper nodes from DOM before toPng and restores after', async () => {
  useWizardStore.setState({
    results: makeFaraidOutput(),
    properties: [],
    movableAssets: [],
    totalEstateValue: 1000000,
  })

  Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:x'), writable: true })
  Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

  // Create chart container with a tooltip wrapper child
  const pieEl = document.createElement('div')
  pieEl.id = 'pdf-pie-chart'
  Object.defineProperty(pieEl, 'offsetHeight', { value: 100 })

  const tooltipWrapper = document.createElement('div')
  tooltipWrapper.classList.add('recharts-tooltip-wrapper')
  pieEl.appendChild(tooltipWrapper)

  const normalChild = document.createElement('div')
  normalChild.classList.add('recharts-pie')
  pieEl.appendChild(normalChild)

  document.body.appendChild(pieEl)

  const { toPng } = await import('html-to-image')
  const mockedToPng = vi.mocked(toPng)

  // Track whether tooltip is present during toPng call
  let tooltipPresentDuringCapture = true
  mockedToPng.mockImplementation(async (el) => {
    const container = el as HTMLElement
    tooltipPresentDuringCapture = container.querySelector('.recharts-tooltip-wrapper') !== null
    return 'data:image/png;base64,mockbase64'
  })

  const { usePdfExport } = await import('@/hooks/usePdfExport')
  const { result } = renderHook(() => usePdfExport())

  await act(async () => {
    await result.current.downloadPdf()
  })

  // Tooltip wrapper should NOT be in DOM during toPng execution
  expect(tooltipPresentDuringCapture).toBe(false)

  // Tooltip wrapper should be RESTORED after capture completes
  expect(pieEl.querySelector('.recharts-tooltip-wrapper')).not.toBeNull()

  // toPng should NOT have a filter option (old approach removed)
  const firstCallOptions = mockedToPng.mock.calls[0]?.[1] as Record<string, unknown> | undefined
  expect(firstCallOptions?.filter).toBeUndefined()

  // Clean up DOM
  document.body.removeChild(pieEl)
})
```

This test verifies three critical behaviors:
1. Tooltip wrapper is removed from DOM during toPng (tooltipPresentDuringCapture === false)
2. Tooltip wrapper is restored after capture (querySelector finds it again)
3. No filter option is passed to toPng (old approach fully removed)
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/hooks/__tests__/usePdfExport.test.ts --reporter=verbose 2>&1 | tail -30</automated>
  </verify>
  <done>Test verifies tooltip DOM nodes are removed before capture and restored after; old filter test replaced; all usePdfExport tests pass (6/6); full test suite passes (729+)</done>
</task>

</tasks>

<verification>
1. `npx vitest run src/hooks/__tests__/usePdfExport.test.ts` -- all 6 tests pass
2. `npx vitest run` -- full suite passes (729+ tests)
3. `npx tsc --noEmit` -- zero TypeScript errors
4. Manual: Open app, calculate shares, click Download PDF -- no console error, PDF has chart images
</verification>

<success_criteria>
- captureCharts uses DOM removal/restoration instead of toPng filter option
- filterRechartsTooltips function removed entirely
- Tooltip nodes removed before toPng, restored in finally block
- Test proves tooltip absent during capture and restored after
- All existing tests pass with no regressions
</success_criteria>

<output>
After completion, create `.planning/quick/15-pdf-print-failed-can-t-access-property-x/15-SUMMARY.md`
</output>
