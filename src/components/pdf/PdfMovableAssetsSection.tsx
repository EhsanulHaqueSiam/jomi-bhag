import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import type { PdfMovableAsset } from './pdfTypes'
import { pdfBdtFormat } from './extractPdfData'
import { en } from '@/i18n/translations/en'
import { bn } from '@/i18n/translations/bn'

interface PdfMovableAssetsSectionProps {
  movableAssets: PdfMovableAsset[]
  movableAssetsTotal: number
  language?: 'en' | 'bn'
}

export function PdfMovableAssetsSection({
  movableAssets,
  movableAssetsTotal,
  language = 'en',
}: PdfMovableAssetsSectionProps) {
  if (movableAssets.length === 0) return null
  const txt = language === 'bn' ? bn : en

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{txt.pdf.movableAssets}</Text>

      {/* Table header */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableCell, { width: '30%', fontSize: 9, fontWeight: 600 }]}>
          {txt.pdf.item}
        </Text>
        <Text style={[styles.tableCell, { width: '20%', fontSize: 9, fontWeight: 600 }]}>
          {txt.pdf.category}
        </Text>
        <Text
          style={[
            styles.tableCell,
            { width: '20%', fontSize: 9, fontWeight: 600, textAlign: 'right' },
          ]}
        >
          {txt.pdf.value}
        </Text>
        <Text style={[styles.tableCell, { width: '30%', fontSize: 9, fontWeight: 600 }]}>
          {txt.pdf.status}
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
            {pdfBdtFormat(asset.value)}
          </Text>
          <Text style={[styles.tableCell, { width: '30%', fontSize: 9 }]}>
            {asset.isIndivisible
              ? asset.resolution
                ? `${txt.pdf.indivisible} - ${asset.resolution}`
                : txt.pdf.indivisible
              : txt.pdf.divisible}
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
          {txt.pdf.totalMovableAssets}
        </Text>
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>
          {pdfBdtFormat(movableAssetsTotal)}
        </Text>
      </View>
    </View>
  )
}
