interface ImportConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ImportConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
}: ImportConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
      <p className="text-sm text-amber-800">
        Importing will replace your current data. Continue?
      </p>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
        >
          Import
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
