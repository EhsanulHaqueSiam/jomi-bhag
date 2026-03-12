import type { FaraidInput } from '@/core/faraid/types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate the structural correctness of Faraid input.
 *
 * This checks for structurally valid inputs only:
 * - All counts must be non-negative integers
 * - Maximum counts for specific heirs (1 husband, up to 4 wives, 1 father, 1 mother)
 * - Deceased gender consistent with spouse type
 * - At least one heir with count > 0 present
 *
 * Does NOT check Islamic validity (blocking rules, etc.) -- that is the engine's job.
 */
export function validateHeirInput(input: FaraidInput): ValidationResult {
  const errors: string[] = []

  // Check that at least one heir with count > 0 exists
  const hasActiveHeirs = input.heirs.some((h) => h.count > 0)
  if (input.heirs.length === 0 || !hasActiveHeirs) {
    errors.push('At least one heir must be present with a count greater than zero.')
  }

  for (const heir of input.heirs) {
    // Check for negative counts
    if (heir.count < 0) {
      errors.push(`Count for ${heir.type} cannot be negative (got ${heir.count}).`)
    }

    // Check for non-integer counts
    if (!Number.isInteger(heir.count)) {
      errors.push(
        `Count for ${heir.type} must be a whole integer (got ${heir.count}).`
      )
    }

    // Check maximum counts for specific heir types
    if (heir.type === 'husband' && heir.count > 1) {
      errors.push(`A deceased can have at most 1 husband (got ${heir.count}).`)
    }

    if (heir.type === 'wife' && heir.count > 4) {
      errors.push(
        `A deceased can have at most 4 wives in Islam (got ${heir.count}).`
      )
    }

    if (heir.type === 'father' && heir.count > 1) {
      errors.push(`A deceased can have at most 1 father (got ${heir.count}).`)
    }

    if (heir.type === 'mother' && heir.count > 1) {
      errors.push(`A deceased can have at most 1 mother (got ${heir.count}).`)
    }

    if (heir.type === 'paternal_grandfather' && heir.count > 1) {
      errors.push(
        `A deceased can have at most 1 paternal grandfather (got ${heir.count}).`
      )
    }

    if (heir.type === 'paternal_grandmother' && heir.count > 1) {
      errors.push(
        `A deceased can have at most 1 paternal grandmother (got ${heir.count}).`
      )
    }

    if (heir.type === 'maternal_grandmother' && heir.count > 1) {
      errors.push(
        `A deceased can have at most 1 maternal grandmother (got ${heir.count}).`
      )
    }

    // Check gender-spouse consistency
    if (heir.type === 'husband' && input.deceasedGender === 'male') {
      errors.push(
        'A male deceased cannot have a husband. Check deceased gender or heir type.'
      )
    }

    if (heir.type === 'wife' && input.deceasedGender === 'female') {
      errors.push(
        'A female deceased cannot have a wife. Check deceased gender or heir type.'
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
