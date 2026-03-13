import type { Scenario } from '@/types/scenario'

interface ComparisonViewProps {
  scenarioA: Scenario
  scenarioB: Scenario
  onClose: () => void
}

/** Stub -- full implementation in Task 2. */
export function ComparisonView({ scenarioA, scenarioB, onClose }: ComparisonViewProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Comparing</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {scenarioA.name} vs {scenarioB.name}
      </p>
    </div>
  )
}
