import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import {
  GENERIC_ERROR,
  MODAL_CANCEL,
  REACTIVATE_CONFIRM_BUTTON,
  REACTIVATE_DIALOG_DESCRIPTION,
  REACTIVATE_DIALOG_TITLE,
  SUSPEND_CONFIRM_BUTTON,
  SUSPEND_DIALOG_DESCRIPTION,
  SUSPEND_DIALOG_TITLE,
  SUSPEND_REASON_LABEL,
  TOAST_SELLER_STATUS_UPDATED,
} from '@/constants/strings'
import { cn } from '@/lib/cn'
import { useUpdateSeller } from '@/features/sellers/hooks'

export function SuspendDialog({
  open,
  onOpenChange,
  mode,
  sellerId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'suspend' | 'reactivate'
  sellerId: string
}) {
  const [reason, setReason] = useState('')
  const updateSeller = useUpdateSeller()

  async function onConfirm() {
    try {
      await updateSeller.mutateAsync({
        id: sellerId,
        input:
          mode === 'suspend'
            ? { status: 'SUSPENDED', statusNote: reason.trim() }
            : { status: 'ACTIVE', statusNote: '' },
      })
      toast.success(TOAST_SELLER_STATUS_UPDATED)
      setReason('')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-md">
      <DialogHeader
        onClose={() => onOpenChange(false)}
        title={mode === 'suspend' ? SUSPEND_DIALOG_TITLE : REACTIVATE_DIALOG_TITLE}
      />
      <div className="flex flex-col gap-4 px-6 py-5">
        <p className="font-body-md text-body-md text-on-surface">
          {mode === 'suspend' ? SUSPEND_DIALOG_DESCRIPTION : REACTIVATE_DIALOG_DESCRIPTION}
        </p>
        {mode === 'suspend' ? (
          <div>
            <label className="font-label-md mb-1 block text-label-md text-on-surface">
              {SUSPEND_REASON_LABEL}
            </label>
            <textarea
              className="w-full rounded-lg bg-surface-container-low p-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-highest"
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              value={reason}
            />
          </div>
        ) : null}
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
          className={cn(
            'font-label-md rounded-lg px-5 py-2.5 text-label-md shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60',
            mode === 'suspend'
              ? 'bg-error text-on-error hover:bg-error/90'
              : 'bg-primary text-on-primary hover:bg-primary-container',
          )}
          disabled={updateSeller.isPending}
          onClick={onConfirm}
          type="button"
        >
          {mode === 'suspend' ? SUSPEND_CONFIRM_BUTTON : REACTIVATE_CONFIRM_BUTTON}
        </button>
      </div>
    </Dialog>
  )
}
