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
  regular: 'neutral',
  over_credit: 'error',
  excellent: 'success',
  settled: 'success',
}

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, Client>()

const columns = columnHelper.columns([
  columnHelper.accessor('organizeName', {
    header: CLIENTS_COL_NAME,
    cell: (info) => (
      <div className="flex flex-col">
        <span className="font-label-md font-semibold text-on-surface">
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
          <span className="font-label-md text-on-surface">
            {client.contactPerson || client.name}
          </span>
          <bdi className="font-label-sm block text-label-sm text-on-surface-variant" dir="ltr">
            {client.phone}
          </bdi>
        </div>
      )
    },
  }),
  columnHelper.accessor('creditLimit', {
    header: CLIENTS_COL_CREDIT,
    cell: (info) => <span>{formatNumber(info.getValue())} ج.م</span>,
  }),
  columnHelper.accessor('currentDebt', {
    header: CLIENTS_COL_DEBT,
    cell: (info) => {
      const client = info.row.original
      const overCredit = client.currentDebt > client.creditLimit
      return (
        <span className={cn('font-label-md', overCredit ? 'text-error' : 'text-on-surface')}>
          {formatNumber(info.getValue())} ج.م
        </span>
      )
    },
  }),
  columnHelper.accessor('paymentStatus', {
    header: CLIENTS_COL_STATUS,
    cell: (info) => {
      const status = info.getValue()
      const label = CLIENT_STATUS_LABELS[status] ?? CLIENT_STATUS_UNKNOWN
      const tone = CLIENT_STATUS_TONE[status] ?? 'neutral'
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-primary">
            {CLIENTS_TAB_TITLE}
          </h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {CLIENTS_TAB_SUBTITLE}
          </p>
        </div>
        <button
          className="font-label-md flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
          onClick={() => setAddOpen(true)}
          type="button"
        >
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
        <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
          <table className="w-full">
            <thead>
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

      <AddClientModal
        onOpenChange={setAddOpen}
        open={addOpen}
        sellerId={sellerId}
        sellerName={sellerName}
      />
    </div>
  )
}
