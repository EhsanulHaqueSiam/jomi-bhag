import { Font } from '@react-pdf/renderer'

import InterRegular from '@/assets/fonts/Inter-Regular.ttf'
import InterSemiBold from '@/assets/fonts/Inter-SemiBold.ttf'
import InterBold from '@/assets/fonts/Inter-Bold.ttf'
import InterItalic from '@/assets/fonts/Inter-Italic.ttf'
import NotoNaskhArabicRegular from '@/assets/fonts/NotoNaskhArabic-Regular.ttf'
import NotoSansBengaliRegular from '@/assets/fonts/NotoSansBengali-Regular.ttf'

Font.register({
  family: 'Inter',
  fonts: [
    { src: InterRegular, fontWeight: 400 },
    { src: InterSemiBold, fontWeight: 600 },
    { src: InterItalic, fontWeight: 400, fontStyle: 'italic' },
    { src: InterBold, fontWeight: 700 },
  ],
})

Font.register({
  family: 'Noto Naskh Arabic',
  fonts: [{ src: NotoNaskhArabicRegular, fontWeight: 400 }],
})

Font.register({
  family: 'Noto Sans Bengali',
  fonts: [
    // Noto Sans Bengali regular is used as a safe fallback for italic/bold
    // variants so @react-pdf can resolve requested styles without crashing.
    { src: NotoSansBengaliRegular, fontWeight: 400 },
    { src: NotoSansBengaliRegular, fontWeight: 400, fontStyle: 'italic' },
    { src: NotoSansBengaliRegular, fontWeight: 600 },
    { src: NotoSansBengaliRegular, fontWeight: 600, fontStyle: 'italic' },
    { src: NotoSansBengaliRegular, fontWeight: 700 },
    { src: NotoSansBengaliRegular, fontWeight: 700, fontStyle: 'italic' },
  ],
})
