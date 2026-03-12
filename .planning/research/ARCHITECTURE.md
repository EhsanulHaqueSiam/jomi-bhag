# Architecture Research

**Domain:** Islamic Inheritance (Faraid) Land Division Calculator -- Bangladesh
**Researched:** 2026-03-12
**Confidence:** HIGH

## System Overview

```
+-----------------------------------------------------------------------+
|                       Presentation Layer (React)                       |
|  +------------+  +-------------+  +-----------+  +-----------+        |
|  | Wizard UI  |  | Results     |  | Chart     |  | PDF       |        |
|  | (Steps 1-4)|  | Dashboard   |  | Visualiz. |  | Export    |        |
|  +-----+------+  +------+------+  +-----+-----+  +-----+-----+       |
|        |                |               |               |              |
+--------+----------------+---------------+---------------+--------------+
|                      State Layer (Zustand)                             |
|  +---------------+  +----------------+  +------------------+          |
|  | Wizard Store  |  | Calculation    |  | Settings Store   |          |
|  | (form data,   |  | Results Store  |  | (mode, persist)  |          |
|  |  step state)  |  |                |  |                  |          |
|  +-------+-------+  +-------+--------+  +------------------+          |
|          |                   |                                         |
+----------+-------------------+-----------------------------------------+
|                   Computation Layer (Pure TypeScript)                   |
|  +----------------+  +------------------+  +-------------------+      |
|  | Faraid Engine  |  | Property         |  | Price             |      |
|  | (shares, awl,  |  | Valuation Engine |  | Estimation Module |      |
|  |  radd, hajb)   |  | (land + assets)  |  | (mouza + market)  |      |
|  +----------------+  +------------------+  +-------------------+      |
|                                                                        |
+------------------------------------------------------------------------+
|                     Data Layer (Static + localStorage)                  |
|  +------------------+  +--------------+  +------------------+         |
|  | Faraid Rules     |  | Price Data   |  | User Sessions    |         |
|  | (Quran refs,     |  | (static JSON |  | (localStorage    |         |
|  |  share tables)   |  |  mouza rates)|  |  via Zustand     |         |
|  +------------------+  +--------------+  |  persist)         |         |
|                                          +------------------+         |
+------------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Wizard UI | Multi-step form: heir input, property input, valuation, review | React components + React Hook Form + Zod per step |
| Results Dashboard | Display calculated shares as fractions, percentages, monetary values | React components consuming calculation store |
| Chart Visualization | Pie/donut charts showing inheritance distribution | Recharts PieChart/Cell components |
| PDF Export | Generate downloadable inheritance report | @react-pdf/renderer (React-native PDF components) |
| Wizard Store | Form data across steps, current step, navigation state | Zustand store with persist middleware |
| Calculation Results Store | Computed Faraid output, derived monetary values | Zustand store (ephemeral, recomputed on input change) |
| Settings Store | Simple/detailed mode toggle, user preferences | Zustand store with persist middleware |
| Faraid Engine | Pure math: fixed shares, residuary, Awl, Radd, Hajb | Pure TypeScript functions using Fraction.js |
| Property Valuation Engine | Combine land area, structures, trees into total estate value | Pure TypeScript functions |
| Price Estimation Module | Suggest land prices from static data, allow user override | Static JSON lookup + user input |
| Faraid Rules Data | Quranic verse references, Hadith citations, share tables | Static TypeScript constants/JSON |
| Price Data | Bangladesh mouza rates, district-level price ranges | Static JSON (manually curated, periodically updated) |
| User Sessions | Persist in-progress calculations across browser sessions | Zustand persist middleware to localStorage |

## Recommended Project Structure

```
src/
+-- core/                    # Pure computation (ZERO React imports)
|   +-- faraid/              # Islamic inheritance engine
|   |   +-- types.ts         # HeirType, ShareResult, FaraidInput, FaraidOutput
|   |   +-- engine.ts        # Main calculate() function
|   |   +-- shares.ts        # Fixed share (fard) lookup tables
|   |   +-- residuary.ts     # Asaba (residuary) distribution logic
|   |   +-- blocking.ts      # Hajb (blocking) rules
|   |   +-- adjustments.ts   # Awl (reduction) and Radd (return) logic
|   |   +-- references.ts    # Quran/Hadith citations per rule
|   |   +-- validation.ts    # Input validation (heir combination validity)
|   |   +-- __tests__/       # Comprehensive test cases
|   +-- property/            # Property valuation
|   |   +-- types.ts         # PropertyType, LandParcel, Structure, etc.
|   |   +-- valuation.ts     # Total estate value computation
|   |   +-- pricing.ts       # Price suggestion logic
|   +-- utils/               # Shared computation utilities
|       +-- fractions.ts     # Fraction.js wrapper utilities
|       +-- currency.ts      # BDT formatting, rounding rules
+-- stores/                  # Zustand state management
|   +-- wizardStore.ts       # Multi-step form state + persistence
|   +-- calculationStore.ts  # Derived calculation results
|   +-- settingsStore.ts     # App-level preferences
+-- components/              # React UI components
|   +-- wizard/              # Multi-step form components
|   |   +-- WizardLayout.tsx # Step container, progress bar, navigation
|   |   +-- steps/
|   |   |   +-- HeirInputStep.tsx      # Step 1: Enter heir details
|   |   |   +-- PropertyInputStep.tsx  # Step 2: Enter property details
|   |   |   +-- ValuationStep.tsx      # Step 3: Price/valuation
|   |   |   +-- ReviewStep.tsx         # Step 4: Confirm & calculate
|   |   +-- fields/          # Reusable form field components
|   +-- results/             # Results display components
|   |   +-- ResultsDashboard.tsx   # Main results view
|   |   +-- ShareBreakdown.tsx     # Per-heir share details
|   |   +-- ReferencePanel.tsx     # Quran/Hadith citations
|   |   +-- MonetaryTable.tsx      # Land area + monetary breakdown
|   +-- charts/              # Data visualization
|   |   +-- InheritancePieChart.tsx # Pie/donut chart of shares
|   |   +-- ComparisonChart.tsx    # Compare heirs side by side
|   +-- pdf/                 # PDF generation components
|   |   +-- ReportDocument.tsx     # @react-pdf/renderer Document
|   |   +-- ReportHeader.tsx       # PDF header section
|   |   +-- ReportShareTable.tsx   # PDF share breakdown table
|   |   +-- ReportReferences.tsx   # PDF Quran/Hadith references
|   +-- layout/              # App shell components
|   |   +-- Header.tsx
|   |   +-- Footer.tsx
|   |   +-- ModeToggle.tsx         # Simple/Detailed mode switch
|   +-- ui/                  # Shared UI primitives (shadcn/ui style)
+-- data/                    # Static data files
|   +-- faraid-rules.ts      # Complete Faraid rule definitions
|   +-- quran-references.ts  # Verse citations with text
|   +-- hadith-references.ts # Hadith citations
|   +-- pricing/             # BD price data
|       +-- districts.json   # District/upazila list
|       +-- mouza-rates.json # Government mouza rates (curated)
+-- hooks/                   # Custom React hooks
|   +-- useFaraidCalculation.ts  # Hook bridging store to engine
|   +-- usePropertyValuation.ts  # Hook for property calculations
|   +-- usePdfGeneration.ts      # Hook for PDF export trigger
+-- schemas/                 # Zod validation schemas
|   +-- heirSchema.ts        # Step 1 validation
|   +-- propertySchema.ts    # Step 2 validation
|   +-- valuationSchema.ts   # Step 3 validation
+-- lib/                     # Third-party wrappers
|   +-- fraction.ts          # Fraction.js configured instance
+-- App.tsx
+-- main.tsx
```

### Structure Rationale

- **core/:** The most critical architectural decision. All Faraid math and property valuation lives here with ZERO React imports. This means the engine can be unit-tested exhaustively without React rendering, can be reused in a future mobile app or API, and computation correctness is verifiable independent of UI concerns.
- **stores/:** Zustand stores act as the bridge between pure computation (core/) and React UI (components/). Stores call engine functions and hold results. This is thin glue, not business logic.
- **components/wizard/:** The multi-step form is the primary user journey. Each step is an independent component with its own Zod schema for per-step validation. The WizardLayout orchestrates step navigation without knowing step contents.
- **components/results/:** Entirely separate from input. Results components only read from the calculation store. This clean separation means results can be shown on a different page, embedded elsewhere, or used for PDF without coupling to the wizard.
- **components/pdf/:** Uses @react-pdf/renderer which has its own component tree (not HTML). PDF components mirror results components but use PDF-specific primitives (View, Text, etc.).
- **data/:** Static JSON and TypeScript constants. Price data is curated manually since Bangladesh has no public API for mouza rates. This is explicitly a "good enough" approach -- users always get a manual override.
- **schemas/:** Zod schemas separated from components so they can be shared between form validation and engine input validation.

## Architectural Patterns

### Pattern 1: Pure Computation Engine (Most Critical)

**What:** All Faraid calculation logic lives in `core/faraid/` as pure TypeScript functions with zero side effects. Functions take typed inputs and return typed outputs. No React, no state, no DOM.

**When to use:** Always, for the Faraid engine. This is non-negotiable for a calculator where correctness is paramount and must be verifiable through tests.

**Trade-offs:** Requires explicit bridging between UI state and engine (via hooks/stores). Worth it for testability and correctness guarantees.

**Example:**
```typescript
// core/faraid/types.ts
import Fraction from 'fraction.js';

export type HeirType =
  | 'son' | 'daughter'
  | 'husband' | 'wife'
  | 'brother_full' | 'sister_full'
  | 'brother_paternal' | 'sister_paternal'
  | 'brother_maternal' | 'sister_maternal';

export interface HeirInput {
  type: HeirType;
  count: number;
}

export interface FaraidInput {
  deceased_gender: 'male' | 'female';
  heirs: HeirInput[];
  total_estate: number; // in BDT
}

export interface ShareResult {
  heir_type: HeirType;
  count: number;
  share_fraction: Fraction;     // e.g., 1/8
  share_percentage: number;      // e.g., 12.5
  share_per_person: Fraction;   // fraction / count
  monetary_value: number;        // total_estate * percentage
  monetary_per_person: number;
  inheritance_type: 'fard' | 'asaba' | 'fard_and_asaba';
  quran_reference: string | null;
  hadith_reference: string | null;
  blocking_note: string | null;  // if this heir blocks others
}

export interface FaraidOutput {
  shares: ShareResult[];
  adjustment: 'none' | 'awl' | 'radd';
  awl_details?: { original_base: number; adjusted_base: number };
  radd_details?: { remainder_fraction: Fraction; distributed_to: HeirType[] };
  base_denominator: number; // common denominator for all shares
}

// core/faraid/engine.ts
export function calculateInheritance(input: FaraidInput): FaraidOutput {
  // Step 1: Validate heir combination
  // Step 2: Apply Hajb (blocking) rules
  // Step 3: Assign fixed shares (fard)
  // Step 4: Assign residuary shares (asaba)
  // Step 5: Check if adjustment needed (Awl or Radd)
  // Step 6: Attach Quran/Hadith references
  // Step 7: Compute monetary values
  // Returns typed FaraidOutput
}
```

### Pattern 2: Zustand Store as Computation Bridge

**What:** Zustand stores hold UI state (wizard form data) and derived computation state (Faraid results). When form data changes, the store calls the pure engine and caches results. Components subscribe to store slices.

**When to use:** For connecting wizard form data to the Faraid engine and making results available to all display components (dashboard, charts, PDF).

**Trade-offs:** Slight indirection vs. calling engine directly in components. Worth it because multiple components need the same computed results, and Zustand's selector pattern prevents unnecessary re-renders.

**Example:**
```typescript
// stores/calculationStore.ts
import { create } from 'zustand';
import { calculateInheritance } from '../core/faraid/engine';
import type { FaraidInput, FaraidOutput } from '../core/faraid/types';

interface CalculationStore {
  input: FaraidInput | null;
  result: FaraidOutput | null;
  compute: (input: FaraidInput) => void;
  reset: () => void;
}

export const useCalculationStore = create<CalculationStore>((set) => ({
  input: null,
  result: null,
  compute: (input) => {
    const result = calculateInheritance(input);
    set({ input, result });
  },
  reset: () => set({ input: null, result: null }),
}));
```

### Pattern 3: Step-Isolated Wizard with Shared State

**What:** Each wizard step is an independent React component with its own Zod validation schema. Steps read/write to the shared Zustand wizard store. The WizardLayout component manages navigation (next/prev/jump) and validates the current step's schema before allowing progression.

**When to use:** For the 4-step input flow (heirs, property, valuation, review).

**Trade-offs:** More files than a single giant form component. But each step is independently testable, new steps can be inserted without touching others, and per-step validation is clean.

**Example:**
```typescript
// schemas/heirSchema.ts
import { z } from 'zod';

export const heirInputSchema = z.object({
  user_gender: z.enum(['male', 'female']),
  user_spouse_status: z.enum(['married', 'unmarried', 'widowed']),
  brothers_count: z.number().int().min(0).max(50),
  sisters_count: z.number().int().min(0).max(50),
  brothers_married: z.array(z.object({
    spouse_count: z.number().int().min(0).max(4),
  })),
  // ... additional heir details
}).refine(
  (data) => data.brothers_count + data.sisters_count > 0,
  { message: 'At least one sibling is required for inheritance division' }
);
```

## Data Flow

### Primary Calculation Flow

```
User Input (Wizard Steps 1-4)
    |
    v
Wizard Store (Zustand, persisted to localStorage)
    |
    v   [User clicks "Calculate"]
Bridge Hook (useFaraidCalculation)
    |
    +---> Assemble FaraidInput from wizard store data
    |
    v
Property Valuation Engine (pure TS)
    |
    +---> Compute total estate value from land + structures + trees
    |
    v
Faraid Engine (pure TS, core/faraid/engine.ts)
    |
    +---> Step 1: Validate heir combination
    +---> Step 2: Apply Hajb (blocking) -- remove/reduce blocked heirs
    +---> Step 3: Assign Fard (fixed shares) using Fraction.js
    +---> Step 4: Assign Asaba (residuary) to remaining heirs
    +---> Step 5: Check total shares sum
    |       +---> Sum > 1: Apply Awl (proportional reduction)
    |       +---> Sum < 1 and no Asaba: Apply Radd (return excess)
    |       +---> Sum = 1: No adjustment needed
    +---> Step 6: Attach Quran/Hadith references per share
    +---> Step 7: Multiply fractions by total estate for monetary values
    |
    v
Calculation Results Store (Zustand, NOT persisted)
    |
    +---> Results Dashboard reads ShareResult[]
    +---> Chart components read shares for pie/donut
    +---> PDF component reads full FaraidOutput for report generation
```

### State Management

```
Wizard Store (persisted)                 Calculation Store (ephemeral)
    |                                         ^
    |  [form data: heirs, property,           |  [FaraidOutput: shares,
    |   valuation, user preferences]          |   adjustment, references]
    |                                         |
    +--- useFaraidCalculation hook -----------+
         (bridges form data to engine,
          writes results to calc store)
```

### Key Data Flows

1. **Heir Input to Share Calculation:** User enters heir counts and spouse statuses in Step 1. Data persists in wizard store. On calculate, the bridge hook maps this to HeirInput[] typed for the engine. Engine returns ShareResult[] with fractions computed via Fraction.js for exact arithmetic (no floating-point errors on 1/3, 1/6, etc.).

2. **Property to Monetary Value:** User enters land parcels, structures, and trees in Steps 2-3. Property valuation engine computes total estate value in BDT. This value is passed alongside heir data to the Faraid engine, which multiplies each heir's fractional share by the total to produce monetary values.

3. **Price Suggestion Flow:** When user enters a district/upazila in Step 3, the app looks up static mouza rate JSON. The suggested price auto-fills but the user can override. This is a one-way suggestion -- the static data is never authoritative, just helpful. The user's final price input is what the engine uses.

4. **Results to PDF:** The PDF generation component reads the full FaraidOutput from the calculation store. It constructs a @react-pdf/renderer Document tree (not HTML -- PDF has its own primitives). The user triggers download via a button. PDF generation happens entirely client-side with no server round-trip.

5. **Session Persistence:** The wizard store uses Zustand persist middleware with localStorage. If the user closes the browser mid-wizard, their inputs are restored on return. Calculation results are NOT persisted (recomputed from persisted inputs on demand) to avoid stale results.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10k users | Static site on Netlify, all computation client-side. No server needed. Zero scaling concerns -- every user runs their own computation in-browser. |
| 10k-100k users | Same architecture. Consider adding Netlify Edge Functions only if price data needs server-side fetching from a BD government source. Otherwise, static JSON bundled in the app is fine. |
| 100k+ users | Still client-side computation. If Bangla language support or multi-school (Shafi'i, Maliki, Hanbali) support is added, the engine grows but remains client-side. Consider code-splitting the engine per school if bundle size becomes a concern. |

### Scaling Priorities

1. **First bottleneck:** Bundle size if price data JSON grows large (many districts with detailed mouza rates). Solution: lazy-load price data per district, not the entire dataset upfront.
2. **Second bottleneck:** PDF generation for very complex cases. Solution: @react-pdf/renderer runs in a Web Worker if blocking the main thread becomes noticeable.

## Anti-Patterns

### Anti-Pattern 1: Mixing Faraid Logic with React Components

**What people do:** Put inheritance calculation logic directly in React components or event handlers. Inline fractional math with state updates.
**Why it's wrong:** Impossible to unit test without rendering React. Edge cases (Awl, Radd, Hajb) become untestable nightmares. A bug in one component's calculation logic is invisible until a user reports wrong results -- for a tool claiming Islamic accuracy, this is unacceptable.
**Do this instead:** All Faraid math in `core/faraid/` as pure functions. Test with dozens of known inheritance scenarios. Components only display results they receive.

### Anti-Pattern 2: Using Floating-Point for Share Computation

**What people do:** Use regular JavaScript numbers for fraction arithmetic (e.g., `1/3 + 1/6 = 0.5` but storing `0.33333...`).
**Why it's wrong:** Faraid shares are exact fractions (1/2, 1/4, 1/8, 2/3, 1/3, 1/6). Floating-point arithmetic introduces rounding errors that compound. When shares must sum to exactly 1 (or be adjusted via Awl/Radd), floating-point errors cause incorrect adjustments or shares that visibly do not add up.
**Do this instead:** Use Fraction.js for all share arithmetic. Fractions are stored as numerator/denominator BigInts. Only convert to decimal/percentage at the display layer.

### Anti-Pattern 3: Single Monolithic Form

**What people do:** Build the entire wizard as one giant form component with all validation in one schema and conditional rendering for steps.
**Why it's wrong:** Becomes unmaintainable quickly. Adding a new step requires understanding the entire form. Validation errors from future steps leak into the current step. State management becomes a tangled mess.
**Do this instead:** Each step is its own component with its own Zod schema. The WizardLayout manages navigation. Steps communicate only through the shared Zustand store.

### Anti-Pattern 4: Hardcoding Faraid Rules in the Engine

**What people do:** Embed Quranic share values as magic numbers throughout the calculation functions (e.g., `if (heir === 'wife') return 0.125`).
**Why it's wrong:** Rules become impossible to audit against Islamic sources. No traceability from output to Quran/Hadith. Adding a new school of jurisprudence requires rewriting the engine.
**Do this instead:** Define a rule table (data/faraid-rules.ts) that maps heir types to their shares, conditions, and source references. The engine reads from this table. The table is auditable by Islamic scholars.

### Anti-Pattern 5: Treating Price Data as Authoritative

**What people do:** Auto-fetch prices and use them directly in calculations without user confirmation.
**Why it's wrong:** Bangladesh mouza rates were last officially set in 2016 and are being phased out in favor of market-based pricing. Any static data will be outdated. Users who blindly trust auto-suggested prices will get inaccurate monetary divisions.
**Do this instead:** Always present price data as a suggestion with a clear label ("Estimated from government mouza rates -- please verify and adjust"). Require explicit user confirmation or override before using any price in calculations.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Bangladesh mouza rate data | Static JSON bundled at build time | No public API exists. Data must be manually curated from government PDFs (nha.gov.bd, district judiciary sites). Update periodically via a build-time script. Always allow user override. |
| Netlify Hosting | Static site deployment, no server functions needed | All computation is client-side. Netlify serves the built React app. No database, no API routes needed for core functionality. |
| Optional: Supabase/Firebase Auth | Only if "save calculation" feature is built | Defer to later phase. localStorage persistence covers the session-save use case for v1. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Wizard UI <-> Wizard Store | Zustand hooks (useWizardStore) | Components read/write form data. Store handles persistence. |
| Wizard Store <-> Faraid Engine | Bridge hook (useFaraidCalculation) | Hook assembles FaraidInput from store, calls engine, writes to calculation store. |
| Faraid Engine <-> Fraction.js | Direct function calls | Engine uses Fraction.js internally. Rest of app never touches Fraction.js directly. |
| Results Components <-> Calculation Store | Zustand selectors | Components subscribe to specific slices (shares, adjustment, references) to minimize re-renders. |
| PDF Components <-> Calculation Store | Read-only Zustand access | PDF document tree is built from the same FaraidOutput. No separate computation for PDF. |
| Price Module <-> Static JSON | ES module import (lazy) | Price data loaded on demand when user reaches valuation step. Not bundled in initial load. |

## Faraid Engine Internal Architecture

The engine is the heart of the application. Its internal structure deserves explicit documentation.

### Calculation Pipeline (Ordered Steps)

```
1. VALIDATE
   Input: HeirInput[]
   Output: ValidatedHeirs[] or ValidationError
   Logic: Check heir combination is valid (e.g., cannot have
          both husband and wife of the same deceased person)

2. BLOCK (Hajb)
   Input: ValidatedHeirs[]
   Output: ActiveHeirs[] (some heirs removed or shares reduced)
   Logic: Apply Hajb Hirman (complete blocking) and
          Hajb Nuqsan (partial blocking)
   Example: Son blocks brothers (Hajb Hirman)
            Children reduce mother from 1/3 to 1/6 (Hajb Nuqsan)

3. ASSIGN FIXED SHARES (Fard)
   Input: ActiveHeirs[]
   Output: FardAssignment[] (heir -> Fraction)
   Logic: Look up each heir's prescribed share from rule table
          based on who else is alive (conditions matter)
   Fractions: 1/2, 1/4, 1/8, 2/3, 1/3, 1/6

4. ASSIGN RESIDUARY (Asaba)
   Input: ActiveHeirs[], remaining fraction after Fard
   Output: AsabaAssignment[] (heir -> Fraction)
   Logic: Distribute remainder to Asaba heirs
          Male Asaba gets 2x female Asaba share (Quran 4:11)

5. ADJUST (Awl or Radd)
   Input: All assignments, total fraction sum
   Output: AdjustedAssignments[]
   Logic:
     If sum > 1: AWL -- increase common denominator,
                  proportionally reduce all fixed shares
     If sum < 1 and no Asaba: RADD -- return excess
                  proportionally to fixed-share heirs
                  (Hanafi: excluding spouses)
     If sum = 1: No adjustment

6. ANNOTATE
   Input: AdjustedAssignments[]
   Output: AnnotatedShares[] (with Quran/Hadith refs)
   Logic: Attach source references to each share from rule table

7. MONETIZE
   Input: AnnotatedShares[], total estate value (BDT)
   Output: FaraidOutput (final complete result)
   Logic: Multiply each fraction by total estate value
```

### Hanafi School Specifics (Bangladesh)

Since Bangladesh predominantly follows the Hanafi school, the engine should default to Hanafi rulings. Key Hanafi-specific rules:

- **Radd includes spouses:** In some interpretations. The Hanafi position is nuanced -- the predominant Hanafi view is that Radd does NOT go to spouses, same as other schools. Verify with a scholar before implementation.
- **Grandfather and siblings:** In Hanafi fiqh, the grandfather blocks siblings entirely (unlike Shafi'i where they can co-inherit). This simplifies the engine for Bangladesh use.
- **Umariyyatayn (two Omari cases):** When the heirs are spouse + mother + father, the mother gets 1/3 of the remainder after the spouse's share (not 1/3 of the total estate). This is agreed upon by all four schools but is a common implementation mistake.

### Test Strategy for the Engine

The engine MUST be tested against known, verified inheritance scenarios. Recommended test categories:

1. **Basic cases:** Only spouse(s), only children, only siblings
2. **Mixed heirs:** Spouse + children, spouse + siblings, children + siblings
3. **Awl cases:** Scenarios where shares exceed 1 (e.g., 2 daughters + mother + father + wife)
4. **Radd cases:** Scenarios where shares fall short and no Asaba exists
5. **Blocking (Hajb) cases:** Son blocking brothers, daughters blocking sisters
6. **Edge cases:** Single heir inherits everything, all heirs of same type
7. **Umariyyatayn:** The two special cases with spouse + parents

## Build Order Dependencies

Understanding component dependencies is critical for phasing the roadmap.

```
Phase 1 (Foundation):
  core/faraid/types.ts          -- Types first, everything depends on them
  core/faraid/shares.ts         -- Fixed share lookup table
  core/faraid/blocking.ts       -- Hajb rules
  core/faraid/residuary.ts      -- Asaba distribution
  core/faraid/adjustments.ts    -- Awl and Radd
  core/faraid/engine.ts         -- Orchestrates the above
  core/faraid/__tests__/        -- MUST be comprehensive before UI work
  data/faraid-rules.ts          -- Rule table with Quran/Hadith refs
      |
      v
Phase 2 (Core UI):
  stores/wizardStore.ts         -- Depends on core types
  schemas/*.ts                  -- Depends on core types
  components/wizard/*           -- Depends on stores + schemas
  stores/calculationStore.ts    -- Depends on engine
  hooks/useFaraidCalculation.ts -- Bridges wizard store to engine
      |
      v
Phase 3 (Results + Visualization):
  components/results/*          -- Depends on calculation store
  components/charts/*           -- Depends on calculation store
  core/faraid/references.ts     -- Depends on rule table
      |
      v
Phase 4 (Property + Valuation):
  core/property/*               -- Can be built independently
  data/pricing/*                -- Static data curation
  components/wizard/steps/PropertyInputStep.tsx   -- Extends wizard
  components/wizard/steps/ValuationStep.tsx       -- Extends wizard
      |
      v
Phase 5 (Polish + Export):
  components/pdf/*              -- Depends on full calculation output
  Simple/Detailed mode toggle   -- Depends on all UI being built
  localStorage persistence      -- Zustand middleware, low effort
  Optional auth                 -- Entirely independent, defer
```

**Key dependency insight:** The Faraid engine (Phase 1) is a hard prerequisite for everything else. It should be built and exhaustively tested before any UI work begins. The property valuation (Phase 4) is surprisingly independent -- it can be built in parallel with results UI since it only produces a number (total estate value) that feeds into the engine.

## Sources

- [HU-BCS1/islamic-inheritance-calculator](https://github.com/HU-BCS1/islamic-inheritance-calculator) -- Open source TypeScript Faraid library, MIT licensed, uses Fraction.js
- [Fraction.js](https://github.com/rawify/Fraction.js/) -- BigInt-based exact fraction arithmetic library
- [Zustand persist middleware documentation](https://zustand.docs.pmnd.rs/reference/middlewares/persist) -- Official Zustand persistence docs
- [React Hook Form + Zod multi-step wizard pattern](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/) -- LogRocket guide
- [Modularizing React Applications](https://martinfowler.com/articles/modularizing-react-apps.html) -- Martin Fowler on separating computation from UI
- [@react-pdf/renderer](https://npm-compare.com/@react-pdf/renderer,jspdf,pdfmake,react-pdf) -- PDF generation comparison
- [Recharts](https://www.geeksforgeeks.org/create-a-pie-chart-using-recharts-in-reactjs/) -- React charting library
- [Bangladesh NHA land price listings](https://nha.gov.bd/site/page/f1ff3996-adb1-435c-a480-d447a466368d/) -- Government mouza rates source
- [Islamic Inheritance Jurisprudence - Wikipedia](https://en.wikipedia.org/wiki/Islamic_inheritance_jurisprudence) -- Comprehensive overview of school differences
- [Islamic Inheritance Laws - Lesson 12](http://islamicinheritancelaws.com/Lesson12.html) -- Detailed Awl/Radd worked examples
- [State of React State Management in 2026](https://www.pkgpulse.com/blog/state-of-react-state-management-2026) -- Current state management landscape

---
*Architecture research for: Jomi-Bhag (Islamic Inheritance Land Division Calculator -- Bangladesh)*
*Researched: 2026-03-12*
