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
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-medium shadow-lg ${
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
