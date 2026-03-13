import { View, Text } from '@react-pdf/renderer'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(date: Date): string {
  const day = date.getDate()
  const month = MONTHS[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export function PdfHeader({ generatedAt }: { generatedAt: Date }) {
  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 700, color: '#065f46' }}>
        Jomi-Bhag
      </Text>
      <Text style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
        Islamic Inheritance Division Report
      </Text>
      <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
        Generated on {formatDate(generatedAt)}
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
