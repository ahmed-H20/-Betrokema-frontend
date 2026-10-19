import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import type { Product } from '@/api/products.schema'
import {
  GENERIC_ERROR,
  MODAL_CANCEL,
  PRODUCT_CURRENT_QUANTITY_LABEL,
  QUICK_EDIT_SUBMIT,
  QUICK_EDIT_TITLE,
  TOAST_PRODUCT_STOCK_UPDATED,
} from '@/constants/strings'
import { useUpdateProductStockAndPrice } from '@/features/products/hooks'
import {
  buildPackagesFromForm,
  isBestelaUnit,
  isGalonUnit,
} from '@/features/products/productForm'
import {
  stockPriceFormSchema,
  type StockPriceFormValues,
} from '@/features/products/productForm.schema'
import { PricingFields } from '@/features/products/components/PricingFields'

type QuickEditStockDialogProps = {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

function findPackagePrice(
  packages: Product['packages'],
  matcher: (unitName: string) => boolean,
) {
  const pkg = packages.find((item) => matcher(item.unitName))
  return {
    price: pkg?.oldPrice && pkg.oldPrice > 0 ? pkg.oldPrice : pkg?.price ?? 0,
    discount: pkg?.discountPercent ?? 0,
    weight: pkg?.weight ?? '',
  }
}

function buildDefaults(product: Product): StockPriceFormValues {
  const galon = findPackagePrice(product.packages, isGalonUnit)
  const bestela = findPackagePrice(product.packages, isBestelaUnit)
  return {
    quantity: product.quantity,
    galonPrice: galon.price,
    galonDiscount: galon.discount,
    galonWeight: galon.weight,
    bestelaPrice: bestela.price,
    bestelaDiscount: bestela.discount,
    bestelaWeight: bestela.weight,
  }
}

export function QuickEditStockDialog({
  product,
  open,
  onOpenChange,
}: QuickEditStockDialogProps) {
  const updateStockAndPrice = useUpdateProductStockAndPrice()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StockPriceFormValues>({
    resolver: zodResolver(stockPriceFormSchema),
    defaultValues: buildDefaults(product),
  })

  useEffect(() => {
    if (open) reset(buildDefaults(product))
  }, [open, product, reset])

  async function onSubmit(values: StockPriceFormValues) {
    try {
      await updateStockAndPrice.mutateAsync({
        id: product._id,
        input: {
          quantity: values.quantity,
          packages: buildPackagesFromForm(values, product.packages),
        },
      })
      toast.success(TOAST_PRODUCT_STOCK_UPDATED)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-2xl">
      <DialogHeader
        onClose={() => onOpenChange(false)}
        subtitle={product.name}
        title={QUICK_EDIT_TITLE}
      />
      <form
        className="flex flex-1 flex-col overflow-hidden"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-4 overflow-y-auto p-6">
          <div>
            <label className="font-label-md mb-1.5 block text-label-md text-on-surface">
              {PRODUCT_CURRENT_QUANTITY_LABEL}
            </label>
            <input
              className="h-10 w-full rounded-lg bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface focus:outline-none"
              type="number"
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity ? (
              <span className="font-label-sm mt-1 block text-label-sm text-error">
                {errors.quantity.message}
              </span>
            ) : null}
          </div>
          <PricingFields errors={errors} register={register} />
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
            {QUICK_EDIT_SUBMIT}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
