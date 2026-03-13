import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import type { PdfIndividualDistribution, PdfIndividualHeir } from './pdfTypes'

const bdtFormat = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

function equilibriumIndicator(status: 'balanced' | 'close' | 'off', percentage: number): string {
  switch (status) {
    case 'balanced':
      return `[OK] ${percentage}%`
    case 'close':
      return `[~] ${percentage}%`
    case 'off':
      return `[X] ${percentage}%`
  }
}

function equilibriumColor(status: 'balanced' | 'close' | 'off'): string {
  switch (status) {
    case 'balanced':
      return '#059669' // emerald-600
    case 'close':
      return '#d97706' // amber-600
    case 'off':
      return '#dc2626' // red-600
  }
}

function HeirRow({ heir }: { heir: PdfIndividualHeir }) {
  return (
    <View style={{ marginBottom: 10 }}>
      {/* Heir header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
          paddingVertical: 4,
          paddingHorizontal: 6,
          borderBottomWidth: 1,
          borderBottomColor: '#d1d5db',
          borderLeftWidth: 3,
          borderLeftColor: equilibriumColor(heir.equilibriumStatus),
        }}
      >
        <View>
          <Text style={{ fontWeight: 600, fontSize: 10 }}>
            {heir.displayName}
          </Text>
          {heir.subtitle && (
            <Text style={{ fontSize: 8, color: '#666' }}>
              {heir.subtitle}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 9,
              color: equilibriumColor(heir.equilibriumStatus),
              fontWeight: 600,
              marginRight: 8,
            }}
          >
            {equilibriumIndicator(heir.equilibriumStatus, heir.equilibriumPercentage)}
          </Text>
          <Text style={{ fontSize: 8, color: '#666' }}>
            Target: {bdtFormat(heir.targetValue)}
          </Text>
        </View>
      </View>

      {/* Asset table header */}
      {heir.items.length > 0 && (
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableCell, { flex: 2, fontSize: 8, fontWeight: 600 }]}>
            Item
          </Text>
          <Text style={[styles.tableCell, { flex: 1, fontSize: 8, fontWeight: 600 }]}>
            Category
          </Text>
          <Text style={[styles.tableCell, { flex: 1, fontSize: 8, fontWeight: 600, textAlign: 'right' }]}>
            Value (BDT)
          </Text>
        </View>
      )}

      {/* Asset rows */}
      {heir.items.length > 0 ? (
        heir.items.map((item, iIdx) => (
          <View
            key={iIdx}
            style={[
              styles.tableRow,
              iIdx % 2 === 1 ? styles.alternatingRow : {},
            ]}
          >
            <Text style={[styles.tableCell, { flex: 2 }]}>
              {item.label}
            </Text>
            <Text style={[styles.tableCell, { flex: 1, fontSize: 9, color: '#555' }]}>
              {item.category}
            </Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
              {bdtFormat(item.value)}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { fontStyle: 'italic', color: '#888' }]}>
            No assets assigned
          </Text>
        </View>
      )}

      {/* Summary row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 6,
          paddingVertical: 3,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        }}
      >
        <Text style={{ fontSize: 9 }}>
          Received: {bdtFormat(heir.assignedValue)}
        </Text>
        {heir.cashAdjustment !== 0 && (
          <Text
            style={{
              fontSize: 9,
              color: heir.cashAdjustment > 0 ? '#dc2626' : '#059669',
            }}
          >
            {heir.cashAdjustment > 0
              ? `+${bdtFormat(Math.abs(heir.cashAdjustment))} over target`
              : `-${bdtFormat(Math.abs(heir.cashAdjustment))} under target`}
          </Text>
        )}
      </View>
    </View>
  )
}

export function PdfIndividualSection({
  individualDistribution,
}: {
  individualDistribution: PdfIndividualDistribution
}) {
  const totalCompensation = individualDistribution.compensations.reduce(
    (sum, c) => sum + c.amount,
    0,
  )

  return (
    <View style={styles.section} break>
      {/* Section title with gold accent */}
      <View style={{ borderBottomWidth: 2, borderBottomColor: '#b45309', paddingBottom: 4, marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>
          Individual Asset Breakdown
        </Text>
        <Text style={{ fontSize: 8, color: '#92400e', marginTop: 2 }}>
          Per-heir distribution showing each individual&apos;s assigned parcels and assets
        </Text>
      </View>

      {/* Qurah reference */}
      {individualDistribution.qurahUsed && (
        <View
          style={{
            backgroundColor: '#fef3c7',
            paddingVertical: 4,
            paddingHorizontal: 8,
            marginBottom: 10,
            borderLeftWidth: 3,
            borderLeftColor: '#b45309',
          }}
        >
          <Text style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>
            Division assigned by Qurah (Islamic lot drawing)
          </Text>
          <Text style={{ fontSize: 8, color: '#92400e', marginTop: 2 }}>
            &quot;And [the Prophet] divided by lot&quot; - the Qurah method ensures fair random assignment among equal shares
          </Text>
        </View>
      )}

      {/* Heir type groups */}
      {individualDistribution.heirsByType.map((group, gIdx) => (
        <View key={gIdx} wrap={false}>
          {/* Type section header */}
          <View
            style={{
              backgroundColor: '#e5e7eb',
              paddingVertical: 4,
              paddingHorizontal: 8,
              marginTop: gIdx > 0 ? 12 : 0,
              marginBottom: 6,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
              {group.typeName}
              {group.heirs.length > 1 ? ` (${group.heirs.length})` : ''}
            </Text>
          </View>

          {/* Individual heirs */}
          {group.heirs.map((heir) => (
            <HeirRow key={heir.id} heir={heir} />
          ))}
        </View>
      ))}

      {/* Cash Compensation Between Heirs */}
      {individualDistribution.compensations.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 4,
              color: '#92400e',
            }}
          >
            Cash Compensation Between Heirs
          </Text>
          {individualDistribution.compensations.map((comp, cIdx) => (
            <View key={cIdx} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {comp.fromName} pays {comp.toName}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: 1, textAlign: 'right', fontWeight: 600 },
                ]}
              >
                {bdtFormat(comp.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Summary line */}
      <View
        style={{
          marginTop: 10,
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: '#d1d5db',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: 600 }}>
          {individualDistribution.totalBalanced}/{individualDistribution.totalHeirs} heirs balanced
        </Text>
        {totalCompensation > 0 && (
          <Text style={{ fontSize: 10, color: '#92400e' }}>
            Total compensation: {bdtFormat(totalCompensation)}
          </Text>
        )}
      </View>
    </View>
  )
}
