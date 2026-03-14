# Phase 16: Wire Results Mode Toggle - Research

**Researched:** 2026-03-14
**Domain:** React UI conditional rendering, Zustand state consumption, motion/react animations
**Confidence:** HIGH

## Summary

This phase wires the existing orphaned `ModeToggle` component into `ResultsPage` to control which sections are visible based on `viewMode` ('simple' | 'detailed'). The component, state management, and persistence infrastructure already exist and are fully functional. The work is purely UI integration: importing ModeToggle, conditionally rendering sections, removing the existing collapsible disclosure pattern (chartsOpen/basisOpen useState), adding a per-heir Quran reference footer row to HeirCard, and implementing a one-time hint with localStorage persistence.

All building blocks exist in the codebase. No new libraries are needed. The primary risk is test breakage -- existing tests in `results.test.tsx` assert against the collapsible disclosure pattern (clicking "Islamic Legal Basis & Calculation Steps" to reveal content) which will be replaced by the mode toggle.

**Primary recommendation:** Wire ModeToggle between title and first card, use `viewMode` from wizardStore to conditionally render sections, remove chartsOpen/basisOpen state and collapsible wrappers, add `hasToggledMode` boolean to wizardStore for hint dismissal.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Simple mode shows:** Summary table, Estate Breakdown Card, Awl/Radd adjustment banners (if applicable), special case callouts (if applicable), heir cards grid, blocked heirs section, sticky action bar
- **Simple mode hides:** Charts & Visualizations, StepAccordion (calculation trace), IslamicBasisSection (Quran/Hadith refs), and per-heir Quran references in heir cards
- **Detailed mode adds:** Charts & Visualizations (pie/bar), StepAccordion (calculation steps), IslamicBasisSection, AND per-heir inline Quran references in each HeirCard
- Per-heir Quran reference format: footer row with book icon, citation + 1-line excerpt (e.g., "An-Nisa 4:11 -- Allah commands you regarding your children...")
- Each heir card shows its own reference independently (no dedup across cards -- cards are self-contained)
- Toggle placement: Floating centered pill between page title and first content card
- Labels: "Simple" / "Detailed" (current component values, no change needed)
- Detailed mode sections appear inline WITHOUT collapsible disclosure wrappers
- The existing collapsible disclosure pattern (Charts and Islamic Basis toggle buttons) is removed in favor of the mode toggle controlling visibility
- Simple mode hides these sections entirely (not collapsed, fully absent from DOM)
- Default: simple mode (matches current store default 'simple')
- Subtle hint text below toggle in simple mode: "Switch to Detailed for charts, legal references, and calculation steps"
- Hint disappears permanently after first toggle (persisted flag in localStorage)
- Hint uses fade in/out animation (motion/react, consistent with app patterns)
- viewMode persists via wizardStore localStorage (already in place)
- PDF always exports full detail regardless of current viewMode

### Claude's Discretion
- Animation style when switching modes (slide-down, fade, instant -- pick what fits existing motion patterns)
- Whether ModeToggle replaces collapsible disclosures entirely or coexists (recommendation: replace, since toggle is now the control)
- Mobile alignment of floating pill (centered recommended, but flex based on layout)
- Keyboard shortcut for toggle (no existing shortcuts in app -- likely skip)
- URL state for mode (no router in app -- likely skip, rely on localStorage)
- Scenario comparison view mode toggle behavior (one global toggle recommended)
- Scenario loading: restore saved viewMode or always start simple
- Accessibility: aria-live announcement on mode switch (existing radiogroup may suffice)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RSLT-06 | App provides dual mode -- simple view for general public, detailed view for legal professionals | ModeToggle component exists, viewMode state exists in wizardStore with persistence, conditional rendering based on viewMode controls all section visibility |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI components | Already in project |
| Zustand | 5.0.11 | State management (viewMode, hasToggledMode) | Already in project, persist middleware active |
| motion/react | 12.36.0 | AnimatePresence for mode transition animations | Already in project, used throughout |
| TailwindCSS | 4.2.1 | Styling | Already in project |

### Supporting
No new libraries needed. Everything is already in the project.

### Alternatives Considered
None -- all required infrastructure exists.

**Installation:**
```bash
# No installation needed -- all dependencies already present
```

## Architecture Patterns

### Existing File Structure (files to modify)
```
src/
├── components/results/
│   ├── ModeToggle.tsx        # EXISTS - import into ResultsPage
│   ├── ResultsPage.tsx       # MODIFY - add toggle, conditional rendering
│   ├── HeirCard.tsx          # MODIFY - add per-heir Quran footer
│   ├── QuranReference.tsx    # READ - understand existing pattern
│   ├── ChartSection.tsx      # NO CHANGE - rendered conditionally
│   ├── StepAccordion.tsx     # NO CHANGE - rendered conditionally
│   └── IslamicBasisSection.tsx # NO CHANGE - rendered conditionally
├── stores/
│   └── wizardStore.ts        # MODIFY - add hasToggledMode flag
├── types/
│   └── wizard.ts             # MODIFY - add hasToggledMode to WizardState
└── components/__tests__/
    └── results.test.tsx      # MODIFY - update tests for mode toggle
```

### Pattern 1: Conditional Section Rendering via viewMode
**What:** Use `viewMode` from wizardStore to conditionally render detailed-only sections
**When to use:** Any section that differs between simple and detailed modes
**Example:**
```typescript
// In ResultsPage.tsx
const viewMode = useWizardStore((s) => s.viewMode)
const isDetailed = viewMode === 'detailed'

// Detailed-only sections wrapped in AnimatePresence
<AnimatePresence mode="wait">
  {isDetailed && (
    <motion.div
      key="charts"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <ChartSection />
    </motion.div>
  )}
</AnimatePresence>
```

### Pattern 2: Per-Heir Inline Quran Reference Footer
**What:** Compact, non-expandable Quran citation footer inside HeirCard (detailed mode only)
**When to use:** In each HeirCard when viewMode === 'detailed'
**Example:**
```typescript
// In HeirCard.tsx - new compact footer (NOT the existing expandable QuranReference)
// Uses getShareReference(share.heirType) from references.ts
const refs = getShareReference(share.heirType)
const primaryRef = refs[0] // First ref is the Quran verse

{isDetailed && primaryRef && (
  <div className="mt-3 border-t border-gray-100 pt-2 flex items-start gap-1.5">
    <BookIcon className="h-3.5 w-3.5 mt-0.5 text-gold-500 shrink-0" />
    <span className="text-xs text-gray-500">
      An-Nisa {primaryRef.reference.replace('Quran ', '')} -- {truncateExcerpt(primaryRef.englishText)}
    </span>
  </div>
)}
```

### Pattern 3: One-Time Hint with localStorage Persistence
**What:** A hint below ModeToggle in simple mode that disappears permanently after first toggle
**When to use:** For discoverability of detailed mode
**Example:**
```typescript
// Add hasToggledMode to wizardStore (persisted via partialize)
// In setViewMode action:
setViewMode: (mode) => {
  set({ viewMode: mode, hasToggledMode: true })
}

// In ResultsPage, below ModeToggle:
const hasToggledMode = useWizardStore((s) => s.hasToggledMode)
<AnimatePresence>
  {!hasToggledMode && viewMode === 'simple' && (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-xs text-gray-400 mt-1"
    >
      Switch to Detailed for charts, legal references, and calculation steps
    </motion.p>
  )}
</AnimatePresence>
```

### Anti-Patterns to Avoid
- **Do NOT keep collapsible disclosures alongside ModeToggle:** The user decision explicitly states that collapsibles are replaced, not supplemented. Remove chartsOpen/basisOpen useState entirely.
- **Do NOT hide detailed sections with CSS display:none:** User specifies "fully absent from DOM" in simple mode. Use conditional rendering, not CSS hiding.
- **Do NOT duplicate QuranReference component for the footer:** The existing QuranReference is expandable with Arabic text. The per-heir footer is a new, simpler inline pattern -- a compact one-liner, not the full expandable component.
- **Do NOT filter viewMode in PDF export hook:** PDF always exports full detail. The usePdfExport hook reads getState() non-reactively and does not consult viewMode. No changes needed there.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mode state management | Custom useState/context | `useWizardStore.viewMode` | Already exists, persisted, synced |
| Mode toggle UI | Custom radio buttons | `ModeToggle` component | Already built with radiogroup a11y |
| Animation transitions | CSS keyframes | `motion/react AnimatePresence` | Consistent with existing patterns |
| Quran references per heir | Manual lookup table | `getShareReference(heirType)` | Already maps heirType to references |
| Hint persistence | Custom localStorage calls | wizardStore `hasToggledMode` field | Zustand persist handles serialization |

**Key insight:** This phase is 100% integration work. Every building block already exists. The only new code is conditional rendering logic and a compact Quran citation footer format.

## Common Pitfalls

### Pitfall 1: Test Breakage from Collapsible Removal
**What goes wrong:** Existing tests in `results.test.tsx` click "Islamic Legal Basis & Calculation Steps" and "Charts & Visualizations" buttons to expand sections. Removing collapsibles breaks these tests.
**Why it happens:** The `describe('RSLT-03: step accordion')` and `describe('Collapsible sections')` test suites explicitly test the collapsible pattern.
**How to avoid:** Update tests to set `viewMode: 'detailed'` in store state, then assert sections are visible without clicking expand buttons. The tests should verify: (a) simple mode hides ChartSection/StepAccordion/IslamicBasisSection, (b) detailed mode shows them inline.
**Warning signs:** 10+ test failures in results.test.tsx after implementation.

### Pitfall 2: QuranReference Component Confusion
**What goes wrong:** Using the existing expandable `QuranReference` component inside HeirCard for the detailed-mode footer, which is wrong -- it's too heavy (expandable, shows Arabic, multiple refs).
**Why it happens:** QuranReference already exists and seems reusable.
**How to avoid:** Create a new compact inline element directly in HeirCard (not a separate component, just a JSX block). It should be: book icon + "An-Nisa 4:11 -- {short excerpt}" in muted text, non-interactive.
**Warning signs:** Arabic text rendering in heir card footer, expand/collapse behavior in footer.

### Pitfall 3: Existing QuranReference in HeirCard Visibility
**What goes wrong:** The existing expandable `QuranReference` component at the bottom of each HeirCard (line 284) should be hidden in simple mode but the developer forgets to wrap it.
**Why it happens:** The CONTEXT says simple mode hides "per-heir Quran references in heir cards" -- this means the existing QuranReference expand button.
**How to avoid:** In simple mode, hide the existing `<QuranReference heirType={share.heirType} />`. In detailed mode, replace it with the new compact inline format (or show the compact format AND hide the old expandable one).
**Warning signs:** Quran reference expand buttons visible in simple mode.

### Pitfall 4: AnimatePresence key Requirement
**What goes wrong:** AnimatePresence exit animations don't fire when sections disappear.
**Why it happens:** AnimatePresence requires a `key` prop on direct children for proper exit animation tracking.
**How to avoid:** Give each conditionally rendered section a unique key prop.
**Warning signs:** Sections pop in/out instantly instead of animating.

### Pitfall 5: Zustand partialize Missing New Field
**What goes wrong:** `hasToggledMode` doesn't persist across page refreshes.
**Why it happens:** wizardStore's `partialize` config explicitly lists all persisted fields. If `hasToggledMode` isn't added to partialize, it won't be saved.
**How to avoid:** Add `hasToggledMode: state.hasToggledMode` to the partialize function in wizardStore.ts.
**Warning signs:** Hint reappears after page refresh.

### Pitfall 6: HeirCard viewMode Prop vs Store Read
**What goes wrong:** Passing viewMode as a prop to HeirCard from ResultsPage creates unnecessary coupling.
**Why it happens:** Developer might think props are cleaner.
**How to avoid:** Read `viewMode` directly from `useWizardStore` inside HeirCard, consistent with the anti-prop-drilling pattern used throughout the app (see Phase 02 decisions: "StepIndicator reads from useWizardStore directly (no props)").
**Warning signs:** viewMode passed as props through multiple component layers.

## Code Examples

### Current ResultsPage Section Order (lines 82-309)
The current order of sections in ResultsPage.tsx:
1. PDF error banner
2. Title ("Inheritance Results")
3. Summary card (table)
4. EstateBreakdownCard
5. AdjustmentBanner
6. SpecialCaseCallout
7. Heir cards grid (with stagger)
8. BlockedHeirsSection
9. **Collapsible: Charts & Visualizations** (chartsOpen useState) -- REMOVE
10. **Collapsible: Islamic Legal Basis & Calculation Steps** (basisOpen useState) -- REMOVE
11. Sticky action bar

### Target ResultsPage Section Order
1. PDF error banner
2. Title ("Inheritance Results")
3. **ModeToggle (centered pill) + hint text** -- NEW
4. Summary card (table)
5. EstateBreakdownCard
6. AdjustmentBanner
7. SpecialCaseCallout
8. Heir cards grid (with stagger, HeirCard shows compact Quran footer in detailed)
9. BlockedHeirsSection
10. **ChartSection** (detailed only, inline, animated) -- REPLACES collapsible
11. **StepAccordion + IslamicBasisSection** (detailed only, inline, animated) -- REPLACES collapsible
12. Sticky action bar

### Key Existing Code: viewMode in Store
```typescript
// wizardStore.ts line 111 -- already exists
viewMode: 'simple',

// wizardStore.ts line 235-237 -- already exists
setViewMode: (mode) => {
  set({ viewMode: mode })
},

// Already in partialize (line 515)
viewMode: state.viewMode,
```

### Key Existing Code: ModeToggle Component
```typescript
// ModeToggle.tsx -- complete, ready to import
// Uses role="radiogroup", aria-checked, reads/writes viewMode from store
// Labels: "Simple" / "Detailed"
// Styling: rounded-lg bg-gray-100 pill with active state bg-white shadow-sm
```

### Key Existing Code: getShareReference for Per-Heir Footer
```typescript
// references.ts -- returns IslamicReference[] for a given heirType
// Each reference has: type ('quran'|'hadith'), reference ('Quran 4:11'), englishText
// The quranRef on each FARAID_RULES entry maps to QURAN_REFERENCES entries
// Available refs: 4:11 (children/parents), 4:12 (spouses/uterine siblings), 4:176 (full/consanguine siblings)
```

### Per-Heir Quran Reference Mapping (from faraid-rules.ts)
| Heir Type | quranRef | Citation Text |
|-----------|----------|---------------|
| husband, wife | 4:12 | "And for you is half of what your wives leave..." |
| son, daughter, father, mother, grandparents | 4:11 | "Allah instructs you concerning your children..." |
| brother_full, sister_full, brother_consanguine, sister_consanguine | 4:176 | "They request from you a legal ruling..." |
| brother_uterine, sister_uterine | 4:12 | Same as spouses verse |

### Existing Motion Pattern for Section Reveal
```typescript
// Used throughout app -- AnimatePresence with height/opacity
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{ overflow: 'hidden' }}
    >
      {/* content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Existing prefersReducedMotion Pattern
```typescript
// ResultsPage.tsx lines 26-29 -- module-level check
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Collapsible disclosures (chartsOpen/basisOpen useState) | ModeToggle controls section visibility globally | Phase 16 (this phase) | Charts and Islamic Basis shown/hidden by mode, not by individual toggles |
| Per-heir QuranReference expandable component | Compact inline citation footer in detailed mode | Phase 16 (this phase) | Simpler, non-interactive reference display |

**Deprecated/outdated after this phase:**
- The `chartsOpen` and `basisOpen` useState variables in ResultsPage are removed
- The collapsible wrapper divs with chevron toggle buttons are removed
- The existing expandable `QuranReference` component remains in codebase but is hidden in simple mode and replaced by compact footer in detailed mode

## Open Questions

1. **Should the existing expandable QuranReference be shown in detailed mode alongside the new compact footer?**
   - What we know: CONTEXT says detailed mode shows "per-heir inline Quran references in each HeirCard" as a footer row with "book icon, citation + 1-line excerpt"
   - What's unclear: Whether the existing expandable QuranReference (with full Arabic text) should also remain visible, or be completely replaced
   - Recommendation: Replace the expandable QuranReference with the compact footer. The full references are already available in the IslamicBasisSection which is visible in detailed mode. This avoids redundancy and matches the "inline" description.

2. **Excerpt truncation strategy for Quran verse footer**
   - What we know: English translations are 200+ characters. Footer should show a 1-line excerpt.
   - What's unclear: Exact character limit or truncation point.
   - Recommendation: Use the first clause of the translation (up to first period or ~80 characters with ellipsis). Each verse starts with the most relevant statement.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | vite.config.ts (test section) |
| Quick run command | `npx vitest run src/components/__tests__/results.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RSLT-06a | ModeToggle visible on results page | unit | `npx vitest run src/components/__tests__/results.test.tsx -t "ModeToggle"` | Needs update |
| RSLT-06b | Simple mode hides charts, steps, basis, per-heir refs | unit | `npx vitest run src/components/__tests__/results.test.tsx -t "simple mode"` | Needs update |
| RSLT-06c | Detailed mode shows charts, steps, basis, per-heir refs inline | unit | `npx vitest run src/components/__tests__/results.test.tsx -t "detailed mode"` | Needs update |
| RSLT-06d | Toggle switches between modes | unit | `npx vitest run src/components/__tests__/results.test.tsx -t "toggle"` | Needs update |
| RSLT-06e | Hint appears in simple mode, disappears after toggle | unit | `npx vitest run src/components/__tests__/results.test.tsx -t "hint"` | Needs creation |
| RSLT-06f | Per-heir Quran citation footer in detailed mode | unit | `npx vitest run src/components/__tests__/results.test.tsx -t "Quran"` | Needs update |

### Sampling Rate
- **Per task commit:** `npx vitest run src/components/__tests__/results.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps
- [ ] Update `results.test.tsx` -- replace collapsible tests with mode toggle tests
- [ ] Add tests for: ModeToggle rendering, simple mode hiding, detailed mode showing, hint persistence, per-heir citation footer

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection of: `ModeToggle.tsx`, `ResultsPage.tsx`, `HeirCard.tsx`, `wizardStore.ts`, `references.ts`, `faraid-rules.ts`, `quran-references.ts`, `QuranReference.tsx`, `IslamicBasisSection.tsx`, `StepAccordion.tsx`, `ChartSection.tsx`
- Existing test patterns in `results.test.tsx`

### Secondary (MEDIUM confidence)
- motion/react AnimatePresence patterns observed in codebase (consistent across 10+ components)
- Zustand persist partialize pattern verified in wizardStore.ts

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in project, no new dependencies
- Architecture: HIGH - all integration points identified via direct code inspection
- Pitfalls: HIGH - test breakage and component confusion are concrete, verified risks

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable -- no external dependencies, internal codebase only)
