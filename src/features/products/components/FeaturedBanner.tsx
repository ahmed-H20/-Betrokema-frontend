import { useState } from 'react'
import type { Product } from '@/api/products.schema'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  FEATURED_BEST_SELLER_BADGE,
  FEATURED_CODE_PREFIX,
  FEATURED_EMPTY,
  FEATURED_FEATURED_BADGE,
  FEATURED_LOADING,
  FEATURED_HIGH_STOCK_BADGE,
  FEATURED_QUICK_EDIT,
  FEATURED_STOCK_AVAILABLE,
  PRODUCT_AVAILABLE_QUANTITY,
  PRODUCTS_ERROR,
} from '@/constants/strings'
import { useFeaturedProduct } from '@/features/products/hooks'
import { QuickEditStockDialog } from '@/features/products/components/QuickEditStockDialog'

function badgeLabel(product: Product): string {
  if (product.isBestSeller) return FEATURED_BEST_SELLER_BADGE
  if (product.isFeatured) return FEATURED_FEATURED_BADGE
  return FEATURED_HIGH_STOCK_BADGE
}

export function FeaturedBanner() {
  const [quickEditOpen, setQuickEditOpen] = useState(false)
  const featuredQuery = useFeaturedProduct()

  if (featuredQuery.isLoading) {
    return <StateMessage minHeightClassName="min-h-[140px]" text={FEATURED_LOADING} />
  }

  if (featuredQuery.isError) {
    return (
      <StateMessage minHeightClassName="min-h-[140px]" text={PRODUCTS_ERROR} tone="error" />
    )
  }

  const product = featuredQuery.data
  if (!product) {
    return <StateMessage minHeightClassName="min-h-[140px]" text={FEATURED_EMPTY} />
  }

  return (
    <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-xl bg-gradient-to-l from-primary-container to-primary p-6 text-on-primary shadow-md md:flex-row">
      <div className="z-10 flex items-center gap-5">
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container-lowest/10 p-1 backdrop-blur-sm">
          {product.image ? (
            <img
              alt={product.name}
              className="h-full w-full rounded-lg object-cover"
              src={product.image}
            />
          ) : (
            <span className="font-headline-md text-headline-md">
              {product.name.slice(0, 2)}
            </span>
          )}
        </div>
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="font-label-sm rounded-full bg-secondary px-2.5 py-0.5 text-label-sm font-bold text-on-secondary">
              {badgeLabel(product)}
            </span>
            {product.code ? (
              <span className="font-label-sm text-label-sm text-on-primary-container" dir="ltr">
                {FEATURED_CODE_PREFIX} {product.code}
              </span>
            ) : null}
          </div>
          <h3 className="font-headline-md mb-1 text-headline-md font-bold">
            {product.name}
          </h3>
          {product.description ? (
            <p className="font-body-sm line-clamp-1 max-w-lg text-body-sm text-on-primary-container">
              {product.description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="z-10 flex w-full items-end justify-between gap-2 border-t border-white/10 pt-3 md:w-auto md:flex-col md:border-t-0 md:pt-0">
        <div className="text-right">
          <span className="font-label-sm block text-label-sm text-on-primary-container">
            {FEATURED_STOCK_AVAILABLE}
          </span>
          <span className="font-headline-md text-headline-md text-secondary-fixed" dir="ltr">
            {PRODUCT_AVAILABLE_QUANTITY(product.quantity)}
          </span>
        </div>
        <button
          className="font-label-md flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-label-md text-on-secondary transition-all hover:bg-secondary/90"
          onClick={() => setQuickEditOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          {FEATURED_QUICK_EDIT}
        </button>
      </div>

      {quickEditOpen ? (
        <QuickEditStockDialog
          onOpenChange={setQuickEditOpen}
          open={quickEditOpen}
          product={product}
        />
      ) : null}
    </div>
  )
}
