---
phase: 08-persistence-and-scenarios
plan: 02
subsystem: ui
tags: [react, zustand, scenarios, comparison, navigation, tailwindcss]

# Dependency graph
requires:
  - phase: 08-persistence-and-scenarios
    provides: scenariosStore CRUD, fractionStorage, Scenario/AppPage types, wizardStore persist
  - phase: 02-wizard-and-layout
    provides: WizardShell, AppLayout, Button component
  - phase: 03-results-ui
    provides: ResultsPage, HeirCard BDT formatting, AdjustmentBanner amber/blue pattern
provides:
  - ScenariosPage with full scenario list, save/load/duplicate/delete/rename/clear-all
  - ScenarioCard with inline rename, delete confirmation, adjustment badges
  - ComparisonView with side-by-side heir shares and amber diff highlighting
  - EmptyState component for zero-scenarios state
  - App-level page routing between wizard and scenarios
  - AppLayout with desktop nav tabs and mobile bottom navigation bar
affects: [pdf-export, land-lot-division, movable-assets]

# Tech tracking
tech-stack:
  added: []
  patterns: [page-level-routing, mobile-bottom-nav, inline-rename, delete-confirmation, comparison-diff-highlighting]

key-files:
  created:
    - src/components/scenarios/ScenariosPage.tsx
    - src/components/scenarios/ScenarioCard.tsx
    - src/components/scenarios/ComparisonView.tsx
    - src/components/scenarios/EmptyState.tsx
    - src/components/__tests__/scenarios.test.tsx
  modified:
    - src/App.tsx
    - src/components/layout/AppLayout.tsx

key-decisions:
  - "App uses useState<AppPage> for page routing (no router library needed for 2 pages)"
  - "AppLayout accepts page and onNavigate props for navigation state"
  - "Mobile bottom nav uses fixed z-50 bar with calculator and folder icons"
  - "ComparisonView builds unified heir list from union of both scenarios' shares"
  - "Diff highlighting uses data-diff attribute and bg-amber-50 for testability"
  - "ScenarioCard inline rename via input toggle with blur-to-save and Escape-to-cancel"

patterns-established:
  - "page-level routing: AppPage state in App.tsx drives conditional rendering"
  - "mobile bottom nav: fixed bottom-0 z-50 bar with icon + label buttons"
  - "inline rename: click -> input, blur/Enter saves, Escape cancels"
  - "delete confirmation: inline confirm/cancel replacing action buttons"
  - "comparison diff: data-diff attribute on rows for testable highlighting"

requirements-completed: [PRST-01, PRST-02, PRST-03]

# Metrics
duration: 5min
completed: 2026-03-13
---

# Phase 08 Plan 02: Scenarios UI Summary

**Scenarios page with navigation, compact CRUD cards, inline rename, side-by-side comparison view with amber diff highlighting, and mobile bottom nav**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-13T09:26:13Z
- **Completed:** 2026-03-13T09:31:33Z
- **Tasks:** 2 (+ 1 auto-approved checkpoint)
- **Files modified:** 7

## Accomplishments
- Full "My Scenarios" page with save/load/duplicate/delete/rename/clear-all operations
- App-level navigation between Calculator and My Scenarios via desktop tabs and mobile bottom bar
- ScenarioCard with inline rename, date, heir summary, BDT value, adjustment badges, and delete confirmation
- ComparisonView with unified heir list, side-by-side shares table (desktop) and stacked cards (mobile), amber diff highlighting
- EmptyState component for zero-scenarios with folder icon and new calculation CTA
- 13 new component tests covering all scenarios UI functionality
- All 431 tests pass, TypeScript clean

## Task Commits

Each task was committed atomically:

1. **Task 1: App routing, AppLayout navigation, ScenariosPage, ScenarioCard, EmptyState** - `563635d` (feat)
2. **Task 2: ComparisonView with side-by-side layout and diff highlighting + tests** - `cfa5310` (feat)

## Files Created/Modified
- `src/components/scenarios/ScenariosPage.tsx` - Main scenarios list with save/load/compare controls and unsaved changes warning
- `src/components/scenarios/ScenarioCard.tsx` - Compact card with inline rename, delete confirmation, adjustment badges
- `src/components/scenarios/ComparisonView.tsx` - Side-by-side heir shares comparison with amber diff highlighting
- `src/components/scenarios/EmptyState.tsx` - Empty state with folder icon and new calculation button
- `src/components/__tests__/scenarios.test.tsx` - 13 tests for page, card, and comparison components
- `src/App.tsx` - Added AppPage state, AnimatePresence page transitions, conditional rendering
- `src/components/layout/AppLayout.tsx` - Added page/onNavigate props, desktop nav tabs, mobile bottom nav bar

## Decisions Made
- Used `useState<AppPage>` for page routing instead of a router library (only 2 pages, no URL needed)
- AppLayout receives page and onNavigate as props (lifted state in App.tsx)
- Mobile bottom nav uses `fixed bottom-0 z-50` with inline SVG icons for calculator and folder
- ComparisonView builds union of heir types from both scenarios for complete comparison
- Diff rows use `data-diff="true"` attribute for both visual styling (bg-amber-50) and test querying
- ScenarioCard inline rename uses input toggle with blur-to-save and Escape-to-cancel pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full persistence and scenarios system complete (Plans 01 + 02)
- All scenario CRUD operations work through localStorage
- Comparison view ready for visual verification
- Nav structure supports future pages if needed

---
*Phase: 08-persistence-and-scenarios*
*Completed: 2026-03-13*
