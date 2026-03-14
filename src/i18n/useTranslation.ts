import { useLanguage } from './LanguageContext'
import type { Language } from './LanguageContext'

interface UseTranslationReturn {
  t: (key: string) => string
  language: Language
  setLanguage: (lang: Language) => void
  isEn: boolean
  isBn: boolean
}

export function useTranslation(): UseTranslationReturn {
  const { language, setLanguage, t } = useLanguage()

  return {
    t,
    language,
    setLanguage,
    isEn: language === 'en',
    isBn: language === 'bn',
  }
}
