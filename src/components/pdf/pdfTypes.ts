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

  // Lot Division (optional)
  lotDivision?: PdfLotDivision

  // Metadata
  generatedAt: Date
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
