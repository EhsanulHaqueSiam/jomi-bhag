import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

interface ToastProps {
  message: string | null
  type: 'success' | 'error'
  onDismiss: () => void
  duration?: number
}

export function Toast({ message, type, onDismiss, duration }: ToastProps) {
  const ms = duration ?? (type === 'error' ? 5000 : 4000)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, ms)
    return () => clearTimeout(timer)
  }, [message, ms, onDismiss])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-20 left-1/2 z-50 -translate-x-1/2 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${
            type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
          onClick={onDismiss}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
