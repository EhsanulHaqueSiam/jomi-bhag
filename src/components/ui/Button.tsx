import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  onClick?: () => void
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  type?: 'button' | 'submit'
}

const variantStyles = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50',
  secondary:
    'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-50',
  ghost:
    'text-gray-500 hover:text-emerald-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50',
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-12 rounded-xl px-6 py-3 font-medium transition-colors disabled:cursor-not-allowed ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
