import { describe, it, expect } from 'vitest'
import { sanitizeForPdf, pdfBdtFormat } from '../extractPdfData'

describe('sanitizeForPdf', () => {
  it('strips Bengali text and preserves Latin text in parentheses', () => {
    expect(sanitizeForPdf('বাড়ির জমি (Homestead)')).toBe('(Homestead)')
  })

  it('strips Bengali text and preserves complex Latin text in parentheses', () => {
    expect(sanitizeForPdf('ধানের জমি (Paddy Field - Big)')).toBe('(Paddy Field - Big)')
  })

  it('returns regular English text unchanged', () => {
    expect(sanitizeForPdf('Regular English Text')).toBe('Regular English Text')
  })

  it('returns empty string unchanged', () => {
    expect(sanitizeForPdf('')).toBe('')
  })

  it('removes Bengali from mixed text and collapses extra spaces', () => {
    expect(sanitizeForPdf('Mixed বাংলা and English')).toBe('Mixed and English')
  })

  it('strips Bengali prefix and preserves parenthesized English', () => {
    expect(sanitizeForPdf('আমবাগান (Mango Orchard)')).toBe('(Mango Orchard)')
  })

  it('preserves numbers and punctuation', () => {
    expect(sanitizeForPdf('Plot #3 - 500sqft')).toBe('Plot #3 - 500sqft')
  })

  it('preserves Arabic text (U+0600-U+06FF range)', () => {
    // Arabic text should be preserved since Noto Naskh Arabic font is registered
    const arabicText = '\u0628\u0633\u0645 \u0627\u0644\u0644\u0647'  // بسم الله
    expect(sanitizeForPdf(arabicText)).toBe(arabicText)
  })

  it('preserves Latin Extended characters (accented)', () => {
    expect(sanitizeForPdf('Cafe Resume Nino')).toBe('Cafe Resume Nino')
  })

  it('handles all Bengali text (returns empty after trim)', () => {
    expect(sanitizeForPdf('বাংলা')).toBe('')
  })

  it('handles multiple Bengali segments interspersed with Latin', () => {
    expect(sanitizeForPdf('বাড়ি House জমি Land')).toBe('House Land')
  })
})

describe('pdfBdtFormat', () => {
  it('formats amounts with Tk prefix (not Bengali taka symbol)', () => {
    const result = pdfBdtFormat(5000000)
    expect(result).toMatch(/^Tk/)
    expect(result).not.toContain('\u09F3') // no Bengali taka sign
  })

  it('uses Indian/Bangladeshi lakh/crore grouping', () => {
    expect(pdfBdtFormat(5000000)).toBe('Tk50,00,000')
  })

  it('formats zero', () => {
    expect(pdfBdtFormat(0)).toBe('Tk0')
  })

  it('formats small amounts', () => {
    expect(pdfBdtFormat(500)).toBe('Tk500')
  })
})
