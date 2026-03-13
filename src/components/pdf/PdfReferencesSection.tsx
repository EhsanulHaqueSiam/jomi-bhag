import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import type { PdfReference } from './pdfTypes'

export function PdfReferencesSection({ references }: { references: PdfReference[] }) {
  if (references.length === 0) return null

  // Group by type: Quran first, then Hadith
  const quranRefs = references.filter((r) => r.type === 'quran')
  const hadithRefs = references.filter((r) => r.type === 'hadith')
  const ordered = [...quranRefs, ...hadithRefs]

  return (
    <View style={styles.section} break>
      <Text style={styles.sectionHeading}>Islamic Basis</Text>

      {ordered.map((ref, i) => (
        <View key={i} style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: 600, fontSize: 10, color: '#111' }}>
            {ref.reference}
          </Text>
          {ref.appliesTo.length > 0 && (
            <Text style={{ fontSize: 8, color: '#888', marginTop: 1 }}>
              Applies to: {ref.appliesTo.join(', ')}
            </Text>
          )}

          {ref.arabicText ? (
            <View style={{ marginTop: 4, marginBottom: 4 }}>
              <Text style={styles.arabicText}>{ref.arabicText}</Text>
            </View>
          ) : null}

          <Text style={{ fontSize: 9, color: '#444', fontStyle: 'italic', marginTop: 2 }}>
            {ref.englishText}
          </Text>

          {/* Separator between references */}
          {i < ordered.length - 1 && (
            <View
              style={{
                height: 0.5,
                backgroundColor: '#e5e7eb',
                marginTop: 10,
              }}
            />
          )}
        </View>
      ))}
    </View>
  )
}
