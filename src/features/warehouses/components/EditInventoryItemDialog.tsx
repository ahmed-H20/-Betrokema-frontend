import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import type { InventoryItem } from '@/api/warehouses.schema'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import {
  ASSIGN_PRODUCT_BIN_LABEL,
  ASSIGN_PRODUCT_REORDER_LABEL,
  ASSIGN_PRODUCT_STOCK_LABEL,
  EDIT_INVENTORY_ITEM_SUBMIT,
  EDIT_INVENTORY_ITEM_TITLE,
  GENERIC_ERROR,
  MODAL_CANCEL,
  TOAST_INVENTORY_ITEM_UPDATED,
  VALIDATION_ASSIGN_REORDER_NEGATIVE,
  VALIDATION_ASSIGN_STOCK_NEGATIVE,
} from '@/constants/strings'
import { useUpdateInventoryItem } from '@/features/warehouses/hooks'

const editItemSchema = z.object({
  currentStock: z.number().min(0, VALIDATION_ASSIGN_STOCK_NEGATIVE),
  reorderLevel: z.number().min(0, VALIDATION_ASSIGN_REORDER_NEGATIVE),
  binLocation: z.string().trim(),
})
type EditItemValues = z.infer<typeof editItemSchema>

const inputClassName =
  'w-full h-11 px-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-highest transition-all'
const labelClassName = 'block font-label-md text-label-md text-on-surface mb-1'

export function EditInventoryItemDialog({
  open,
  onOpenChange,
  warehouseId,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouseId: string
  item: InventoryItem
}) {
  const updateInventoryItem = useUpdateInventoryItem()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditItemValues>({
    resolver: zodResolver(editItemSchema),
    defaultValues: {
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      binLocation: item.binLocation,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        binLocation: item.binLocation,
      })
    }
  }, [open, item, reset])

  async function onSubmit(values: EditItemValues) {
    try {
      await updateInventoryItem.mutateAsync({
        id: warehouseId,
        itemId: item._id,
        input: values,
      })
      toast.success(TOAST_INVENTORY_ITEM_UPDATED)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-md">
      <DialogHeader
        onClose={() => onOpenChange(false)}
        subtitle={item.productName}
        title={EDIT_INVENTORY_ITEM_TITLE}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4 p-6">
          <div>
            <label className={labelClassName}>{ASSIGN_PRODUCT_STOCK_LABEL}</label>
            <input
              className={inputClassName}
              type="number"
              {...register('currentStock', { valueAsNumber: true })}
            />
            {errors.currentStock ? (
              <span className="font-label-sm mt-1 block text-label-sm text-error">
                {errors.currentStock.message}
              </span>
            ) : null}
          </div>
          <div>
            <label className={labelClassName}>{ASSIGN_PRODUCT_REORDER_LABEL}</label>
            <input
              className={inputClassName}
              type="number"
              {...register('reorderLevel', { valueAsNumber: true })}
            />
            {errors.reorderLevel ? (
              <span className="font-label-sm mt-1 block text-label-sm text-error">
                {errors.reorderLevel.message}
              </span>
            ) : null}
          </div>
          <div>
            <label className={labelClassName}>{ASSIGN_PRODUCT_BIN_LABEL}</label>
            <input className={inputClassName} type="text" {...register('binLocation')} />
          </div>
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
            className="font-label-md flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-label-md text-on-primary shadow-md transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {EDIT_INVENTORY_ITEM_SUBMIT}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
