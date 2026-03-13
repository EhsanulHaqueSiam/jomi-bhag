import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FaraidInput, FaraidOutput, HeirInput, HeirType } from '@/core/faraid/types'
import { calculateInheritance } from '@/core/faraid/engine'
import {
  deriveDeceasedGender,
  deriveUserGender,
  getAutoIncludes,
} from '@/types/wizard'
import type { RelationshipType, WizardState } from '@/types/wizard'
import type { Property } from '@/core/land/types'
import { computePropertyTotal } from '@/core/land/types'
import type { MovableAsset, AssetCategory } from '@/core/assets/types'
import { computeMovableAssetsTotal } from '@/core/assets/valuation'
import { ASSET_CATEGORIES } from '@/data/movable-asset-data'
import { fractionStorage } from './fractionStorage'

interface WizardActions {
  setStep: (step: number) => void
  setRelationship: (rel: RelationshipType) => void
  setUserGender: (gender: 'male' | 'female') => void
  setMotherAlive: (alive: boolean) => void
  setDeceasedGender: (gender: 'male' | 'female') => void
  setMfloEnabled: (enabled: boolean) => void
  setWifeCount: (n: number) => void
  setHusbandPresent: (present: boolean) => void
  setSonCount: (n: number) => void
  setDaughterCount: (n: number) => void
  setBrotherFullCount: (n: number) => void
  setBrotherConsanguineCount: (n: number) => void
  setBrotherUterineCount: (n: number) => void
  setSisterFullCount: (n: number) => void
  setSisterConsanguineCount: (n: number) => void
  setSisterUterineCount: (n: number) => void
  setSiblingTypeExpanded: (expanded: boolean) => void
  calculateShares: () => void
  setTotalEstateValue: (value: number) => void
  setViewMode: (mode: 'simple' | 'detailed') => void
  isStepValid: (step: number) => boolean
  buildFaraidInput: () => FaraidInput
  addProperty: () => string
  removeProperty: (id: string) => void
  updateProperty: (id: string, patch: Partial<Property>) => void
  setExpandedPropertyId: (id: string | null) => void
  getAllPropertiesTotal: () => number
  addMovableAsset: (category: AssetCategory) => string
  removeMovableAsset: (id: string) => void
  updateMovableAsset: (id: string, patch: Partial<MovableAsset>) => void
  setExpandedAssetId: (id: string | null) => void
  getMovableAssetsTotal: () => number
}

type WizardStore = WizardState & WizardActions

/**
 * Recalculate auto-includes from current state.
 * Called whenever relationship, userGender, or motherAlive changes.
 */
function recalcAutoIncludes(
  relationship: RelationshipType | null,
  userGender: 'male' | 'female' | null,
  motherAlive: boolean | null,
): { type: HeirType; count: number }[] {
  if (!relationship) return []
  return getAutoIncludes(relationship, userGender, motherAlive)
}

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
  // Navigation
  currentStep: 1,
  completedSteps: [],

  // Step 1
  relationship: null,
  deceasedGender: null,
  userGender: null,
  mfloEnabled: false,
  motherAlive: null,

  // Auto-includes
  autoIncludes: [],

  // Step 2
  wifeCount: 0,
  husbandPresent: false,
  sonCount: 0,
  daughterCount: 0,

  // Step 3
  siblingTypeExpanded: false,
  brotherFullCount: 0,
  brotherConsanguineCount: 0,
  brotherUterineCount: 0,
  sisterFullCount: 0,
  sisterConsanguineCount: 0,
  sisterUterineCount: 0,

  // Step 4 (Properties)
  properties: [],
  expandedPropertyId: null,

  // Step 4 (Movable Assets)
  movableAssets: [],
  expandedAssetId: null,

  // Step 5 (Results)
  results: null,
  totalEstateValue: 0,
  viewMode: 'simple',

  // Actions

  setStep: (step) => {
    const { completedSteps, currentStep } = get()
    // Mark all steps before the new step as completed
    const newCompleted = [...completedSteps]
    for (let s = 1; s < step; s++) {
      if (!newCompleted.includes(s)) {
        newCompleted.push(s)
      }
    }
    // Also mark current step as completed if moving forward
    if (step > currentStep && !newCompleted.includes(currentStep)) {
      newCompleted.push(currentStep)
    }
    set({ currentStep: step, completedSteps: newCompleted })
  },

  setRelationship: (rel) => {
    const deceased = deriveDeceasedGender(rel)
    const user = deriveUserGender(rel)
    const autoIncludes = recalcAutoIncludes(rel, user, null)
    set({
      relationship: rel,
      deceasedGender: deceased,
      userGender: user,
      motherAlive: null,
      autoIncludes,
      // Reset spouse counts since spouse type depends on deceased gender
      wifeCount: 0,
      husbandPresent: false,
    })
  },

  setUserGender: (gender) => {
    const { relationship, motherAlive } = get()
    const autoIncludes = recalcAutoIncludes(relationship, gender, motherAlive)
    set({ userGender: gender, autoIncludes })
  },

  setMotherAlive: (alive) => {
    const { relationship, userGender } = get()
    const autoIncludes = recalcAutoIncludes(relationship, userGender, alive)
    set({ motherAlive: alive, autoIncludes })
  },

  setDeceasedGender: (gender) => {
    set({ deceasedGender: gender })
  },

  setMfloEnabled: (enabled) => {
    set({ mfloEnabled: enabled })
  },

  setWifeCount: (n) => {
    set({ wifeCount: Math.max(0, Math.min(4, n)) })
  },

  setHusbandPresent: (present) => {
    set({ husbandPresent: present })
  },

  setSonCount: (n) => {
    set({ sonCount: Math.max(0, n) })
  },

  setDaughterCount: (n) => {
    set({ daughterCount: Math.max(0, n) })
  },

  setBrotherFullCount: (n) => {
    set({ brotherFullCount: Math.max(0, n) })
  },

  setBrotherConsanguineCount: (n) => {
    set({ brotherConsanguineCount: Math.max(0, n) })
  },

  setBrotherUterineCount: (n) => {
    set({ brotherUterineCount: Math.max(0, n) })
  },

  setSisterFullCount: (n) => {
    set({ sisterFullCount: Math.max(0, n) })
  },

  setSisterConsanguineCount: (n) => {
    set({ sisterConsanguineCount: Math.max(0, n) })
  },

  setSisterUterineCount: (n) => {
    set({ sisterUterineCount: Math.max(0, n) })
  },

  setSiblingTypeExpanded: (expanded) => {
    // Only toggle visibility, never reset counts
    set({ siblingTypeExpanded: expanded })
  },

  calculateShares: () => {
    const state = get()
    const input = state.buildFaraidInput()
    const results: FaraidOutput = calculateInheritance(input)
    const newCompleted = [...state.completedSteps]
    if (!newCompleted.includes(3)) {
      newCompleted.push(3)
    }
    if (!newCompleted.includes(4)) {
      newCompleted.push(4)
    }
    set({ results, currentStep: 5, completedSteps: newCompleted })
  },

  setTotalEstateValue: (value) => {
    const parsed = typeof value === 'number' ? value : parseInt(String(value), 10)
    set({ totalEstateValue: isNaN(parsed) ? 0 : parsed })
  },

  setViewMode: (mode) => {
    set({ viewMode: mode })
  },

  isStepValid: (step) => {
    const state = get()
    switch (step) {
      case 1:
        if (!state.relationship) return false
        // "other" requires explicit deceasedGender
        if (state.relationship === 'other' && !state.deceasedGender)
          return false
        return true
      case 2:
        return true // zero children/spouse is valid
      case 3:
        return true // zero siblings is valid
      case 4:
        return true // properties step is always valid (optional)
      case 5:
        return true // results step is always valid once reached
      default:
        return false
    }
  },

  addProperty: () => {
    const id = crypto.randomUUID()
    const newProperty: Property = {
      id,
      nickname: '',
      type: null,
      division: null,
      upazila: null,
      rateSource: 'manual',
      landAreaSqft: 0,
      landInputUnit: 'decimal',
      landValue: 0,
      house: null,
      trees: null,
      pond: null,
    }
    set((state) => ({
      properties: [...state.properties, newProperty],
      expandedPropertyId: id,
    }))
    return id
  },

  removeProperty: (id) => {
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
      expandedPropertyId:
        state.expandedPropertyId === id ? null : state.expandedPropertyId,
    }))
  },

  updateProperty: (id, patch) => {
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    }))
  },

  setExpandedPropertyId: (id) => {
    set({ expandedPropertyId: id })
  },

  getAllPropertiesTotal: () => {
    const { properties, movableAssets } = get()
    const propTotal = properties.reduce((sum, p) => sum + computePropertyTotal(p), 0)
    const assetTotal = computeMovableAssetsTotal(movableAssets)
    return propTotal + assetTotal
  },

  addMovableAsset: (category) => {
    const id = crypto.randomUUID()
    const catMeta = ASSET_CATEGORIES.find((c) => c.value === category)
    const isIndivisible = catMeta?.defaultIndivisible ?? false

    let newAsset: MovableAsset
    switch (category) {
      case 'gold_silver':
        newAsset = {
          id, category, isIndivisible, indivisibleResolution: null,
          metalType: 'gold', weight: 0, weightUnit: 'vori', purity: '22K',
          useAutoRate: true, overrideValue: null,
        }
        break
      case 'cash':
        newAsset = {
          id, category, isIndivisible, indivisibleResolution: null,
          value: 0,
        }
        break
      case 'vehicle':
        newAsset = {
          id, category, isIndivisible, indivisibleResolution: null,
          vehicleType: 'car', description: '', estimatedValue: 0,
        }
        break
      case 'jewelry':
        newAsset = {
          id, category, isIndivisible, indivisibleResolution: null,
          value: 0,
        }
        break
      case 'furniture':
        newAsset = {
          id, category, isIndivisible, indivisibleResolution: null,
          value: 0,
        }
        break
      case 'livestock':
        newAsset = {
          id, category, isIndivisible, indivisibleResolution: null,
          livestockType: 'cow', count: 1, perUnitValue: 0,
        }
        break
      case 'custom':
        newAsset = {
          id, category, isIndivisible, indivisibleResolution: null,
          name: '', estimatedValue: 0,
        }
        break
    }

    set((state) => ({
      movableAssets: [...state.movableAssets, newAsset],
      expandedAssetId: id,
    }))
    return id
  },

  removeMovableAsset: (id) => {
    set((state) => ({
      movableAssets: state.movableAssets.filter((a) => a.id !== id),
      expandedAssetId:
        state.expandedAssetId === id ? null : state.expandedAssetId,
    }))
  },

  updateMovableAsset: (id, patch) => {
    set((state) => ({
      movableAssets: state.movableAssets.map((a) =>
        a.id === id ? { ...a, ...patch } : a,
      ) as MovableAsset[],
    }))
  },

  setExpandedAssetId: (id) => {
    set({ expandedAssetId: id })
  },

  getMovableAssetsTotal: () => {
    return computeMovableAssetsTotal(get().movableAssets)
  },

  buildFaraidInput: () => {
    const state = get()
    const heirMap = new Map<HeirType, number>()

    // Helper to add to the map (additive)
    const addHeir = (type: HeirType, count: number) => {
      if (count <= 0) return
      heirMap.set(type, (heirMap.get(type) ?? 0) + count)
    }

    // 1. Add auto-includes
    for (const ai of state.autoIncludes) {
      addHeir(ai.type, ai.count)
    }

    // 2. Add spouse
    if (state.deceasedGender === 'male' && state.wifeCount > 0) {
      addHeir('wife', state.wifeCount)
    }
    if (state.deceasedGender === 'female' && state.husbandPresent) {
      addHeir('husband', 1)
    }

    // 3. Add children
    addHeir('son', state.sonCount)
    addHeir('daughter', state.daughterCount)

    // 4. Add siblings
    if (state.siblingTypeExpanded) {
      addHeir('brother_full', state.brotherFullCount)
      addHeir('brother_consanguine', state.brotherConsanguineCount)
      addHeir('brother_uterine', state.brotherUterineCount)
      addHeir('sister_full', state.sisterFullCount)
      addHeir('sister_consanguine', state.sisterConsanguineCount)
      addHeir('sister_uterine', state.sisterUterineCount)
    } else {
      // Collapsed: sum all brothers as brother_full, all sisters as sister_full
      const totalBrothers =
        state.brotherFullCount +
        state.brotherConsanguineCount +
        state.brotherUterineCount
      const totalSisters =
        state.sisterFullCount +
        state.sisterConsanguineCount +
        state.sisterUterineCount
      addHeir('brother_full', totalBrothers)
      addHeir('sister_full', totalSisters)
    }

    // Build HeirInput array, filtering zero counts
    const heirs: HeirInput[] = []
    for (const [type, count] of heirMap) {
      if (count > 0) {
        heirs.push({ type, count })
      }
    }

    return {
      deceasedGender: state.deceasedGender!,
      heirs,
      mfloEnabled: state.mfloEnabled,
    }
  },
    }),
    {
      name: 'jomi-bhag-wizard',
      storage: fractionStorage,
      version: 1,
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        relationship: state.relationship,
        deceasedGender: state.deceasedGender,
        userGender: state.userGender,
        mfloEnabled: state.mfloEnabled,
        motherAlive: state.motherAlive,
        autoIncludes: state.autoIncludes,
        wifeCount: state.wifeCount,
        husbandPresent: state.husbandPresent,
        sonCount: state.sonCount,
        daughterCount: state.daughterCount,
        siblingTypeExpanded: state.siblingTypeExpanded,
        brotherFullCount: state.brotherFullCount,
        brotherConsanguineCount: state.brotherConsanguineCount,
        brotherUterineCount: state.brotherUterineCount,
        sisterFullCount: state.sisterFullCount,
        sisterConsanguineCount: state.sisterConsanguineCount,
        sisterUterineCount: state.sisterUterineCount,
        properties: state.properties,
        expandedPropertyId: state.expandedPropertyId,
        movableAssets: state.movableAssets,
        expandedAssetId: state.expandedAssetId,
        results: state.results,
        totalEstateValue: state.totalEstateValue,
        viewMode: state.viewMode,
      }),
    },
  ),
)
