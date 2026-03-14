import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import type { PdfDistribution } from './pdfTypes'
import { pdfBdtFormat } from './extractPdfData'

export function PdfDistributionSection({
  distribution,
}: {
  distribution: PdfDistribution
}) {
  return (
    <View style={styles.section} break>
      <Text style={styles.sectionHeading}>Distribution Summary</Text>

      {/* Group assignments */}
      {distribution.groups.map((group, gIdx) => (
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
              Target: {pdfBdtFormat(group.targetValue)}
            </Text>
          </View>

          {/* Item table header */}
          {group.assignedItems.length > 0 && (
            <View style={styles.tableHeaderRow}>
              <Text
                style={[
                  styles.tableCell,
                  { flex: 2, fontSize: 8, fontWeight: 600 },
                ]}
              >
                Item
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: 1, fontSize: 8, fontWeight: 600 },
                ]}
              >
                Category
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: 1, fontSize: 8, fontWeight: 600, textAlign: 'right' },
                ]}
              >
                Value (BDT)
              </Text>
            </View>
          )}

          {/* Item rows (sorted by value descending) */}
          {group.assignedItems.length > 0 ? (
            group.assignedItems.map((item, iIdx) => (
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
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1, textAlign: 'right' },
                  ]}
                >
                  {pdfBdtFormat(item.value)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text
                style={[styles.tableCell, { fontStyle: 'italic', color: '#888' }]}
              >
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
              paddingVertical: 4,
              borderTopWidth: 1,
              borderTopColor: '#d1d5db',
            }}
          >
            <Text style={{ fontSize: 9 }}>
              Received: {pdfBdtFormat(group.assignedValue)}
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
                ? `Owes ${pdfBdtFormat(Math.abs(group.cashAdjustment))} cash`
                : group.cashAdjustment < 0
                  ? `Owed ${pdfBdtFormat(Math.abs(group.cashAdjustment))} cash`
                  : 'Balanced'}
            </Text>
          </View>
        </View>
      ))}

      {/* Cash Compensation summary */}
      {distribution.compensations.length > 0 && (
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
          {distribution.compensations.map((comp, cIdx) => (
            <View key={cIdx} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {comp.from} pays {comp.to}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: 1, textAlign: 'right', fontWeight: 600 },
                ]}
              >
                {pdfBdtFormat(comp.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
