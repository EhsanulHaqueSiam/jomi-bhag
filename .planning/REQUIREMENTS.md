# Requirements: Jomi-Bhag

**Defined:** 2026-03-12
**Core Value:** Accurate, unbiased Islamic inheritance division — the app strictly follows Faraid rules for every calculation without favoring any heir.

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

- [ ] **HEIR-01**: User can specify their gender (male/female) and marital status
- [ ] **HEIR-02**: User can enter number of brothers (full, consanguine, uterine) and their spouse status
- [ ] **HEIR-03**: User can enter number of sisters (full, consanguine, uterine) and their spouse status
- [ ] **HEIR-04**: User can enter number of sons and daughters of the deceased
- [ ] **HEIR-05**: App assumes parents are deceased — division is among children/siblings and spouses

### Property Input

- [ ] **PROP-01**: User can input land area in BD units (decimal/shotangsho, katha, bigha) with auto-conversion
- [ ] **PROP-02**: User can add multiple property entries of different types (agricultural, residential, commercial, mixed)
- [ ] **PROP-03**: User can input house/structure details (area, condition, estimated value) on land
- [ ] **PROP-04**: User can input tree/crop details (type, count, estimated value) — mango, jackfruit, coconut, bamboo, etc.
- [ ] **PROP-05**: User can input pond/water body details with area and estimated value
- [ ] **PROP-06**: App handles regional land unit variations (e.g., 1 Katha = 720 sqft Dhaka vs 1620 sqft Rajshahi) with user selection

### Property Valuation

- [ ] **VALP-01**: App auto-suggests property prices from BD govt mouza rates by district/upazila
- [ ] **VALP-02**: User can override auto-suggested price with actual market value
- [ ] **VALP-03**: App calculates total estate value from all property entries combined
- [ ] **VALP-04**: App shows per-heir monetary amount based on share fraction × total estate value

### Results Display

- [ ] **RSLT-01**: App displays each heir's share as fraction, percentage, and monetary amount simultaneously
- [ ] **RSLT-02**: App shows Quranic ayah and/or Hadith reference justifying each heir's share allocation
- [ ] **RSLT-03**: App provides step-by-step calculation explanation showing how shares were derived
- [ ] **RSLT-04**: App displays pie chart showing proportional share distribution
- [ ] **RSLT-05**: App displays bar chart showing monetary amount per heir
- [ ] **RSLT-06**: App provides dual mode — simple view for general public, detailed view for legal professionals

### Output & Export

- [ ] **OUTP-01**: App generates downloadable PDF report with heir breakdown, property details, shares, and Quranic references
- [ ] **OUTP-02**: App provides print-friendly output with clean layout
- [ ] **OUTP-03**: PDF includes disclaimer about consulting a lawyer for legal registration

### Persistence

- [ ] **PRST-01**: App saves calculations to browser localStorage without requiring login
- [ ] **PRST-02**: User can compare multiple scenarios side by side ("What if" comparison)
- [ ] **PRST-03**: User can load and modify previously saved calculations

### Design & UX

- [ ] **DSGN-01**: App has modern, exceptional UI design using React + TypeScript + TailwindCSS
- [ ] **DSGN-02**: App is fully mobile-responsive (responsive-first design)
- [ ] **DSGN-03**: App uses multi-step wizard flow (heir input → property input → valuation → results)
- [x] **DSGN-04**: App works as a static site deployed on Netlify (client-side only)

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
| Multi-school fiqh support (Shafi'i, Maliki, etc.) | Bangladesh exclusively follows Hanafi — other schools add confusion and 4x complexity |
| Will/Wasiyyah creation tool | Legal service requiring lawyer review — carries liability |
| Country-specific civil law overlays | Tool's value is strict Islamic Faraid accuracy, not legal advice |
| Real-time collaborative editing | Massive infrastructure complexity for marginal value — families discuss in person |
| Map-based land visualization | Requires cadastral data not digitally available in BD |
| Monetization (ads, premium) | Explicitly free forever per project decision |
| Non-Muslim inheritance law | Completely different legal frameworks — separate tool needed |
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
| HEIR-01 | Phase 2 | Pending |
| HEIR-02 | Phase 2 | Pending |
| HEIR-03 | Phase 2 | Pending |
| HEIR-04 | Phase 2 | Pending |
| HEIR-05 | Phase 2 | Pending |
| DSGN-01 | Phase 2 | Pending |
| DSGN-02 | Phase 2 | Pending |
| DSGN-03 | Phase 2 | Pending |
| RSLT-01 | Phase 3 | Pending |
| RSLT-02 | Phase 3 | Pending |
| RSLT-03 | Phase 3 | Pending |
| RSLT-06 | Phase 3 | Pending |
| PROP-01 | Phase 4 | Pending |
| PROP-02 | Phase 4 | Pending |
| PROP-03 | Phase 4 | Pending |
| PROP-04 | Phase 4 | Pending |
| PROP-05 | Phase 4 | Pending |
| PROP-06 | Phase 4 | Pending |
| VALP-01 | Phase 5 | Pending |
| VALP-02 | Phase 5 | Pending |
| VALP-03 | Phase 5 | Pending |
| VALP-04 | Phase 5 | Pending |
| RSLT-04 | Phase 6 | Pending |
| RSLT-05 | Phase 6 | Pending |
| OUTP-01 | Phase 7 | Pending |
| OUTP-02 | Phase 7 | Pending |
| OUTP-03 | Phase 7 | Pending |
| PRST-01 | Phase 8 | Pending |
| PRST-02 | Phase 8 | Pending |
| PRST-03 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 after roadmap creation*
