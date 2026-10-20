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
function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const badge = getInvoiceRowBadge(invoice)
  const overdue = isOverdue(invoice)

  return (
    <article className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
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
        <bdi
          className={cn(
            'font-mono whitespace-nowrap font-bold',
            overdue ? 'text-error' : 'text-on-surface',
          )}
          dir="ltr"
        >
          {formatNumber(invoice.totalPrice)} ج.م
        </bdi>
      </div>
    </article>
  )
}

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, Invoice>()

const columns = columnHelper.columns([
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
])

export function InvoicesTab({ sellerId }: { sellerId: string }) {
  const invoicesQuery = useInvoicesForSeller(sellerId)
  const allInvoices = invoicesQuery.data ?? []
  const data = excludeCancelled(allInvoices)
  const kpis = computeInvoiceKpis(allInvoices)

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
              <InvoiceCard invoice={invoice} key={invoice._id} />
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
                    'transition-colors hover:bg-surface-container-low',
                    row.index % 2 === 1 && 'bg-surface-container-low/30',
                  )}
                  key={row.id}
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
    </div>
  )
}
