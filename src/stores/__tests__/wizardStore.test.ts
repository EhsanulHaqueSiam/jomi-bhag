import { describe, it, expect, beforeEach } from 'vitest'
import { useWizardStore } from '@/stores/wizardStore'
import type { HeirType } from '@/core/faraid/types'

const initialState = useWizardStore.getState()

beforeEach(() => {
  useWizardStore.setState(initialState, true)
})

describe('initial state', () => {
  it('starts with currentStep=1, relationship=null, all counts at 0', () => {
    const state = useWizardStore.getState()
    expect(state.currentStep).toBe(1)
    expect(state.relationship).toBeNull()
    expect(state.deceasedGender).toBeNull()
    expect(state.userGender).toBeNull()
    expect(state.mfloEnabled).toBe(false)
    expect(state.motherAlive).toBeNull()
    expect(state.autoIncludes).toEqual([])
    expect(state.wifeCount).toBe(0)
    expect(state.husbandPresent).toBe(false)
    expect(state.sonCount).toBe(0)
    expect(state.daughterCount).toBe(0)
    expect(state.siblingTypeExpanded).toBe(false)
    expect(state.brotherFullCount).toBe(0)
    expect(state.brotherConsanguineCount).toBe(0)
    expect(state.brotherUterineCount).toBe(0)
    expect(state.sisterFullCount).toBe(0)
    expect(state.sisterConsanguineCount).toBe(0)
    expect(state.sisterUterineCount).toBe(0)
    expect(state.completedSteps).toEqual([])
  })
})

describe('relationship derivation', () => {
  it('setRelationship("father") sets deceasedGender="male"', () => {
    useWizardStore.getState().setRelationship('father')
    expect(useWizardStore.getState().deceasedGender).toBe('male')
  })

  it('setRelationship("mother") sets deceasedGender="female"', () => {
    useWizardStore.getState().setRelationship('mother')
    expect(useWizardStore.getState().deceasedGender).toBe('female')
  })

  it('setRelationship("husband") sets deceasedGender="female"', () => {
    useWizardStore.getState().setRelationship('husband')
    expect(useWizardStore.getState().deceasedGender).toBe('female')
  })

  it('setRelationship("wife") sets deceasedGender="male"', () => {
    useWizardStore.getState().setRelationship('wife')
    expect(useWizardStore.getState().deceasedGender).toBe('male')
  })

  it('setRelationship("brother") sets deceasedGender="male"', () => {
    useWizardStore.getState().setRelationship('brother')
    expect(useWizardStore.getState().deceasedGender).toBe('male')
  })

  it('setRelationship("sister") sets deceasedGender="female"', () => {
    useWizardStore.getState().setRelationship('sister')
    expect(useWizardStore.getState().deceasedGender).toBe('female')
  })

  it('setRelationship("other") sets deceasedGender=null', () => {
    useWizardStore.getState().setRelationship('other')
    expect(useWizardStore.getState().deceasedGender).toBeNull()
  })

  it('derives userGender for husband', () => {
    useWizardStore.getState().setRelationship('husband')
    expect(useWizardStore.getState().userGender).toBe('male')
  })

  it('derives userGender for wife', () => {
    useWizardStore.getState().setRelationship('wife')
    expect(useWizardStore.getState().userGender).toBe('female')
  })

  it('userGender is null for father (ambiguous)', () => {
    useWizardStore.getState().setRelationship('father')
    expect(useWizardStore.getState().userGender).toBeNull()
  })
})

describe('auto-includes', () => {
  it('father + male user adds son auto-include', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setUserGender('male')
    expect(useWizardStore.getState().autoIncludes).toEqual([
      { type: 'son', count: 1 },
    ])
  })

  it('father + female user adds daughter auto-include', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setUserGender('female')
    expect(useWizardStore.getState().autoIncludes).toEqual([
      { type: 'daughter', count: 1 },
    ])
  })

  it('mother + male user adds son auto-include', () => {
    useWizardStore.getState().setRelationship('mother')
    useWizardStore.getState().setUserGender('male')
    expect(useWizardStore.getState().autoIncludes).toEqual([
      { type: 'son', count: 1 },
    ])
  })

  it('husband adds husband auto-include', () => {
    useWizardStore.getState().setRelationship('husband')
    expect(useWizardStore.getState().autoIncludes).toEqual([
      { type: 'husband', count: 1 },
    ])
  })

  it('wife adds wife auto-include', () => {
    useWizardStore.getState().setRelationship('wife')
    expect(useWizardStore.getState().autoIncludes).toEqual([
      { type: 'wife', count: 1 },
    ])
  })

  it('brother adds brother_full auto-include', () => {
    useWizardStore.getState().setRelationship('brother')
    expect(useWizardStore.getState().autoIncludes).toEqual([
      { type: 'brother_full', count: 1 },
    ])
  })

  it('sister adds sister_full auto-include', () => {
    useWizardStore.getState().setRelationship('sister')
    expect(useWizardStore.getState().autoIncludes).toEqual([
      { type: 'sister_full', count: 1 },
    ])
  })

  it('other has no auto-includes', () => {
    useWizardStore.getState().setRelationship('other')
    expect(useWizardStore.getState().autoIncludes).toEqual([])
  })
})

describe('auto-include cleanup on relationship change', () => {
  it('changing from father to wife clears old auto-includes', () => {
    const store = useWizardStore.getState()
    store.setRelationship('father')
    store.setUserGender('male')
    expect(useWizardStore.getState().autoIncludes).toEqual([
      { type: 'son', count: 1 },
    ])

    useWizardStore.getState().setRelationship('wife')
    expect(useWizardStore.getState().autoIncludes).toEqual([
      { type: 'wife', count: 1 },
    ])
  })

  it('resets motherAlive when relationship changes', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setMotherAlive(true)
    expect(useWizardStore.getState().motherAlive).toBe(true)

    useWizardStore.getState().setRelationship('wife')
    expect(useWizardStore.getState().motherAlive).toBeNull()
  })

  it('resets wifeCount and husbandPresent when relationship changes', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setWifeCount(2)
    expect(useWizardStore.getState().wifeCount).toBe(2)

    useWizardStore.getState().setRelationship('wife')
    expect(useWizardStore.getState().wifeCount).toBe(0)
    expect(useWizardStore.getState().husbandPresent).toBe(false)
  })

  it('does NOT reset sonCount/daughterCount when relationship changes', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setSonCount(3)
    useWizardStore.getState().setDaughterCount(2)

    useWizardStore.getState().setRelationship('wife')
    expect(useWizardStore.getState().sonCount).toBe(3)
    expect(useWizardStore.getState().daughterCount).toBe(2)
  })
})

describe('mother alive auto-include', () => {
  it('father + male user + motherAlive adds wife auto-include', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setUserGender('male')
    useWizardStore.getState().setMotherAlive(true)
    expect(useWizardStore.getState().autoIncludes).toEqual([
      { type: 'son', count: 1 },
      { type: 'wife', count: 1 },
    ])
  })

  it('father + male user + motherAlive=false does not add wife', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setUserGender('male')
    useWizardStore.getState().setMotherAlive(false)
    expect(useWizardStore.getState().autoIncludes).toEqual([
      { type: 'son', count: 1 },
    ])
  })
})

describe('buildFaraidInput', () => {
  it('builds basic input with spouse and children', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setUserGender('male')
    useWizardStore.getState().setWifeCount(1)
    useWizardStore.getState().setSonCount(2)
    useWizardStore.getState().setDaughterCount(1)

    const input = useWizardStore.getState().buildFaraidInput()
    expect(input.deceasedGender).toBe('male')
    expect(input.mfloEnabled).toBe(false)

    // Auto-include: 1 son + manual: 2 sons = 3 total sons
    const son = input.heirs.find((h) => h.type === 'son')
    expect(son).toEqual({ type: 'son', count: 3 })

    const daughter = input.heirs.find((h) => h.type === 'daughter')
    expect(daughter).toEqual({ type: 'daughter', count: 1 })

    const wife = input.heirs.find((h) => h.type === 'wife')
    expect(wife).toEqual({ type: 'wife', count: 1 })
  })

  it('filters out zero-count heirs', () => {
    useWizardStore.getState().setRelationship('wife')
    // wife auto-includes wife:1, deceased is male
    const input = useWizardStore.getState().buildFaraidInput()
    expect(input.heirs.every((h) => h.count > 0)).toBe(true)
    // Should only have wife heir
    expect(input.heirs).toEqual([{ type: 'wife', count: 1 }])
  })

  it('treats collapsed siblings as brother_full/sister_full', () => {
    useWizardStore.getState().setRelationship('other')
    useWizardStore.getState().setDeceasedGender('male')
    useWizardStore.getState().setBrotherFullCount(1)
    useWizardStore.getState().setBrotherConsanguineCount(2)
    useWizardStore.getState().setSisterFullCount(1)

    const input = useWizardStore.getState().buildFaraidInput()
    // siblingTypeExpanded=false, so all brothers summed as brother_full
    const brothers = input.heirs.find((h) => h.type === 'brother_full')
    expect(brothers).toEqual({ type: 'brother_full', count: 3 })
    const sisters = input.heirs.find((h) => h.type === 'sister_full')
    expect(sisters).toEqual({ type: 'sister_full', count: 1 })
    // No consanguine brothers should appear
    expect(input.heirs.find((h) => h.type === 'brother_consanguine')).toBeUndefined()
  })

  it('preserves sibling sub-types when expanded', () => {
    useWizardStore.getState().setRelationship('other')
    useWizardStore.getState().setDeceasedGender('male')
    useWizardStore.getState().setSiblingTypeExpanded(true)
    useWizardStore.getState().setBrotherFullCount(1)
    useWizardStore.getState().setBrotherConsanguineCount(2)
    useWizardStore.getState().setSisterUterineCount(3)

    const input = useWizardStore.getState().buildFaraidInput()
    expect(input.heirs.find((h) => h.type === 'brother_full')).toEqual({
      type: 'brother_full',
      count: 1,
    })
    expect(input.heirs.find((h) => h.type === 'brother_consanguine')).toEqual({
      type: 'brother_consanguine',
      count: 2,
    })
    expect(input.heirs.find((h) => h.type === 'sister_uterine')).toEqual({
      type: 'sister_uterine',
      count: 3,
    })
  })

  it('includes mfloEnabled flag', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setUserGender('male')
    useWizardStore.getState().setMfloEnabled(true)
    const input = useWizardStore.getState().buildFaraidInput()
    expect(input.mfloEnabled).toBe(true)
  })

  it('husband present when deceased is female', () => {
    useWizardStore.getState().setRelationship('other')
    useWizardStore.getState().setDeceasedGender('female')
    useWizardStore.getState().setHusbandPresent(true)

    const input = useWizardStore.getState().buildFaraidInput()
    expect(input.heirs.find((h) => h.type === 'husband')).toEqual({
      type: 'husband',
      count: 1,
    })
  })

  it('auto-includes merge with manual counts (additive)', () => {
    // brother auto-includes brother_full:1
    useWizardStore.getState().setRelationship('brother')
    useWizardStore.getState().setBrotherFullCount(2)
    // auto-include: 1 brother_full + manual: 2 = 3 total
    // But in collapsed mode, all brothers sum to brother_full
    const input = useWizardStore.getState().buildFaraidInput()
    const brothers = input.heirs.find((h) => h.type === 'brother_full')
    expect(brothers).toEqual({ type: 'brother_full', count: 3 })
  })
})

describe('step navigation', () => {
  it('setStep(2) updates currentStep and adds to completedSteps', () => {
    useWizardStore.getState().setStep(2)
    expect(useWizardStore.getState().currentStep).toBe(2)
    expect(useWizardStore.getState().completedSteps).toContain(1)
  })

  it('setStep(3) marks steps 1 and 2 as completed', () => {
    useWizardStore.getState().setStep(2)
    useWizardStore.getState().setStep(3)
    expect(useWizardStore.getState().completedSteps).toContain(1)
    expect(useWizardStore.getState().completedSteps).toContain(2)
  })
})

describe('step validation', () => {
  it('isStepValid(1) false when no relationship selected', () => {
    expect(useWizardStore.getState().isStepValid(1)).toBe(false)
  })

  it('isStepValid(1) true when relationship selected (non-other)', () => {
    useWizardStore.getState().setRelationship('father')
    expect(useWizardStore.getState().isStepValid(1)).toBe(true)
  })

  it('isStepValid(1) false for "other" without deceasedGender', () => {
    useWizardStore.getState().setRelationship('other')
    expect(useWizardStore.getState().isStepValid(1)).toBe(false)
  })

  it('isStepValid(1) true for "other" with deceasedGender set', () => {
    useWizardStore.getState().setRelationship('other')
    useWizardStore.getState().setDeceasedGender('male')
    expect(useWizardStore.getState().isStepValid(1)).toBe(true)
  })

  it('isStepValid(2) always true (zero heirs is valid)', () => {
    expect(useWizardStore.getState().isStepValid(2)).toBe(true)
  })

  it('isStepValid(3) always true (zero siblings is valid)', () => {
    expect(useWizardStore.getState().isStepValid(3)).toBe(true)
  })
})

describe('progressive disclosure preserves counts', () => {
  it('toggling siblingTypeExpanded does NOT reset sibling counts', () => {
    useWizardStore.getState().setSiblingTypeExpanded(true)
    useWizardStore.getState().setBrotherConsanguineCount(3)
    useWizardStore.getState().setSisterUterineCount(2)

    useWizardStore.getState().setSiblingTypeExpanded(false)
    expect(useWizardStore.getState().brotherConsanguineCount).toBe(3)
    expect(useWizardStore.getState().sisterUterineCount).toBe(2)
  })
})

describe('bounds checking', () => {
  it('wifeCount max is 4', () => {
    useWizardStore.getState().setWifeCount(5)
    expect(useWizardStore.getState().wifeCount).toBe(4)
  })

  it('wifeCount min is 0', () => {
    useWizardStore.getState().setWifeCount(-1)
    expect(useWizardStore.getState().wifeCount).toBe(0)
  })

  it('sonCount min is 0', () => {
    useWizardStore.getState().setSonCount(-1)
    expect(useWizardStore.getState().sonCount).toBe(0)
  })

  it('daughterCount min is 0', () => {
    useWizardStore.getState().setDaughterCount(-1)
    expect(useWizardStore.getState().daughterCount).toBe(0)
  })
})

describe('parents excluded (HEIR-05)', () => {
  it('buildFaraidInput never includes father heir type', () => {
    // Regardless of relationship, parent types should never appear in wizard output
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setUserGender('male')
    useWizardStore.getState().setMotherAlive(true)
    useWizardStore.getState().setWifeCount(1)
    useWizardStore.getState().setSonCount(3)
    useWizardStore.getState().setDaughterCount(2)
    useWizardStore.getState().setBrotherFullCount(1)

    const input = useWizardStore.getState().buildFaraidInput()
    const parentTypes: HeirType[] = [
      'father',
      'mother',
      'paternal_grandfather',
      'paternal_grandmother',
      'maternal_grandmother',
    ]
    for (const pt of parentTypes) {
      expect(
        input.heirs.find((h) => h.type === pt),
        `should not include ${pt}`,
      ).toBeUndefined()
    }
  })

  it('auto-includes never include parent/grandparent types', () => {
    const relationships = [
      'father',
      'mother',
      'husband',
      'wife',
      'brother',
      'sister',
      'other',
    ] as const
    const parentTypes: HeirType[] = [
      'father',
      'mother',
      'paternal_grandfather',
      'paternal_grandmother',
      'maternal_grandmother',
    ]
    for (const rel of relationships) {
      useWizardStore.setState(initialState, true)
      useWizardStore.getState().setRelationship(rel)
      useWizardStore.getState().setUserGender('male')
      useWizardStore.getState().setMotherAlive(true)
      const autoIncludes = useWizardStore.getState().autoIncludes
      for (const ai of autoIncludes) {
        expect(parentTypes).not.toContain(ai.type)
      }
    }
  })
})

describe('property CRUD', () => {
  it('addProperty creates property with UUID and default values', () => {
    const id = useWizardStore.getState().addProperty()
    expect(id).toBeTruthy()
    const state = useWizardStore.getState()
    expect(state.properties).toHaveLength(1)
    expect(state.properties[0].id).toBe(id)
    expect(state.properties[0].landInputUnit).toBe('decimal')
    expect(state.properties[0].type).toBeNull()
    expect(state.properties[0].division).toBeNull()
    expect(state.expandedPropertyId).toBe(id)
  })

  it('removeProperty removes the correct property by ID', () => {
    const id1 = useWizardStore.getState().addProperty()
    const id2 = useWizardStore.getState().addProperty()
    expect(useWizardStore.getState().properties).toHaveLength(2)
    useWizardStore.getState().removeProperty(id1)
    expect(useWizardStore.getState().properties).toHaveLength(1)
    expect(useWizardStore.getState().properties[0].id).toBe(id2)
  })

  it('removeProperty clears expandedPropertyId if it was the removed one', () => {
    const id = useWizardStore.getState().addProperty()
    expect(useWizardStore.getState().expandedPropertyId).toBe(id)
    useWizardStore.getState().removeProperty(id)
    expect(useWizardStore.getState().expandedPropertyId).toBeNull()
  })

  it('updateProperty patches the correct property', () => {
    const id = useWizardStore.getState().addProperty()
    useWizardStore.getState().updateProperty(id, { nickname: 'Bari', landValue: 50000 })
    const p = useWizardStore.getState().properties[0]
    expect(p.nickname).toBe('Bari')
    expect(p.landValue).toBe(50000)
  })

  it('getAllPropertiesTotal returns correct sum across multiple properties', () => {
    const id1 = useWizardStore.getState().addProperty()
    const id2 = useWizardStore.getState().addProperty()
    useWizardStore.getState().updateProperty(id1, { landValue: 100000 })
    useWizardStore.getState().updateProperty(id2, { landValue: 200000 })
    expect(useWizardStore.getState().getAllPropertiesTotal()).toBe(300000)
  })
})

describe('step reindexing', () => {
  it('calculateShares now sets currentStep to 5', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setUserGender('male')
    useWizardStore.getState().calculateShares()
    expect(useWizardStore.getState().currentStep).toBe(5)
  })

  it('isStepValid(4) returns true (properties always valid)', () => {
    expect(useWizardStore.getState().isStepValid(4)).toBe(true)
  })

  it('isStepValid(5) returns true (results always valid)', () => {
    expect(useWizardStore.getState().isStepValid(5)).toBe(true)
  })

  it('calculateShares marks steps 3 and 4 as completed', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setUserGender('male')
    useWizardStore.getState().calculateShares()
    expect(useWizardStore.getState().completedSteps).toContain(3)
    expect(useWizardStore.getState().completedSteps).toContain(4)
  })
})

describe('setDeceasedGender for "other"', () => {
  it('allows setting deceased gender explicitly for "other" relationship', () => {
    useWizardStore.getState().setRelationship('other')
    useWizardStore.getState().setDeceasedGender('female')
    expect(useWizardStore.getState().deceasedGender).toBe('female')
  })
})

describe('setMfloEnabled', () => {
  it('toggles MFLO', () => {
    useWizardStore.getState().setMfloEnabled(true)
    expect(useWizardStore.getState().mfloEnabled).toBe(true)
    useWizardStore.getState().setMfloEnabled(false)
    expect(useWizardStore.getState().mfloEnabled).toBe(false)
  })
})
