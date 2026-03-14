import { Document, Page, Text } from '@react-pdf/renderer'
import './pdfFonts'
import { styles } from './pdfStyles'
import type { PdfData } from './pdfTypes'

import { PdfHeader } from './PdfHeader'
import { PdfHeirTable } from './PdfHeirTable'
import { PdfChartSection } from './PdfChartSection'
import { PdfPropertySection } from './PdfPropertySection'
import { PdfMovableAssetsSection } from './PdfMovableAssetsSection'
import { PdfDistributionSection } from './PdfDistributionSection'
import { PdfIndividualSection } from './PdfIndividualSection'
import { PdfSettlementSection } from './PdfSettlementSection'
import { PdfStepsSection } from './PdfStepsSection'
import { PdfReferencesSection } from './PdfReferencesSection'
import { PdfDisclaimer } from './PdfDisclaimer'

export function PdfDocument({ data }: { data: PdfData }) {
  return (
    <Document
      title="Islamic Inheritance Division Report"
      author="Jomi-Bhag"
      subject="Faraid Calculation"
    >
      <Page size="A4" style={styles.page}>
        {/* Fixed footer on every page */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />

        {/* 1. Header */}
        <PdfHeader generatedAt={data.generatedAt} />

        {/* 2. Heir Share Table */}
        <PdfHeirTable data={data} />

        {/* 3. Charts */}
        <PdfChartSection
          pieChartImage={data.pieChartImage}
          barChartImage={data.barChartImage}
        />

        {/* 4. Property Breakdown */}
        <PdfPropertySection
          properties={data.properties}
          totalEstateValue={data.totalEstateValue}
        />

        {/* 4b. Movable Assets */}
        {data.movableAssets.length > 0 && (
          <PdfMovableAssetsSection
            movableAssets={data.movableAssets}
            movableAssetsTotal={data.movableAssetsTotal}
          />
        )}

        {/* 4c. Distribution */}
        {data.distribution && (
          <PdfDistributionSection distribution={data.distribution} />
        )}

        {/* 4e. Individual Asset Breakdown */}
        {data.individualDistribution && (
          <PdfIndividualSection
            individualDistribution={data.individualDistribution}
          />
        )}

        {/* 4d. Settlement Plan */}
        {data.settlements && data.settlements.length > 0 && (
          <PdfSettlementSection settlements={data.settlements} />
        )}

        {/* 5. Step-by-Step Calculation */}
        <PdfStepsSection steps={data.steps} />

        {/* 6. Islamic References */}
        <PdfReferencesSection references={data.references} />

        {/* 7. Disclaimer */}
        <PdfDisclaimer generatedAt={data.generatedAt} />
      </Page>
    </Document>
  )
}
