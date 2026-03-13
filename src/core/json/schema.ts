import type { RelationshipType } from '@/types/wizard'
import type { Property } from '@/core/land/types'
import type { MovableAsset } from '@/core/assets/types'

/** Current JSON export schema version */
export const SCHEMA_VERSION = 1

/** Application version string for export metadata */
export const APP_VERSION = '1.0.0'

/** Shape of the exported data envelope */
export interface ExportSchema {
  schemaVersion: number
  appVersion: string
  exportDate: string
  data: ExportData
}

/** Input-only wizard fields included in the export (no computed/UI state) */
export interface ExportData {
  // Step 1
  relationship: RelationshipType | null
  deceasedGender: 'male' | 'female' | null
  userGender: 'male' | 'female' | null
  mfloEnabled: boolean
  motherAlive: boolean | null

  // Step 2
  wifeCount: number
  husbandPresent: boolean
  sonCount: number
  daughterCount: number

  // Step 3
  siblingTypeExpanded: boolean
  brotherFullCount: number
  brotherConsanguineCount: number
  brotherUterineCount: number
  sisterFullCount: number
  sisterConsanguineCount: number
  sisterUterineCount: number

  // Step 4
  properties: Property[]
  movableAssets: MovableAsset[]

  // Estate value
  totalEstateValue: number
}

/** Default values for every input field -- used by import for missing fields */
export const DEFAULT_WIZARD_INPUTS: ExportData = {
  relationship: null,
  deceasedGender: null,
  userGender: null,
  mfloEnabled: false,
  motherAlive: null,
  wifeCount: 0,
  husbandPresent: false,
  sonCount: 0,
  daughterCount: 0,
  siblingTypeExpanded: false,
  brotherFullCount: 0,
  brotherConsanguineCount: 0,
  brotherUterineCount: 0,
  sisterFullCount: 0,
  sisterConsanguineCount: 0,
  sisterUterineCount: 0,
  properties: [],
  movableAssets: [],
  totalEstateValue: 0,
}
