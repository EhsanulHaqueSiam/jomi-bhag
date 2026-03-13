import type { WizardState, RelationshipType } from '@/types/wizard'
import { getAutoIncludes } from '@/types/wizard'
import type { Property, PropertyType, Division, LandUnit } from '@/core/land/types'
import type {
  MovableAsset,
  AssetCategory,
  GoldSilverAsset,
  CashAsset,
  VehicleAsset,
  JewelryAsset,
  FurnitureAsset,
  LivestockAsset,
  CustomAsset,
  GoldUnit,
  GoldPurity,
  VehicleType,
  LivestockType,
} from '@/core/assets/types'
import { SCHEMA_VERSION, DEFAULT_WIZARD_INPUTS } from '@/core/json/schema'

/** Result of import validation */
export type ImportResult =
  | { success: true; state: WizardState }
  | { success: false; error: string }

// ── Valid enum sets ──────────────────────────────────────────────────────

const VALID_RELATIONSHIPS = new Set<string>([
  'father', 'mother', 'husband', 'wife', 'brother', 'sister', 'other',
])
const VALID_GENDERS = new Set<string>(['male', 'female'])
const VALID_PROPERTY_TYPES = new Set<string>([
  'agricultural', 'residential', 'commercial', 'mixed',
])
const VALID_DIVISIONS = new Set<string>([
  'dhaka', 'chittagong', 'rajshahi', 'khulna', 'barisal', 'sylhet', 'rangpur', 'mymensingh',
])
const VALID_LAND_UNITS = new Set<string>(['decimal', 'katha', 'bigha', 'sqft'])
const VALID_RATE_SOURCES = new Set<string>(['govt', 'manual'])
const VALID_ASSET_CATEGORIES = new Set<string>([
  'gold_silver', 'cash', 'vehicle', 'jewelry', 'furniture', 'livestock', 'custom',
])
const VALID_METAL_TYPES = new Set<string>(['gold', 'silver'])
const VALID_GOLD_UNITS = new Set<string>(['vori', 'gram', 'tola'])
const VALID_GOLD_PURITIES = new Set<string>(['24K', '22K', '18K'])
const VALID_VEHICLE_TYPES = new Set<string>([
  'car', 'motorcycle', 'cng_rickshaw', 'truck', 'bicycle', 'boat',
])
const VALID_LIVESTOCK_TYPES = new Set<string>([
  'cow', 'goat', 'chicken', 'duck', 'pigeon', 'fish_pond',
])

// ── Helpers ──────────────────────────────────────────────────────────────

function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

function asNumber(val: unknown, fallback: number): number {
  return typeof val === 'number' && !Number.isNaN(val) ? val : fallback
}

function asBoolean(val: unknown, fallback: boolean): boolean {
  return typeof val === 'boolean' ? val : fallback
}

function asString(val: unknown, fallback: string): string {
  return typeof val === 'string' ? val : fallback
}

function asEnum<T extends string>(val: unknown, valid: Set<string>, fallback: T | null): T | null {
  return typeof val === 'string' && valid.has(val) ? (val as T) : fallback
}

// ── Property validation ─────────────────────────────────────────────────

function validateProperty(raw: unknown): Property | null {
  if (!isObject(raw)) return null

  return {
    id: crypto.randomUUID(),
    nickname: asString(raw.nickname, ''),
    type: asEnum<PropertyType>(raw.type, VALID_PROPERTY_TYPES, null),
    division: asEnum<Division>(raw.division, VALID_DIVISIONS, null),
    upazila: typeof raw.upazila === 'string' ? raw.upazila : null,
    rateSource: (asEnum(raw.rateSource, VALID_RATE_SOURCES, null) ?? 'manual') as 'govt' | 'manual',
    landAreaSqft: asNumber(raw.landAreaSqft, 0),
    landInputUnit: (asEnum<LandUnit>(raw.landInputUnit, VALID_LAND_UNITS, null) ?? 'decimal') as LandUnit,
    landValue: asNumber(raw.landValue, 0),
    house: isObject(raw.house)
      ? {
          estimatedValue: asNumber(raw.house.estimatedValue, 0),
          areaSqft: typeof raw.house.areaSqft === 'number' ? raw.house.areaSqft : null,
          constructionType: typeof raw.house.constructionType === 'string' ? (raw.house.constructionType as 'brick' | 'tin' | 'mud' | 'semi_pucca') : null,
          floors: typeof raw.house.floors === 'number' ? raw.house.floors : null,
          condition: typeof raw.house.condition === 'string' ? (raw.house.condition as 'good' | 'fair' | 'poor') : null,
        }
      : null,
    trees: isObject(raw.trees)
      ? {
          totalEstimatedValue: asNumber(raw.trees.totalEstimatedValue, 0),
          items: Array.isArray(raw.trees.items)
            ? (raw.trees.items as unknown[]).filter(isObject).map((item) => ({
                species: asString(item.species, ''),
                count: asNumber(item.count, 0),
                estimatedValue: asNumber(item.estimatedValue, 0),
              }))
            : [],
          isItemized: asBoolean(raw.trees.isItemized, false),
        }
      : null,
    pond: isObject(raw.pond)
      ? {
          areaSqft: asNumber(raw.pond.areaSqft, 0),
          areaInputUnit: (asEnum<LandUnit>(raw.pond.areaInputUnit, VALID_LAND_UNITS, null) ?? 'decimal') as LandUnit,
          estimatedValue: asNumber(raw.pond.estimatedValue, 0),
        }
      : null,
  }
}

// ── Movable asset validation ─────────────────────────────────────────────

function validateMovableAsset(raw: unknown): MovableAsset | null {
  if (!isObject(raw)) return null

  const category = asEnum<AssetCategory>(raw.category, VALID_ASSET_CATEGORIES, null)
  if (!category) return null

  const base = {
    id: crypto.randomUUID(),
    isIndivisible: asBoolean(raw.isIndivisible, false),
    indivisibleResolution: isObject(raw.indivisibleResolution) ? raw.indivisibleResolution as MovableAsset['indivisibleResolution'] : null,
  }

  switch (category) {
    case 'gold_silver':
      return {
        ...base,
        category: 'gold_silver',
        metalType: (asEnum(raw.metalType, VALID_METAL_TYPES, null) ?? 'gold') as GoldSilverAsset['metalType'],
        weight: asNumber(raw.weight, 0),
        weightUnit: (asEnum<GoldUnit>(raw.weightUnit, VALID_GOLD_UNITS, null) ?? 'vori') as GoldUnit,
        purity: (asEnum<GoldPurity>(raw.purity, VALID_GOLD_PURITIES, null) ?? '22K') as GoldPurity,
        useAutoRate: asBoolean(raw.useAutoRate, true),
        overrideValue: typeof raw.overrideValue === 'number' ? raw.overrideValue : null,
      } satisfies GoldSilverAsset

    case 'cash':
      return {
        ...base,
        category: 'cash',
        value: asNumber(raw.value, 0),
      } satisfies CashAsset

    case 'vehicle':
      return {
        ...base,
        category: 'vehicle',
        vehicleType: (asEnum<VehicleType>(raw.vehicleType, VALID_VEHICLE_TYPES, null) ?? 'car') as VehicleType,
        description: asString(raw.description, ''),
        estimatedValue: asNumber(raw.estimatedValue, 0),
      } satisfies VehicleAsset

    case 'jewelry':
      return {
        ...base,
        category: 'jewelry',
        value: asNumber(raw.value, 0),
      } satisfies JewelryAsset

    case 'furniture':
      return {
        ...base,
        category: 'furniture',
        value: asNumber(raw.value, 0),
      } satisfies FurnitureAsset

    case 'livestock':
      return {
        ...base,
        category: 'livestock',
        livestockType: (asEnum<LivestockType>(raw.livestockType, VALID_LIVESTOCK_TYPES, null) ?? 'cow') as LivestockType,
        count: asNumber(raw.count, 0),
        perUnitValue: asNumber(raw.perUnitValue, 0),
      } satisfies LivestockAsset

    case 'custom':
      return {
        ...base,
        category: 'custom',
        name: asString(raw.name, ''),
        estimatedValue: asNumber(raw.estimatedValue, 0),
      } satisfies CustomAsset
  }
}

// ── Main validation function ─────────────────────────────────────────────

/**
 * Validate and parse imported JSON data into a WizardState.
 *
 * Accepts both:
 * - Full schema envelope: { schemaVersion, appVersion, exportDate, data: {...} }
 * - Bare data object: { relationship: ..., sonCount: ..., ... }
 *
 * Missing fields are filled with sensible defaults from DEFAULT_WIZARD_INPUTS.
 * Invalid enum values fall back to null/default.
 * Property and asset IDs are regenerated.
 * autoIncludes are recomputed from relationship/userGender/motherAlive.
 * Navigation state is reset (currentStep=1, completedSteps=[]).
 */
export function validateAndParseImport(raw: unknown): ImportResult {
  // Check input is a non-null object
  if (!isObject(raw)) {
    return { success: false, error: 'Invalid file: expected a JSON object' }
  }

  // Check schemaVersion if present
  if ('schemaVersion' in raw && typeof raw.schemaVersion === 'number') {
    if (raw.schemaVersion > SCHEMA_VERSION) {
      return {
        success: false,
        error: `Unsupported schema version ${raw.schemaVersion}. This app supports version ${SCHEMA_VERSION} or lower.`,
      }
    }
  }

  // Extract data: use envelope's data field, or treat raw as bare data
  const data: Record<string, unknown> = isObject(raw.data)
    ? (raw.data as Record<string, unknown>)
    : raw

  const defaults = DEFAULT_WIZARD_INPUTS

  // ── Parse scalar fields ─────────────────────────────────────────

  const relationship = asEnum<RelationshipType>(data.relationship, VALID_RELATIONSHIPS, defaults.relationship)
  const deceasedGender = asEnum<'male' | 'female'>(data.deceasedGender, VALID_GENDERS, defaults.deceasedGender)
  const userGender = asEnum<'male' | 'female'>(data.userGender, VALID_GENDERS, defaults.userGender)
  const mfloEnabled = asBoolean(data.mfloEnabled, defaults.mfloEnabled)
  const motherAlive = typeof data.motherAlive === 'boolean' ? data.motherAlive : defaults.motherAlive

  const wifeCount = asNumber(data.wifeCount, defaults.wifeCount)
  const husbandPresent = asBoolean(data.husbandPresent, defaults.husbandPresent)
  const sonCount = asNumber(data.sonCount, defaults.sonCount)
  const daughterCount = asNumber(data.daughterCount, defaults.daughterCount)

  const siblingTypeExpanded = asBoolean(data.siblingTypeExpanded, defaults.siblingTypeExpanded)
  const brotherFullCount = asNumber(data.brotherFullCount, defaults.brotherFullCount)
  const brotherConsanguineCount = asNumber(data.brotherConsanguineCount, defaults.brotherConsanguineCount)
  const brotherUterineCount = asNumber(data.brotherUterineCount, defaults.brotherUterineCount)
  const sisterFullCount = asNumber(data.sisterFullCount, defaults.sisterFullCount)
  const sisterConsanguineCount = asNumber(data.sisterConsanguineCount, defaults.sisterConsanguineCount)
  const sisterUterineCount = asNumber(data.sisterUterineCount, defaults.sisterUterineCount)

  const totalEstateValue = asNumber(data.totalEstateValue, defaults.totalEstateValue)

  // ── Parse properties array ──────────────────────────────────────

  const properties: Property[] = []
  if (Array.isArray(data.properties)) {
    for (const rawProp of data.properties) {
      const prop = validateProperty(rawProp)
      if (prop) properties.push(prop)
    }
  }

  // ── Parse movable assets array ──────────────────────────────────

  const movableAssets: MovableAsset[] = []
  if (Array.isArray(data.movableAssets)) {
    for (const rawAsset of data.movableAssets) {
      const asset = validateMovableAsset(rawAsset)
      if (asset) movableAssets.push(asset)
    }
  }

  // ── Recompute derived fields ────────────────────────────────────

  const autoIncludes = relationship
    ? getAutoIncludes(relationship, userGender, motherAlive)
    : []

  // ── Assemble WizardState ────────────────────────────────────────

  const state: WizardState = {
    // Navigation (reset)
    currentStep: 1,
    completedSteps: [],

    // Step 1
    relationship,
    deceasedGender,
    userGender,
    mfloEnabled,
    motherAlive,

    // Derived
    autoIncludes,

    // Step 2
    wifeCount,
    husbandPresent,
    sonCount,
    daughterCount,

    // Step 3
    siblingTypeExpanded,
    brotherFullCount,
    brotherConsanguineCount,
    brotherUterineCount,
    sisterFullCount,
    sisterConsanguineCount,
    sisterUterineCount,

    // Step 4
    properties,
    expandedPropertyId: null,
    movableAssets,
    expandedAssetId: null,

    // Step 5 (reset)
    results: null,
    totalEstateValue,
    viewMode: 'simple',
  }

  return { success: true, state }
}
