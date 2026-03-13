import type { ShareResult } from '@/core/faraid/types'
import { fractionToPercent, fractionToBDT, HEIR_TYPE_LABELS } from '@/core/utils/display'

export interface ChartDatum {
  name: string
  value: number
  bdtValue: number
  fraction: string
  percentage: string
  bdtAmount: string
  fill: string
}

/**
 * 8 hex colors from Tailwind emerald scale for SVG compatibility.
 * Cycles if more than 8 active heir types (unlikely but safe).
 */
export const EMERALD_COLORS = [
  '#10b981', // emerald-500
  '#059669', // emerald-600
  '#047857', // emerald-700
  '#34d399', // emerald-400
  '#065f46', // emerald-800
  '#6ee7b7', // emerald-300
  '#0d9488', // teal-600
  '#14b8a6', // teal-500
]

/**
 * Transform active ShareResult[] into Recharts-compatible data.
 * Used by both pie and bar charts.
 */
export function buildChartData(
  activeShares: ShareResult[],
  totalEstateValue: number,
): ChartDatum[] {
  return activeShares.map((share, i) => {
    const label = HEIR_TYPE_LABELS[share.heirType]
    const name = share.count > 1 ? `${label} x${share.count}` : label
    return {
      name,
      value: share.totalShare.valueOf() * 100,
      bdtValue: Math.round(share.totalShare.valueOf() * totalEstateValue),
      fraction: share.totalShare.toFraction(),
      percentage: fractionToPercent(share.totalShare),
      bdtAmount: fractionToBDT(share.totalShare, totalEstateValue),
      fill: EMERALD_COLORS[i % EMERALD_COLORS.length],
    }
  })
}
