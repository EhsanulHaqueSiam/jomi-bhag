# Phase 8: Persistence and Scenarios - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Save calculations to browser localStorage without requiring login, allow users to manage multiple saved scenarios, and compare two scenarios side by side. No cloud sync, no accounts (deferred to v2 ACCT-01/02).

</domain>

<decisions>
## Implementation Decisions

### Save/Load Behavior
- Auto-save always: current wizard state saved continuously to localStorage as user fills inputs (like Google Docs — never lose work)
- Full state stored: all wizard inputs (heirs, properties, estate value, view mode) + computed results. User loads and sees everything exactly as they left it
- Loading a saved scenario replaces current state with a warning: "You have unsaved changes. Save current scenario before loading?"
- Duplicate button per scenario: creates a copy with "(Copy)" suffix for "what if" exploration

### Scenario Identity
- Auto-generated name from heir summary + editable: e.g. "3 Brothers, 2 Sisters — Mar 13", user can rename to something meaningful like "Boro Bhai's family"
- Maximum 20 saved scenarios — shows warning when approaching limit
- Compact card preview in list: name, date, heir count summary (e.g. "2 sons, 1 daughter, 1 wife"), and total estate value. Helps identify without loading
- Delete with confirmation dialog. "Clear all" option with stronger warning

### Side-by-Side Comparison
- Compare exactly 2 scenarios at a time — two-column layout on desktop, stacked on mobile
- Show heir shares (fraction, percentage, BDT) + estate totals + adjustments (Awl/Radd) in each column. Not full results mirror
- Subtle highlight on differences: values that differ get a light background tint (pale amber). No highlight on matching values
- Selection via checkboxes in scenario list — check exactly 2, then click "Compare"

### Scenarios UI Location
- Dedicated "My Scenarios" page accessible from top nav bar (mobile: bottom nav icon)
- Comparison view appears inline on the same page (below or replacing the list) — no separate route
- "+ New Calculation" button at top of scenarios page — resets wizard to step 1 with empty state

### Claude's Discretion
- Zustand persist middleware configuration details
- Scenario card layout and spacing
- Comparison table exact styling
- Empty state design for "no saved scenarios"
- localStorage key naming and versioning strategy
- Mobile stacking behavior for comparison view

</decisions>

<specifics>
## Specific Ideas

- Auto-generated names should reflect the heir composition so users can distinguish scenarios at a glance without opening them
- The warning when loading over unsaved changes should feel protective, not annoying — one confirmation, not multiple dialogs
- Comparison should feel like a clean data table, not a cluttered side-by-side of full results pages

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useWizardStore` (src/stores/wizardStore.ts): Zustand store with `create()` — no persist middleware yet. Full state shape already defined (heirs, properties, results, estate value, view mode)
- `computePropertyTotal()` from `@/core/land/types`: calculates total for a property entry
- `buildFaraidInput()`: reconstructs FaraidInput from wizard state — useful for re-calculation on load
- `calculateInheritance()`: engine entry point for recalculating if needed
- UI primitives: `Button`, `Tooltip` from `src/components/ui/`
- `motion/react` (Framer Motion): already installed for animations

### Established Patterns
- Zustand for state management (single store pattern)
- `completedSteps` stored as `number[]` (not Set) for serialization compatibility
- TailwindCSS 4 with oklch colors (emerald + gold palette)
- `@/*` path alias for imports
- Component-per-file in `src/components/` subdirectories
- Mobile bottom nav bar with `pb-24` spacing

### Integration Points
- `wizardStore` needs Zustand `persist` middleware added for auto-save
- New "My Scenarios" page needs routing (currently single-page wizard — may need React Router or conditional rendering)
- Top nav / bottom nav needs "My Scenarios" link added (in `src/components/layout/`)
- Scenario list needs to read from a separate localStorage key (not the auto-save slot)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-persistence-and-scenarios*
*Context gathered: 2026-03-13*
