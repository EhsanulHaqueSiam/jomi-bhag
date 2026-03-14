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
export const VEHICLE_TYPES: readonly { value: VehicleType; label: string; labelBn: string }[] = [
  { value: 'car', label: 'Car', labelBn: '\u0997\u09BE\u09DC\u09BF' },
  { value: 'motorcycle', label: 'Motorcycle', labelBn: '\u09AE\u09CB\u099F\u09B0\u09B8\u09BE\u0987\u0995\u09C7\u09B2' },
  { value: 'cng_rickshaw', label: 'CNG/Auto-Rickshaw', labelBn: '\u09B8\u09BF\u098F\u09A8\u099C\u09BF/\u0985\u099F\u09CB-\u09B0\u09BF\u0995\u09B6\u09BE' },
  { value: 'truck', label: 'Truck', labelBn: '\u099F\u09CD\u09B0\u09BE\u0995' },
  { value: 'bicycle', label: 'Bicycle', labelBn: '\u09B8\u09BE\u0987\u0995\u09C7\u09B2' },
  { value: 'boat', label: 'Boat', labelBn: '\u09A8\u09CC\u0995\u09BE' },
]

/** Common livestock types in Bangladesh with labels */
export const LIVESTOCK_TYPES: readonly { value: LivestockType; label: string; labelBn: string }[] = [
  { value: 'cow', label: 'Cow', labelBn: '\u0997\u09B0\u09C1' },
  { value: 'goat', label: 'Goat', labelBn: '\u099B\u09BE\u0997\u09B2' },
  { value: 'chicken', label: 'Chicken', labelBn: '\u09AE\u09C1\u09B0\u0997\u09BF' },
  { value: 'duck', label: 'Duck', labelBn: '\u09B9\u09BE\u0981\u09B8' },
  { value: 'pigeon', label: 'Pigeon', labelBn: '\u0995\u09AC\u09C1\u09A4\u09B0' },
  { value: 'fish_pond', label: 'Fish Pond Stock', labelBn: '\u09AE\u09BE\u099B\u09C7\u09B0 \u09AA\u09C1\u0995\u09C1\u09B0' },
]

/**
 * All 7 asset categories with metadata.
 * defaultIndivisible: whether assets of this category are indivisible by default.
 * Gold/silver, cash, furniture: divisible. Vehicle, jewelry, livestock, custom: indivisible.
 */
export const ASSET_CATEGORIES: readonly {
  value: AssetCategory
  label: string
  labelBn: string
  defaultIndivisible: boolean
}[] = [
  { value: 'gold_silver', label: 'Gold/Silver', labelBn: '\u09B8\u09CD\u09AC\u09B0\u09CD\u09A3/\u09B0\u09CC\u09AA\u09CD\u09AF', defaultIndivisible: false },
  { value: 'cash', label: 'Cash/Bank Deposits', labelBn: '\u09A8\u0997\u09A6/\u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u099C\u09AE\u09BE', defaultIndivisible: false },
  { value: 'vehicle', label: 'Vehicle', labelBn: '\u09AF\u09BE\u09A8\u09AC\u09BE\u09B9\u09A8', defaultIndivisible: true },
  { value: 'jewelry', label: 'Jewelry (non-gold)', labelBn: '\u0997\u09B9\u09A8\u09BE (\u09B8\u09CD\u09AC\u09B0\u09CD\u09A3 \u099B\u09BE\u09DC\u09BE)', defaultIndivisible: true },
  { value: 'furniture', label: 'Furniture/Household', labelBn: '\u0986\u09B8\u09AC\u09BE\u09AC\u09AA\u09A4\u09CD\u09B0/\u0997\u09C3\u09B9\u09B8\u09BE\u09AE\u0997\u09CD\u09B0\u09C0', defaultIndivisible: false },
  { value: 'livestock', label: 'Livestock', labelBn: '\u0997\u09AC\u09BE\u09A6\u09BF \u09AA\u09B6\u09C1', defaultIndivisible: true },
  { value: 'custom', label: 'Custom Item', labelBn: '\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0986\u0987\u099F\u09C7\u09AE', defaultIndivisible: true },
]
