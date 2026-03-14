import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import { en } from '@/i18n/translations/en'
import { bn } from '@/i18n/translations/bn'

function formatDateTime(date: Date, language: 'en' | 'bn'): { dateStr: string; timeStr: string } {
  const txt = language === 'bn' ? bn : en
  const months = txt.pdf.months
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return {
    dateStr: `${day} ${month} ${year}`,
    timeStr: `${hours}:${minutes}`,
  }
}

function NoticeParagraph({ label, text }: { label: string; text: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: 9 }}>
        <Text style={{ fontWeight: 700 }}>{label}: </Text>
        {text}
      </Text>
    </View>
  )
}

export function PdfDisclaimer({ generatedAt, language = 'en' }: { generatedAt: Date; language?: 'en' | 'bn' }) {
  const txt = language === 'bn' ? bn : en
  const { dateStr, timeStr } = formatDateTime(generatedAt, language)

  return (
    <View style={styles.section} break>
      <Text style={styles.sectionHeading}>{txt.pdf.importantNotices}</Text>
      <View style={styles.disclaimerBox}>
        <NoticeParagraph label={txt.pdf.legalNotice} text={txt.pdf.legalNoticeText} />
        <NoticeParagraph label={txt.pdf.islamicJurisprudence} text={txt.pdf.islamicJurisprudenceText} />
        <NoticeParagraph label={txt.pdf.scope} text={txt.pdf.scopeText} />
        <NoticeParagraph label={txt.pdf.propertyValues} text={txt.pdf.propertyValuesText} />
      </View>

      <Text
        style={{
          fontSize: 8,
          color: '#888',
          textAlign: 'center',
          marginTop: 12,
        }}
      >
        {txt.pdf.generatedOnAt.replace('{date}', dateStr).replace('{time}', timeStr)}
      </Text>
    </View>
  )
}
