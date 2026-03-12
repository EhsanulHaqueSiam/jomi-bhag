import { useCallback, useEffect, useId, useRef, useState } from 'react'

interface TooltipProps {
  content: string
}

export function Tooltip({ content }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const tooltipId = useId()
  const containerRef = useRef<HTMLSpanElement>(null)

  const close = useCallback(() => setVisible(false), [])

  useEffect(() => {
    if (!visible) return

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [visible, close])

  return (
    <span ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        aria-describedby={visible ? tooltipId : undefined}
        onClick={() => setVisible((v) => !v)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-400 transition-colors hover:border-emerald-400 hover:text-emerald-600"
      >
        ?
      </button>
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-lg bg-white p-3 text-sm text-gray-600 shadow-lg ring-1 ring-gray-100"
          style={{ maxWidth: '20rem', minWidth: '12rem' }}
        >
          {content}
          {/* Arrow */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
        </div>
      )}
    </span>
  )
}
