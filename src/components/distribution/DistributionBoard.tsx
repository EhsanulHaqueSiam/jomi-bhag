import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import type { HeirType } from '@/core/faraid/types'
import type { ShareResult } from '@/core/faraid/types'
import type { DistributionItem, DistributionGroup } from '@/core/distribution/types'
import type { Property } from '@/core/land/types'
import type { LandSettlement } from '@/core/land/settlement-types'
import { SummaryBanner } from './SummaryBanner'
import { HeirColumn } from './HeirColumn'
import { AssetCard } from './AssetCard'

interface DistributionBoardProps {
  groups: DistributionGroup[]
  items: DistributionItem[]
  balancedCount: number
  totalCount: number
  onMoveItem: (itemId: string, from: HeirType, to: HeirType) => void
  properties: Property[]
  shares: ShareResult[]
  onSettlementUpdate: (propertyId: string, settlement: LandSettlement | null) => void
}

export function DistributionBoard({
  groups,
  items,
  balancedCount,
  totalCount,
  onMoveItem,
  properties,
  shares,
  onSettlementUpdate,
}: DistributionBoardProps) {
  const [activeItem, setActiveItem] = useState<DistributionItem | null>(null)

  const itemMap = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  )

  /** Build a set of items per group for efficient lookup. */
  const itemsByGroup = useMemo(() => {
    const map = new Map<string, DistributionItem[]>()
    for (const group of groups) {
      const groupItems = group.assignedItems
        .map((id) => itemMap.get(id))
        .filter((i): i is DistributionItem => i !== undefined)
      map.set(group.heirType, groupItems)
    }
    return map
  }, [groups, itemMap])

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 500, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const item = itemMap.get(String(event.active.id))
      setActiveItem(item ?? null)
    },
    [itemMap],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveItem(null)

      if (!over) return

      const itemId = String(active.id)
      const destHeirType = String(over.id) as HeirType

      // Find source group (the group containing this item)
      let sourceHeirType: HeirType | null = null
      for (const group of groups) {
        if (group.assignedItems.includes(itemId)) {
          sourceHeirType = group.heirType
          break
        }
      }

      if (!sourceHeirType || sourceHeirType === destHeirType) return

      onMoveItem(itemId, sourceHeirType, destHeirType)
    },
    [groups, onMoveItem],
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Summary banner */}
        <SummaryBanner balancedCount={balancedCount} totalCount={totalCount} />

        {/* Kanban columns grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:flex lg:flex-row lg:overflow-x-auto">
          {groups.map((group) => (
            <div
              key={group.heirType}
              className="lg:min-w-[300px] lg:flex-shrink-0 lg:flex-1"
            >
              <HeirColumn
                group={group}
                items={itemsByGroup.get(group.heirType) ?? []}
                allGroups={groups}
                onMoveItem={onMoveItem}
                properties={properties}
                shares={shares}
                onSettlementUpdate={onSettlementUpdate}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Drag overlay: renders a copy of the dragged card */}
      <DragOverlay modifiers={[]}>
        {activeItem ? (
          <AssetCard
            item={activeItem}
            groupId=""
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
