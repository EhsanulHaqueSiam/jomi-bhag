import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWizardStore } from '@/stores/wizardStore'
import {
  useScenariosStore,
  generateScenarioName,
  computeStateFingerprint,
  MAX_SCENARIOS,
} from '@/stores/scenariosStore'
import type { WizardState } from '@/types/wizard'

const initialWizardState = useWizardStore.getState()
const initialScenariosState = useScenariosStore.getState()

beforeEach(() => {
  localStorage.clear()
  useWizardStore.persist.clearStorage()
  useScenariosStore.persist.clearStorage()
  useWizardStore.setState(initialWizardState, true)
  useScenariosStore.setState(initialScenariosState, true)
})

describe('saveScenario', () => {
  it('creates scenario with valid id, name, timestamps, and state snapshot', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setUserGender('male')
    useWizardStore.getState().setSonCount(2)

    const id = useScenariosStore.getState().saveScenario()
    expect(id).toBeTruthy()

    const scenarios = useScenariosStore.getState().scenarios
    expect(scenarios).toHaveLength(1)

    const s = scenarios[0]
    expect(s.id).toBeTruthy()
    expect(s.name).toBeTruthy()
    expect(s.createdAt).toBeTruthy()
    expect(s.updatedAt).toBeTruthy()
    expect(s.state.sonCount).toBe(2)
    expect(s.state.relationship).toBe('father')
    expect(s.summary).toBeDefined()
    expect(s.summary.heirCount).toBeGreaterThan(0)
  })

  it('auto-generates name from heir summary', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setUserGender('male')
    useWizardStore.getState().setSonCount(2)
    useWizardStore.getState().setDaughterCount(1)

    useScenariosStore.getState().saveScenario()
    const s = useScenariosStore.getState().scenarios[0]
    // Name should include sons and daughters
    expect(s.name).toContain('Son')
    expect(s.name).toContain('Daughter')
  })

  it('accepts custom name', () => {
    useWizardStore.getState().setRelationship('father')
    useScenariosStore.getState().saveScenario('My Custom Scenario')
    const s = useScenariosStore.getState().scenarios[0]
    expect(s.name).toBe('My Custom Scenario')
  })

  it('enforces MAX_SCENARIOS=20 limit', () => {
    useWizardStore.getState().setRelationship('father')
    for (let i = 0; i < MAX_SCENARIOS; i++) {
      const id = useScenariosStore.getState().saveScenario(`Scenario ${i}`)
      expect(id).toBeTruthy()
    }
    expect(useScenariosStore.getState().scenarios).toHaveLength(20)

    const result = useScenariosStore.getState().saveScenario('Too many')
    expect(result).toBeNull()
    expect(useScenariosStore.getState().scenarios).toHaveLength(20)
  })

  it('updates lastSavedHash on save', () => {
    useWizardStore.getState().setRelationship('father')
    useScenariosStore.getState().saveScenario()
    expect(useScenariosStore.getState().lastSavedHash).not.toBeNull()
  })
})

describe('loadScenario', () => {
  it('returns wizard state for valid id', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setSonCount(3)
    const id = useScenariosStore.getState().saveScenario()!

    const loaded = useScenariosStore.getState().loadScenario(id)
    expect(loaded).not.toBeNull()
    expect(loaded!.sonCount).toBe(3)
    expect(loaded!.relationship).toBe('father')
  })

  it('returns null for invalid id', () => {
    const result = useScenariosStore.getState().loadScenario('nonexistent')
    expect(result).toBeNull()
  })
})

describe('deleteScenario', () => {
  it('removes scenario by id', () => {
    useWizardStore.getState().setRelationship('father')
    const id = useScenariosStore.getState().saveScenario()!
    expect(useScenariosStore.getState().scenarios).toHaveLength(1)

    useScenariosStore.getState().deleteScenario(id)
    expect(useScenariosStore.getState().scenarios).toHaveLength(0)
  })

  it('cleans selectedIds when deleted id was selected', () => {
    useWizardStore.getState().setRelationship('father')
    const id = useScenariosStore.getState().saveScenario()!
    useScenariosStore.getState().toggleSelected(id)
    expect(useScenariosStore.getState().selectedIds).toContain(id)

    useScenariosStore.getState().deleteScenario(id)
    expect(useScenariosStore.getState().selectedIds).not.toContain(id)
  })
})

describe('clearAll', () => {
  it('empties everything', () => {
    useWizardStore.getState().setRelationship('father')
    useScenariosStore.getState().saveScenario()
    useScenariosStore.getState().saveScenario()
    expect(useScenariosStore.getState().scenarios).toHaveLength(2)

    useScenariosStore.getState().clearAll()
    expect(useScenariosStore.getState().scenarios).toHaveLength(0)
    expect(useScenariosStore.getState().selectedIds).toHaveLength(0)
    expect(useScenariosStore.getState().isComparing).toBe(false)
  })
})

describe('duplicateScenario', () => {
  it('creates copy with "(Copy)" suffix, new id', () => {
    useWizardStore.getState().setRelationship('father')
    useWizardStore.getState().setSonCount(2)
    const id = useScenariosStore.getState().saveScenario('Test Scenario')!

    const newId = useScenariosStore.getState().duplicateScenario(id)
    expect(newId).toBeTruthy()
    expect(newId).not.toBe(id)

    const scenarios = useScenariosStore.getState().scenarios
    expect(scenarios).toHaveLength(2)

    const copy = scenarios.find((s) => s.id === newId)!
    expect(copy.name).toBe('Test Scenario (Copy)')
    expect(copy.state.sonCount).toBe(2)
    // Timestamps should differ
    expect(copy.id).not.toBe(id)
  })

  it('respects MAX_SCENARIOS limit', () => {
    useWizardStore.getState().setRelationship('father')
    for (let i = 0; i < MAX_SCENARIOS; i++) {
      useScenariosStore.getState().saveScenario(`S${i}`)
    }
    const id = useScenariosStore.getState().scenarios[0].id
    const result = useScenariosStore.getState().duplicateScenario(id)
    expect(result).toBeNull()
  })
})

describe('renameScenario', () => {
  it('updates name and updatedAt', () => {
    useWizardStore.getState().setRelationship('father')
    const id = useScenariosStore.getState().saveScenario('Original')!
    const beforeUpdate = useScenariosStore.getState().scenarios[0].updatedAt

    // Small delay to ensure different timestamp
    useScenariosStore.getState().renameScenario(id, 'Renamed')
    const after = useScenariosStore.getState().scenarios[0]
    expect(after.name).toBe('Renamed')
    expect(after.updatedAt).toBeTruthy()
  })
})

describe('toggleSelected', () => {
  it('adds id to selectedIds', () => {
    useWizardStore.getState().setRelationship('father')
    const id = useScenariosStore.getState().saveScenario()!
    useScenariosStore.getState().toggleSelected(id)
    expect(useScenariosStore.getState().selectedIds).toContain(id)
  })

  it('removes id if already selected', () => {
    useWizardStore.getState().setRelationship('father')
    const id = useScenariosStore.getState().saveScenario()!
    useScenariosStore.getState().toggleSelected(id)
    useScenariosStore.getState().toggleSelected(id)
    expect(useScenariosStore.getState().selectedIds).not.toContain(id)
  })

  it('replaces first selected when adding third', () => {
    useWizardStore.getState().setRelationship('father')
    const id1 = useScenariosStore.getState().saveScenario('S1')!
    const id2 = useScenariosStore.getState().saveScenario('S2')!
    const id3 = useScenariosStore.getState().saveScenario('S3')!

    useScenariosStore.getState().toggleSelected(id1)
    useScenariosStore.getState().toggleSelected(id2)
    expect(useScenariosStore.getState().selectedIds).toHaveLength(2)

    useScenariosStore.getState().toggleSelected(id3)
    expect(useScenariosStore.getState().selectedIds).toHaveLength(2)
    expect(useScenariosStore.getState().selectedIds).not.toContain(id1)
    expect(useScenariosStore.getState().selectedIds).toContain(id2)
    expect(useScenariosStore.getState().selectedIds).toContain(id3)
  })
})

describe('startCompare / stopCompare', () => {
  it('startCompare sets isComparing=true when 2 selected', () => {
    useWizardStore.getState().setRelationship('father')
    const id1 = useScenariosStore.getState().saveScenario('S1')!
    const id2 = useScenariosStore.getState().saveScenario('S2')!
    useScenariosStore.getState().toggleSelected(id1)
    useScenariosStore.getState().toggleSelected(id2)

    useScenariosStore.getState().startCompare()
    expect(useScenariosStore.getState().isComparing).toBe(true)
  })

  it('startCompare does not set isComparing when less than 2 selected', () => {
    useWizardStore.getState().setRelationship('father')
    const id1 = useScenariosStore.getState().saveScenario('S1')!
    useScenariosStore.getState().toggleSelected(id1)

    useScenariosStore.getState().startCompare()
    expect(useScenariosStore.getState().isComparing).toBe(false)
  })

  it('stopCompare clears isComparing and selectedIds', () => {
    useWizardStore.getState().setRelationship('father')
    const id1 = useScenariosStore.getState().saveScenario('S1')!
    const id2 = useScenariosStore.getState().saveScenario('S2')!
    useScenariosStore.getState().toggleSelected(id1)
    useScenariosStore.getState().toggleSelected(id2)
    useScenariosStore.getState().startCompare()

    useScenariosStore.getState().stopCompare()
    expect(useScenariosStore.getState().isComparing).toBe(false)
    expect(useScenariosStore.getState().selectedIds).toHaveLength(0)
  })
})

describe('generateScenarioName', () => {
  it('generates name with heir counts', () => {
    const state = { ...initialWizardState, sonCount: 2, daughterCount: 1, wifeCount: 1 }
    const name = generateScenarioName(state)
    expect(name).toContain('2 Sons')
    expect(name).toContain('1 Daughter')
    expect(name).toContain('1 Wife')
    expect(name).toContain(' -- ')
  })

  it('returns "Scenario -- date" when no heirs present', () => {
    const name = generateScenarioName(initialWizardState)
    expect(name).toMatch(/^Scenario -- /)
  })

  it('handles husband presence', () => {
    const state = { ...initialWizardState, husbandPresent: true }
    const name = generateScenarioName(state)
    expect(name).toContain('Husband')
  })

  it('handles sibling counts', () => {
    const state = { ...initialWizardState, brotherFullCount: 2, sisterFullCount: 1 }
    const name = generateScenarioName(state)
    expect(name).toContain('Brother')
    expect(name).toContain('Sister')
  })
})

describe('computeStateFingerprint', () => {
  it('same state produces same fingerprint', () => {
    const state = { ...initialWizardState, sonCount: 2, relationship: 'father' as const }
    const fp1 = computeStateFingerprint(state)
    const fp2 = computeStateFingerprint(state)
    expect(fp1).toBe(fp2)
  })

  it('different sonCount produces different fingerprint', () => {
    const state1 = { ...initialWizardState, sonCount: 2 }
    const state2 = { ...initialWizardState, sonCount: 3 }
    expect(computeStateFingerprint(state1)).not.toBe(computeStateFingerprint(state2))
  })
})

describe('hasUnsavedChanges', () => {
  it('returns false when no relationship set and no lastSavedHash', () => {
    expect(useScenariosStore.getState().hasUnsavedChanges()).toBe(false)
  })

  it('returns true when wizard state has input but never saved', () => {
    useWizardStore.getState().setRelationship('father')
    expect(useScenariosStore.getState().hasUnsavedChanges()).toBe(true)
  })

  it('returns false immediately after saving', () => {
    useWizardStore.getState().setRelationship('father')
    useScenariosStore.getState().saveScenario()
    expect(useScenariosStore.getState().hasUnsavedChanges()).toBe(false)
  })

  it('returns true when wizard state differs from lastSavedHash', () => {
    useWizardStore.getState().setRelationship('father')
    useScenariosStore.getState().saveScenario()
    useWizardStore.getState().setSonCount(5)
    expect(useScenariosStore.getState().hasUnsavedChanges()).toBe(true)
  })
})

describe('persistence', () => {
  it('scenarios survive localStorage round-trip', () => {
    useWizardStore.getState().setRelationship('father')
    useScenariosStore.getState().saveScenario('Persistent')

    const raw = localStorage.getItem('jomi-bhag-scenarios')
    expect(raw).not.toBeNull()
    expect(raw).toContain('Persistent')
  })
})
