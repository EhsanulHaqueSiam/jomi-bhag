# Feature Research

**Domain:** Islamic Inheritance (Faraid) Land Division Calculator -- Bangladesh Context
**Researched:** 2026-03-12
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Core Faraid share calculation | The entire product purpose. Every competitor does this. | HIGH | Must handle the 4 scenarios: Kamil (standard), Awl (proportional reduction when shares > 1), Radd (redistribution of surplus), and Tasib (residuary). LCM-based fractional arithmetic engine. |
| Heir input system (counts + types) | All calculators require specifying heirs. Users expect to select relationship types and quantities. | MEDIUM | Support at minimum: spouse(s), sons, daughters, parents, grandparents, full/half/uterine siblings. Our scope: parents assumed deceased, so children + their spouses. |
| Hajb (exclusion) logic | Users expect the calculator to automatically block heirs who are excluded by closer relatives. Wrong exclusion = wrong result = no trust. | HIGH | Hajb Hirman (complete blocking, e.g., son blocks brothers) and Hajb Nuqsan (partial reduction, e.g., children reduce mother's share from 1/3 to 1/6). Must be automatic, not manual. |
| Results as fractions + percentages | Every competitor shows fractional shares (1/6, 1/8) alongside percentages. Users cross-verify against Quran. | LOW | Display both simultaneously. Fractions build religious trust; percentages build practical clarity. |
| Monetary/property value distribution | Users want to know "I get X taka" not just "you get 1/8." All serious calculators accept an estate value and distribute it. | LOW | Accept total estate value, multiply by each heir's fraction, show per-heir amount. |
| Hanafi school of law | Bangladesh follows Hanafi fiqh exclusively for inheritance. Non-negotiable for BD audience. | LOW (scope reduction) | Unlike global calculators supporting 4-5 schools, we only need Hanafi. This is a simplification advantage. |
| Quranic/Hadith references per share | Users need to verify calculations against divine text. Al Wirasat, Faraid.net, UmmahKingdom all cite Quran 4:11, 4:12, 4:176. | MEDIUM | Each heir's share must link to the specific Quranic ayah or Hadith that prescribes it. Not optional for an Islamic tool -- it is the source of trust. |
| Mobile-responsive design | BD users predominantly access web on mobile. A non-responsive calculator is unusable for the majority. | MEDIUM | Responsive-first with TailwindCSS. Most competitors have poor mobile UX -- opportunity here. |
| Bangla land measurement units | BD users think in decimals (shotangsho), katha, bigha, not acres or square meters. A BD land tool without BD units is alien. | LOW | Support: Decimal/Shotangsho, Katha, Bigha, Acre. Conversions: 1 Bigha = 33 Decimal, 1 Katha = 1.65 Decimal, 1 Decimal = 435.6 sq ft. Regional variation warning needed. |
| Print-friendly output | Families and lawyers need paper copies for records, legal proceedings, family meetings. uttoradhikar.gov.bd produces printable certificates. | MEDIUM | Clean print stylesheet at minimum. PDF generation is a differentiator (see below). |

### Differentiators (Competitive Advantage)

Features that set Jomi Bhag apart from uttoradhikar.gov.bd, Faraid.net, Al Wirasat, and mobile apps.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Property-type-aware division (land, house, trees, ponds, orchards) | No existing calculator handles BD property types. They all treat estate as a single monetary lump sum. Real BD inheritance involves agricultural land, homesteads, fishponds, tree groves -- each valued differently. | HIGH | Core differentiator per PROJECT.md. Need per-asset-type entry: agricultural land (by decimal), residential plots, structures (houses), trees/bamboo, ponds. Each gets its own valuation and division. |
| BD govt mouza-rate price auto-suggestion | No calculator auto-suggests property prices. Users always enter manually. Auto-fetching from BD govt sources (mouza rates by district/upazila) saves time and adds credibility. | HIGH | Mouza rates vary by district and are periodically updated. Need scraping/API from govt sources (minland.gov.bd or local sources). Manual override mandatory since mouza rates are often below market. Fallback to manual-only if govt data unavailable. |
| Visual pie/bar charts for share breakdown | Faraid.net has pie charts; most web calculators don't. Strong visual output makes results immediately understandable for non-literate or semi-literate family members. | MEDIUM | Chart.js or Recharts. Pie chart for proportional shares, bar chart for monetary amounts. Color-coded per heir. |
| PDF report with full details + Quranic references | Most calculators show results on screen only. A downloadable PDF with heir breakdown, property details, Quranic citations, and formatted layout serves as a quasi-legal document families can keep. | MEDIUM | Use client-side PDF generation (html2pdf.js or jspdf). Include: property schedule, heir list, share calculation with references, date, disclaimer. |
| Step-by-step calculation explanation | No calculator shows HOW it arrived at shares. They output fractions but hide the math. Showing "Step 1: Spouse gets 1/8 (Quran 4:12 -- with children), Step 2: Remainder distributed among sons and daughters at 2:1 ratio (Quran 4:11)" builds trust and educates. | MEDIUM | Render a collapsible step-by-step breakdown alongside results. Each step cites the rule applied and the source. Educational value AND transparency. |
| Dual mode: Simple (public) + Detailed (professional) | No BD tool offers mode switching. Families want simplicity; lawyers/deed writers want exhaustive detail. Serving both from one tool is unique. | MEDIUM | Simple mode: minimal inputs, clear visual output. Detailed mode: full property schedule, all edge case handling, calculation methodology, exportable data. Toggle in UI. |
| Tree/crop/structure valuation | BD inheritance uniquely involves trees (mango, jackfruit, coconut, bamboo), fish ponds, and structures on land. No existing tool handles this. | HIGH | Need input for: number and type of trees, estimated value per tree/crop, structures with area and condition, pond area. These add to total estate value alongside land. |
| Scenario comparison ("What if") | No calculator lets users compare scenarios (e.g., "What if brother had a son?" or "What if this land is valued at X vs Y?"). | MEDIUM | Allow saving a baseline calculation, then modifying inputs to see how shares change. Side-by-side comparison. Useful for families exploring fair arrangements. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for this specific project.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Multi-school fiqh support (Shafi'i, Maliki, Hanbali, Ja'fari) | Global calculators offer this to serve worldwide Muslim audiences. | Bangladesh exclusively follows Hanafi fiqh for inheritance. Adding other schools creates confusion for BD users, multiplies calculation complexity 4x, and is scope creep with zero value for target audience. | State clearly: "Calculated per Hanafi school (standard in Bangladesh)." Add brief note explaining why. |
| Will/Wasiyyah creation tool | Shariawiz bundles will creation with inheritance calculation. Users may expect it. | Will drafting is a legal service requiring jurisdiction-specific knowledge, lawyer review, and carries liability. A calculator cannot safely generate legal documents. Massive scope increase. | Link to legal resources. Note that Wasiyyah (bequest) can be up to 1/3 of estate, and the calculator can account for wasiyyah amount as a deduction before distribution. |
| User accounts and saved calculations (v1) | Users want to save and return to calculations later. | Adds auth complexity, data storage, privacy concerns (sensitive family/financial data), and server infrastructure to what should be a client-side tool. Delays launch. | v1: Client-side only with browser localStorage or URL-encoded shareable links. v2: Optional accounts if validated demand exists. |
| Country-specific civil law overlays | Al Mwareeth supports 9 country-specific laws. Users may ask for BD civil law integration. | BD Muslim inheritance follows Faraid directly. Civil overlays add legal complexity and liability. The tool's value is strict Islamic accuracy, not legal advice. | Add disclaimer: "This tool calculates shares per Islamic Faraid law. Consult a lawyer for registration, tax, and civil law implications." |
| Real-time collaborative editing | Multiple family members editing the same calculation simultaneously. | Requires WebSocket infrastructure, conflict resolution, user identity -- massive complexity for marginal value. Family discussions happen in person, not in-app. | Shareable link or PDF that one person generates and shares with family via WhatsApp/email. |
| Map-based land visualization | Showing actual land parcels on a map with division lines. | Requires cadastral data (dag/plot maps), surveyor-grade accuracy, and BD land records integration -- none of which are reliably available digitally. Overpromises and underdelivers. | Show land area numerically with clear unit breakdowns. Reference dag/plot numbers as text fields for the user's records. |
| Monetization (ads, premium tier) | Standard SaaS approach. | PROJECT.md explicitly states "free forever." Ads on an Islamic religious tool feel exploitative. Premium features create inequality of access. | Completely free. If costs arise, consider sponsorship from Islamic organizations, not user-facing monetization. |
| Non-Muslim inheritance law (Hindu, Christian, Buddhist) | Bangladesh has multiple religious communities with different inheritance laws. | Completely different legal frameworks. Hindu inheritance follows the Succession Act 1925. Adding these triples scope without serving the core audience well. | State target: "Islamic (Faraid) inheritance for Bangladeshi Muslims." Separate tool could serve other communities in the future. |

## Feature Dependencies

```
[Faraid Calculation Engine]
    |-- requires --> [Heir Input System]
    |-- requires --> [Hajb (Exclusion) Logic]
    |-- produces --> [Share Fractions + Percentages]
    |
    |-- enhanced by --> [Quranic/Hadith References]
    |-- enhanced by --> [Step-by-Step Explanation]
    |-- enhanced by --> [Visual Charts]

[Property Value Distribution]
    |-- requires --> [Faraid Calculation Engine]
    |-- requires --> [Property Input (land, house, trees, ponds)]
    |-- enhanced by --> [BD Land Unit Support]
    |-- enhanced by --> [Mouza Rate Auto-Suggestion]
    |-- enhanced by --> [Tree/Crop/Structure Valuation]

[PDF Report Generation]
    |-- requires --> [Faraid Calculation Engine]
    |-- requires --> [Property Value Distribution]
    |-- requires --> [Quranic/Hadith References]
    |-- enhanced by --> [Step-by-Step Explanation]

[Dual Mode (Simple/Detailed)]
    |-- requires --> [Faraid Calculation Engine]
    |-- requires --> [Property Value Distribution]
    |-- enhances --> [All output features]

[Scenario Comparison]
    |-- requires --> [Faraid Calculation Engine]
    |-- requires --> [Property Value Distribution]
    |-- requires --> [Dual Mode] (only relevant in detailed mode)

[Mouza Rate Auto-Suggestion]
    |-- requires --> [Property Input]
    |-- independent of --> [Faraid Calculation Engine]
    |-- fallback --> [Manual Price Entry]
```

### Dependency Notes

- **Faraid Calculation Engine requires Heir Input + Hajb:** Cannot compute shares without knowing who inherits and who is blocked. These three are inseparable.
- **Property Value Distribution requires Faraid Engine:** Share fractions must exist before multiplying by property values.
- **PDF Report requires all core features:** It is the final output layer that packages everything together.
- **Mouza Rate is independent of Faraid logic:** Price suggestion is a property valuation feature, not an inheritance calculation feature. Can be built and tested separately.
- **Scenario Comparison is a late-stage feature:** Requires stable core calculation before building comparison UX on top.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to be useful and differentiated from day one.

- [ ] **Faraid calculation engine (Hanafi)** -- The core. Handles Awl, Radd, Asaba, standard shares, Hajb exclusion. Without this, nothing works.
- [ ] **Heir input system** -- Select heir types (brothers, sisters, spouses) with counts. Parents-deceased assumption simplifies scope.
- [ ] **Share results with fractions + percentages + monetary amounts** -- Users need all three representations.
- [ ] **Quranic/Hadith references per share** -- Trust and verification. Non-negotiable for an Islamic tool.
- [ ] **Property input with BD land units** -- Accept land in decimal/katha/bigha, structures, and basic property types.
- [ ] **Property value distribution** -- Multiply shares by total estate value, show per-heir amounts.
- [ ] **Visual charts (pie + bar)** -- Immediate visual comprehension of shares.
- [ ] **Print-friendly output** -- Clean print stylesheet for paper copies.
- [ ] **Mobile-responsive design** -- Majority of BD users are on mobile.

### Add After Validation (v1.x)

Features to add once core is working and people are using it.

- [ ] **PDF report generation** -- Trigger: users ask for downloadable reports or lawyers need formal documents.
- [ ] **Step-by-step calculation explanation** -- Trigger: users question how shares were derived, or educational use cases emerge.
- [ ] **Property-type-specific valuation (trees, ponds, structures)** -- Trigger: users have mixed-asset estates and need granular breakdown.
- [ ] **Simple/Detailed mode toggle** -- Trigger: usage data shows both casual and professional users, and one UI doesn't serve both well.
- [ ] **Mouza rate auto-suggestion** -- Trigger: viable govt data source identified and confirmed reliable. Manual entry works fine as fallback.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Scenario comparison ("What if")** -- Why defer: requires stable core first, and user demand is speculative.
- [ ] **Optional user accounts with saved calculations** -- Why defer: adds infrastructure complexity. LocalStorage or shareable URLs serve v1.
- [ ] **Bangla language support** -- Why defer: explicitly out of scope per PROJECT.md for v1. High value for BD audience but significant translation effort.
- [ ] **Extended heir types (grandchildren, great-grandparents, distant kindred)** -- Why defer: covers edge cases that affect <5% of real-world BD scenarios. Core heir types serve the vast majority.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Faraid calculation engine (Hanafi) | HIGH | HIGH | P1 |
| Heir input system (counts + types) | HIGH | MEDIUM | P1 |
| Hajb exclusion logic | HIGH | HIGH | P1 |
| Results: fractions + percentages + amounts | HIGH | LOW | P1 |
| Quranic/Hadith references | HIGH | MEDIUM | P1 |
| Property input with BD land units | HIGH | MEDIUM | P1 |
| Property value distribution | HIGH | LOW | P1 |
| Visual charts (pie/bar) | MEDIUM | LOW | P1 |
| Mobile-responsive design | HIGH | MEDIUM | P1 |
| Print-friendly output | MEDIUM | LOW | P1 |
| PDF report generation | MEDIUM | MEDIUM | P2 |
| Step-by-step explanation | MEDIUM | MEDIUM | P2 |
| Property-type valuation (trees, ponds, structures) | MEDIUM | HIGH | P2 |
| Simple/Detailed mode toggle | MEDIUM | MEDIUM | P2 |
| Mouza rate auto-suggestion | LOW | HIGH | P2 |
| Scenario comparison | LOW | MEDIUM | P3 |
| User accounts / saved calculations | LOW | HIGH | P3 |
| Bangla language support | HIGH | MEDIUM | P3 (deferred) |

**Priority key:**
- P1: Must have for launch -- the tool is broken or untrustworthy without it
- P2: Should have, add when core is stable -- increases value significantly
- P3: Nice to have, future consideration -- validates demand first

## Competitor Feature Analysis

| Feature | uttoradhikar.gov.bd | Faraid.net | inheritance-calculator.com | Al Mwareeth | Al Wirasat | **Jomi Bhag (Ours)** |
|---------|---------------------|------------|---------------------------|-------------|------------|----------------------|
| Faraid calculation | Yes (basic) | Yes | Yes (comprehensive) | Yes | Yes | Yes (Hanafi-focused) |
| Fiqh schools | Hanafi only | Hanafi only (Awl/Radd) | 4 schools + imam variants | 5 schools + 9 country laws | Multi-school | Hanafi only (by design) |
| Heir types | 50+ categories | Extensive | 40+ with edge cases | 40+ with generations | Primary 6 + extended | Core BD-relevant heirs |
| Awl/Radd handling | Yes | Yes | Yes (Radd options) | Yes | Yes | Yes |
| Hajb (exclusion) | Implicit | Yes | Yes | Yes | Yes (error checking) | Yes (explicit display) |
| Quranic references | No | Yes (view evidence) | Not prominent | Not prominent | Yes (ayah citations) | Yes (per-share citations) |
| Property value input | Yes (land, gold, silver, currency) | No | Yes (estate + debts + funeral) | Yes (estate + debts + wills) | No | Yes (multi-property type) |
| BD land units | Yes (decimal) | No | Multiple unit modes | No | No | Yes (decimal, katha, bigha) |
| Property types (land, trees, ponds) | No | No | No | No | No | **Yes (unique)** |
| Charts/visualization | No | Yes (pie chart) | No | Graph icon (unclear) | No | Yes (pie + bar) |
| PDF/print export | Yes (printable certificate) | No | No | No | No | Yes (print + PDF) |
| Step-by-step explanation | No | No | No | No | No | **Yes (unique)** |
| Dual mode (simple/detailed) | No | No | No | No | No | **Yes (unique)** |
| Languages | Bangla + English | Turkish, English, Arabic, Indonesian, Malay, Bengali | English | English, Arabic, Urdu, Turkish, Persian, Kyrgyz | English, Urdu, Arabic, Hindi, Bengali | English (Bangla v2) |
| Mobile UX | App (crashes reported) | Web | Web (clunky) | Web | Web | Web (responsive-first) |
| Special cases (fetus, adopted, missing) | No | No | Yes (extensive) | Yes | No | No (v1 -- parents deceased) |
| Price auto-suggestion | No | No | No | No | No | **Yes (mouza rate, unique)** |

### Key Competitive Gaps We Fill

1. **No existing tool handles BD-specific property types** (agricultural land, homesteads, trees, ponds, structures). Every competitor treats estate as a single lump sum.
2. **No existing tool explains its calculations step-by-step.** Users get output without understanding.
3. **No existing tool auto-suggests BD land prices.** Every tool requires full manual entry.
4. **uttoradhikar.gov.bd** (the closest BD competitor) has a buggy app with crashes, no charts, no Quranic references, and no property-type awareness.
5. **No existing tool offers dual-mode UX** for both casual families and legal professionals.

### Key Competitor Strengths We Should Note

1. **inheritance-calculator.com** has the most comprehensive edge case handling (fetus, adopted child, missing persons, apostates). We deliberately skip these for v1 scope.
2. **Al Mwareeth** has 10+ years of testing across 9 country laws. Their accuracy claim is strong. Our Hanafi-only focus means we must be 100% correct on Hanafi -- no room for error.
3. **uttoradhikar.gov.bd** has government backing and brand recognition in BD. We differentiate on quality, not authority.

## Sources

- [uttoradhikar.gov.bd](https://uttoradhikar.gov.bd/index.php?lang=en) -- Bangladesh government inheritance calculator (MEDIUM confidence, directly inspected)
- [Faraid.net](https://faraid.net/) -- Faraid calculator with Quranic evidence display (HIGH confidence, directly inspected)
- [inheritance-calculator.com](https://inheritance-calculator.com) -- Comprehensive multi-school calculator (HIGH confidence, directly inspected)
- [Al Mwareeth](https://almwareeth.com/islamic-inheritance-calculator) -- Multi-country Islamic calculator (HIGH confidence, directly inspected)
- [Al Wirasat](https://alwirasat.com/) -- Free Faraid calculator with Quranic basis (MEDIUM confidence, directly inspected)
- [IslamicInheritance.com](https://islamicinheritance.com/calculator/) -- Step-based calculator with hajb display (HIGH confidence, directly inspected)
- [Shariawiz](https://shariawiz.com/calculator) -- Scholar-certified calculator + will creation (MEDIUM confidence, limited page content)
- [Faraid App (iOS)](https://apps.apple.com/us/app/faraid-inheritance-calculator/id1577031741) -- Mobile app with 6 languages, pie charts (HIGH confidence, app store listing)
- [Uttoradhikar App (Google Play)](https://play.google.com/store/apps/details?id=com.landcalculation) -- BD govt mobile app, 4.3 stars, crash reports (MEDIUM confidence, store listing)
- [BD Land Measurement (minland.gov.bd)](https://minland.gov.bd/site/page/4e44d7ef-2c36-4483-aa4e-77b294de729c/Land-Measurement-Unit) -- Official BD land units reference (HIGH confidence)
- [JomiBaba Land Value](https://landvalue.jomibaba.com/) -- BD land valuation tool (LOW confidence, could not inspect content)
- [Mouza Rate - Reportbd](https://reportbd.net/mouza-rate-by-district-bd/) -- District-wise mouza rates 2026 (MEDIUM confidence)

---
*Feature research for: Islamic Inheritance Land Division Calculator (Bangladesh)*
*Researched: 2026-03-12*
