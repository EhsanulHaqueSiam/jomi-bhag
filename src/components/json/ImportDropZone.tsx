import { useRef, useState } from 'react'

interface ImportDropZoneProps {
  onFileSelected: (file: File) => void
}

export function ImportDropZone({ onFileSelected }: ImportDropZoneProps) {
  const [dragCounter, setDragCounter] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const isDragOver = dragCounter > 0

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    setDragCounter((c) => c + 1)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragCounter((c) => c - 1)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragCounter(0)

    const file = e.dataTransfer.files[0]
    if (!file) return

    // Guard: reject files > 1MB
    if (file.size > 1_000_000) return

    onFileSelected(file)
  }

  function handleClick() {
    inputRef.current?.click()
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1_000_000) return

    onFileSelected(file)

    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick()
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors ${
        isDragOver
          ? 'border-emerald-400 bg-emerald-50/50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Upload icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
      <p className="text-sm text-gray-500">
        Drag JSON file here or click to browse
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
