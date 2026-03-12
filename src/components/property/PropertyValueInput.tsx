import { useState } from 'react'

const displayFormatter = new Intl.NumberFormat('en-IN')

interface PropertyValueInputProps {
  value: number
  onChange: (n: number) => void
  label: string
  placeholder?: string
}

export function PropertyValueInput({
  value,
  onChange,
  label,
  placeholder = 'Enter value',
}: PropertyValueInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const parsed = parseInt(raw, 10)
    onChange(isNaN(parsed) ? 0 : parsed)
  }

  const displayValue = isFocused
    ? value === 0
      ? ''
      : String(value)
    : value === 0
      ? ''
      : displayFormatter.format(value)

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-600">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
          &#2547;
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-gray-900 transition-shadow placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>
    </div>
  )
}
