import type { LandUnit, Division } from '@/core/land/types'

/** 1 Decimal = 435.6 sqft (fixed nationwide) */
const SQFT_PER_DECIMAL = 435.6

/** Division-keyed katha values (sqft per katha) */
export const KATHA_SQFT: Record<Division, number> = {
  dhaka: 720,
  chittagong: 720,
  sylhet: 720,
  barisal: 720,
  mymensingh: 720,
  rajshahi: 1620,
  khulna: 1620,
  rangpur: 1620,
}

/** 1 Bigha = 20 Katha in all regions */
const KATHA_PER_BIGHA = 20

/** Division label for display in conversion labels */
function divisionLabel(division: Division): string {
  return division.charAt(0).toUpperCase() + division.slice(1)
}

/** Convert from a given unit to square feet */
export function toSqft(value: number, unit: LandUnit, division: Division): number {
  switch (unit) {
    case 'sqft':
      return value
    case 'decimal':
      return value * SQFT_PER_DECIMAL
    case 'katha':
      return value * KATHA_SQFT[division]
    case 'bigha':
      return value * KATHA_SQFT[division] * KATHA_PER_BIGHA
  }
}

/** Convert from square feet to a given unit */
export function fromSqft(sqft: number, unit: LandUnit, division: Division): number {
  switch (unit) {
    case 'sqft':
      return sqft
    case 'decimal':
      return sqft / SQFT_PER_DECIMAL
    case 'katha':
      return sqft / KATHA_SQFT[division]
    case 'bigha':
      return sqft / (KATHA_SQFT[division] * KATHA_PER_BIGHA)
  }
}

/** Get all 4 unit conversions for display, rounded to 2 decimal places */
export function getConversions(
  sqft: number,
  division: Division,
): { unit: LandUnit; value: number; label: string }[] {
  const round2 = (n: number) => Math.round(n * 100) / 100
  return [
    { unit: 'decimal', value: round2(fromSqft(sqft, 'decimal', division)), label: 'Decimal' },
    {
      unit: 'katha',
      value: round2(fromSqft(sqft, 'katha', division)),
      label: `Katha (${divisionLabel(division)})`,
    },
    { unit: 'sqft', value: round2(sqft), label: 'Square Feet' },
    {
      unit: 'bigha',
      value: round2(fromSqft(sqft, 'bigha', division)),
      label: `Bigha (${divisionLabel(division)})`,
    },
  ]
}
