import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useWizardStore } from '@/stores/wizardStore'
import type {
  GoldSilverAsset,
  LivestockAsset,
  CashAsset,
  VehicleAsset,
  CustomAsset,
} from '@/core/assets/types'
import { MovableAssetCard } from '@/components/assets/MovableAssetCard'
import { MovableAssetList } from '@/components/assets/MovableAssetList'
import { StepEstateInventory } from '@/components/assets/StepEstateInventory'
import { GoldSilverForm } from '@/components/assets/GoldSilverForm'
import { LivestockForm } from '@/components/assets/LivestockForm'

// Reset store before each test
beforeEach(() => {
  useWizardStore.setState({
    properties: [],
    expandedPropertyId: null,
    movableAssets: [],
    expandedAssetId: null,
  })
})

function makeGoldAsset(overrides: Partial<GoldSilverAsset> = {}): GoldSilverAsset {
  return {
    id: crypto.randomUUID(),
    category: 'gold_silver',
    isIndivisible: false,
    indivisibleResolution: null,
    metalType: 'gold',
    weight: 5,
    weightUnit: 'vori',
    purity: '22K',
    useAutoRate: true,
    overrideValue: null,
    ...overrides,
  }
}

function makeCashAsset(overrides: Partial<CashAsset> = {}): CashAsset {
  return {
    id: crypto.randomUUID(),
    category: 'cash',
    isIndivisible: false,
    indivisibleResolution: null,
    value: 500000,
    ...overrides,
  }
}

function makeVehicleAsset(overrides: Partial<VehicleAsset> = {}): VehicleAsset {
  return {
    id: crypto.randomUUID(),
    category: 'vehicle',
    isIndivisible: true,
    indivisibleResolution: null,
    vehicleType: 'car',
    description: 'Toyota Corolla 2020',
    estimatedValue: 2500000,
    ...overrides,
  }
}

function makeLivestockAsset(overrides: Partial<LivestockAsset> = {}): LivestockAsset {
  return {
    id: crypto.randomUUID(),
    category: 'livestock',
    isIndivisible: true,
    indivisibleResolution: null,
    livestockType: 'cow',
    count: 3,
    perUnitValue: 100000,
    ...overrides,
  }
}

function makeCustomAsset(overrides: Partial<CustomAsset> = {}): CustomAsset {
  return {
    id: crypto.randomUUID(),
    category: 'custom',
    isIndivisible: true,
    indivisibleResolution: null,
    name: 'Sewing machine',
    estimatedValue: 15000,
    ...overrides,
  }
}

describe('MovableAssetCard', () => {
  test('renders collapsed header with category label and value', () => {
    const asset = makeCashAsset({ value: 500000 })
    useWizardStore.setState({
      movableAssets: [asset],
      expandedAssetId: null,
    })

    render(<MovableAssetCard assetId={asset.id} />)
    expect(screen.getByText('Cash/Bank Deposits')).toBeInTheDocument()
    expect(screen.getByText(/5,00,000/)).toBeInTheDocument()
  })

  test('expands on click to show form', () => {
    const asset = makeCashAsset()
    useWizardStore.setState({
      movableAssets: [asset],
      expandedAssetId: null,
    })

    render(<MovableAssetCard assetId={asset.id} />)
    // Click the header button to expand
    fireEvent.click(screen.getByText('Cash/Bank Deposits'))

    // Should now show the form label and indivisible toggle
    expect(screen.getByText('This item is indivisible')).toBeInTheDocument()
  })

  test('shows Indivisible badge when asset is indivisible', () => {
    const asset = makeVehicleAsset()
    useWizardStore.setState({
      movableAssets: [asset],
      expandedAssetId: null,
    })

    render(<MovableAssetCard assetId={asset.id} />)
    expect(screen.getByText('Indivisible')).toBeInTheDocument()
  })

  test('shows vehicle description as label when available', () => {
    const asset = makeVehicleAsset({ description: 'Toyota Corolla 2020' })
    useWizardStore.setState({
      movableAssets: [asset],
      expandedAssetId: null,
    })

    render(<MovableAssetCard assetId={asset.id} />)
    expect(screen.getByText('Toyota Corolla 2020')).toBeInTheDocument()
  })

  test('shows custom item name as label', () => {
    const asset = makeCustomAsset({ name: 'Generator' })
    useWizardStore.setState({
      movableAssets: [asset],
      expandedAssetId: null,
    })

    render(<MovableAssetCard assetId={asset.id} />)
    expect(screen.getByText('Generator')).toBeInTheDocument()
  })
})

describe('GoldSilverForm', () => {
  test('renders weight input, purity dropdown, and rate suggestion when weight > 0', () => {
    const asset = makeGoldAsset({ weight: 5, purity: '22K' })
    const onUpdate = () => {}

    render(<GoldSilverForm asset={asset} onUpdate={onUpdate} />)
    // Weight input
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    // Purity dropdown
    expect(screen.getByDisplayValue('22K (Standard)')).toBeInTheDocument()
    // Rate suggestion should appear since weight > 0
    expect(screen.getByText(/Use this rate/)).toBeInTheDocument()
    // Metal type buttons
    expect(screen.getByText('Gold')).toBeInTheDocument()
    expect(screen.getByText('Silver')).toBeInTheDocument()
  })

  test('shows unit conversion when weight > 0', () => {
    const asset = makeGoldAsset({ weight: 5, weightUnit: 'vori' })
    const onUpdate = () => {}

    render(<GoldSilverForm asset={asset} onUpdate={onUpdate} />)
    // 5 vori = 58.32 grams
    expect(screen.getByText(/58\.32/)).toBeInTheDocument()
  })
})

describe('LivestockForm', () => {
  test('renders count stepper and per-unit value', () => {
    const asset = makeLivestockAsset({ count: 3, perUnitValue: 100000 })
    const onUpdate = () => {}

    render(<LivestockForm asset={asset} onUpdate={onUpdate} />)
    // Count stepper displays value
    expect(screen.getByText('3')).toBeInTheDocument()
    // Count label
    expect(screen.getByText('Count')).toBeInTheDocument()
    // Auto-calculated total: 3 x 100000 = 300000
    expect(screen.getByText(/3,00,000/)).toBeInTheDocument()
  })
})

describe('MovableAssetList', () => {
  test('shows empty state when no assets', () => {
    useWizardStore.setState({ movableAssets: [] })

    render(<MovableAssetList />)
    expect(screen.getByText('No movable assets added')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Add gold, cash, vehicles, or other assets to include in the estate',
      ),
    ).toBeInTheDocument()
  })

  test('shows asset cards when assets exist', () => {
    const cash = makeCashAsset({ value: 100000 })
    const vehicle = makeVehicleAsset({ description: 'Bike' })
    useWizardStore.setState({
      movableAssets: [cash, vehicle],
    })

    render(<MovableAssetList />)
    // "Cash/Bank Deposits" appears in both category picker button and asset card
    const cashMatches = screen.getAllByText('Cash/Bank Deposits')
    expect(cashMatches.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Bike')).toBeInTheDocument()
    // Empty state should NOT be visible
    expect(screen.queryByText('No movable assets added')).not.toBeInTheDocument()
  })

  test('shows category picker buttons', () => {
    render(<MovableAssetList />)
    expect(screen.getByText('Gold/Silver')).toBeInTheDocument()
    expect(screen.getByText('Cash/Bank Deposits')).toBeInTheDocument()
    expect(screen.getByText('Vehicle')).toBeInTheDocument()
    expect(screen.getByText('Livestock')).toBeInTheDocument()
    expect(screen.getByText('Custom Item')).toBeInTheDocument()
  })
})

describe('StepEstateInventory', () => {
  test('renders both section headers', () => {
    render(<StepEstateInventory />)
    expect(screen.getByText('Land & Properties')).toBeInTheDocument()
    expect(screen.getByText('Movable Assets')).toBeInTheDocument()
  })
})
