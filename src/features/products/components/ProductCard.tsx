import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Product } from '@/api/products.schema'
import {
  CURRENCY_SUFFIX,
  GENERIC_ERROR,
  PRODUCT_AVAILABLE_QUANTITY,
  PRODUCT_DELETE_BUTTON,
  PRODUCT_DELETE_CONFIRM_BUTTON,
  PRODUCT_DELETE_CONFIRM_DESCRIPTION,
  PRODUCT_DELETE_CONFIRM_TITLE,
  PRODUCT_EDIT_STOCK_PRICE,
  PRODUCT_LOW_STOCK_BADGE,
  PRODUCT_NO_CATEGORY,
  TOAST_PRODUCT_DELETED,
} from '@/constants/strings'
import { formatNumber } from '@/lib/format'
import { useDeleteProduct } from '@/features/products/hooks'
import { QuickEditStockDialog } from '@/features/products/components/QuickEditStockDialog'

const CATEGORY_BADGE_STYLES = [
  'bg-secondary-fixed text-on-secondary-fixed-variant',
  'bg-surface-container-highest text-primary',
  'bg-tertiary-fixed text-on-tertiary-fixed-variant',
]

type ProductCardProps = {
  product: Product
  categoryColorIndex: number
}

export function ProductCard({ product, categoryColorIndex }: ProductCardProps) {
  const [quickEditOpen, setQuickEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteProduct = useDeleteProduct()

  const categoryName =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name

  async function handleDelete() {
    try {
      await deleteProduct.mutateAsync(product._id)
      toast.success(TOAST_PRODUCT_DELETED)
      setDeleteOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  return (
    <div className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container">
              {product.image ? (
                <img
                  alt={product.name}
                  className="h-full w-full object-cover"
                  src={product.image}
                />
              ) : (
                <span className="font-headline-sm text-headline-sm text-on-surface-variant">
                  {product.name.slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`font-label-sm rounded-full px-2 py-0.5 text-label-sm ${
                    categoryName
                      ? CATEGORY_BADGE_STYLES[categoryColorIndex % 3]
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {categoryName ?? PRODUCT_NO_CATEGORY}
                </span>
                {product.code ? (
                  <span className="font-label-sm text-label-sm text-outline" dir="ltr">
                    #{product.code}
                  </span>
                ) : null}
              </div>
              <h3 className="font-headline-sm text-headline-sm leading-snug text-primary">
                {product.name}
              </h3>
            </div>
          </div>
          {product.statusBadge ? (
            <span className="font-label-sm rounded-md bg-surface-container-high px-2 py-1 text-label-sm font-semibold text-on-surface-variant">
              {product.statusBadge}
            </span>
          ) : null}
        </div>

        {product.fetures.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {product.fetures.map((feature, index) => (
              <span
                className="font-label-sm rounded bg-surface-container px-2 py-0.5 text-label-sm text-on-surface"
                key={`${feature.name}-${index}`}
              >
                {feature.name}
              </span>
            ))}
          </div>
        ) : null}

        {product.packages.length > 0 ? (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {product.packages.map((pkg) => (
              <div
                className="flex flex-col rounded-lg bg-surface-container-low p-2.5"
                key={pkg.unitName}
              >
                <span className="font-label-sm mb-0.5 text-label-sm text-on-surface-variant">
                  {pkg.unitName}
                  {pkg.weight ? ` (${pkg.weight})` : ''}
                </span>
                <div className="flex items-baseline gap-1" dir="ltr">
                  <span className="font-label-lg text-label-lg text-primary">
                    {formatNumber(pkg.price)} {CURRENCY_SUFFIX}
                  </span>
                  {pkg.oldPrice > pkg.price ? (
                    <span className="font-label-sm text-label-sm text-outline line-through">
                      {formatNumber(pkg.oldPrice)} {CURRENCY_SUFFIX}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mb-4 flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface" dir="ltr">
            {PRODUCT_AVAILABLE_QUANTITY(product.quantity)}
          </span>
          {product.isLowStock ? (
            <span className="font-label-sm flex items-center gap-1 rounded-md bg-error-container px-2 py-1 text-label-sm font-bold text-on-error-container">
              <span className="material-symbols-outlined text-[14px]">
                warning
              </span>
              {PRODUCT_LOW_STOCK_BADGE}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-surface-container pt-3">
        <button
          className="font-label-md flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-container-high py-2 text-center text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
          onClick={() => setQuickEditOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">
            edit_note
          </span>
          {PRODUCT_EDIT_STOCK_PRICE}
        </button>
        <button
          className="rounded-lg p-2 text-error transition-colors hover:bg-error-container"
          onClick={() => setDeleteOpen(true)}
          title={PRODUCT_DELETE_BUTTON}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            delete
          </span>
        </button>
      </div>

      {quickEditOpen ? (
        <QuickEditStockDialog
          onOpenChange={setQuickEditOpen}
          open={quickEditOpen}
          product={product}
        />
      ) : null}

      <ConfirmDialog
        confirmLabel={PRODUCT_DELETE_CONFIRM_BUTTON}
        description={PRODUCT_DELETE_CONFIRM_DESCRIPTION}
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        pending={deleteProduct.isPending}
        title={PRODUCT_DELETE_CONFIRM_TITLE}
      />
    </div>
  )
}
