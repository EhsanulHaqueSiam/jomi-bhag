import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import type { PdfData } from './pdfTypes'

function AdjustmentBanner({ data }: { data: PdfData }) {
  if (data.adjustment === 'none') return null

  const isAwl = data.adjustment === 'awl'
  const message = isAwl
    ? `Total prescribed shares (${data.totalBeforeAdjustment}) exceed the estate. Shares reduced proportionally (Awl).`
    : `Total prescribed shares (${data.totalBeforeAdjustment}) are less than 1. Surplus redistributed to eligible heirs (Radd).`

  return (
    <View
      style={{
        backgroundColor: '#fefce8',
        borderWidth: 1,
        borderColor: isAwl ? '#f59e0b' : '#3b82f6',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
      }}
    >
      <Text style={{ fontSize: 9, color: '#333' }}>{message}</Text>
    </View>
  )
}

export function PdfHeirTable({ data }: { data: PdfData }) {
  const showBdt = data.totalEstateValue > 0

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Heir Share Allocation</Text>
      <AdjustmentBanner data={data} />

      {/* Header row */}
      <View style={styles.tableHeaderRow}>
        <Text style={{ ...styles.tableCell, flex: 2.5, fontSize: 9, fontWeight: 600 }}>
          Heir Type
        </Text>
        <Text style={{ ...styles.tableCell, flex: 0.8, fontSize: 9, fontWeight: 600 }}>
          Count
        </Text>
        <Text style={{ ...styles.tableCell, flex: 1.2, fontSize: 9, fontWeight: 600 }}>
          Fraction
        </Text>
        <Text style={{ ...styles.tableCell, flex: 1.2, fontSize: 9, fontWeight: 600 }}>
          Percentage
        </Text>
        {showBdt && (
          <Text style={{ ...styles.tableCell, flex: 1.5, fontSize: 9, fontWeight: 600 }}>
            Per-Heir BDT
          </Text>
        )}
        {showBdt && (
          <Text style={{ ...styles.tableCell, flex: 1.5, fontSize: 9, fontWeight: 600 }}>
            Total BDT
          </Text>
        )}
        <Text style={{ ...styles.tableCell, flex: 1.5, fontSize: 9, fontWeight: 600 }}>
          Share Type
        </Text>
      </View>

      {/* Data rows */}
      {data.activeShares.map((share, i) => (
        <View
          key={i}
          style={{
            ...styles.tableRow,
            ...(i % 2 === 1 ? styles.alternatingRow : {}),
          }}
        >
          <Text style={{ ...styles.tableCell, flex: 2.5, fontSize: 9 }}>
            {share.heirType}
          </Text>
          <Text style={{ ...styles.tableCell, flex: 0.8, fontSize: 9 }}>
            {share.count}
          </Text>
          <Text style={{ ...styles.tableCell, flex: 1.2, fontSize: 9 }}>
            {share.fraction}
          </Text>
          <Text style={{ ...styles.tableCell, flex: 1.2, fontSize: 9 }}>
            {share.percentage}
          </Text>
          {showBdt && (
            <Text style={{ ...styles.tableCell, flex: 1.5, fontSize: 9 }}>
              {share.perHeirBdt}
            </Text>
          )}
          {showBdt && (
            <Text style={{ ...styles.tableCell, flex: 1.5, fontSize: 9 }}>
              {share.totalBdt}
            </Text>
          )}
          <Text style={{ ...styles.tableCell, flex: 1.5, fontSize: 9 }}>
            {share.shareType}
          </Text>
        </View>
      ))}

      {/* Blocked heirs note */}
      {data.blockedHeirs.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 9, fontWeight: 600, color: '#555' }}>
            Blocked Heirs:
          </Text>
          {data.blockedHeirs.map((bh, i) => (
            <Text key={i} style={{ fontSize: 8, color: '#666', marginLeft: 8, marginTop: 2 }}>
              {bh.heirType} blocked by {bh.blockedBy} ({bh.rule})
            </Text>
          ))}
        </View>
      )}

      {/* Special cases */}
      {data.specialCases.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 9, fontWeight: 600, color: '#555' }}>
            Special Cases:
          </Text>
          {data.specialCases.map((sc, i) => (
            <Text key={i} style={{ fontSize: 8, color: '#666', fontStyle: 'italic', marginLeft: 8, marginTop: 2 }}>
              {sc}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}
