import { toast } from 'sonner'
import type { Warehouse } from '@/api/warehouses.schema'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import {
  DELETE_WAREHOUSE_BLOCKED_MESSAGE,
  DELETE_WAREHOUSE_BLOCKED_TITLE,
  DELETE_WAREHOUSE_CONFIRM_BUTTON,
  DELETE_WAREHOUSE_CONFIRM_DESCRIPTION,
  DELETE_WAREHOUSE_CONFIRM_TITLE,
  GENERIC_ERROR,
  MODAL_CANCEL,
  TOAST_WAREHOUSE_DELETED,
} from '@/constants/strings'
import { useDeleteWarehouse } from '@/features/warehouses/hooks'

export function DeleteWarehouseDialog({
  open,
  onOpenChange,
  warehouse,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouse: Warehouse
  onDeleted: () => void
}) {
  const deleteWarehouse = useDeleteWarehouse()
  const blocked = warehouse.linkedProductsCount > 0 || warehouse.actualStockUnits > 0

  async function onConfirmDelete() {
    try {
      await deleteWarehouse.mutateAsync(warehouse._id)
      toast.success(TOAST_WAREHOUSE_DELETED)
      onOpenChange(false)
      onDeleted()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  if (blocked) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-md">
        <DialogHeader onClose={() => onOpenChange(false)} title={DELETE_WAREHOUSE_BLOCKED_TITLE} />
        <div className="px-6 py-5">
          <p className="font-body-md text-body-md text-on-surface">
            {DELETE_WAREHOUSE_BLOCKED_MESSAGE}
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
        </div>
      </Dialog>
    )
  }

  return (
    <ConfirmDialog
      confirmLabel={DELETE_WAREHOUSE_CONFIRM_BUTTON}
      description={DELETE_WAREHOUSE_CONFIRM_DESCRIPTION}
      onConfirm={onConfirmDelete}
      onOpenChange={onOpenChange}
      open={open}
      pending={deleteWarehouse.isPending}
      title={DELETE_WAREHOUSE_CONFIRM_TITLE}
    />
  )
}
