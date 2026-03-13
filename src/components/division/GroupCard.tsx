import type { HeirType } from '@/core/faraid/types'
import type { DivisionGroup } from '@/core/land/division'
import type { Property, PropertyType } from '@/core/land/types'
import { computePropertyTotal } from '@/core/land/types'
import { HEIR_TYPE_LABELS, SHARE_TYPE_LABELS } from '@/core/utils/display'
import { PROPERTY_TYPES } from '@/data/bd-land-data'
import { ParcelRow } from './ParcelRow'

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function getAutoLabel(type: PropertyType | null, index: number): string {
  if (!type) return 'New Property'
  const typeInfo = PROPERTY_TYPES.find((pt) => pt.value === type)
  const label = typeInfo?.label ?? 'Property'
  return `${label} #${index}`
}

function getPropertyName(
  propertyId: string,
  properties: Property[],
): string {
  const prop = properties.find((p) => p.id === propertyId)
  if (!prop) return 'Unknown Property'
  if (prop.nickname) return prop.nickname

  const sameType = properties.filter((p) => p.type === prop.type)
  const typeIndex = sameType.findIndex((p) => p.id === propertyId) + 1
  return getAutoLabel(prop.type, typeIndex)
}

function getPropertyValue(
  propertyId: string,
  properties: Property[],
): number {
  const prop = properties.find((p) => p.id === propertyId)
  return prop ? computePropertyTotal(prop) : 0
}

interface GroupCardProps {
  group: DivisionGroup
  allGroups: DivisionGroup[]
  properties: Property[]
  onMoveParcel: (
    propertyId: string,
    from: HeirType,
    to: HeirType,
  ) => void
}

export function GroupCard({
  group,
  allGroups,
  properties,
  onMoveParcel,
}: GroupCardProps) {
  const cashAdjAbs = Math.abs(group.cashAdjustment)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-gray-900">
          {HEIR_TYPE_LABELS[group.heirType]}
        </h3>
        {group.count > 1 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            x{group.count}
          </span>
        )}
      </div>

      {/* Target vs Actual */}
      <div className="mt-3 flex gap-4 text-sm">
        <div>
          <span className="text-gray-500">Target: </span>
          <span className="font-medium text-gray-700">
            {bdtFormatter.format(group.targetValue)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Received: </span>
          <span className="font-medium text-gray-700">
            {bdtFormatter.format(group.assignedValue)}
          </span>
        </div>
      </div>

      {/* Cash adjustment */}
      <div className="mt-2 text-sm">
        {group.cashAdjustment > 0 ? (
          <span className="font-medium text-red-600">
            Owes {bdtFormatter.format(cashAdjAbs)} cash
          </span>
        ) : group.cashAdjustment < 0 ? (
          <span className="font-medium text-emerald-600">
            Owed {bdtFormatter.format(cashAdjAbs)} cash
          </span>
        ) : (
          <span className="font-medium text-emerald-600">Balanced</span>
        )}
      </div>

      {/* Parcel list */}
      <div className="mt-3 space-y-2">
        {group.assignedProperties.length > 0 ? (
          group.assignedProperties.map((propId) => (
            <ParcelRow
              key={propId}
              propertyId={propId}
              propertyName={getPropertyName(propId, properties)}
              propertyValue={getPropertyValue(propId, properties)}
              currentGroup={group.heirType}
              allGroups={allGroups}
              onMove={onMoveParcel}
            />
          ))
        ) : (
          <p className="text-sm italic text-gray-400">
            No land parcels assigned
            {group.cashAdjustment < 0 && (
              <span>
                {' '}
                -- receives {bdtFormatter.format(cashAdjAbs)} in cash
                compensation
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
