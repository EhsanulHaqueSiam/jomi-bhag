# Pitfalls Research

**Domain:** Islamic Inheritance (Faraid) Land Division Calculator -- Bangladesh
**Researched:** 2026-03-12
**Confidence:** HIGH (core Faraid rules well-documented; BD-specific land data MEDIUM)

## Critical Pitfalls

### Pitfall 1: Incorrect or Missing Hajb (Blocking/Exclusion) Rules

**What goes wrong:**
The Faraid system has 16+ blocking rules where one heir's presence totally excludes another from inheritance, plus 5 partial blocking rules that reduce shares. Calculators that skip or partially implement Hajb produce fundamentally wrong results. For example, in the Hanafi school (which Bangladesh follows), a paternal grandfather completely excludes siblings -- but in Shafi'i, Maliki, and Hanbali schools they share. Getting this wrong means entire heir categories receive shares they should not, or are excluded when they should not be.

Specific high-risk blocking rules:
- Sons exclude grandsons and granddaughters at any level (Rule 1)
- Father blocks paternal grandfather and all siblings (Rules 5, 6)
- Paternal grandfather blocks siblings -- **Hanafi only** (Rule 7)
- Multiple daughters block daughters of sons when no son/grandson present (Rule 2)
- Sons, grandsons, daughters, granddaughters, and father block maternal siblings (Rule 13)

**Why it happens:**
Developers implement the "happy path" (simple cases with a few heirs) and treat blocking as edge cases to handle later. The blocking rules are interdependent -- Rule 7 depends on madhab, Rule 8 depends on whether daughters/granddaughters exist, creating a complex conditional tree that is easy to get partially right.

**How to avoid:**
- Implement ALL 16 total-blocking rules and 5 partial-blocking rules as the **first step** in the calculation engine, before any share assignment
- Build the blocking logic as a separate, independently testable module
- Create a comprehensive test suite with known correct answers for every blocking rule combination
- Since Jomi Bhag targets Bangladesh (Hanafi), hardcode Hanafi-specific blocking (e.g., grandfather excludes siblings) rather than trying to be madhab-agnostic in v1

**Warning signs:**
- Test case: father + full brother should give brother zero share (Hanafi). If brother gets anything, blocking is broken
- Test case: 2 daughters + daughter of son should give daughter-of-son 1/6 (partial block), not 1/2
- Any scenario where total shares exceed 1.0 without triggering Awl means blocking failed

**Phase to address:**
Core calculation engine phase (Phase 1). This is foundational -- every other feature depends on correct blocking.

---

### Pitfall 2: Broken Awl (Proportional Reduction) Implementation

**What goes wrong:**
Awl occurs when the sum of prescribed shares exceeds 100% of the estate. The denominator must be increased proportionally to reduce all shares. This only happens when ALL heirs are fixed-share holders (no residuary heirs). The possible base denominators are 6, 12, and 24, and Awl increases them to specific values (e.g., 6 can become 7, 8, 9, or 10; 12 can become 13, 15, or 17; 24 can become 27). Calculators that do not implement Awl will either produce shares totaling more than 100% (mathematical impossibility) or silently truncate/round shares incorrectly.

Classic example: deceased leaves 3 daughters (2/3), both parents (1/6 + 1/6 = 1/3), and wife (1/8). Total = 2/3 + 1/3 + 1/8 = 27/24, which exceeds 1. Awl increases the base from 24 to 27, proportionally reducing everyone's share.

**Why it happens:**
Developers test with simple cases (son + daughter, or single wife) where shares naturally sum to 1.0. Awl scenarios require specific combinations of multiple fixed-share heirs with no residuary heir -- easy to miss in testing.

**How to avoid:**
- After assigning all fixed shares, always check: if no residuary heirs exist and total > 1, apply Awl
- Implement Awl as a mandatory post-processing step, not an optional branch
- Build explicit test cases for all known Awl denominators: 6->7, 6->8, 6->9, 6->10, 12->13, 12->15, 12->17, 24->27
- Display the Awl adjustment in the UI so users understand why shares are reduced

**Warning signs:**
- Any output where total percentages exceed 100%
- Any output where total monetary values exceed estate value
- The BD government's own Uttoradhikar app reportedly showed totals exceeding input land amounts -- this is exactly the Awl bug

**Phase to address:**
Core calculation engine phase (Phase 1). Must be implemented alongside basic share calculation.

---

### Pitfall 3: Incorrect Radd (Remainder Return) with Spouse Exclusion

**What goes wrong:**
Radd occurs when fixed shares total less than 100% and no residuary (asaba) heirs exist to absorb the remainder. The surplus must be returned proportionally to fixed-share heirs. The critical mistake: **all four Sunni madhabs exclude spouses from Radd**, meaning the husband/wife keeps their fixed share and the remainder is distributed only among blood-relative fixed-share heirs. However, some countries (Egypt, India) have enacted laws to include spouses in Radd. Bangladesh follows Hanafi fiqh which excludes spouses from Radd.

Example: deceased leaves wife (1/4) and mother (1/3). Total fixed shares = 7/12. Remainder = 5/12. The 5/12 goes entirely to the mother (the only blood-relative fixed-share heir), NOT split between wife and mother.

**Why it happens:**
Developers naively distribute remainder proportionally to all heirs, including spouses. This seems "fair" mathematically but violates the Hanafi ruling. Also, developers who reference Indian or Egyptian implementations may copy their spouse-inclusive Radd logic without realizing Bangladesh follows different rules.

**How to avoid:**
- Explicitly exclude spouse from Radd pool in the calculation engine
- Document this decision with the Hanafi fiqh source
- Add a clear comment/flag: "Spouse excluded from Radd per Hanafi madhab (Bangladesh)"
- Test case: wife-only heir should receive only 1/4, with 3/4 going to Bait-ul-Maal (state treasury), NOT 100% to wife

**Warning signs:**
- If wife or husband ever receives more than their Quranic fixed share in a Radd scenario, something is wrong
- Referencing Egyptian or Indian open-source implementations without adjusting for Hanafi Radd rules

**Phase to address:**
Core calculation engine phase (Phase 1). This is a correctness requirement, not an edge case.

---

### Pitfall 4: Ignoring Pre-Distribution Deductions (Debts, Funeral, Wasiyya)

**What goes wrong:**
Islamic inheritance law requires a strict order of deductions before Faraid shares are calculated:
1. Funeral expenses
2. Deceased's debts
3. Wasiyya (bequest) -- capped at 1/3 of remaining estate, cannot go to a legal heir

Faraid shares are calculated on the **net distributable estate** after these deductions. Calculators that skip this step calculate shares on the gross estate, giving every heir more than they should receive.

**Why it happens:**
The PROJECT.md scopes this as a "property division" tool, so developers focus on the division math and forget that the estate must be reduced first. Also, the project assumes "parents deceased" which may lead developers to skip pre-distribution steps entirely.

**How to avoid:**
- Add an optional "deductions" step in the input flow: debts, funeral costs, wasiyya amount
- Default these to zero if user does not provide them, but make them visible
- Validate that wasiyya does not exceed 1/3 of estate after debts
- Calculate Faraid shares on (total_value - debts - funeral - wasiyya), not total_value
- Display the deduction breakdown before showing shares

**Warning signs:**
- The Quran/Hadith references section cites Surah An-Nisa 4:11-12 which explicitly says "after any bequest or debt" -- if the tool quotes these verses but doesn't implement the deduction, it contradicts its own references

**Phase to address:**
Can be deferred to Phase 2 (after core engine), but the architecture must account for it from Phase 1. The calculation engine should accept "net distributable estate" as input, with a separate module handling deductions.

---

### Pitfall 5: Section 4 MFLO 1961 -- Orphaned Grandchildren Representation

**What goes wrong:**
Bangladesh's Muslim Family Laws Ordinance 1961, Section 4, introduced a rule NOT found in classical Faraid: if a son or daughter predeceases the estate owner, that deceased child's children (orphaned grandchildren) collectively inherit the share their parent would have received. This is a Bangladesh-specific legal modification to Islamic inheritance law.

A strictly Faraid-based calculator will exclude orphaned grandchildren (because under classical Hanafi law, sons block grandsons). A Bangladesh-legal calculator must include them via Section 4.

**Why it happens:**
Developers either implement pure Faraid (ignoring BD law) or pure BD law (not understanding where it diverges from Faraid). The app claims to follow "strict Faraid" but targets Bangladeshi users who may expect Section 4 compliance. This creates an irreconcilable tension if not explicitly addressed.

**How to avoid:**
- Make an explicit design decision: does this app follow pure Faraid or Bangladesh legal modifications?
- If pure Faraid: clearly state "This follows classical Hanafi Faraid. For Bangladesh legal modifications (MFLO 1961 Section 4), consult a lawyer"
- If BD law: implement Section 4 as a separate layer on top of the Faraid engine, clearly labeled
- Consider a toggle: "Classical Faraid" vs "Bangladesh Law (MFLO 1961)"
- Either way, document the decision prominently in the UI

**Warning signs:**
- User complaints from Bangladeshis saying "my nephew/niece should inherit their deceased parent's share"
- Confusion in the codebase about whether grandchildren of predeceased children are included or not

**Phase to address:**
Must be decided in Phase 1 (design decision), even if implementation is Phase 2. The data model must support predeceased children from the start.

---

### Pitfall 6: Floating-Point Arithmetic Destroying Share Precision

**What goes wrong:**
Islamic inheritance uses exact fractions (1/2, 1/3, 1/4, 1/6, 1/8, 2/3). JavaScript floating-point arithmetic (IEEE 754) cannot represent 1/3 exactly (0.33333...3 with truncation). When you compute 1/6 + 1/6 + 2/3 in floating point, you may get 0.9999999999999998 instead of 1.0. This causes:
- Shares not summing to exactly 100%
- Rounding errors compounding across multiple heirs
- Awl/Radd detection failing (is 1.0000000001 > 1? depends on epsilon)
- Display showing "33.33%" instead of "1/3" -- losing the Islamic meaning

**Why it happens:**
JavaScript has no native fraction/rational number type. Developers use `number` (float64) by default, and the errors are small enough to miss in testing but visible to users who expect exact fractions.

**How to avoid:**
- Use rational arithmetic (numerator/denominator pairs) for ALL share calculations internally
- Only convert to decimal/percentage at the final display step
- Use a library like Fraction.js or implement a simple Fraction class with GCD-based simplification
- The denominators in Faraid are small (max 24 before Awl, max 27 after), so integer overflow is not a concern
- Always display both the fraction (1/6) and the percentage (16.67%) to users
- Verify: sum of all numerators over common denominator must EXACTLY equal the denominator

**Warning signs:**
- Shares displayed as "16.666666666666668%" instead of "1/6 (16.67%)"
- Total percentage showing as "99.99%" or "100.01%"
- Awl not triggering when it should (because sum is 0.99999... instead of > 1.0)

**Phase to address:**
Phase 1 -- the Fraction/rational arithmetic module must be the foundation of the calculation engine. Retrofitting this later requires rewriting the entire engine.

---

### Pitfall 7: Bangladesh Land Measurement Unit Chaos

**What goes wrong:**
Bangladesh uses a chaotic mix of land measurement units that vary by region:
- 1 Katha = 720 sq ft in Dhaka, but 1,620 sq ft in Rajshahi/Khulna
- 1 Bigha = 33 decimals in most places, but varies regionally
- Official records use acres/square feet, local sellers use decimals/kathas/shotok
- Old deeds (dalils) use traditional units; new registrations may use metric

If the calculator accepts "5 katha" without knowing the region, the land area (and therefore value) could be off by 2x.

**Why it happens:**
Developers assume land units are standardized nationally. They pick one conversion factor and apply it universally, producing correct results only for one region.

**How to avoid:**
- Always require the user to specify location/district alongside land measurement
- Provide a unit converter that adjusts Katha/Bigha values based on selected region
- Default to decimal (shotok) as the universal unit, since 1 decimal = 435.6 sq ft everywhere in BD
- Allow input in any unit but immediately convert to a canonical unit (decimal or sq ft) for calculations
- Show the conversion explicitly so users can verify

**Warning signs:**
- Users from Rajshahi getting dramatically different results than Dhaka users for the same "number of kathas"
- Land value calculations that seem reasonable for one region but absurd for another

**Phase to address:**
Phase 2 (property input system). The unit conversion module should be built before any property valuation features.

---

### Pitfall 8: Mouza Rate vs Market Price -- The Valuation Trap

**What goes wrong:**
Bangladesh has two radically different land price systems:
- **Mouza rate (government):** Last comprehensively updated in 2016. Can be 10-50x lower than market price. Same mouza contains land with vastly different actual values (e.g., Gulshan mouza: official rate Tk 1-58 lakh/decimal, actual market price > Tk 1 crore/decimal)
- **Market price:** What land actually sells for, but varies block by block

If the app auto-suggests government mouza rates as "property value," users will see inheritance shares worth a fraction of their actual value. If it uses market prices, there is no authoritative data source.

**Why it happens:**
The PROJECT.md requires "auto-suggest from BD govt/market data with user override." Developers may treat mouza rates as ground truth because they are the only structured, available government dataset.

**How to avoid:**
- Use mouza rates as a **starting reference only**, with prominent disclaimers
- Always show: "Government mouza rate: Tk X | Estimated market range: Tk Y-Z | Your value: [editable]"
- Make user override the primary input, not an afterthought
- Consider scraping land listing sites (e.g., jomibaba.com which offers land value data) for market price ranges, but always as estimates
- Never present any auto-suggested value without a disclaimer that actual values may differ significantly
- The recent BD government reforms (2025-2026) are aligning deed values with market prices -- monitor this transition

**Warning signs:**
- Users trusting the auto-suggested value and getting inheritance shares worth 10% of actual property value
- Legal professionals dismissing the tool because values are obviously wrong

**Phase to address:**
Phase 2-3 (property valuation). This is a data quality problem, not a calculation problem. The calculation engine should be value-agnostic (works correctly regardless of input value).

---

### Pitfall 9: Scope Creep from "Parents Deceased" Assumption

**What goes wrong:**
The project scopes to "parents assumed deceased -- division among children/siblings and spouses." This seems simple but immediately creates edge cases:
- What about step-siblings (same father, different mother vs same mother, different father)? Hanafi law treats full siblings, consanguine (paternal) siblings, and uterine (maternal) siblings very differently
- What about deceased siblings whose children claim inheritance? (Similar to orphaned grandchildren issue)
- What about multiple marriages of the deceased? (Polygamy is legal in BD -- up to 4 wives share 1/8 collectively if children exist)
- "Children" includes sons and daughters with different shares, and potentially grandsons/granddaughters from predeceased children

Developers may assume "parents deceased, divide among kids" is trivial, but the sibling/spouse permutations alone create dozens of scenarios.

**Why it happens:**
The constraint sounds like a simplification, but it is really just a different set of complexities. Developers build for "2 brothers, 1 sister" and discover there are 50+ valid heir combinations even within this scope.

**How to avoid:**
- Enumerate ALL valid heir combinations within scope before writing calculation code:
  - Sons (0-N), Daughters (0-N)
  - Full brothers (0-N), Full sisters (0-N)
  - Consanguine brothers (0-N), Consanguine sisters (0-N)
  - Uterine brothers (0-N), Uterine sisters (0-N)
  - Wife/wives (0-4), Husband (0-1)
  - Grandchildren of predeceased children (if Section 4 MFLO applies)
- Build a test matrix covering all combinations
- Explicitly document which sibling types are supported (full? consanguine? uterine?)

**Warning signs:**
- The heir input form only has "brothers" and "sisters" without distinguishing full/half/uterine
- Test cases only cover scenarios with sons and daughters, not sibling-only divisions

**Phase to address:**
Phase 1 (data modeling and calculation engine). The heir type taxonomy must be defined before any UI or calculation work.

---

### Pitfall 10: PDF Generation with Bengali/Arabic Script

**What goes wrong:**
The app will need to generate printable PDF reports. Client-side PDF libraries (jsPDF, react-pdf/renderer) have well-documented problems with:
- Bengali (Bangla) script: complex ligatures, conjunct characters (juktakkhor), and vowel signs that require OpenType shaping
- Arabic script: for Quranic references, right-to-left text, ligature joining
- Mixed script documents: Bengali body + Arabic quotes + English labels
- Font embedding: PDFs without embedded fonts show garbled text on other machines

jsPDF's standard 14 fonts are ASCII-only. Custom font embedding is required but Bengali font shaping (ligatures, reordering) is broken in many libraries. A fork called jspdf-fontkit exists specifically to patch Bengali rendering, indicating this is a known, significant problem.

**Why it happens:**
Developers test PDF generation with English text, see it works, and assume Bengali will "just work" with a custom font. But Bengali is a complex script requiring glyph substitution and reordering that most PDF libraries do not support out of the box.

**How to avoid:**
- Test Bengali PDF output in the very first spike/prototype, not after building the full report template
- Use jspdf-fontkit (which patches fontkit for Bengali) or generate PDFs server-side if client-side fails
- For Quranic Arabic text, consider embedding pre-rendered images or using a library with proven Arabic support
- Test with real Bengali text containing conjuncts (e.g., "ক্ষ", "জ্ঞ", "ত্র") not just simple characters
- Have a fallback plan: generate HTML report for printing via browser's Print dialog if PDF generation proves too problematic

**Warning signs:**
- Bengali characters appearing as individual glyphs without joining (e.g., "ক" + "্" + "ষ" instead of "ক্ষ")
- Arabic text appearing left-to-right or with disconnected letters
- PDFs that look correct on the developer's machine but garbled when opened elsewhere

**Phase to address:**
Phase 3-4 (report generation). But do a feasibility spike in Phase 1 to validate the approach. If Bengali PDF is blocked, the architecture must accommodate a server-side fallback.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using floating-point for shares | Faster initial development | Rounding errors in every calculation, broken Awl/Radd detection | Never -- use rational arithmetic from day 1 |
| Hardcoding heir types instead of data model | Quick prototype | Cannot add new heir types (grandchildren, step-siblings) without rewriting | Never -- the heir taxonomy is the core domain model |
| Single land unit assumption | Simpler input form | Wrong calculations for 50%+ of Bangladesh | Only in first prototype, must fix before any user testing |
| Skipping Awl/Radd for v1 | Ship faster | Users get wrong answers for complex cases -- destroys trust | Never -- these are not edge cases, they are core Faraid |
| Client-side only PDF generation | No server infrastructure needed | Bengali/Arabic rendering may be broken with no fix path | Acceptable if validated with spike first; must have server fallback plan |
| Copying calculation logic from other open-source calculators | Saves development time | May copy incorrect implementations (the BD govt app has known bugs), may embed non-Hanafi logic | Only if every copied formula is independently verified against Faraid textbooks |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| BD Govt land pricing API / mouza rates | Treating mouza rate as actual property value | Use as reference floor only; always require user confirmation/override; display disclaimer |
| Quran/Hadith reference display | Hardcoding verse text that may have translation errors | Use a verified Quran API or embed from an authoritative translation; include Arabic original alongside translation |
| Land price auto-suggestion | Scraping government sites without handling downtime/format changes | Build with graceful degradation -- if scraping fails, show manual input immediately; cache last known values |
| PDF font embedding | Using system fonts that are not embeddable | Bundle specific TTF/WOFF fonts (e.g., Noto Sans Bengali) with the application; never rely on user's installed fonts |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Recalculating shares on every input keystroke | UI lag during heir count input | Debounce calculations; only recalculate on blur or explicit "Calculate" action | Noticeable with 5+ heir types being adjusted |
| Loading full Quran translation data on page load | Slow initial load, wasted bandwidth | Lazy-load references only when showing results; use code splitting | Always -- Quran text data can be several MB |
| Generating PDF with embedded fonts on every preview | Multi-second delay on each preview click | Generate PDF only on explicit "Download" action; show HTML preview for in-browser viewing | Always -- font embedding is expensive |
| Unbounded heir count inputs | Calculation time grows; UI becomes unusable with 50+ heirs | Cap heir counts at reasonable maximums (e.g., 20 sons, 4 wives); show warning for unusual counts | Unlikely in production but creates bad demo experiences |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing property valuation data without encryption | Financial data exposure if optional accounts are added later | Even for client-side calculations, if data persists (localStorage, optional accounts), encrypt sensitive values |
| No rate-limiting on property price API calls | API abuse, potential cost if using paid data sources | Implement rate limiting even for free tier; cache responses aggressively |
| Trusting user-provided property values for legal documents | Users may manipulate values to produce desired share outputs | Add clear disclaimers: "This is for informational purposes only. Consult a legal professional for official property division." Always state this is not legal advice |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Wizard with too many steps (heir input -> property details -> deductions -> results) | Form abandonment; users give up before seeing results | Show a live preview of share distribution that updates as they input heirs; make property valuation optional for quick calculations |
| Requiring all heir details upfront | Users who just want a quick answer for "3 brothers, 2 sisters" are blocked by property forms | Allow calculation with heir counts only (show fractional shares); property details are optional for monetary values |
| No explanation of Islamic terms (Awl, Radd, Asaba) | Users do not understand why shares changed; lose trust | Inline tooltips/explanations next to each term; "Why did shares change?" expandable sections |
| Mixing "simple mode" and "detailed mode" in same UI | Both audiences are confused; simple users see too much, professionals see too little | Completely separate interfaces, not a toggle that shows/hides fields. Simple mode = heir counts + instant shares. Detailed mode = full property input, deductions, PDF reports |
| Not showing Quranic justification prominently | Users cannot verify the calculation is Islamic | Show the specific verse/hadith next to each share allocation, not in a separate section |
| Ambiguous sibling type input | Users enter "brothers" without specifying full/half/uterine, getting wrong shares | Ask clarifying questions: "Are these brothers from both same parents (full), same father only (consanguine), or same mother only (uterine)?" |

## "Looks Done But Isn't" Checklist

- [ ] **Faraid engine:** Often missing Awl/Radd -- verify with test cases where total shares exceed 1.0 (Awl) and are less than 1.0 with no residuary (Radd)
- [ ] **Heir blocking:** Often missing partial blocking (Hajb Nuqsan) -- verify mother's share reduces from 1/3 to 1/6 when children exist
- [ ] **Sibling types:** Often treats all siblings as "full" -- verify consanguine and uterine siblings are handled separately with different share rules
- [ ] **Spouse Radd exclusion:** Often distributes remainder to all heirs -- verify spouse is excluded from Radd per Hanafi
- [ ] **Multiple wives:** Often assumes single wife -- verify 2-4 wives share the wife's portion (1/4 or 1/8) equally
- [ ] **Land units:** Often assumes one Katha size -- verify calculations adjust for regional unit differences
- [ ] **PDF Bengali rendering:** Often tested with English only -- verify Bengali conjunct characters render correctly in generated PDFs
- [ ] **Fraction display:** Often shows only percentages -- verify both fraction (1/6) and percentage (16.67%) are displayed
- [ ] **Quranic references:** Often shows generic references -- verify each specific share allocation cites the specific verse (e.g., Surah An-Nisa 4:11 for children's shares, 4:12 for spouse shares)
- [ ] **Total validation:** Often shows shares without verifying sum -- verify displayed shares sum to exactly 100% (or show explicit note about Bait-ul-Maal remainder)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong Hajb blocking rules | HIGH | Rewrite blocking module; re-test all scenarios; may need to restructure data model if heir types were incomplete |
| Missing Awl/Radd | MEDIUM | Add as post-processing step if calculation engine is modular; HIGH if shares are computed inline without clear pre/post phases |
| Floating-point arithmetic | HIGH | Must replace all share arithmetic with rational numbers; touches every calculation function |
| Wrong sibling type model | HIGH | Data model change requires UI changes, calculation changes, and test suite rewrite |
| Bengali PDF broken | LOW | Switch to HTML-based printing via browser Print dialog; add server-side PDF as enhancement later |
| Wrong land unit conversions | LOW | Add region selector and conversion table; does not affect core calculation logic |
| Missing pre-distribution deductions | MEDIUM | Add deduction step before calculation; requires UI changes but calculation engine just needs different input value |
| Mouza rate as truth | LOW | Add disclaimers and user override; UI change only, no calculation impact |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Hajb blocking rules | Phase 1: Calculation Engine | Test matrix covering all 16 blocking rules with known correct outputs |
| Awl implementation | Phase 1: Calculation Engine | Test cases for all Awl denominators (6->7/8/9/10, 12->13/15/17, 24->27) |
| Radd with spouse exclusion | Phase 1: Calculation Engine | Test: wife + mother only -> wife gets 1/4, mother gets 3/4 (not proportional split of full estate) |
| Floating-point precision | Phase 1: Calculation Engine | Verify all intermediate calculations use rational arithmetic; sum of shares equals exactly 1 |
| Heir type taxonomy | Phase 1: Data Modeling | Code review: verify heir model distinguishes full/consanguine/uterine siblings |
| MFLO Section 4 decision | Phase 1: Design Decision | Document whether app follows pure Faraid or BD legal modifications; UI reflects choice |
| Pre-distribution deductions | Phase 2: Property Input | Input form includes optional deduction fields; calculation uses net estate |
| Land unit conversions | Phase 2: Property Input | Test with same land in Dhaka units vs Rajshahi units; verify monetary values match |
| Mouza rate disclaimers | Phase 2-3: Property Valuation | UI shows disclaimer text next to every auto-suggested value |
| PDF Bengali rendering | Phase 1: Feasibility Spike | Generate test PDF with Bengali conjuncts; verify rendering before committing to client-side approach |
| Scope creep from sibling types | Phase 1: Requirements | Documented list of all supported heir combinations with test coverage |
| Wizard UX fatigue | Phase 2: UI Design | User testing: can a non-technical user get share results within 60 seconds? |

## Sources

- [Islamic Inheritance Blocking/Exclusion Rules -- WASSIYYAH](https://wassiyyah.com/blog/islamic-inheritance-blocking-exclusion)
- [A Modular Algorithmic Framework for Islamic Inheritance (Al-Kharaj Journal)](https://ejournal.iainpalopo.ac.id/index.php/alkharaj/article/view/9731)
- [Al-'Awl -- Five Schools of Islamic Law (Al-Islam.org)](https://al-islam.org/inheritance-according-five-schools-islamic-law-muhammad-jawad-mughniyya/al-awl)
- [Islamic Inheritance Calculations -- WASSIYYAH](https://wassiyyah.com/blog/islamic-inheritance-calculations)
- [Doctrine of Aul and Radd -- iPleaders](https://blog.ipleaders.in/doctrine-of-aul-and-radd/)
- [Residuaries ('asabah) -- Sadtayy Foundation](https://inheritance.sadtayyfoundation.org/residuaries-asabah/)
- [Muslim Inheritance Law in Bangladesh -- Justice Corner DB](https://justicecornerbd.com/blogs/muslim-inheritance-law-in-bangladesh)
- [MFLO 1961 Section 4: Orphaned Grandchildren -- SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5097144)
- [Inheritance Laws for Muslims in Bangladesh -- TRW Law Firm](https://tahmidur.com/inheritance-laws-for-muslims-in-bangladesh/)
- [Islamic Laws of Inheritance, The -- SunnahOnline.com](https://sunnahonline.com/library/fiqh-and-sunnah/780-the-islamic-laws-of-inheritance)
- [Islamic Inheritance Madhab Opinions -- WASSIYYAH](https://wassiyyah.com/blog/muslim-inheritance-madhab)
- [BD Govt Land Price Reform -- The Business Standard](https://www.tbsnews.net/economy/govt-plans-align-official-land-price-market-rates-1141781)
- [Land Measurement Units in Bangladesh -- KGRE BD](https://kgrebd.com/land-measurement-units-in-bangladesh/)
- [jspdf-fontkit for Bengali Script -- GitHub](https://github.com/rafiibrahim8/jspdf-fontkit)
- [Unicode Characters in react-pdf -- GitHub Issue #852](https://github.com/diegomura/react-pdf/issues/852)
- [Indian Language Unicode Font Rendering in react-pdf -- GitHub Issue #454](https://github.com/diegomura/react-pdf/issues/454)
- [JavaScript Floating Point Precision -- CodeMag](https://www.codemag.com/article/1811041/JavaScript-Corner-Math-and-the-Pitfalls-of-Floating-Point-Numbers)
- [Wizard UI Pattern -- Eleken](https://www.eleken.co/blog-posts/wizard-ui-pattern-explained)
- [Wizards Design Recommendations -- NN/g](https://www.nngroup.com/articles/wizards/)

---
*Pitfalls research for: Islamic Inheritance (Faraid) Land Division Calculator -- Bangladesh*
*Researched: 2026-03-12*
