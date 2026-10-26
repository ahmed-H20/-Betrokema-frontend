// Client-side CSV builder — the backend has no file-export endpoint
// (GET /warehouses/export returns JSON rows only, see architecture.md).
const UTF8_BOM = '﻿'

// Spreadsheet apps (Excel, Sheets) evaluate a leading =, +, -, @ or tab as a
// formula — prefix those cells with a single quote so they render as plain
// text instead of executing (CSV/formula injection guard).
function neutralizeCell(value: string): string {
  return /^[=+\-@\t]/.test(value) ? `'${value}` : value
}

function escapeCell(value: unknown): string {
  const text = neutralizeCell(String(value ?? ''))
  if (/[",\r\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function buildCsv(
  headers: string[],
  rows: (string | number)[][],
): string {
  const lines = [headers, ...rows].map((row) =>
    row.map(escapeCell).join(','),
  )
  // 'sep=,\r\n' immediately after BOM explicitly informs Microsoft Excel to treat comma as delimiter
  // avoiding regional setting mismatches where Excel merges entire rows into a single cell.
  return UTF8_BOM + 'sep=,\r\n' + lines.join('\r\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
