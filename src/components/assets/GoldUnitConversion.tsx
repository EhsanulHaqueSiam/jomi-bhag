import type { GoldUnit } from '@/core/assets/types'
import { GOLD_UNIT_CONVERSIONS } from '@/data/movable-asset-data'

interface GoldUnitConversionProps {
  weight: number
  currentUnit: GoldUnit
}

function toGrams(weight: number, unit: GoldUnit): number {
  switch (unit) {
    case 'vori':
      return weight * GOLD_UNIT_CONVERSIONS.vori_to_gram
    case 'tola':
      return weight * GOLD_UNIT_CONVERSIONS.tola_to_gram
    case 'gram':
      return weight
  }
}

export function GoldUnitConversion({
  weight,
  currentUnit,
}: GoldUnitConversionProps) {
  if (weight <= 0) return null

  const grams = toGrams(weight, currentUnit)
  const vori = grams * GOLD_UNIT_CONVERSIONS.gram_to_vori
  const tola = grams * GOLD_UNIT_CONVERSIONS.gram_to_tola

  const conversions: { value: number; label: string }[] = []

  if (currentUnit !== 'gram') {
    conversions.push({ value: grams, label: 'g' })
  }
  if (currentUnit !== 'vori') {
    conversions.push({ value: vori, label: 'vori' })
  }
  if (currentUnit !== 'tola') {
    conversions.push({ value: tola, label: 'tola' })
  }

  return (
    <p className="mt-1 text-xs text-gray-500">
      ={' '}
      {conversions
        .map((c) => `${c.value.toFixed(2)} ${c.label}`)
        .join(' = ')}
    </p>
  )
}
