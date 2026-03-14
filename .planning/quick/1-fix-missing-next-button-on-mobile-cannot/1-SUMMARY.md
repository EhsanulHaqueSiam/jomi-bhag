---
phase: quick-fix
plan: 1
subsystem: ui
tags: [mobile, layout, tailwindcss, safe-area, ios]

requires:
  - phase: 02-wizard-layout
    provides: "WizardShell and AppLayout mobile navigation structure"
provides:
  - "Mobile wizard navigation fully visible with safe-area-inset support"
affects: [mobile-layout, wizard-navigation]

tech-stack:
  added: []
  patterns:
    - "CSS env(safe-area-inset-bottom) for iOS home indicator clearance"
    - "Spacer div pattern for content clearing fixed bottom bars"

key-files:
  created: []
  modified:
    - src/components/layout/AppLayout.tsx
    - src/components/wizard/WizardShell.tsx

key-decisions:
  - "pb-32 (128px) mobile padding clears combined 112px fixed bar stack with 16px buffer"
  - "Inline style for safe-area-inset-bottom (Tailwind has no built-in safe-area class)"
  - "h-28 spacer div inside WizardShell ensures card content scrolls fully above fixed bars"

patterns-established:
  - "Safe area inset via inline style: style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}"

requirements-completed: [MOBILE-NAV-FIX]

duration: 1min
completed: 2026-03-14
---

# Quick Fix 1: Mobile Wizard Navigation Visibility Summary

**Fixed mobile bottom spacing with pb-32 padding, safe-area-inset support, and content spacer to ensure Next/Back buttons are always visible and tappable**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-14T07:01:24Z
- **Completed:** 2026-03-14T07:02:27Z
- **Tasks:** 1 (+ 1 auto-approved checkpoint)
- **Files modified:** 2

## Accomplishments

- Mobile main content padding increased from pb-24 (96px) to pb-32 (128px), properly clearing both the AppLayout tab bar (~52px) and the WizardShell wizard nav bar (~60px)
- Added safe-area-inset-bottom support to AppLayout mobile tab bar for modern iPhones with home indicator
- WizardShell wizard nav bar bottom offset now accounts for safe-area-inset-bottom via CSS calc()
- Added h-28 invisible spacer div inside WizardShell ensuring card content (e.g., ImportDropZone on Step 1) scrolls fully above both fixed bars
- Desktop layout completely unchanged (md:pb-8 and md:hidden/md:flex patterns preserved)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix mobile bottom spacing so wizard nav and content are fully visible** - `46704fe` (fix)

## Files Created/Modified

- `src/components/layout/AppLayout.tsx` - Increased mobile bottom padding pb-24 -> pb-32; added safe-area-inset-bottom inline style to mobile tab bar nav
- `src/components/wizard/WizardShell.tsx` - Replaced fixed bottom-[52px] with CSS calc for safe area; added h-28 mobile spacer div for content clearance

## Decisions Made

- Used pb-32 (128px) instead of exact 112px to provide a small buffer above the combined fixed bar height
- Used inline `style` attribute for safe-area-inset-bottom rather than custom Tailwind utility, since Tailwind v4 does not have built-in safe-area classes
- Spacer div uses h-28 (112px) matching the combined fixed bar height, with md:hidden to avoid affecting desktop

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Mobile navigation fix is complete and self-contained
- All 10 existing wizard tests continue to pass
- TypeScript compilation clean with no errors

## Self-Check: PASSED

- FOUND: src/components/layout/AppLayout.tsx
- FOUND: src/components/wizard/WizardShell.tsx
- FOUND: 1-SUMMARY.md
- FOUND: commit 46704fe

---
*Quick Fix: 1-fix-missing-next-button-on-mobile-cannot*
*Completed: 2026-03-14*
