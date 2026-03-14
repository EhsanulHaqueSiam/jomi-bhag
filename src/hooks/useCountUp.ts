import { useState, useEffect, useRef } from 'react'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Animate a number from 0 to target over `duration` ms with ease-out curve.
 * Respects prefers-reduced-motion (returns target immediately).
 * When target changes, restarts animation from current displayed value.
 */
export function useCountUp(target: number, duration = 500): number {
  const [current, setCurrent] = useState(prefersReducedMotion ? target : 0)
  const rafRef = useRef<number | null>(null)
  const startValueRef = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrent(target)
      return
    }

    // Animate from current displayed value to new target
    startValueRef.current = current
    const startTime = performance.now()
    const startVal = startValueRef.current
    const delta = target - startVal

    function tick(now: number) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      // ease-out cubic: progress = 1 - (1 - t)^3
      const progress = 1 - Math.pow(1 - t, 3)
      const value = startVal + delta * progress
      setCurrent(Math.round(value))

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return current
}
