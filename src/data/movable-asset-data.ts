import type { GoldPurity, VehicleType, LivestockType, AssetCategory } from '@/core/assets/types'

/**
 * BAJUS approximate gold rates per vori (bhori) in BDT.
 * Updated with app releases, not live API.
 * User can always override with actual market value.
 */
export const GOLD_RATES: Record<GoldPurity, number> = {
  '24K': 145000,
  '22K': 133000,
  '18K': 109000,
}

/**
 * Silver rates per vori in BDT.
 * Approximate baseline rates for guidance.
 */
export const SILVER_RATES: Record<GoldPurity, number> = {
  '24K': 3500,
  '22K': 3200,
  '18K': 2600,
}

/**
 * Gold unit conversion constants.
 * 1 Vori (Bhori) = 11.664 grams
 * In BD, 1 Tola ~ 1 Vori (used interchangeably)
 */
export const GOLD_UNIT_CONVERSIONS = {
  vori_to_gram: 11.664,
  tola_to_gram: 11.664,
  gram_to_vori: 1 / 11.664,
  gram_to_tola: 1 / 11.664,
} as const

/** Common vehicle types in Bangladesh with labels */
export const VEHICLE_TYPES: readonly { value: VehicleType; label: string }[] = [
  { value: 'car', label: 'Car' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'cng_rickshaw', label: 'CNG/Auto-Rickshaw' },
  { value: 'truck', label: 'Truck' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'boat', label: 'Boat' },
]

/** Common livestock types in Bangladesh with labels */
export const LIVESTOCK_TYPES: readonly { value: LivestockType; label: string }[] = [
  { value: 'cow', label: 'Cow' },
  { value: 'goat', label: 'Goat' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'duck', label: 'Duck' },
  { value: 'pigeon', label: 'Pigeon' },
  { value: 'fish_pond', label: 'Fish Pond Stock' },
]

/**
 * All 7 asset categories with metadata.
 * defaultIndivisible: whether assets of this category are indivisible by default.
 * Gold/silver, cash, furniture: divisible. Vehicle, jewelry, livestock, custom: indivisible.
 */
export const ASSET_CATEGORIES: readonly {
  value: AssetCategory
  label: string
  defaultIndivisible: boolean
}[] = [
  { value: 'gold_silver', label: 'Gold/Silver', defaultIndivisible: false },
  { value: 'cash', label: 'Cash/Bank Deposits', defaultIndivisible: false },
  { value: 'vehicle', label: 'Vehicle', defaultIndivisible: true },
  { value: 'jewelry', label: 'Jewelry (non-gold)', defaultIndivisible: true },
  { value: 'furniture', label: 'Furniture/Household', defaultIndivisible: false },
  { value: 'livestock', label: 'Livestock', defaultIndivisible: true },
  { value: 'custom', label: 'Custom Item', defaultIndivisible: true },
]
