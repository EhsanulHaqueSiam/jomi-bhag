import { useState, useCallback, useMemo, type ReactNode } from 'react'
import {
  LanguageContext,
  getInitialLanguage,
  getNestedValue,
  STORAGE_KEY,
  translations,
  type Language,
} from './LanguageContext'

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
