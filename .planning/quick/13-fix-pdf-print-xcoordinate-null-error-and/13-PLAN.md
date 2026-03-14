---
phase: quick-13
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/hooks/usePdfExport.tsx
  - src/hooks/__tests__/usePdfExport.test.ts
  - src/components/results/SharePieChart.tsx
autonomous: true
requirements: [fix-xcoordinate-null, fix-pdf-tests]
must_haves:
  truths:
    - "PDF download completes without xCoordinate null error when charts are visible (detailed mode)"
    - "PDF download completes without error when charts are hidden (simple mode)"
    - "PDF print completes without error"
    - "All PDF-related tests pass (0 failures)"
  artifacts:
    - path: "src/hooks/usePdfExport.tsx"
      provides: "Robust chart capture with error isolation"
    - path: "src/hooks/__tests__/usePdfExport.test.ts"
      provides: "Fixed test expectations matching current hook behavior"
    - path: "src/components/results/SharePieChart.tsx"
      provides: "Chart component that renders safely during html-to-image capture"
  key_links:
    - from: "src/hooks/usePdfExport.tsx"
      to: "html-to-image"
      via: "captureCharts function"
      pattern: "toPng"
    - from: "src/components/results/SharePieChart.tsx"
      to: "recharts"
      via: "PieChart with Label"
      pattern: "Label.*content"
---

<objective>
Fix the PDF download/print crash caused by "can't access property 'xCoordinate', e is null" and fix all 3 failing usePdfExport tests.

Purpose: The xCoordinate null error originates from Recharts 3.x internal selector code (`selectors.js:51`) where `tooltipInteractionState` can be null when `html-to-image` captures the chart DOM. The Label component's custom `content` render prop inside PieChart may also contribute by accessing coordinate props that are null during non-interactive rendering. Additionally, 3 tests in `usePdfExport.test.ts` are failing due to stale test expectations that don't match the current hook behavior (the hook catches errors internally via try/catch rather than throwing, and uses iframe for print rather than window.open).

Output: Working PDF download/print with no runtime errors, all PDF tests green.
</objective>

<execution_context>
@/home/siam/.claude/get-shit-done/workflows/execute-plan.md
@/home/siam/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/hooks/usePdfExport.tsx
@src/hooks/__tests__/usePdfExport.test.ts
@src/components/results/SharePieChart.tsx
@src/components/results/MonetaryBarChart.tsx
@src/components/results/ResultsPage.tsx
@src/components/__tests__/pdf.test.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix xCoordinate null error in chart capture and harden captureCharts</name>
  <files>src/components/results/SharePieChart.tsx, src/hooks/usePdfExport.tsx</files>
  <action>
The xCoordinate null error comes from Recharts 3.x internal state selectors when the chart DOM is captured by html-to-image. The Recharts `Tooltip` component subscribes to `selectActiveCoordinate` which accesses `tooltipInteractionState.coordinate` without null-checking (recharts/es6/state/selectors/selectors.js:51). During html-to-image capture, this state can be null.

**Fix 1 - SharePieChart.tsx:**
The `Label` component inside `Pie` uses a custom `content` render function that returns an SVG `<text>` element. This receives coordinate props from Recharts that can be null during capture. Replace the `Label` component's `content` prop with a simpler approach: remove the `<Label>` entirely. The center label is already rendered via CSS overlay (lines 47-51: the `pointer-events-none absolute inset-0 flex items-center justify-center` div). The SVG `<Label>` is redundant and is the likely source of the coordinate null error during capture. Delete lines 63-76 (the `<Label>` component inside `<Pie>`).

**Fix 2 - usePdfExport.tsx captureCharts:**
The current try/catch in `captureCharts` should already handle errors, but add individual try/catch per chart capture to ensure one chart failure doesn't prevent the other from being captured. Also add a small safety check: if the chart element exists but has zero dimensions (not yet laid out by ResponsiveContainer), skip capture for that element.

Update `captureCharts` to:
```typescript
async function captureCharts(): Promise<{
  pieChartImage: string | null
  barChartImage: string | null
}> {
  let pieChartImage: string | null = null
  let barChartImage: string | null = null

  try {
    const { toPng } = await import('html-to-image')

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
  } catch {
    // html-to-image import failure is non-critical
  }

  return { pieChartImage, barChartImage }
}
```

This ensures: (1) zero-dimension elements are skipped, (2) one chart failure doesn't block the other, (3) the overall PDF still generates even if all chart captures fail.
  </action>
  <verify>
    <automated>npx vitest run src/components/__tests__/pdf.test.tsx src/components/__tests__/pdf-distribution.test.tsx src/components/__tests__/pdf-individual.test.tsx --reporter=verbose 2>&1 | tail -20</automated>
  </verify>
  <done>SharePieChart no longer renders redundant Label with coordinate props. captureCharts isolates each chart capture independently with dimension checks. All existing pdf.test.tsx, pdf-distribution.test.tsx, pdf-individual.test.tsx tests still pass.</done>
</task>

<task type="auto">
  <name>Task 2: Fix 3 failing usePdfExport tests to match current hook behavior</name>
  <files>src/hooks/__tests__/usePdfExport.test.ts</files>
  <action>
Three tests are failing because they were written for an older version of the hook:

**Test 1: "downloadPdf creates anchor, clicks, and revokes URL"** - Fails because `revokeObjectURL` is called inside a `setTimeout(100ms)` callback. The test doesn't advance timers. Fix: use `vi.useFakeTimers()` and `vi.advanceTimersByTime(200)` after the downloadPdf call, then assert. Also need to ensure the `document.createElement` spy properly returns an element with a working `click`. The test currently spies on `document.createElement` with `mockImplementation` which may interfere. Simplify: instead of spying on createElement, spy on `HTMLAnchorElement.prototype.click` directly.

**Test 2: "throws when no results in store"** - Fails because `downloadPdf` does NOT throw -- it catches the error internally and sets `result.current.error`. The test expects a thrown error but the hook wraps in try/catch and calls `setError()`. Fix: remove the try/catch in the test, call `downloadPdf()`, then assert `result.current.error` contains "No results to export" instead of checking for a thrown error.

**Test 3: "printPdf calls window.open with blob URL"** - Fails because `printPdf` now uses an iframe approach, NOT `window.open`. The iframe's `onload` calls `iframe.contentWindow?.print()`, and only falls back to `window.open` if that fails. In jsdom, `iframe.onload` doesn't fire for blob URLs. Fix: Rewrite test to verify the iframe is created and appended to document.body. Check `document.querySelector('iframe[src="blob:print-url"]')` exists after calling printPdf.

Rewrite all three tests:

```typescript
describe('usePdfExport', () => {
  it('downloadPdf creates anchor, clicks, and revokes URL', async () => {
    vi.useFakeTimers()
    useWizardStore.setState({
      results: makeFaraidOutput(),
      properties: [],
      movableAssets: [],
      totalEstateValue: 1000000,
    })

    const createObjectURL = vi.fn(() => 'blob:pdf-url')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, writable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, writable: true })

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const { usePdfExport } = await import('@/hooks/usePdfExport')
    const { result } = renderHook(() => usePdfExport())

    await act(async () => {
      await result.current.downloadPdf()
    })

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()

    // revokeObjectURL is called in setTimeout(100ms)
    vi.advanceTimersByTime(200)
    expect(revokeObjectURL).toHaveBeenCalled()

    clickSpy.mockRestore()
    vi.useRealTimers()
  })

  it('sets error when no results in store', async () => {
    useWizardStore.setState({ results: null })

    const { usePdfExport } = await import('@/hooks/usePdfExport')
    const { result } = renderHook(() => usePdfExport())

    await act(async () => {
      await result.current.downloadPdf()
    })

    expect(result.current.error).toContain('No results to export')
  })

  it('printPdf creates iframe with blob URL', async () => {
    useWizardStore.setState({
      results: makeFaraidOutput(),
      properties: [],
      movableAssets: [],
      totalEstateValue: 0,
    })

    const createObjectURL = vi.fn(() => 'blob:print-url')
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, writable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true })

    const { usePdfExport } = await import('@/hooks/usePdfExport')
    const { result } = renderHook(() => usePdfExport())

    await act(async () => {
      await result.current.printPdf()
    })

    expect(createObjectURL).toHaveBeenCalled()
    // printPdf creates a hidden iframe with the blob URL
    const iframe = document.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.src).toBe('blob:print-url')
  })

  // Keep existing passing tests as-is
})
```

Important: Each test uses a fresh `await import('@/hooks/usePdfExport')` due to the vi.mock hoisting pattern already in the test file. Keep this pattern. Also ensure `beforeEach` still calls `vi.restoreAllMocks()` and resets `mockToBlob`.
  </action>
  <verify>
    <automated>npx vitest run src/hooks/__tests__/usePdfExport.test.ts --reporter=verbose 2>&1 | tail -20</automated>
  </verify>
  <done>All 5 usePdfExport tests pass (3 fixed + 2 already passing). Test expectations accurately reflect current hook behavior: downloadPdf uses anchor+setTimeout cleanup, errors are caught internally and set via setError (not thrown), printPdf uses iframe (not window.open).</done>
</task>

<task type="auto">
  <name>Task 3: Run full test suite to confirm zero regressions</name>
  <files></files>
  <action>
Run the complete test suite to verify:
1. All 728+ tests pass (previously 725 passed, 3 failed)
2. No new failures introduced
3. All PDF-related test files pass: pdf.test.tsx, pdf-distribution.test.tsx, pdf-individual.test.tsx, usePdfExport.test.ts

Run: `npx vitest run --reporter=verbose 2>&1 | tail -5`

If any non-PDF tests regress, investigate. The changes are scoped to SharePieChart (removing redundant Label), usePdfExport (hardening captureCharts), and test file fixes, so regressions are unlikely.

Also run TypeScript check: `npx tsc --noEmit 2>&1 | tail -10`
  </action>
  <verify>
    <automated>npx vitest run 2>&1 | tail -5 && npx tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <done>Full test suite passes with 0 failures. TypeScript compiles with no errors. The xCoordinate null error is eliminated by removing the redundant Label render prop and hardening chart capture isolation.</done>
</task>

</tasks>

<verification>
- `npx vitest run` shows 0 failures across all test files
- `npx tsc --noEmit` shows no type errors
- PDF download works in browser (charts captured when in detailed mode, gracefully skipped in simple mode)
</verification>

<success_criteria>
- The xCoordinate null error is fixed by removing the redundant Recharts Label component that uses coordinate props
- Chart capture is hardened with per-chart error isolation and dimension checks
- All 3 previously failing usePdfExport tests are fixed to match current hook behavior
- Full test suite passes with 0 failures
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/13-fix-pdf-print-xcoordinate-null-error-and/13-SUMMARY.md`
</output>
