import type { FaraidRule, HeirContext } from '@/core/faraid/types'
import {
  HALF,
  QUARTER,
  EIGHTH,
  TWO_THIRDS,
  ONE_THIRD,
  ONE_SIXTH,
  ZERO,
} from '@/core/utils/fraction'

/**
 * Complete declarative rule table for all Faraid heir types.
 *
 * Each rule maps an heir type to its conditional share allocations.
 * Conditions are ordered by specificity (most specific first).
 * The engine evaluates conditions in order and uses the first match.
 *
 * Share of ZERO means the heir becomes Asaba (residuary) in that condition.
 * The engine handles Asaba distribution separately.
 *
 * Reference: Surah An-Nisa 4:11, 4:12, 4:176 and authenticated Hadith.
 */
export const FARAID_RULES: FaraidRule[] = [
  // 1. Husband
  {
    heirType: 'husband',
    shareType: 'fard',
    conditions: [
      {
        share: QUARTER,
        when: 'Wife (deceased) has children or grandchildren',
        predicate: (ctx: HeirContext) => ctx.hasChildren || ctx.hasGrandchildren,
      },
      {
        share: HALF,
        when: 'Wife (deceased) has no children or grandchildren',
        predicate: () => true,
      },
    ],
    quranRef: '4:12',
  },

  // 2. Wife (1-4)
  {
    heirType: 'wife',
    shareType: 'fard',
    conditions: [
      {
        share: EIGHTH,
        when: 'Husband (deceased) has children or grandchildren',
        predicate: (ctx: HeirContext) => ctx.hasChildren || ctx.hasGrandchildren,
      },
      {
        share: QUARTER,
        when: 'Husband (deceased) has no children or grandchildren',
        predicate: () => true,
      },
    ],
    quranRef: '4:12',
  },

  // 3. Son -- always Asaba bi-nafsihi (residuary by himself)
  {
    heirType: 'son',
    shareType: 'asaba',
    conditions: [
      {
        share: ZERO, // Asaba -- gets remainder
        when: 'Son inherits as Asaba (residuary). Male gets twice the female share when co-inheriting with daughters.',
        predicate: () => true,
      },
    ],
    quranRef: '4:11',
  },

  // 4. Daughter(s)
  {
    heirType: 'daughter',
    shareType: 'fard_and_asaba',
    conditions: [
      {
        share: ZERO, // Asaba bi-ghayrihi with sons
        when: 'With sons: daughters become Asaba bi-ghayrihi (male gets 2x female)',
        predicate: (ctx: HeirContext) => ctx.sons > 0,
      },
      {
        share: HALF,
        when: 'One daughter, no sons',
        predicate: (ctx: HeirContext) => ctx.daughters === 1 && ctx.sons === 0,
      },
      {
        share: TWO_THIRDS,
        when: 'Two or more daughters, no sons',
        predicate: (ctx: HeirContext) => ctx.daughters >= 2 && ctx.sons === 0,
      },
    ],
    quranRef: '4:11',
  },

  // 5. Son of Son -- Asaba bi-nafsihi (when not blocked)
  {
    heirType: 'son_of_son',
    shareType: 'asaba',
    conditions: [
      {
        share: ZERO, // Asaba -- gets remainder
        when: "Son's son inherits as Asaba (residuary) when not blocked by son",
        predicate: () => true,
      },
    ],
    quranRef: '4:11',
    hadithRef: 'bukhari-6732',
  },

  // 6. Daughter(s) of Son
  {
    heirType: 'daughter_of_son',
    shareType: 'fard_and_asaba',
    conditions: [
      {
        share: ZERO, // Asaba bi-ghayrihi with son's son
        when: "With son's son: become Asaba bi-ghayrihi (male gets 2x female)",
        predicate: (ctx: HeirContext) => ctx.sonsOfSon > 0,
      },
      {
        share: ONE_SIXTH,
        when: 'With one daughter (completing 2/3 together)',
        predicate: (ctx: HeirContext) =>
          ctx.daughters === 1 && ctx.sons === 0 && ctx.sonsOfSon === 0,
      },
      {
        share: HALF,
        when: "One daughter of son, no daughters, no son/son's son",
        predicate: (ctx: HeirContext) =>
          ctx.daughtersOfSon === 1 && ctx.daughters === 0 && ctx.sons === 0 && ctx.sonsOfSon === 0,
      },
      {
        share: TWO_THIRDS,
        when: "Two+ daughters of son, no daughters, no son/son's son",
        predicate: (ctx: HeirContext) =>
          ctx.daughtersOfSon >= 2 && ctx.daughters === 0 && ctx.sons === 0 && ctx.sonsOfSon === 0,
      },
    ],
    quranRef: '4:11',
    hadithRef: 'bukhari-6732',
  },

  // 7. Father
  {
    heirType: 'father',
    shareType: 'fard_and_asaba',
    conditions: [
      {
        share: ONE_SIXTH,
        when: 'Deceased has sons or sons of sons',
        predicate: (ctx: HeirContext) => ctx.sons > 0 || ctx.sonsOfSon > 0,
      },
      {
        share: ONE_SIXTH, // Gets 1/6 as fard + remainder as Asaba
        when: 'Deceased has only daughters (no sons): father gets 1/6 fard + remainder as Asaba',
        predicate: (ctx: HeirContext) =>
          ctx.sons === 0 && ctx.sonsOfSon === 0 && (ctx.daughters > 0 || ctx.daughtersOfSon > 0),
      },
      {
        share: ZERO, // Pure Asaba
        when: 'No children or grandchildren: father inherits as pure Asaba',
        predicate: () => true,
      },
    ],
    quranRef: '4:11',
    hadithRef: 'bukhari-6732',
  },

  // 8. Paternal Grandfather -- same as father when father absent (Hanafi)
  {
    heirType: 'paternal_grandfather',
    shareType: 'fard_and_asaba',
    conditions: [
      {
        share: ONE_SIXTH,
        when: 'Deceased has sons or sons of sons (grandfather gets 1/6 like father)',
        predicate: (ctx: HeirContext) => ctx.sons > 0 || ctx.sonsOfSon > 0,
      },
      {
        share: ONE_SIXTH, // Gets 1/6 as fard + remainder as Asaba
        when: 'Deceased has only daughters: grandfather gets 1/6 fard + remainder as Asaba',
        predicate: (ctx: HeirContext) =>
          ctx.sons === 0 && ctx.sonsOfSon === 0 && (ctx.daughters > 0 || ctx.daughtersOfSon > 0),
      },
      {
        share: ZERO, // Pure Asaba
        when: 'No children or grandchildren: grandfather inherits as pure Asaba',
        predicate: () => true,
      },
    ],
    quranRef: '4:11',
    hadithRef: 'hanafi-grandfather-siblings',
  },

  // 9. Mother
  {
    heirType: 'mother',
    shareType: 'fard',
    conditions: [
      {
        share: ONE_SIXTH,
        when: 'Children, grandchildren, or 2+ siblings exist',
        predicate: (ctx: HeirContext) =>
          ctx.hasChildren || ctx.hasGrandchildren || ctx.siblingCount >= 2,
      },
      {
        // Umariyyatayn: handled as special case in engine
        // Here we use ONE_THIRD as the default; the engine adjusts for Umariyyatayn
        share: ONE_THIRD,
        when: 'No children, no grandchildren, 0-1 sibling',
        predicate: () => true,
      },
    ],
    quranRef: '4:11',
    hadithRef: 'umariyyatayn',
  },

  // 10. Paternal Grandmother
  {
    heirType: 'paternal_grandmother',
    shareType: 'fard',
    conditions: [
      {
        share: ONE_SIXTH,
        when: "Paternal grandmother gets 1/6 when both mother and father are absent",
        predicate: (ctx: HeirContext) => !ctx.hasMother && !ctx.hasFather,
      },
    ],
    quranRef: '4:11',
    hadithRef: 'muwatta-grandmother',
  },

  // 11. Maternal Grandmother
  {
    heirType: 'maternal_grandmother',
    shareType: 'fard',
    conditions: [
      {
        share: ONE_SIXTH,
        when: 'Maternal grandmother gets 1/6 when mother is absent',
        predicate: (ctx: HeirContext) => !ctx.hasMother,
      },
    ],
    quranRef: '4:11',
    hadithRef: 'muwatta-grandmother',
  },

  // 12. Full Brother
  {
    heirType: 'brother_full',
    shareType: 'asaba',
    conditions: [
      {
        share: ZERO, // Asaba bi-nafsihi
        when: 'Full brother inherits as Asaba (residuary) in Kalalah (no children, no father, no grandfather)',
        predicate: (ctx: HeirContext) => ctx.isKalalah,
      },
    ],
    quranRef: '4:176',
    hadithRef: 'bukhari-6732',
  },

  // 13. Consanguine Brother (paternal half-brother)
  {
    heirType: 'brother_consanguine',
    shareType: 'asaba',
    conditions: [
      {
        share: ZERO, // Asaba bi-nafsihi
        when: 'Consanguine brother inherits as Asaba when not blocked by full brother',
        predicate: (ctx: HeirContext) => ctx.isKalalah,
      },
    ],
    quranRef: '4:176',
    hadithRef: 'bukhari-6732',
  },

  // 14. Uterine Brother (maternal half-brother)
  {
    heirType: 'brother_uterine',
    shareType: 'fard',
    conditions: [
      {
        share: ONE_SIXTH,
        when: 'One uterine brother in Kalalah',
        predicate: (ctx: HeirContext) =>
          ctx.isKalalah && ctx.brothersUterine === 1 && ctx.sistersUterine === 0,
      },
      {
        share: ONE_THIRD, // Shared equally among all uterine siblings
        when: 'Two or more uterine siblings in Kalalah (shared equally)',
        predicate: (ctx: HeirContext) =>
          ctx.isKalalah && (ctx.brothersUterine + ctx.sistersUterine) >= 2,
      },
    ],
    quranRef: '4:12',
  },

  // 15. Full Sister
  {
    heirType: 'sister_full',
    shareType: 'fard_and_asaba',
    conditions: [
      {
        share: ZERO, // Asaba bi-ghayrihi with full brother
        when: 'With full brother: becomes Asaba bi-ghayrihi (male gets 2x female)',
        predicate: (ctx: HeirContext) => ctx.brothersFull > 0,
      },
      {
        share: ZERO, // Asaba ma'a ghayrihi with daughters
        when: "With daughters only (no sons): full sister becomes Asaba ma'a ghayrihi",
        predicate: (ctx: HeirContext) =>
          ctx.sons === 0 && ctx.sonsOfSon === 0 && (ctx.daughters > 0 || ctx.daughtersOfSon > 0),
      },
      {
        share: HALF,
        when: 'One full sister, no children, no father, no grandfather, no full brother',
        predicate: (ctx: HeirContext) =>
          ctx.sistersFull === 1 && ctx.isKalalah && ctx.brothersFull === 0,
      },
      {
        share: TWO_THIRDS,
        when: 'Two+ full sisters, no children, no father, no grandfather, no full brother',
        predicate: (ctx: HeirContext) =>
          ctx.sistersFull >= 2 && ctx.isKalalah && ctx.brothersFull === 0,
      },
    ],
    quranRef: '4:176',
  },

  // 16. Consanguine Sister (paternal half-sister)
  {
    heirType: 'sister_consanguine',
    shareType: 'fard_and_asaba',
    conditions: [
      {
        share: ZERO, // Asaba bi-ghayrihi with consanguine brother
        when: 'With consanguine brother: becomes Asaba bi-ghayrihi (male gets 2x female)',
        predicate: (ctx: HeirContext) => ctx.brothersConsanguine > 0,
      },
      {
        share: ONE_SIXTH, // Completing 2/3 with one full sister
        when: 'With one full sister (completing 2/3 together)',
        predicate: (ctx: HeirContext) =>
          ctx.sistersFull === 1 && ctx.brothersFull === 0 && ctx.brothersConsanguine === 0 && ctx.isKalalah,
      },
      {
        share: HALF,
        when: 'One consanguine sister, no children, no father, no full siblings',
        predicate: (ctx: HeirContext) =>
          ctx.sistersConsanguine === 1 &&
          ctx.isKalalah &&
          ctx.brothersFull === 0 &&
          ctx.sistersFull === 0 &&
          ctx.brothersConsanguine === 0,
      },
      {
        share: TWO_THIRDS,
        when: 'Two+ consanguine sisters, same conditions',
        predicate: (ctx: HeirContext) =>
          ctx.sistersConsanguine >= 2 &&
          ctx.isKalalah &&
          ctx.brothersFull === 0 &&
          ctx.sistersFull === 0 &&
          ctx.brothersConsanguine === 0,
      },
    ],
    quranRef: '4:176',
  },

  // 17. Uterine Sister (maternal half-sister)
  {
    heirType: 'sister_uterine',
    shareType: 'fard',
    conditions: [
      {
        share: ONE_SIXTH,
        when: 'One uterine sister in Kalalah',
        predicate: (ctx: HeirContext) =>
          ctx.isKalalah && ctx.sistersUterine === 1 && ctx.brothersUterine === 0,
      },
      {
        share: ONE_THIRD, // Shared equally among all uterine siblings
        when: 'Two or more uterine siblings in Kalalah (shared equally)',
        predicate: (ctx: HeirContext) =>
          ctx.isKalalah && (ctx.brothersUterine + ctx.sistersUterine) >= 2,
      },
    ],
    quranRef: '4:12',
  },
]

/**
 * Get the FaraidRule for a specific heir type.
 */
export function getRuleForHeir(heirType: string): FaraidRule | undefined {
  return FARAID_RULES.find((r) => r.heirType === heirType)
}
