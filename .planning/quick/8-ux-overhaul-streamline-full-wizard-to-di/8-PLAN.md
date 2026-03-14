---
phase: quick-8
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/wizard.ts
  - src/components/wizard/WizardShell.tsx
  - src/components/wizard/StepFamilyAndSiblings.tsx
  - src/stores/wizardStore.ts
  - src/components/ui/StepIndicator.tsx
  - src/components/results/ResultsPage.tsx
  - src/components/distribution/DistributionPage.tsx
  - src/components/distribution/DistributionControls.tsx
  - src/components/__tests__/wizard.test.tsx
autonomous: true
requirements: [UX-MERGE-STEPS, UX-RESULTS-STREAMLINE, UX-DISTRIBUTION-POLISH]
must_haves:
  truths:
    - "Wizard has 4 steps (Relationship, Family Members, Estate Inventory, Results) instead of 5"
    - "Family Members step shows spouse, children, and siblings sections in one view"
    - "Siblings section is collapsible within the Family Members step"
    - "Results page shows a summary card at top with heir shares table"
    - "Charts, Islamic basis, and detailed breakdown are behind expandable sections"
    - "Results page has sticky action bar with Download PDF, Distribute Assets, Edit buttons"
    - "Distribution page shows summary stats (total properties, total value, heirs count)"
    - "Distribution page has Auto-distribute button that runs algorithm without manual drag first"
    - "All existing Faraid calculations remain untouched"
    - "Mobile layout does not break"
  artifacts:
    - path: "src/components/wizard/StepFamilyAndSiblings.tsx"
      provides: "Combined family + siblings step component"
    - path: "src/types/wizard.ts"
      provides: "Updated WIZARD_STEPS with 4 steps"
    - path: "src/components/results/ResultsPage.tsx"
      provides: "Streamlined results page with summary card and collapsible sections"
    - path: "src/components/distribution/DistributionPage.tsx"
      provides: "Polished distribution page with stats and auto-distribute"
  key_links:
    - from: "src/types/wizard.ts"
      to: "src/components/ui/StepIndicator.tsx"
      via: "WIZARD_STEPS array (4 items instead of 5)"
      pattern: "WIZARD_STEPS"
    - from: "src/components/wizard/WizardShell.tsx"
      to: "src/components/wizard/StepFamilyAndSiblings.tsx"
      via: "step 2 renders combined component"
      pattern: "currentStep === 2"
    - from: "src/stores/wizardStore.ts"
      to: "src/components/wizard/WizardShell.tsx"
      via: "step numbering (old step 4=estate becomes step 3, old step 5=results becomes step 4)"
      pattern: "calculateShares.*currentStep.*4"
---

<objective>
UX overhaul of the wizard-to-distribution flow for desktop power users. Three changes:
1. Merge Steps 2 (Family) + 3 (Siblings) into a single "Family Members" step, reducing 5 steps to 4
2. Streamline the Results page with a summary card, collapsible detail sections, and sticky action bar
3. Polish the Distribution page with summary stats, prominent headers, and an Auto-distribute button

Purpose: Reduce clicks, clarify information hierarchy, and make the flow efficient for power users who use this tool repeatedly.
Output: Updated wizard with 4 steps, streamlined results, polished distribution UX.
</objective>

<execution_context>
@/home/siam/.claude/get-shit-done/workflows/execute-plan.md
@/home/siam/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/types/wizard.ts
@src/stores/wizardStore.ts
@src/components/wizard/WizardShell.tsx
@src/components/wizard/StepFamily.tsx
@src/components/wizard/StepSiblings.tsx
@src/components/ui/StepIndicator.tsx
@src/components/results/ResultsPage.tsx
@src/components/distribution/DistributionPage.tsx
@src/components/distribution/DistributionControls.tsx
@src/components/distribution/DistributionBoard.tsx
@src/components/distribution/SummaryBanner.tsx
@src/components/distribution/HeirColumn.tsx
@src/components/__tests__/wizard.test.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Merge Steps 2+3 into "Family Members" and renumber wizard to 4 steps</name>
  <files>
    src/types/wizard.ts,
    src/components/wizard/StepFamilyAndSiblings.tsx,
    src/components/wizard/WizardShell.tsx,
    src/stores/wizardStore.ts,
    src/components/__tests__/wizard.test.tsx
  </files>
  <action>
**1. Update WIZARD_STEPS in `src/types/wizard.ts`:**
Change from 5 steps to 4:
```
{ number: 1, label: 'Relationship', shortLabel: 'Relationship' },
{ number: 2, label: 'Family Members', shortLabel: 'Family' },
{ number: 3, label: 'Estate Inventory', shortLabel: 'Estate' },
{ number: 4, label: 'Results', shortLabel: 'Results' },
```
Update the JSDoc comment from "5 wizard steps" to "4 wizard steps".

**2. Create `src/components/wizard/StepFamilyAndSiblings.tsx`:**
Combine the content of StepFamily.tsx and StepSiblings.tsx into a single component. Layout:
- Section heading: "Family Members" with subtitle about spouses, children, and siblings
- Spouse section (wife count / husband toggle) -- identical logic from StepFamily
- Children section (sons/daughters steppers) -- identical logic from StepFamily
- Horizontal divider
- Siblings section -- wrap the entire StepSiblings content in a collapsible toggle:
  - Show a button "Add siblings (optional)" that expands the siblings section
  - When expanded, show the full StepSiblings content (simple brothers/sisters or expanded sub-types)
  - Use useState for the collapsed/expanded state, default to collapsed
  - If any sibling count > 0, auto-expand on mount (so users returning to this step see their data)
- All Zustand selectors and setters come from useWizardStore (same as originals)
- Do NOT delete StepFamily.tsx or StepSiblings.tsx yet (keep for reference, they just won't be imported)

**3. Update `src/components/wizard/WizardShell.tsx`:**
- Import StepFamilyAndSiblings instead of StepFamily and StepSiblings
- Renumber step rendering:
  - `currentStep === 1` -> StepRelationship (unchanged)
  - `currentStep === 2` -> StepFamilyAndSiblings (was StepFamily at 2 + StepSiblings at 3)
  - `currentStep === 3` -> StepEstateInventory (was step 4)
  - `currentStep === 4` -> ResultsPage (was step 5)
- Update all `currentStep !== 5` checks to `currentStep !== 4` (parents-deceased text, FamilyTree, desktop nav, mobile nav, spacer)
- Update navigation logic:
  - `currentStep < 4` for Next button -> `currentStep < 3`
  - `currentStep === 4` for Calculate button -> `currentStep === 3`
- Update isCurrentStepValid switch:
  - case 1: unchanged
  - case 2: return true (combined family+siblings, always valid)
  - case 3: return true (estate, always valid)
  - Remove case 3 (old siblings) and case 4 (old estate) -- consolidated
- Update FamilyTree `currentStep` prop hide condition to `currentStep !== 4`

**4. Update `src/stores/wizardStore.ts`:**
- In `calculateShares()`: change `currentStep: 5` to `currentStep: 4`. Update the completedSteps push to mark steps 2 and 3 (not 3 and 4).
- In `isStepValid()`: renumber cases:
  - case 1: unchanged
  - case 2: return true (combined family+siblings)
  - case 3: return true (estate)
  - case 4: return true (results)
  - Remove old case 4 and case 5

**5. Update `src/components/__tests__/wizard.test.tsx`:**
- "navigates from Step 2 to Step 3": After Step 2, clicking Next should now show "Estate Inventory" content (not "Siblings" heading). Update assertion to look for estate-related content instead of "Siblings".
- "no Father or Mother heir entry fields exist in Step 3": This test navigated to old Step 3 (siblings). Now Step 3 is estate. Update the test to check Step 2 instead (since siblings are now part of Step 2). The test should: go to Step 2, expand the siblings toggle, then assert no Father/Mother fields.
- "all 3 steps are reachable through Next navigation": Rename to "all steps are reachable through Next navigation". Update to verify Steps 1-3 (Relationship -> Family Members -> Estate Inventory) since Step 4 is Results (reached via Calculate).
- Keep all other assertions about "Sons", "Daughters", "Brothers", "Sisters" but adjust which step they appear in.
- The "Siblings" heading text in the combined component will be a section label within the collapsible, so check for "Brothers" or "Sisters" stepper labels after expanding the siblings toggle.

**Important:** The localStorage persisted state has `currentStep` values from the old 5-step system. Users with `currentStep: 5` in storage will now be at an invalid step. This is fine -- the persist version is already 1. Bump the persist version to 2 and add a `migrate` function that maps old step numbers: if currentStep was 3 -> 2, if 4 -> 3, if 5 -> 4. Also remap completedSteps array similarly.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/components/__tests__/wizard.test.tsx src/stores/__tests__/wizardStore.test.ts src/types/__tests__/wizard.test.ts --reporter=verbose 2>&1 | tail -30</automated>
  </verify>
  <done>
    - Wizard shows 4 steps in StepIndicator (Relationship, Family Members, Estate Inventory, Results)
    - Step 2 shows spouse, children, and collapsible siblings section
    - Navigation flows correctly: 1 -> 2 -> 3 -> Calculate -> 4 (Results)
    - All wizard tests pass with updated step numbering
    - Persisted state migrates cleanly from 5-step to 4-step numbering
  </done>
</task>

<task type="auto">
  <name>Task 2: Streamline Results page with summary card, collapsible sections, and sticky action bar</name>
  <files>
    src/components/results/ResultsPage.tsx
  </files>
  <action>
**Restructure ResultsPage.tsx layout:**

**1. Add Summary Card at top (new section, before everything else):**
After the header, render a summary card with white bg, rounded border, slight shadow:
- Title: "Inheritance Summary"
- A simple HTML table with columns: Heir | Share | Amount (if estate value > 0)
- Each row: heir display label (from share.heirType formatted with count), fraction as string (e.g. "1/4"), BDT amount formatted with Intl.NumberFormat('en-IN')
- Use the existing `activeShares` array
- Style: compact, clean, text-sm, alternating row bg (gray-50/white)
- If totalEstateValue is 0, hide the Amount column
- This gives users the key output at a glance without scrolling

**2. Move Charts + Islamic Basis + Detailed Breakdown into collapsible sections:**
- Wrap ChartSection in a collapsible disclosure:
  - Button text: "Charts & Visualizations" with chevron icon
  - Default: collapsed
  - Use a local useState for open/closed state
- Wrap the detailed mode sections (StepAccordion + IslamicBasisSection) similarly:
  - Button text: "Islamic Legal Basis & Calculation Steps"
  - Default: collapsed
  - Remove the ModeToggle component and viewMode dependency -- instead, always render these sections inside the collapsible (no simple/detailed toggle needed since they're behind a disclosure now)
- Keep AdjustmentBanner and SpecialCaseCallout visible (not collapsed) -- these are important warnings
- Keep BlockedHeirsSection visible (important info)
- Keep HeirCard grid visible (the detailed per-heir breakdown)

**3. Add sticky action bar:**
- Create a sticky bar at the bottom of the results view (position: sticky, bottom: 0)
- Contains the primary action buttons in a row with white bg, top border, padding:
  - "Distribute Assets" (emerald-600 bg, primary CTA) -- only if properties/assets exist
  - "Download PDF" with download icon
  - "Print" with print icon
  - "Export JSON" with export icon
  - "Edit" dropdown or two text links: "Edit Heirs" (goes to step 1), "Edit Properties" (goes to step 3)
- Remove the old header action buttons (they're now in the sticky bar)
- On mobile, the sticky bar should have py-3 px-4 and use gap-2 with smaller buttons
- Add appropriate bottom padding to the results content so it doesn't get hidden behind the sticky bar

**4. Clean up the header area:**
- Keep just the "Inheritance Results" heading
- Remove all the icon buttons that moved to sticky bar
- Remove ModeToggle (no longer needed)

**Important considerations:**
- The `usePdfExport` and `useJsonExport` hooks stay in ResultsPage (they're called from the sticky bar now)
- Keep the pdfError banner at the top
- The collapsible sections use simple useState toggles with smooth height transitions (no external library -- just conditional rendering with a rotate transition on the chevron)
- EstateBreakdownCard stays visible (not collapsed) -- it shows property/asset value breakdown which is useful context
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/components/__tests__/results.test.tsx --reporter=verbose 2>&1 | tail -30</automated>
  </verify>
  <done>
    - Results page shows summary table at top with heir shares
    - Charts and Islamic basis are behind collapsible disclosure sections
    - Sticky action bar at bottom with Download PDF, Print, Export JSON, Distribute Assets, Edit buttons
    - AdjustmentBanner, SpecialCaseCallout, BlockedHeirsSection, HeirCards remain visible
    - Existing results tests pass (update assertions if test checks for old button locations)
  </done>
</task>

<task type="auto">
  <name>Task 3: Distribution page polish -- summary stats, auto-distribute, prominent equilibrium</name>
  <files>
    src/components/distribution/DistributionPage.tsx,
    src/components/distribution/DistributionControls.tsx
  </files>
  <action>
**1. Add summary stats bar at top of DistributionPage (after header, before ViewToggle):**
- Create a horizontal stats row with 3-4 stat cards (inline, not a separate component):
  - "Properties": count of properties from wizardStore
  - "Movable Assets": count of movableAssets from wizardStore
  - "Total Value": formatted BDT total (use getAllPropertiesTotal from wizardStore)
  - "Heirs": count of active shares (non-blocked) from results
- Style: flex row, gap-4, each stat is a small rounded card with bg-gray-50, px-3 py-2
  - Label in text-xs text-gray-500, value in text-sm font-semibold text-gray-900
- On mobile: grid-cols-2 with gap-2

**2. Add Auto-distribute button to DistributionControls:**
- Add an "Auto-distribute" button alongside the existing Randomize button
- The Auto-distribute button calls `computeDistribution()` followed by `randomize()` in sequence
- Style: emerald-600 bg (primary), text "Auto-distribute" with a magic wand or shuffle icon
- The existing Randomize button becomes secondary (outline style: border border-emerald-600 text-emerald-600, no bg fill)
- Props: add `onAutoDistribute: () => void` to DistributionControlsProps
- In DistributionPage, wire onAutoDistribute to call `computeDistribution()` then `randomize()`

**3. Make equilibrium indicator more prominent in SummaryBanner:**
- This is already handled by the existing SummaryBanner component which shows balanced/total counts
- In DistributionPage, move the SummaryBanner from inside DistributionBoard to directly in DistributionPage, right after the stats bar and before the controls
- This makes it more visible (currently it's nested inside the board component)
- To do this: extract balancedCount/totalCount computation to DistributionPage level (already have groupSummary/individualSummary), and render SummaryBanner directly
- In DistributionBoard, remove the SummaryBanner rendering (it's now in the parent)
- Update DistributionBoard props to remove balancedCount and totalCount (no longer needed there)

**4. Make column headers more prominent in HeirColumn (light touch):**
- In HeirColumn.tsx, the header already shows heir name and share. Make the share fraction text slightly larger (text-base instead of text-sm) and add the actual fraction string (e.g. "1/4") next to the label. The share data is available in the `shares` prop -- find the matching share by heirType and display `share.fraction.toFraction()` next to the heir label.
- Keep changes minimal -- just font size and fraction display.

**Important:** Do NOT touch the DnD logic, the distribution algorithm, or any calculation code. Only UI/layout changes.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/components/__tests__/distribution.test.tsx src/stores/__tests__/distributionStore.test.ts --reporter=verbose 2>&1 | tail -30</automated>
  </verify>
  <done>
    - Distribution page shows summary stats bar (properties count, assets count, total value, heirs count)
    - Auto-distribute button exists and triggers computation + randomization
    - Equilibrium banner is prominently displayed above the board
    - Column headers show heir name with share fraction
    - All existing distribution tests pass
    - DnD functionality unchanged
  </done>
</task>

</tasks>

<verification>
After all 3 tasks complete, run the full test suite to confirm no regressions:

```bash
cd /home/siam/Personal/jomi-bhag && npx vitest run --reporter=verbose 2>&1 | tail -50
```

Verify:
1. All existing tests pass (with updated assertions where step numbers changed)
2. TypeScript compiles: `npx tsc --noEmit`
3. Dev server starts without errors: `npx vite build`
</verification>

<success_criteria>
- Wizard has 4 steps instead of 5 (Steps 2+3 merged into "Family Members")
- Results page has clear summary card, collapsible detail sections, sticky action bar
- Distribution page has summary stats, auto-distribute button, prominent equilibrium
- All Faraid calculation logic completely untouched
- All tests pass
- Mobile layout intact
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/8-ux-overhaul-streamline-full-wizard-to-di/8-SUMMARY.md`
</output>
