export interface PdfData {
  // Heir share data
  shares: PdfShareRow[]
  activeShares: PdfShareRow[]
  adjustment: 'none' | 'awl' | 'radd'
  totalBeforeAdjustment: string // pre-formatted fraction string
  blockedHeirs: { heirType: string; blockedBy: string; rule: string }[]
  specialCases: string[]

  // Calculation steps
  steps: { step: number; description: string; detail: string }[]

  // Islamic references
  references: PdfReference[]

  // Property data
  properties: PdfProperty[]
  totalEstateValue: number

  // Chart images (base64 data URLs, null if not captured)
  pieChartImage: string | null
  barChartImage: string | null

  // Movable Assets
  movableAssets: PdfMovableAsset[]
  movableAssetsTotal: number

  // Lot Division (optional, superseded by distribution when present)
  lotDivision?: PdfLotDivision

  // Distribution (optional, supersedes lotDivision when present)
  distribution?: PdfDistribution

  // Settlement plan (optional, per-property settlement details)
  settlements?: PdfSettlement[]

  // Individual distribution (Phase 14, optional)
  individualDistribution?: PdfIndividualDistribution

  // Metadata
  generatedAt: Date
}

export interface PdfMovableAsset {
  category: string       // display label
  itemName: string       // auto-label or custom name
  value: number          // computed value
  isIndivisible: boolean
  resolution: string | null  // "Sell & Divide", "Buyout by Son", "Qurah", or null
}

export interface PdfLotDivisionGroup {
  heirType: string // display label
  count: number
  targetValue: number
  assignedProperties: { nickname: string; value: number }[]
  assignedValue: number
  cashAdjustment: number
}

export interface PdfLotDivision {
  groups: PdfLotDivisionGroup[]
  compensations: { from: string; to: string; amount: number }[]
  totalEstateValue: number
}

export interface PdfShareRow {
  heirType: string // display label
  count: number
  fraction: string // e.g., "1/4"
  percentage: string // e.g., "25.0%"
  perHeirBdt: string // formatted BDT or empty
  totalBdt: string // formatted BDT or empty
  shareType: string // display label
  // For Awl/Radd: original share before adjustment
  originalFraction?: string
  originalPercentage?: string
  explanation: string
  quranRef?: string
  hadithRef?: string
}

export interface PdfReference {
  type: 'quran' | 'hadith'
  reference: string
  arabicText: string
  englishText: string
  appliesTo: string[] // display labels
}

export interface PdfProperty {
  nickname: string
  type: string
  division: string | null
  upazila: string | null
  rateSource: 'govt' | 'manual'
  landAreaSqft: number
  landValue: number
  houseValue: number | null
  treesValue: number | null
  pondValue: number | null
  totalValue: number
}

export interface PdfDistributionItem {
  label: string           // item display name
  category: string        // display category label
  type: 'property' | 'movable'
  value: number           // BDT value
}

export interface PdfDistributionGroup {
  heirType: string        // display label (from HEIR_TYPE_LABELS)
  count: number
  targetValue: number
  assignedItems: PdfDistributionItem[]
  assignedValue: number
  cashAdjustment: number
}

export interface PdfDistribution {
  groups: PdfDistributionGroup[]
  compensations: { from: string; to: string; amount: number }[]
  totalEstateValue: number
}

// Individual distribution types for PDF export (Phase 14)

export interface PdfIndividualHeir {
  id: string               // "son_0"
  displayName: string      // "Son 1" or custom name
  subtitle: string | null  // "Son 1" when custom name is set
  heirType: string         // display label from HEIR_TYPE_LABELS
  targetValue: number
  assignedValue: number
  equilibriumStatus: 'balanced' | 'close' | 'off'
  equilibriumPercentage: number
  items: PdfDistributionItem[]  // reuse existing type
  cashAdjustment: number
}

export interface PdfIndividualCompensation {
  fromName: string
  toName: string
  amount: number
}

export interface PdfIndividualDistribution {
  heirsByType: { typeName: string; heirs: PdfIndividualHeir[] }[]
  compensations: PdfIndividualCompensation[]
  totalBalanced: number
  totalHeirs: number
  totalEstateValue: number    // for summary line
  qurahUsed: boolean
}

// Settlement types for PDF export

export interface PdfSubParcel {
  name: string
  area: string           // pre-formatted with unit (e.g., "2.5 katha")
  appraisedValue: number
}

export interface PdfSettlementSellSplit {
  method: 'sell_split'
  effectivePrice: number  // actualSalePrice or property value
  isOverridden: boolean   // true if user entered actual sale price
  payouts: { heirType: string; amount: number }[]
}

export interface PdfSettlementPhysicalDivision {
  method: 'physical_division'
  subParcels: PdfSubParcel[]
  totalSubParcelValue: number
  propertyValue: number
  compensation: number    // difference
}

export interface PdfSettlementBuyout {
  method: 'buyout'
  buyer: string           // display label
  compensationOwed: number
  perGroupPayments: { heirType: string; amount: number }[]
  installmentPlan: { perInstallment: number; count: number } | null
}

export interface PdfSettlementJointOwnership {
  method: 'joint_ownership'
  ownershipShares: { heirType: string; percentage: number }[]
  income: {
    type: string          // "Rent" or "Crop Income"
    period: string        // "Monthly" or "Yearly"
    amount: number
    distribution: { heirType: string; amount: number }[]
  } | null
}

export type PdfSettlementDetail =
  | PdfSettlementSellSplit
  | PdfSettlementPhysicalDivision
  | PdfSettlementBuyout
  | PdfSettlementJointOwnership

export interface PdfSettlement {
  propertyName: string
  propertyValue: number
  detail: PdfSettlementDetail
}
