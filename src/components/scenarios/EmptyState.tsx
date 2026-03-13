interface EmptyStateProps {
  onNewCalculation: () => void
}

export function EmptyState({ onNewCalculation }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      {/* Folder/document icon */}
      <svg
        className="h-16 w-16 text-gray-300"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M6 12a2 2 0 012-2h10l4 4h18a2 2 0 012 2v20a2 2 0 01-2 2H8a2 2 0 01-2-2V12z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 28h12M18 32h8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h3 className="mt-4 text-lg font-semibold text-gray-700">
        No saved scenarios
      </h3>
      <p className="mt-1.5 max-w-xs text-sm text-gray-500">
        Save your current calculation to compare different inheritance scenarios
      </p>

      <button
        type="button"
        onClick={onNewCalculation}
        className="mt-6 rounded-xl border border-emerald-300 px-6 py-3 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 active:bg-emerald-100"
      >
        + New Calculation
      </button>
    </div>
  )
}
