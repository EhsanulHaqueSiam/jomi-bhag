import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import type { PdfProperty } from './pdfTypes'
import { pdfBdtFormat } from './extractPdfData'

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
}

export function PdfPropertySection({
  properties,
  totalEstateValue,
}: PdfPropertySectionProps) {
  if (properties.length === 0) return null

  return (
    <View style={styles.section} break>
      <Text style={styles.sectionHeading}>Property Breakdown</Text>

      {properties.map((prop, i) => {
        const location = [prop.division, prop.upazila].filter(Boolean).join(', ')
        const rateLabel = prop.rateSource === 'govt' ? '(Govt. Rate)' : '(Manual Rate)'

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
              <ValueRow label="Land Value" value={prop.landValue} />
              {prop.houseValue !== null && (
                <ValueRow label="House Value" value={prop.houseValue} />
              )}
              {prop.treesValue !== null && (
                <ValueRow label="Trees/Crops Value" value={prop.treesValue} />
              )}
              {prop.pondValue !== null && (
                <ValueRow label="Pond Value" value={prop.pondValue} />
              )}
              <View
                style={{
                  height: 0.5,
                  backgroundColor: '#d1d5db',
                  marginVertical: 2,
                }}
              />
              <ValueRow label="Property Total" value={prop.totalValue} bold />
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
          Total Estate Value
        </Text>
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>
          {pdfBdtFormat(totalEstateValue)}
        </Text>
      </View>
    </View>
  )
}
