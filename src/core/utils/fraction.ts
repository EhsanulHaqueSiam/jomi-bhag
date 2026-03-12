import Fraction from 'fraction.js'

// The 6 Quranic prescribed shares
export const HALF = new Fraction(1, 2)
export const QUARTER = new Fraction(1, 4)
export const EIGHTH = new Fraction(1, 8)
export const TWO_THIRDS = new Fraction(2, 3)
export const ONE_THIRD = new Fraction(1, 3)
export const ONE_SIXTH = new Fraction(1, 6)

// Identity values
export const ZERO = new Fraction(0)
export const ONE = new Fraction(1)

/**
 * Sum an array of Fraction values.
 * Returns ZERO for empty arrays.
 */
export function sumFractions(fractions: Fraction[]): Fraction {
  return fractions.reduce((acc, f) => acc.add(f), new Fraction(0))
}

/**
 * Check if a fraction exceeds 1 (Awl condition).
 */
export function exceedsOne(total: Fraction): boolean {
  return total.compare(new Fraction(1)) > 0
}

/**
 * Check if a fraction is less than 1 (Radd condition).
 */
export function lessThanOne(total: Fraction): boolean {
  return total.compare(new Fraction(1)) < 0
}

/**
 * Format a fraction for display as "n/d (XX.XX%)".
 * Example: formatShare(1/3) -> "1/3 (33.33%)"
 */
export function formatShare(f: Fraction): string {
  const fractionStr = f.toFraction()
  const percentage = (f.valueOf() * 100).toFixed(2)
  return `${fractionStr} (${percentage}%)`
}

// Re-export Fraction for convenience
export { Fraction }
