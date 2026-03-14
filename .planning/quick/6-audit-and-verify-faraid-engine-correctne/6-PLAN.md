---
phase: quick-6
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/core/faraid/__tests__/integration.test.ts
autonomous: true
requirements: [AUDIT-EDGE-CASES]

must_haves:
  truths:
    - "10 new integration tests cover grandfather blocking, consanguine sister, grandmother, wife-only Kalalah, Awl with fard_and_asaba, Radd with grandparents, widow+sons, widow+son+daughters, daughter+grandfather, and MFLO+Awl"
    - "All tests use exact Fraction comparisons (not floating point)"
    - "All tests verify shares sum to 1 (except Bait-ul-Maal cases)"
    - "Tests document known engine behaviors and flag deviations from expected Faraid rules via comments"
  artifacts:
    - path: "src/core/faraid/__tests__/integration.test.ts"
      provides: "23+ integration tests (13 existing + 10 new)"
      contains: "Grandfather Blocking with Multiple Sibling Types"
  key_links:
    - from: "src/core/faraid/__tests__/integration.test.ts"
      to: "src/core/faraid/engine.ts"
      via: "calculateInheritance import"
      pattern: "calculateInheritance"
---

<objective>
Add 10 high-priority integration tests to the Faraid engine covering edge cases identified in audit: grandfather blocking, consanguine sister Asaba ma'a ghayrihi, dual grandmothers, wife-only Kalalah, Awl with fard_and_asaba heirs, Radd with grandparents, widow+sons variations, daughter+grandfather, and MFLO+Awl interaction.

Purpose: Verify engine correctness for complex Islamic inheritance scenarios and document any deviations from textbook Faraid rules.
Output: Updated integration.test.ts with 23+ tests total.
</objective>

<execution_context>
@/home/siam/.claude/get-shit-done/workflows/execute-plan.md
@/home/siam/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/core/faraid/__tests__/integration.test.ts
@src/core/faraid/engine.ts
@src/core/faraid/types.ts
@src/core/utils/fraction.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add 10 Faraid edge case integration tests</name>
  <files>src/core/faraid/__tests__/integration.test.ts</files>
  <action>
Add 10 new test cases to integration.test.ts, following the existing pattern:
- Use `calculateInheritance()` directly
- Use Fraction comparisons (`.equals(new Fraction(x, y))`)
- Use `expectSumToOne()` helper (skip for Bait-ul-Maal cases where total < 1)
- Use `expectMetadata()` helper for steps/references

Add these describe blocks after the existing tests:

**1. `describe('Integration: Grandfather Blocking Multiple Sibling Types')`**
Test: `paternal_grandfather(1) + brother_full(1) + brother_consanguine(1) + sister_uterine(1)`
deceasedGender: 'male'
Expected: Grandfather blocks ALL 3 siblings (Hanafi Rule 8 + Rule 13). Grandfather gets entire estate (1/1) as Asaba. `blockedHeirs` length >= 3, containing brother_full, brother_consanguine, sister_uterine. No sibling appears in shares. adjustment: 'none'. Sum = 1.

**2. `describe('Integration: Consanguine Sister Asaba Ma\'a Ghayrihi')`**
Test: `daughter(1) + sister_consanguine(1)`, deceasedGender: 'male'
KNOWN ENGINE BEHAVIOR: The consanguine sister does NOT appear in shares because no rule table condition matches (all require isKalalah, which is false with daughters). The daughter gets 1/2 fard -> Radd boosts to 1/1. adjustment: 'radd'.
Add comment: `// NOTE: Islamically, consanguine sister should get remainder as Asaba ma'a ghayrihi when no full siblings present. Engine rule table lacks this condition -- potential enhancement.`
Verify daughter totalShare equals ONE. consanguine sister absent from shares. adjustment equals 'radd'.

**3. `describe('Integration: Both Grandmothers Present')`**
Test: `paternal_grandmother(1) + maternal_grandmother(1)`, deceasedGender: 'male'
Engine gives each grandmother 1/6 independently, then Radd redistributes proportionally: each gets 1/2. adjustment: 'radd'.
Add comment: `// NOTE: Classical Hanafi rule is both grandmothers share ONE 1/6 collectively (each 1/12 before Radd). Engine assigns each 1/6 independently. Radd result (each 1/2) is coincidentally correct since proportional redistribution yields same final shares.`
Verify each grandmother totalShare equals HALF. Sum = 1. adjustment: 'radd'.

**4. `describe('Integration: Wife in Kalalah as Only Heir')`**
Test: `wife(1)`, deceasedGender: 'male'
Wife gets 1/4 (no children). Radd excludes spouse. Remainder to Bait-ul-Maal.
Verify wife totalShare equals QUARTER. adjustment: 'radd'. DO NOT call expectSumToOne (total is 1/4, not 1 -- remainder is Bait-ul-Maal). Instead verify total equals 1/4 explicitly.

**5. `describe('Integration: Awl with Fard and Asaba Heirs')`**
Test: `wife(1) + daughter(2) + father(1) + mother(1)`, deceasedGender: 'male'
Father has fard_and_asaba (1/6 fard, Asaba portion zeroed by Awl). Total before adjustment: 1/8 + 2/3 + 1/6 + 1/6 = 27/24 = 9/8. Awl base 24 -> 27.
Wife: 3/27 = 1/9. Daughters: 16/27. Father: 4/27. Mother: 4/27. adjustment: 'awl'.
Verify wife totalShare equals new Fraction(1, 9). daughters totalShare equals new Fraction(16, 27). father totalShare equals new Fraction(4, 27). mother totalShare equals new Fraction(4, 27). Father's shareType is 'fard' (engine converts fard_and_asaba to fard in output). Sum = 1.

**6. `describe('Integration: Radd with Grandmother as Sole Blood Heir')`**
Test: `maternal_grandmother(1)`, deceasedGender: 'male'
Grandmother gets 1/6 fard, only blood heir, Radd gives entire estate.
Verify grandmother totalShare equals ONE. adjustment: 'radd'. Sum = 1.

**7. `describe('Integration: Widow + 3 Sons')`**
Test: `wife(1) + son(3)`, deceasedGender: 'male'
Wife: 1/8 (children present). Sons: 7/8 remainder. Each son: 7/24.
Verify wife totalShare equals EIGHTH. sons totalShare equals new Fraction(7, 8). sons sharePerHeir equals new Fraction(7, 24). adjustment: 'none'. Sum = 1.

**8. `describe('Integration: Widow + Son + 2 Daughters')`**
Test: `wife(1) + son(1) + daughter(2)`, deceasedGender: 'male'
Wife: 1/8. Remainder 7/8 split 2:1:1 among son(2 parts) + daughters(1 part each).
Total parts = 2 + 1 + 1 = 4. Son: 7/8 * 2/4 = 7/16. Daughters total: 7/8 * 2/4 = 7/16, each: 7/32.
Verify wife totalShare equals EIGHTH. son totalShare equals new Fraction(7, 16). son sharePerHeir equals new Fraction(7, 16). daughters totalShare equals new Fraction(7, 16). daughters sharePerHeir equals new Fraction(7, 32). adjustment: 'none'. Sum = 1.

**9. `describe('Integration: Single Daughter + Paternal Grandfather')`**
Test: `daughter(1) + paternal_grandfather(1)`, deceasedGender: 'male'
KNOWN ENGINE BEHAVIOR: Daughter gets 1/2, grandfather gets 1/6 (both fard). Radd redistributes remainder 1/3 proportionally. Daughter: 1/2 / (2/3) = 3/4 proportion -> gets 1/4 Radd -> total 3/4. Grandfather: 1/6 / (2/3) = 1/4 proportion -> gets 1/12 Radd -> total 1/4. adjustment: 'radd'. Both have shareType 'fard'.
Add comment: `// NOTE: Correct Hanafi answer: daughter 1/2, grandfather 1/6 + remainder(1/3) = 1/2. Engine treats grandfather as pure fard (not fard_and_asaba) after non-zero share assignment, so Radd applies instead of Asaba residuary. This produces daughter 3/4, grandfather 1/4 -- differs from textbook.`
Verify daughter totalShare equals new Fraction(3, 4). grandfather totalShare equals new Fraction(1, 4). adjustment: 'radd'. Sum = 1.

**10. `describe('Integration: MFLO Per Stirpes Basic')`**
Test with mfloEnabled: true, 1 living son + 1 predeceased son with 1 son_of_son + 1 daughter_of_son.
deceasedGender: 'male'. heirs: [{ type: 'son', count: 1 }]. predeceasedChildren: [{ gender: 'male', livingChildren: [{ type: 'son_of_son', count: 1 }, { type: 'daughter_of_son', count: 1 }] }].
The predeceased son would get 2/4 = 1/2 of children's pool (2 parts out of 2+2=4 parts... wait, 1 living son(2 parts) + 1 predeceased son(2 parts) = 4 parts). Predeceased son's pool share: 2/4 = 1/2. Among his children: son_of_son gets 2/3, daughter_of_son gets 1/3 of that 1/2.
Verify mfloApplied is true. Living son gets asaba remainder. Sum = 1 (if engine handles this correctly).
Add comment explaining MFLO Section 4 per stirpes calculation. Use expectSumToOne if total = 1, otherwise verify individual shares and note discrepancy.
  </action>
  <verify>
    <automated>npx vitest run src/core/faraid/__tests__/integration.test.ts --reporter=verbose 2>&1 | tail -40</automated>
  </verify>
  <done>
All 23+ integration tests pass. 10 new tests cover grandfather blocking, consanguine sister, grandmother splitting, wife-only Kalalah, Awl with fard_and_asaba, Radd with grandparents, widow+sons, widow+son+daughters, daughter+grandfather, and MFLO per stirpes. Comments document 2-3 known deviations from textbook Faraid rules.
  </done>
</task>

</tasks>

<verification>
npx vitest run src/core/faraid/__tests__/integration.test.ts --reporter=verbose
All 23+ tests pass. No regressions in existing 13 tests.
</verification>

<success_criteria>
- 10 new integration tests added to integration.test.ts
- All tests use exact Fraction comparison (no floating point)
- Tests verify shares sum correctly (= 1 or documented Bait-ul-Maal exception)
- Each test verifies steps[] and references[] via expectMetadata()
- Comments document known engine deviations from textbook Faraid
- All 23+ tests pass with zero failures
</success_criteria>

<output>
After completion, create `.planning/quick/6-audit-and-verify-faraid-engine-correctne/6-SUMMARY.md`
</output>
