import { View, Text, Image } from '@react-pdf/renderer'
import { styles } from './pdfStyles'

interface PdfChartSectionProps {
  pieChartImage: string | null
  barChartImage: string | null
}

export function PdfChartSection({ pieChartImage, barChartImage }: PdfChartSectionProps) {
  if (!pieChartImage && !barChartImage) return null

  const hasBoth = pieChartImage && barChartImage

  return (
    <View style={styles.section} break>
      <Text style={styles.sectionHeading}>Visual Summary</Text>
      <View
        style={{
          flexDirection: hasBoth ? 'row' : 'column',
          gap: 20,
          alignItems: hasBoth ? 'flex-start' : 'center',
        }}
      >
        {pieChartImage && (
          <Image
            src={pieChartImage}
            style={{ width: 250, height: 200 }}
          />
        )}
        {barChartImage && (
          <Image
            src={barChartImage}
            style={{ width: 250, height: 200 }}
          />
        )}
      </View>
    </View>
  )
}
