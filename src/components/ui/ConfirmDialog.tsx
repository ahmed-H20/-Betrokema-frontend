import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import { cn } from '@/lib/cn'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  pending?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'إلغاء الأمر',
  destructive = true,
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-md">
      <DialogHeader onClose={() => onOpenChange(false)} title={title} />
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
        <p className="font-body-md text-body-md text-on-surface">
          {description}
        </p>
      </div>
      <div className="shrink-0 flex items-center justify-end gap-3 bg-surface-container px-4 sm:px-6 py-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <button
          className="font-label-md rounded-lg bg-surface-container-high px-4 py-2.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          {cancelLabel}
        </button>
        <button
          className={cn(
            'font-label-md rounded-lg px-5 py-2.5 text-label-md shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60',
            destructive
              ? 'bg-error text-on-error hover:bg-error/90'
              : 'bg-primary text-on-primary hover:bg-primary-container',
          )}
          disabled={pending}
          onClick={onConfirm}
          type="button"
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  )
}
