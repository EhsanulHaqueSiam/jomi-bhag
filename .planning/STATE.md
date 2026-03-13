---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 07-01-PLAN.md
last_updated: "2026-03-13T07:08:24.420Z"
last_activity: 2026-03-13 -- Phase 7 Plan 01 complete (PDF document components, fonts, data extraction, tests)
progress:
  total_phases: 10
  completed_phases: 6
  total_plans: 16
  completed_plans: 15
  percent: 94
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13)

**Core value:** Accurate, unbiased Islamic inheritance division -- the app strictly follows Faraid rules for every calculation without favoring any heir.
**Current focus:** Phase 7 in progress -- PDF Export and Print (PDF document components and data extraction)

## Current Position

Phase: 7 of 10 (PDF Export and Print)
Plan: 1 of 2 complete
Status: Executing
Last activity: 2026-03-13 -- Phase 7 Plan 01 complete (PDF document components, fonts, data extraction, tests)

Progress: [█████████░] 15/16 plans (94%)

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: 7 min
- Total execution time: 1.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 4/4 | 31 min | 8 min |
| 2 | 3/3 | 36 min | 12 min |
| 3 | 2/2 | 10 min | 5 min |
| 4 | 2/2 | 12 min | 6 min |

| 5 | 2/2 | 8 min | 4 min |
| 6 | 1/1 | 5 min | 5 min |

**Recent Trend:**
- Last 5 plans: 04-01 (6 min), 04-02 (6 min), 05-01 (5 min), 05-02 (3 min), 06-01 (5 min)
- Trend: Steady

*Updated after each plan completion*
| Phase 05 P01 | 5min | 2 tasks | 10 files |
| Phase 05 P02 | 3min | 2 tasks | 4 files |
| Phase 06 P01 | 5min | 2 tasks | 8 files |
| Phase 07 P01 | 5min | 2 tasks | 20 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Used vitest/config defineConfig for merged Vite+Vitest types in single config file
- HeirType modeled as 17-value string union (not enum) covering complete Hanafi taxonomy
- Rule table conditions ordered most-specific-first for deterministic evaluation
- Umariyyatayn handled as engine-level special case (ONE_THIRD default in rule table)
- MFLO Section 4 stance: pure Faraid default, MFLO as opt-in toggle (from CONTEXT.md)
- Rules 2/4 (deeper grandson blocking) not modeled: HeirType stops at son_of_son level
- Rule 5 exception: daughter_of_son not blocked when son_of_son present (Asaba bi-ghayrihi)
- Pipeline enforcement: blocking -> shares -> special cases -> adjustments
- Umariyyatayn detection uses post-blocking state (siblings blocked by father don't prevent it)
- Asaba priority: son(1) > son_of_son(2) > father(3) > grandfather(4) > brother_full(5) > brother_consanguine(6)
- Awl uses BigInt LCM for exact common denominator computation
- Radd Bait-ul-Maal: only-spouse remainder NOT redistributed, noted as public treasury
- FaraidInput extended with predeceasedChildren for MFLO without breaking existing API
- Engine converts fard_and_asaba to fard in final ShareResult output
- Import cleanup: removed unused FaraidRule type, Fraction default imports, and unused fraction constants to unblock tsc build
- deriveDeceasedGender: husband->female, wife->male (user IS the heir type role)
- Auto-includes tracked as separate array, recalculated on relationship/userGender/motherAlive change
- buildFaraidInput merges auto-includes with manual counts additively via Map
- completedSteps stored as number[] (not Set) for Zustand serialization
- CSS @import order: font imports before tailwindcss import to avoid warnings
- Gold palette added as custom oklch values; emerald uses TailwindCSS 4 built-in
- [Phase 02]: Tooltip uses useState + click-outside listener (no external positioning library)
- [Phase 02]: StepIndicator reads from useWizardStore directly (no props), per anti-prop-drilling pattern
- [Phase 02]: AppLayout uses inline SVG data URI for Islamic geometric pattern at 3% opacity
- [Phase 02]: WizardShell direction state tracked locally (useState), not in Zustand store
- [Phase 02]: Mobile nav uses fixed bottom bar with pb-24 spacing on main content
- [Phase 02]: FamilyTree SVG visualization added as interactive relationship selector alongside grid buttons
- [Phase 02]: Sibling progressive disclosure defaults changes to fullCount only when collapsed
- [Phase 02]: Auto-include badges show '(includes you)' next to relevant steppers
- [Phase 03]: BDT formatting uses Intl.NumberFormat('en-IN') with narrowSymbol for lakh/crore grouping
- [Phase 03]: EstateValueInput toggles formatted display (blurred) vs raw number (focused) for usability
- [Phase 03]: QuranReference uses motion/react AnimatePresence for smooth expand/collapse
- [Phase 03]: HeirCard shows Each/Total rows when count > 1, single row otherwise
- [Phase 03]: Results step hides FamilyTree, info text, and both navigation bars
- [Phase 03]: StepAccordion uses Set<number> state for multi-open accordion
- [Phase 03]: AdjustmentBanner: amber for Awl, blue for Radd visual distinction
- [Phase 03]: SpecialCaseCallout uses gold theme consistent with Islamic accent palette
- [Phase 03]: Integration tests use mock FaraidOutput factories with real Fraction objects
- [Phase 04]: Division-keyed katha lookup with mandatory division parameter (no optional division)
- [Phase 04]: All area stored internally as sqft (canonical unit), converted for display only
- [Phase 04]: Properties step always valid (optional) -- user can skip to Results
- [Phase 04]: Step 3 shows Next, step 4 shows Calculate Shares + Skip to Results text link
- [Phase 04]: PropertyValueInput reusable BDT input with blur/focus toggle pattern matching EstateValueInput
- [Phase 04]: All sub-sections (house, tree, pond) shown for any property type (mixed properties common in BD)
- [Phase 04]: TreeCropSection uses local useState for itemized toggle, syncs isItemized to store on toggle
- [Phase 04]: Auto-label computed from same-type count in properties array ("Residential #1", etc.)
- [Phase 05]: Mouza rate data hardcoded for 84 upazilas across 8 BD division HQ districts with representative govt minimum rates
- [Phase 05]: City corp entries added for all 8 division capitals as pseudo-upazilas for rate lookup
- [Phase 05]: rateSource on Property tracks govt vs manual; division change resets upazila and rateSource
- [Phase 05]: EstateBreakdownCard replaces EstateValueInput in ResultsPage; EstateValueInput file preserved but unused
- [Phase 05]: getAutoLabel replicated in EstateBreakdownCard and HeirCard (simple utility, not worth shared module)
- [Phase 05]: Per-property BDT amounts use Math.round(share.valueOf() * propertyTotal) for integer precision
- [Phase 06]: CSS overlay for pie center label (Recharts Label position=center unreliable in 3.x/jsdom)
- [Phase 06]: HTML legend below chart for accessibility and jsdom testability (Recharts Legend needs real layout)
- [Phase 06]: Hex EMERALD_COLORS for SVG fill compatibility (not oklch)
- [Phase 06]: ResponsiveContainer mocked in tests with fixed-size div wrapper
- [Phase 07]: PdfData is fully serializable (pre-formatted strings, no Fraction objects or Zustand hooks)
- [Phase 07]: Static weight TTF fonts for PDF (variable fonts not supported by PDF spec)
- [Phase 07]: Heir table hides BDT columns when totalEstateValue is 0; section components use break prop for page hints

### Pending Todos

None yet.

### Roadmap Evolution

- Phase 9 added: Land Lot Division and Qurah Assignment -- named land parcels divided into groups per Faraid shares, random (Qur'ah) or user-named assignment to heirs
- Phase 10 added: Movable Assets and Complete Estate Inventory -- gold, silver, cash, vehicles, jewelry, furniture, investments, livestock with indivisible asset handling per Islamic jurisprudence

### Blockers/Concerns

- Mouza rate data: No public API exists. Gazette PDFs may be extractable but not yet validated. Affects Phase 5.
- Bengali PDF rendering: @react-pdf/renderer conjunct character shaping not validated. English-only for v1 but font architecture matters.

## Session Continuity

Last session: 2026-03-13T07:08:16.736Z
Stopped at: Completed 07-01-PLAN.md
Resume file: None
