import type { TopProductItem } from '@/api/analytics.schema'
import {
  ANALYTICS_TOP_PRODUCTS_SUBTITLE,
  ANALYTICS_TOP_PRODUCTS_TITLE,
} from '@/constants/strings'
import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

export function TopProductsCard({ products }: { products: TopProductItem[] }) {
  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-secondary">
            inventory_2
          </span>
          <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
            {ANALYTICS_TOP_PRODUCTS_TITLE}
          </h3>
        </div>
        <p className="font-body-sm mt-0.5 text-body-sm text-on-surface-variant">
          {ANALYTICS_TOP_PRODUCTS_SUBTITLE}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-body-sm text-on-surface-variant">
          لا توجد مبيعات منتجات مسجلة
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product, idx) => (
            <div
              className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low p-2.5 transition-colors hover:bg-surface-container"
              key={product._id || idx}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-label-sm font-bold',
                    idx === 0
                      ? 'bg-amber-100 text-amber-800'
                      : idx === 1
                        ? 'bg-slate-200 text-slate-700'
                        : idx === 2
                          ? 'bg-amber-700/10 text-amber-900'
                          : 'bg-surface-container text-on-surface-variant',
                  )}
                >
                  #{idx + 1}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md truncate text-label-md font-semibold text-primary">
                    {product.name}
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant" dir="ltr">
                    {product.code || 'PET-PROD'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-left">
                <div className="flex flex-col text-left">
                  <span className="font-label-md text-label-md font-bold text-primary">
                    {formatCurrency(product.revenue)}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {formatNumber(product.quantity)} {product.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
