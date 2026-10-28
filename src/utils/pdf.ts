import jsPDF, { CellConfig } from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface PDFTableColumn {
  header: string
  dataKey: string
}

export interface PDFTableData {
  [key: string]: string | number | boolean | null | undefined
}

export interface TableConfig {
  printHeaders?: boolean
  autoSize?: boolean
  margins?: number
  fontSize?: number
  padding?: number
  headerBackgroundColor?: string
  headerTextColor?: string
  rowStart?: (e: TableRowData, doc: jsPDF) => void
  cellStart?: (e: TableCellData, doc: jsPDF) => void
  css?: {
    'font-size': number
  }
}

export interface TableRowData {
  [key: string]: any
}

export interface TableCellData {
  [key: string]: any
}

export class PDFGenerator {
  private doc: jsPDF

  constructor(formats?: any[]) {
    if (formats) {
      this.doc = new jsPDF('p', 'mm', formats)
    } else {
      this.doc = new jsPDF('p', 'mm', [600, 480])
    }
  }

  // Public method to generate PDF
  public generatePDF(
    title: string,
    columns: PDFTableColumn[],
    data: PDFTableData[],
    fileName: string,
  ) {
    this.addTitle(title)
    this.addTable(columns, this.sanitizeData(data, columns))
    this.savePDF(fileName)
  }

  // Add title to the PDF
  private addTitle(title: string) {
    this.doc.text(title, 10, 10)
  }

  // Sanitize data before adding to the PDF
  private sanitizeData(data: PDFTableData[], columns: PDFTableColumn[]): any[] {
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
        // acc[col.dataKey] = value
        return acc
      }, {} as { [key: string]: string }),
    )
  }

  // Add table to the PDF
  // private addTable(columns: PDFTableColumn[], data: any[]) {
  //   const startX = 10
  //   const startY = 20

  //   const headers = columns.map((col) => col.header)

  //   const config: TableConfig = {
  //     printHeaders: true,
  //     autoSize: true,
  //     margins: 5,
  //     padding: 2,
  //     headerBackgroundColor: '#3d5c9b',
  //     headerTextColor: '#fff',
  //   }

  //   this.doc.table(startX, startY, data, headers, config)
  // }

  // private addTable(columns: PDFTableColumn[], data: any[]) {
  //   const startX = 10
  //   const startY = 20

  //   const headers = columns.map((col) => col.header)

  //   const processedData = data.map((row) => {
  //     const processedRow: { [key: string]: any } = {}
  //     for (const key in row) {
  //       this.doc.setLineHeightFactor(1.4)
  //       this.doc.setFontSize(12)
  //       if (typeof row[key] === 'string' && row[key].length > 100) {
  //         processedRow[key] = this.doc.splitTextToSize(row[key], 180) // Adjust width (e.g., 180mm for A4)
  //       } else {
  //         console.log(
  //           this.doc.getLineWidth(),
  //           this.doc.getLineHeight(),
  //           this.doc.getLineHeightFactor(),
  //         )
  //         processedRow[key] = row[key]
  //       }
  //     }
  //     return processedRow
  //   })

  //   const config: TableConfig = {
  //     printHeaders: true,
  //     autoSize: true,
  //     margins: 5,
  //     padding: 2,
  //     headerBackgroundColor: '#3d5c9b',
  //     headerTextColor: '#fff',
  //   }
  //   const headerConfig: CellConfig[] = headers.map((header) => ({
  //     name: header,
  //     width: 240,
  //     prompt: header,
  //     padding: 2,
  //     align: 'left',
  //   }))
  //   // Use the processed data with split text
  //   this.doc.table(startX, startY, processedData, headerConfig, config)
  // }

  private addTable(columns: PDFTableColumn[], data: any[]) {
    const startX = 10
    const startY = 20

    const headers = columns.map((col) => col.header)

    // Processed table data (add row handling if needed)
    const processedData = data.map((row) => {
      const processedRow: { [key: string]: any } = {}
      for (const key in row) {
        if (typeof row[key] === 'string' && row[key].length > 100) {
          // Split long strings into multiple lines
          processedRow[key] = this.doc.splitTextToSize(row[key], 180)
        } else {
          processedRow[key] = row[key]
        }
      }
      return processedRow
    })

    // Set header font size via the headStyles option
    autoTable(this.doc, {
      head: [headers],
      body: processedData.map((item) => Object.values(item)),
      startY: startY,
      theme: 'grid',
      headStyles: {
        fontSize: 14, // Increase font size for the header
        fontStyle: 'bold', // Optional: Make it bold
        fillColor: '#3d5c9b', // Optional: Background color
        textColor: '#fff', // Optional: Text color
      },
      margin: { top: 10 },
    })
  }

  private savePDF(fileName: string) {
    this.doc.save(`${fileName}.pdf`)
  }
}
