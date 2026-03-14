---
phase: quick-5
plan: 01
subsystem: layout
tags: [responsive, kanban, desktop, width]
key-files:
  created: []
  modified:
    - src/components/layout/AppLayout.tsx
    - src/components/distribution/DistributionBoard.tsx
    - src/components/distribution/IndividualBoard.tsx
    - src/components/distribution/HeirColumn.tsx
    - src/components/distribution/IndividualColumn.tsx
decisions:
  - "isWide boolean determines page-aware layout via page prop (distribution|division = wide)"
  - "Wide pages remove card wrapper (border/shadow/bg) for kanban breathing room"
  - "Replaced inline style maxHeight with Tailwind max-h classes for responsive lg override"
metrics:
  duration: 1min
  completed: "2026-03-14T08:30:41Z"
---

# Quick Task 5: Make Distribution Page Wider on Desktop - Summary

Page-aware responsive AppLayout: distribution/division pages use max-w-5xl/7xl with no card wrapper, while wizard/scenarios retain narrow max-w-lg/xl centered card design. Kanban columns widened and body height increased to 600px on desktop.

## Tasks Completed

| # | Task | Commit | Key Changes |
|---|------|--------|-------------|
| 1 | Make AppLayout width page-aware | 5d45a7a | Conditional max-w and card wrapper based on `page` prop |
| 2 | Increase kanban column min-width and remove maxHeight cap | 635d8bb | Column min-widths +20px, body max-height 400->600px on lg |

## Changes Made

### AppLayout.tsx
- Added `isWide` const checking if page is `distribution` or `division`
- `<main>` element: wide pages get `md:max-w-5xl md:px-6 lg:max-w-7xl lg:px-8`, narrow pages keep `md:max-w-lg lg:max-w-xl`
- Inner `<div>`: wide pages get `p-0 md:p-4` (no border/shadow/bg), narrow pages keep full card styling
- All mobile classes (px-4, pb-32) unchanged

### DistributionBoard.tsx
- Column min-width on lg: 280px -> 300px

### IndividualBoard.tsx
- Column min-width on lg: 260px -> 280px

### HeirColumn.tsx
- Replaced `style={{ maxHeight: '400px' }}` with `max-h-[400px] lg:max-h-[600px]` Tailwind classes

### IndividualColumn.tsx
- Same maxHeight replacement as HeirColumn

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- TypeScript: `npx tsc --noEmit` passes with no errors
- Tests: All 708 tests pass (45 test files)
- DnD logic: untouched (only layout/sizing classes modified)
- Mobile layout: all non-prefixed classes remain identical

## Self-Check: PASSED
