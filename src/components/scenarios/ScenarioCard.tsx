import { useState, useRef, useEffect } from 'react'
import type { Scenario } from '@/types/scenario'

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface ScenarioCardProps {
  scenario: Scenario
  isSelected: boolean
  onToggleSelect: () => void
  onLoad: () => void
  onDuplicate: () => void
  onDelete: () => void
  onRename: (name: string) => void
}

export function ScenarioCard({
  scenario,
  isSelected,
  onToggleSelect,
  onLoad,
  onDuplicate,
  onDelete,
  onRename,
}: ScenarioCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(scenario.name)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    setEditValue(scenario.name)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== scenario.name) {
      onRename(trimmed)
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditValue(scenario.name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const adjustmentBadge =
    scenario.summary.adjustment === 'awl' ? (
      <span className="ml-1.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        Awl
      </span>
    ) : scenario.summary.adjustment === 'radd' ? (
      <span className="ml-1.5 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
        Radd
      </span>
    ) : null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-3">
        {/* Checkbox for comparison selection */}
        <div className="flex shrink-0 items-start pt-0.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            aria-label={`Select ${scenario.name} for comparison`}
          />
        </div>

        <div className="min-w-0 flex-1">
          {/* Scenario name -- editable */}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="w-full rounded border border-emerald-300 px-2 py-1 text-sm font-semibold text-gray-900 outline-none focus:ring-1 focus:ring-emerald-400"
              data-testid="rename-input"
            />
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="group flex items-center gap-1 text-left"
              title="Click to rename"
            >
              <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
                {scenario.name}
              </h3>
              {/* Pencil icon */}
              <svg
                className="h-3.5 w-3.5 shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L3.463 11.098a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.25.25 0 00.108-.064l8.61-8.61a.25.25 0 000-.354L12.427 2.487z" />
              </svg>
            </button>
          )}

          {/* Date and heir summary */}
          <p className="mt-0.5 text-xs text-gray-500">
            {formatDate(scenario.updatedAt)}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {scenario.summary.heirSummary}
            {adjustmentBadge}
          </p>

          {/* Estate value */}
          {scenario.summary.totalEstateValue > 0 && (
            <p className="mt-1 text-sm font-medium text-emerald-700">
              {bdtFormatter.format(scenario.summary.totalEstateValue)}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-2">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">Delete this scenario?</span>
                <button
                  type="button"
                  onClick={() => {
                    onDelete()
                    setShowDeleteConfirm(false)
                  }}
                  className="font-medium text-red-600 hover:text-red-700"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onLoad}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={onDuplicate}
                  className="text-xs font-medium text-gray-500 hover:text-gray-600"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs font-medium text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
