import { useState } from 'react'
import type { HeirType } from '@/core/faraid/types'
import type { DistributionItem, DistributionGroup } from '@/core/distribution/types'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'

interface MobileFallbackProps {
  item: DistributionItem
  currentGroupHeirType: HeirType
  allGroups: DistributionGroup[]
  onMove: (itemId: string, from: HeirType, to: HeirType) => void
}

export function MobileFallback({
  item,
  currentGroupHeirType,
  allGroups,
  onMove,
}: MobileFallbackProps) {
  const [selectValue, setSelectValue] = useState('')

  const otherGroups = allGroups.filter(
    (g) => g.heirType !== currentGroupHeirType,
  )

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetGroup = e.target.value as HeirType
    if (targetGroup) {
      onMove(item.id, currentGroupHeirType, targetGroup)
      setSelectValue('')
    }
  }

  if (otherGroups.length === 0) return null

  return (
    <select
      value={selectValue}
      onChange={handleChange}
      className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
      aria-label={`Move ${item.label} to another group`}
    >
      <option value="">Move to...</option>
      {otherGroups.map((g) => (
        <option key={g.heirType} value={g.heirType}>
          {HEIR_TYPE_LABELS[g.heirType]}
        </option>
      ))}
    </select>
  )
}
