import type { GoldSilverAsset, GoldUnit, GoldPurity } from '@/core/assets/types'
import { computeGoldValue, convertToVori } from '@/core/assets/valuation'
import { GOLD_RATES, SILVER_RATES } from '@/data/movable-asset-data'
import { PropertyValueInput } from '@/components/property/PropertyValueInput'
import { GoldRateSuggestion } from './GoldRateSuggestion'
import { GoldUnitConversion } from './GoldUnitConversion'

interface GoldSilverFormProps {
  asset: GoldSilverAsset
  onUpdate: (patch: Partial<GoldSilverAsset>) => void
}

const UNIT_OPTIONS: { value: GoldUnit; label: string }[] = [
  { value: 'vori', label: 'Vori' },
  { value: 'gram', label: 'Grams' },
  { value: 'tola', label: 'Tola' },
]

const PURITY_OPTIONS: { value: GoldPurity; label: string }[] = [
  { value: '24K', label: '24K (Pure)' },
  { value: '22K', label: '22K (Standard)' },
  { value: '18K', label: '18K' },
]

export function GoldSilverForm({ asset, onUpdate }: GoldSilverFormProps) {
  const rates = asset.metalType === 'gold' ? GOLD_RATES : SILVER_RATES
  const rate = rates[asset.purity]
  const weightInVori = convertToVori(asset.weight, asset.weightUnit)
  const computedValue = computeGoldValue(asset)

  const handleMetalToggle = (metalType: 'gold' | 'silver') => {
    onUpdate({ metalType, overrideValue: null })
  }

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    const parsed = parseFloat(raw)
    onUpdate({ weight: isNaN(parsed) ? 0 : parsed })
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ weightUnit: e.target.value as GoldUnit })
  }

  const handlePurityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ purity: e.target.value as GoldPurity, overrideValue: null })
  }

  const handleApplyRate = (_calculated: number) => {
    onUpdate({ overrideValue: null })
  }

  const handleValueOverride = (value: number) => {
    onUpdate({ overrideValue: value === 0 ? null : value })
  }

  return (
    <div className="space-y-4">
      {/* Metal type toggle */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Metal Type
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleMetalToggle('gold')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              asset.metalType === 'gold'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Gold
          </button>
          <button
            type="button"
            onClick={() => handleMetalToggle('silver')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              asset.metalType === 'silver'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Silver
          </button>
        </div>
      </div>

      {/* Weight input with unit dropdown */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Weight
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={asset.weight === 0 ? '' : String(asset.weight)}
            onChange={handleWeightChange}
            placeholder="Enter weight"
            className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <select
            value={asset.weightUnit}
            onChange={handleUnitChange}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        <GoldUnitConversion weight={asset.weight} currentUnit={asset.weightUnit} />
      </div>

      {/* Purity dropdown */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Purity
        </label>
        <select
          value={asset.purity}
          onChange={handlePurityChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          {PURITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rate suggestion with transparent math */}
      <GoldRateSuggestion
        rate={rate}
        weight={weightInVori}
        purity={asset.purity}
        metalType={asset.metalType}
        onApply={handleApplyRate}
      />

      {/* Value display (auto-calculated or override) */}
      <PropertyValueInput
        value={computedValue}
        onChange={handleValueOverride}
        label="Estimated Value"
        placeholder="Auto-calculated from rate"
      />
    </div>
  )
}
