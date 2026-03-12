export type PropertyType = 'agricultural' | 'residential' | 'commercial' | 'mixed'
export type LandUnit = 'decimal' | 'katha' | 'bigha' | 'sqft'
export type Division =
  | 'dhaka'
  | 'chittagong'
  | 'rajshahi'
  | 'khulna'
  | 'barisal'
  | 'sylhet'
  | 'rangpur'
  | 'mymensingh'
export type ConstructionType = 'brick' | 'tin' | 'mud' | 'semi_pucca'
export type Condition = 'good' | 'fair' | 'poor'

export interface HouseDetail {
  estimatedValue: number
  areaSqft: number | null
  constructionType: ConstructionType | null
  floors: number | null
  condition: Condition | null
}

export interface TreeItem {
  species: string
  count: number
  estimatedValue: number
}

export interface TreeDetail {
  totalEstimatedValue: number
  items: TreeItem[]
  isItemized: boolean
}

export interface PondDetail {
  areaSqft: number
  areaInputUnit: LandUnit
  estimatedValue: number
}

export interface Property {
  id: string
  nickname: string
  type: PropertyType | null
  division: Division | null
  upazila: string | null
  rateSource: 'govt' | 'manual'
  landAreaSqft: number
  landInputUnit: LandUnit
  landValue: number
  house: HouseDetail | null
  trees: TreeDetail | null
  pond: PondDetail | null
}

/** Compute total value for a single property */
export function computePropertyTotal(property: Property): number {
  let total = property.landValue
  if (property.house) total += property.house.estimatedValue
  if (property.trees) {
    total += property.trees.isItemized
      ? property.trees.items.reduce((sum, item) => sum + item.estimatedValue, 0)
      : property.trees.totalEstimatedValue
  }
  if (property.pond) total += property.pond.estimatedValue
  return total
}
