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
- [x] **Phase 4: Property Input System** - Multi-property entry with BD land units, regional conversion, houses, trees/crops, and ponds (completed 2026-03-12)
- [ ] **Phase 5: Property Valuation** - Estate value calculation with mouza rate auto-suggestion, user override, and per-heir monetary distribution
- [ ] **Phase 6: Charts and Visualization** - Pie chart for proportional shares and bar chart for monetary comparison
- [ ] **Phase 7: PDF Export and Print** - Downloadable PDF report with full division details, Quranic references, and print-friendly layout
- [ ] **Phase 8: Persistence and Scenarios** - localStorage saving, scenario comparison, and load/modify previous calculations
- [ ] **Phase 9: Land Lot Division and Qurah Assignment** - Named land parcels divided into heir groups per Faraid shares, Qurah-based random or user-named assignment, strictly Islamic fair division
- [ ] **Phase 10: Movable Assets and Complete Estate Inventory** - Gold, silver, cash, vehicles, jewelry, furniture, investments, livestock, and all non-land assets with Islamic rules for indivisible item division

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
- [ ] 04-01-PLAN.md -- Land unit types, conversion module with regional BD variations, BD data constants, Zustand store property CRUD, and wizard step 4-to-5 reindexing
- [ ] 04-02-PLAN.md -- Property UI components (cards, type selector, land area input, house/tree/pond sub-items), running total, integration tests, and visual verification

### Phase 5: Property Valuation
**Goal**: The app calculates total estate value from all properties and distributes monetary amounts to each heir based on their Faraid share
**Depends on**: Phase 4
**Requirements**: VALP-01, VALP-02, VALP-03, VALP-04
**Success Criteria** (what must be TRUE):
  1. App auto-suggests property prices from BD government mouza rates by district/upazila, and user can override with actual market value
  2. Total estate value is computed from all property entries combined (land + structures + trees/crops + ponds)
  3. Each heir's monetary amount is calculated as their share fraction multiplied by total estate value and displayed alongside their share
**Plans**: TBD

Plans:
- [ ] 05-01: Mouza rate data and valuation engine
- [ ] 05-02: Estate total calculation and per-heir monetary distribution

### Phase 6: Charts and Visualization
**Goal**: Users can see their inheritance division visually through charts
**Depends on**: Phase 3, Phase 5
**Requirements**: RSLT-04, RSLT-05
**Success Criteria** (what must be TRUE):
  1. A pie chart displays proportional share distribution across all heirs
  2. A bar chart displays monetary amount per heir for direct comparison
**Plans**: TBD

Plans:
- [ ] 06-01: Pie and bar chart components with Recharts

### Phase 7: PDF Export and Print
**Goal**: Users can download or print a complete inheritance division report
**Depends on**: Phase 6
**Requirements**: OUTP-01, OUTP-02, OUTP-03
**Success Criteria** (what must be TRUE):
  1. User can download a PDF report containing heir breakdown, property details, share allocations, and Quranic references
  2. The PDF includes a disclaimer about consulting a lawyer for legal registration
  3. The app provides a print-friendly output with clean layout (no UI chrome, proper page breaks)
**Plans**: TBD

Plans:
- [ ] 07-01: PDF generation with @react-pdf/renderer
- [ ] 07-02: Print stylesheet and disclaimer

### Phase 8: Persistence and Scenarios
**Goal**: Users can save their calculations and compare different inheritance scenarios without creating an account
**Depends on**: Phase 3
**Requirements**: PRST-01, PRST-02, PRST-03
**Success Criteria** (what must be TRUE):
  1. Calculations are automatically saved to browser localStorage and persist across page refreshes without requiring login
  2. User can compare multiple saved scenarios side by side to evaluate "what if" variations
  3. User can load a previously saved calculation and modify it to create a new scenario
**Plans**: TBD

Plans:
- [ ] 08-01: localStorage persistence with Zustand persist
- [ ] 08-02: Scenario comparison and load/modify

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Faraid Engine and Project Foundation | 4/4 | Complete | 2026-03-12 |
| 2. Heir Input Wizard | 3/3 | Complete | 2026-03-12 |
| 3. Core Results Display | 2/2 | Complete | 2026-03-12 |
| 4. Property Input System | 2/2 | Complete   | 2026-03-12 |
| 5. Property Valuation | 0/2 | Not started | - |
| 6. Charts and Visualization | 0/1 | Not started | - |
| 7. PDF Export and Print | 0/2 | Not started | - |
| 8. Persistence and Scenarios | 0/2 | Not started | - |
| 9. Land Lot Division and Qurah Assignment | 0/0 | Not started | - |
| 10. Movable Assets and Complete Estate Inventory | 0/0 | Not started | - |

### Phase 9: Land Lot Division and Qurah Assignment
**Goal**: Users can enter named land parcels (name, quantity in BD units, market price with auto-suggest), and the app divides parcels into groups matching Faraid shares, then assigns groups to heirs via Qurah (Islamic lot drawing) or user-specified names — strictly following Islamic fair division rules
**Depends on**: Phase 5
**Requirements**: TBD
**Success Criteria** (what must be TRUE):
  1. User can enter multiple named land parcels with name, quantity (decimal/shotok/katha/bigha), and current market price (auto-filled where possible, user-editable)
  2. App divides land parcels into groups that match each heir's Faraid share as closely as possible
  3. User can randomly assign groups to heirs (Qurah — Islamic lot drawing) or manually name/assign each group
  4. Division and assignment strictly follow Islamic rules for fair property division
**Plans**: TBD

Plans:
- [ ] 09-01: Land parcel input and group division algorithm
- [ ] 09-02: Qurah assignment and manual heir-to-group mapping

### Phase 10: Movable Assets and Complete Estate Inventory
**Goal**: Users can input all non-land assets of the deceased (gold, silver, cash, vehicles, jewelry, furniture, investments, livestock, etc.) and the app divides everything according to Islamic Faraid rules, including handling indivisible assets (sale/buyout/Qurah) per Islamic jurisprudence
**Depends on**: Phase 5
**Requirements**: TBD
**Success Criteria** (what must be TRUE):
  1. User can input movable assets by category: gold/silver (weight + purity), cash/bank deposits, vehicles, jewelry, furniture/household items, investments/shares, livestock, and custom items
  2. Each asset has estimated market value (user-entered or guided estimation)
  3. App calculates per-heir monetary share from total estate (land + movable assets combined)
  4. For indivisible assets (e.g., a car, a ring), app offers Islamic options: sell and divide proceeds, one heir buys out others at fair value, or Qurah (lot drawing) assignment
  5. All division strictly follows Faraid rules — no asset type is exempt from Islamic inheritance division
**Plans**: TBD

Plans:
- [ ] 10-01: Movable asset input forms by category with valuation
- [ ] 10-02: Indivisible asset handling (sale/buyout/Qurah) and combined estate calculation
