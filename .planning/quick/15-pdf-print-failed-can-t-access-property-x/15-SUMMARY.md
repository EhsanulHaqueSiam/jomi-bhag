---
phase: quick-15
plan: 1
subsystem: pdf-export
tags: [pdf, recharts, tooltip, dom-manipulation, bugfix]
dependency_graph:
  requires: [html-to-image, recharts]
  provides: [crash-free-pdf-chart-capture]
  affects: [usePdfExport]
tech_stack:
  added: []
  patterns: [dom-removal-restoration-for-capture]
key_files:
  created: []
  modified:
    - src/hooks/usePdfExport.tsx
    - src/hooks/__tests__/usePdfExport.test.ts
decisions:
  - DOM-level tooltip removal before html-to-image capture (replaces toPng filter approach)
metrics:
  duration: 2min
  completed: "2026-03-14T19:13:35Z"
---

# Quick Task 15: PDF Print xCoordinate Null Fix (DOM-Level Tooltip Removal)

DOM-level removal of Recharts tooltip nodes before html-to-image capture, replacing insufficient toPng filter approach that failed because Recharts 3.x Redux selectors run during DOM cloning before filters apply.

## What Changed

### Task 1: Replace toPng filter with DOM-level tooltip removal (5fc6338)

- Removed `filterRechartsTooltips` function entirely
- Removed `filter` option from both `toPng()` calls
- Added pre-capture DOM removal: `querySelectorAll('.recharts-tooltip-wrapper, .recharts-tooltip-cursor')` on both chart containers
- Stores removed nodes with parent/nextSibling references for precise restoration
- Restores all tooltip nodes in a `finally` block, guaranteeing DOM restoration even if toPng throws
- This is definitive because tooltip elements are removed BEFORE html-to-image touches the DOM, so Recharts Redux selectors have no tooltip nodes to crash on during cloning

### Task 2: Update test for DOM-level verification (54de9ad)

- Replaced filter-based test with DOM manipulation verification test
- Test creates a chart container with `.recharts-tooltip-wrapper` child node
- Mocks `toPng` to check if tooltip is present during capture (it should not be)
- Verifies three behaviors:
  1. Tooltip wrapper absent during toPng execution (`tooltipPresentDuringCapture === false`)
  2. Tooltip wrapper restored after capture (`querySelector` finds it again)
  3. No `filter` option passed to toPng (old approach fully removed)

## Fix History (This is Attempt 3)

| Attempt | Quick Task | Approach | Why It Failed |
|---------|-----------|----------|---------------|
| 1 | quick-13 | Remove SVG Label, per-chart try/catch, dimension checks | Label removal didn't address tooltip; try/catch masked but didn't fix |
| 2 | quick-14 | toPng filter option excluding recharts-tooltip-wrapper | Recharts 3.x Redux selectors run during DOM cloning BEFORE filter applies |
| 3 | quick-15 | DOM-level removal before capture, restore after | Definitive -- no tooltip nodes exist when html-to-image runs |

## Verification Results

- usePdfExport tests: 6/6 passed
- Full test suite: 729/729 passed
- TypeScript: zero errors (`tsc --noEmit` clean)

## Deviations from Plan

None -- plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 5fc6338 | fix(quick-15): replace toPng filter with DOM-level tooltip removal |
| 2 | 54de9ad | test(quick-15): verify DOM-level tooltip removal instead of filter option |

## Self-Check: PASSED

- [x] src/hooks/usePdfExport.tsx exists
- [x] src/hooks/__tests__/usePdfExport.test.ts exists
- [x] 15-SUMMARY.md exists
- [x] Commit 5fc6338 exists
- [x] Commit 54de9ad exists
