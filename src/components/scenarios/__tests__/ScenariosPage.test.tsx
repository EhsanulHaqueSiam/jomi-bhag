import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWizardStore } from '@/stores/wizardStore'
import { useScenariosStore } from '@/stores/scenariosStore'
import { ScenariosPage } from '../ScenariosPage'
import type { MovableAsset } from '@/core/assets/types'

beforeEach(() => {
  // Reset wizard store with non-empty movable assets to verify they get cleared
  useWizardStore.setState({
    movableAssets: [
      {
        id: 'test-asset',
        category: 'cash',
        value: 50000,
        isIndivisible: false,
        indivisibleResolution: null,
      } as MovableAsset,
    ],
    expandedAssetId: 'test-asset',
  })

  // Add a scenario so "New Calculation" button appears in the main view
  useScenariosStore.getState().saveScenario()
})

describe('ScenariosPage', () => {
  it('handleNewCalculation resets movableAssets to [] and expandedAssetId to null', () => {
    const onNavigate = vi.fn()
    render(<ScenariosPage onNavigate={onNavigate} />)

    // Verify initial state has movable assets
    expect(useWizardStore.getState().movableAssets).toHaveLength(1)
    expect(useWizardStore.getState().expandedAssetId).toBe('test-asset')

    // Click the "+ New Calculation" button
    const newCalcButton = screen.getByText('+ New Calculation')
    fireEvent.click(newCalcButton)

    // Verify movableAssets and expandedAssetId are reset
    const state = useWizardStore.getState()
    expect(state.movableAssets).toEqual([])
    expect(state.expandedAssetId).toBeNull()
    expect(onNavigate).toHaveBeenCalledWith('wizard')
  })
})
