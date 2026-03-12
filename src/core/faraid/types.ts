import type Fraction from 'fraction.js'

/**
 * All heir types in the Hanafi Faraid system.
 * Covers the 12 Dhawul Furud plus grandchildren and grandparents.
 */
export type HeirType =
  | 'husband'
  | 'wife'
  | 'son'
  | 'daughter'
  | 'son_of_son'
  | 'daughter_of_son'
  | 'father'
  | 'paternal_grandfather'
  | 'mother'
  | 'paternal_grandmother'
  | 'maternal_grandmother'
  | 'brother_full'
  | 'brother_consanguine'
  | 'brother_uterine'
  | 'sister_full'
  | 'sister_consanguine'
  | 'sister_uterine'

/** Complete list of all HeirType values for iteration. */
export const ALL_HEIR_TYPES: HeirType[] = [
  'husband',
  'wife',
  'son',
  'daughter',
  'son_of_son',
  'daughter_of_son',
  'father',
  'paternal_grandfather',
  'mother',
  'paternal_grandmother',
  'maternal_grandmother',
  'brother_full',
  'brother_consanguine',
  'brother_uterine',
  'sister_full',
  'sister_consanguine',
  'sister_uterine',
]

/** How the user specifies heirs -- type and count. */
export interface HeirInput {
  type: HeirType
  count: number
}

/** A predeceased child of the deceased, used for MFLO Section 4. */
export interface PredeceasedChild {
  gender: 'male' | 'female'
  livingChildren: HeirInput[]
}

/** Engine input -- deceased info and heir list. */
export interface FaraidInput {
  deceasedGender: 'male' | 'female'
  heirs: HeirInput[]
  mfloEnabled?: boolean
  /** MFLO Section 4: predeceased children whose living children inherit per stirpes. */
  predeceasedChildren?: PredeceasedChild[]
}

/** Per-heir output with share details and references. */
export interface ShareResult {
  heirType: HeirType
  count: number
  sharePerHeir: Fraction
  totalShare: Fraction
  shareType: 'fard' | 'asaba' | 'radd_adjusted' | 'blocked'
  quranRef?: string
  hadithRef?: string
  explanation: string
  notes?: string[]
}

/** Adjustment mechanism type. */
export type AdjustmentType = 'none' | 'awl' | 'radd'

/** A single step in the calculation trace. */
export interface CalculationStep {
  step: number
  description: string
  detail: string
}

/** An Islamic textual reference (Quran or Hadith). */
export interface IslamicReference {
  type: 'quran' | 'hadith'
  reference: string
  arabicText: string
  englishText: string
  appliesTo: HeirType[]
}

/** Complete engine output. */
export interface FaraidOutput {
  shares: ShareResult[]
  adjustment: AdjustmentType
  totalBeforeAdjustment: Fraction
  blockedHeirs: {
    heirType: HeirType
    blockedBy: HeirType
    rule: string
  }[]
  specialCases: string[]
  mfloApplied: boolean
  steps: CalculationStep[]
  references: IslamicReference[]
}

/** A conditional share assignment -- share value plus when it applies. */
export interface ShareCondition {
  share: Fraction
  when: string
  predicate: (ctx: HeirContext) => boolean
}

/**
 * Context derived from FaraidInput for predicate evaluation.
 * Provides boolean flags and counts for all heir types.
 */
export interface HeirContext {
  deceasedGender: 'male' | 'female'
  // Counts
  husbands: number
  wives: number
  sons: number
  daughters: number
  sonsOfSon: number
  daughtersOfSon: number
  fathers: number
  paternalGrandfathers: number
  mothers: number
  paternalGrandmothers: number
  maternalGrandmothers: number
  brothersFull: number
  brothersConsanguine: number
  brothersUterine: number
  sistersFull: number
  sistersConsanguine: number
  sistersUterine: number
  // Derived flags
  hasChildren: boolean
  hasGrandchildren: boolean
  hasSons: boolean
  hasDaughters: boolean
  hasFather: boolean
  hasMother: boolean
  hasGrandfather: boolean
  hasSiblings: boolean
  siblingCount: number
  isKalalah: boolean // no children, no father, no grandfather
}

/** A Faraid rule -- maps an heir type to its conditional share allocations. */
export interface FaraidRule {
  heirType: HeirType
  shareType: 'fard' | 'asaba' | 'fard_and_asaba'
  conditions: ShareCondition[]
  quranRef: string
  hadithRef?: string
}

/** A total or partial blocking rule. */
export interface BlockingRule {
  blocker: HeirType | HeirType[]
  blocked: HeirType | HeirType[]
  type: 'total' | 'partial'
  condition?: string
  note?: string
}

/** The three types of Asaba (residuary) heirs. */
export type AsabaType = 'bi_nafsihi' | 'bi_ghayrihi' | 'ma_a_ghayrihi'
