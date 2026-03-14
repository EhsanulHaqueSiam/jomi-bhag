---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: completed
stopped_at: Quick fix 1 complete (mobile wizard nav visibility fix)
last_updated: "2026-03-14T07:03:30.631Z"
last_activity: 2026-03-14 -- Phase 14 plan 04 complete (PDF individual asset breakdown section)
progress:
  total_phases: 14
  completed_phases: 14
  total_plans: 35
  completed_plans: 35
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13)

**Core value:** Accurate, unbiased Islamic inheritance division -- the app strictly follows Faraid rules for every calculation without favoring any heir.
**Current focus:** Phase 14 complete -- Per-heir asset breakdown (individual kanban cards showing each heir's land parcels and assets separately).

## Current Position

Phase: 14 of 14 (Per-Heir Asset Breakdown)
Plan: 4 of 4 complete
Status: Complete
Last activity: 2026-03-14 - Completed quick task 5: Make distribution page wider on desktop

Progress: [##########] 35/35 plans (100%)

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
| Phase 07 P02 | 2min | 1 task | 5 files |
| Phase 08 P01 | 7min | 2 tasks | 8 files |
| Phase 08 P02 | 5min | 2 tasks | 7 files |
| Phase 09 P01 | 3min | 2 tasks | 3 files |
| Phase 09 P02 | 4min | 3 tasks | 16 files |
| Phase 10 P01 | 4min | 2 tasks | 10 files |
| Phase 10 P02 | 4min | 2 tasks | 13 files |
| Phase 10 P03 | 8min | 2 tasks | 11 files |
| Phase 11 P01 | 5min | 2 tasks | 5 files |
| Phase 11 P02 | 5min | 2 tasks | 13 files |
| Phase 11 P03 | 3min | 2 tasks | 6 files |
| Phase 12 P01 | 4min | 2 tasks | 5 files |
| Phase 12 P02 | 5min | 2 tasks | 8 files |
| Phase 13 P01 | 4min | 2 tasks | 7 files |
| Phase 13 P02 | 4min | 2 tasks | 9 files |
| Phase 13 P03 | 3min | 2 tasks | 4 files |
| Phase 14 P01 | 7min | 2 tasks | 5 files |
| Phase 14 P02 | 6min | 2 tasks | 10 files |
| Phase 14 P03 | 5min | 2 tasks | 6 files |
| Phase 14 P04 | 4min | 2 tasks | 5 files |

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
- [Phase 07]: usePdfExport hook uses getState() non-reactively; all @react-pdf imports lazy-loaded via dynamic import()
- [Phase 07]: Download uses anchor click pattern; Print uses hidden iframe + onload + window.print()
- [Phase 07]: Hook file .tsx extension required for JSX in dynamic import callback
- [Phase 08]: Fraction serialization uses __frac__ tag with toFraction() string representation
- [Phase 08]: Zustand persist partialize explicitly lists all WizardState fields to exclude action functions
- [Phase 08]: Node 25 localStorage polyfill in test-setup.ts for jsdom compatibility
- [Phase 08]: State fingerprint uses JSON.stringify of key heir/property counts for fast change detection
- [Phase 08]: App uses useState<AppPage> for page routing (no router library for 2 pages)
- [Phase 08]: ComparisonView builds unified heir list from union of both scenarios' shares
- [Phase 08]: Diff highlighting uses data-diff attribute and bg-amber-50 for testability
- [Phase 08]: Mobile bottom nav uses fixed z-50 bar with inline SVG icons
- [Phase 09]: Division algorithm uses greedy best-fit decreasing (largest-value property first to most under-target group)
- [Phase 09]: calculateCompensations works on copies of cashAdjustment to avoid mutating DivisionGroup state
- [Phase 09]: qurahShuffle uses Fisher-Yates for fair randomization, constrained to same-targetValue groups only
- [Phase 09]: divisionStore is ephemeral (no localStorage persist) -- state derivable from wizardStore
- [Phase 09]: getDisplayGroups remaps heirType/label/count from Qurah map, preserving parcel assignments
- [Phase 09]: WizardShell accepts onNavigate prop, threads it to ResultsPage for division page navigation
- [Phase 09]: Divide Land button uses emerald-600 styling to stand out from ghost action buttons
- [Phase 09]: ParcelRow uses native select for Move to... control (simplicity over custom dropdown)
- [Phase 09]: Staggered reveal uses setInterval(400ms) with revealedGroupCount for progressive card appearance
- [Phase 09]: PdfLotDivisionSection conditionally rendered when lotDivision data exists in PdfData
- [Phase 10]: Tola equals vori in BD context (both 11.664g) -- separate unit options for user familiarity
- [Phase 10]: BAJUS approximate gold rates hardcoded (22K: 133000 BDT/vori) with user override support
- [Phase 10]: Buyout compensation uses Math.round for integer BDT in proportional distribution
- [Phase 10]: Section layout (vertically stacked) for Estate Inventory instead of tabs -- better for mobile scrolling
- [Phase 10]: Category picker always visible above asset list for quick multi-asset addition
- [Phase 10]: Gold form shows computed value in PropertyValueInput; override resets when Use this rate clicked
- [Phase 10]: Stable EMPTY_SHARES constant prevents Zustand selector infinite rerender when results is null
- [Phase 10]: EstateBreakdownCard grid dynamically switches between 4-col and 5-col based on movable asset presence
- [Phase 10]: HeirCard toggle renamed from "View property shares" to "View asset shares" reflecting combined scope
- [Phase 11]: DistributionItem wraps Property and MovableAsset into single unified draggable abstraction
- [Phase 11]: Equilibrium percentage rounded to 2 decimal places to avoid floating-point edge cases
- [Phase 11]: smartShuffle uses 80% threshold of best gap for weighted-random candidate filtering
- [Phase 11]: distributionStore fingerprint includes both property and movable asset IDs+values (fixes Phase 9 pitfall 5)
- [Phase 11]: distributionStore is ephemeral (no persist middleware) -- state derivable from wizardStore
- [Phase 11]: DnD sensors: PointerSensor(distance:5), TouchSensor(delay:500ms), KeyboardSensor for accessibility
- [Phase 11]: MobileFallback select coexists with DnD at all screen sizes (not hidden on desktop)
- [Phase 11]: Responsive Kanban: grid-cols-1 mobile, grid-cols-2 tablet, flex-row horizontal scroll desktop
- [Phase 11]: "Distribute Assets" replaces "Divide Land", visible when properties OR movable assets exist
- [Phase 12]: camelCase JSON keys matching TypeScript interface convention
- [Phase 12]: Invalid enum values fall back to null/default instead of rejecting entire import
- [Phase 12]: Bare data objects accepted alongside schema-enveloped JSON for import flexibility
- [Phase 12]: Movable assets with invalid category skipped entirely (cannot construct valid typed object)
- [Phase 12]: StepRelationship no longer returns null when no relationship selected -- import zone always visible on Step 1
- [Phase 12]: Import zone at bottom of Step 1 with "or import from file" divider for secondary discovery
- [Phase 13]: LandSettlementMethod is separate type system from ResolutionMethod (land vs movable assets)
- [Phase 13]: calculateLandBuyout reuses calculateBuyout from indivisible.ts, extends with installment plan
- [Phase 13]: Installments use Math.round(total/count) with totalOwed preserved as original amount (no interest, Islamic finance)
- [Phase 13]: Settlement validation in JSON import uses per-method parsing with null fallback for invalid data
- [Phase 13]: Settlement expand button placed below drag handle div, not inside it, to avoid DnD interference
- [Phase 13]: Detail components receive data via props and fire callbacks -- no direct store coupling
- [Phase 13]: EMPTY_SHARES stable constant in DistributionPage prevents Zustand selector infinite rerender
- [Phase 13]: [Phase 13]: PdfSettlementSection uses per-method sub-component renderers for clean separation in PDF
- [Phase 14]: splitParcel last sub-parcel gets remainder value to prevent floating point rounding drift
- [Phase 14]: COMPENSATION_THRESHOLD at 100 BDT filters trivial transfers from individual compensation output
- [Phase 14]: computeIndividualFingerprint includes heir type counts so heir additions/removals invalidate state
- [Phase 14]: Stable empty array constants (EMPTY_INDIVIDUALS, EMPTY_ITEMS, EMPTY_COMPENSATIONS) prevent Zustand selector infinite rerender
- [Phase 14]: Individual column ID convention: ${heirType}_${index} (e.g. son_0, daughter_1)
- [Phase 14]: HeirIcon extracted to shared src/components/ui/HeirIcon.tsx with typed Set<HeirType> feminineHeirs
- [Phase 14]: IndividualColumn dual border: top=equilibrium color, left=heir-type accent color (emerald/rose/blue/amber/purple)
- [Phase 14]: IndividualControls Qurah button uses gold-600 to distinguish from group Randomize emerald-600
- [Phase 14]: showQurahCeremony state prepared in DistributionPage as placeholder for Plan 03 ceremony overlay
- [Phase 14]: PdfIndividualSection uses text markers [OK]/[~]/[X] for equilibrium (PDF cannot render Unicode checkmarks reliably)
- [Phase 14]: Custom name resolution in PDF applied to both heir displayName and compensation fromName/toName
- [Phase quick-1]: Mobile bottom padding pb-32 (128px) to clear combined 112px fixed bar stack; inline style for safe-area-inset-bottom

### Pending Todos

None yet.

### Roadmap Evolution

- Phase 9 added: Land Lot Division and Qurah Assignment -- named land parcels divided into groups per Faraid shares, random (Qur'ah) or user-named assignment to heirs
- Phase 10 added: Movable Assets and Complete Estate Inventory -- gold, silver, cash, vehicles, jewelry, furniture, investments, livestock with indivisible asset handling per Islamic jurisprudence
- Phase 11 added: Interactive asset distribution with drag-and-drop equilibrium -- land lots and assets distributed among heir groups with randomize, drag-and-drop, and green equality indicator
- Phase 12 added: JSON import and export for assets -- import JSON with partial fields, edit in GUI, export complete data
- Phase 13 added: Land settlement methods -- sell and split, physical division by value, buyouts, and joint ownership for complete land resolution
- Phase 14 added: Per-heir asset breakdown -- individual kanban cards showing each heir's land parcels and assets separately (Brother-1 card with their land + assets, not grouped by heir type)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Fix missing next button on mobile - cannot go to next step | 2026-03-14 | 46704fe | [1-fix-missing-next-button-on-mobile-cannot](./quick/1-fix-missing-next-button-on-mobile-cannot/) |
| 2 | Fix Netlify build TypeScript errors in importData.ts and useJsonImport.ts | 2026-03-14 | e8a6bd7 | [2-fix-netlify-build-typescript-errors-in-i](./quick/2-fix-netlify-build-typescript-errors-in-i/) |
| 3 | Fix JSON import not applying data - shows step 1 instead of results | 2026-03-14 | 568b48c | [3-fix-json-import-not-applying-data-shows-](./quick/3-fix-json-import-not-applying-data-shows-/) |
| 4 | Comprehensive test suite: hooks, AppLayout, e2e expansion | 2026-03-14 | beede94 | [4-comprehensive-test-suite-unit-integratio](./quick/4-comprehensive-test-suite-unit-integratio/) |
| 5 | Make distribution page wider on desktop | 2026-03-14 | 635d8bb | [5-make-distribution-page-wider-on-desktop-](./quick/5-make-distribution-page-wider-on-desktop-/) |

### Blockers/Concerns

- Mouza rate data: No public API exists. Gazette PDFs may be extractable but not yet validated. Affects Phase 5.
- Bengali PDF rendering: @react-pdf/renderer conjunct character shaping not validated. English-only for v1 but font architecture matters.

## Session Continuity

Last session: 2026-03-14T08:30:41Z
Stopped at: Quick task 5 complete (distribution page wider on desktop)
Resume file: None
