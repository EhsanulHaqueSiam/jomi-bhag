# Project Research Summary

**Project:** Jomi-Bhag (Islamic Inheritance Land Division Calculator)
**Domain:** Islamic Inheritance (Faraid) + Bangladesh Land Division
**Researched:** 2026-03-12
**Confidence:** HIGH

## Executive Summary

Jomi-Bhag is a client-side web calculator that computes Islamic inheritance shares (Faraid) under Hanafi jurisprudence and distributes Bangladeshi property assets among heirs. The product occupies a clear competitive gap: no existing tool combines accurate Faraid calculation with Bangladesh-specific property types (agricultural land, homesteads, fishponds, tree groves), step-by-step Quranic source citations, and professional PDF reports. The closest competitor -- the BD government's uttoradhikar.gov.bd -- has a buggy mobile app, no charts, no Quranic references, and treats the estate as a single lump sum. Building this well means getting the Faraid calculation engine right first, then layering property valuation and presentation on top.

The recommended approach is a pure client-side SPA (React 19 + TypeScript + Vite + TailwindCSS) deployed to Netlify with zero backend dependencies for v1. The critical technical decision is building the Faraid engine from scratch on top of fraction.js for exact rational arithmetic, because the only existing npm library is abandoned and incomplete, and because floating-point math is fundamentally incompatible with Faraid's exact fractions (1/2, 1/3, 1/6, 1/8). The engine must live in a pure TypeScript computation layer with no React imports -- this is non-negotiable for testability, since incorrect inheritance calculations destroy trust in an Islamic tool and there are 16+ blocking rules, Awl/Radd adjustments, and madhab-specific edge cases that must all be verified against known Faraid outcomes.

The key risks are: (1) incorrect Hajb blocking rules producing wrong shares for complex heir combinations, mitigated by building blocking as a separate, exhaustively-tested module before any UI work; (2) Bangladesh's chaotic land measurement system where 1 Katha = 720 sq ft in Dhaka but 1,620 sq ft in Rajshahi, mitigated by requiring district/region selection and converting everything to the universal "decimal" unit; and (3) the absence of any public API for Bangladesh land pricing data, mitigated by defaulting to manual property value entry with optional auto-suggestion from a static mouza rate dataset in later phases. A design decision on MFLO 1961 Section 4 (orphaned grandchildren representation) must be made before engine development begins, as it fundamentally affects the heir model.

## Key Findings

### Recommended Stack

The core framework (React 19, TypeScript 5.5+, TailwindCSS 4, Bun, Vite, Netlify) is decided per project constraints. Research focused on supporting libraries, all of which are actively maintained with 2025-2026 releases.

**Core technologies:**
- **fraction.js v5.3.4:** Exact rational arithmetic for Faraid shares -- stores numerator/denominator as BigInt, handles LCM/GCD natively for Awl calculations, 2.6M+ weekly downloads
- **@react-pdf/renderer v4.3.2:** PDF generation with JSX components and custom font registration (TTF/OTF/WOFF2) -- the only option that supports future Bangla script via Font.register(); jsPDF has a confirmed, unresolved Bengali rendering issue (GitHub #2587)
- **Recharts v3.8.0:** SVG-based charts (pie, bar, stacked) that integrate cleanly with @react-pdf/renderer's SVG support -- Canvas-based alternatives (Chart.js) produce blurry PDF output
- **Zustand v5.0.11:** State management with built-in localStorage persistence via `persist` middleware -- supports partialize, versioned migration, and rehydration callbacks
- **shadcn/ui (CLI v4):** Accessible React components (Radix UI primitives + TailwindCSS) with full source code ownership -- needed components: Button, Card, Dialog, Select, Input, Tabs, Table, Accordion, Toast, Sheet
- **React Hook Form v7.71.2 + Zod v4.3.6:** Form handling with per-step validation schemas and TypeScript type inference from Zod schemas
- **react-router v7.13.1:** Standard SPA routing for 4-5 routes; requires Netlify `_redirects` file for SPA fallback
- **Custom Faraid engine:** Built from scratch because the only existing library (@hu-bcs1/islamic-inheritance-calculator) is abandoned (last updated June 2023), incomplete (missing grandfather/half-sibling support), and uses outdated dependencies

**Critical stack note:** Supabase Auth is MEDIUM confidence and should be deferred. The app works fully with localStorage. Evaluate Supabase only if user demand for saved calculations is validated.

### Expected Features

**Must have (table stakes):**
- Faraid calculation engine (Hanafi) with Awl, Radd, Asaba, Hajb
- Heir input system supporting sons, daughters, spouses, full/consanguine/uterine siblings
- Share results displayed as fractions + percentages + monetary amounts simultaneously
- Quranic/Hadith references cited per share allocation (Quran 4:11, 4:12, 4:176)
- Property input with BD land units (decimal/shotangsho, katha, bigha)
- Property value distribution (multiply shares by estate value)
- Visual charts (pie for proportional shares, bar for monetary comparison)
- Mobile-responsive design (majority of BD users are on mobile)
- Print-friendly output

**Should have (differentiators):**
- Property-type-aware division (agricultural land, houses, trees/crops, ponds) -- no competitor does this
- Step-by-step calculation explanation with Quranic citations -- no competitor does this
- Dual mode UI (simple for families, detailed for lawyers) -- no competitor does this
- PDF report generation with full details and references
- Mouza rate auto-suggestion (when data is available)

**Defer (v2+):**
- Scenario comparison ("what if")
- Optional user accounts with saved calculations
- Bangla language support (high value but significant effort, explicitly out of scope for v1)
- Extended heir types (grandchildren, great-grandparents, distant kindred)
- Multi-school fiqh support (anti-feature for BD audience)
- Will/Wasiyyah creation (legal liability)
- Map-based land visualization (no reliable cadastral data)

### Architecture Approach

The architecture follows a strict three-layer separation: a pure TypeScript computation layer (core/) with zero React imports, a Zustand state layer (stores/) that bridges computation to UI, and a React presentation layer (components/). The Faraid engine is the innermost layer -- pure functions taking typed inputs and returning typed outputs, testable without rendering React. The engine follows a 7-step pipeline: validate heirs, apply Hajb blocking, assign fixed shares (Fard), assign residuary shares (Asaba), adjust via Awl or Radd, annotate with Quran/Hadith references, and compute monetary values. The wizard UI uses step-isolated components, each with its own Zod validation schema, communicating through a shared Zustand store.

**Major components:**
1. **Faraid Engine (core/faraid/)** -- Pure TypeScript calculation pipeline: blocking, fixed shares, residuary, adjustments, references, monetization
2. **Property Valuation Engine (core/property/)** -- Combines land area, structures, trees/crops into total estate value with BD unit conversions
3. **Wizard UI (components/wizard/)** -- 4-step input form (heirs, property, valuation, review) with per-step Zod validation
4. **Results Dashboard (components/results/)** -- Share breakdown, Quranic references, monetary tables -- reads from calculation store only
5. **Chart Visualization (components/charts/)** -- Recharts pie/bar charts consuming share data
6. **PDF Export (components/pdf/)** -- @react-pdf/renderer document tree mirroring results components with PDF-specific primitives
7. **Zustand Stores (stores/)** -- Wizard store (persisted to localStorage), calculation store (ephemeral, recomputed on demand), settings store (persisted)

### Critical Pitfalls

1. **Incorrect Hajb blocking rules** -- 16+ total-blocking and 5 partial-blocking rules that are interdependent and madhab-specific. Must be the first step in the engine pipeline, built as a separate testable module, verified against all rule combinations. A father blocking brothers, a grandfather blocking siblings (Hanafi-specific) -- getting any of these wrong produces fundamentally incorrect shares.

2. **Floating-point arithmetic for shares** -- JavaScript cannot represent 1/3 exactly. Using native numbers causes Awl/Radd detection to fail, shares to not sum to 100%, and rounding errors to compound. Use fraction.js for ALL share arithmetic from day 1; convert to decimal only at the display layer. Retrofitting rational arithmetic later requires rewriting the entire engine (HIGH recovery cost).

3. **Broken Awl/Radd implementation** -- Awl (proportional reduction when shares exceed 1) and Radd (remainder return when shares are less than 1 with no residuary) are not edge cases -- they are core Faraid. Radd must exclude spouses per Hanafi madhab. The BD government's own app reportedly shows totals exceeding input amounts, which is exactly this bug.

4. **MFLO 1961 Section 4 ambiguity** -- Bangladesh law says orphaned grandchildren inherit their predeceased parent's share, which contradicts classical Hanafi blocking rules. The app must explicitly decide whether it follows pure Faraid or BD legal modifications, and document that decision prominently. This affects the data model from the start.

5. **Bangladesh land measurement unit chaos** -- 1 Katha varies by 2x across regions. Must require district/region selection, default to the universal "decimal" unit (435.6 sq ft everywhere), and show conversion explicitly. A single-unit assumption produces wrong valuations for half the country.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Faraid Engine Foundation
**Rationale:** Every feature depends on correct inheritance calculations. The engine is a hard prerequisite that must be built and exhaustively tested before any UI work. Architecture research explicitly identifies this as the critical path.
**Delivers:** Complete Faraid calculation engine with full test coverage, core type system, Quran/Hadith reference data, project scaffolding (Vite + React + TailwindCSS + shadcn/ui init)
**Addresses:** Faraid calculation (P1), Hajb exclusion (P1), heir type taxonomy, Awl/Radd adjustments
**Avoids:** Hajb blocking errors (Pitfall 1), floating-point precision (Pitfall 6), broken Awl/Radd (Pitfalls 2-3), scope creep from undefined heir types (Pitfall 9)
**Must decide:** MFLO Section 4 stance (pure Faraid vs BD legal modifications) -- this affects the heir data model

### Phase 2: Core UI and Wizard
**Rationale:** With the engine tested and correct, the UI can be built with confidence that displayed results are accurate. The wizard pattern is the primary user journey and must be in place before adding visualization or export features.
**Delivers:** Multi-step wizard (heir input, property input, valuation, review), results dashboard with share breakdown, Quranic references displayed per share, basic responsive layout
**Uses:** React Hook Form + Zod (per-step validation), Zustand (wizard store with localStorage persistence), shadcn/ui components
**Implements:** Wizard UI, Results Dashboard, Zustand stores, bridge hooks
**Avoids:** Monolithic form anti-pattern (Architecture AP3), wizard UX fatigue (UX Pitfall -- allow heir-only quick calculation without property input)

### Phase 3: Property Valuation and BD Land Units
**Rationale:** Property valuation is architecturally independent of Faraid calculation -- it produces a total estate value that feeds into the engine. Building it after core UI means users can already get share fractions while property features are added.
**Delivers:** Multi-property-type input (agricultural land, houses, trees/crops, ponds), BD land unit support with regional conversion, manual price entry with unit guidance, property value distribution across shares
**Addresses:** Property-type-aware division (differentiator), BD land units (P1), property value distribution (P1)
**Avoids:** Land unit chaos (Pitfall 7), treating mouza rates as authoritative (Pitfall 8)

### Phase 4: Visualization, Charts, and PDF Export
**Rationale:** Charts and PDF render data that must be stable first. SVG-based Recharts output integrates with @react-pdf/renderer's SVG support, so building them together makes sense. PDF is the final output layer packaging everything.
**Delivers:** Pie/donut charts for share proportions, bar charts for monetary comparison, downloadable PDF reports with property schedule + share breakdown + Quranic references, print stylesheet
**Uses:** Recharts (SVG charts), @react-pdf/renderer (PDF generation)
**Avoids:** Bengali PDF rendering issues (Pitfall 10 -- v1 is English-only, but font architecture must support future Bangla), generating PDF before underlying data is stable

### Phase 5: Polish, Deductions, and Step-by-Step Explanations
**Rationale:** Pre-distribution deductions (debts, funeral, wasiyyah) and step-by-step explanations are enhancements that enrich an already-working product. Simple/detailed mode toggle requires the full UI to exist before it can meaningfully separate interfaces.
**Delivers:** Pre-distribution deduction inputs (debts, funeral, wasiyyah), step-by-step calculation explanation with rule citations, simple/detailed mode toggle, mouza rate auto-suggestion from static JSON dataset
**Addresses:** Pre-distribution deductions (Pitfall 4), step-by-step explanation (differentiator), dual mode (differentiator), mouza rate suggestion (differentiator)

### Phase 6: Persistence and Optional Accounts
**Rationale:** The app must work fully without login. Accounts are additive infrastructure that should only be built if user demand is validated. localStorage handles session persistence for v1.
**Delivers:** Zustand persist middleware for session recovery, optional Supabase Auth integration (anonymous sign-in upgradeable to permanent account), server-side calculation storage
**Addresses:** User accounts (P3), saved calculations (P3)
**Avoids:** Over-engineering auth before core value is validated, premature infrastructure complexity

### Phase Ordering Rationale

- **Engine before UI** because incorrect calculations displayed beautifully are worse than correct calculations displayed plainly. The Faraid engine has 16+ blocking rules, 3 adjustment scenarios, and madhab-specific edge cases that must all pass tests before any component renders a share value.
- **Core UI before property** because users can get immediate value from heir-only share calculations (fractions + percentages) without entering property details. This also validates the engine output visually.
- **Property before visualization** because charts and PDF render property-derived monetary values. The charts and PDF are pure output layers -- they should not be built until the data they render is complete.
- **Deductions and explanations after core features** because they are enhancements to working functionality, not prerequisites.
- **Accounts last** because the app's value proposition is the calculation, not the account system. localStorage persistence handles the "save and return" use case adequately for launch.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Needs deep Faraid jurisprudence research -- Awl/Radd edge cases, all 16 Hajb blocking rules with Hanafi-specific variants, Umariyyatayn special cases, MFLO Section 4 implications. Reference: Al-Kharaj Journal algorithmic framework, WASSIYYAH blocking documentation, uttoradhikar.gov.bd for BD-specific verification.
- **Phase 3:** Needs investigation into BD mouza rate gazette PDFs for static dataset creation, regional Katha conversion factors by district, and tree/crop/structure valuation norms in Bangladesh.
- **Phase 4:** Needs a feasibility spike for @react-pdf/renderer with Bengali conjunct characters (even though v1 is English-only, the font architecture decision affects future Bangla support).

Phases with standard patterns (skip research-phase):
- **Phase 2:** Well-documented wizard pattern with React Hook Form + Zod + Zustand. LogRocket guide and shadcn/ui documentation cover this thoroughly.
- **Phase 6:** Standard Supabase Auth integration with documented anonymous sign-in flow. No novel patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All libraries verified current on npm with 2025-2026 releases; version numbers, weekly downloads, and dependency counts confirmed |
| Features | HIGH | Competitors directly inspected (uttoradhikar.gov.bd, Faraid.net, Al Mwareeth, Al Wirasat, inheritance-calculator.com); competitive gaps clearly identified |
| Architecture | HIGH | Standard SPA patterns; pure computation layer is well-established (Martin Fowler's modularization guide); Zustand persist is documented |
| Pitfalls | HIGH | Faraid rules verified against multiple Islamic jurisprudence sources (WASSIYYAH, Al-Islam.org, academic papers); jsPDF Bengali issue confirmed via GitHub; BD land unit chaos documented by government sources |
| BD Property Data | MEDIUM | Confirmed no public API exists; mouza rates last updated 2016; gazette PDFs may be extractable but not yet validated; government reform underway (2025-2026) to align prices with market |

**Overall confidence:** HIGH

### Gaps to Address

- **MFLO Section 4 stance:** Must be decided before Phase 1 implementation begins. Pure Faraid excludes orphaned grandchildren (son blocks grandson); BD law includes them. This is a product decision, not a technical one. Recommend: implement pure Faraid with a clear UI disclaimer, and consider a "Bangladesh Law" toggle as a Phase 5 enhancement.
- **Hanafi Radd and spouses:** The predominant Hanafi view excludes spouses from Radd, but some interpretations differ. Verify with an Islamic scholar before engine implementation. The PITFALLS research flags this as needing confirmation.
- **Bengali PDF rendering:** @react-pdf/renderer's Font.register() supports custom fonts, but Bengali conjunct character shaping (juktakkhor) has not been validated with this library specifically. A feasibility spike is needed before Phase 4, even though v1 is English-only.
- **Mouza rate data extraction:** Government gazette PDFs containing district-level mouza rates exist but have not been located or evaluated for structured data extraction. This blocks the auto-suggestion feature in Phase 5.
- **uttoradhikar.gov.bd accuracy:** The BD government calculator should be tested against known Faraid outcomes to understand where it gets things right and wrong, providing both a reference and a list of bugs to avoid.

## Sources

### Primary (HIGH confidence)
- [Fraction.js v5.3.4](https://github.com/infusion/Fraction.js/) -- BigInt rational arithmetic, API verification
- [@react-pdf/renderer v4.3.2](https://www.npmjs.com/package/@react-pdf/renderer) -- PDF generation, custom font support
- [Recharts v3.8.0](https://www.npmjs.com/package/recharts) -- SVG charting library
- [Zustand v5.0.11 persist middleware](https://zustand.docs.pmnd.rs/reference/middlewares/persist) -- localStorage persistence API
- [React Hook Form v7.71.2](https://www.npmjs.com/package/react-hook-form) -- Form handling
- [Zod v4.3.6](https://zod.dev/v4) -- Schema validation
- [shadcn/ui CLI v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) -- Component library
- [WASSIYYAH Hajb blocking rules](https://wassiyyah.com/blog/islamic-inheritance-blocking-exclusion) -- 16 blocking rules documented
- [Al-Kharaj Journal: Modular Algorithmic Framework for Islamic Inheritance](https://ejournal.iainpalopo.ac.id/index.php/alkharaj/article/view/9731) -- Engine algorithm reference
- [BD Land Measurement Units (minland.gov.bd)](https://minland.gov.bd/site/page/4e44d7ef-2c36-4483-aa4e-77b294de729c/Land-Measurement-Unit) -- Official unit definitions
- [inheritance-calculator.com](https://inheritance-calculator.com) -- Comprehensive multi-school calculator (competitor analysis)
- [Faraid.net](https://faraid.net/) -- Faraid calculator with evidence display (competitor analysis)

### Secondary (MEDIUM confidence)
- [uttoradhikar.gov.bd](https://uttoradhikar.gov.bd/index.php?lang=en) -- BD government calculator (buggy app, but reference for BD-specific features)
- [Supabase anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous) -- Auth feature for optional accounts
- [BD Business Insider: Market value to determine official prices](https://www.businessinsiderbd.com/bangladesh/news/30761/market-value-of-land-likely-to-determine-official-prices) -- Mouza rate context
- [MFLO 1961 Section 4 (SSRN)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5097144) -- Orphaned grandchildren legal framework
- [jsPDF Bengali font issue #2587](https://github.com/parallax/jsPDF/issues/2587) -- Confirmed Bengali rendering unsupported
- [Mouza Rate by District (Reportbd)](https://reportbd.net/mouza-rate-by-district-bd/) -- District-wise rates 2026

### Tertiary (LOW confidence)
- [landvalue.jomibaba.com](https://landvalue.jomibaba.com/) -- BD land valuation tool (could not inspect content)
- [Shariawiz calculator](https://shariawiz.com/calculator) -- Scholar-certified calculator (limited page content inspected)

---
*Research completed: 2026-03-12*
*Ready for roadmap: yes*
