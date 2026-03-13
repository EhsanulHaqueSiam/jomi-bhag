# Requirements: Jomi-Bhag

**Defined:** 2026-03-12
**Core Value:** Accurate, unbiased Islamic inheritance division -- the app strictly follows Faraid rules for every calculation without favoring any heir.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Faraid Engine

- [x] **FARD-01**: App calculates standard Faraid shares for all heir types (spouse, sons, daughters, brothers, sisters) using exact fraction arithmetic
- [x] **FARD-02**: App applies Awl (proportional reduction) when total prescribed shares exceed the estate
- [x] **FARD-03**: App applies Radd (redistribution of surplus) per Hanafi rules (spouses excluded from Radd)
- [x] **FARD-04**: App correctly identifies and distributes to Asaba (residuary heirs) after fixed shares
- [x] **FARD-05**: App implements all 16 Hajb Hirman (total blocking) rules automatically
- [x] **FARD-06**: App implements all 5 Hajb Nuqsan (partial reduction) rules automatically
- [x] **FARD-07**: App distinguishes between full, consanguine (paternal), and uterine (maternal) siblings
- [x] **FARD-08**: App follows Hanafi school of jurisprudence exclusively for all calculations

### Heir Input

- [x] **HEIR-01**: User can specify their gender (male/female) and marital status
- [x] **HEIR-02**: User can enter number of brothers (full, consanguine, uterine) and their spouse status
- [x] **HEIR-03**: User can enter number of sisters (full, consanguine, uterine) and their spouse status
- [x] **HEIR-04**: User can enter number of sons and daughters of the deceased
- [x] **HEIR-05**: App assumes parents are deceased -- division is among children/siblings and spouses

### Property Input

- [x] **PROP-01**: User can input land area in BD units (decimal/shotangsho, katha, bigha) with auto-conversion
- [x] **PROP-02**: User can add multiple property entries of different types (agricultural, residential, commercial, mixed)
- [x] **PROP-03**: User can input house/structure details (area, condition, estimated value) on land
- [x] **PROP-04**: User can input tree/crop details (type, count, estimated value) -- mango, jackfruit, coconut, bamboo, etc.
- [x] **PROP-05**: User can input pond/water body details with area and estimated value
- [x] **PROP-06**: App handles regional land unit variations (e.g., 1 Katha = 720 sqft Dhaka vs 1620 sqft Rajshahi) with user selection

### Property Valuation

- [x] **VALP-01**: App auto-suggests property prices from BD govt mouza rates by district/upazila
- [x] **VALP-02**: User can override auto-suggested price with actual market value
- [x] **VALP-03**: App calculates total estate value from all property entries combined
- [x] **VALP-04**: App shows per-heir monetary amount based on share fraction x total estate value

### Results Display

- [x] **RSLT-01**: App displays each heir's share as fraction, percentage, and monetary amount simultaneously
- [x] **RSLT-02**: App shows Quranic ayah and/or Hadith reference justifying each heir's share allocation
- [x] **RSLT-03**: App provides step-by-step calculation explanation showing how shares were derived
- [x] **RSLT-04**: App displays pie chart showing proportional share distribution
- [x] **RSLT-05**: App displays bar chart showing monetary amount per heir
- [x] **RSLT-06**: App provides dual mode -- simple view for general public, detailed view for legal professionals

### Output & Export

- [x] **OUTP-01**: App generates downloadable PDF report with heir breakdown, property details, shares, and Quranic references
- [x] **OUTP-02**: App provides print-friendly output with clean layout
- [x] **OUTP-03**: PDF includes disclaimer about consulting a lawyer for legal registration

### Persistence

- [x] **PRST-01**: App saves calculations to browser localStorage without requiring login
- [x] **PRST-02**: User can compare multiple scenarios side by side ("What if" comparison)
- [x] **PRST-03**: User can load and modify previously saved calculations

### Design & UX

- [x] **DSGN-01**: App has modern, exceptional UI design using React + TypeScript + TailwindCSS
- [x] **DSGN-02**: App is fully mobile-responsive (responsive-first design)
- [x] **DSGN-03**: App uses multi-step wizard flow (heir input -> property input -> valuation -> results)
- [x] **DSGN-04**: App works as a static site deployed on Netlify (client-side only)

### Land Lot Division

- [x] **P9-SC1**: Parcels auto-populated from Step 4 properties with name, area, and market price -- no re-entry needed
- [x] **P9-SC2**: App divides land parcels into groups matching each heir type's Faraid share using greedy best-fit algorithm with cash compensation for imbalances
- [x] **P9-SC3**: User can assign groups to heirs via Qurah (Islamic lot drawing) with staggered reveal, or manually reassign parcels between groups
- [x] **P9-SC4**: Division follows Islamic fair division rules -- whole parcels assigned, cash compensation bridges value gaps, Qurah practice with Quranic/Hadith reference

### Movable Assets and Estate Inventory

- [x] **P10-SC1**: User can input movable assets by category: gold/silver (weight + purity), cash/bank deposits, vehicles, jewelry, furniture/household items, livestock, and custom items
- [x] **P10-SC2**: Each asset has estimated market value via user entry or guided estimation (gold rate suggestion, livestock count x per-unit value)
- [x] **P10-SC3**: App calculates per-heir monetary share from total estate (land properties + movable assets combined)
- [x] **P10-SC4**: For indivisible assets (vehicles, jewelry, livestock, custom items), app offers three Islamic options: sell and divide proceeds, one heir buys out others at fair value, or Qurah (lot drawing) assignment
- [x] **P10-SC5**: All division strictly follows Faraid rules -- no asset type is exempt from Islamic inheritance division

### Interactive Asset Distribution

- [x] **P11-01**: All assets (land parcels + movable assets) unified into a single distribution board with draggable cards per item
- [x] **P11-02**: Smart shuffle algorithm redistributes items weighted toward equilibrium (larger items to under-filled groups first, random tie-breaking)
- [x] **P11-03**: Equilibrium indicator shows green (within 2% of Faraid target), amber (within 5%), red (beyond 5%) per heir group
- [x] **P11-04**: Kanban-style drag-and-drop board with one column per heir group, asset cards draggable between columns
- [x] **P11-05**: Moving an asset between columns updates equilibrium bars and cash compensation in real-time
- [x] **P11-06**: One-level undo reverts the last move or randomize action
- [x] **P11-07**: "Distribute Assets" button on Results page (replaces "Divide Land") navigates to distribution board when any assets exist
- [x] **P11-08**: Mobile long-press (500ms) activates drag; "Move to..." fallback buttons always available
- [x] **P11-09**: PDF report includes Distribution Summary section with group assignments, mixed asset types, and cash compensations

### JSON Import and Export

- [x] **P12-01**: App exports full wizard input state as pretty-printed JSON with schemaVersion, appVersion, and exportDate metadata
- [x] **P12-02**: Export excludes computed results (FaraidOutput) -- import triggers fresh engine recalculation for consistency across engine versions
- [x] **P12-03**: Default export filename auto-generated from heir counts (e.g., "2-sons-1-wife-2026-03-13.json")
- [x] **P12-04**: App imports JSON files and loads valid data into the wizard for editing and recalculation
- [x] **P12-05**: Partial JSON accepted on import -- missing fields filled with sensible defaults (zero counts, empty arrays, null relationships)
- [x] **P12-06**: Import validates types and enum values, rejects invalid/corrupted JSON with descriptive toast notification
- [x] **P12-07**: File selection via drag-and-drop zone with visual feedback on drag-over, or click-to-browse fallback
- [x] **P12-08**: Confirmation dialog appears before import replaces current wizard data
- [x] **P12-09**: Toast notifications for import errors (invalid JSON, wrong types, file too large) and import success

### Land Settlement Methods

- [x] **P13-01**: Sell & Split calculates per-heir BDT payout from property value multiplied by Faraid share fractions
- [x] **P13-02**: Sell & Split allows optional actual sale price entry that overrides property value for recalculation
- [x] **P13-03**: Physical Division computes target sub-parcel values proportional to Faraid shares with auto-suggested parcel count
- [x] **P13-04**: Physical Division shows cash compensation when sub-parcel appraised values don't match Faraid targets
- [x] **P13-05**: Buyout extends existing calculateBuyout with heir group selection and per-group compensation breakdown
- [x] **P13-06**: Buyout supports optional installment payment plan with no interest (Islamic finance compliant)
- [x] **P13-07**: Joint Ownership displays ownership percentages matching Faraid shares for each heir group
- [x] **P13-08**: Joint Ownership provides optional income calculator distributing rent or crop income proportionally
- [x] **P13-09**: Property type extended with settlement field (null default) persisted in wizardStore and JSON export/import
- [x] **P13-10**: JSON import handles missing settlement field gracefully (defaults to null) for backward compatibility
- [x] **P13-11**: Settlement method selector on each property card in the distribution board with expandable detail panel
- [x] **P13-12**: PDF includes Settlement Plan section with per-property settlement details (method, amounts, sub-parcels, installments, ownership shares)

### Per-Heir Asset Breakdown

- [ ] **P14-01**: Individual columns expand from group distribution: each heir type group's items split equally among its individual members
- [ ] **P14-02**: Parcel split algorithm creates sub-parcels with proportional values that sum exactly to the original (no rounding drift)
- [ ] **P14-03**: Parcel merge reverses a split, restoring the original item
- [ ] **P14-04**: Individual Qurah shuffle redistributes all items across all individuals using weighted-random algorithm
- [ ] **P14-05**: Cash compensation between individuals minimizes the number of transfers using greedy matching
- [ ] **P14-06**: Individual distribution fingerprint includes heir type counts so heir changes invalidate state
- [ ] **P14-07**: individualDistributionStore persists to localStorage via Zustand persist middleware with fractionStorage
- [ ] **P14-08**: Segmented control toggle ("By Group" / "By Individual") with role='tablist' accessibility on distribution page
- [ ] **P14-09**: Individual columns grouped by heir type with section headers and type-based accent colors (sons=emerald, daughters=rose, etc.)
- [ ] **P14-10**: Full DnD between all individual columns (cross-type allowed) with same sensors as Phase 11
- [ ] **P14-11**: Inline rename: click name to edit, Enter to save, Escape to cancel, custom name as primary with original as subtitle
- [ ] **P14-12**: Parcel split dialog: user enters split areas, validation ensures sum equals original, each sub-parcel becomes draggable card
- [ ] **P14-13**: Per-individual equilibrium bars: green within 2%, amber within 5%, red beyond 5% of target BDT value
- [ ] **P14-14**: Mobile "Move to..." dropdown shows flat list of all individual heir names
- [ ] **P14-15**: HeirIcon (male/female silhouette) shown on each individual column header
- [ ] **P14-16**: Individual Qurah ceremony overlay with bismillah header, staggered reveal at 200ms per column, prefers-reduced-motion support
- [ ] **P14-17**: JSON export includes custom heir names and individual distribution assignments when individual view was used
- [ ] **P14-18**: JSON import restores custom names and individual assignments (missing fields use defaults for backward compat)
- [ ] **P14-19**: Scenarios save and restore individual distribution state including custom names
- [ ] **P14-20**: Both views fully independent -- switching never affects the other's state
- [ ] **P14-21**: PDF "Individual Asset Breakdown" section appears only when individual view was used, placed after Distribution Summary
- [ ] **P14-22**: PDF individual sections grouped by heir type with equilibrium indicators, compensation table, and summary line
- [ ] **P14-23**: PDF includes Qurah reference in individual section when Qurah was used

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Localization

- **LOCL-01**: Full Bangla language support throughout the app
- **LOCL-02**: Bangla numeral display option

### Accounts

- **ACCT-01**: Optional user accounts via Supabase Auth
- **ACCT-02**: Cloud-synced saved calculations across devices

### Extended Heirs

- **EXTH-01**: Support for grandchildren inheritance (MFLO Section 4)
- **EXTH-02**: Support for distant kindred (dhawil-arham)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-school fiqh support (Shafi'i, Maliki, etc.) | Bangladesh exclusively follows Hanafi -- other schools add confusion and 4x complexity |
| Will/Wasiyyah creation tool | Legal service requiring lawyer review -- carries liability |
| Country-specific civil law overlays | Tool's value is strict Islamic Faraid accuracy, not legal advice |
| Real-time collaborative editing | Massive infrastructure complexity for marginal value -- families discuss in person |
| Map-based land visualization | Requires cadastral data not digitally available in BD |
| Monetization (ads, premium) | Explicitly free forever per project decision |
| Non-Muslim inheritance law | Completely different legal frameworks -- separate tool needed |
| Mobile native app | Web-first, responsive design serves mobile users |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FARD-01 | Phase 1 | Complete |
| FARD-02 | Phase 1 | Complete |
| FARD-03 | Phase 1 | Complete |
| FARD-04 | Phase 1 | Complete |
| FARD-05 | Phase 1 | Complete |
| FARD-06 | Phase 1 | Complete |
| FARD-07 | Phase 1 | Complete |
| FARD-08 | Phase 1 | Complete |
| DSGN-04 | Phase 1 | Complete |
| HEIR-01 | Phase 2 | Complete |
| HEIR-02 | Phase 2 | Complete |
| HEIR-03 | Phase 2 | Complete |
| HEIR-04 | Phase 2 | Complete |
| HEIR-05 | Phase 2 | Complete |
| DSGN-01 | Phase 2 | Complete |
| DSGN-02 | Phase 2 | Complete |
| DSGN-03 | Phase 2 | Complete |
| RSLT-01 | Phase 3 | Complete |
| RSLT-02 | Phase 3 | Complete |
| RSLT-03 | Phase 3 | Complete |
| RSLT-06 | Phase 3 | Complete |
| PROP-01 | Phase 4 | Complete |
| PROP-02 | Phase 4 | Complete |
| PROP-03 | Phase 4 | Complete |
| PROP-04 | Phase 4 | Complete |
| PROP-05 | Phase 4 | Complete |
| PROP-06 | Phase 4 | Complete |
| VALP-01 | Phase 5 | Complete |
| VALP-02 | Phase 5 | Complete |
| VALP-03 | Phase 5 | Complete |
| VALP-04 | Phase 5 | Complete |
| RSLT-04 | Phase 6 | Complete |
| RSLT-05 | Phase 6 | Complete |
| OUTP-01 | Phase 7 | Complete |
| OUTP-02 | Phase 7 | Complete |
| OUTP-03 | Phase 7 | Complete |
| PRST-01 | Phase 8 | Complete |
| PRST-02 | Phase 8 | Complete |
| PRST-03 | Phase 8 | Complete |
| P9-SC1 | Phase 9 | Planned |
| P9-SC2 | Phase 9 | Planned |
| P9-SC3 | Phase 9 | Planned |
| P9-SC4 | Phase 9 | Planned |
| P10-SC1 | Phase 10 | Planned |
| P10-SC2 | Phase 10 | Planned |
| P10-SC3 | Phase 10 | Planned |
| P10-SC4 | Phase 10 | Planned |
| P10-SC5 | Phase 10 | Planned |
| P11-01 | Phase 11 | Planned |
| P11-02 | Phase 11 | Planned |
| P11-03 | Phase 11 | Planned |
| P11-04 | Phase 11 | Planned |
| P11-05 | Phase 11 | Planned |
| P11-06 | Phase 11 | Planned |
| P11-07 | Phase 11 | Planned |
| P11-08 | Phase 11 | Planned |
| P11-09 | Phase 11 | Planned |
| P12-01 | Phase 12 | Planned |
| P12-02 | Phase 12 | Planned |
| P12-03 | Phase 12 | Planned |
| P12-04 | Phase 12 | Planned |
| P12-05 | Phase 12 | Planned |
| P12-06 | Phase 12 | Planned |
| P12-07 | Phase 12 | Planned |
| P12-08 | Phase 12 | Planned |
| P12-09 | Phase 12 | Planned |
| P13-01 | Phase 13 | Planned |
| P13-02 | Phase 13 | Planned |
| P13-03 | Phase 13 | Planned |
| P13-04 | Phase 13 | Planned |
| P13-05 | Phase 13 | Planned |
| P13-06 | Phase 13 | Planned |
| P13-07 | Phase 13 | Planned |
| P13-08 | Phase 13 | Planned |
| P13-09 | Phase 13 | Planned |
| P13-10 | Phase 13 | Planned |
| P13-11 | Phase 13 | Planned |
| P13-12 | Phase 13 | Planned |
| P14-01 | Phase 14 | Planned |
| P14-02 | Phase 14 | Planned |
| P14-03 | Phase 14 | Planned |
| P14-04 | Phase 14 | Planned |
| P14-05 | Phase 14 | Planned |
| P14-06 | Phase 14 | Planned |
| P14-07 | Phase 14 | Planned |
| P14-08 | Phase 14 | Planned |
| P14-09 | Phase 14 | Planned |
| P14-10 | Phase 14 | Planned |
| P14-11 | Phase 14 | Planned |
| P14-12 | Phase 14 | Planned |
| P14-13 | Phase 14 | Planned |
| P14-14 | Phase 14 | Planned |
| P14-15 | Phase 14 | Planned |
| P14-16 | Phase 14 | Planned |
| P14-17 | Phase 14 | Planned |
| P14-18 | Phase 14 | Planned |
| P14-19 | Phase 14 | Planned |
| P14-20 | Phase 14 | Planned |
| P14-21 | Phase 14 | Planned |
| P14-22 | Phase 14 | Planned |
| P14-23 | Phase 14 | Planned |

**Coverage:**
- v1 requirements: 39 total
- Post-v1 (Phase 9+): 62 total
- Mapped to phases: 101
- Unmapped: 0

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-14 after Phase 14 planning (P14-01 through P14-23 added)*
