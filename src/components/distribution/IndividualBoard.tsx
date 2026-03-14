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
import type { DistributionItem } from '@/core/distribution/types'
import type { IndividualColumn } from '@/core/distribution/individual-types'
import type { Property } from '@/core/land/types'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'
import { SummaryBanner } from './SummaryBanner'
import { AssetCard } from './AssetCard'
import { IndividualColumnComponent, HEIR_TYPE_COLORS } from './IndividualColumn'

interface IndividualBoardProps {
  individuals: IndividualColumn[]
  items: DistributionItem[]
  customNames: Record<string, string>
  balancedCount: number
  totalCount: number
  onMoveItem: (itemId: string, fromId: string, toId: string) => void
  onRename: (individualId: string, name: string) => void
  onSplit: (itemId: string, splits: { areaSqft: number }[], totalAreaSqft: number) => void
  onMerge: (parentId: string) => void
  properties: Property[]
  splitOrigins: Map<string, DistributionItem>
}

/** Faraid priority order for section rendering. */
const HEIR_TYPE_ORDER: HeirType[] = [
  'husband',
  'wife',
  'son',
  'daughter',
  'son_of_son',
  'daughter_of_son',
  'father',
  'paternal_grandfather',
  'mother',
  'paternal_grandmother',
  'maternal_grandmother',
  'brother_full',
  'brother_consanguine',
  'brother_uterine',
  'sister_full',
  'sister_consanguine',
  'sister_uterine',
]

/** Group label for section header (pluralized). */
const HEIR_TYPE_SECTION_LABELS: Partial<Record<HeirType, string>> = {
  husband: 'Husband',
  wife: 'Wife',
  son: 'Sons',
  daughter: 'Daughters',
  son_of_son: "Sons' Sons",
  daughter_of_son: "Sons' Daughters",
  father: 'Father',
  paternal_grandfather: 'Paternal Grandfather',
  mother: 'Mother',
  paternal_grandmother: 'Paternal Grandmother',
  maternal_grandmother: 'Maternal Grandmother',
  brother_full: 'Full Brothers',
  brother_consanguine: 'Paternal Brothers',
  brother_uterine: 'Maternal Brothers',
  sister_full: 'Full Sisters',
  sister_consanguine: 'Paternal Sisters',
  sister_uterine: 'Maternal Sisters',
}

export function IndividualBoard({
  individuals,
  items,
  customNames,
  balancedCount,
  totalCount,
  onMoveItem,
  onRename,
  onSplit,
  onMerge,
  properties,
  splitOrigins,
}: IndividualBoardProps) {
  const [activeItem, setActiveItem] = useState<DistributionItem | null>(null)

  const itemMap = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  )

  // Group individuals by heir type, maintaining Faraid priority order
  const groupedByType = useMemo(() => {
    const groups = new Map<HeirType, IndividualColumn[]>()
    for (const ind of individuals) {
      const existing = groups.get(ind.heirType)
      if (existing) {
        existing.push(ind)
      } else {
        groups.set(ind.heirType, [ind])
      }
    }

    // Sort by Faraid priority order
    const ordered: { heirType: HeirType; individuals: IndividualColumn[] }[] = []
    for (const heirType of HEIR_TYPE_ORDER) {
      const group = groups.get(heirType)
      if (group && group.length > 0) {
        ordered.push({ heirType, individuals: group })
      }
    }
    return ordered
  }, [individuals])

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
      const destId = String(over.id)

      // Find source individual (the one containing this item)
      let sourceId: string | null = null
      for (const ind of individuals) {
        if (ind.assignedItems.includes(itemId)) {
          sourceId = ind.id
          break
        }
      }

      if (!sourceId || sourceId === destId) return

      onMoveItem(itemId, sourceId, destId)
    },
    [individuals, onMoveItem],
  )

  // Build items per individual for efficient lookup
  const itemsByIndividual = useMemo(() => {
    const map = new Map<string, DistributionItem[]>()
    for (const ind of individuals) {
      const indItems = ind.assignedItems
        .map((id) => itemMap.get(id))
        .filter((i): i is DistributionItem => i !== undefined)
      map.set(ind.id, indItems)
    }
    return map
  }, [individuals, itemMap])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            const item = itemMap.get(String(active.id))
            const source = individuals.find((ind) =>
              ind.assignedItems.includes(String(active.id)),
            )
            const sourceName = source
              ? customNames[source.id] || source.displayName
              : 'unknown'
            return `Picked up ${item?.label ?? 'item'} from ${sourceName}`
          },
          onDragOver({ active, over }) {
            if (!over) return ''
            const item = itemMap.get(String(active.id))
            const target = individuals.find((ind) => ind.id === String(over.id))
            const targetName = target
              ? customNames[target.id] || target.displayName
              : 'unknown'
            return `${item?.label ?? 'Item'} is over ${targetName}`
          },
          onDragEnd({ active, over }) {
            if (!over) return `Dropped ${active.id}`
            const item = itemMap.get(String(active.id))
            const target = individuals.find((ind) => ind.id === String(over.id))
            const targetName = target
              ? customNames[target.id] || target.displayName
              : 'unknown'
            return `Dropped ${item?.label ?? 'item'} on ${targetName}`
          },
          onDragCancel({ active }) {
            return `Drag cancelled for ${active.id}`
          },
        },
      }}
    >
      <div className="space-y-6">
        {/* Summary banner */}
        <SummaryBanner balancedCount={balancedCount} totalCount={totalCount} />

        {/* Sections grouped by heir type */}
        {groupedByType.map(({ heirType, individuals: typeIndividuals }) => {
          const colors = HEIR_TYPE_COLORS[heirType] ?? {
            bg: 'bg-gray-50',
            text: 'text-gray-700',
          }
          const sectionLabel =
            HEIR_TYPE_SECTION_LABELS[heirType] ?? HEIR_TYPE_LABELS[heirType]

          // Group share info
          const shareInfo = typeIndividuals[0]?.sharePerHeir
          const count = typeIndividuals.length

          return (
            <div key={heirType} role="group" aria-label={`${sectionLabel} section`}>
              {/* Section header */}
              <div
                className={`mb-3 rounded-lg px-4 py-2 ${colors.bg}`}
              >
                <h3 className={`text-sm font-semibold ${colors.text}`}>
                  {sectionLabel}
                  {count > 1 && (
                    <span className="ml-2 font-normal">
                      ({shareInfo} each, {count} heirs)
                    </span>
                  )}
                </h3>
              </div>

              {/* Individual columns grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:flex lg:flex-row lg:overflow-x-auto">
                {typeIndividuals.map((ind) => (
                  <div
                    key={ind.id}
                    className="lg:min-w-[280px] lg:flex-shrink-0 lg:flex-1"
                  >
                    <IndividualColumnComponent
                      individual={ind}
                      items={itemsByIndividual.get(ind.id) ?? []}
                      allIndividuals={individuals}
                      customName={customNames[ind.id] ?? null}
                      onMoveItem={onMoveItem}
                      onRename={onRename}
                      onSplit={onSplit}
                      onMerge={onMerge}
                      properties={properties}
                      splitOrigins={splitOrigins}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
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
