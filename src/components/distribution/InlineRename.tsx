import { useState, useEffect, useRef } from 'react'

interface InlineRenameProps {
  value: string
  subtitle?: string
  onSave: (name: string) => void
}

export function InlineRename({ value, subtitle, onSave }: InlineRenameProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.select()
    }
  }, [editing])

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value)
          setEditing(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setDraft(value)
            setEditing(true)
          }
        }}
        className="cursor-pointer text-left"
      >
        <span className="block text-sm font-semibold text-gray-900 hover:underline">
          {value}
        </span>
        {subtitle && (
          <span className="block text-xs text-gray-500">{subtitle}</span>
        )}
      </button>
    )
  }

  const handleSave = () => {
    const trimmed = draft.trim()
    if (trimmed) {
      onSave(trimmed)
    }
    setEditing(false)
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSave()
        }
        if (e.key === 'Escape') {
          setDraft(value)
          setEditing(false)
        }
      }}
      onBlur={handleSave}
      onPointerDown={(e) => e.stopPropagation()}
      className="w-full rounded border border-gray-300 px-1.5 py-0.5 text-sm font-semibold text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      aria-label="Rename heir"
    />
  )
}
