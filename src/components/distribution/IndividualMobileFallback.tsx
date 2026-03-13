import { useState } from 'react'
import type { DistributionItem } from '@/core/distribution/types'
import type { IndividualColumn } from '@/core/distribution/individual-types'

interface IndividualMobileFallbackProps {
  item: DistributionItem
  currentIndividualId: string
  allIndividuals: IndividualColumn[]
  onMove: (itemId: string, fromId: string, toId: string) => void
}

export function IndividualMobileFallback({
  item,
  currentIndividualId,
  allIndividuals,
  onMove,
}: IndividualMobileFallbackProps) {
  const [selectValue, setSelectValue] = useState('')

  const otherIndividuals = allIndividuals.filter(
    (ind) => ind.id !== currentIndividualId,
  )

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value
    if (targetId) {
      onMove(item.id, currentIndividualId, targetId)
      setSelectValue('')
    }
  }

  if (otherIndividuals.length === 0) return null

  return (
    <select
      value={selectValue}
      onChange={handleChange}
      className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
      aria-label={`Move ${item.label} to another heir`}
    >
      <option value="">Move to...</option>
      {otherIndividuals.map((ind) => (
        <option key={ind.id} value={ind.id}>
          {ind.customName || ind.displayName}
        </option>
      ))}
    </select>
  )
}
