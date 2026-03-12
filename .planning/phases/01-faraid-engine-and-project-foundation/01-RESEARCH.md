# Phase 1: Faraid Engine and Project Foundation - Research

**Researched:** 2026-03-12
**Domain:** Islamic inheritance (Faraid) calculation engine + React/TypeScript project scaffolding
**Confidence:** HIGH

## Summary

Phase 1 has two distinct concerns: (1) a pure TypeScript Faraid calculation engine that computes Islamic inheritance shares using exact fraction arithmetic, implementing all Hajb blocking rules, Awl proportional reduction, Radd surplus redistribution, and Asaba residuary distribution under Hanafi jurisprudence; and (2) project scaffolding with React 19, TypeScript, TailwindCSS 4, Vite, Bun, and Netlify deployment.

The Faraid engine is the core intellectual challenge. Islamic inheritance uses six prescribed fractions (1/2, 1/4, 1/8, 2/3, 1/3, 1/6) assigned conditionally to 12 types of quota-heirs, modified by 16 total-blocking rules and 5 partial-reduction rules, with two adjustment mechanisms (Awl and Radd) when shares do not sum to exactly 1. The engine must also include MFLO Section 4 (orphaned grandchildren) as an opt-in calculation path, plus Quranic/Hadith reference annotations per share allocation. All arithmetic MUST use exact fractions via fraction.js -- floating-point is unacceptable for a tool claiming Islamic accuracy.

The project scaffolding is straightforward: Bun creates a Vite + React + TypeScript template, TailwindCSS 4 uses its native Vite plugin (no PostCSS/Autoprefixer needed), and Vitest provides the testing framework. The engine lives in `src/core/faraid/` with zero React imports, making it independently testable.

**Primary recommendation:** Build the engine as a pure TypeScript module with fraction.js for all arithmetic, test it exhaustively against known Faraid outcomes before any UI work, and structure the project for the engine to be consumed by later phases via typed interfaces.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Default to pure Faraid (classical Hanafi), with MFLO Section 4 as an opt-in toggle
- MFLO support built into the engine in Phase 1 (calculation path), UI toggle comes in Phase 2/3
- When MFLO is active, show clear warning banner: "MFLO Section 4 applied -- this modifies classical Faraid rules"
- MFLO scope: Section 4 (orphaned grandchildren) only, plus informational notes about succession certificates and pre-death gift (Hiba) rules
- MFLO toggle always visible regardless of heir composition (supports what-if exploration)
- Full heir taxonomy: sons, daughters, spouse(s), full/consanguine/uterine brothers and sisters, grandchildren (sons of sons, daughters of sons), grandparents (paternal grandfather, paternal/maternal grandmother), distant kindred (dhawil-arham)
- Polygamy: support up to 4 wives -- spouse share divided equally among all wives
- Kalalah (no children, no father): fully handled, not an error state
- Siblings specified as three distinct types: full, consanguine (paternal half), uterine (maternal half)
- Umariyyatayn: follow Omar's (RA) ruling -- mother gets 1/3 of remainder, not 1/3 of estate (Hanafi consensus)
- Mushtarakah: follow strict Hanafi (full siblings get nothing if blocked) BUT show note with Shafi'i/Maliki alternative opinion
- Awl: show full explanation -- original shares, why they exceed 100%, proportional reduction with math
- Radd: explain Hanafi ruling that spouses are excluded from surplus redistribution, note why
- All edge cases must include educational explanations, not just adjusted numbers
- Each share rule linked to specific Quranic ayah with full Arabic text + English translation
- Hadith references included alongside Quranic ayahs where applicable
- Engine output includes per-heir annotations (which reference justifies each heir's share)
- Engine also produces a grouped "Islamic Basis" section with all references for the calculation
- Arabic script displayed in the app (requires Arabic font support from Phase 1 scaffolding)

### Claude's Discretion
- Default mode (pure Faraid vs MFLO) -- pick best UX default
- Exact fraction arithmetic library integration approach
- Test suite structure and verification methodology
- Project scaffolding configuration details
- Arabic font selection for Quranic text display

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FARD-01 | App calculates standard Faraid shares for all heir types using exact fraction arithmetic | fraction.js v5.3.4 for BigInt-backed fractions; complete Dhawul Furud share table documented below; 12 quota-heir types with conditional shares |
| FARD-02 | App applies Awl (proportional reduction) when total prescribed shares exceed the estate | Awl algorithm documented with base denominators (6, 12, 24) and their possible increases; worked examples provided |
| FARD-03 | App applies Radd per Hanafi rules (spouses excluded from Radd) | Radd algorithm documented; Hanafi spouse-exclusion rule verified from multiple sources |
| FARD-04 | App correctly identifies and distributes to Asaba (residuary heirs) after fixed shares | Three Asaba categories documented (bi-nafsihi, bi-ghayrihi, ma'a-ghayrihi) with classification rules |
| FARD-05 | App implements all 16 Hajb Hirman (total blocking) rules automatically | Complete 16-rule blocking table extracted and documented with Hanafi-specific rules (grandfather blocks siblings) |
| FARD-06 | App implements all 5 Hajb Nuqsan (partial reduction) rules automatically | All 5 partial reduction rules documented with original/reduced shares and conditions |
| FARD-07 | App distinguishes between full, consanguine, and uterine siblings | Sibling type taxonomy documented with different share rules and blocking interactions for each type |
| FARD-08 | App follows Hanafi school exclusively for all calculations | Hanafi-specific rules identified: grandfather blocks siblings, Radd excludes spouses, Umariyyatayn gives mother 1/3 of remainder, Mushtarakah strict blocking |
| DSGN-04 | App works as a static site deployed on Netlify | Vite + Bun + React scaffolding documented; Netlify _redirects SPA configuration documented |

</phase_requirements>

## Standard Stack

### Core (Phase 1 Specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fraction.js | ^5.3.4 | Exact rational arithmetic for ALL share calculations | BigInt-backed numerator/denominator, zero precision loss, 2.6M+ weekly downloads, zero dependencies |
| Vitest | ^3.x | Unit/integration testing for the Faraid engine | Native Vite integration, shares config, ESM/TypeScript zero-config, standard for Vite projects |
| React | 19 | UI framework (scaffolding only in Phase 1) | Decided stack |
| TypeScript | 5.5+ | Type safety for engine and all code | Decided stack |
| Vite | latest | Build tool | Decided stack |
| TailwindCSS | 4 | Styling (scaffolding only in Phase 1) | Decided stack, uses native Vite plugin |
| Bun | latest | Runtime and package manager | Decided stack |

### Supporting (Phase 1 Specific)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | latest | React component testing (minimal in Phase 1) | Only if testing scaffolding components |
| jsdom | latest | DOM environment for Vitest | Required for any component tests |
| Noto Naskh Arabic | Google Fonts | Arabic font for Quranic text display | Include in scaffolding CSS for Arabic script support |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| fraction.js | mathjs | mathjs is massive overkill (matrix ops, complex numbers); it uses fraction.js internally |
| fraction.js | Custom Fraction class | Battle-tested library vs hand-rolling arithmetic edge cases; fraction.js handles BigInt, GCD, LCM natively |
| Vitest | Bun test runner | Vitest integrates with Vite config, has richer assertion library, better ecosystem; use `bun run test` not `bun test` |
| Vitest | Jest | Jest lacks native ESM/TypeScript support; Vitest is the standard for Vite projects |

**Installation (Phase 1):**
```bash
# Project creation
bun create vite jomi-bhag -- --template react-ts
cd jomi-bhag
bun install

# TailwindCSS 4 (native Vite plugin, no PostCSS needed)
bun add tailwindcss @tailwindcss/vite

# Path alias support
bun add -d @types/node

# Faraid engine dependency
bun add fraction.js

# Testing
bun add -d vitest jsdom @testing-library/react @testing-library/jest-dom
```

## Architecture Patterns

### Recommended Project Structure (Phase 1 Focus)

```
src/
+-- core/                        # Pure computation (ZERO React imports)
|   +-- faraid/                  # Islamic inheritance engine
|   |   +-- types.ts             # HeirType, ShareResult, FaraidInput, FaraidOutput
|   |   +-- engine.ts            # Main calculateInheritance() orchestrator
|   |   +-- shares.ts            # Fixed share (fard) lookup table with conditions
|   |   +-- residuary.ts         # Asaba distribution (3 types)
|   |   +-- blocking.ts          # Hajb Hirman (16 rules) + Hajb Nuqsan (5 rules)
|   |   +-- adjustments.ts       # Awl (reduction) and Radd (return) algorithms
|   |   +-- mflo.ts              # MFLO Section 4 orphaned grandchildren path
|   |   +-- references.ts        # Quran/Hadith citation mapping per rule
|   |   +-- special-cases.ts     # Umariyyatayn, Mushtarakah, Kalalah
|   |   +-- validation.ts        # Input validation (heir combination checks)
|   |   +-- __tests__/           # Exhaustive test suite
|   |       +-- shares.test.ts   # Fixed share calculation tests
|   |       +-- blocking.test.ts # All 16+5 Hajb rule tests
|   |       +-- awl.test.ts      # Awl denominator increase tests
|   |       +-- radd.test.ts     # Radd redistribution tests
|   |       +-- residuary.test.ts # Asaba distribution tests
|   |       +-- special.test.ts  # Umariyyatayn, Mushtarakah, Kalalah
|   |       +-- mflo.test.ts     # MFLO Section 4 tests
|   |       +-- integration.test.ts # Full pipeline end-to-end tests
|   +-- utils/
|       +-- fraction.ts          # Fraction.js wrapper/helpers
+-- data/                        # Static reference data
|   +-- quran-references.ts      # Verse citations with Arabic text + English
|   +-- hadith-references.ts     # Hadith citations
|   +-- faraid-rules.ts          # Rule table: heir -> shares -> conditions -> references
+-- App.tsx                      # Minimal scaffolding
+-- main.tsx                     # Entry point
+-- index.css                    # TailwindCSS 4 import
```

### Pattern 1: Data-Driven Rule Table

**What:** Define all Faraid rules (shares, conditions, blocking) as a declarative data structure, not procedural code. The engine reads from this table, making rules auditable by Islamic scholars without reading code.

**When to use:** For all fixed share assignments, blocking rules, and reference mappings.

**Example:**
```typescript
// data/faraid-rules.ts
import Fraction from 'fraction.js';

export interface FaraidRule {
  heirType: HeirType;
  shareType: 'fard' | 'asaba' | 'fard_and_asaba';
  conditions: ShareCondition[];
  quranRef: string;      // e.g., "4:11"
  hadithRef?: string;
}

export interface ShareCondition {
  share: Fraction;
  when: string;            // Human-readable condition
  predicate: (ctx: HeirContext) => boolean;  // Machine-checkable condition
}

// Example: Daughter's share rules
export const DAUGHTER_RULES: FaraidRule = {
  heirType: 'daughter',
  shareType: 'fard',
  conditions: [
    {
      share: new Fraction(1, 2),
      when: 'Single daughter, no sons',
      predicate: (ctx) => ctx.daughters === 1 && ctx.sons === 0,
    },
    {
      share: new Fraction(2, 3),
      when: 'Two or more daughters, no sons',
      predicate: (ctx) => ctx.daughters >= 2 && ctx.sons === 0,
    },
    // When sons exist, daughters become Asaba bi-ghayrihi (residuary through another)
    // with male:female = 2:1 ratio
  ],
  quranRef: '4:11',
};
```

### Pattern 2: Pipeline Calculation Engine

**What:** The engine processes inheritance in a strict ordered pipeline: Validate -> Block -> Assign Fixed Shares -> Assign Residuary -> Adjust (Awl/Radd) -> Annotate References -> (optionally) Monetize. Each step is a pure function taking the output of the previous step.

**When to use:** Always -- this is the engine's core architecture.

**Example:**
```typescript
// core/faraid/engine.ts
export function calculateInheritance(input: FaraidInput): FaraidOutput {
  const validated = validateHeirs(input.heirs);
  const afterBlocking = applyHajb(validated, input.heirs);
  const fardShares = assignFixedShares(afterBlocking);
  const withAsaba = assignResiduary(afterBlocking, fardShares);
  const adjusted = applyAdjustment(withAsaba); // Awl or Radd
  const annotated = attachReferences(adjusted);
  return buildOutput(annotated, input);
}
```

### Pattern 3: Fraction Wrapper for Domain Clarity

**What:** Wrap fraction.js with domain-specific helpers to make Faraid calculations readable and prevent floating-point leakage.

**Example:**
```typescript
// core/utils/fraction.ts
import Fraction from 'fraction.js';

// Named fractions for Faraid (the 6 Quranic shares)
export const HALF = new Fraction(1, 2);
export const QUARTER = new Fraction(1, 4);
export const EIGHTH = new Fraction(1, 8);
export const TWO_THIRDS = new Fraction(2, 3);
export const ONE_THIRD = new Fraction(1, 3);
export const ONE_SIXTH = new Fraction(1, 6);
export const ZERO = new Fraction(0);
export const ONE = new Fraction(1);

// Sum an array of fractions
export function sumFractions(fractions: Fraction[]): Fraction {
  return fractions.reduce((acc, f) => acc.add(f), ZERO);
}

// Check if total exceeds 1 (Awl condition)
export function exceedsOne(total: Fraction): boolean {
  return total.compare(ONE) > 0;
}

// Check if total is less than 1 with no asaba (Radd condition)
export function lessThanOne(total: Fraction): boolean {
  return total.compare(ONE) < 0;
}

// Display fraction as "1/6 (16.67%)"
export function formatShare(f: Fraction): string {
  return `${f.toFraction()} (${(f.valueOf() * 100).toFixed(2)}%)`;
}
```

### Anti-Patterns to Avoid

- **Floating-point for share arithmetic:** NEVER use JavaScript `number` for fraction calculations. fraction.js handles 1/3 + 1/6 = 1/2 exactly; `number` gives 0.49999...
- **Hardcoded magic numbers:** NEVER write `if (heir === 'wife') return 0.125`. Use the rule table with named Fraction constants.
- **Mixing engine logic with React:** The `core/faraid/` directory must have ZERO React imports. Test with plain Vitest, no component rendering.
- **Treating blocking as optional:** Hajb MUST run before share assignment. If you assign shares first then try to "fix" blocking, you get cascading errors.
- **Incomplete sibling types:** NEVER model siblings as a single type. Full, consanguine, and uterine siblings have fundamentally different share rules and blocking interactions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fraction arithmetic | Custom Fraction class | fraction.js v5.3.4 | BigInt internally, handles GCD/LCM, simplification, comparison, 2.6M+ weekly downloads |
| GCD/LCM for Awl denominators | Manual Euclidean algorithm | fraction.js `.gcd()` / `.lcm()` | Already battle-tested in the library |
| Test framework | Custom test harness | Vitest | Native Vite integration, rich assertions, coverage reporting |
| Project scaffolding | Manual webpack/rollup config | `bun create vite -- --template react-ts` | Standard template, zero config needed |
| CSS processing | PostCSS + Autoprefixer config | `@tailwindcss/vite` plugin | TailwindCSS 4 bundles its own Vite plugin, no extra setup |

**Key insight:** The Faraid algorithm itself must be hand-built (no adequate library exists), but all supporting math, testing, and build tooling should use established libraries.

## Common Pitfalls

### Pitfall 1: Floating-Point Destroying Share Precision
**What goes wrong:** `1/3 + 1/6 + 1/6` in JS floats gives `0.666...6` not `2/3`. Awl detection fails because `1.0000000001 > 1` depends on epsilon. Shares displayed as "33.33333333%" instead of "1/3".
**Why it happens:** JS has no native fraction type. Developers use `number` by default.
**How to avoid:** Use fraction.js for ALL intermediate calculations. Only call `.valueOf()` at the display layer. Verify: `sumFractions(allShares).equals(ONE)` must pass after adjustment.
**Warning signs:** Total percentages showing 99.99% or 100.01%. Awl not triggering when it should.

### Pitfall 2: Incomplete Hajb Blocking Rules
**What goes wrong:** Engine assigns shares to heirs who should be blocked. Example: father + full brother -- brother should get ZERO in Hanafi (father blocks siblings), but engine gives brother a share.
**Why it happens:** Developers implement 5-6 obvious blocking rules and miss the rest. 16 rules create a complex conditional tree.
**How to avoid:** Implement ALL 16 total-blocking rules as a complete lookup table. Test each rule individually. Run blocking BEFORE share assignment.
**Warning signs:** Test case: father + full brother gives brother any share. Test case: son + grandson gives grandson any share.

### Pitfall 3: Radd Including Spouses (Wrong for Hanafi)
**What goes wrong:** When shares < 1 and no Asaba exist, remainder is distributed to ALL heirs including spouse. Hanafi ruling: spouses are EXCLUDED from Radd.
**Why it happens:** Developers copy logic from Egyptian/Indian implementations that include spouses in Radd (different legal traditions).
**How to avoid:** Explicitly filter spouses out of the Radd pool. Test: wife-only heir should get 1/4, remainder goes to Bait-ul-Maal.
**Warning signs:** Spouse ever receiving more than their Quranic fixed share in a Radd scenario.

### Pitfall 4: Missing Umariyyatayn Special Case
**What goes wrong:** When heirs are spouse + mother + father, mother gets 1/3 of TOTAL estate instead of 1/3 of REMAINDER after spouse's share. This is the Umariyyatayn ruling agreed upon by all four Sunni schools.
**Why it happens:** The general rule says "mother gets 1/3 when no children." Developers apply this literally without the special case.
**How to avoid:** Detect the pattern: spouse + mother + father (no children). Apply mother = 1/3 of (estate - spouse_share).
**Warning signs:** In husband(1/2) + mother + father: mother gets 1/3 (=2/6) instead of 1/3 of 1/2 (=1/6).

### Pitfall 5: Awl Algorithm Errors
**What goes wrong:** When fixed shares sum > 1, the proportional reduction is calculated incorrectly. Common mistake: reducing only some shares instead of all, or using floating-point division that introduces rounding.
**Why it happens:** Awl requires finding the LCM of all share denominators, computing total numerators over that LCM, then using the total numerators as the new denominator. This is multi-step fraction arithmetic.
**How to avoid:** Use fraction.js for the entire computation. The Awl base denominators are always 6, 12, or 24. They increase to specific values: 6->{7,8,9,10}, 12->{13,15,17}, 24->27. Verify the adjusted shares sum to exactly 1.
**Warning signs:** Adjusted shares not summing to exactly 1. Base denominator not matching known Awl values.

### Pitfall 6: MFLO Section 4 Conflation with Pure Faraid
**What goes wrong:** MFLO Section 4 (orphaned grandchildren inherit per stirpes) contradicts classical Hanafi blocking (sons block grandsons). Mixing these in a single code path creates undefined behavior.
**Why it happens:** The engine tries to be "smart" about when to apply MFLO instead of keeping it as an explicit toggle.
**How to avoid:** Implement MFLO as a clearly separated calculation path activated by a boolean flag. When `mfloEnabled: true`, run the Section 4 logic before standard blocking. When `false`, apply pure Hanafi blocking where sons block grandsons.
**Warning signs:** Grandchildren inheriting in pure Faraid mode. Grandchildren NOT inheriting in MFLO mode when their parent predeceased.

## Faraid Domain Knowledge (Critical for Implementation)

### The 12 Dhawul Furud (Quota-Heirs) and Their Fixed Shares

| # | Heir | Possible Shares | Conditions (Hanafi) | Quran Ref |
|---|------|----------------|---------------------|-----------|
| 1 | Husband | 1/2 | No children/grandchildren of wife | 4:12 |
| 1 | Husband | 1/4 | Wife has children/grandchildren | 4:12 |
| 2 | Wife (1-4) | 1/4 | No children/grandchildren of husband | 4:12 |
| 2 | Wife (1-4) | 1/8 | Husband has children/grandchildren | 4:12 |
| 3 | Daughter(s) | 1/2 | One daughter, no sons | 4:11 |
| 3 | Daughter(s) | 2/3 | Two+ daughters, no sons | 4:11 |
| 3 | Daughter(s) | Asaba | With sons (male gets 2x female) | 4:11 |
| 4 | Daughter(s) of son | 1/2 | One, no daughter(s), no son/son's son | 4:11 (by analogy) |
| 4 | Daughter(s) of son | 2/3 | Two+, no daughter(s), no son/son's son | 4:11 |
| 4 | Daughter(s) of son | 1/6 | With one daughter (completing 2/3) | 4:11 |
| 4 | Daughter(s) of son | Blocked | With two+ daughters, no son's son | Hajb |
| 5 | Father | 1/6 | Deceased has children/son's children | 4:11 |
| 5 | Father | 1/6 + Asaba | Deceased has only daughter(s), no sons | 4:11 |
| 5 | Father | Asaba | No children/grandchildren | Hadith |
| 6 | Paternal Grandfather | Same as father | When father is absent (Hanafi: blocks siblings) | Hadith |
| 7 | Mother | 1/6 | Children/grandchildren exist, OR 2+ siblings | 4:11 |
| 7 | Mother | 1/3 | No children, 0-1 sibling | 4:11 |
| 7 | Mother | 1/3 of remainder | Umariyyatayn: spouse + mother + father only | Omar's ruling |
| 8 | Paternal Grandmother | 1/6 | When mother and father both absent | Hadith |
| 8 | Maternal Grandmother | 1/6 | When mother absent | Hadith |
| 9 | Full Sister(s) | 1/2 | One, no children, no father, no grandfather | 4:176 |
| 9 | Full Sister(s) | 2/3 | Two+, no children, no father, no grandfather | 4:176 |
| 9 | Full Sister(s) | Asaba ma'a ghayrihi | With daughter(s) only | Juristic consensus |
| 10 | Consanguine Sister(s) | 1/2 | One, no children, no father, no full siblings | 4:176 |
| 10 | Consanguine Sister(s) | 2/3 | Two+, same conditions as full sisters | 4:176 |
| 10 | Consanguine Sister(s) | 1/6 | With one full sister (completing 2/3) | 4:176 |
| 10 | Consanguine Sister(s) | Blocked | With full brother, or two+ full sisters | Hajb |
| 11 | Uterine Brother(s) | 1/6 | One, Kalalah (no children, no father) | 4:12 |
| 11 | Uterine Brother(s) | 1/3 | Two+, Kalalah | 4:12 |
| 12 | Uterine Sister(s) | 1/6 | One, Kalalah | 4:12 |
| 12 | Uterine Sister(s) | 1/3 | Two+, Kalalah (shared with uterine brothers) | 4:12 |

### Complete Hajb Hirman (Total Blocking) Rules -- Hanafi

| # | Blocker | Blocked | Notes |
|---|---------|---------|-------|
| 1 | Son | Son's son (and lower) | Nearer excludes remoter |
| 2 | Son's son | Son's son's son (and lower) | Same principle |
| 3 | Son | Daughter(s) of son (and lower) | Son blocks granddaughters |
| 4 | Son's son | Daughter(s) of son's son (and lower) | Same principle |
| 5 | Two+ daughters | Daughter(s) of son | Unless son's son present to make her Asaba |
| 6 | Father | Father's father (and higher) | Nearer excludes remoter |
| 7 | Father | All siblings (full, consanguine, uterine) | Father blocks all siblings |
| 8 | Paternal grandfather | All siblings (full, consanguine, uterine) | **Hanafi specific** -- other schools differ |
| 9 | Full brother | Consanguine brother | Full blood over half-blood (paternal) |
| 10 | Full brother | Consanguine sister | Full blood over half-blood |
| 11 | Full sister (as Asaba ma'a ghayrihi) | Consanguine siblings | When full sister becomes residuary with daughters |
| 12 | Son, son's son, daughter, daughter of son, father | Uterine siblings | Children/father block maternal half-siblings |
| 13 | Paternal grandfather | Uterine siblings | Grandfather blocks maternal siblings |
| 14 | Mother | Mother's mother (maternal grandmother) | Nearer female ascendant blocks remoter |
| 15 | Mother | Father's mother (paternal grandmother) | Mother blocks all grandmothers |
| 16 | Father | Father's mother (paternal grandmother) | **Hanafi specific** -- father blocks his own mother |

### Complete Hajb Nuqsan (Partial Reduction) Rules

| # | Heir | Original Share | Reduced Share | Trigger |
|---|------|---------------|---------------|---------|
| 1 | Husband | 1/2 | 1/4 | Children or grandchildren of deceased |
| 2 | Wife/wives | 1/4 | 1/8 | Children or grandchildren of deceased |
| 3 | Mother | 1/3 | 1/6 | Children, grandchildren, or 2+ siblings of any type |
| 4 | Single daughter of son | 1/2 | 1/6 | Presence of single daughter (completing the 2/3 together) |
| 5 | Single consanguine sister | 1/2 | 1/6 | Presence of single full sister (completing the 2/3 together) |

### Asaba (Residuary Heir) Classification

| Type | Arabic | Who | Rule |
|------|--------|-----|------|
| Asaba bi-nafsihi | By himself | Son, son's son, father, grandfather, full brother, consanguine brother, son of full brother, son of consanguine brother, full paternal uncle, consanguine paternal uncle | Inherits remainder after fixed shares. If multiple, nearest in degree takes all. |
| Asaba bi-ghayrihi | Through another | Daughter with son, son's daughter with son's son, full sister with full brother, consanguine sister with consanguine brother | Male gets 2x female share of remainder (Quran 4:11) |
| Asaba ma'a ghayrihi | Along with another | Full/consanguine sister(s) alongside daughter(s) | Sister(s) take remainder when co-inheriting with daughter(s), acting as if they were brothers |

### Awl (Proportional Reduction) Algorithm

**When it applies:** Sum of fixed shares > 1, AND no Asaba heirs to absorb remainder.

**Base denominators and possible increases:**
| Base | Possible Awl Values | Example Heir Combination |
|------|--------------------|--------------------------|
| 6 | 7, 8, 9, 10 | Husband + 2 full sisters = 1/2 + 2/3 = 7/6 |
| 12 | 13, 15, 17 | Husband + 2 daughters + mother = 1/4 + 2/3 + 1/6 = 13/12 |
| 24 | 27 | Wife + 2 daughters + father + mother = 1/8 + 2/3 + 1/6 + 1/6 = 27/24 |

**Algorithm:**
1. Find LCM of all share denominators (will be 6, 12, or 24)
2. Convert all shares to this common denominator
3. Sum all numerators -- this is the Awl denominator
4. Each heir's adjusted share = their numerator / Awl denominator
5. Verify: sum of adjusted shares = 1 exactly

**Worked example (base 6 -> 7):**
- Husband: 1/2 = 3/6 -> becomes 3/7
- 2 Full Sisters: 2/3 = 4/6 -> becomes 4/7
- Total: 3/7 + 4/7 = 7/7 = 1 (correct)

### Radd (Surplus Redistribution) Algorithm -- Hanafi

**When it applies:** Sum of fixed shares < 1, AND no Asaba heirs exist.

**Hanafi rule:** Spouses are EXCLUDED from Radd. Remainder is distributed proportionally to blood-relative fixed-share heirs only.

**Algorithm:**
1. Calculate total fixed shares
2. Calculate remainder = 1 - total
3. Identify Radd-eligible heirs (all fixed-share heirs EXCEPT spouse)
4. Distribute remainder proportionally based on their original share ratios
5. Special case: if ONLY spouse exists, remainder goes to Bait-ul-Maal (not modeled in engine -- just note it)

**Worked example:**
- Wife: 1/4, Mother: 1/3 -- Total = 7/12, Remainder = 5/12
- Radd-eligible: Mother only (wife excluded)
- Mother's final share: 1/3 + 5/12 = 4/12 + 5/12 = 9/12 = 3/4
- Wife keeps: 1/4
- Total: 3/4 + 1/4 = 1 (correct)

### MFLO Section 4 (Orphaned Grandchildren) -- Opt-in Path

**Rule:** "In the event of death of any son or daughter of the propositus before the opening of succession, the children of such son or daughter, if any, living at the time the succession opens, shall per stirpes receive a share equivalent to the share which such son or daughter would have received if alive."

**Implementation:**
1. When `mfloEnabled: true`, before applying standard blocking:
2. For each predeceased child, calculate what share they WOULD have received
3. That share is distributed per stirpes to their living children
4. This overrides the Hanafi rule that sons block grandsons
5. Flag the output with `mfloApplied: true` and annotate affected shares

### Special Cases

**Umariyyatayn (Two Omari Cases):**
- Pattern: Spouse + Mother + Father, no children
- Case 1: Husband(1/2) + Mother + Father -> Mother gets 1/3 of remainder(1/2) = 1/6, Father gets remainder = 1/3
- Case 2: Wife(1/4) + Mother + Father -> Mother gets 1/3 of remainder(3/4) = 1/4, Father gets remainder = 1/2
- Detection: `heirs = {spouse, mother, father}` with no children/siblings

**Mushtarakah (Shared Case):**
- Pattern: Husband + Mother + Uterine siblings + Full siblings
- Hanafi ruling: Full siblings get NOTHING (blocked; uterine siblings take their 1/3)
- Engine note: annotate with "Shafi'i/Maliki alternative: full siblings share in uterine siblings' 1/3"

**Kalalah (No Children, No Father):**
- Not an error state. Siblings and spouse inherit according to 4:12 and 4:176
- Mother present: her share varies (1/3 or 1/6 depending on sibling count)

## Code Examples

### Fraction.js API Patterns for Faraid

```typescript
import Fraction from 'fraction.js';

// Constructor forms
const f1 = new Fraction(1, 6);           // numerator, denominator
const f2 = new Fraction('1/3');          // string
const f3 = new Fraction(0.5);           // number (exact for powers of 2)
const f4 = new Fraction({n: 2, d: 3});  // object

// Arithmetic (all return new Fraction, immutable)
const sum = f1.add(f2);         // 1/6 + 1/3 = 1/2
const diff = f2.sub(f1);        // 1/3 - 1/6 = 1/6
const prod = f1.mul(3);         // 1/6 * 3 = 1/2
const quot = f2.div(f1);        // (1/3) / (1/6) = 2

// Comparison
f1.compare(f2);                 // -1 (f1 < f2), 0 (equal), 1 (f1 > f2)
f1.equals(new Fraction(1, 6)); // true
sum.compare(new Fraction(1));   // Check if > 1 for Awl

// Access internals
f1.s;   // sign: 1 or -1
f1.n;   // numerator: 1n (BigInt)
f1.d;   // denominator: 6n (BigInt)

// Display
f1.toFraction();    // "1/6"
f1.toFraction(true); // "1/6" (excludeWhole=true avoids "0 1/6")
f1.toString();       // "0.1(6)" -- repeating decimal notation
f1.valueOf();        // 0.16666666666666666 (JS number, ONLY for display)
f1.toLatex();        // "\\frac{1}{6}"

// GCD and LCM (useful for Awl base computation)
const g = new Fraction(4, 6).gcd(new Fraction(2, 3));
const l = new Fraction(1, 4).lcm(new Fraction(1, 6)); // LCM of denominators

// Reduction/simplification happens automatically
new Fraction(4, 8).toFraction(); // "1/2"
```

### Vitest Configuration

```typescript
// vitest.config.ts (or inline in vite.config.ts)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/core/**'],
    },
  },
});
```

### Vitest Test Example for Faraid Engine

```typescript
// src/core/faraid/__tests__/shares.test.ts
import { describe, it, expect } from 'vitest';
import Fraction from 'fraction.js';
import { calculateInheritance } from '../engine';

describe('Fixed Share Calculations', () => {
  it('husband alone gets 1/2 (no children)', () => {
    const result = calculateInheritance({
      deceasedGender: 'female',
      heirs: [{ type: 'husband', count: 1 }],
    });
    expect(result.shares[0].shareFraction.equals(new Fraction(1, 2))).toBe(true);
  });

  it('husband gets 1/4 when children exist', () => {
    const result = calculateInheritance({
      deceasedGender: 'female',
      heirs: [
        { type: 'husband', count: 1 },
        { type: 'son', count: 1 },
      ],
    });
    const husbandShare = result.shares.find(s => s.heirType === 'husband');
    expect(husbandShare!.shareFraction.equals(new Fraction(1, 4))).toBe(true);
  });

  it('total shares sum to exactly 1 after adjustment', () => {
    const result = calculateInheritance({
      deceasedGender: 'male',
      heirs: [
        { type: 'wife', count: 1 },
        { type: 'daughter', count: 2 },
        { type: 'father', count: 1 },
        { type: 'mother', count: 1 },
      ],
    });
    const total = result.shares.reduce(
      (sum, s) => sum.add(s.shareFraction),
      new Fraction(0)
    );
    expect(total.equals(new Fraction(1))).toBe(true);
    expect(result.adjustment).toBe('awl');
  });
});

describe('Hajb Hirman - Total Blocking', () => {
  it('father blocks full brother completely', () => {
    const result = calculateInheritance({
      deceasedGender: 'male',
      heirs: [
        { type: 'father', count: 1 },
        { type: 'brother_full', count: 1 },
      ],
    });
    const brother = result.shares.find(s => s.heirType === 'brother_full');
    expect(brother).toBeUndefined(); // blocked, should not appear
  });

  it('grandfather blocks siblings in Hanafi', () => {
    const result = calculateInheritance({
      deceasedGender: 'male',
      heirs: [
        { type: 'paternal_grandfather', count: 1 },
        { type: 'brother_full', count: 2 },
      ],
    });
    const brothers = result.shares.find(s => s.heirType === 'brother_full');
    expect(brothers).toBeUndefined(); // Hanafi: grandfather blocks siblings
  });
});
```

### Vite Configuration for Scaffolding

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### TailwindCSS 4 Setup

```css
/* src/index.css */
@import "tailwindcss";

/* Arabic font for Quranic text */
@import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
```

### Netlify SPA Configuration

```
# public/_redirects
/*    /index.html   200
```

### tsconfig.json Path Aliases

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| TailwindCSS 3 with PostCSS + Autoprefixer | TailwindCSS 4 with native `@tailwindcss/vite` plugin | Jan 2025 | No postcss.config.js, no tailwind.config.js needed; config moves to CSS with `@import "tailwindcss"` |
| `@tailwind base/components/utilities` directives | `@import "tailwindcss"` | TailwindCSS 4 | Single import replaces three directives |
| react-router-dom separate package | Unified `react-router` package | react-router v7 | Single package for all routing |
| Zod 3 | Zod 4 (2kB core, zero deps) | July 2025 | Significant size/perf improvement, same API |
| fraction.js v4 | fraction.js v5.3.4 (BigInt) | 2024 | Internal BigInt representation for arbitrary precision |
| Jest for testing | Vitest as standard for Vite projects | 2024-2025 | Native ESM, shares Vite config, zero-config TypeScript |

**Deprecated/outdated:**
- `tailwind.config.js` -- TailwindCSS 4 uses CSS-based configuration
- `postcss.config.js` for Tailwind -- the `@tailwindcss/vite` plugin handles everything
- `@tailwind` directives in CSS -- replaced by `@import "tailwindcss"`
- Separate `react-router-dom` package -- use `react-router` directly in v7

## Open Questions

1. **Umariyyatayn edge case boundary**
   - What we know: When heirs are exactly spouse + mother + father (no children, no siblings), mother gets 1/3 of remainder per Omar's ruling. All four Sunni schools agree.
   - What's unclear: Whether the presence of any other heir (e.g., a distant kindred) cancels the special case, reverting mother to standard 1/3 of estate.
   - Recommendation: Implement strict detection (exactly spouse + mother + father), document the boundary. Conservative approach is safest.

2. **Radd when only spouse exists**
   - What we know: Hanafi excludes spouse from Radd. If only a husband/wife inherits, their share is 1/2 or 1/4, and the remainder goes to Bait-ul-Maal (state treasury).
   - What's unclear: Whether to show this as "remaining X goes to state treasury" or just show the spouse's share with an explanation.
   - Recommendation: Show spouse share + remainder with explanatory note "Per Hanafi ruling, the remainder of [fraction] would be directed to Bait-ul-Maal (public treasury)."

3. **Distant kindred (dhawil-arham) priority ordering**
   - What we know: When no Dhawul Furud and no Asaba exist, estate goes to distant kindred. CONTEXT.md requires supporting this.
   - What's unclear: The exact Hanafi priority ordering among distant kindred is complex (4 classes with sub-ordering).
   - Recommendation: Implement basic distant kindred support in Phase 1 engine types, but detailed ordering can be iterative. Flag as educational note when triggered.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | vitest.config.ts (or test block in vite.config.ts) |
| Quick run command | `bun run vitest run --reporter=verbose` |
| Full suite command | `bun run vitest run --coverage` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FARD-01 | Standard Faraid shares for all heir types | unit | `bun run vitest run src/core/faraid/__tests__/shares.test.ts -x` | Wave 0 |
| FARD-02 | Awl proportional reduction | unit | `bun run vitest run src/core/faraid/__tests__/awl.test.ts -x` | Wave 0 |
| FARD-03 | Radd redistribution (spouse excluded) | unit | `bun run vitest run src/core/faraid/__tests__/radd.test.ts -x` | Wave 0 |
| FARD-04 | Asaba residuary distribution | unit | `bun run vitest run src/core/faraid/__tests__/residuary.test.ts -x` | Wave 0 |
| FARD-05 | 16 Hajb Hirman blocking rules | unit | `bun run vitest run src/core/faraid/__tests__/blocking.test.ts -x` | Wave 0 |
| FARD-06 | 5 Hajb Nuqsan partial reduction rules | unit | `bun run vitest run src/core/faraid/__tests__/blocking.test.ts -x` | Wave 0 |
| FARD-07 | Sibling type distinction (full/consanguine/uterine) | unit | `bun run vitest run src/core/faraid/__tests__/shares.test.ts -x` | Wave 0 |
| FARD-08 | Hanafi school compliance | integration | `bun run vitest run src/core/faraid/__tests__/integration.test.ts -x` | Wave 0 |
| DSGN-04 | Static site builds and deploys | smoke | `bun run build && ls dist/index.html` | Wave 0 |

### Sampling Rate

- **Per task commit:** `bun run vitest run --reporter=verbose`
- **Per wave merge:** `bun run vitest run --coverage`
- **Phase gate:** Full suite green + coverage report before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` -- test framework configuration
- [ ] `src/core/faraid/__tests__/shares.test.ts` -- covers FARD-01, FARD-07
- [ ] `src/core/faraid/__tests__/blocking.test.ts` -- covers FARD-05, FARD-06
- [ ] `src/core/faraid/__tests__/awl.test.ts` -- covers FARD-02
- [ ] `src/core/faraid/__tests__/radd.test.ts` -- covers FARD-03
- [ ] `src/core/faraid/__tests__/residuary.test.ts` -- covers FARD-04
- [ ] `src/core/faraid/__tests__/special.test.ts` -- covers Umariyyatayn, Mushtarakah, Kalalah
- [ ] `src/core/faraid/__tests__/mflo.test.ts` -- covers MFLO Section 4
- [ ] `src/core/faraid/__tests__/integration.test.ts` -- covers FARD-08 (end-to-end Hanafi compliance)
- [ ] Framework install: `bun add -d vitest jsdom`

## Sources

### Primary (HIGH confidence)

- [fraction.js GitHub (rawify/Fraction.js)](https://github.com/infusion/Fraction.js/) -- API, BigInt internals, version 5.3.4
- [fraction.js npm](https://www.npmjs.com/package/fraction.js) -- downloads (2.6M+/week), version verification
- [Vitest Official Docs](https://vitest.dev/guide/) -- configuration, Vite integration, Bun compatibility
- [Vitest Configuration](https://vitest.dev/config/) -- vitest.config.ts options
- [TailwindCSS 4 Vite Setup](https://dev.to/geane_ramos/how-to-setup-your-vite-project-with-react-typescript-and-tailwindcss-v4-2bkm) -- @tailwindcss/vite plugin, no PostCSS needed
- [Bun + Vite Setup](https://bun.com/docs/guides/ecosystem/vite) -- `bun create vite` template
- [Netlify Vite Docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/) -- deployment configuration
- [Noto Naskh Arabic - Google Fonts](https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic) -- Arabic font for Quranic display

### Secondary (MEDIUM confidence)

- [WASSIYYAH - Islamic Inheritance Blocking Rules](https://wassiyyah.com/blog/islamic-inheritance-blocking-exclusion) -- 16 Hajb Hirman rules, 5 Hajb Nuqsan rules
- [SunnahOnline - Islamic Laws of Inheritance](https://sunnahonline.com/library/fiqh-and-sunnah/780-the-islamic-laws-of-inheritance) -- Fixed share table, heir classification
- [Islamic Inheritance Laws Lesson 12](http://islamicinheritancelaws.com/Lesson12.html) -- Awl worked examples, denominator increases
- [Al-Islam.org - Al-Awl](https://al-islam.org/inheritance-according-five-schools-islamic-law-muhammad-jawad-mughniyya/al-awl) -- Awl mechanism across schools
- [IslamicInheritance.com Calculator](https://islamicinheritance.com/calculator/) -- Heir types, methodology reference
- [Sadtayy Foundation - Residuaries](https://inheritance.sadtayyfoundation.org/residuaries-asabah/) -- Asaba classification
- [Wikipedia - Islamic Inheritance Jurisprudence](https://en.wikipedia.org/wiki/Islamic_inheritance_jurisprudence) -- Overview, school differences
- [SSRN - MFLO Section 4 Orphaned Grandchildren](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5097144) -- Section 4 per stirpes rule
- [Bun + Shadcn Setup Gist](https://gist.github.com/fixing-things-enjoyer/f597274fd45cbe9d138cfbb2f14607fd) -- Project scaffolding steps
- [Vitest in 2026](https://jeffbruchado.com.br/en/blog/vitest-2026-standard-modern-javascript-testing) -- Vitest as standard testing framework

### Tertiary (LOW confidence)

- [Lawbhoomi - Sunni Law of Inheritance](https://lawbhoomi.com/sunni-law-of-inheritance/) -- Indian perspective, may differ from BD-specific Hanafi
- [iPleaders - Doctrine of Aul and Radd](https://blog.ipleaders.in/doctrine-of-aul-and-radd/) -- Indian legal perspective

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified via npm/GitHub, versions confirmed, setup patterns validated
- Architecture: HIGH -- patterns from prior project research (ARCHITECTURE.md) verified against current best practices
- Faraid domain knowledge: HIGH -- rules cross-referenced across 5+ Islamic jurisprudence sources; Hanafi-specific rules verified
- Awl/Radd mechanics: HIGH -- algorithm documented with worked examples from authoritative sources
- Hajb blocking rules: MEDIUM-HIGH -- 16 rules documented from WASSIYYAH source; individual edge cases in rule interactions may need implementation-time verification against Faraid textbooks
- MFLO Section 4: MEDIUM -- per stirpes rule clear from legal sources; exact calculation interaction with other heirs needs implementation-time testing
- Pitfalls: HIGH -- documented from multiple sources including existing project research

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable domain -- Islamic jurisprudence does not change; library versions may update)

---
*Phase: 01-faraid-engine-and-project-foundation*
*Research completed: 2026-03-12*
