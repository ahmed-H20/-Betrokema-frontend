import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  assignProductInputSchema,
  type AssignProductInput,
  type WarehouseInventorySubdoc,
} from '@/api/warehouses.schema'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  ASSIGN_PRODUCT_BIN_LABEL,
  ASSIGN_PRODUCT_OVERWRITE_MESSAGE,
  ASSIGN_PRODUCT_OVERWRITE_TITLE,
  ASSIGN_PRODUCT_PACKAGING_LABEL,
  ASSIGN_PRODUCT_REORDER_LABEL,
  ASSIGN_PRODUCT_SELECT_LABEL,
  ASSIGN_PRODUCT_SKU_LABEL,
  ASSIGN_PRODUCT_STOCK_LABEL,
  ASSIGN_PRODUCT_SUBMIT,
  ASSIGN_PRODUCT_SUBMIT_UPDATE,
  ASSIGN_PRODUCT_TITLE,
  ASSIGN_PRODUCT_TRUNCATED_NOTE,
  GENERIC_ERROR,
  TOAST_PRODUCT_ASSIGNED,
} from '@/constants/strings'
import {
  useAssignProduct,
  useProductsForPicker,
  useWarehouse,
} from '@/features/warehouses/hooks'

const inputClassName =
  'w-full h-10 px-space-sm rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none'
const labelClassName = 'font-label-md text-label-md text-on-surface font-semibold'

function inventoryProductId(product: WarehouseInventorySubdoc['product']): string {
  return typeof product === 'string' ? product : product._id
}

export function AssignProductForm({
  warehouseId,
  warehouseName,
  onClose,
}: {
  warehouseId: string
  warehouseName: string
  onClose: () => void
}) {
  const productsQuery = useProductsForPicker()
  const warehouseQuery = useWarehouse(warehouseId)
  const assignProduct = useAssignProduct()
  const [pendingValues, setPendingValues] = useState<AssignProductInput | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignProductInput>({
    resolver: zodResolver(assignProductInputSchema),
    defaultValues: {
      productId: '',
      currentStock: 0,
      reorderLevel: 50,
      binLocation: '',
      sku: '',
      packagingUnit: '',
    },
  })

  const selectedProductId = watch('productId')

  const existingItem = useMemo(() => {
    if (!selectedProductId || !warehouseQuery.data) return undefined
    return warehouseQuery.data.inventory.find(
      (item) => inventoryProductId(item.product) === selectedProductId,
    )
  }, [selectedProductId, warehouseQuery.data])

  // Picking an already-assigned product should show its real current values,
  // not the static create-mode defaults — otherwise a user who only means to
  // tweak the bin location can silently zero out the real stock (the
  // overwrite-confirm dialog surfaces the real old value as a last-chance
  // check, but the field itself should never have been wrong in the first
  // place). Only fires for an existing assignment; a brand-new/unassigned
  // product keeps whatever the user already typed.
  useEffect(() => {
    if (!existingItem) return
    reset({
      productId: selectedProductId,
      currentStock: existingItem.currentStock,
      reorderLevel: existingItem.reorderLevel,
      binLocation: existingItem.binLocation,
      sku: existingItem.sku,
      packagingUnit: existingItem.packagingUnit,
    })
  }, [existingItem, selectedProductId, reset])

  async function submitAssignment(values: AssignProductInput) {
    try {
      await assignProduct.mutateAsync({ id: warehouseId, input: values })
      toast.success(TOAST_PRODUCT_ASSIGNED)
      reset()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  function onSubmit(values: AssignProductInput) {
    if (existingItem) {
      setPendingValues(values)
      return
    }
    void submitAssignment(values)
  }

  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[20px] text-secondary">
            library_add
          </span>
          <h4 className="font-headline-sm text-headline-sm font-bold text-primary">
            {ASSIGN_PRODUCT_TITLE(warehouseName)}
          </h4>
        </div>
        <button
          className="text-on-surface-variant hover:text-error"
          onClick={onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <form className="flex flex-col gap-space-md" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-space-sm md:grid-cols-5">
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className={labelClassName}>{ASSIGN_PRODUCT_SELECT_LABEL}</label>
            <select className={inputClassName} {...register('productId')}>
              <option value="">—</option>
              {(productsQuery.data?.products ?? []).map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} {product.code ? `(كود: ${product.code})` : ''}
                </option>
              ))}
            </select>
            {productsQuery.data && productsQuery.data.totalCount > 500 ? (
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {ASSIGN_PRODUCT_TRUNCATED_NOTE}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{ASSIGN_PRODUCT_STOCK_LABEL}</label>
            <input
              className={inputClassName}
              type="number"
              {...register('currentStock', { valueAsNumber: true })}
            />
            {errors.currentStock ? (
              <span className="font-label-sm text-label-sm text-error">
                {errors.currentStock.message}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{ASSIGN_PRODUCT_REORDER_LABEL}</label>
            <input
              className={inputClassName}
              type="number"
              {...register('reorderLevel', { valueAsNumber: true })}
            />
            {errors.reorderLevel ? (
              <span className="font-label-sm text-label-sm text-error">
                {errors.reorderLevel.message}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{ASSIGN_PRODUCT_BIN_LABEL}</label>
            <input className={inputClassName} type="text" {...register('binLocation')} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-space-sm md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{ASSIGN_PRODUCT_SKU_LABEL}</label>
            <input className={inputClassName} type="text" {...register('sku')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{ASSIGN_PRODUCT_PACKAGING_LABEL}</label>
            <input className={inputClassName} type="text" {...register('packagingUnit')} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-space-sm">
          <button
            className="h-9 rounded-lg bg-primary px-space-lg text-label-md font-label-md text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || !selectedProductId}
            type="submit"
          >
            {existingItem ? ASSIGN_PRODUCT_SUBMIT_UPDATE : ASSIGN_PRODUCT_SUBMIT}
          </button>
        </div>
      </form>

      <ConfirmDialog
        confirmLabel={ASSIGN_PRODUCT_SUBMIT_UPDATE}
        description={
          pendingValues
            ? ASSIGN_PRODUCT_OVERWRITE_MESSAGE(
                existingItem?.currentStock ?? 0,
                pendingValues.currentStock ?? 0,
              )
            : ''
        }
        destructive={false}
        onConfirm={() => {
          if (pendingValues) void submitAssignment(pendingValues)
          setPendingValues(null)
        }}
        onOpenChange={(open) => {
          if (!open) setPendingValues(null)
        }}
        open={Boolean(pendingValues)}
        pending={assignProduct.isPending}
        title={ASSIGN_PRODUCT_OVERWRITE_TITLE}
      />
    </div>
  )
}
