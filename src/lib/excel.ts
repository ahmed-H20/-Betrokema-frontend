import * as XLSX from 'xlsx'

export interface ExcelExportOptions {
  filename: string
  sheetName?: string
  headers: string[]
  rows: (string | number | boolean | null | undefined)[][]
}

/**
 * Exports tabular data as a native Microsoft Excel (.xlsx) file with:
 * - Proper Arabic Right-to-Left (RTL) view in Excel
 * - Each column separated in its own distinct cells (fixes single-cell bug)
 * - Auto-calculated column widths for optimal readability
 * - UTF-8 Arabic text encoding preserved without corruption
 */
export function exportToExcel({
  filename,
  sheetName = 'كشف الحساب',
  headers,
  rows,
}: ExcelExportOptions): void {
  // Build sheet from array of arrays
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Configure Excel Right-to-Left (RTL) sheet view for Arabic
  ws['!views'] = [{ rightToLeft: true }]

  // Auto-fit column widths based on maximum content length
  const colWidths = headers.map((header, colIndex) => {
    let maxLength = String(header || '').length
    for (const row of rows) {
      const cellVal = row[colIndex]
      const cellLength = String(cellVal ?? '').length
      if (cellLength > maxLength) {
        maxLength = cellLength
      }
    }
    return { wch: Math.min(Math.max(maxLength + 4, 12), 45) }
  })
  ws['!cols'] = colWidths

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)) // Sheet name max 31 chars in Excel

  // Normalize file extension to .xlsx
  const cleanFilename = filename.replace(/\.(csv|xlsx?)$/i, '')
  const finalFilename = `${cleanFilename}.xlsx`

  // Trigger browser download of native .xlsx
  XLSX.writeFile(wb, finalFilename)
}
