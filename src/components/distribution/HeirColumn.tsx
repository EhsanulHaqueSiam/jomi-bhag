import { useDroppable } from '@dnd-kit/core'
import type { DistributionGroup, DistributionItem } from '@/core/distribution/types'
import type { Property } from '@/core/land/types'
import type { ShareResult, HeirType } from '@/core/faraid/types'
import type { LandSettlement } from '@/core/land/settlement-types'
import { EquilibriumBar, getColumnBorderColor } from './EquilibriumBar'
import { AssetCard } from './AssetCard'
import { MobileFallback } from './MobileFallback'

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

interface HeirColumnProps {
  group: DistributionGroup
  items: DistributionItem[]
  allGroups: DistributionGroup[]
  onMoveItem: (itemId: string, from: HeirType, to: HeirType) => void
  properties: Property[]
  shares: ShareResult[]
  onSettlementUpdate: (propertyId: string, settlement: LandSettlement | null) => void
}

export function HeirColumn({
  group,
  items,
  allGroups,
  onMoveItem,
  properties,
  shares,
  onSettlementUpdate,
}: HeirColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: group.heirType,
  })

  const borderTopColor = getColumnBorderColor(
    group.assignedValue,
    group.targetValue,
  )

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-col rounded-xl border border-t-4 bg-white shadow-sm transition-colors',
        borderTopColor,
        isOver ? 'border-emerald-400 bg-emerald-50/30' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div className="space-y-2 px-4 pt-4 pb-3">
        <EquilibriumBar
          assignedValue={group.assignedValue}
          targetValue={group.targetValue}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">
              {group.label}
            </h3>
            {group.count > 1 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                x{group.count}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            Target: {bdtFormatter.format(group.targetValue)}
          </span>
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
            const matchingProperty =
              item.type === 'property'
                ? properties.find((p) => p.id === item.id)
                : undefined

            return (
              <div key={item.id} className="space-y-1">
                <AssetCard
                  item={item}
                  groupId={group.heirType}
                  property={matchingProperty}
                  shares={item.type === 'property' ? shares : undefined}
                  onSettlementUpdate={
                    item.type === 'property'
                      ? (settlement) =>
                          onSettlementUpdate(item.id, settlement)
                      : undefined
                  }
                />
                <MobileFallback
                  item={item}
                  currentGroupHeirType={group.heirType}
                  allGroups={allGroups}
                  onMove={onMoveItem}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
