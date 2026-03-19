import { getEquilibriumStatus } from '@/core/distribution/algorithm'

/** Border-top color class by equilibrium status. */
const STATUS_BORDER_COLORS: Record<string, string> = {
  balanced: 'border-t-emerald-500',
  close: 'border-t-amber-400',
  off: 'border-t-red-500',
}

export function getColumnBorderColor(
  assignedValue: number,
  targetValue: number,
): string {
  const result = getEquilibriumStatus(assignedValue, targetValue)
  return STATUS_BORDER_COLORS[result.status] ?? STATUS_BORDER_COLORS.off
}
