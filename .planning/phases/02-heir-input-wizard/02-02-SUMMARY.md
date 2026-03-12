---
phase: 02-heir-input-wizard
plan: 02
subsystem: ui
tags: [react, tailwindcss, motion, wizard, responsive, animation, step-indicator]

# Dependency graph
requires:
  - phase: 02-heir-input-wizard
    provides: "useWizardStore Zustand store, WIZARD_STEPS, WizardStep types from Plan 01"
provides:
  - "StepperButton reusable [ - ] count [ + ] control with min/max enforcement"
  - "StepIndicator connected-dots progress bar with clickable completed steps"
  - "Tooltip (?) icon with hover/tap popover and accessibility"
  - "Button with primary/secondary/ghost variants and emerald styling"
  - "AppLayout centered card container with branding header and Islamic geometric pattern"
  - "WizardShell with AnimatePresence direction-aware step transitions and responsive navigation"
  - "steps.ts canonical re-export of WIZARD_STEPS for wizard directory"
affects: [02-03-PLAN, 03-results-display]

# Tech tracking
tech-stack:
  added: []
  patterns: [motion-animate-presence-wizard, responsive-fixed-bottom-nav, svg-background-pattern, tooltip-click-outside-close]

key-files:
  created:
    - src/components/ui/StepperButton.tsx
    - src/components/ui/StepIndicator.tsx
    - src/components/ui/Tooltip.tsx
    - src/components/ui/Button.tsx
    - src/components/layout/AppLayout.tsx
    - src/components/wizard/WizardShell.tsx
    - src/components/wizard/steps.ts
  modified: []

key-decisions:
  - "Tooltip uses useState + click-outside listener pattern (no external positioning library)"
  - "StepIndicator reads directly from useWizardStore (no props), per anti-pattern guidance"
  - "AppLayout uses inline SVG data URI for Islamic geometric pattern at 3% opacity"
  - "WizardShell direction state tracked locally (not in store) since it's UI-only concern"
  - "Mobile nav uses fixed bottom bar with pb-24 spacing on main content to prevent overlap"

patterns-established:
  - "UI primitives in src/components/ui/ consume store directly when needed"
  - "Layout components in src/components/layout/ accept children only"
  - "WizardShell owns navigation logic and animation direction state"
  - "Placeholder step content pattern: min-h-[200px] gray box for future step components"

requirements-completed: [DSGN-01, DSGN-02, DSGN-03]

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 2 Plan 02: UI Primitives & Wizard Shell Summary

**Reusable StepperButton/StepIndicator/Tooltip/Button components with AppLayout card container and WizardShell featuring motion AnimatePresence direction-aware step transitions**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-12T17:48:34Z
- **Completed:** 2026-03-12T17:51:43Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- 4 reusable UI primitives (StepperButton, StepIndicator, Tooltip, Button) with emerald green design system and mobile-first responsive styling
- AppLayout with centered card container, Jomi-Bhag branding header, and subtle Islamic geometric SVG background pattern
- WizardShell with AnimatePresence direction-aware slide animations, step indicator, parents-deceased info text, and responsive navigation (fixed bottom bar on mobile, inline on desktop)
- All 233 existing tests still passing, TypeScript compiles with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create UI primitives (StepperButton, StepIndicator, Tooltip, Button)** - `0577ecb` (feat)
2. **Task 2: Create AppLayout, WizardShell with animated transitions, and step config** - `ffac011` (feat)

## Files Created/Modified
- `src/components/ui/StepperButton.tsx` - Reusable [ - ] count [ + ] control with label, min/max enforcement, tooltip support, 44px tap targets
- `src/components/ui/StepIndicator.tsx` - Connected-dots progress bar reading from useWizardStore, clickable completed steps, responsive sizing
- `src/components/ui/Tooltip.tsx` - (?) icon with hover/tap popover, click-outside close, role="tooltip" accessibility
- `src/components/ui/Button.tsx` - Primary/secondary/ghost variants, emerald styling, min-h-12, fullWidth option
- `src/components/layout/AppLayout.tsx` - Min-h-screen shell with header, centered card, Islamic geometric SVG pattern background
- `src/components/wizard/WizardShell.tsx` - Wizard container with StepIndicator, AnimatePresence transitions, responsive navigation bar
- `src/components/wizard/steps.ts` - Re-exports WIZARD_STEPS from types module for wizard directory convenience

## Decisions Made
- **Tooltip positioning:** Used simple relative/absolute positioning with click-outside listener rather than a positioning library -- sufficient for the (?) icon use case
- **StepIndicator store access:** Reads directly from useWizardStore instead of accepting props, following the anti-prop-drilling pattern from RESEARCH.md
- **Islamic geometric pattern:** Used an inline SVG data URI (cross pattern) at 3% opacity rather than an external SVG file -- keeps it self-contained and lightweight
- **Animation direction state:** Tracked locally in WizardShell (useState) rather than in Zustand store, since it's a pure UI concern not needed by other components
- **Mobile bottom nav spacing:** pb-24 on main content area reserves space for the fixed bottom navigation bar

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 7 component files created and exporting correctly
- UI primitives ready for consumption by step content components (Plan 03)
- WizardShell renders placeholder step content, ready for StepRelationship/StepFamily/StepSiblings to be plugged in
- AppLayout ready to wrap the entire app in App.tsx
- 233 total tests passing (all existing Phase 1 + Phase 2 Plan 01 tests)

## Self-Check: PASSED

All 7 files verified present. Both commits (0577ecb, ffac011) verified in git log. SUMMARY.md exists.

---
*Phase: 02-heir-input-wizard*
*Completed: 2026-03-12*
