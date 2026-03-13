import type { CashAsset, JewelryAsset, FurnitureAsset } from '@/core/assets/types'
import { PropertyValueInput } from '@/components/property/PropertyValueInput'

interface SimpleValueFormProps {
  asset: CashAsset | JewelryAsset | FurnitureAsset
  onUpdate: (patch: { value: number }) => void
  label: string
}

export function SimpleValueForm({
  asset,
  onUpdate,
  label,
}: SimpleValueFormProps) {
  return (
    <div className="space-y-4">
      <PropertyValueInput
        value={asset.value}
        onChange={(n) => onUpdate({ value: n })}
        label={label}
      />
    </div>
  )
}
