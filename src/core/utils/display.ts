import type Fraction from 'fraction.js'
import type { HeirType } from '@/core/faraid/types'

/**
 * Format a Fraction as a readable string like "1/3" or "7/24".
 */
export function fractionToString(f: Fraction): string {
  return f.toFraction()
}

/**
 * Format a Fraction as a percentage string like "33.3%".
 */
export function fractionToPercent(f: Fraction, decimals = 1): string {
  return (f.valueOf() * 100).toFixed(decimals) + '%'
}

/**
 * Format a Fraction as a BDT currency amount using Indian/Bangladeshi grouping (lakh/crore).
 * Returns empty string if totalEstate is 0.
 */
export function fractionToBDT(f: Fraction, totalEstate: number): string {
  if (totalEstate === 0) return ''
  const amount = Math.round(f.valueOf() * totalEstate)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Display names for all 17 heir types. */
export const HEIR_TYPE_LABELS: Record<HeirType, string> = {
  husband: 'Husband',
  wife: 'Wife',
  son: 'Son',
  daughter: 'Daughter',
  son_of_son: "Son's Son",
  daughter_of_son: "Son's Daughter",
  father: 'Father',
  paternal_grandfather: 'Paternal Grandfather',
  mother: 'Mother',
  paternal_grandmother: 'Paternal Grandmother',
  maternal_grandmother: 'Maternal Grandmother',
  brother_full: 'Full Brother',
  brother_consanguine: 'Paternal Brother',
  brother_uterine: 'Maternal Brother',
  sister_full: 'Full Sister',
  sister_consanguine: 'Paternal Sister',
  sister_uterine: 'Maternal Sister',
}

/** Display labels for share types. */
export const SHARE_TYPE_LABELS: Record<string, string> = {
  fard: 'Fixed Share (Fard)',
  asaba: 'Residuary (Asaba)',
  radd_adjusted: 'Adjusted (Radd)',
  blocked: 'Blocked',
}
