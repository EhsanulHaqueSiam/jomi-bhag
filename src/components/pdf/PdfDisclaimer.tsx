import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDateTime(date: Date): { dateStr: string; timeStr: string } {
  const day = date.getDate()
  const month = MONTHS[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return {
    dateStr: `${day} ${month} ${year}`,
    timeStr: `${hours}:${minutes}`,
  }
}

export const LEGAL_NOTICE =
  'This report is for informational purposes only. Consult a qualified lawyer before using for legal registration or property transfer.'

export const ISLAMIC_NOTICE =
  "Calculations strictly follow the Hanafi school of Islamic jurisprudence. Other schools of thought (Shafi'i, Maliki, Hanbali) may yield different results. For disputes or edge cases, consult a qualified Islamic scholar (Mufti)."

export const SCOPE_NOTICE =
  'This calculation assumes parents of the deceased have predeceased them. If parents are alive, inheritance rules differ.'

export const VALUES_NOTICE =
  'Property values used in this report are estimates entered by the user and may not reflect actual market values. Verify with local authorities or certified surveyors.'

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

export function PdfDisclaimer({ generatedAt }: { generatedAt: Date }) {
  const { dateStr, timeStr } = formatDateTime(generatedAt)

  return (
    <View style={styles.section} break>
      <Text style={styles.sectionHeading}>Important Notices</Text>
      <View style={styles.disclaimerBox}>
        <NoticeParagraph label="Legal Notice" text={LEGAL_NOTICE} />
        <NoticeParagraph label="Islamic Jurisprudence" text={ISLAMIC_NOTICE} />
        <NoticeParagraph label="Scope" text={SCOPE_NOTICE} />
        <NoticeParagraph label="Property Values" text={VALUES_NOTICE} />
      </View>

      <Text
        style={{
          fontSize: 8,
          color: '#888',
          textAlign: 'center',
          marginTop: 12,
        }}
      >
        Generated on {dateStr} at {timeStr} by Jomi-Bhag (jomi-bhag.netlify.app)
      </Text>
    </View>
  )
}
