import { useState } from 'react'
import type { HeirType } from '@/core/faraid/types'
import type { DivisionGroup } from '@/core/land/division'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

interface ParcelRowProps {
  propertyId: string
  propertyName: string
  propertyValue: number
  currentGroup: HeirType
  allGroups: DivisionGroup[]
  onMove: (
    propertyId: string,
    fromGroup: HeirType,
    toGroup: HeirType,
  ) => void
}

export function ParcelRow({
  propertyId,
  propertyName,
  propertyValue,
  currentGroup,
  allGroups,
  onMove,
}: ParcelRowProps) {
  const [selectValue, setSelectValue] = useState('')

  const otherGroups = allGroups.filter((g) => g.heirType !== currentGroup)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetGroup = e.target.value as HeirType
    if (targetGroup) {
      onMove(propertyId, currentGroup, targetGroup)
      setSelectValue('')
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
        {propertyName}
      </span>
      <span className="shrink-0 text-sm font-medium text-gray-900">
        {bdtFormatter.format(propertyValue)}
      </span>
      {otherGroups.length > 0 && (
        <select
          value={selectValue}
          onChange={handleChange}
          className="shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
          aria-label={`Move ${propertyName} to another group`}
        >
          <option value="">Move to...</option>
          {otherGroups.map((g) => (
            <option key={g.heirType} value={g.heirType}>
              {HEIR_TYPE_LABELS[g.heirType]}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
