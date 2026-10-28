// utils/exportUtils.ts
import { PDFGenerator, PDFTableColumn, PDFTableData } from '@/utils/pdf'

export const getCSVDownloadLink = (data: any[]) => {
  const csvContent = data.map((item) => Object.values(item).join(',')).join('\n')
  return 'data:text/csv;charset=utf-8,SEP=,%0A' + encodeURIComponent(csvContent)
}

export const generateCSV = (
  fileName: string,
  columns: { header: string; dataKey: string }[],
  data: any[],
) => {
  // Prepare CSV header row using 'header' from columns
  const csvHeader = columns.map((col) => col.header).join(',')

  // Prepare CSV data rows using 'dataKey' to extract values
  const csvRows = data.map((item) =>
    columns
      .map((col) => {
        let value = item[col.dataKey]

        // Handle missing keys
        if (value === null || value === undefined || value === '') {
          value = 'N/A'
        }

        // Convert booleans to 'Activated' or 'Deactivated'
        if (typeof value === 'boolean') {
          value = value ? 'Activated' : 'Deactivated'
        }

        return value
      })
      .join(','),
  )

  // const cleanRow = sanitizeData(data, csvHeader)
  // Combine header and rows
  const csvContent = [csvHeader, ...csvRows].join('\n')

  // Create a blob for CSV content
  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  // Create a download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(csvBlob)
  link.setAttribute('href', url)
  link.setAttribute('download', fileName)

  // Programmatically click the link to trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Revoke the object URL after download
  URL.revokeObjectURL(url)
}

const sanitizeData = (data: PDFTableData[], columns: PDFTableColumn[]): any[] => {
  return data.map((item) =>
    columns.reduce((acc, col) => {
      let value = item[col.dataKey]

      // Replace null, undefined, or empty values with 'N/A'
      if (value === null || value === undefined || value === '') {
        value = 'N/A'
      }

      // Convert booleans to 'true' or 'false' strings
      if (typeof value === 'boolean') {
        value = value ? 'Activated' : 'Deactivated'
      }

      // @ts-ignore
      acc[col.header] = value
      return acc
    }, {} as { [key: string]: string }),
  )
}

export const generatePDF = (
  title: string,
  columns: PDFTableColumn[],
  data: any[],
  fileName: string,
) => {
  console.log(data)
  const hasLongStringInAnyKey = (data: any, lengthThreshold = 100) => {
    return data.some((item: any) => {
      return Object.values(item).some(
        (value) => typeof value === 'string' && value.length > lengthThreshold,
      )
    })
  }
  const result = hasLongStringInAnyKey(data)
  if (result) {
    const pdfGenerator = new PDFGenerator([2200, 480])
    pdfGenerator.generatePDF(title, columns, data, fileName)
  } else {
    const pdfGenerator = new PDFGenerator()
    pdfGenerator.generatePDF(title, columns, data, fileName)
  }
}
