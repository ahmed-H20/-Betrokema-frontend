import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Warehouse, WarehouseInventorySubdoc } from '@/api/warehouses.schema'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import {
  GENERIC_ERROR,
  MODAL_CANCEL,
  TOAST_TRANSFER_CREATED,
  TRANSFER_DRIVER_LABEL,
  TRANSFER_FROM_LABEL,
  TRANSFER_MODAL_TITLE,
  TRANSFER_PRODUCT_LABEL,
  TRANSFER_QUANTITY_LABEL,
  TRANSFER_SUBMIT,
  TRANSFER_TO_LABEL,
  VALIDATION_TRANSFER_PRODUCT_REQUIRED,
  VALIDATION_TRANSFER_QUANTITY_EXCEEDS,
  VALIDATION_TRANSFER_QUANTITY_INVALID,
  VALIDATION_TRANSFER_SAME_WAREHOUSE,
} from '@/constants/strings'
import { useCreateTransfer, useWarehouse } from '@/features/warehouses/hooks'

const selectClassName =
  'h-10 px-space-sm rounded-lg bg-surface-container font-body-sm text-body-sm text-on-surface focus:outline-none'
const inputClassName =
  'h-10 px-space-md rounded-lg bg-surface-container font-body-sm text-body-sm text-on-surface focus:outline-none'
const labelClassName = 'font-label-md text-label-md text-on-surface-variant'

function productId(product: WarehouseInventorySubdoc['product']): string {
  return typeof product === 'string' ? product : product._id
}

export type TransferPreset = {
  warehouseId: string
  role: 'source' | 'destination'
  productId?: string
}

export function TransferModal({
  open,
  onOpenChange,
  warehouses,
  preset,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouses: Warehouse[]
  preset: TransferPreset | undefined
}) {
  const [fromWarehouseId, setFromWarehouseId] = useState('')
  const [toWarehouseId, setToWarehouseId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [driverText, setDriverText] = useState('')
  const [error, setError] = useState('')

  // "Adjusting state when a prop changes" (react.dev) — recomputes the
  // form's starting values the instant `open` flips to true, during render
  // rather than in an effect, so re-opening the dialog for a different
  // row/preset never shows stale values from the previous open.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      const firstId = warehouses[0]?._id ?? ''
      const secondId = warehouses[1]?._id ?? firstId
      if (preset?.role === 'source') {
        setFromWarehouseId(preset.warehouseId)
        setToWarehouseId(warehouses.find((w) => w._id !== preset.warehouseId)?._id ?? secondId)
      } else if (preset?.role === 'destination') {
        setToWarehouseId(preset.warehouseId)
        setFromWarehouseId(warehouses.find((w) => w._id !== preset.warehouseId)?._id ?? firstId)
      } else {
        setFromWarehouseId(firstId)
        setToWarehouseId(secondId)
      }
      setSelectedProductId(preset?.productId ?? '')
      setQuantity(1)
      setDriverText('')
      setError('')
    }
  }

  const sourceQuery = useWarehouse(fromWarehouseId || undefined)
  const createTransfer = useCreateTransfer()

  const selectedItem = useMemo(
    () =>
      sourceQuery.data?.inventory.find((item) => productId(item.product) === selectedProductId),
    [sourceQuery.data, selectedProductId],
  )
  const sourceInventory = sourceQuery.data?.inventory ?? []

  function productLabel(item: WarehouseInventorySubdoc): string {
    const product = item.product
    const name = item.productName || (typeof product === 'string' ? '' : product.name)
    return `${name} (${item.currentStock})`
  }

  async function onSubmit() {
    setError('')
    if (!fromWarehouseId || !toWarehouseId || fromWarehouseId === toWarehouseId) {
      setError(VALIDATION_TRANSFER_SAME_WAREHOUSE)
      return
    }
    if (!selectedItem) {
      setError(VALIDATION_TRANSFER_PRODUCT_REQUIRED)
      return
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError(VALIDATION_TRANSFER_QUANTITY_INVALID)
      return
    }
    if (quantity > selectedItem.currentStock) {
      setError(VALIDATION_TRANSFER_QUANTITY_EXCEEDS(selectedItem.currentStock))
      return
    }

    try {
      const transfer = await createTransfer.mutateAsync({
        fromWarehouse: fromWarehouseId,
        toWarehouse: toWarehouseId,
        items: [
          {
            product: productId(selectedItem.product),
            productName: selectedItem.productName,
            quantity,
            unit: selectedItem.packagingUnit,
          },
        ],
        notes: driverText.trim() ? `نقل: ${driverText.trim()}` : undefined,
      })
      toast.success(TOAST_TRANSFER_CREATED(transfer.transferCode))
      onOpenChange(false)
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : GENERIC_ERROR)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-lg">
      <DialogHeader
        icon="move_up"
        iconClassName="bg-secondary-fixed text-on-secondary-fixed-variant"
        onClose={() => onOpenChange(false)}
        title={TRANSFER_MODAL_TITLE}
      />
      <div className="flex flex-col gap-space-md p-space-lg">
        <div className="grid grid-cols-2 gap-space-sm">
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{TRANSFER_FROM_LABEL}</label>
            <select
              className={selectClassName}
              onChange={(event) => {
                setFromWarehouseId(event.target.value)
                setSelectedProductId('')
              }}
              value={fromWarehouseId}
            >
              {warehouses.map((warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{TRANSFER_TO_LABEL}</label>
            <select
              className={selectClassName}
              onChange={(event) => setToWarehouseId(event.target.value)}
              value={toWarehouseId}
            >
              {warehouses.map((warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClassName}>{TRANSFER_PRODUCT_LABEL}</label>
          <select
            className={inputClassName}
            onChange={(event) => setSelectedProductId(event.target.value)}
            value={selectedProductId}
          >
            <option value="">—</option>
            {sourceInventory.map((item) => (
              <option key={item._id} value={productId(item.product)}>
                {productLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{TRANSFER_QUANTITY_LABEL}</label>
            <input
              className={inputClassName}
              max={selectedItem?.currentStock}
              min={1}
              onChange={(event) => setQuantity(Number(event.target.value))}
              type="number"
              value={quantity}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{TRANSFER_DRIVER_LABEL}</label>
            <input
              className={inputClassName}
              onChange={(event) => setDriverText(event.target.value)}
              type="text"
              value={driverText}
            />
          </div>
        </div>

        {error ? (
          <span className="font-label-sm text-label-sm text-error">{error}</span>
        ) : null}
      </div>
      <div className="flex items-center justify-end gap-space-sm bg-surface-container px-space-lg py-space-md">
        <button
          className="h-10 rounded-lg bg-surface-container-high px-space-md text-on-surface-variant transition-all hover:bg-surface-container-highest"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          {MODAL_CANCEL}
        </button>
        <button
          className="flex h-10 items-center gap-1 rounded-lg bg-secondary px-space-lg text-label-md font-label-md font-bold text-on-secondary transition-all hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={createTransfer.isPending}
          onClick={onSubmit}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {TRANSFER_SUBMIT}
        </button>
      </div>
    </Dialog>
  )
}
