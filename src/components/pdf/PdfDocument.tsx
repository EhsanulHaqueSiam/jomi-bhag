import { Document, Page, Text } from '@react-pdf/renderer'
import './pdfFonts'
import { styles } from './pdfStyles'
import type { PdfData } from './pdfTypes'

import { PdfHeader } from './PdfHeader'
import { PdfHeirTable } from './PdfHeirTable'
import { PdfChartSection } from './PdfChartSection'
import { PdfPropertySection } from './PdfPropertySection'
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
