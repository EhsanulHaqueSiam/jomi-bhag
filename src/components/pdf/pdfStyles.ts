import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  // Page
  page: {
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 50,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#333',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },

  // Section heading
  sectionHeading: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    color: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 4,
  },

  // Table header row
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingVertical: 6,
  },

  // Table row
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    minHeight: 24,
    alignItems: 'center',
    paddingVertical: 4,
  },

  // Alternating row
  alternatingRow: {
    backgroundColor: '#f9fafb',
  },

  // Table cell
  tableCell: {
    paddingHorizontal: 4,
  },

  // Disclaimer box
  disclaimerBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 16,
    marginTop: 8,
    backgroundColor: '#fefce8',
  },

  // Arabic text
  arabicText: {
    fontFamily: 'Noto Naskh Arabic',
    fontSize: 13,
    direction: 'rtl',
    textAlign: 'right',
    lineHeight: 1.8,
    color: '#333',
  },

  // Section spacing
  section: {
    marginTop: 20,
  },

  // Small text
  smallText: {
    fontSize: 8,
    color: '#888',
  },
})
