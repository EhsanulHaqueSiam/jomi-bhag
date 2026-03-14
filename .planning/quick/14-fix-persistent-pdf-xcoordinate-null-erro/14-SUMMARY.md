---
phase: quick-14
plan: 1
subsystem: pdf-export
tags: [pdf, recharts, tooltip, html-to-image, bug-fix]
dependency_graph:
  requires: [html-to-image, recharts]
  provides: [crash-free-pdf-chart-capture]
  affects: [usePdfExport]
tech_stack:
  patterns: [dom-node-filter, recharts-tooltip-exclusion]
key_files:
  modified:
    - src/hooks/usePdfExport.tsx
    - src/hooks/__tests__/usePdfExport.test.ts
decisions:
  - "Filter recharts-tooltip-wrapper at capture layer (not chart component layer) to preserve interactive tooltips"
metrics:
  duration: 1min
  completed: "2026-03-14T15:13:02Z"
  tasks_completed: 2
  tasks_total: 2
  test_count: 729
  test_pass: 729
---

# Quick Task 14: Fix Persistent PDF xCoordinate Null Error - Summary

Filter Recharts tooltip wrapper DOM nodes during html-to-image capture to prevent xCoordinate null crash in PDF export.

## What Was Done

### Task 1: Add filter option to toPng calls (44978e7)

Added a `filterRechartsTooltips` function inside `captureCharts()` that excludes DOM nodes with the `recharts-tooltip-wrapper` class. The function is passed as the `filter` option to both `toPng()` calls (pie chart and bar chart). This prevents Recharts internal code from accessing `tooltipInteractionState.coordinate.xCoordinate` (which is null during non-interactive capture) when html-to-image clones the DOM tree.

**Files modified:** `src/hooks/usePdfExport.tsx`

### Task 2: Add test verifying tooltip filter (8ddc60c)

Added a test case that creates mock chart DOM elements, triggers `downloadPdf()`, then inspects the `toPng` mock call arguments to verify:
- The `filter` option is present in the options object
- A node with class `recharts-tooltip-wrapper` is excluded (filter returns `false`)
- A node without that class is included (filter returns `true`)

**Files modified:** `src/hooks/__tests__/usePdfExport.test.ts`

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- usePdfExport test suite: 6/6 passed (5 existing + 1 new)
- Full test suite: 729/729 passed across 45 test files
- TypeScript: zero errors
- SharePieChart.tsx and MonetaryBarChart.tsx: untouched (Tooltip components preserved for interactive UI)

## Self-Check: PASSED
