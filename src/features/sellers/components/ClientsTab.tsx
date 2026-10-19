import { createColumnHelper, FlexRender, tableFeatures, useTable } from '@tanstack/react-table'
import { useState } from 'react'
import type { Client, ClientPaymentStatus } from '@/api/clients.schema'
import { StateMessage } from '@/components/ui/StateMessage'
import { StatusPill, type StatusPillTone } from '@/components/ui/StatusPill'
import {
  CLIENTS_ADD_BUTTON,
  CLIENTS_COL_CONTACT,
  CLIENTS_COL_CREDIT,
  CLIENTS_COL_DEBT,
  CLIENTS_COL_NAME,
  CLIENTS_COL_STATUS,
  CLIENTS_EMPTY,
  CLIENTS_ERROR,
  CLIENTS_LOADING,
  CLIENTS_TAB_SUBTITLE,
  CLIENTS_TAB_TITLE,
  CLIENT_STATUS_LABELS,
  CLIENT_STATUS_UNKNOWN,
} from '@/constants/strings'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useClientsForSeller } from '@/features/sellers/hooks'
import { AddClientModal } from '@/features/sellers/components/AddClientModal'

const CLIENT_STATUS_TONE: Record<ClientPaymentStatus, StatusPillTone> = {
  regular: 'success',
  over_credit: 'error',
  excellent: 'success',
  settled: 'neutral',
}

// The backend only recalculates `paymentStatus` to "over_credit" when
// creditLimit and currentDebt are sent together in the same credit-debt
// update — a debt raised on its own (as this app's own test-data seeding
// does) leaves a stale paymentStatus behind. Derive the real state from the
// numbers themselves rather than trusting a value that can silently drift.
function effectiveStatus(client: Client): ClientPaymentStatus | 'unknown' {
  if (client.currentDebt > client.creditLimit) return 'over_credit'
  return client.paymentStatus
}

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, Client>()

const columns = columnHelper.columns([
  columnHelper.accessor('organizeName', {
    header: CLIENTS_COL_NAME,
    cell: (info) => (
      <div className="flex flex-col">
        <span className="font-label-md text-label-md font-bold text-on-surface">
          {info.getValue()}
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {[info.row.original.address, info.row.original.city]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
    ),
  }),
  columnHelper.display({
    id: 'contact',
    header: CLIENTS_COL_CONTACT,
    cell: (info) => {
      const client = info.row.original
      return (
        <div className="flex flex-col">
          <span className="text-on-surface">{client.contactPerson || client.name}</span>
          <span className="mt-0.5 flex items-center gap-1 font-mono text-on-surface-variant" dir="ltr">
            <span className="material-symbols-outlined text-[14px] text-secondary">chat</span>
            <span className="font-label-sm text-label-sm">{client.phone}</span>
          </span>
        </div>
      )
    },
  }),
  columnHelper.accessor('creditLimit', {
    header: CLIENTS_COL_CREDIT,
    cell: (info) => <span className="font-mono text-on-surface">{formatNumber(info.getValue())} ج.م</span>,
  }),
  columnHelper.accessor('currentDebt', {
    header: CLIENTS_COL_DEBT,
    cell: (info) => {
      const client = info.row.original
      const overCredit = client.currentDebt > client.creditLimit
      return (
        <span className={cn('font-mono font-semibold', overCredit ? 'text-error' : 'text-on-surface')}>
          {formatNumber(info.getValue())} ج.م
        </span>
      )
    },
  }),
  columnHelper.display({
    id: 'paymentStatus',
    header: CLIENTS_COL_STATUS,
    cell: (info) => {
      const status = effectiveStatus(info.row.original)
      const label = status === 'unknown' ? CLIENT_STATUS_UNKNOWN : CLIENT_STATUS_LABELS[status]
      const tone = status === 'unknown' ? 'neutral' : CLIENT_STATUS_TONE[status]
      return <StatusPill label={label} tone={tone} />
    },
  }),
])

export function ClientsTab({
  sellerId,
  sellerName,
}: {
  sellerId: string
  sellerName?: string
}) {
  const [addOpen, setAddOpen] = useState(false)
  const clientsQuery = useClientsForSeller(sellerId)
  const data = clientsQuery.data?.data ?? []

  const table = useTable({ features, columns, data })

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="font-headline-sm text-headline-sm text-primary">
            {CLIENTS_TAB_TITLE}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {CLIENTS_TAB_SUBTITLE}
          </span>
        </div>
        <button
          className="font-label-sm flex h-9 items-center gap-1 rounded-lg bg-secondary px-space-md text-label-sm text-on-secondary shadow-xs transition-colors hover:bg-secondary/90"
          onClick={() => setAddOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add_business</span>
          {CLIENTS_ADD_BUTTON}
        </button>
      </div>

      {clientsQuery.isLoading ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={CLIENTS_LOADING} />
      ) : clientsQuery.isError ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={CLIENTS_ERROR} tone="error" />
      ) : data.length === 0 ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={CLIENTS_EMPTY} />
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full border-collapse text-right">
            <thead>
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
      )}

      <AddClientModal
        onOpenChange={setAddOpen}
        open={addOpen}
        sellerId={sellerId}
        sellerName={sellerName}
      />
    </div>
  )
}
