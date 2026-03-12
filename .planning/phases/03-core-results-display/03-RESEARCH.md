# Phase 3: Core Results Display - Research

**Researched:** 2026-03-13
**Domain:** React UI components for displaying Faraid calculation results with Islamic references
**Confidence:** HIGH

## Summary

Phase 3 builds the results display page that users see after completing the heir input wizard. The engine (`calculateInheritance()`) is complete and returns a rich `FaraidOutput` object containing per-heir shares (as `Fraction` objects), blocked heirs with reasons, calculation steps, Quranic/Hadith references, adjustment info, and special case markers. The display phase consumes this data structure and renders it in a card-based layout with expandable Quranic references, a numbered accordion for step-by-step explanation, and a Simple/Detailed mode toggle.

The existing codebase provides strong foundations: `motion/react` (Framer Motion) is installed for animations, Zustand manages wizard state, TailwindCSS 4 with oklch gold/emerald palette is configured, and Noto Naskh Arabic font is loaded for Quranic text. The `WizardShell` already has a placeholder `handleCalculate` function that needs to be wired to the engine and results display. The `WIZARD_STEPS` array needs a 4th "Results" entry, and `StepIndicator` already renders dynamically from this array.

**Primary recommendation:** Build results as a new step (step 4) within the existing `WizardShell` flow, using the established component-per-file pattern. Store the `FaraidOutput` in Zustand alongside a `totalEstateValue` number for BDT calculations. Use `motion/react` AnimatePresence for accordion expand/collapse with `height: "auto"` animation. Format BDT using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', currencyDisplay: 'narrowSymbol' })` for lakh/crore grouping with the Taka symbol.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Card-based layout: one card per heir type (consistent with Phase 2 design language)
- Each card shows: heir type icon, count, share fraction, percentage, share type (Fard/Asaba/Radd-adjusted)
- Multiple heirs of same type: show both per-heir share and total share (e.g., "Each: 7/24 (29.2%), Total: 7/8 (87.5%)")
- Blocked heirs shown in a separate "Blocked Heirs" section below active heir cards -- explains who was blocked, by whom, and why (educational per Phase 1 decision)
- Quick total estate value input (BDT) at top of results page -- user enters a number, all cards update with monetary amounts instantly
- Expandable inline per card: gold-accented reference label (e.g., "Quran 4:12") on each heir card, collapsed by default
- Expanding shows Arabic text (Noto Naskh Arabic font) + English translation in a styled box within the card
- Grouped "Islamic Basis" section at bottom -- collects ALL unique Quran/Hadith references used in the calculation. Visible in detailed mode only. Uses engine's `getAllReferences()` output
- Awl/Radd adjustments: colored info banner at top of results explaining what happened + each affected card marked with badge showing original vs adjusted share
- Special cases (Umariyyatayn, Mushtarakah, Kalalah): highlighted callout box with gold border and Islamic accent, appears between banner area and heir cards
- Numbered accordion: vertical list of numbered steps, each shows short description (always visible), click to expand full detail
- Users can open multiple steps simultaneously
- Visible in detailed mode only -- simple mode shows just the heir cards
- Plain language with Islamic terms defined parenthetically
- Fraction math shown in step expansions only
- Simple mode is the default
- Toggle: segmented control [Simple | Detailed] next to "Inheritance Results" heading at top
- Simple mode shows: heir cards (fraction, %, BDT), expandable Quran refs per card, blocked heirs section, adjustment banner, special case callouts
- Detailed mode adds: step-by-step numbered accordion with fraction math, grouped Islamic Basis section with all references
- "Edit heirs" button at top of results page -- navigates back to wizard with inputs preserved
- Results page is the final step in the wizard flow (step 4 conceptually)

### Claude's Discretion
- Card grid layout (1 vs 2 columns on desktop)
- Exact animation for accordion expand/collapse
- Color coding for share types (Fard vs Asaba vs blocked)
- Loading state design while engine calculates
- Mobile card stacking behavior
- Exact BDT input field styling and formatting (lakh/crore notation)

### Deferred Ideas (OUT OF SCOPE)
- Physical Land Lot Assignment -- After calculating shares, divide actual land parcels (by name: "Gojarmari", "Chakra" etc.) into groups and randomly assign or let user name each lot's owner. Follows Islamic Qur'ah (drawing lots) for fair division. This is a new capability beyond share calculation -- belongs in its own phase after property input (Phase 4/5) is complete.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RSLT-01 | App displays each heir's share as fraction, percentage, and monetary amount simultaneously | `Fraction.toFraction()` for fraction string, `Fraction.valueOf() * 100` for percentage, `Fraction.valueOf() * totalEstate` with `Intl.NumberFormat` for BDT. All three derivable from `ShareResult.totalShare` and `ShareResult.sharePerHeir` |
| RSLT-02 | App shows Quranic ayah and/or Hadith reference justifying each heir's share allocation | `ShareResult.quranRef` maps to `QURAN_REFERENCES[key]` for Arabic+English text. `ShareResult.hadithRef` maps to `HADITH_REFERENCES.find(h => h.id === id)`. `getShareReference(heirType)` returns `IslamicReference[]`. Noto Naskh Arabic font already loaded |
| RSLT-03 | App provides step-by-step calculation explanation showing how shares were derived | `FaraidOutput.steps` is `CalculationStep[]` with `step` (number), `description` (short summary), `detail` (full explanation). Engine produces 4-10 steps depending on scenario. Maps directly to numbered accordion |
| RSLT-06 | App provides dual mode -- simple view for general public, detailed view for legal professionals | React state toggle (boolean `isDetailed`). Simple mode renders heir cards + blocked heirs + banners. Detailed mode adds step accordion + Islamic Basis section. Toggle is a segmented control at top |

</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.4 | Component framework | Already in use, Phase 2 established patterns |
| motion/react | ^12.36.0 | Accordion/card animations | Already installed, used for wizard step transitions |
| Zustand | ^5.0.11 | State management (results store) | Already in use for wizardStore pattern |
| TailwindCSS | ^4.2.1 | Styling (oklch colors, responsive) | Already configured with emerald + gold palette |
| fraction.js | ^5.3.4 | Fraction display (`toFraction()`, `valueOf()`) | Already used by engine, no new dependency |

### Supporting (built-in browser APIs)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Intl.NumberFormat | Browser built-in | BDT currency formatting with lakh/crore grouping | For monetary amount display on heir cards |

### No New Dependencies Needed
The entire phase can be built with existing dependencies. No additional npm packages required.

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    results/              # NEW: All results display components
      ResultsPage.tsx     # Main results container (step 4 content)
      HeirCard.tsx        # Individual heir share card
      BlockedHeirsSection.tsx  # Blocked heirs educational section
      AdjustmentBanner.tsx     # Awl/Radd info banner
      SpecialCaseCallout.tsx   # Umariyyatayn/Mushtarakah/Kalalah callout
      QuranReference.tsx       # Expandable Quran/Hadith reference per card
      StepAccordion.tsx        # Numbered accordion for calculation steps
      IslamicBasisSection.tsx  # Grouped references (detailed mode only)
      ModeToggle.tsx           # Simple/Detailed segmented control
      EstateValueInput.tsx     # BDT total estate value input
    ui/
      SegmentedControl.tsx  # NEW: Reusable segmented control component
  stores/
    wizardStore.ts          # MODIFIED: Add step 4, results state, estate value
  types/
    wizard.ts               # MODIFIED: Add step 4 to WIZARD_STEPS
```

### Pattern 1: Engine Integration via Zustand
**What:** Call `calculateInheritance(wizardStore.buildFaraidInput())` when transitioning to step 4, store the `FaraidOutput` in Zustand.
**When to use:** When "Calculate Shares" is clicked on step 3.
**Example:**
```typescript
// In wizardStore.ts -- add to state
interface WizardState {
  // ... existing fields
  results: FaraidOutput | null
  totalEstateValue: number  // BDT amount, 0 = not entered
  viewMode: 'simple' | 'detailed'
}

// Action to calculate
calculateShares: () => {
  const input = get().buildFaraidInput()
  const results = calculateInheritance(input)
  set({ results, currentStep: 4 })
}

setTotalEstateValue: (value: number) => set({ totalEstateValue: value })
setViewMode: (mode: 'simple' | 'detailed') => set({ viewMode: mode })
```

### Pattern 2: Accordion with AnimatePresence Height Animation
**What:** Each step item is a clickable header + collapsible content animated with `motion/react`.
**When to use:** For step-by-step calculation accordion and expandable Quran references.
**Example:**
```typescript
// Source: motion.dev docs + existing WizardShell pattern
import { AnimatePresence, motion } from 'motion/react'

function AccordionItem({ title, children, isOpen, onToggle }) {
  return (
    <div>
      <button onClick={onToggle} className="w-full text-left ...">
        {title}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### Pattern 3: Fraction Display Utilities
**What:** Utility functions to convert `Fraction` objects to display strings for fraction, percentage, and BDT monetary amount.
**When to use:** In every HeirCard component to show the three simultaneous displays.
**Example:**
```typescript
// Display utilities (can go in src/core/utils/display.ts)
import type Fraction from 'fraction.js'

export function fractionToString(f: Fraction): string {
  return f.toFraction()  // "1/3", "7/24"
}

export function fractionToPercent(f: Fraction, decimals = 1): string {
  return (f.valueOf() * 100).toFixed(decimals) + '%'
}

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',  // "৳" symbol
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function fractionToBDT(f: Fraction, totalEstate: number): string {
  const amount = f.valueOf() * totalEstate
  return bdtFormatter.format(Math.round(amount))
}
// Example outputs:
// fractionToString(1/3) -> "1/3"
// fractionToPercent(1/3) -> "33.3%"
// fractionToBDT(1/3, 3000000) -> "৳10,00,000" (uses lakh grouping)
```

### Pattern 4: Segmented Control (Simple / Detailed Toggle)
**What:** Two-option toggle that looks like a pill-shaped segmented control.
**When to use:** At the top of results page next to the "Inheritance Results" heading.
**Example:**
```typescript
// Accessible segmented control using radio buttons underneath
function ModeToggle({ value, onChange }: { value: 'simple' | 'detailed', onChange: (v: 'simple' | 'detailed') => void }) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1" role="radiogroup" aria-label="View mode">
      {(['simple', 'detailed'] as const).map((mode) => (
        <button
          key={mode}
          role="radio"
          aria-checked={value === mode}
          onClick={() => onChange(mode)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all
            ${value === mode
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          {mode === 'simple' ? 'Simple' : 'Detailed'}
        </button>
      ))}
    </div>
  )
}
```

### Pattern 5: Conditional Rendering by View Mode
**What:** Simple boolean check to show/hide detailed-only sections.
**When to use:** For step accordion, Islamic Basis section.
**Example:**
```typescript
const viewMode = useWizardStore((s) => s.viewMode)

return (
  <div>
    {/* Always visible */}
    <AdjustmentBanner ... />
    <SpecialCaseCallout ... />
    <HeirCardGrid ... />
    <BlockedHeirsSection ... />

    {/* Detailed mode only */}
    {viewMode === 'detailed' && (
      <>
        <StepAccordion steps={results.steps} />
        <IslamicBasisSection references={getAllReferences(results)} />
      </>
    )}
  </div>
)
```

### Anti-Patterns to Avoid
- **Prop-drilling FaraidOutput:** Store results in Zustand, not passed through props. Components select what they need with `useWizardStore(s => s.results?.shares)`.
- **Recomputing on every render:** Call `calculateInheritance()` once on "Calculate" click, cache in Zustand. Never call it in a render cycle.
- **Custom fraction-to-string logic:** Use `fraction.js` built-in methods (`toFraction()`, `valueOf()`), not manual string building from numerator/denominator.
- **Importing Quran data directly in components:** Use `getShareReference(heirType)` from `references.ts`, not raw `QURAN_REFERENCES` access. The engine functions handle the mapping.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| BDT number formatting with lakh/crore | Custom grouping regex | `Intl.NumberFormat('en-IN', { currency: 'BDT' })` | Handles edge cases (negative, large numbers, locale-correct Taka symbol "৳") |
| Fraction display | String concatenation from n/d | `Fraction.toFraction()` method | Handles sign, simplification, zero-denominator cases |
| Percentage from fraction | Manual division | `Fraction.valueOf() * 100` | Uses BigInt precision internally |
| Height animation for accordion | CSS transitions or manual height measurement | `motion/react` AnimatePresence + `height: "auto"` | Handles dynamic content, enter/exit animations, layout shifts |
| Quran reference lookup | Direct data file access | `getShareReference(heirType)` and `getAllReferences(output)` | Already handles deduplication, Quran+Hadith combination, applies-to mapping |

**Key insight:** The Faraid engine already produces ALL display data. The results page is purely a presentation layer -- no calculation logic should exist in components.

## Common Pitfalls

### Pitfall 1: Fraction Object Equality
**What goes wrong:** Using `===` or `==` on Fraction objects for comparison/conditional rendering.
**Why it happens:** Fraction objects are reference types, not primitives.
**How to avoid:** Always use `fraction.equals(other)` or `fraction.compare(other)`. For display purposes, convert to string/number first.
**Warning signs:** Cards not rendering or conditions not matching when they should.

### Pitfall 2: Missing overflow:hidden on Accordion Animation
**What goes wrong:** Content visible outside animated container during height transition.
**Why it happens:** `motion.div` animates height but doesn't clip children by default.
**How to avoid:** Always set `style={{ overflow: 'hidden' }}` on the animated motion.div wrapper.
**Warning signs:** Text flashing below accordion during open/close animation.

### Pitfall 3: WizardShell Step Navigation Hardcoded to 3
**What goes wrong:** Adding step 4 but navigation buttons still reference `currentStep < 3` and `currentStep === 3`.
**Why it happens:** WizardShell has hardcoded step count checks (line 118: `currentStep < 3`, line 127: `currentStep === 3`).
**How to avoid:** Update WizardShell to use `WIZARD_STEPS.length` or a constant. The "Calculate" button on step 3 transitions to step 4 (results). Step 4 should NOT show "Next" -- only "Edit heirs" (back to step 1-3).
**Warning signs:** Navigation buttons appearing/disappearing incorrectly on results page.

### Pitfall 4: Zustand Store Reset on Edit
**What goes wrong:** Clicking "Edit heirs" clears the wizard state or causes duplicate calculation.
**Why it happens:** `setStep()` in wizardStore marks previous steps completed but going from step 4 back to step 1-3 should not clear results.
**How to avoid:** "Edit heirs" sets `currentStep` to 1 (or whichever step) without clearing `results`. Results are only recalculated when "Calculate" is clicked again.
**Warning signs:** Lost wizard input, or stale results showing after editing heirs.

### Pitfall 5: Arabic Text Direction
**What goes wrong:** Arabic Quranic text renders left-to-right or breaks layout.
**Why it happens:** Missing `dir="rtl"` on Arabic text containers.
**How to avoid:** Always wrap Arabic text in `<p dir="rtl" lang="ar" className="font-arabic ...">`.
**Warning signs:** Arabic text left-aligned, mixed with LTR content incorrectly.

### Pitfall 6: Estate Value Input as String
**What goes wrong:** Non-numeric input or empty string causes NaN in calculations.
**Why it happens:** HTML input returns strings; direct multiplication without parsing.
**How to avoid:** Parse with `parseFloat()`, default to 0, use `isNaN()` guard. Consider storing as number in Zustand and formatting display separately.
**Warning signs:** "NaN" or "৳NaN" appearing in card monetary amounts.

### Pitfall 7: Mobile Fixed Bottom Bar Overlap
**What goes wrong:** Results page content hidden behind mobile bottom navigation bar.
**Why it happens:** AppLayout already has `pb-24 md:pb-8` but results page may need different padding since it has no Next/Back buttons in the same way.
**How to avoid:** Check that the results page "Edit heirs" button doesn't duplicate with WizardShell's bottom nav. Results step should have its own navigation layout.
**Warning signs:** Content cut off at bottom on mobile devices.

## Code Examples

Verified patterns from the existing codebase and official sources:

### Calling the Engine and Storing Results
```typescript
// In wizardStore.ts -- new action
calculateShares: () => {
  const input = get().buildFaraidInput()
  const results = calculateInheritance(input)
  set({ results, currentStep: 4, completedSteps: [...get().completedSteps, 3] })
}
```

### BDT Formatting (Verified)
```typescript
// Verified via Node.js: Intl.NumberFormat('en-IN', { currency: 'BDT', currencyDisplay: 'narrowSymbol' })
// 5000000 -> "৳50,00,000" (50 lakh)
// 10000000 -> "৳1,00,00,000" (1 crore)
// 100000 -> "৳1,00,000" (1 lakh)
const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
```

### Fraction Display (Verified)
```typescript
// Verified via Node.js with fraction.js ^5.3.4
import Fraction from 'fraction.js'

const f = new Fraction(1, 3)
f.toFraction()    // "1/3"
f.valueOf()       // 0.3333333333333333
(f.valueOf() * 100).toFixed(1) + '%'  // "33.3%"

// For per-heir vs total when count > 1:
// share.sharePerHeir.toFraction() -> "7/24" (each)
// share.totalShare.toFraction() -> "7/8" (total)
```

### Quran Reference Rendering
```typescript
// Source: existing references.ts + quran-references.ts
import { getShareReference } from '@/core/faraid/references'

const refs = getShareReference('wife') // Returns IslamicReference[]
// refs[0].reference = "Quran 4:12"
// refs[0].arabicText = full Arabic verse text
// refs[0].englishText = English translation
```

### Updating WIZARD_STEPS
```typescript
// In src/types/wizard.ts -- add 4th step
export const WIZARD_STEPS: WizardStep[] = [
  { number: 1, label: 'Relationship', shortLabel: 'Relationship' },
  { number: 2, label: 'Family', shortLabel: 'Family' },
  { number: 3, label: 'Siblings', shortLabel: 'Siblings' },
  { number: 4, label: 'Results', shortLabel: 'Results' },
]
```

### Adjustment Badge Data
```typescript
// For Awl/Radd badges on affected cards:
// ShareResult.notes[] contains strings like:
// "Awl applied: original share 1/2 adjusted to 3/7"
// "Radd applied: original 1/3 + surplus 1/18 = 7/18"
// Parse original vs adjusted from the Fraction objects:
// share.notes?.find(n => n.startsWith('Awl applied:') || n.startsWith('Radd applied:'))

// Better: extract directly from FaraidOutput
// output.adjustment === 'awl' or 'radd' tells you which
// output.totalBeforeAdjustment tells you if shares exceed/fall short of 1
```

### Special Case Display Data
```typescript
// FaraidOutput.specialCases is string[] containing any of:
// ['kalalah', 'umariyyatayn', 'mushtarakah']
// Each has specific display requirements from CONTEXT.md
const specialCaseInfo: Record<string, { title: string, description: string }> = {
  kalalah: {
    title: 'Kalalah',
    description: 'The deceased has no children, no father, and no grandfather. Siblings inherit according to Quran 4:12 (uterine) and 4:176 (full/consanguine).',
  },
  umariyyatayn: {
    title: 'Umariyyatayn (Two Omari Cases)',
    description: "Per Omar's (RA) ruling: the mother receives 1/3 of the remainder after the spouse's share, not 1/3 of the entire estate.",
  },
  mushtarakah: {
    title: 'Mushtarakah (Shared Case)',
    description: 'Hanafi ruling: full siblings receive nothing as Asaba when there is no remainder. Note: Shafi\'i and Maliki schools would have full siblings share in the uterine siblings\' 1/3 portion.',
  },
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion/react` import from `motion` package | 2024 (v11+) | Already using correct import in WizardShell: `import { AnimatePresence, motion } from 'motion/react'` |
| `height: auto` via useMeasure | Direct `height: "auto"` in motion animate prop | motion v10+ | No need for `react-use-measure` -- motion handles `auto` natively |
| TailwindCSS 3 `tailwind.config.js` | TailwindCSS 4 `@theme` in CSS | 2024 | Already configured in `index.css` with oklch values |

**Deprecated/outdated:**
- `framer-motion` standalone package: merged into `motion` package. Project already uses correct `motion/react` import path.

## Open Questions

1. **Step 4 in StepIndicator Visual Treatment**
   - What we know: StepIndicator renders from WIZARD_STEPS array dynamically. Adding a 4th entry will auto-render.
   - What's unclear: Should the Results step circle look different (e.g., checkmark icon instead of number "4")?
   - Recommendation: Use standard numbered circle for consistency. The step indicator already handles completed/active states.

2. **Heir Type Display Names**
   - What we know: HeirType values are snake_case strings like `brother_full`, `daughter_of_son`.
   - What's unclear: No display name mapping exists in the codebase yet.
   - Recommendation: Create a `HEIR_TYPE_LABELS: Record<HeirType, string>` mapping (e.g., `brother_full` -> "Full Brother", `daughter_of_son` -> "Son's Daughter"). This is simple and can be done as part of this phase.

3. **Heir Type Icons**
   - What we know: CONTEXT.md specifies "heir type icon" on each card.
   - What's unclear: No icon set is installed or defined.
   - Recommendation: Use simple inline SVG icons or Unicode symbols. Keep it minimal -- male/female silhouette variations. Do not add an icon library (no new dependencies).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.0 |
| Config file | `vite.config.ts` (merged Vite+Vitest defineConfig) |
| Quick run command | `npx vitest run src/components/__tests__/results.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RSLT-01 | Each heir card shows fraction, percentage, and BDT amount | integration | `npx vitest run src/components/__tests__/results.test.tsx -t "displays fraction percentage and monetary"` | No -- Wave 0 |
| RSLT-02 | Each heir card shows expandable Quran/Hadith reference | integration | `npx vitest run src/components/__tests__/results.test.tsx -t "shows Quranic reference"` | No -- Wave 0 |
| RSLT-03 | Step-by-step accordion shows calculation explanation | integration | `npx vitest run src/components/__tests__/results.test.tsx -t "step accordion"` | No -- Wave 0 |
| RSLT-06 | Simple/Detailed toggle shows/hides detailed sections | integration | `npx vitest run src/components/__tests__/results.test.tsx -t "mode toggle"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/components/__tests__/results.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green (currently 243 tests, all passing) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/__tests__/results.test.tsx` -- covers RSLT-01, RSLT-02, RSLT-03, RSLT-06
- [ ] Test helper: mock `FaraidOutput` factory for consistent test data (various scenarios: simple, awl, radd, blocked heirs, special cases)

## Sources

### Primary (HIGH confidence)
- **Existing codebase** -- `src/core/faraid/types.ts` (FaraidOutput, ShareResult, CalculationStep, IslamicReference types), `src/core/faraid/engine.ts` (calculateInheritance pipeline), `src/core/faraid/references.ts` (getShareReference, getAllReferences), `src/stores/wizardStore.ts` (Zustand pattern), `src/components/wizard/WizardShell.tsx` (step navigation pattern)
- **fraction.js GitHub** -- `toFraction()`, `valueOf()` method signatures verified via Node.js execution with project's installed ^5.3.4
- **Intl.NumberFormat** -- BDT formatting with `en-IN` locale + `narrowSymbol` verified via Node.js execution: `৳50,00,000` format confirmed for lakh/crore grouping
- **motion.dev docs** -- AnimatePresence + `height: "auto"` animation support confirmed for motion ^12.x

### Secondary (MEDIUM confidence)
- [Motion accordion examples](https://examples.motion.dev/react/accordion) -- Official accordion pattern using height auto
- [MDN Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) -- Currency formatting API reference
- [fraction.js GitHub](https://github.com/infusion/Fraction.js/) -- Display method documentation

### Tertiary (LOW confidence)
- None -- all critical findings verified against codebase or runtime tests.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use
- Architecture: HIGH -- follows established patterns from Phase 2 (component-per-file, Zustand store, motion animations)
- Pitfalls: HIGH -- verified through codebase inspection (hardcoded step numbers, Arabic RTL, Fraction equality)
- Display formatting: HIGH -- BDT formatting and Fraction display verified via runtime execution

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable -- no moving parts, all dependencies locked)
