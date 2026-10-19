import { useState } from 'react'
import { toast } from 'sonner'
import type { Seller, SellerPerformance } from '@/api/sellers.schema'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import {
  DELETE_SELLER_BLOCKED_MESSAGE,
  DELETE_SELLER_BLOCKED_SUSPEND_BUTTON,
  DELETE_SELLER_BLOCKED_TITLE,
  DELETE_SELLER_CONFIRM_BUTTON,
  DELETE_SELLER_CONFIRM_DESCRIPTION,
  DELETE_SELLER_CONFIRM_TITLE,
  GENERIC_ERROR,
  MODAL_CANCEL,
  TOAST_SELLER_DELETED,
} from '@/constants/strings'
import { useDeleteSeller } from '@/features/sellers/hooks'
import { SuspendDialog } from '@/features/sellers/components/SuspendDialog'

export function DeleteRepDialog({
  open,
  onOpenChange,
  seller,
  metrics,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  seller: Seller
  metrics: SellerPerformance['metrics']
  onDeleted: () => void
}) {
  const [suspendOpen, setSuspendOpen] = useState(false)
  const deleteSeller = useDeleteSeller()
  const blocked = metrics.clientsCount > 0 || metrics.totalInvoicesCount > 0

  async function onConfirmDelete() {
    try {
      await deleteSeller.mutateAsync(seller._id)
      toast.success(TOAST_SELLER_DELETED)
      onOpenChange(false)
      onDeleted()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  if (!blocked) {
    return (
      <ConfirmDialog
        confirmLabel={DELETE_SELLER_CONFIRM_BUTTON}
        description={DELETE_SELLER_CONFIRM_DESCRIPTION}
        onConfirm={onConfirmDelete}
        onOpenChange={onOpenChange}
        open={open}
        pending={deleteSeller.isPending}
        title={DELETE_SELLER_CONFIRM_TITLE}
      />
    )
  }

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-md">
        <DialogHeader onClose={() => onOpenChange(false)} title={DELETE_SELLER_BLOCKED_TITLE} />
        <div className="px-6 py-5">
          <p className="font-body-md text-body-md text-on-surface">
            {DELETE_SELLER_BLOCKED_MESSAGE}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 bg-surface-container px-6 py-4">
          <button
            className="font-label-md rounded-lg bg-surface-container-high px-4 py-2.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            {MODAL_CANCEL}
          </button>
          <button
            className="font-label-md rounded-lg bg-primary px-5 py-2.5 text-label-md text-on-primary shadow-md transition-all hover:bg-primary-container"
            onClick={() => {
              onOpenChange(false)
              setSuspendOpen(true)
            }}
            type="button"
          >
            {DELETE_SELLER_BLOCKED_SUSPEND_BUTTON}
          </button>
        </div>
      </Dialog>
      <SuspendDialog
        mode="suspend"
        onOpenChange={setSuspendOpen}
        open={suspendOpen}
        sellerId={seller._id}
      />
    </>
  )
}
