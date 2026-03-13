import { Font } from '@react-pdf/renderer'

import InterRegular from '@/assets/fonts/Inter-Regular.ttf'
import InterSemiBold from '@/assets/fonts/Inter-SemiBold.ttf'
import InterBold from '@/assets/fonts/Inter-Bold.ttf'
import NotoNaskhArabicRegular from '@/assets/fonts/NotoNaskhArabic-Regular.ttf'

Font.register({
  family: 'Inter',
  fonts: [
    { src: InterRegular, fontWeight: 400 },
    { src: InterSemiBold, fontWeight: 600 },
    { src: InterBold, fontWeight: 700 },
  ],
})

Font.register({
  family: 'Noto Naskh Arabic',
  fonts: [{ src: NotoNaskhArabicRegular, fontWeight: 400 }],
})
