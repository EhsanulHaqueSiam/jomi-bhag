---
phase: quick-fix
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/wizard/WizardShell.tsx
  - src/components/layout/AppLayout.tsx
autonomous: true
requirements: [MOBILE-NAV-FIX]

must_haves:
  truths:
    - "Next button is visible and tappable on mobile devices at every wizard step (1-4)"
    - "Content at the bottom of each step is not obscured by the fixed navigation bars"
    - "Desktop layout remains unchanged"
  artifacts:
    - path: "src/components/wizard/WizardShell.tsx"
      provides: "Mobile wizard navigation with proper spacing"
    - path: "src/components/layout/AppLayout.tsx"
      provides: "Main content padding accounting for stacked fixed bars"
  key_links:
    - from: "src/components/layout/AppLayout.tsx"
      to: "src/components/wizard/WizardShell.tsx"
      via: "Bottom padding must clear both AppLayout tab bar AND WizardShell nav bar"
      pattern: "pb-\\d+"
---

<objective>
Fix the mobile layout so the wizard Next/Back navigation bar and all step content are fully visible on mobile devices.

Purpose: On mobile, two fixed bars stack at the bottom -- the AppLayout tab bar (~52px at bottom-0) and the WizardShell wizard nav bar (~60px at bottom-[52px]). The main content only has pb-24 (96px) bottom padding, which is insufficient to clear the combined ~112px of fixed bars. This causes the bottom of step content to be hidden behind the wizard nav bar, and on some devices the nav bar itself may be obscured. Additionally, there is no safe-area-inset handling for modern iPhones with the home indicator.

Output: Fixed mobile layout where both navigation bars are always visible and step content scrolls fully above them.
</objective>

<execution_context>
@/home/siam/.claude/get-shit-done/workflows/execute-plan.md
@/home/siam/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/wizard/WizardShell.tsx
@src/components/layout/AppLayout.tsx

<interfaces>
<!-- Key layout structure the executor needs to understand -->

From src/components/layout/AppLayout.tsx (line 65):
```tsx
<main className="relative px-4 pb-24 md:mx-auto md:max-w-lg md:pb-8 lg:max-w-xl">
```
pb-24 (96px) only accounts for the bottom tab bar (~52px), not the additional wizard nav bar (~60px).

From src/components/layout/AppLayout.tsx (line 72-73):
```tsx
<nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white md:hidden">
```
The mobile tab bar (Calculator / My Scenarios) -- approx 52px tall.

From src/components/wizard/WizardShell.tsx (line 169):
```tsx
<div className="fixed bottom-[52px] left-0 right-0 z-50 flex flex-col gap-2 border-t border-gray-100 bg-white px-4 py-3 md:hidden">
```
The wizard nav bar (Back/Next) sits above the tab bar -- approx 56-60px tall.

Combined fixed bottom area on mobile: ~112px. Content padding: only 96px. Gap: ~16px of content hidden.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix mobile bottom spacing so wizard nav and content are fully visible</name>
  <files>src/components/layout/AppLayout.tsx, src/components/wizard/WizardShell.tsx</files>
  <action>
Two changes are needed to fix the mobile navigation visibility:

**1. AppLayout.tsx -- Increase mobile bottom padding (line 65):**

Change the main element's className from `pb-24` to `pb-32` for mobile. This increases the bottom padding from 96px to 128px, which properly clears both the tab bar (~52px) and the wizard nav bar (~60px) with a small buffer. Keep the desktop `md:pb-8` unchanged.

Change:
```
className="relative px-4 pb-24 md:mx-auto md:max-w-lg md:pb-8 lg:max-w-xl"
```
To:
```
className="relative px-4 pb-32 md:mx-auto md:max-w-lg md:pb-8 lg:max-w-xl"
```

Also add safe-area-inset-bottom support to the mobile tab bar (the `<nav>` element at line 72) to handle modern iPhones with the home indicator. Add `pb-[env(safe-area-inset-bottom)]` to the nav's className. Since Tailwind does not have a built-in safe-area class, use an inline style instead:

Change the nav element to include:
```tsx
style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
```

**2. WizardShell.tsx -- Adjust wizard nav bar position to account for safe area (line 169):**

The wizard nav bar uses `bottom-[52px]` to sit above the tab bar. When the tab bar has safe-area padding, this needs to adjust. Use CSS calc with env() for the bottom offset:

Change the mobile nav bar div to use an inline style for the bottom position:
```tsx
style={{ bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))' }}
```
And remove the `bottom-[52px]` from the className (replace with just removing that class since the inline style handles it).

Also add a spacer div inside the WizardShell component (right before the closing `</div>`) that provides extra bottom padding on mobile when the wizard nav is visible (steps 1-4). This ensures content inside the card scrolls fully above the fixed bars:

After the mobile navigation bar block (after line 207), before the final `</div>`, add:
```tsx
{/* Mobile spacer to ensure content clears fixed bottom bars */}
{currentStep !== 5 && (
  <div className="h-28 md:hidden" aria-hidden="true" />
)}
```

This 112px (h-28) invisible spacer inside the card ensures the last piece of step content (like the ImportDropZone on Step 1) can scroll fully above both fixed bars.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/components/__tests__/wizard.test.tsx --reporter=verbose 2>&1 | tail -30</automated>
  </verify>
  <done>
    - Mobile main content has pb-32 (128px) padding clearing both fixed bars
    - AppLayout mobile tab bar has safe-area-inset-bottom padding for modern iPhones
    - WizardShell wizard nav bar position accounts for safe-area-inset-bottom
    - Spacer div inside WizardShell ensures card content scrolls fully above fixed bars
    - Desktop layout unchanged (md:pb-8 and hidden/md:flex patterns preserved)
    - All existing wizard tests pass
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Fixed mobile bottom navigation spacing so the Next button and all step content are visible on mobile devices, including safe-area support for modern iPhones.</what-built>
  <how-to-verify>
    1. Open the app on a mobile device or use Chrome DevTools mobile simulation (375x667 iPhone SE or 390x844 iPhone 14)
    2. On Step 1, select "Father" as the deceased -- verify the Next button is visible at the bottom without scrolling past it
    3. Fill in all Step 1 fields (Father + Son) -- verify the Next button is tappable
    4. Tap Next and verify navigation to Step 2
    5. Check that the "or import from file" section and ImportDropZone at the bottom of Step 1 are fully visible when scrolled down (not hidden behind the nav bars)
    6. Navigate through all steps (1 through 4) verifying Back/Next buttons visible at each
    7. On Step 4, verify both "Calculate Shares" button and "Skip to Results" link are visible
    8. Verify desktop layout (resize to >768px width) is unchanged
  </how-to-verify>
  <resume-signal>Type "approved" or describe any remaining issues</resume-signal>
</task>

</tasks>

<verification>
- All existing wizard navigation tests pass
- Mobile bottom padding (pb-32) clears combined fixed bar height
- Safe-area-inset support prevents iOS home indicator overlap
- Desktop layout unaffected (md: breakpoint overrides preserved)
</verification>

<success_criteria>
- Next/Back buttons visible and tappable on mobile at every wizard step
- Step content fully scrollable above fixed bottom bars (no content hidden)
- Desktop layout unchanged
- Existing tests pass
</success_criteria>

<output>
After completion, create `.planning/quick/1-fix-missing-next-button-on-mobile-cannot/1-SUMMARY.md`
</output>
