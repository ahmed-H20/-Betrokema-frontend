import { useState, useMemo } from 'react'
import { createColumnHelper, FlexRender, tableFeatures, useTable } from '@tanstack/react-table'
import type { Invoice } from '@/api/invoices.schema'
import { StateMessage } from '@/components/ui/StateMessage'
import { StatusPill } from '@/components/ui/StatusPill'
import {
  INVOICES_COL_AMOUNT,
  INVOICES_COL_CLIENT,
  INVOICES_COL_CODE,
  INVOICES_COL_DATE,
  INVOICES_COL_STATUS,
  INVOICES_EMPTY,
  INVOICES_ERROR,
  INVOICES_LOADING,
  INVOICES_TAB_PILL_COLLECTED,
  INVOICES_TAB_PILL_IN_COLLECTION,
  INVOICES_TAB_PILL_OVERDUE,
} from '@/constants/strings'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
import { useInvoicesForSeller } from '@/features/sellers/hooks'
import {
  computeInvoiceKpis,
  excludeCancelled,
  getInvoiceRowBadge,
  isOverdue,
} from '@/features/sellers/invoiceAggregation'
import { InvoiceDetailsModal } from '@/features/invoices/components/InvoiceDetailsModal'
import { AddPaymentModal } from '@/features/invoices/components/AddPaymentModal'

function formatInvoiceDate(iso: string): string {
  return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

function clientLabel(client: Invoice['client']): string {
  if (!client) return ''
  if (typeof client === 'string') return client
  return client.organizeName || client.name
}

function KpiPill({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: string
  tone: 'success' | 'warning' | 'error'
}) {
  const valueClass = {
    success: 'text-secondary',
    warning: 'text-on-surface',
    error: 'text-error',
  }[tone]

  return (
    <div className="flex flex-1 items-center justify-between rounded-lg bg-surface-container-low p-space-sm">
      <div>
        <span className="font-label-sm block text-label-sm text-on-surface-variant">
          {label}
        </span>
        <span className={cn('font-headline-sm font-mono text-headline-sm', valueClass)}>
          {formatNumber(value)} ج.م
        </span>
      </div>
      <span className={cn('material-symbols-outlined text-[24px]', valueClass)}>{icon}</span>
    </div>
  )
}

// Below md: one card per invoice instead of a table row, same visual
// language as ClientsTab's card (no dedicated phone reference for an
// invoice-row list specifically, unlike clients — see context/ui-tokens.md).
function InvoiceCard({
  invoice,
  onOpen,
}: {
  invoice: Invoice
  onOpen?: (inv: Invoice) => void
}) {
  const badge = getInvoiceRowBadge(invoice)
  const overdue = isOverdue(invoice)

  return (
    <article
      onClick={() => onOpen?.(invoice)}
      className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm cursor-pointer hover:border-primary/40 border border-transparent transition-all active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex min-w-0 flex-col">
          <bdi className="font-mono whitespace-nowrap font-bold text-primary" dir="ltr">
            {invoice.invoiceCode}
          </bdi>
          <span className="font-label-sm truncate text-label-sm text-on-surface-variant">
            {clientLabel(invoice.client)}
          </span>
        </div>
        <StatusPill label={badge.label} tone={badge.tone} />
      </div>
      <div className="flex items-center justify-between gap-space-sm border-t border-surface-container pt-2">
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {formatInvoiceDate(invoice.createdAt)}
        </span>
        <div className="flex items-center gap-1.5">
          <bdi
            className={cn(
              'font-mono whitespace-nowrap font-bold',
              overdue ? 'text-error' : 'text-on-surface',
            )}
            dir="ltr"
          >
            {formatNumber(invoice.totalPrice)} ج.م
          </bdi>
          <span className="material-symbols-outlined text-[16px] text-primary">visibility</span>
        </div>
      </div>
    </article>
  )
}

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, Invoice>()

export function InvoicesTab({ sellerId }: { sellerId: string }) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)

  const invoicesQuery = useInvoicesForSeller(sellerId)
  const allInvoices = invoicesQuery.data ?? []
  const data = excludeCancelled(allInvoices)
  const kpis = computeInvoiceKpis(allInvoices)

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('invoiceCode', {
          header: INVOICES_COL_CODE,
          cell: (info) => (
            <span className="font-mono font-bold text-primary" dir="ltr">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.display({
          id: 'client',
          header: INVOICES_COL_CLIENT,
          cell: (info) => (
            <span className="font-medium text-on-surface">{clientLabel(info.row.original.client)}</span>
          ),
        }),
        columnHelper.accessor('createdAt', {
          header: INVOICES_COL_DATE,
          cell: (info) => (
            <span className="text-on-surface-variant">{formatInvoiceDate(info.getValue())}</span>
          ),
        }),
        columnHelper.accessor('totalPrice', {
          header: INVOICES_COL_AMOUNT,
          cell: (info) => (
            <span
              className={cn(
                'font-mono font-bold',
                isOverdue(info.row.original) ? 'text-error' : 'text-on-surface',
              )}
            >
              {formatNumber(info.getValue())} ج.م
            </span>
          ),
        }),
        columnHelper.display({
          id: 'status',
          header: INVOICES_COL_STATUS,
          cell: (info) => {
            const badge = getInvoiceRowBadge(info.row.original)
            return <StatusPill label={badge.label} tone={badge.tone} />
          },
        }),
        columnHelper.display({
          id: 'actions',
          header: 'إجراء',
          cell: (info) => (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedInvoice(info.row.original)
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-container px-2.5 py-1 text-xs font-semibold text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
              title="عرض وتفاصيل الفاتورة"
            >
              <span className="material-symbols-outlined text-[15px]">visibility</span>
              <span>عرض</span>
            </button>
          ),
        }),
      ]),
    [],
  )

  const table = useTable({ features, columns, data })

  return (
    <div className="flex flex-col gap-space-md">
      <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
        <KpiPill
          icon="verified"
          label={INVOICES_TAB_PILL_COLLECTED}
          tone="success"
          value={kpis.collected}
        />
        <KpiPill
          icon="pending_actions"
          label={INVOICES_TAB_PILL_IN_COLLECTION}
          tone="warning"
          value={kpis.inCollection}
        />
        <KpiPill
          icon="warning"
          label={INVOICES_TAB_PILL_OVERDUE}
          tone="error"
          value={kpis.overdueTotal}
        />
      </div>

      {invoicesQuery.isLoading ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={INVOICES_LOADING} />
      ) : invoicesQuery.isError ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={INVOICES_ERROR} tone="error" />
      ) : data.length === 0 ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={INVOICES_EMPTY} />
      ) : (
        <>
          <div className="flex max-h-[420px] flex-col gap-space-sm overflow-y-auto md:hidden">
            {data.map((invoice) => (
              <InvoiceCard invoice={invoice} key={invoice._id} onOpen={setSelectedInvoice} />
            ))}
          </div>
          <div className="hidden max-h-[420px] overflow-x-auto overflow-y-auto rounded-lg md:block">
          <table className="w-full min-w-[480px] border-collapse text-right">
            <thead className="sticky top-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr className="bg-surface-container-low" key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <th
                      className={cn(
                        'font-label-md px-space-md py-space-sm text-label-md text-on-surface-variant',
                        index === 0 && 'rounded-r-lg',
                        index === headerGroup.headers.length - 1 && 'rounded-l-lg',
                      )}
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : <FlexRender header={header} />}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {table.getRowModel().rows.map((row) => (
                <tr
                  className={cn(
                    'transition-colors hover:bg-surface-container-low cursor-pointer',
                    row.index % 2 === 1 && 'bg-surface-container-low/30',
                  )}
                  key={row.id}
                  onClick={() => setSelectedInvoice(row.original)}
                >
                  {row.getAllCells().map((cell) => (
                    <td className="px-space-md py-space-sm" key={cell.id}>
                      <FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      {/* Invoice Details Modal */}
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
    </div>
  )
}
