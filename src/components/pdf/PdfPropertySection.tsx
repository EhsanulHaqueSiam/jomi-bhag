import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import type { PdfProperty } from './pdfTypes'
import { pdfBdtFormat } from './extractPdfData'
import { en } from '@/i18n/translations/en'
import { bn } from '@/i18n/translations/bn'

function ValueRow({
  label,
  value,
  bold,
}: {
  label: string
  value: number
  bold?: boolean
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
        paddingHorizontal: 4,
      }}
    >
      <Text
        style={{
          fontSize: 9,
          fontWeight: bold ? 600 : 400,
          color: '#333',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 9,
          fontWeight: bold ? 600 : 400,
          color: '#333',
        }}
      >
        {pdfBdtFormat(value)}
      </Text>
    </View>
  )
}

interface PdfPropertySectionProps {
  properties: PdfProperty[]
  totalEstateValue: number
  language?: 'en' | 'bn'
}

export function PdfPropertySection({
  properties,
  totalEstateValue,
  language = 'en',
}: PdfPropertySectionProps) {
  if (properties.length === 0) return null
  const txt = language === 'bn' ? bn : en

  return (
    <View style={styles.section} break>
      <Text style={styles.sectionHeading}>{txt.pdf.propertyBreakdown}</Text>

      {properties.map((prop, i) => {
        const location = [prop.division, prop.upazila].filter(Boolean).join(', ')
        const rateLabel = prop.rateSource === 'govt' ? txt.estate.govtRateFull : txt.estate.manualRateFull

        return (
          <View
            key={i}
            style={{
              marginBottom: 12,
              borderBottomWidth: i < properties.length - 1 ? 0.5 : 0,
              borderBottomColor: '#e5e7eb',
              paddingBottom: 8,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#111' }}>
              {prop.nickname} {prop.type ? `- ${prop.type}` : ''}
            </Text>
            {location && (
              <Text style={{ fontSize: 9, color: '#666', marginTop: 2 }}>
                {location} {rateLabel}
              </Text>
            )}

            <View style={{ marginTop: 6 }}>
              <ValueRow label={txt.pdf.landValue} value={prop.landValue} />
              {prop.houseValue !== null && (
                <ValueRow label={txt.pdf.houseValue} value={prop.houseValue} />
              )}
              {prop.treesValue !== null && (
                <ValueRow label={txt.pdf.treesCropsValue} value={prop.treesValue} />
              )}
              {prop.pondValue !== null && (
                <ValueRow label={txt.pdf.pondValue} value={prop.pondValue} />
              )}
              <View
                style={{
                  height: 0.5,
                  backgroundColor: '#d1d5db',
                  marginVertical: 2,
                }}
              />
              <ValueRow label={txt.pdf.propertyTotal} value={prop.totalValue} bold />
            </View>
          </View>
        )
      })}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 8,
          paddingVertical: 6,
          paddingHorizontal: 4,
          backgroundColor: '#f3f4f6',
          borderRadius: 2,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>
          {txt.pdf.totalEstateValue}
        </Text>
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>
          {pdfBdtFormat(totalEstateValue)}
        </Text>
      </View>
    </View>
  )
}
