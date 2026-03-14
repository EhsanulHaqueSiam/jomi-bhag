import { View, Text } from '@react-pdf/renderer'
import { en } from '@/i18n/translations/en'
import { bn } from '@/i18n/translations/bn'

function formatDate(date: Date, language: 'en' | 'bn'): string {
  const txt = language === 'bn' ? bn : en
  const months = txt.pdf.months
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export function PdfHeader({ generatedAt, language = 'en' }: { generatedAt: Date; language?: 'en' | 'bn' }) {
  const txt = language === 'bn' ? bn : en

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 700, color: '#065f46' }}>
        {txt.app.title}
      </Text>
      <Text style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
        {txt.pdf.title}
      </Text>
      <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
        {txt.pdf.generatedOn.replace('{date}', formatDate(generatedAt, language))}
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: '#d1d5db',
          marginTop: 12,
        }}
      />
    </View>
  )
}
