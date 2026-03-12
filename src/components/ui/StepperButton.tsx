import { Tooltip } from './Tooltip'

interface StepperButtonProps {
  label: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  tooltip?: string
  disabled?: boolean
}

export function StepperButton({
  label,
  value,
  min = 0,
  max = 99,
  onChange,
  tooltip,
  disabled = false,
}: StepperButtonProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-700">{label}</span>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={disabled || value <= min}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-300 text-lg text-emerald-600 transition-colors hover:bg-emerald-50 active:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
        <span className="w-8 text-center text-lg font-semibold text-gray-800">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled || value >= max}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-300 text-lg text-emerald-600 transition-colors hover:bg-emerald-50 active:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
