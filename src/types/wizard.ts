import type { FaraidOutput, HeirType } from '@/core/faraid/types'
import type { Property } from '@/core/land/types'
import type { MovableAsset } from '@/core/assets/types'

/**
 * Relationship of the user to the deceased.
 * Drives deceased gender derivation and auto-include logic.
 */
export type RelationshipType =
  | 'father'
  | 'mother'
  | 'husband'
  | 'wife'
  | 'brother'
  | 'sister'
  | 'other'

/** A single wizard step definition. */
export interface WizardStep {
  number: number
  label: string
  shortLabel: string
}

/** The 4 wizard steps in order. */
export const WIZARD_STEPS: WizardStep[] = [
  { number: 1, label: 'Relationship', shortLabel: 'Relationship' },
  { number: 2, label: 'Family Members', shortLabel: 'Family' },
  { number: 3, label: 'Estate Inventory', shortLabel: 'Estate' },
  { number: 4, label: 'Results', shortLabel: 'Results' },
]

/**
 * Derive the deceased's gender from the user's relationship to the deceased.
 *
 * The relationship label represents the user's role (heir type):
 * - "husband" means the user is the husband (male), so deceased is female
 * - "wife" means the user is the wife (female), so deceased is male
 * - "father"/"brother" = deceased is male
 * - "mother"/"sister" = deceased is female
 * - "other" = must be selected explicitly
 */
export function deriveDeceasedGender(
  relationship: RelationshipType,
): 'male' | 'female' | null {
  switch (relationship) {
    case 'father':
    case 'brother':
      return 'male'
    case 'mother':
    case 'sister':
      return 'female'
    case 'husband':
      return 'female' // user is male (the husband), deceased is female
    case 'wife':
      return 'male' // user is female (the wife), deceased is male
    case 'other':
      return null
  }
}

/**
 * Derive the user's own gender from the relationship, if unambiguous.
 *
 * - "my Husband": user is male (per plan spec)
 * - "my Wife": user is female
 * - "my Father"/"my Mother": ambiguous (could be son or daughter)
 * - "my Brother"/"my Sister": ambiguous gender (could be male or female sibling)
 * - "other": unknown
 */
export function deriveUserGender(
  relationship: RelationshipType,
): 'male' | 'female' | null {
  switch (relationship) {
    case 'husband':
      return 'male'
    case 'wife':
      return 'female'
    default:
      return null
  }
}

/**
 * Get the list of heirs that should be auto-included based on the
 * user's relationship to the deceased.
 *
 * Auto-include logic:
 * - father/mother: user is a child (son if male, daughter if female)
 * - father + motherAlive: also add wife (user's mother)
 * - husband: user IS the husband heir
 * - wife: user IS the wife heir
 * - brother/sister: user is a full sibling
 * - other: no auto-includes
 */
export function getAutoIncludes(
  relationship: RelationshipType,
  userGender: 'male' | 'female' | null,
  motherAlive: boolean | null,
): { type: HeirType; count: number }[] {
  const autoHeirs: { type: HeirType; count: number }[] = []

  switch (relationship) {
    case 'father':
      if (userGender === 'male') autoHeirs.push({ type: 'son', count: 1 })
      else if (userGender === 'female')
        autoHeirs.push({ type: 'daughter', count: 1 })
      if (motherAlive) autoHeirs.push({ type: 'wife', count: 1 })
      break
    case 'mother':
      if (userGender === 'male') autoHeirs.push({ type: 'son', count: 1 })
      else if (userGender === 'female')
        autoHeirs.push({ type: 'daughter', count: 1 })
      break
    case 'husband':
      autoHeirs.push({ type: 'husband', count: 1 })
      break
    case 'wife':
      autoHeirs.push({ type: 'wife', count: 1 })
      break
    case 'brother':
      autoHeirs.push({ type: 'brother_full', count: 1 })
      break
    case 'sister':
      autoHeirs.push({ type: 'sister_full', count: 1 })
      break
    case 'other':
      break
  }

  return autoHeirs
}

/** Full wizard state shape. */
export interface WizardState {
  // Navigation
  currentStep: number
  completedSteps: number[]

  // Step 1
  relationship: RelationshipType | null
  deceasedGender: 'male' | 'female' | null
  userGender: 'male' | 'female' | null
  mfloEnabled: boolean
  motherAlive: boolean | null

  // Auto-included heirs (tracked separately for clean replacement)
  autoIncludes: { type: HeirType; count: number }[]

  // Step 2 (Family Members: spouse + children + siblings)
  wifeCount: number
  husbandPresent: boolean
  sonCount: number
  daughterCount: number

  // Step 2 (Siblings section)
  siblingTypeExpanded: boolean
  brotherFullCount: number
  brotherConsanguineCount: number
  brotherUterineCount: number
  sisterFullCount: number
  sisterConsanguineCount: number
  sisterUterineCount: number

  // Step 3 (Properties)
  properties: Property[]
  expandedPropertyId: string | null

  // Step 3 (Movable Assets)
  movableAssets: MovableAsset[]
  expandedAssetId: string | null

  // Step 4 (Results)
  results: FaraidOutput | null
  totalEstateValue: number
  viewMode: 'simple' | 'detailed'
  hasToggledMode: boolean
}
