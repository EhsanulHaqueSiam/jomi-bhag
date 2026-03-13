import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import type { PdfLotDivision } from './pdfTypes'

const bdtFormat = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

export function PdfLotDivisionSection({
  lotDivision,
}: {
  lotDivision: PdfLotDivision
}) {
  return (
    <View style={styles.section} break>
      <Text style={styles.sectionHeading}>Land Division</Text>

      {/* Group assignments */}
      {lotDivision.groups.map((group, gIdx) => (
        <View key={gIdx} style={{ marginBottom: 12 }}>
          {/* Group header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: '#f3f4f6',
              paddingVertical: 4,
              paddingHorizontal: 6,
              borderBottomWidth: 1,
              borderBottomColor: '#d1d5db',
            }}
          >
            <Text style={{ fontWeight: 600, fontSize: 11 }}>
              {group.heirType}
              {group.count > 1 ? ` (x${group.count})` : ''}
            </Text>
            <Text style={{ fontSize: 9, color: '#666' }}>
              Target: {bdtFormat(group.targetValue)}
            </Text>
          </View>

          {/* Parcel rows */}
          {group.assignedProperties.length > 0 ? (
            group.assignedProperties.map((prop, pIdx) => (
              <View
                key={pIdx}
                style={[
                  styles.tableRow,
                  pIdx % 2 === 1 ? styles.alternatingRow : {},
                ]}
              >
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {prop.nickname}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1, textAlign: 'right' },
                  ]}
                >
                  {bdtFormat(prop.value)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text
                style={[styles.tableCell, { fontStyle: 'italic', color: '#888' }]}
              >
                No land parcels assigned
              </Text>
            </View>
          )}

          {/* Summary row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 6,
              paddingVertical: 4,
              borderTopWidth: 1,
              borderTopColor: '#d1d5db',
            }}
          >
            <Text style={{ fontSize: 9 }}>
              Received: {bdtFormat(group.assignedValue)}
            </Text>
            <Text
              style={{
                fontSize: 9,
                color:
                  group.cashAdjustment > 0
                    ? '#dc2626'
                    : group.cashAdjustment < 0
                      ? '#059669'
                      : '#333',
              }}
            >
              {group.cashAdjustment > 0
                ? `Owes ${bdtFormat(Math.abs(group.cashAdjustment))} cash`
                : group.cashAdjustment < 0
                  ? `Owed ${bdtFormat(Math.abs(group.cashAdjustment))} cash`
                  : 'Balanced'}
            </Text>
          </View>
        </View>
      ))}

      {/* Cash Compensation summary */}
      {lotDivision.compensations.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 4,
              color: '#92400e',
            }}
          >
            Cash Compensation
          </Text>
          {lotDivision.compensations.map((comp, cIdx) => (
            <View key={cIdx} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {comp.from} owes {comp.to}
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
    </View>
  )
}
