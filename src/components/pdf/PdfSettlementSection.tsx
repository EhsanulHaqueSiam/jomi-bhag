import { View, Text } from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import type {
  PdfSettlement,
  PdfSettlementSellSplit,
  PdfSettlementPhysicalDivision,
  PdfSettlementBuyout,
  PdfSettlementJointOwnership,
} from './pdfTypes'

const bdtFormat = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

const METHOD_LABELS: Record<string, string> = {
  sell_split: 'Sell & Split',
  physical_division: 'Physical Division',
  buyout: 'Buyout',
  joint_ownership: 'Joint Ownership',
}

function SellSplitDetail({ detail }: { detail: PdfSettlementSellSplit }) {
  return (
    <View>
      <Text style={{ fontSize: 9, marginBottom: 4 }}>
        Sale Price: {bdtFormat(detail.effectivePrice)}
        {detail.isOverridden ? ' (actual sale price)' : ' (property value)'}
      </Text>

      {/* Payout table header */}
      <View style={styles.tableHeaderRow}>
        <Text
          style={[styles.tableCell, { flex: 2, fontSize: 8, fontWeight: 600 }]}
        >
          Heir Group
        </Text>
        <Text
          style={[
            styles.tableCell,
            { flex: 1, fontSize: 8, fontWeight: 600, textAlign: 'right' },
          ]}
        >
          Payout (BDT)
        </Text>
      </View>

      {detail.payouts.map((payout, idx) => (
        <View
          key={idx}
          style={[
            styles.tableRow,
            idx % 2 === 1 ? styles.alternatingRow : {},
          ]}
        >
          <Text style={[styles.tableCell, { flex: 2 }]}>
            {payout.heirType}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
            {bdtFormat(payout.amount)}
          </Text>
        </View>
      ))}
    </View>
  )
}

function PhysicalDivisionDetail({
  detail,
}: {
  detail: PdfSettlementPhysicalDivision
}) {
  return (
    <View>
      {/* Sub-parcel table header */}
      <View style={styles.tableHeaderRow}>
        <Text
          style={[styles.tableCell, { flex: 2, fontSize: 8, fontWeight: 600 }]}
        >
          Sub-Parcel
        </Text>
        <Text
          style={[
            styles.tableCell,
            { flex: 1, fontSize: 8, fontWeight: 600, textAlign: 'right' },
          ]}
        >
          Area
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

      {detail.subParcels.map((parcel, idx) => (
        <View
          key={idx}
          style={[
            styles.tableRow,
            idx % 2 === 1 ? styles.alternatingRow : {},
          ]}
        >
          <Text style={[styles.tableCell, { flex: 2 }]}>{parcel.name}</Text>
          <Text
            style={[
              styles.tableCell,
              { flex: 1, textAlign: 'right', fontSize: 9, color: '#555' },
            ]}
          >
            {parcel.area}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
            {bdtFormat(parcel.appraisedValue)}
          </Text>
        </View>
      ))}

      {/* Summary */}
      <View
        style={{
          marginTop: 6,
          paddingHorizontal: 4,
          borderTopWidth: 1,
          borderTopColor: '#d1d5db',
          paddingTop: 4,
        }}
      >
        <Text style={{ fontSize: 9 }}>
          Total sub-parcel value: {bdtFormat(detail.totalSubParcelValue)} |
          Property value: {bdtFormat(detail.propertyValue)}
        </Text>
        {detail.compensation !== 0 && (
          <Text style={{ fontSize: 9, color: '#92400e', marginTop: 2 }}>
            Cash compensation needed:{' '}
            {bdtFormat(Math.abs(detail.compensation))}
          </Text>
        )}
      </View>
    </View>
  )
}

function BuyoutDetail({ detail }: { detail: PdfSettlementBuyout }) {
  return (
    <View>
      <Text style={{ fontSize: 9, marginBottom: 4 }}>
        Buyer: {detail.buyer}
      </Text>
      <Text style={{ fontSize: 9, marginBottom: 4 }}>
        Compensation owed to other heirs: {bdtFormat(detail.compensationOwed)}
      </Text>

      {/* Per-group payment table */}
      <View style={styles.tableHeaderRow}>
        <Text
          style={[styles.tableCell, { flex: 2, fontSize: 8, fontWeight: 600 }]}
        >
          Heir Group
        </Text>
        <Text
          style={[
            styles.tableCell,
            { flex: 1, fontSize: 8, fontWeight: 600, textAlign: 'right' },
          ]}
        >
          Payment (BDT)
        </Text>
      </View>

      {detail.perGroupPayments.map((payment, idx) => (
        <View
          key={idx}
          style={[
            styles.tableRow,
            idx % 2 === 1 ? styles.alternatingRow : {},
          ]}
        >
          <Text style={[styles.tableCell, { flex: 2 }]}>
            {payment.heirType}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
            {bdtFormat(payment.amount)}
          </Text>
        </View>
      ))}

      {/* Installment plan */}
      {detail.installmentPlan && (
        <View
          style={{
            marginTop: 6,
            paddingHorizontal: 4,
            paddingVertical: 4,
            backgroundColor: '#f0fdf4',
            borderRadius: 2,
          }}
        >
          <Text style={{ fontSize: 9 }}>
            Payment plan: ~{bdtFormat(detail.installmentPlan.perInstallment)}
            /month for {detail.installmentPlan.count} months
          </Text>
          <Text style={{ fontSize: 8, color: '#059669', marginTop: 2 }}>
            No interest -- Islamic finance compliant
          </Text>
        </View>
      )}
    </View>
  )
}

function JointOwnershipDetail({
  detail,
}: {
  detail: PdfSettlementJointOwnership
}) {
  return (
    <View>
      {/* Ownership shares table */}
      <View style={styles.tableHeaderRow}>
        <Text
          style={[styles.tableCell, { flex: 2, fontSize: 8, fontWeight: 600 }]}
        >
          Heir Group
        </Text>
        <Text
          style={[
            styles.tableCell,
            { flex: 1, fontSize: 8, fontWeight: 600, textAlign: 'right' },
          ]}
        >
          Ownership (%)
        </Text>
      </View>

      {detail.ownershipShares.map((share, idx) => (
        <View
          key={idx}
          style={[
            styles.tableRow,
            idx % 2 === 1 ? styles.alternatingRow : {},
          ]}
        >
          <Text style={[styles.tableCell, { flex: 2 }]}>
            {share.heirType}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
            {share.percentage}%
          </Text>
        </View>
      ))}

      {/* Income distribution */}
      {detail.income && (
        <View style={{ marginTop: 8 }}>
          <Text
            style={{ fontSize: 10, fontWeight: 600, marginBottom: 4 }}
          >
            Income Distribution ({detail.income.type} -- {detail.income.period})
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 4 }}>
            Total {detail.income.period.toLowerCase()} income:{' '}
            {bdtFormat(detail.income.amount)}
          </Text>

          <View style={styles.tableHeaderRow}>
            <Text
              style={[
                styles.tableCell,
                { flex: 2, fontSize: 8, fontWeight: 600 },
              ]}
            >
              Heir Group
            </Text>
            <Text
              style={[
                styles.tableCell,
                { flex: 1, fontSize: 8, fontWeight: 600, textAlign: 'right' },
              ]}
            >
              Share (BDT)
            </Text>
          </View>

          {detail.income.distribution.map((dist, idx) => (
            <View
              key={idx}
              style={[
                styles.tableRow,
                idx % 2 === 1 ? styles.alternatingRow : {},
              ]}
            >
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {dist.heirType}
              </Text>
              <Text
                style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}
              >
                {bdtFormat(dist.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Legal note */}
      <View
        style={{
          marginTop: 6,
          paddingHorizontal: 4,
          paddingVertical: 4,
          backgroundColor: '#fffbeb',
          borderRadius: 2,
        }}
      >
        <Text style={{ fontSize: 8, color: '#92400e' }}>
          Formal co-ownership agreement recommended -- consult a lawyer for
          legal documentation.
        </Text>
      </View>
    </View>
  )
}

export function PdfSettlementSection({
  settlements,
}: {
  settlements: PdfSettlement[]
}) {
  return (
    <View style={styles.section} break>
      <Text style={styles.sectionHeading}>Settlement Plan</Text>

      {settlements.map((settlement, sIdx) => (
        <View key={sIdx} style={{ marginBottom: 14 }}>
          {/* Property sub-header */}
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
              {settlement.propertyName}
            </Text>
            <Text style={{ fontSize: 9, color: '#666' }}>
              {bdtFormat(settlement.propertyValue)}
            </Text>
          </View>

          {/* Method label */}
          <Text
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#059669',
              marginTop: 4,
              marginBottom: 4,
              paddingHorizontal: 4,
            }}
          >
            Method: {METHOD_LABELS[settlement.detail.method]}
          </Text>

          {/* Method-specific details */}
          <View style={{ paddingHorizontal: 4 }}>
            {settlement.detail.method === 'sell_split' && (
              <SellSplitDetail detail={settlement.detail} />
            )}
            {settlement.detail.method === 'physical_division' && (
              <PhysicalDivisionDetail detail={settlement.detail} />
            )}
            {settlement.detail.method === 'buyout' && (
              <BuyoutDetail detail={settlement.detail} />
            )}
            {settlement.detail.method === 'joint_ownership' && (
              <JointOwnershipDetail detail={settlement.detail} />
            )}
          </View>
        </View>
      ))}
    </View>
  )
}
