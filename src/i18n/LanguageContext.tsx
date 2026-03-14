import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { en } from './translations/en'
import { bn } from './translations/bn'

export type Language = 'en' | 'bn'

const STORAGE_KEY = 'jomi-bhag-lang'

const translations = { en, bn } as const

function getNestedValue(obj: unknown, path: string): string {
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

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'bn') return stored
  } catch {
    // localStorage not available
  }
  return 'bn'
}

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // localStorage not available
    }
  }, [])

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(translations[language], key)
    },
    [language],
  )

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Default context for use outside LanguageProvider (tests, SSR)
const defaultContext: LanguageContextValue = {
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => getNestedValue(translations.en, key),
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  return ctx ?? defaultContext
}
