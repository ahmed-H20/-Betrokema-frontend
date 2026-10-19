import type { Invoice } from '@/api/invoices.schema'
import {
  INVOICE_BADGE_DUE,
  INVOICE_BADGE_OVERDUE,
  INVOICE_BADGE_PAID,
  INVOICE_BADGE_PARTIAL,
  INVOICE_BADGE_UNPAID,
} from '@/constants/strings'

// Exact definitions, mirrored in context/code-standards.md — see that file
// before changing any of this (context/build-plan.md Chunk 2 build order
// step 9 requires the definitions to be documented, not just coded).

export function excludeCancelled(invoices: Invoice[]): Invoice[] {
  return invoices.filter((invoice) => invoice.orderStatus !== 'cancelled')
}

export function remainingAmount(invoice: Invoice): number {
  return Math.max(0, invoice.totalPrice - invoice.totalPaid)
}

export function isOverdue(invoice: Invoice): boolean {
  if (invoice.paymentStatus === 'overdue') return true
  if (!invoice.dueDate) return false
  const notFullyPaid = invoice.totalPaid < invoice.totalPrice
  return notFullyPaid && new Date(invoice.dueDate).getTime() < Date.now()
}

export type InvoiceKpis = {
  collected: number
  inCollection: number
  overdueTotal: number
}

export function computeInvoiceKpis(invoices: Invoice[]): InvoiceKpis {
  const included = excludeCancelled(invoices)
  let collected = 0
  let inCollection = 0
  let overdueTotal = 0

  for (const invoice of included) {
    collected += invoice.totalPaid
    if (isOverdue(invoice)) {
      overdueTotal += remainingAmount(invoice)
    } else if (
      invoice.paymentStatus === 'unpaid' ||
      invoice.paymentStatus === 'partially_paid'
    ) {
      inCollection += remainingAmount(invoice)
    }
  }

  return { collected, inCollection, overdueTotal }
}

export type InvoiceRowTone = 'success' | 'warning' | 'error' | 'neutral'
export type InvoiceRowBadge = { label: string; tone: InvoiceRowTone }

function formatDueDateShort(iso: string): string {
  const date = new Date(iso)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

// Precedence (documented in code-standards.md): paid > overdue (the rule
// above, which also catches a past-due partially_paid order) > partially_paid
// > unpaid. This keeps a row's badge consistent with whichever KPI pill its
// remaining amount was summed into above — a partially-paid order already
// counted into "متأخرات" never also reads "سداد جزئي".
export function getInvoiceRowBadge(invoice: Invoice): InvoiceRowBadge {
  if (invoice.paymentStatus === 'paid') {
    return { label: INVOICE_BADGE_PAID, tone: 'success' }
  }
  if (isOverdue(invoice)) {
    return { label: INVOICE_BADGE_OVERDUE, tone: 'error' }
  }
  if (invoice.paymentStatus === 'partially_paid') {
    return { label: INVOICE_BADGE_PARTIAL, tone: 'warning' }
  }
  if (invoice.dueDate) {
    return { label: INVOICE_BADGE_DUE(formatDueDateShort(invoice.dueDate)), tone: 'neutral' }
  }
  return { label: INVOICE_BADGE_UNPAID, tone: 'neutral' }
}
