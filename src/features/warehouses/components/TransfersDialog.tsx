import { useState } from 'react'
import { toast } from 'sonner'
import type { StockTransfer, TransferStatus } from '@/api/warehouses.schema'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import { StateMessage } from '@/components/ui/StateMessage'
import { StatusPill, type StatusPillTone } from '@/components/ui/StatusPill'
import {
  GENERIC_ERROR,
  TOAST_TRANSFER_UPDATED,
  TRANSFER_COMPLETE_ACTION,
  TRANSFER_REJECT_ACTION,
  TRANSFER_STATUS_LABELS,
  TRANSFER_STOCK_MOVED_NOTE,
  TRANSFERS_COL_ACTIONS,
  TRANSFERS_COL_CODE,
  TRANSFERS_COL_DATE,
  TRANSFERS_COL_ITEMS,
  TRANSFERS_COL_ROUTE,
  TRANSFERS_COL_STATUS,
  TRANSFERS_DIALOG_CLOSE,
  TRANSFERS_DIALOG_TITLE,
  TRANSFERS_EMPTY,
  TRANSFERS_ERROR,
  TRANSFERS_LOADING,
} from '@/constants/strings'
import { formatNumber } from '@/lib/format'
import { useTransfers, useUpdateTransferStatus } from '@/features/warehouses/hooks'

function warehouseLabel(ref: StockTransfer['fromWarehouse']): string {
  return typeof ref === 'string' ? ref : ref.name
}

function transferStatusTone(status: TransferStatus): StatusPillTone {
  if (status === 'completed') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'rejected' || status === 'cancelled') return 'error'
  return 'neutral'
}

function formatTransferDate(iso: string | undefined): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso))
}

// Below md: one card per transfer instead of a table row — no dedicated
// phone reference exists for this exact list (admin_6's own list is
// inventory items, not transfer requests), so this follows the same visual
// language as InventoryItemCard/ClientCard for consistency rather than
// guessing at an unreferenced shape.
function TransferCard({
  transfer,
  busy,
  onAction,
}: {
  transfer: StockTransfer
  busy: boolean
  onAction: (transfer: StockTransfer, status: TransferStatus) => void
}) {
  const itemsLabel = transfer.items
    .map(
      (item) =>
        `${typeof item.product === 'string' ? item.productName : item.product.name} (${formatNumber(item.quantity)})`,
    )
    .join('، ')

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <bdi className="font-mono whitespace-nowrap font-bold text-primary" dir="ltr">
          {transfer.transferCode}
        </bdi>
        <StatusPill
          label={TRANSFER_STATUS_LABELS[transfer.status]}
          tone={transferStatusTone(transfer.status)}
        />
      </div>
      <div className="font-body-sm text-body-sm text-on-surface">
        {warehouseLabel(transfer.fromWarehouse)} ← {warehouseLabel(transfer.toWarehouse)}
      </div>
      <div className="font-body-sm text-body-sm text-on-surface-variant">{itemsLabel}</div>
      <div className="flex items-center justify-between gap-2 border-t border-surface-container pt-2">
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {formatTransferDate(transfer.requestedAt ?? transfer.createdAt)}
        </span>
        {transfer.status === 'pending' ? (
          <div className="flex items-center gap-1">
            <button
              className="font-label-sm flex h-10 items-center rounded-lg bg-primary px-space-sm text-label-sm font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() => onAction(transfer, 'completed')}
              type="button"
            >
              {TRANSFER_COMPLETE_ACTION}
            </button>
            <button
              className="font-label-sm flex h-10 items-center rounded-lg bg-surface-container-high px-space-sm text-label-sm text-on-surface transition-all hover:bg-error-container hover:text-on-error-container disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() => onAction(transfer, 'rejected')}
              type="button"
            >
              {TRANSFER_REJECT_ACTION}
            </button>
          </div>
        ) : transfer.status === 'approved' || transfer.status === 'completed' ? (
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {TRANSFER_STOCK_MOVED_NOTE}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function TransfersDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const transfersQuery = useTransfers()
  const updateStatus = useUpdateTransferStatus()
  const [actingIds, setActingIds] = useState<Set<string>>(new Set())

  async function onAction(transfer: StockTransfer, status: TransferStatus) {
    if (actingIds.has(transfer._id)) return
    setActingIds((prev) => new Set(prev).add(transfer._id))
    try {
      await updateStatus.mutateAsync({ transferId: transfer._id, input: { status } })
      toast.success(TOAST_TRANSFER_UPDATED)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    } finally {
      setActingIds((prev) => {
        const next = new Set(prev)
        next.delete(transfer._id)
        return next
      })
    }
  }

  const transfers = transfersQuery.data ?? []

  return (
    <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-3xl">
      <DialogHeader
        icon="swap_horiz"
        iconClassName="bg-error-container text-on-error-container"
        onClose={() => onOpenChange(false)}
        title={TRANSFERS_DIALOG_TITLE}
      />
      <div className="max-h-[70vh] overflow-y-auto p-space-lg">
        {transfersQuery.isLoading ? (
          <StateMessage minHeightClassName="min-h-[200px]" text={TRANSFERS_LOADING} />
        ) : transfersQuery.isError ? (
          <StateMessage minHeightClassName="min-h-[200px]" text={TRANSFERS_ERROR} tone="error" />
        ) : transfers.length === 0 ? (
          <StateMessage minHeightClassName="min-h-[200px]" text={TRANSFERS_EMPTY} />
        ) : (
          <>
          <div className="flex flex-col gap-space-sm md:hidden">
            {transfers.map((transfer) => (
              <TransferCard
                busy={actingIds.has(transfer._id)}
                key={transfer._id}
                onAction={(target, status) => void onAction(target, status)}
                transfer={transfer}
              />
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] border-collapse text-right">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="font-label-md w-44 rounded-r-lg px-space-md py-space-sm text-label-md text-on-surface-variant">
                  {TRANSFERS_COL_CODE}
                </th>
                <th className="font-label-md px-space-md py-space-sm text-label-md text-on-surface-variant">
                  {TRANSFERS_COL_ROUTE}
                </th>
                <th className="font-label-md px-space-md py-space-sm text-label-md text-on-surface-variant">
                  {TRANSFERS_COL_ITEMS}
                </th>
                <th className="font-label-md px-space-md py-space-sm text-label-md text-on-surface-variant">
                  {TRANSFERS_COL_DATE}
                </th>
                <th className="font-label-md px-space-md py-space-sm text-label-md text-on-surface-variant">
                  {TRANSFERS_COL_STATUS}
                </th>
                <th className="font-label-md rounded-l-lg px-space-md py-space-sm text-center text-label-md text-on-surface-variant">
                  {TRANSFERS_COL_ACTIONS}
                </th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => {
                const busy = actingIds.has(transfer._id)
                return (
                  <tr className="hover:bg-surface-container-low" key={transfer._id}>
                    <td className="whitespace-nowrap px-space-md py-space-sm">
                      <span className="font-mono font-bold text-primary" dir="ltr">
                        {transfer.transferCode}
                      </span>
                    </td>
                    <td className="px-space-md py-space-sm text-body-sm text-on-surface">
                      {warehouseLabel(transfer.fromWarehouse)} ← {warehouseLabel(transfer.toWarehouse)}
                    </td>
                    <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant">
                      {transfer.items
                        .map(
                          (item) =>
                            `${typeof item.product === 'string' ? item.productName : item.product.name} (${formatNumber(item.quantity)})`,
                        )
                        .join('، ')}
                    </td>
                    <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant">
                      {formatTransferDate(transfer.requestedAt ?? transfer.createdAt)}
                    </td>
                    <td className="px-space-md py-space-sm">
                      <StatusPill
                        label={TRANSFER_STATUS_LABELS[transfer.status]}
                        tone={transferStatusTone(transfer.status)}
                      />
                    </td>
                    <td className="px-space-md py-space-sm text-center">
                      {transfer.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="font-label-sm rounded-lg bg-primary px-space-sm py-1 text-label-sm font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={busy}
                            onClick={() => void onAction(transfer, 'completed')}
                            type="button"
                          >
                            {TRANSFER_COMPLETE_ACTION}
                          </button>
                          <button
                            className="font-label-sm rounded-lg bg-surface-container-high px-space-sm py-1 text-label-sm text-on-surface transition-all hover:bg-error-container hover:text-on-error-container disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={busy}
                            onClick={() => void onAction(transfer, 'rejected')}
                            type="button"
                          >
                            {TRANSFER_REJECT_ACTION}
                          </button>
                        </div>
                      ) : transfer.status === 'approved' || transfer.status === 'completed' ? (
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {TRANSFER_STOCK_MOVED_NOTE}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
          </>
        )}
      </div>
      <div className="flex items-center justify-end gap-space-sm bg-surface-container px-space-lg py-space-md">
        <button
          className="h-10 rounded-lg bg-surface-container-high px-space-md text-on-surface-variant transition-all hover:bg-surface-container-highest"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          {TRANSFERS_DIALOG_CLOSE}
        </button>
      </div>
    </Dialog>
  )
}
