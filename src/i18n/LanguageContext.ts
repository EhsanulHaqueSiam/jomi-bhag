import { createContext, useContext } from 'react'
import { en } from './translations/en'
import { bn } from './translations/bn'

export type Language = 'en' | 'bn'

export interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

export const STORAGE_KEY = 'jomi-bhag-lang'

export const translations = { en, bn } as const

export function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return path
    }
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : path
}

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'bn') return stored
  } catch {
    // localStorage not available
  }
  return 'bn'
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

const defaultContext: LanguageContextValue = {
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => getNestedValue(translations.en, key),
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  return ctx ?? defaultContext
}
