import { useState } from 'react'
import type { AppPage } from '@/types/scenario'
import { useScenariosStore, MAX_SCENARIOS } from '@/stores/scenariosStore'
import { useWizardStore } from '@/stores/wizardStore'
import { ScenarioCard } from './ScenarioCard'
import { EmptyState } from './EmptyState'
import { ComparisonView } from './ComparisonView'

interface ScenariosPageProps {
  onNavigate: (page: AppPage) => void
}

export function ScenariosPage({ onNavigate }: ScenariosPageProps) {
  const scenarios = useScenariosStore((s) => s.scenarios)
  const selectedIds = useScenariosStore((s) => s.selectedIds)
  const isComparing = useScenariosStore((s) => s.isComparing)
  const saveScenario = useScenariosStore((s) => s.saveScenario)
  const loadScenario = useScenariosStore((s) => s.loadScenario)
  const deleteScenario = useScenariosStore((s) => s.deleteScenario)
  const clearAll = useScenariosStore((s) => s.clearAll)
  const duplicateScenario = useScenariosStore((s) => s.duplicateScenario)
  const renameScenario = useScenariosStore((s) => s.renameScenario)
  const toggleSelected = useScenariosStore((s) => s.toggleSelected)
  const startCompare = useScenariosStore((s) => s.startCompare)
  const stopCompare = useScenariosStore((s) => s.stopCompare)
  const hasUnsavedChanges = useScenariosStore((s) => s.hasUnsavedChanges)
  const updateLastSavedHash = useScenariosStore((s) => s.updateLastSavedHash)

  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [loadConfirmId, setLoadConfirmId] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Sort by most recently updated first
  const sortedScenarios = [...scenarios].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

  const atLimit = scenarios.length >= MAX_SCENARIOS
  const nearLimit = scenarios.length >= MAX_SCENARIOS - 2

  const handleNewCalculation = () => {
    // Reset wizard store to initial state
    useWizardStore.setState({
      currentStep: 1,
      completedSteps: [],
      relationship: null,
      deceasedGender: null,
      userGender: null,
      mfloEnabled: false,
      motherAlive: null,
      autoIncludes: [],
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
      expandedPropertyId: null,
      movableAssets: [],
      expandedAssetId: null,
      results: null,
      totalEstateValue: 0,
      viewMode: 'simple',
    })
    onNavigate('wizard')
  }

  const handleSave = () => {
    const id = saveScenario()
    if (id) {
      setSaveMessage('Scenario saved!')
      setTimeout(() => setSaveMessage(null), 2000)
    }
  }

  const handleLoad = (id: string) => {
    if (hasUnsavedChanges()) {
      setLoadConfirmId(id)
      return
    }
    performLoad(id)
  }

  const handleSaveAndLoad = (id: string) => {
    saveScenario()
    performLoad(id)
  }

  const performLoad = (id: string) => {
    const state = loadScenario(id)
    if (state) {
      useWizardStore.setState(state)
      updateLastSavedHash()
      onNavigate('wizard')
    }
    setLoadConfirmId(null)
  }

  const handleClearAll = () => {
    clearAll()
    setShowClearConfirm(false)
  }

  // Get comparison scenarios
  const scenarioA = scenarios.find((s) => s.id === selectedIds[0])
  const scenarioB = scenarios.find((s) => s.id === selectedIds[1])

  if (isComparing && scenarioA && scenarioB) {
    return (
      <ComparisonView
        scenarioA={scenarioA}
        scenarioB={scenarioB}
        onClose={stopCompare}
      />
    )
  }

  if (scenarios.length === 0) {
    return <EmptyState onNewCalculation={handleNewCalculation} />
  }

  return (
    <div className="space-y-4">
      {/* Top actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-900">My Scenarios</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewCalculation}
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            + New Calculation
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={atLimit}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            title={atLimit ? 'Maximum 20 scenarios reached' : 'Save current calculation'}
          >
            Save Current
          </button>
        </div>
      </div>

      {/* Save success message */}
      {saveMessage && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {saveMessage}
        </div>
      )}

      {/* Near-limit warning */}
      {nearLimit && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          You have {scenarios.length}/{MAX_SCENARIOS} saved scenarios
        </div>
      )}

      {/* Load confirmation dialog */}
      {loadConfirmId && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800">
            You have unsaved changes. Save current scenario before loading?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => handleSaveAndLoad(loadConfirmId)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Save & Load
            </button>
            <button
              type="button"
              onClick={() => performLoad(loadConfirmId)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Load Without Saving
            </button>
            <button
              type="button"
              onClick={() => setLoadConfirmId(null)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Compare button */}
      {selectedIds.length === 2 && (
        <button
          type="button"
          onClick={startCompare}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Compare Selected Scenarios
        </button>
      )}

      {/* Scenario cards list */}
      <div className="space-y-3">
        {sortedScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            isSelected={selectedIds.includes(scenario.id)}
            onToggleSelect={() => toggleSelected(scenario.id)}
            onLoad={() => handleLoad(scenario.id)}
            onDuplicate={() => duplicateScenario(scenario.id)}
            onDelete={() => deleteScenario(scenario.id)}
            onRename={(name) => renameScenario(scenario.id, name)}
          />
        ))}
      </div>

      {/* Clear All */}
      {scenarios.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          {showClearConfirm ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">
                This will permanently delete all {scenarios.length} scenarios. Are you sure?
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  Yes, Delete All
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              Clear All Scenarios
            </button>
          )}
        </div>
      )}
    </div>
  )
}
