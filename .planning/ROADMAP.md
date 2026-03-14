# Roadmap: Jomi-Bhag

## Overview

Jomi-Bhag delivers accurate Islamic inheritance (Faraid) property division for Bangladeshi families and legal professionals. The roadmap builds from the inside out: a pure Faraid calculation engine first (the product's core value), then heir and property input systems, then results and visualization, and finally export and persistence. Each phase delivers a verifiable capability -- the engine can be tested without UI, the wizard can show share fractions before property valuation exists, and charts/PDF render data that is already proven correct.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Faraid Engine and Project Foundation** - Pure TypeScript calculation engine with exact fraction arithmetic, all Hajb blocking rules, Awl/Radd adjustments, and project scaffolding (gap closure in progress)
- [ ] **Phase 2: Heir Input Wizard** - Multi-step wizard with heir entry (gender, siblings, spouses, children), modern responsive UI, and form validation
- [x] **Phase 3: Core Results Display** - Share breakdown (fractions, percentages, monetary), Quranic/Hadith references, step-by-step explanation, and dual simple/detailed mode
- [x] **Phase 4: Property Input System** - Multi-property entry with BD land units, regional conversion, houses, trees/crops, and ponds (completed 2015-03-12)
- [x] **Phase 5: Property Valuation** - Estate value calculation with mouza rate auto-suggestion, user override, and per-heir monetary distribution (completed 2015-03-12)
- [ ] **Phase 6: Charts and Visualization** - Pie chart for proportional shares and bar chart for monetary comparison
- [x] **Phase 7: PDF Export and Print** - Downloadable PDF report with full division details, Quranic references, and print-friendly layout
- [ ] **Phase 8: Persistence and Scenarios** - localStorage saving, scenario comparison, and load/modify previous calculations
- [x] **Phase 9: Land Lot Division and Qurah Assignment** - Named land parcels divided into heir groups per Faraid shares, Qurah-based random or user-named assignment, strictly Islamic fair division (completed 2015-03-13)
- [x] **Phase 10: Movable Assets and Complete Estate Inventory** - Gold, silver, cash, vehicles, jewelry, furniture, investments, livestock, and all non-land assets with Islamic rules for indivisible item division (completed 2015-03-13)
- [x] **Phase 11: Interactive Asset Distribution** - Drag-and-drop Kanban board for distributing all assets among heir groups with real-time equilibrium indicators and smart randomization (completed 2015-03-13)
- [x] **Phase 12: JSON Import and Export** - Export full estate data as JSON for backup/portability, import JSON files (even partial) to populate wizard for editing and recalculation (completed 2015-03-13)
- [ ] **Phase 15: Fix JSON Import & Persistence Gaps** - Fix useJsonImport to restore customHeirNames and individualDistribution, fix scenario reset for movable assets, fix splitOrigins persistence (gap closure)
- [ ] **Phase 16: Wire Results Mode Toggle** - Connect orphaned ModeToggle component to ResultsPage for simple/detailed view switching (gap closure)
- [ ] **Phase 17: Dead Code Cleanup & Documentation Fix** - Remove dead LotDivisionPage, StepFamily, StepSiblings code, fix MonetaryBarChart coloring, update REQUIREMENTS.md traceability (gap closure)

## Phase Details

### Phase 1: Faraid Engine and Project Foundation
**Goal**: The Faraid calculation engine correctly computes inheritance shares for any valid heir combination under Hanafi jurisprudence, and the project scaffolding is deployable
**Depends on**: Nothing (first phase)
**Requirements**: FARD-01, FARD-02, FARD-03, FARD-04, FARD-05, FARD-06, FARD-07, FARD-08, DSGN-04
**Success Criteria** (what must be TRUE):
  1. Given any combination of heirs (spouse, sons, daughters, full/consanguine/uterine siblings), the engine returns correct Faraid shares as exact fractions
  2. When total prescribed shares exceed the estate, Awl proportionally reduces all shares and the sum equals exactly 1
  3. When total prescribed shares are less than 1 with no residuary heirs, Radd redistributes surplus to eligible heirs (spouses excluded per Hanafi)
  4. All 16 Hajb Hirman (total blocking) and 5 Hajb Nuqsan (partial reduction) rules produce correct results verified against known Faraid outcomes
  5. The project builds, passes linting, and deploys as a static site to Netlify
**Plans:** 4 plans (3 complete, 1 gap closure)

Plans:
- [x] 01-01-PLAN.md -- Project scaffolding (Vite + React + TailwindCSS 4 + Vitest) and Faraid engine type system, fraction utilities, reference data, and rule table
- [x] 01-02-PLAN.md -- All 16 Hajb Hirman + 5 Hajb Nuqsan blocking rules, fixed share assignment, and special cases (Umariyyatayn, Mushtarakah, Kalalah)
- [x] 01-03-PLAN.md -- Asaba distribution, Awl reduction, Radd redistribution, MFLO Section 4, engine orchestrator, and end-to-end integration tests
- [x] 01-04-PLAN.md -- Gap closure: fix unused TypeScript imports blocking build (VERIFICATION.md criterion 5)

### Phase 2: Heir Input Wizard
**Goal**: Users can enter their heir details through an intuitive multi-step wizard with validation, and the app looks modern and works on mobile
**Depends on**: Phase 1
**Requirements**: HEIR-01, HEIR-02, HEIR-03, HEIR-04, HEIR-05, DSGN-01, DSGN-02, DSGN-03
**Success Criteria** (what must be TRUE):
  1. User can specify their gender, marital status, and enter counts of brothers/sisters (full, consanguine, uterine) with spouse status, plus sons and daughters
  2. The wizard enforces that parents are deceased (the app's scope) and validates all heir inputs before proceeding
  3. The app renders correctly on mobile devices (375px+) and desktop with no layout breakage
  4. The wizard flow guides the user through heir input, property input, and results in distinct steps
**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md -- Zustand wizard store with state logic (relationship derivation, auto-includes, FaraidInput building), wizard types, TailwindCSS 4 design system, and unit tests
- [x] 02-02-PLAN.md -- UI primitives (StepperButton, StepIndicator, Tooltip, Button), AppLayout, WizardShell with animated step transitions
- [x] 02-03-PLAN.md -- Three wizard step components (StepRelationship, StepFamily, StepSiblings), App.tsx wiring, component tests, and visual verification

### Phase 3: Core Results Display
**Goal**: Users see their inheritance division results with Quranic justification and can choose between simple and detailed views
**Depends on**: Phase 2
**Requirements**: RSLT-01, RSLT-02, RSLT-03, RSLT-06
**Success Criteria** (what must be TRUE):
  1. Each heir's share is displayed simultaneously as a fraction, percentage, and monetary amount
  2. Every share allocation shows the specific Quranic ayah and/or Hadith reference that justifies it
  3. A step-by-step calculation explanation shows how each share was derived (blocking applied, fixed shares assigned, residuary distributed, adjustments made)
  4. User can toggle between simple mode (fractions and percentages only) and detailed mode (full calculation trace with legal citations)
**Plans:** 2 plans

Plans:
- [x] 03-01-PLAN.md -- Engine integration, display utilities, heir cards with Quran references, estate value input, mode toggle, and ResultsPage container
- [x] 03-02-PLAN.md -- Adjustment banners, special case callouts, blocked heirs section, step accordion, Islamic Basis section, integration tests, and visual verification

### Phase 4: Property Input System
**Goal**: Users can enter multiple properties of different types with Bangladesh-specific land units and regional variations
**Depends on**: Phase 2
**Requirements**: PROP-01, PROP-02, PROP-03, PROP-04, PROP-05, PROP-06
**Success Criteria** (what must be TRUE):
  1. User can input land area in decimal/shotangsho, katha, or bigha with automatic conversion between units
  2. User can add multiple property entries of types: agricultural, residential, commercial, mixed, with house/structure details, tree/crop details, and pond/water body details
  3. Regional land unit variations are handled correctly (e.g., 1 Katha = 720 sqft in Dhaka vs 1620 sqft in Rajshahi) based on user's district/region selection
**Plans:** 2/2 plans complete

Plans:
- [x] 04-01-PLAN.md -- Land unit types, conversion module with regional BD variations, BD data constants, Zustand store property CRUD, and wizard step 4-to-5 reindexing
- [x] 04-02-PLAN.md -- Property UI components (cards, type selector, land area input, house/tree/pond sub-items), running total, integration tests, and visual verification

### Phase 5: Property Valuation
**Goal**: The app calculates total estate value from all properties and distributes monetary amounts to each heir based on their Faraid share
**Depends on**: Phase 4
**Requirements**: VALP-01, VALP-02, VALP-03, VALP-04
**Success Criteria** (what must be TRUE):
  1. App auto-suggests property prices from BD government mouza rates by district/upazila, and user can override with actual market value
  2. Total estate value is computed from all property entries combined (land + structures + trees/crops + ponds)
  3. Each heir's monetary amount is calculated as their share fraction multiplied by total estate value and displayed alongside their share
**Plans:** 2/2 plans complete

Plans:
- [ ] 05-01-PLAN.md -- Mouza rate data module (8 BD division HQ districts, upazila-level rates), Property type extension (upazila + rateSource fields), valuation helper, upazila cascade dropdown, and inline rate suggestion UI
- [ ] 05-02-PLAN.md -- Estate breakdown card replacing EstateValueInput (category totals, per-property detail, override flow, govt/manual badges), per-heir property distribution in HeirCard, and integration tests

### Phase 6: Charts and Visualization
**Goal**: Users can see their inheritance division visually through charts
**Depends on**: Phase 3, Phase 5
**Requirements**: RSLT-04, RSLT-05
**Success Criteria** (what must be TRUE):
  1. A pie chart displays proportional share distribution across all heirs
  2. A bar chart displays monetary amount per heir for direct comparison
**Plans:** 1 plan

Plans:
- [ ] 06-01-PLAN.md -- Recharts installation, pie chart (donut with emerald gradient + center heir count), horizontal bar chart (BDT amounts), ChartSection wrapper, ResultsPage integration, and chart integration tests

### Phase 7: PDF Export and Print
**Goal**: Users can download or print a complete inheritance division report with formal legal document layout
**Depends on**: Phase 6
**Requirements**: OUTP-01, OUTP-02, OUTP-03
**Success Criteria** (what must be TRUE):
  1. User can download a PDF report containing heir breakdown, property details, share allocations, and Quranic references
  2. The PDF includes a disclaimer about consulting a lawyer for legal registration
  3. The app provides a print-friendly output with clean layout (no UI chrome, proper page breaks)
**Plans:** 2 plans

Plans:
- [x] 07-01-PLAN.md -- PDF document infrastructure: @react-pdf/renderer + html-to-image installation, TTF fonts (Inter + Noto Naskh Arabic), PdfData type, extractPdfData function, pdfStyles/pdfFonts/pdfColors, all PDF section components (header, heir table, charts, property breakdown, steps, references, disclaimer), PdfDocument root, and data extraction tests
- [x] 07-02-PLAN.md -- usePdfExport hook (chart capture + lazy PDF generation + download/print), ResultsPage button integration (Download PDF + Print), integration tests, and visual verification checkpoint

### Phase 8: Persistence and Scenarios
**Goal**: Users can save their calculations and compare different inheritance scenarios without creating an account
**Depends on**: Phase 3
**Requirements**: PRST-01, PRST-02, PRST-03
**Success Criteria** (what must be TRUE):
  1. Calculations are automatically saved to browser localStorage and persist across page refreshes without requiring login
  2. User can compare multiple saved scenarios side by side to evaluate "what if" variations
  3. User can load a previously saved calculation and modify it to create a new scenario
**Plans:** 2 plans

Plans:
- [x] 08-01-PLAN.md -- Fraction-aware localStorage persistence (Zustand persist middleware with custom serializer), scenario types, wizardStore auto-save, scenariosStore with full CRUD (save/load/duplicate/delete/rename), name generation, and unsaved changes detection
- [ ] 08-02-PLAN.md -- App page routing (wizard vs scenarios), AppLayout navigation (header + mobile bottom nav), ScenariosPage with scenario cards, ComparisonView with side-by-side diff highlighting, and visual verification

### Phase 9: Land Lot Division and Qurah Assignment
**Goal**: Users can divide existing property parcels (from Step 4) into groups matching each heir type's Faraid share, assign groups via Qurah (Islamic lot drawing) or manual reassignment, and see cash compensation for imbalances -- strictly following Islamic fair division rules
**Depends on**: Phase 8
**Requirements**: P9-SC1, P9-SC2, P9-SC3, P9-SC4
**Success Criteria** (what must be TRUE):
  1. Parcels are auto-populated from Step 4 properties with name, area, and market price already available
  2. App divides land parcels into groups that match each heir's Faraid share as closely as possible using greedy best-fit algorithm
  3. User can randomly assign groups to heirs (Qurah -- Islamic lot drawing) or manually reassign parcels between groups
  4. Division and assignment strictly follow Islamic rules for fair property division, with cash compensation bridging imbalances
**Plans:** 2/2 plans complete

Plans:
- [ ] 09-01-PLAN.md -- Pure division algorithm (greedy best-fit grouping, cash compensation, Qurah shuffle), division types, divisionStore (Zustand), and comprehensive unit tests
- [ ] 09-02-PLAN.md -- Division UI components (LotDivisionPage, QurahCeremony, GroupCard, CompensationBanner, ParcelRow, QurahReference), ResultsPage "Divide Land" button, app routing extension, PDF export section, and component tests

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11 -> 12 -> 13 -> 14

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Faraid Engine and Project Foundation | 4/4 | Complete | 2015-03-12 |
| 2. Heir Input Wizard | 3/3 | Complete | 2015-03-12 |
| 3. Core Results Display | 2/2 | Complete | 2015-03-12 |
| 4. Property Input System | 2/2 | Complete   | 2015-03-12 |
| 5. Property Valuation | 2/2 | Complete   | 2015-03-12 |
| 6. Charts and Visualization | 0/1 | Not started | - |
| 7. PDF Export and Print | 2/2 | Complete | 2015-03-13 |
| 8. Persistence and Scenarios | 2/2 | Complete | 2015-03-13 |
| 9. Land Lot Division and Qurah Assignment | 2/2 | Complete    | 2015-03-13 |
| 10. Movable Assets and Complete Estate Inventory | 3/3 | Complete    | 2015-03-13 |
| 11. Interactive Asset Distribution | 3/3 | Complete    | 2015-03-13 |
| 12. JSON Import and Export | 2/2 | Complete    | 2015-03-13 |
| 13. Land Settlement Methods | 3/3 | Complete    | 2015-03-13 |
| 14. Per-Heir Asset Breakdown | 4/4 | Complete    | 2015-03-13 |
| 15. Fix JSON Import & Persistence Gaps | 0/1 | Not started | - |
| 16. Wire Results Mode Toggle | 0/0 | Not started | - |
| 17. Dead Code Cleanup & Documentation Fix | 0/0 | Not started | - |

### Phase 10: Movable Assets and Complete Estate Inventory
**Goal**: Users can input all non-land assets of the deceased (gold, silver, cash, vehicles, jewelry, furniture, livestock, custom items) and the app divides everything according to Islamic Faraid rules, including handling indivisible assets (sale/buyout/Qurah) per Islamic jurisprudence
**Depends on**: Phase 5
**Requirements**: P10-SC1, P10-SC2, P10-SC3, P10-SC4, P10-SC5
**Success Criteria** (what must be TRUE):
  1. User can input movable assets by category: gold/silver (weight + purity), cash/bank deposits, vehicles, jewelry, furniture/household items, livestock, and custom items
  2. Each asset has estimated market value (user-entered or guided estimation)
  3. App calculates per-heir monetary share from total estate (land + movable assets combined)
  4. For indivisible assets (e.g., a car, a ring), app offers Islamic options: sell and divide proceeds, one heir buys out others at fair value, or Qurah (lot drawing) assignment
  5. All division strictly follows Faraid rules -- no asset type is exempt from Islamic inheritance division
**Plans:** 3/3 plans complete

Plans:
- [ ] 10-01-PLAN.md -- Movable asset types (discriminated union), data constants (gold/silver rates, vehicle/livestock types), valuation logic, indivisible buyout math, wizardStore CRUD extension with persist/fingerprint
- [ ] 10-02-PLAN.md -- Category-specific UI forms (gold/silver with rate suggestion, vehicle, livestock, custom, simple BDT), asset card list, Step 4 expansion to Estate Inventory, WizardShell wiring
- [ ] 10-03-PLAN.md -- IndivisibleCard resolution UI (sell/buyout/qurah), EstateBreakdownCard + HeirCard extensions for movable assets, PDF export section

### Phase 11: Interactive Asset Distribution with Drag-and-Drop Equilibrium
**Goal**: Users can distribute all assets (land parcels + movable assets) among heir groups via a drag-and-drop Kanban board with real-time equilibrium indicators, smart randomization toward Faraid share targets, and one-level undo -- replacing and upgrading Phase 9's simpler UI
**Depends on**: Phase 10
**Requirements**: P11-01, P11-02, P11-03, P11-04, P11-05, P11-06, P11-07, P11-08, P11-09
**Success Criteria** (what must be TRUE):
  1. All assets (land parcels and movable assets) appear as draggable cards on a unified Kanban board with one column per heir group
  2. Each column has a colored equilibrium bar (green within 2%, amber within 5%, red beyond 5% of Faraid target)
  3. User can drag items between columns; equilibrium bars and cash compensation update in real-time
  4. Randomize button produces weighted-random near-equilibrium distribution; undo reverts last action
  5. Mobile: 500ms long-press activates drag; "Move to..." fallback buttons always available
  6. "Distribute Assets" button on Results page navigates to distribution board when any assets exist
  7. PDF report includes Distribution Summary section showing final group assignments with mixed asset types
**Plans:** 3/3 plans complete

Plans:
- [ ] 11-01-PLAN.md -- Distribution types (DistributionItem, DistributionGroup, EquilibriumStatus), pure algorithm (buildDistributionItems, smartShuffle, getEquilibriumStatus, moveItem), distributionStore with one-level undo, and comprehensive unit tests
- [ ] 11-02-PLAN.md -- @dnd-kit installation, DnD Kanban UI (DistributionBoard, HeirColumn, AssetCard, EquilibriumBar, SummaryBanner, DistributionControls, MobileFallback), app routing, ResultsPage "Distribute Assets" button, and component tests
- [ ] 11-03-PLAN.md -- PDF PdfDistributionSection with mixed asset types, extractPdfData extension, usePdfExport wiring, and integration tests

### Phase 12: JSON Import and Export
**Goal**: Users can export their full estate data (heirs, properties, movable assets) as a pretty-printed JSON file for backup and portability, and import JSON files (even with partial fields) to populate the wizard for editing and recalculation
**Depends on**: Phase 11
**Requirements**: P12-01, P12-02, P12-03, P12-04, P12-05, P12-06, P12-07, P12-08, P12-09
**Success Criteria** (what must be TRUE):
  1. User can click Export JSON on the Results page and download a pretty-printed .json file containing all wizard inputs with schema metadata
  2. Export excludes computed results (FaraidOutput) -- import triggers fresh engine recalculation
  3. Default filename is auto-generated from heir counts (e.g., "2-sons-1-wife-2015-03-13.json")
  4. User can import a JSON file on Step 1 via drag-and-drop zone or click-to-browse
  5. Partial JSON accepted -- missing fields filled with sensible defaults
  6. Invalid/corrupted JSON shows a toast notification with descriptive error
  7. Import replaces current data after confirmation dialog
**Plans:** 2/2 plans complete

Plans:
- [ ] 12-01-PLAN.md -- Export schema types (ExportSchema, SCHEMA_VERSION), extractExportData pure function, generateExportFilename, import validateAndParseImport with partial data support, and comprehensive unit tests
- [ ] 12-02-PLAN.md -- UI components (Toast, ImportDropZone, ImportConfirmDialog), hooks (useJsonExport, useJsonImport), ResultsPage export button wiring, StepRelationship import zone wiring, and integration tests

### Phase 13: Land Settlement Methods
**Goal**: Users can choose from 4 land settlement methods (Sell & Split, Physical Division by Value, Buyout with installments, Joint Ownership with income calculator) per property on the distribution board, with all calculations following Faraid shares and a complete PDF Settlement Plan section
**Depends on**: Phase 12
**Requirements**: P13-01, P13-02, P13-03, P13-04, P13-05, P13-06, P13-07, P13-08, P13-09, P13-10, P13-11, P13-12
**Success Criteria** (what must be TRUE):
  1. Each property on the distribution board has an expandable settlement method selector with 4 options
  2. Sell & Split shows per-heir BDT payouts with optional actual sale price override
  3. Physical Division allows defining sub-parcels with auto-suggested count and Faraid-based target values, plus cash compensation for imbalance
  4. Buyout shows buyer selection, compensation breakdown, and optional installment plan (no interest -- Islamic finance compliant)
  5. Joint Ownership shows ownership percentages from Faraid shares with optional income calculator (rent/crop)
  6. Settlement data persists via wizardStore (survives navigation and refresh) and exports/imports via JSON
  7. PDF includes a Settlement Plan section with per-property settlement details
**Plans:** 3/3 plans complete

Plans:
- [ ] 13-01-PLAN.md -- Settlement types (discriminated union), 7 pure calculation functions (sell split, sub-parcel targets, physical division compensation, land buyout, installments, ownership shares, income distribution), Property type extension, wizardStore/JSON compatibility, and unit tests
- [ ] 13-02-PLAN.md -- SettlementPanel component with 4 method detail sub-components (SellSplitDetail, PhysicalDivisionDetail, BuyoutDetail, JointOwnershipDetail), wired into distribution board property cards with AnimatePresence expand/collapse
- [ ] 13-03-PLAN.md -- PDF PdfSettlementSection component, pdfTypes extension, extractPdfData settlement extraction, PdfDocument wiring, and visual verification checkpoint

### Phase 14: Per-Heir Asset Breakdown
**Goal**: Users can toggle to an individual-level distribution view showing one column per individual heir (Son 1, Son 2, Daughter 1, etc.) with full drag-and-drop, parcel splitting for precise area-based division, cash compensation between individuals, Qurah ceremony, inline rename, and PDF individual breakdown section -- enabling families to assign specific parcels to specific people
**Depends on**: Phase 13
**Requirements**: P14-01, P14-02, P14-03, P14-04, P14-05, P14-06, P14-07, P14-08, P14-09, P14-10, P14-11, P14-12, P14-13, P14-14, P14-15, P14-16, P14-17, P14-18, P14-19, P14-20, P14-21, P14-22, P14-23
**Success Criteria** (what must be TRUE):
  1. User can toggle between "By Group" and "By Individual" views on the distribution page via accessible segmented control
  2. Individual view shows one column per individual heir, grouped by heir type with section headers and accent colors
  3. User can drag items between any individual columns (cross-type allowed) with real-time equilibrium updates
  4. User can split property parcels into sub-parcels for precise area-based division
  5. User can rename individual heirs inline (click-to-edit with keyboard support)
  6. Qurah ceremony redistributes all items across all individuals with staggered reveal
  7. Cash compensation between individuals minimizes the number of transfers
  8. Custom names and individual distribution state persist via localStorage, JSON export/import, and scenarios
  9. PDF includes "Individual Asset Breakdown" section only when individual view was used
**Plans:** 4/4 plans complete

Plans:
- [ ] 14-01-PLAN.md -- Individual distribution types (IndividualColumn, SplitParcel, IndividualCompensation), pure algorithm functions (expand, subdivide, split/merge, shuffle, compensate), individualDistributionStore with persist middleware, and unit tests
- [ ] 14-02-PLAN.md -- UI components (ViewToggle, IndividualBoard, IndividualColumn, InlineRename, ParcelSplitDialog, IndividualMobileFallback), HeirIcon extraction, DistributionPage integration with view toggle, and component tests
- [ ] 14-03-PLAN.md -- IndividualQurahCeremony overlay with staggered reveal, JSON export/import extension for individual data, scenario persistence extension, and integration tests
- [ ] 14-04-PLAN.md -- PDF PdfIndividualSection component with heir-type grouping, equilibrium indicators, compensation table, extractPdfData extension, PdfDocument wiring, and integration tests

### Phase 15: Fix JSON Import & Persistence Gaps
**Goal**: JSON import correctly restores custom heir names and individual distribution assignments, scenario reset clears all state, and splitOrigins persists across page reloads
**Depends on**: Phase 14
**Requirements**: P14-18, PRST-02 (minor)
**Gap Closure:** Closes gaps from v1.0 audit
**Success Criteria** (what must be TRUE):
  1. JSON import restores customHeirNames and individualDistribution to individualDistributionStore
  2. ScenariosPage "New Calculation" resets movableAssets and expandedAssetId
  3. splitOrigins Map survives page reload via persist partialize
**Plans:** 1 plan

Plans:
- [ ] 15-01-PLAN.md -- Fix useJsonImport individual data restoration, ScenariosPage complete reset, splitOrigins Map-to-Record persistence, and test coverage

### Phase 16: Wire Results Mode Toggle
**Goal**: Users can toggle between simple and detailed views on the Results page
**Depends on**: Phase 3
**Requirements**: RSLT-06
**Gap Closure:** Closes gaps from v1.0 audit
**Success Criteria** (what must be TRUE):
  1. ModeToggle component is rendered in ResultsPage and controls viewMode state
  2. Simple mode shows fractions/percentages only, detailed mode shows full calculation trace with legal citations

### Phase 17: Dead Code Cleanup & Documentation Fix
**Goal**: Remove unreachable dead code, fix minor UI issues, and update REQUIREMENTS.md to reflect actual completion status
**Depends on**: None
**Requirements**: P9-SC3 (documentation only)
**Gap Closure:** Closes gaps from v1.0 audit
**Success Criteria** (what must be TRUE):
  1. LotDivisionPage, divisionStore, StepFamily.tsx, StepSiblings.tsx removed
  2. MonetaryBarChart renders per-bar emerald coloring
  3. Phase 11 types.ts stale comment removed
  4. REQUIREMENTS.md traceability table shows "Complete" for all verified Phase 9-14 requirements
