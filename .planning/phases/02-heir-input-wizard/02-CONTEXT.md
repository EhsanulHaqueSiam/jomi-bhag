# Phase 2: Heir Input Wizard - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Multi-step wizard for entering heir details (deceased's gender, spouse(s), children, siblings with types) through an intuitive form, modern responsive UI with emerald green Islamic-accented design, form validation, and mobile-first layout. The wizard produces a `FaraidInput` object for the engine. No results display (Phase 3) or property input (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Wizard Step Structure
- 3 steps total: Step 1 (Relationship to deceased), Step 2 (Immediate family: spouse, children), Step 3 (Siblings: full/consanguine/uterine)
- Perspective-based entry: "I am calculating inheritance for my [Father/Mother/Husband/Wife/Brother/Sister/Other]" — derives deceased gender + user's relationship naturally
- Free navigation: step indicators at top are clickable, users can jump back to any completed step and return
- Auto-include user as heir: selecting "my Father" auto-adds you as son/daughter in Step 2; editable
- Auto-include mother: when user picks "my Father," prompt "Is the deceased's wife (your mother) alive?" — if yes, auto-add as wife heir
- Parents-deceased assumption: subtle info text on Step 1: "This calculator assumes the deceased's parents have passed away"
- No landing page: the wizard IS the app. Step 1 appears immediately with tagline "Islamic Inheritance Calculator"

### Heir Entry Interaction
- Stepper buttons: [ - ] count [ + ] style controls for all heir counts. Intuitive on mobile, prevents invalid input
- Progressive disclosure for sibling types: start with just "Brothers" and "Sisters" steppers. "Different types of siblings?" toggle expands to show full/consanguine/uterine sub-types
- Default to full siblings: when user enters "Brothers: 2" without expanding types, engine treats them as full brothers (most common case in BD)
- Conditional spouse display: if deceased is male, show "Wives" stepper (1-4 max). If deceased is female, show "Was she married?" checkbox (husband = 1)

### Visual Identity
- Modern minimal + Islamic accents: clean white-space-heavy layout with subtle Islamic geometric patterns, emerald green accents, and Arabic calligraphy only for Quranic text
- Palette: white background, emerald green primary, warm gray text, gold for Quranic references
- Connected-dots step indicator: numbered circles connected by a line. Active step highlighted in green. Completed steps get a checkmark
- English-only branding: "Jomi-Bhag" without Bengali script until v2 localization (LOCL-01)
- Light mode only for now: dark mode can be layered on later with CSS variables/Tailwind dark: classes

### Guidance & Education
- Tooltips on demand: small (?) icons next to terms like "consanguine siblings". Tap/hover shows brief plain-language explanation
- No live share preview: wizard focused on data entry only. Results come after "Calculate" on the results page (Phase 3)
- Inline validation: red text under invalid fields, "Next" button disabled until valid. Prevents errors from reaching the engine

### MFLO Toggle
- Placed on Step 1 below the relationship selector, under an "Advanced" section
- Toggle label: "Apply MFLO Section 4 (orphaned grandchildren)" with (?) tooltip
- Warning banner appears inline when enabled (from Phase 1 decision)

### Mobile Layout
- Full-width stacked layout on mobile (375px+): steppers stack vertically at full width
- Step indicator shrinks to compact dots on mobile
- Next/Back buttons become full-width bottom bar with large tap targets
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

</decisions>

<specifics>
## Specific Ideas

- Most common BD scenario: father died, mother + children dividing. The wizard should handle this seamlessly — auto-include both the user (as child) and mother (as wife heir) when "my Father" is selected
- "Strictly follows Islam" promise means the wizard must not allow heir combinations that are invalid under Faraid
- Phase 1 engine API: `FaraidInput { deceasedGender: 'male' | 'female', heirs: HeirInput[], mfloEnabled?: boolean }` where `HeirInput = { type: HeirType, count: number }`
- Wizard output must map directly to this API — no translation layer needed
- DSGN-01 requires "exceptional UI" — use frontend-design skill for polished, non-generic design

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/core/faraid/types.ts`: All type definitions including HeirType (17-value union), HeirInput, FaraidInput, FaraidOutput — wizard must produce FaraidInput
- `src/core/faraid/engine.ts`: `calculateInheritance(input: FaraidInput): FaraidOutput` — the function the wizard feeds into
- `src/core/faraid/validation.ts`: `validateHeirInput()` — can be used for wizard validation
- `src/index.css`: TailwindCSS 4 already configured
- `src/App.tsx`: Placeholder — will be replaced with wizard routing

### Established Patterns
- TypeScript strict mode with `noUnusedLocals` — clean imports required
- Vite + React + TailwindCSS 4 + Bun toolchain
- `@/*` path alias configured for src/
- Noto Naskh Arabic font already loaded (for Quranic text)

### Integration Points
- Wizard feeds `FaraidInput` to `calculateInheritance()` from engine.ts
- MFLO toggle maps to `mfloEnabled` boolean in FaraidInput
- Heir counts map directly to `HeirInput[]` array
- Results display (Phase 3) will consume `FaraidOutput` from the engine

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-heir-input-wizard*
*Context gathered: 2026-03-12*
