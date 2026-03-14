import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { HeirType } from '@/core/faraid/types'
import type { DistributionItem } from '@/core/distribution/types'
import type { IndividualColumn as IndividualColumnType } from '@/core/distribution/individual-types'
import type { Property } from '@/core/land/types'
import { HeirIcon, feminineHeirs } from '@/components/ui/HeirIcon'
import { EquilibriumBar, getColumnBorderColor } from './EquilibriumBar'
import { AssetCard } from './AssetCard'
import { InlineRename } from './InlineRename'
import { IndividualMobileFallback } from './IndividualMobileFallback'
import { ParcelSplitDialog } from './ParcelSplitDialog'

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Tailwind accent colors per heir type for section visual grouping. */
const HEIR_TYPE_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  son: { border: 'border-l-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  daughter: { border: 'border-l-rose-300', bg: 'bg-rose-50', text: 'text-rose-700' },
  wife: { border: 'border-l-blue-300', bg: 'bg-blue-50', text: 'text-blue-700' },
  husband: { border: 'border-l-blue-300', bg: 'bg-blue-50', text: 'text-blue-700' },
  father: { border: 'border-l-teal-300', bg: 'bg-teal-50', text: 'text-teal-700' },
  mother: { border: 'border-l-teal-300', bg: 'bg-teal-50', text: 'text-teal-700' },
  paternal_grandfather: { border: 'border-l-teal-300', bg: 'bg-teal-50', text: 'text-teal-700' },
  paternal_grandmother: { border: 'border-l-teal-300', bg: 'bg-teal-50', text: 'text-teal-700' },
  maternal_grandmother: { border: 'border-l-teal-300', bg: 'bg-teal-50', text: 'text-teal-700' },
  son_of_son: { border: 'border-l-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  daughter_of_son: { border: 'border-l-rose-300', bg: 'bg-rose-50', text: 'text-rose-700' },
  brother_full: { border: 'border-l-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' },
  brother_consanguine: { border: 'border-l-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' },
  brother_uterine: { border: 'border-l-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' },
  sister_full: { border: 'border-l-purple-300', bg: 'bg-purple-50', text: 'text-purple-700' },
  sister_consanguine: { border: 'border-l-purple-300', bg: 'bg-purple-50', text: 'text-purple-700' },
  sister_uterine: { border: 'border-l-purple-300', bg: 'bg-purple-50', text: 'text-purple-700' },
}

function getTypeColors(heirType: HeirType) {
  return HEIR_TYPE_COLORS[heirType] ?? { border: 'border-l-gray-300', bg: 'bg-gray-50', text: 'text-gray-700' }
}

export { HEIR_TYPE_COLORS }

interface IndividualColumnProps {
  individual: IndividualColumnType
  items: DistributionItem[]
  allIndividuals: IndividualColumnType[]
  customName: string | null
  onMoveItem: (itemId: string, fromId: string, toId: string) => void
  onRename: (individualId: string, name: string) => void
  onSplit: (itemId: string, splits: { areaSqft: number }[], totalAreaSqft: number) => void
  onMerge: (parentId: string) => void
  properties: Property[]
  splitOrigins: Record<string, DistributionItem>
}

export const IndividualColumnComponent = React.memo(function IndividualColumnComponent({
  individual,
  items,
  allIndividuals,
  customName,
  onMoveItem,
  onRename,
  onSplit,
  onMerge,
  properties,
  splitOrigins,
}: IndividualColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: individual.id,
  })

  const [splitItem, setSplitItem] = useState<DistributionItem | null>(null)

  const isFeminine = feminineHeirs.has(individual.heirType)
  const typeColors = getTypeColors(individual.heirType)
  const borderTopColor = getColumnBorderColor(individual.assignedValue, individual.targetValue)

  const displayName = customName || individual.displayName
  const subtitle = customName ? individual.displayName : undefined

  // Check if an item is a split sub-parcel that can be merged
  const canMerge = (item: DistributionItem): string | null => {
    for (const [parentId, originalItem] of Object.entries(splitOrigins)) {
      // Sub-items have labels starting with original label
      if (item.label.includes('(') && item.type === 'property') {
        // Check if this looks like a split sub-parcel
        if (originalItem && item.label.startsWith(originalItem.label + ' (')) {
          return parentId
        }
      }
    }
    return null
  }

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-col rounded-xl border border-t-4 border-l-4 bg-white shadow-sm transition-colors',
        borderTopColor,
        typeColors.border,
        isOver ? 'border-emerald-400 bg-emerald-50/30' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div className="space-y-2 px-4 pt-4 pb-3">
        <EquilibriumBar
          assignedValue={individual.assignedValue}
          targetValue={individual.targetValue}
        />
        <div className="flex items-center gap-2">
          <HeirIcon isFeminine={isFeminine} />
          <div className="min-w-0 flex-1">
            <InlineRename
              value={displayName}
              subtitle={subtitle}
              onSave={(name) => onRename(individual.id, name)}
            />
            <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
              <span>{individual.sharePerHeir}</span>
              <span>Target: {bdtFormatter.format(individual.targetValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body: scrollable list of asset cards */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4 max-h-[400px] lg:max-h-[600px]">
        {items.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
            Drag items here
          </div>
        ) : (
          items.map((item) => {
            const mergeParentId = canMerge(item)

            return (
              <div key={item.id} className="space-y-1">
                <AssetCard
                  item={item}
                  groupId={individual.id}
                />
                {/* Split button for property items (not already split) */}
                {item.type === 'property' && !mergeParentId && (
                  <button
                    type="button"
                    onClick={() => setSplitItem(item)}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex w-full items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Split
                  </button>
                )}
                {/* Merge button for split sub-parcels */}
                {mergeParentId && (
                  <button
                    type="button"
                    onClick={() => onMerge(mergeParentId)}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex w-full items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Merge
                  </button>
                )}
                <IndividualMobileFallback
                  item={item}
                  currentIndividualId={individual.id}
                  allIndividuals={allIndividuals}
                  onMove={onMoveItem}
                />
              </div>
            )
          })
        )}
      </div>

      {/* Parcel Split Dialog */}
      {splitItem && (
        <ParcelSplitDialog
          item={splitItem}
          originalAreaSqft={
            properties.find((p) => p.id === splitItem.id)?.landAreaSqft ?? 0
          }
          onSplit={(splits) => {
            const prop = properties.find((p) => p.id === splitItem.id)
            onSplit(splitItem.id, splits, prop?.landAreaSqft ?? 0)
            setSplitItem(null)
          }}
          onClose={() => setSplitItem(null)}
        />
      )}
    </div>
  )
})
