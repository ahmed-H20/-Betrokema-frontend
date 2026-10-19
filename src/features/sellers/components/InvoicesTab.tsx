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
  tone,
}: {
  label: string
  value: number
  tone: 'success' | 'warning' | 'error'
}) {
  const toneClasses = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-error-container text-on-error-container',
  }[tone]

  return (
    <div className={cn('flex flex-1 flex-col gap-1 rounded-lg p-3', toneClasses)}>
      <span className="font-label-sm text-label-sm">{label}</span>
      <span className="font-headline-sm text-headline-sm">
        {formatNumber(value)} ج.م
      </span>
    </div>
  )
}

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, Invoice>()

const columns = columnHelper.columns([
  columnHelper.accessor('invoiceCode', {
    header: INVOICES_COL_CODE,
    cell: (info) => <bdi dir="ltr">{info.getValue()}</bdi>,
  }),
  columnHelper.display({
    id: 'client',
    header: INVOICES_COL_CLIENT,
    cell: (info) => clientLabel(info.row.original.client),
  }),
  columnHelper.accessor('createdAt', {
    header: INVOICES_COL_DATE,
    cell: (info) => formatInvoiceDate(info.getValue()),
  }),
  columnHelper.accessor('totalPrice', {
    header: INVOICES_COL_AMOUNT,
    cell: (info) => (
      <span className={cn(isOverdue(info.row.original) && 'text-error')}>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <KpiPill label={INVOICES_TAB_PILL_COLLECTED} tone="success" value={kpis.collected} />
        <KpiPill
          label={INVOICES_TAB_PILL_IN_COLLECTION}
          tone="warning"
          value={kpis.inCollection}
        />
        <KpiPill label={INVOICES_TAB_PILL_OVERDUE} tone="error" value={kpis.overdueTotal} />
      </div>

      {invoicesQuery.isLoading ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={INVOICES_LOADING} />
      ) : invoicesQuery.isError ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={INVOICES_ERROR} tone="error" />
      ) : data.length === 0 ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={INVOICES_EMPTY} />
      ) : (
        <div className="max-h-[420px] overflow-auto rounded-xl bg-surface-container-lowest shadow-sm">
          <table className="w-full">
            <thead className="sticky top-0 bg-surface-container-lowest">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr className="border-b border-surface-container" key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="font-label-sm px-4 py-3 text-right text-label-sm text-on-surface-variant"
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : <FlexRender header={header} />}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr className="border-b border-surface-container last:border-0" key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <td className="px-4 py-3" key={cell.id}>
                      <FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
