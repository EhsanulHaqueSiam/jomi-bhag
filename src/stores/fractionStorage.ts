import { createJSONStorage } from 'zustand/middleware'
import Fraction from 'fraction.js'

const FRACTION_TAG = '__frac__'

function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Fraction) {
    return { [FRACTION_TAG]: value.toFraction() }
  }
  return value
}

function reviver(_key: string, value: unknown): unknown {
  if (
    value !== null &&
    typeof value === 'object' &&
    FRACTION_TAG in (value as Record<string, unknown>)
  ) {
    return new Fraction((value as Record<string, string>)[FRACTION_TAG])
  }
  return value
}

export const fractionStorage = createJSONStorage(() => localStorage, {
  replacer,
  reviver,
})
