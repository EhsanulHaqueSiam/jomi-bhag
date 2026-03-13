import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import type { PdfData } from './pdfTypes'

export function PdfStepsSection({ steps }: { steps: PdfData['steps'] }) {
  if (steps.length === 0) return null

  return (
    <View style={styles.section} break>
      <Text style={styles.sectionHeading}>Step-by-Step Calculation</Text>

      {steps.map((step, i) => (
        <View key={i} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 10, fontWeight: 600, color: '#111' }}>
              Step {step.step}:
            </Text>
            <Text style={{ fontSize: 10, marginLeft: 4, color: '#333' }}>
              {step.description}
            </Text>
          </View>
          <Text style={{ fontSize: 9, color: '#555', marginLeft: 4, marginTop: 2 }}>
            {step.detail}
          </Text>
        </View>
      ))}
    </View>
  )
}
