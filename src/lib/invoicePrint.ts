import type { PrintableInvoicePaperProps } from '@/features/invoices/components/PrintableInvoicePaper'

/**
 * Opens an existing invoice in a dedicated, pristine A4 print window/tab.
 */
export function openInvoicePrintWindow(invoiceId: string) {
  if (!invoiceId) return
  const url = `/invoices/print/${encodeURIComponent(invoiceId)}`
  window.open(url, '_blank')
}

/**
 * Opens a draft invoice in a dedicated print window by storing its properties in sessionStorage.
 */
export function openInvoiceDraftPrintWindow(draftData: PrintableInvoicePaperProps) {
  try {
    sessionStorage.setItem('petrokema_print_draft', JSON.stringify(draftData))
  } catch (err) {
    console.error('Failed to store print draft:', err)
  }
  window.open('/invoices/print/draft', '_blank')
}
