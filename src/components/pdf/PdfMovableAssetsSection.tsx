import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import type { PdfMovableAsset } from './pdfTypes'

const bdtFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

interface PdfMovableAssetsSectionProps {
  movableAssets: PdfMovableAsset[]
  movableAssetsTotal: number
}

export function PdfMovableAssetsSection({
  movableAssets,
  movableAssetsTotal,
}: PdfMovableAssetsSectionProps) {
  if (movableAssets.length === 0) return null

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Movable Assets</Text>

      {/* Table header */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableCell, { width: '30%', fontSize: 9, fontWeight: 600 }]}>
          Item
        </Text>
        <Text style={[styles.tableCell, { width: '20%', fontSize: 9, fontWeight: 600 }]}>
          Category
        </Text>
        <Text
          style={[
            styles.tableCell,
            { width: '20%', fontSize: 9, fontWeight: 600, textAlign: 'right' },
          ]}
        >
          Value
        </Text>
        <Text style={[styles.tableCell, { width: '30%', fontSize: 9, fontWeight: 600 }]}>
          Status
        </Text>
      </View>

      {/* Table rows */}
      {movableAssets.map((asset, i) => (
        <View
          key={i}
          style={[
            styles.tableRow,
            i % 2 === 1 ? styles.alternatingRow : {},
          ]}
        >
          <Text style={[styles.tableCell, { width: '30%', fontSize: 9 }]}>
            {asset.itemName}
          </Text>
          <Text style={[styles.tableCell, { width: '20%', fontSize: 9 }]}>
            {asset.category}
          </Text>
          <Text
            style={[
              styles.tableCell,
              { width: '20%', fontSize: 9, textAlign: 'right' },
            ]}
          >
            {bdtFormat.format(asset.value)}
          </Text>
          <Text style={[styles.tableCell, { width: '30%', fontSize: 9 }]}>
            {asset.isIndivisible
              ? asset.resolution
                ? `Indivisible - ${asset.resolution}`
                : 'Indivisible'
              : 'Divisible'}
          </Text>
        </View>
      ))}

      {/* Total row */}
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
          Total Movable Assets
        </Text>
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>
          {bdtFormat.format(movableAssetsTotal)}
        </Text>
      </View>
    </View>
  )
}
