# Phase 2: Heir Input Wizard - Research

**Researched:** 2026-03-12
**Domain:** React multi-step wizard, state management, responsive UI with TailwindCSS 4
**Confidence:** HIGH

## Summary

Phase 2 transforms the placeholder App.tsx into a fully functional multi-step heir input wizard. The wizard is the entire app -- no landing page, no routing needed between separate "pages." The three steps (Relationship to deceased, Immediate family, Siblings) collect heir data and produce a `FaraidInput` object that feeds directly into the Phase 1 engine. The existing codebase already has React 19, TailwindCSS 4, Vite 8, and TypeScript 5.9 configured, so no framework decisions are needed.

The key technical decisions are: Zustand for cross-step state management (lightweight, TypeScript-native, persist middleware for free), no client-side router (the wizard is a single-page state machine, not multiple routes), and the `motion` package (formerly framer-motion) for step transition animations. TailwindCSS 4's built-in emerald color palette maps directly to the visual identity requirements, and its mobile-first breakpoint system handles the responsive design with no additional libraries.

**Primary recommendation:** Build a custom 3-step wizard as a state machine using Zustand for global wizard state, with each step as a self-contained React component. Use TailwindCSS 4's native emerald palette and @theme directive for the Islamic-accented design system. Skip client-side routing entirely -- conditional rendering driven by wizard step state is simpler, faster, and sufficient.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- 3 steps total: Step 1 (Relationship to deceased), Step 2 (Immediate family: spouse, children), Step 3 (Siblings: full/consanguine/uterine)
- Perspective-based entry: "I am calculating inheritance for my [Father/Mother/Husband/Wife/Brother/Sister/Other]" -- derives deceased gender + user's relationship naturally
- Free navigation: step indicators at top are clickable, users can jump back to any completed step and return
- Auto-include user as heir: selecting "my Father" auto-adds you as son/daughter in Step 2; editable
- Auto-include mother: when user picks "my Father," prompt "Is the deceased's wife (your mother) alive?" -- if yes, auto-add as wife heir
- Parents-deceased assumption: subtle info text on Step 1: "This calculator assumes the deceased's parents have passed away"
- No landing page: the wizard IS the app. Step 1 appears immediately with tagline "Islamic Inheritance Calculator"
- Stepper buttons: [ - ] count [ + ] style controls for all heir counts
- Progressive disclosure for sibling types: start with just "Brothers" and "Sisters" steppers. "Different types of siblings?" toggle expands to show full/consanguine/uterine sub-types
- Default to full siblings when types not expanded
- Conditional spouse display: male deceased shows "Wives" stepper (1-4 max), female deceased shows "Was she married?" checkbox (husband = 1)
- Modern minimal + Islamic accents: clean white-space-heavy layout with subtle Islamic geometric patterns, emerald green accents, Arabic calligraphy only for Quranic text
- Palette: white background, emerald green primary, warm gray text, gold for Quranic references
- Connected-dots step indicator: numbered circles connected by a line, active step highlighted in green, completed steps get checkmark
- English-only branding: "Jomi-Bhag" without Bengali script
- Light mode only
- Tooltips on demand: (?) icons next to terms like "consanguine siblings"
- No live share preview: results come after "Calculate" (Phase 3)
- Inline validation: red text under invalid fields, "Next" button disabled until valid
- MFLO toggle on Step 1 under "Advanced" section
- Full-width stacked layout on mobile (375px+), step indicator shrinks to compact dots, Next/Back as full-width bottom bar
- Desktop: centered card layout with comfortable padding

### Claude's Discretion
- State management library choice (Zustand suggested in roadmap)
- Routing approach (React Router or equivalent)
- Exact component architecture and file structure
- Stepper component implementation details
- Transition animations between steps
- Arabic font for Quranic text in tooltips/references
- Exact responsive breakpoints
- "Other" relationship option handling in Step 1

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HEIR-01 | User can specify their gender and marital status | Perspective-based Step 1 derives deceased gender from relationship selection; user gender inferred from relationship choice (e.g., "my Father" = user is son/daughter). Zustand store holds `userRelationship` and `deceasedGender`. |
| HEIR-02 | User can enter number of brothers (full, consanguine, uterine) and their spouse status | Step 3 sibling entry with progressive disclosure pattern. Stepper buttons for counts. Default to full siblings unless expanded. Maps to `HeirInput[]` with `brother_full`, `brother_consanguine`, `brother_uterine` types. |
| HEIR-03 | User can enter number of sisters (full, consanguine, uterine) and their spouse status | Same Step 3 pattern as HEIR-02. Stepper buttons with progressive disclosure for sub-types. Maps to `sister_full`, `sister_consanguine`, `sister_uterine`. |
| HEIR-04 | User can enter number of sons and daughters of the deceased | Step 2 immediate family entry with stepper buttons. Maps to `HeirInput` with types `son` and `daughter`. Auto-includes user when relationship implies child. |
| HEIR-05 | App assumes parents are deceased | Info text on Step 1. Engine types already exclude `father`/`mother` from wizard input (parents not in heir list). Wizard never offers parent entry fields. |
| DSGN-01 | Modern, exceptional UI design using React + TypeScript + TailwindCSS | TailwindCSS 4 @theme for emerald green design system, Islamic geometric SVG patterns, Noto Naskh Arabic font (already loaded), motion library for step transitions. |
| DSGN-02 | Fully mobile-responsive (responsive-first design) | TailwindCSS 4 mobile-first breakpoints. Default styles target 375px+, `md:` prefix for tablet (768px), `lg:` for desktop (1024px). Full-width stacked mobile layout, centered card on desktop. |
| DSGN-03 | Multi-step wizard flow (heir input -> property input -> valuation -> results) | 3-step wizard architecture within Phase 2 scope (heir input only). Future phases add property input and results as additional steps. Zustand store designed to be extensible for additional steps. |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI framework | Already installed, latest stable |
| TailwindCSS | 4.2.1 | Styling | Already installed, CSS-first config with @theme |
| TypeScript | 5.9.3 | Type safety | Already installed, strict mode enabled |
| Vite | 8.0.0 | Build tool | Already installed with React plugin |
| Zustand | 5.x (latest ~5.0.10) | Wizard state management | ~1KB, zero boilerplate, TypeScript-native, persist middleware built-in |
| motion | 12.x (latest ~12.35) | Step transition animations | Standard React animation library, formerly framer-motion, GPU-accelerated |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Noto Naskh Arabic | (Google Fonts) | Arabic calligraphy for Quranic text | Already loaded in index.css for tooltip references |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | React Context + useReducer | Context re-renders all consumers; fine for 3 steps but less clean for persist, devtools, and future phase extensions |
| Zustand | Jotai | Atom-based is more granular but wizard state is a single cohesive object; Zustand's object store is more natural |
| motion | CSS transitions only | CSS can handle simple fades, but AnimatePresence for enter/exit and direction-aware slides requires JS coordination |
| No router | React Router v7 | The wizard is a single page with step state. Router adds bundle size and complexity for zero benefit. Future phases (results, property) could still be wizard steps, not routes. |

**Installation:**
```bash
bun add zustand motion
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── core/
│   └── faraid/          # [EXISTING] Engine, types, validation
├── data/                # [EXISTING] Rules, references
├── components/
│   ├── wizard/
│   │   ├── WizardShell.tsx       # Wizard container, step navigation, progress indicator
│   │   ├── StepRelationship.tsx  # Step 1: Relationship to deceased + MFLO toggle
│   │   ├── StepFamily.tsx        # Step 2: Spouse + children (sons/daughters)
│   │   ├── StepSiblings.tsx      # Step 3: Siblings with progressive disclosure
│   │   └── steps.ts             # Step config array (label, component, validation)
│   ├── ui/
│   │   ├── StepIndicator.tsx     # Connected-dots progress bar
│   │   ├── StepperButton.tsx     # [ - ] count [ + ] reusable control
│   │   ├── Tooltip.tsx           # (?) info icon with popover
│   │   └── Button.tsx            # Styled primary/secondary buttons
│   └── layout/
│       └── AppLayout.tsx         # Centered card container, branding header
├── stores/
│   └── wizardStore.ts            # Zustand store for wizard state
├── hooks/
│   └── useWizardValidation.ts    # Per-step validation hook
├── types/
│   └── wizard.ts                 # Wizard-specific types (WizardState, RelationshipType)
├── App.tsx                       # Mounts AppLayout > WizardShell
├── index.css                     # TailwindCSS imports + @theme customization
├── main.tsx                      # React root (unchanged)
└── vite-env.d.ts
```

### Pattern 1: Zustand Store as Wizard State Machine

**What:** Single Zustand store holds all wizard state: current step, heir data, deceased gender, MFLO toggle, and computed `FaraidInput`.

**When to use:** Always -- this is the central data store for the wizard.

**Example:**
```typescript
// src/stores/wizardStore.ts
import { create } from 'zustand'

type RelationshipType = 'father' | 'mother' | 'husband' | 'wife' | 'brother' | 'sister' | 'other'

interface WizardState {
  // Navigation
  currentStep: number
  completedSteps: Set<number>

  // Step 1
  relationship: RelationshipType | null
  deceasedGender: 'male' | 'female' | null
  userGender: 'male' | 'female' | null
  mfloEnabled: boolean
  motherAlive: boolean | null // for "my Father" flow

  // Step 2
  wifeCount: number       // 0-4 if deceased is male
  husbandPresent: boolean // true/false if deceased is female
  sonCount: number
  daughterCount: number

  // Step 3
  siblingTypeExpanded: boolean
  brotherFullCount: number
  brotherConsanguineCount: number
  brotherUterineCount: number
  sisterFullCount: number
  sisterConsanguineCount: number
  sisterUterineCount: number

  // Actions
  setStep: (step: number) => void
  setRelationship: (rel: RelationshipType) => void
  // ... more actions

  // Computed
  buildFaraidInput: () => FaraidInput
}

const useWizardStore = create<WizardState>()((set, get) => ({
  currentStep: 1,
  completedSteps: new Set(),
  relationship: null,
  // ... initial values

  setStep: (step) => set({ currentStep: step }),
  setRelationship: (rel) => {
    const deceasedGender = deriveDeceasedGender(rel)
    set({ relationship: rel, deceasedGender })
  },

  buildFaraidInput: () => {
    const state = get()
    const heirs: HeirInput[] = []
    // Map wizard state to HeirInput array
    if (state.deceasedGender === 'male' && state.wifeCount > 0) {
      heirs.push({ type: 'wife', count: state.wifeCount })
    }
    // ... etc
    return { deceasedGender: state.deceasedGender!, heirs, mfloEnabled: state.mfloEnabled }
  },
}))
```

### Pattern 2: Stepper Button as Reusable Component

**What:** A `[ - ] count [ + ]` component with min/max bounds, used for all heir count inputs.

**When to use:** Every heir count field (wives, sons, daughters, brothers, sisters).

**Example:**
```typescript
// src/components/ui/StepperButton.tsx
interface StepperButtonProps {
  label: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  tooltip?: string
}

function StepperButton({ label, value, min = 0, max = 99, onChange, tooltip }: StepperButtonProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <span className="text-gray-700 font-medium">{label}</span>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-10 h-10 rounded-full border-2 border-emerald-300 text-emerald-600
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
        >
          -
        </button>
        <span className="w-8 text-center text-lg font-semibold text-gray-800">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-10 h-10 rounded-full border-2 border-emerald-300 text-emerald-600
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )
}
```

### Pattern 3: Step Transitions with motion AnimatePresence

**What:** Direction-aware slide animations when navigating between wizard steps.

**When to use:** Every step transition (forward and backward).

**Example:**
```typescript
// src/components/wizard/WizardShell.tsx
import { AnimatePresence, motion } from 'motion/react'

function WizardShell() {
  const { currentStep } = useWizardStore()
  const [direction, setDirection] = useState(0) // -1 back, +1 forward

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={currentStep}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {currentStep === 1 && <StepRelationship />}
        {currentStep === 2 && <StepFamily />}
        {currentStep === 3 && <StepSiblings />}
      </motion.div>
    </AnimatePresence>
  )
}
```

### Pattern 4: Connected-Dots Step Indicator

**What:** Numbered circles connected by lines. Active step green, completed steps get checkmark.

**When to use:** Top of wizard shell, visible on all steps.

**Example:**
```typescript
// src/components/ui/StepIndicator.tsx
const steps = [
  { number: 1, label: 'Relationship' },
  { number: 2, label: 'Family' },
  { number: 3, label: 'Siblings' },
]

function StepIndicator({ currentStep, completedSteps, onStepClick }: Props) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => (
        <Fragment key={step.number}>
          {/* Circle */}
          <button
            onClick={() => onStepClick(step.number)}
            disabled={!completedSteps.has(step.number) && step.number !== currentStep}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
              step.number === currentStep && 'bg-emerald-600 text-white shadow-lg',
              completedSteps.has(step.number) && step.number !== currentStep && 'bg-emerald-100 text-emerald-700 cursor-pointer',
              !completedSteps.has(step.number) && step.number !== currentStep && 'bg-gray-100 text-gray-400',
            )}
          >
            {completedSteps.has(step.number) && step.number !== currentStep ? '✓' : step.number}
          </button>
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div className={cn(
              'w-12 h-0.5 md:w-20',
              completedSteps.has(step.number) ? 'bg-emerald-400' : 'bg-gray-200',
            )} />
          )}
        </Fragment>
      ))}
    </div>
  )
}
```

### Pattern 5: TailwindCSS 4 @theme Design System

**What:** Custom theme tokens defined via CSS @theme directive for consistent emerald + gold palette.

**When to use:** In index.css, consumed by all components through Tailwind utility classes.

**Example:**
```css
/* src/index.css */
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-arabic: 'Noto Naskh Arabic', serif;

  /* Gold accent for Quranic references */
  --color-gold-50: oklch(98% 0.02 90);
  --color-gold-100: oklch(95% 0.05 85);
  --color-gold-500: oklch(75% 0.15 75);
  --color-gold-600: oklch(65% 0.15 70);

  /* Animation for step transitions */
  --animate-slide-in: slide-in 0.3s ease-out;

  @keyframes slide-in {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
}
```

### Anti-Patterns to Avoid
- **Prop drilling wizard state:** Do NOT pass wizard state through props from App > WizardShell > Steps. Use the Zustand store directly in each step component. Each step calls `useWizardStore()` to read/write its own slice of state.
- **Form library overkill:** Do NOT add react-hook-form or Formik. The wizard uses stepper buttons (not text inputs), so there is no native form element to manage. Zustand handles the state directly.
- **One giant component:** Do NOT build all three steps in a single file. Each step is its own component with its own validation logic.
- **Global CSS classes:** Do NOT write custom CSS classes. Use TailwindCSS utility classes exclusively (except for @theme tokens and SVG patterns).
- **Router for wizard navigation:** Do NOT install React Router for step transitions. The wizard is a state machine, not a multi-page app. URL-based routing adds complexity for zero user benefit in a 3-step wizard.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-step state persistence | Custom localStorage sync | Zustand persist middleware | Handles serialization, rehydration, versioning, race conditions |
| Step transition animations | CSS keyframes with state | motion AnimatePresence | Enter/exit animations, direction awareness, cancellation handling |
| Responsive breakpoints | Custom media queries | TailwindCSS mobile-first utilities | Already configured, consistent, no CSS to maintain |
| Color palette generation | Manual oklch values | TailwindCSS built-in emerald + amber palettes | Pre-computed, accessible, 11 shades each |
| Islamic geometric patterns | SVG path generation | Static SVG from heropatterns.com or pattern.monster | Reliable, lightweight, one-time asset |
| Tooltip positioning | Manual absolute positioning | CSS anchor positioning or simple relative/absolute | Browser-native, no library needed for simple hover/tap tooltips |

**Key insight:** The wizard UI is deceptively simple -- stepper buttons, conditional fields, and step navigation. The complexity is in the state logic (auto-includes, relationship-driven derivations, validation), not in the rendering. Zustand handles the complex state; TailwindCSS handles the visual design. No form library, no router, no UI component library needed.

## Common Pitfalls

### Pitfall 1: Wizard State Becoming Inconsistent Across Steps
**What goes wrong:** User selects "my Father" in Step 1 (auto-adds as son in Step 2), then goes back and changes to "my Wife" -- Step 2 still shows auto-added son.
**Why it happens:** Auto-include logic runs on Step 1 change but doesn't clean up when relationship changes.
**How to avoid:** When `setRelationship()` fires, reset all auto-included heirs from the previous relationship. Store auto-included heirs separately from user-entered heirs so they can be cleanly replaced.
**Warning signs:** Heir counts that don't match what the user explicitly entered.

### Pitfall 2: Stepper Button Race Conditions on Mobile
**What goes wrong:** Rapid tapping of + button increments count beyond max.
**Why it happens:** Touch events can fire faster than React state updates.
**How to avoid:** Enforce min/max in the onChange handler, not in disabled state alone. The `Math.min(max, value + 1)` pattern prevents over-increment regardless of render timing.
**Warning signs:** Wife count reaching 5+, or negative counts.

### Pitfall 3: Progressive Disclosure State Loss
**What goes wrong:** User expands sibling types, enters consanguine brothers, then collapses the section. When re-expanded, counts are gone.
**Why it happens:** Conditional rendering unmounts the sub-type fields, losing local state.
**How to avoid:** Store ALL sibling counts in Zustand regardless of whether the expanded view is shown. Toggle only controls visibility, not data existence. When collapsed, show aggregated count (all types summed as "brothers") but preserve individual type counts.
**Warning signs:** Users losing entered data when toggling the sibling type disclosure.

### Pitfall 4: FaraidInput Mapping Errors
**What goes wrong:** Wizard builds HeirInput array with wrong types, zero-count heirs, or missing the user-as-heir entry.
**Why it happens:** Mapping wizard UI state (counts) to engine types (HeirInput[]) has many conditional paths.
**How to avoid:** Write `buildFaraidInput()` as a pure function with comprehensive unit tests. Test every relationship type + heir combination. Filter out zero-count heirs before passing to engine. Use the existing `validateHeirInput()` from core as a final safety check.
**Warning signs:** Engine throwing validation errors that should have been caught by the wizard.

### Pitfall 5: Mobile Layout Breaking at 375px
**What goes wrong:** Stepper buttons overflow horizontally, step indicator text truncates, bottom navigation buttons stack awkwardly.
**Why it happens:** Designing desktop-first and retrofitting mobile, or not testing at exact 375px.
**How to avoid:** Design mobile layout FIRST (default TailwindCSS classes), then add `md:` and `lg:` prefixes for larger screens. Use `w-full` as default, `md:w-auto` or `md:max-w-lg` for desktop centering. Test at 375px (iPhone SE) during development.
**Warning signs:** Horizontal scrollbar appearing on mobile, tap targets smaller than 44x44px.

### Pitfall 6: "Other" Relationship Handling
**What goes wrong:** "Other" option in Step 1 breaks the auto-include and deceased gender derivation logic.
**Why it happens:** "Other" doesn't imply a specific relationship to the deceased.
**How to avoid:** When "Other" is selected, show explicit deceased gender selector (male/female) and skip all auto-include logic. No user-as-heir is added. All heir entry is fully manual.
**Warning signs:** Null deceased gender reaching Step 2 or the engine.

## Code Examples

### Relationship-to-Deceased-Gender Derivation
```typescript
// Source: Derived from CONTEXT.md decisions
type RelationshipType = 'father' | 'mother' | 'husband' | 'wife' | 'brother' | 'sister' | 'other'

function deriveDeceasedGender(relationship: RelationshipType): 'male' | 'female' | null {
  switch (relationship) {
    case 'father':
    case 'husband':
    case 'brother':
      return 'male'
    case 'mother':
    case 'wife':
    case 'sister':
      return 'female'
    case 'other':
      return null // must be selected explicitly
  }
}

function deriveUserGender(relationship: RelationshipType): 'male' | 'female' | null {
  switch (relationship) {
    case 'husband': return 'male'   // user is male (wife's heir)
    case 'wife': return 'female'    // user is female (husband's heir)
    default: return null            // ambiguous -- sons and daughters both say "my Father"
  }
}
```

### Auto-Include Logic
```typescript
// Source: CONTEXT.md - Auto-include user as heir
function getAutoIncludes(relationship: RelationshipType, userGender: 'male' | 'female' | null, motherAlive: boolean | null) {
  const autoHeirs: { type: HeirType; count: number }[] = []

  switch (relationship) {
    case 'father':
      // User is a child of the deceased
      if (userGender === 'male') autoHeirs.push({ type: 'son', count: 1 })
      else if (userGender === 'female') autoHeirs.push({ type: 'daughter', count: 1 })
      // Mother as wife heir
      if (motherAlive) autoHeirs.push({ type: 'wife', count: 1 })
      break
    case 'mother':
      // User is a child of the deceased
      if (userGender === 'male') autoHeirs.push({ type: 'son', count: 1 })
      else if (userGender === 'female') autoHeirs.push({ type: 'daughter', count: 1 })
      break
    case 'husband':
      // User (male) is the husband -- but deceased is female, so user = husband heir
      autoHeirs.push({ type: 'husband', count: 1 })
      break
    case 'wife':
      // User (female) is a wife -- deceased is male, so user = wife heir
      autoHeirs.push({ type: 'wife', count: 1 })
      break
    case 'brother':
    case 'sister':
      // User is a sibling -- auto-add as full sibling by default
      if (relationship === 'brother') autoHeirs.push({ type: 'brother_full', count: 1 })
      else autoHeirs.push({ type: 'sister_full', count: 1 })
      break
    case 'other':
      // No auto-includes
      break
  }
  return autoHeirs
}
```

### Wizard State to FaraidInput Mapping
```typescript
// Source: Phase 1 types.ts API
function buildFaraidInput(state: WizardState): FaraidInput {
  const heirs: HeirInput[] = []

  // Spouse
  if (state.deceasedGender === 'male' && state.wifeCount > 0) {
    heirs.push({ type: 'wife', count: state.wifeCount })
  }
  if (state.deceasedGender === 'female' && state.husbandPresent) {
    heirs.push({ type: 'husband', count: 1 })
  }

  // Children
  if (state.sonCount > 0) heirs.push({ type: 'son', count: state.sonCount })
  if (state.daughterCount > 0) heirs.push({ type: 'daughter', count: state.daughterCount })

  // Siblings
  if (state.siblingTypeExpanded) {
    if (state.brotherFullCount > 0) heirs.push({ type: 'brother_full', count: state.brotherFullCount })
    if (state.brotherConsanguineCount > 0) heirs.push({ type: 'brother_consanguine', count: state.brotherConsanguineCount })
    if (state.brotherUterineCount > 0) heirs.push({ type: 'brother_uterine', count: state.brotherUterineCount })
    if (state.sisterFullCount > 0) heirs.push({ type: 'sister_full', count: state.sisterFullCount })
    if (state.sisterConsanguineCount > 0) heirs.push({ type: 'sister_consanguine', count: state.sisterConsanguineCount })
    if (state.sisterUterineCount > 0) heirs.push({ type: 'sister_uterine', count: state.sisterUterineCount })
  } else {
    // Default: all brothers/sisters are full type
    const totalBrothers = state.brotherFullCount + state.brotherConsanguineCount + state.brotherUterineCount
    const totalSisters = state.sisterFullCount + state.sisterConsanguineCount + state.sisterUterineCount
    if (totalBrothers > 0) heirs.push({ type: 'brother_full', count: totalBrothers })
    if (totalSisters > 0) heirs.push({ type: 'sister_full', count: totalSisters })
  }

  return {
    deceasedGender: state.deceasedGender!,
    heirs,
    mfloEnabled: state.mfloEnabled,
  }
}
```

### Responsive Mobile-First Card Layout
```typescript
// Source: TailwindCSS 4 responsive design docs
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-4 py-6 text-center md:py-8">
        <h1 className="text-2xl font-bold text-emerald-800 md:text-3xl">Jomi-Bhag</h1>
        <p className="text-sm text-gray-500 mt-1">Islamic Inheritance Calculator</p>
      </header>

      {/* Main card - full width mobile, centered card desktop */}
      <main className="px-4 pb-24 md:pb-8 md:max-w-lg md:mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| framer-motion package | motion package (import from 'motion/react') | 2025 | Package renamed; use `bun add motion`, import from `motion/react` |
| TailwindCSS config in tailwind.config.js | TailwindCSS 4 @theme directive in CSS | 2024-2025 | No JS config file; all theme tokens in CSS |
| TailwindCSS rgb colors | TailwindCSS 4 oklch colors | 2025 | Wider gamut, more vivid; emerald palette already uses oklch |
| Zustand v4 `create<T>()(...)` | Zustand v5 same API | 2024 | API is stable; persist middleware syntax unchanged |
| react-hook-form for all forms | Direct state for stepper-only forms | 2025 | React Hook Form is for text inputs and complex validation; stepper buttons are just `onChange(value)` |

**Deprecated/outdated:**
- `framer-motion` package name: Use `motion` instead (import from `motion/react`)
- `tailwind.config.js`: TailwindCSS 4 uses CSS-first configuration via `@theme`
- `@apply` directive: Still works in TailwindCSS 4 but utility classes preferred; `@theme` variables handle design tokens

## Open Questions

1. **User gender disambiguation for "my Father" / "my Mother"**
   - What we know: When user selects "my Father," they could be a son or daughter. This affects auto-include.
   - What's unclear: Should we ask "Are you male or female?" as a follow-up, or should Step 2 just show son/daughter counts and let the user verify?
   - Recommendation: Show a brief gender selector ("I am the deceased's [son/daughter]") immediately after selecting "my Father/Mother." This is lightweight and avoids ambiguity.

2. **"Other" relationship -- what heirs does the user enter?**
   - What we know: "Other" skips all auto-include logic. User must specify deceased gender manually.
   - What's unclear: Should "Other" give access to ALL heir types including parents/grandparents?
   - Recommendation: "Other" shows deceased gender selector + full manual entry of all heir types available to this wizard (spouse, children, siblings). Do NOT expose parent/grandparent heirs since HEIR-05 assumes parents deceased.

3. **Spouse status for siblings (HEIR-02/03 mention "spouse status")**
   - What we know: HEIR-02 and HEIR-03 mention "spouse status" for brothers and sisters.
   - What's unclear: The Faraid engine types don't include spouse status for siblings. The engine only cares about type and count.
   - Recommendation: This appears to be a requirements clarification issue. The engine has no concept of sibling spouse status. Skip this field -- it has no effect on inheritance calculation under Faraid rules. If needed later, it can be added as metadata.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | vite.config.ts (merged Vite+Vitest config) |
| Quick run command | `bun run test:run` |
| Full suite command | `bun run test:run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HEIR-01 | Relationship selection derives deceased gender + user gender | unit | `bun vitest run src/stores/__tests__/wizardStore.test.ts -t "relationship"` | No - Wave 0 |
| HEIR-02 | Brother counts (full/consanguine/uterine) map to HeirInput[] | unit | `bun vitest run src/stores/__tests__/wizardStore.test.ts -t "brothers"` | No - Wave 0 |
| HEIR-03 | Sister counts (full/consanguine/uterine) map to HeirInput[] | unit | `bun vitest run src/stores/__tests__/wizardStore.test.ts -t "sisters"` | No - Wave 0 |
| HEIR-04 | Son/daughter counts map to HeirInput[] | unit | `bun vitest run src/stores/__tests__/wizardStore.test.ts -t "children"` | No - Wave 0 |
| HEIR-05 | Parents excluded from wizard input; info text displayed | unit + component | `bun vitest run src/stores/__tests__/wizardStore.test.ts -t "parents"` | No - Wave 0 |
| DSGN-01 | UI renders without errors, key design elements present | component | `bun vitest run src/components/__tests__/wizard.test.tsx` | No - Wave 0 |
| DSGN-02 | Mobile viewport renders without overflow | manual-only | Manual: Chrome DevTools 375px viewport | N/A |
| DSGN-03 | Wizard navigates through all 3 steps | component | `bun vitest run src/components/__tests__/wizard.test.tsx -t "navigation"` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `bun run test:run`
- **Per wave merge:** `bun run test:run`
- **Phase gate:** Full suite green (158 existing + new wizard tests) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/stores/__tests__/wizardStore.test.ts` -- covers HEIR-01 through HEIR-05 (state logic, FaraidInput building)
- [ ] `src/components/__tests__/wizard.test.tsx` -- covers DSGN-01, DSGN-03 (component rendering, step navigation)
- [ ] `src/components/__tests__/StepperButton.test.tsx` -- covers stepper button min/max/increment behavior
- [ ] Vitest config already supports `*.test.tsx` in jsdom environment -- no framework changes needed

## Sources

### Primary (HIGH confidence)
- [TailwindCSS 4 Theme Variables docs](https://tailwindcss.com/docs/theme) - @theme syntax, color namespaces, breakpoint customization
- [TailwindCSS 4 Responsive Design docs](https://tailwindcss.com/docs/responsive-design) - Mobile-first breakpoints, default values
- [TailwindCSS 4 Colors docs](https://tailwindcss.com/docs/customizing-colors) - Emerald and amber palette oklch values
- [Zustand GitHub](https://github.com/pmndrs/zustand) - v5 API, create store syntax, TypeScript patterns
- [Motion docs](https://motion.dev/docs/react) - Package name, import syntax, AnimatePresence usage

### Secondary (MEDIUM confidence)
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) - persist + createJSONStorage API, verified with npm registry
- [motion npm registry](https://www.npmjs.com/package/motion) - v12.35.2 latest, actively maintained
- [zustand npm registry](https://www.npmjs.com/package/zustand) - v5.0.10 latest, persist race condition fix

### Tertiary (LOW confidence)
- [BuildUI Framer Motion Wizard Recipe](https://buildui.com/courses/framer-motion-recipes/multistep-wizard) - Referenced but not verified; pattern aligns with official docs
- Islamic geometric SVG pattern generators (heropatterns.com, pattern.monster) - Not verified for specific Islamic patterns; may need manual SVG creation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All core libraries verified via npm, official docs, and existing project package.json
- Architecture: HIGH - Wizard state machine pattern is well-established; Zustand + conditional rendering is standard React
- Pitfalls: HIGH - Identified from first-principles analysis of the wizard's specific logic (auto-includes, progressive disclosure, FaraidInput mapping)
- Design system: MEDIUM - TailwindCSS 4 @theme verified, but exact Islamic geometric pattern assets need sourcing
- Motion animations: MEDIUM - Package verified, but specific wizard transition patterns from BuildUI are unverified

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable ecosystem, no fast-moving dependencies)
