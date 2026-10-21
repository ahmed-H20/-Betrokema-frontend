import { useState, useMemo } from 'react'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import { StateMessage } from '@/components/ui/StateMessage'
import { StatusPill } from '@/components/ui/StatusPill'
import type { Client } from '@/api/clients.schema'
import type { Invoice } from '@/api/invoices.schema'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useInvoicesForClient } from '@/features/sellers/hooks'
import { InvoiceDetailsModal } from '@/features/invoices/components/InvoiceDetailsModal'
import { AddPaymentModal } from '@/features/invoices/components/AddPaymentModal'
import {
  computeInvoiceKpis,
  getInvoiceRowBadge,
  isOverdue,
} from '@/features/sellers/invoiceAggregation'

type ClientInvoicesModalProps = {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
  sellerName?: string
  onSwitchToInvoicesTab?: (client: Client) => void
}

function formatInvoiceDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function ClientInvoicesModal({
  client,
  open,
  onOpenChange,
  sellerName,
  onSwitchToInvoicesTab,
}: ClientInvoicesModalProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
  const [search, setSearch] = useState('')

  const invoicesQuery = useInvoicesForClient(client?._id)
  const rawInvoices = invoicesQuery.data || []

  // Filter invoices by search
  const filteredInvoices = useMemo(() => {
    if (!search.trim()) return rawInvoices
    const q = search.trim().toLowerCase()
    return rawInvoices.filter(
      (inv) =>
        inv.invoiceCode.toLowerCase().includes(q) ||
        (inv.orderStatus && inv.orderStatus.toLowerCase().includes(q)) ||
        (inv.paymentStatus && inv.paymentStatus.toLowerCase().includes(q)),
    )
  }, [rawInvoices, search])

  // Compute KPIs
  const kpis = useMemo(() => {
    const included = rawInvoices.filter((inv) => inv.orderStatus !== 'cancelled')
    const totalSales = included.reduce((sum, inv) => sum + (Number(inv.totalPrice) || 0), 0)
    const totalPaid = included.reduce((sum, inv) => sum + (Number(inv.totalPaid) || 0), 0)
    const remaining = Math.max(0, totalSales - totalPaid)
    return {
      totalSales,
      totalPaid,
      remaining,
    }
  }, [rawInvoices])

  if (!client) return null

  const clientTitle = client.organizeName || client.name

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-4xl">
        <DialogHeader
          icon="receipt_long"
          onClose={() => onOpenChange(false)}
          subtitle={`كود العميل: #${client.clientCode || '—'} · هاتف: ${client.phone} ${
            sellerName ? `· المندوب: ${sellerName}` : ''
          }`}
          title={`فواتير العميل: ${clientTitle}`}
        />

        <div className="flex flex-1 min-h-0 flex-col overflow-hidden bg-surface-container-lowest">
          {/* Header KPI Strip */}
          <div className="grid grid-cols-2 gap-2 border-b border-surface-container p-4 sm:grid-cols-4 bg-surface-container-low/40">
            <div className="flex flex-col rounded-xl bg-surface-container-lowest p-3 border border-outline-variant/30 shadow-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  receipt
                </span>
                إجمالي الفواتير
              </span>
              <span className="font-headline-sm font-bold text-primary mt-1">
                {rawInvoices.length}{' '}
                <span className="text-xs font-normal text-on-surface-variant">فاتورة</span>
              </span>
            </div>

            <div className="flex flex-col rounded-xl bg-surface-container-lowest p-3 border border-outline-variant/30 shadow-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  payments
                </span>
                إجمالي المبيعات
              </span>
              <span className="font-headline-sm font-bold text-primary mt-1 font-mono">
                {formatNumber(kpis.totalSales)} <span className="text-xs font-normal">ج.م</span>
              </span>
            </div>

            <div className="flex flex-col rounded-xl bg-surface-container-lowest p-3 border border-outline-variant/30 shadow-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  check_circle
                </span>
                المسدد فعلياً
              </span>
              <span className="font-headline-sm font-bold text-secondary mt-1 font-mono">
                {formatNumber(kpis.totalPaid)} <span className="text-xs font-normal">ج.م</span>
              </span>
            </div>

            <div className="flex flex-col rounded-xl bg-surface-container-lowest p-3 border border-outline-variant/30 shadow-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-error">
                  pending_actions
                </span>
                المتبقي للتحصيل
              </span>
              <span className="font-headline-sm font-bold text-error mt-1 font-mono">
                {formatNumber(kpis.remaining)} <span className="text-xs font-normal">ج.م</span>
              </span>
            </div>
          </div>

          {/* Search bar & tab switcher */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-surface-container">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث برقم الفاتورة..."
                className="w-full h-9 pr-9 pl-3 rounded-lg bg-surface-container-low text-xs text-on-surface placeholder:text-on-surface-variant focus:bg-surface-container-highest focus:outline-none transition-all"
              />
            </div>

            {onSwitchToInvoicesTab && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  onSwitchToInvoicesTab(client)
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-container px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>فتح في تبويب الفواتير</span>
              </button>
            )}
          </div>

          {/* Invoices List / Table */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[240px]">
            {invoicesQuery.isLoading ? (
              <StateMessage minHeightClassName="min-h-[200px]" text="جارٍ تحميل فواتير العميل..." />
            ) : invoicesQuery.isError ? (
              <StateMessage
                minHeightClassName="min-h-[200px]"
                text="تعذر تحميل فواتير العميل، يرجى المحاولة لاحقاً"
                tone="error"
              />
            ) : filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-on-surface-variant">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high mb-3">
                  <span className="material-symbols-outlined text-[28px] text-on-surface-variant/70">
                    receipt_long
                  </span>
                </div>
                <h4 className="font-bold text-sm text-on-surface">لا توجد فواتير مسجلة لهذا العميل</h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  لم يتم إصدار أي فواتير مبيعات سابقة لحساب ({clientTitle}) حتى الآن.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-surface-container">
                  <table className="w-full border-collapse text-right text-xs">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-semibold">
                        <th className="p-3">رقم الفاتورة</th>
                        <th className="p-3">تاريخ الإصدار</th>
                        <th className="p-3">الحالة والتحصيل</th>
                        <th className="p-3">الإجمالي</th>
                        <th className="p-3">المدفوع</th>
                        <th className="p-3">المتبقي</th>
                        <th className="p-3 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      {filteredInvoices.map((invoice) => {
                        const badge = getInvoiceRowBadge(invoice)
                        const remaining = Math.max(0, (invoice.totalPrice || 0) - (invoice.totalPaid || 0))
                        const overdue = isOverdue(invoice)

                        return (
                          <tr
                            key={invoice._id}
                            className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <td className="p-3 font-mono font-bold text-primary" dir="ltr">
                              {invoice.invoiceCode}
                            </td>
                            <td className="p-3 text-on-surface-variant">
                              {formatInvoiceDate(invoice.createdAt)}
                            </td>
                            <td className="p-3">
                              <StatusPill label={badge.label} tone={badge.tone} />
                            </td>
                            <td className="p-3 font-mono font-semibold text-primary">
                              {formatNumber(invoice.totalPrice || 0)} ج.م
                            </td>
                            <td className="p-3 font-mono text-secondary">
                              {formatNumber(invoice.totalPaid || 0)} ج.م
                            </td>
                            <td
                              className={cn(
                                'p-3 font-mono font-bold',
                                overdue ? 'text-error' : remaining > 0 ? 'text-amber-700' : 'text-slate-400',
                              )}
                            >
                              {formatNumber(remaining)} ج.م
                            </td>
                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(invoice)}
                                className="inline-flex items-center gap-1 rounded-lg bg-surface-container px-2.5 py-1 text-xs font-semibold text-primary hover:bg-surface-container-high transition-colors"
                              >
                                <span className="material-symbols-outlined text-[15px]">visibility</span>
                                <span>عرض</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="flex flex-col gap-2.5 md:hidden">
                  {filteredInvoices.map((invoice) => {
                    const badge = getInvoiceRowBadge(invoice)
                    const remaining = Math.max(0, (invoice.totalPrice || 0) - (invoice.totalPaid || 0))

                    return (
                      <article
                        key={invoice._id}
                        onClick={() => setSelectedInvoice(invoice)}
                        className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-3 border border-surface-container-high/60 cursor-pointer hover:border-primary/40 transition-all active:scale-[0.99]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-primary text-xs" dir="ltr">
                            {invoice.invoiceCode}
                          </span>
                          <StatusPill label={badge.label} tone={badge.tone} />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                          <span>{formatInvoiceDate(invoice.createdAt)}</span>
                          <span className="font-semibold text-primary font-mono">
                            الإجمالي: {formatNumber(invoice.totalPrice || 0)} ج.م
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-surface-container pt-2 text-[11px]">
                          <span className="text-secondary font-mono">
                            مسدد: {formatNumber(invoice.totalPaid || 0)} ج.م
                          </span>
                          <span className={remaining > 0 ? 'text-error font-bold font-mono' : 'text-slate-400'}>
                            متبقي: {formatNumber(remaining)} ج.م
                          </span>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-surface-container px-4 sm:px-6 py-3 bg-surface-container-low/30">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg bg-surface-container-high px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </Dialog>

      {/* Nested Invoice Details Modal */}
      {selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          onAddPayment={(inv) => setPaymentInvoice(inv)}
        />
      )}

      {/* Add Payment Modal */}
      {paymentInvoice && (
        <AddPaymentModal
          invoice={paymentInvoice}
          isOpen={Boolean(paymentInvoice)}
          onClose={() => setPaymentInvoice(null)}
        />
      )}
    </>
  )
}
