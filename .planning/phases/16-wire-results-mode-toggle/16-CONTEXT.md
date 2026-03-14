# Phase 16: Wire Results Mode Toggle - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect the orphaned ModeToggle component to ResultsPage so users can toggle between simple (general public) and detailed (legal professionals) views. The ModeToggle component and viewMode store state already exist and are fully functional -- this phase wires them into the results UI and defines what each mode shows/hides.

</domain>

<decisions>
## Implementation Decisions

### Simple vs Detailed Content
- **Simple mode shows:** Summary table, Estate Breakdown Card, Awl/Radd adjustment banners (if applicable), special case callouts (if applicable), heir cards grid, blocked heirs section, sticky action bar
- **Simple mode hides:** Charts & Visualizations, StepAccordion (calculation trace), IslamicBasisSection (Quran/Hadith refs), and per-heir Quran references in heir cards
- **Detailed mode adds:** Charts & Visualizations (pie/bar), StepAccordion (calculation steps), IslamicBasisSection, AND per-heir inline Quran references in each HeirCard
- Per-heir Quran reference format: footer row with book icon, citation + 1-line excerpt (e.g., "An-Nisa 4:11 -- Allah commands you regarding your children...")
- Each heir card shows its own reference independently (no dedup across cards -- cards are self-contained)

### Toggle Placement
- Floating centered pill between page title and first content card
- Not inline with title, not in sticky action bar -- standalone view control
- Labels: "Simple" / "Detailed" (current component values, no change needed)

### Disclosure Replacement
- Detailed mode sections appear inline WITHOUT collapsible disclosure wrappers
- The existing collapsible disclosure pattern (Charts and Islamic Basis toggle buttons) is removed in favor of the mode toggle controlling visibility
- Simple mode hides these sections entirely (not collapsed, fully absent from DOM)

### Default Mode & Discovery
- Default: simple mode (matches current store default 'simple')
- Subtle hint text below toggle in simple mode: "Switch to Detailed for charts, legal references, and calculation steps"
- Hint disappears permanently after first toggle (persisted flag in localStorage)
- Hint uses fade in/out animation (motion/react, consistent with app patterns)

### Persistence
- viewMode persists via wizardStore localStorage (already in place)
- Survives page navigation and refresh

### PDF Export
- PDF always exports full detail regardless of current viewMode
- The toggle is a viewing preference, not a content filter for exports

### Claude's Discretion
- Animation style when switching modes (slide-down, fade, instant -- pick what fits existing motion patterns)
- Whether ModeToggle replaces collapsible disclosures entirely or coexists (recommendation: replace, since toggle is now the control)
- Mobile alignment of floating pill (centered recommended, but flex based on layout)
- Keyboard shortcut for toggle (no existing shortcuts in app -- likely skip)
- URL state for mode (no router in app -- likely skip, rely on localStorage)
- Scenario comparison view mode toggle behavior (one global toggle recommended)
- Scenario loading: restore saved viewMode or always start simple
- Accessibility: aria-live announcement on mode switch (existing radiogroup may suffice)

</decisions>

<specifics>
## Specific Ideas

- Heir card footer reference: book icon + "An-Nisa 4:11 -- Allah commands you regarding..." as muted text below a subtle separator line
- Hint text should feel like a gentle nudge, not a CTA button -- small, muted, informational
- The toggle pill should be visually distinct as a view control, not confused with action buttons

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ModeToggle` (`src/components/results/ModeToggle.tsx`): Fully built component with radiogroup a11y, reads/writes viewMode from wizardStore. Ready to import.
- `viewMode` state in wizardStore: 'simple' | 'detailed' with setViewMode action. Already persisted via localStorage middleware.
- `getAllReferences()` from `src/core/faraid/references`: Returns Quran/Hadith refs for a FaraidOutput. Used by IslamicBasisSection, can also feed per-heir card references.
- `motion/react` AnimatePresence: Used throughout app for transitions. Available for mode switch animations.

### Established Patterns
- Stagger animations with motion variants (staggerContainer, staggerItem) -- used for heir card grid
- Collapsible disclosures using useState + conditional rendering -- currently used for Charts and Islamic Basis (to be replaced by mode toggle)
- prefersReducedMotion check at module level for animation opt-out

### Integration Points
- `ResultsPage.tsx`: Import ModeToggle, add between title and first card, conditionally render sections based on viewMode
- `HeirCard.tsx`: Add optional Quran reference footer, conditionally shown when viewMode === 'detailed'
- `wizardStore.ts`: viewMode already exists, may need a `hasToggledMode` flag for hint persistence
- Remove chartsOpen/basisOpen useState and disclosure buttons from ResultsPage when mode toggle takes over

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 16-wire-results-mode-toggle*
*Context gathered: 2026-03-14*
