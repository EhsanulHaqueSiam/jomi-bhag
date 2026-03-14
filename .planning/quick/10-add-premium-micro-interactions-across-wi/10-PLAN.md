---
phase: quick-10
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/ui/StepIndicator.tsx
  - src/components/ui/Button.tsx
  - src/components/wizard/StepRelationship.tsx
  - src/components/results/ResultsPage.tsx
  - src/components/results/HeirCard.tsx
  - src/components/json/Toast.tsx
  - src/hooks/useCountUp.ts
autonomous: true
requirements: [QUICK-10]

must_haves:
  truths:
    - "Step indicator circles animate on completion (scale + checkmark + emerald fill transition)"
    - "Buttons have tactile press feedback (scale down on press, spring back on release)"
    - "Heir cards stagger-animate into view on results page"
    - "BDT amounts count up from zero when first appearing"
    - "Toast notifications slide in from top with spring physics"
    - "All animations respect prefers-reduced-motion"
  artifacts:
    - path: "src/components/ui/StepIndicator.tsx"
      provides: "Animated step completion circles"
    - path: "src/components/ui/Button.tsx"
      provides: "Tactile press feedback with motion scale"
    - path: "src/components/results/HeirCard.tsx"
      provides: "Staggered fade+slide-up entrance"
    - path: "src/hooks/useCountUp.ts"
      provides: "Number counter animation hook"
    - path: "src/components/json/Toast.tsx"
      provides: "Spring physics slide-in from top"
  key_links:
    - from: "src/components/ui/StepIndicator.tsx"
      to: "motion/react"
      via: "motion.button with AnimatePresence for checkmark"
    - from: "src/hooks/useCountUp.ts"
      to: "src/components/results/HeirCard.tsx"
      via: "useCountUp(targetValue) returns animated display value"
---

<objective>
Add premium micro-interactions across wizard, results, and distribution pages using the existing motion/react library. Five interaction types: step completion animation, button press feedback, results stagger reveal, BDT count-up animation, and toast spring physics.

Purpose: Make the app feel polished and high-quality with subtle, tactile animations.
Output: Updated components with micro-interactions, new useCountUp hook.
</objective>

<context>
@src/components/ui/StepIndicator.tsx
@src/components/ui/Button.tsx
@src/components/wizard/StepRelationship.tsx
@src/components/results/ResultsPage.tsx
@src/components/results/HeirCard.tsx
@src/components/json/Toast.tsx

<interfaces>
From src/components/ui/StepIndicator.tsx:
- Uses useWizardStore for currentStep, completedSteps, setStep
- WIZARD_STEPS array with {number, label}
- Checkmark shown via unicode when completed && !active

From src/components/ui/Button.tsx:
- ButtonProps: children, variant, onClick, disabled, fullWidth, className, type
- Three variants: primary, secondary, ghost
- Currently uses CSS transition-colors only

From src/components/results/HeirCard.tsx:
- Already imports { AnimatePresence, motion } from 'motion/react'
- Shows BDT amounts via fractionToBDT() and bdtFormatter.format()
- Rendered in grid inside ResultsPage

From src/components/json/Toast.tsx:
- Already uses motion with y:50 slide-up animation
- Fixed positioned at bottom-20

From src/components/wizard/StepRelationship.tsx:
- OptionButton sub-component for relationship/gender selection
- Uses CSS transition-colors only
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Wizard micro-interactions (StepIndicator, Button, OptionButton)</name>
  <files>src/components/ui/StepIndicator.tsx, src/components/ui/Button.tsx, src/components/wizard/StepRelationship.tsx</files>
  <action>
**StepIndicator.tsx** -- Replace the static button with motion.button from motion/react:

1. Import `{ motion, AnimatePresence }` from `motion/react`.
2. Wrap each step circle in `motion.button` instead of plain `<button>`.
3. Add `layout` prop to motion.button for smooth size transitions between active (h-10 w-10) and inactive (h-8 w-8) states.
4. For the checkmark display (when `isCompleted && !isActive`), use AnimatePresence with a motion.span inside:
   - `initial={{ scale: 0, rotate: -90 }}`
   - `animate={{ scale: 1, rotate: 0 }}`
   - `transition={{ type: 'spring', stiffness: 500, damping: 25 }}`
   This makes the checkmark pop+spin in when a step completes.
5. Add `whileTap={{ scale: 0.92 }}` to clickable (completed, non-active) step circles for press feedback.
6. The connector line: when `isCompleted(step.number)`, animate its background from gray to emerald using `motion.div` with `animate={{ backgroundColor }}` and `transition={{ duration: 0.4 }}`. Use hex values: completed = `#34d399` (emerald-400), incomplete = `#e5e7eb` (gray-200).
7. Add prefers-reduced-motion: wrap all animation props in a check. Create a `const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches` at the top of the component. When true, omit whileTap, set transition durations to 0, and skip the spring on the checkmark.

**Button.tsx** -- Add motion press feedback:

1. Import `{ motion }` from `motion/react`.
2. Replace `<button>` with `motion.button`.
3. Add `whileTap={{ scale: 0.97 }}` and `transition={{ type: 'spring', stiffness: 400, damping: 17 }}` for a subtle press-down + spring-back effect. The scale is very subtle (0.97) so it feels tactile without being distracting.
4. Keep all existing classes and props. Do NOT change any Tailwind classes or the existing `transition-colors` class.
5. Wrap whileTap in a reduced-motion check: if `disabled` or prefers-reduced-motion, omit whileTap.

**StepRelationship.tsx OptionButton** -- Add tactile selection feedback:

1. Import `{ motion }` from `motion/react`.
2. Replace `<button>` with `motion.button` in OptionButton.
3. Add `whileTap={{ scale: 0.95 }}` for a slightly more pronounced tap than Button (option buttons are smaller, need more feedback).
4. When `selected` changes to true, add `animate={{ scale: [1, 1.05, 1] }}` with `transition={{ duration: 0.2 }}` to create a subtle "pop" confirming selection. Use a key or `layoutId` to trigger on selection change.
5. Prefers-reduced-motion: same pattern as above, skip animations when detected.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run --reporter=verbose 2>&1 | tail -20</automated>
  </verify>
  <done>Step circles animate checkmark appearance with spring physics, connector lines transition color, all buttons have tactile press feedback, OptionButton pops on selection. All animations skip when prefers-reduced-motion is set. Existing tests still pass.</done>
</task>

<task type="auto">
  <name>Task 2: Results page stagger reveal, count-up animation, and toast spring physics</name>
  <files>src/hooks/useCountUp.ts, src/components/results/ResultsPage.tsx, src/components/results/HeirCard.tsx, src/components/json/Toast.tsx</files>
  <action>
**src/hooks/useCountUp.ts** -- Create a new hook for animating number values:

1. `export function useCountUp(target: number, duration = 500): number`
2. Uses `useEffect` + `requestAnimationFrame` to animate from 0 to target over `duration` ms.
3. Uses ease-out curve: `progress = 1 - Math.pow(1 - t, 3)` where `t` is normalized time (0..1).
4. Returns the current animated value (integer via Math.round).
5. When `target` changes, restart animation from current displayed value to new target.
6. Respects prefers-reduced-motion: if `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, return `target` immediately (no animation).
7. Cleanup: cancel any pending rAF in the useEffect cleanup function.

**ResultsPage.tsx** -- Add staggered reveal for heir cards and summary table:

1. Import `{ motion }` from `motion/react`.
2. Wrap the heir card grid (`<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">`) in a motion.div with staggerChildren:
   ```
   <motion.div
     initial="hidden"
     animate="visible"
     variants={{
       hidden: {},
       visible: { transition: { staggerChildren: 0.1 } }
     }}
     className="grid grid-cols-1 gap-4 lg:grid-cols-2"
   >
   ```
3. Wrap each HeirCard in a motion.div with child variants:
   ```
   variants={{
     hidden: { opacity: 0, y: 20 },
     visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
   }}
   ```
4. For the summary table rows, apply the same stagger pattern on tbody rows:
   - Wrap `<tbody>` content in a stagger container (use a motion.tbody or wrap each tr).
   - Each `<tr>` becomes `<motion.tr>` with the same hidden/visible variants, staggered at 0.08s intervals.
5. Add prefers-reduced-motion check: if reduced motion preferred, set all `initial` to `"visible"` (skip animation).

**HeirCard.tsx** -- Add count-up for BDT amounts:

1. Import `useCountUp` from `@/hooks/useCountUp`.
2. For the main BDT total display (`bdtTotal` rendered in the share display section), use `useCountUp(Math.round(share.totalShare.valueOf() * totalEstateValue))`.
3. Format the animated value with `bdtFormatter.format(animatedValue)` instead of the static `bdtTotal`.
4. Apply the same to `bdtEach` when `hasMultiple` is true.
5. Only apply count-up when `totalEstateValue > 0` (no animation for zero/missing).
6. Keep the existing fractionToString and fractionToPercent static (fractions don't count-up, only BDT amounts).

**Toast.tsx** -- Change to slide-from-top with spring physics:

1. Change position from `bottom-20` to `top-4` (toasts appear from the top of the screen, more natural for notifications).
2. Change animation direction:
   - `initial={{ opacity: 0, y: -60 }}` (starts above viewport)
   - `animate={{ opacity: 1, y: 0 }}` (slides down to position)
   - `exit={{ opacity: 0, y: -60 }}` (slides back up on dismiss)
3. Add spring physics to the transition:
   ```
   transition={{ type: 'spring', stiffness: 400, damping: 25 }}
   ```
4. Remove the `-translate-x-1/2` and `left-1/2` hack. Instead use `left-4 right-4 mx-auto max-w-sm` for centered mobile-friendly positioning.
5. Keep all existing functionality (auto-dismiss timer, click-to-dismiss, color coding).
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run --reporter=verbose 2>&1 | tail -20</automated>
  </verify>
  <done>Heir cards stagger-animate into view with 100ms delay between each. Summary table rows stagger at 80ms. BDT amounts count up from 0 to final value over 500ms with ease-out curve. Toast slides from top with spring physics. All animations skip when prefers-reduced-motion is active. All existing tests pass.</done>
</task>

</tasks>

<verification>
- Run full test suite: `npx vitest run` -- all tests pass
- Manual check: navigate wizard steps, observe step indicator checkmark animation and connector line transition
- Manual check: press any Button, observe subtle scale-down + spring-back
- Manual check: complete wizard to results, observe heir cards stagger in and BDT amounts count up
- Manual check: import a JSON file, observe toast slide from top with spring physics
- Manual check: enable prefers-reduced-motion in browser devtools, confirm all animations are disabled
</verification>

<success_criteria>
- All 5 micro-interaction types implemented (step completion, button press, card stagger, count-up, toast spring)
- Animations are subtle (200-400ms range, no flashy effects)
- prefers-reduced-motion respected across all animations
- No new dependencies added (only motion/react)
- All existing tests pass without modification
</success_criteria>

<output>
After completion, create `.planning/quick/10-add-premium-micro-interactions-across-wi/10-SUMMARY.md`
</output>
