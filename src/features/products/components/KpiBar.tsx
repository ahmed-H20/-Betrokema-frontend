import type { ReactNode } from 'react'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  CURRENCY_SUFFIX,
  KPI_CATEGORIES_LABEL,
  KPI_CATEGORIES_UNIT,
  KPI_CRITICAL_ALERTS_HINT,
  KPI_CRITICAL_ALERTS_LABEL,
  KPI_CRITICAL_ALERTS_NONE,
  KPI_CRITICAL_ALERTS_UNIT,
  KPI_ERROR,
  KPI_LOADING,
  KPI_STOCK_VALUE_LABEL,
  KPI_STOCK_VALUE_WAREHOUSES,
  KPI_TOP_CATEGORY,
  KPI_TOP_CATEGORY_NONE,
  KPI_TOTAL_PRODUCTS_LABEL,
  KPI_TOTAL_PRODUCTS_QUARTER,
  KPI_TOTAL_PRODUCTS_UNIT,
} from '@/constants/strings'
import { formatNumber } from '@/lib/format'
import { useCategories } from '@/features/categories/hooks'
import { useProductStats } from '@/features/products/hooks'

function KpiCard({
  icon,
  iconClassName,
  label,
  labelClassName,
  value,
  valueClassName,
  unit,
  footer,
}: {
  icon: string
  iconClassName: string
  label: string
  labelClassName?: string
  value: string
  valueClassName?: string
  unit: string
  footer: ReactNode
}) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <span
            className={`font-label-md mb-1 block text-label-md text-on-surface-variant ${labelClassName ?? ''}`}
          >
            {label}
          </span>
          <div className="flex items-baseline gap-2" dir="ltr">
            <span
              className={`font-headline-xl text-headline-xl text-primary ${valueClassName ?? ''}`}
            >
              {value}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {unit}
            </span>
          </div>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {icon}
          </span>
        </div>
      </div>
      <div className="mt-4">{footer}</div>
    </div>
  )
}

export function KpiBar() {
  const statsQuery = useProductStats()
  const categoriesQuery = useCategories()

  if (statsQuery.isLoading || categoriesQuery.isLoading) {
    return <StateMessage minHeightClassName="min-h-[132px]" text={KPI_LOADING} />
  }

  if (statsQuery.isError || categoriesQuery.isError || !statsQuery.data) {
    return <StateMessage minHeightClassName="min-h-[132px]" text={KPI_ERROR} tone="error" />
  }

  const stats = statsQuery.data
  const categories = categoriesQuery.data?.data ?? []
  const topCategory = [...categories]
    .filter((category) => category.productsCount > 0)
    .sort((a, b) => b.productsCount - a.productsCount)[0]
  const firstCriticalProduct = stats.criticalStockAlerts.products[0]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        footer={
          <div className="flex items-center gap-2 font-label-sm text-label-sm text-secondary">
            <span className="material-symbols-outlined text-[16px]">
              trending_up
            </span>
            <span>{KPI_TOTAL_PRODUCTS_QUARTER(stats.totalProducts.quarterAdded)}</span>
          </div>
        }
        icon="inventory_2"
        iconClassName="bg-surface-container text-primary"
        label={KPI_TOTAL_PRODUCTS_LABEL}
        unit={KPI_TOTAL_PRODUCTS_UNIT}
        value={formatNumber(stats.totalProducts.count)}
      />
      <KpiCard
        footer={
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {KPI_STOCK_VALUE_WAREHOUSES(stats.totalStockValue.warehousesCount)}
          </span>
        }
        icon="payments"
        iconClassName="bg-secondary-fixed text-on-secondary-fixed-variant"
        label={KPI_STOCK_VALUE_LABEL}
        unit={CURRENCY_SUFFIX}
        value={formatNumber(stats.totalStockValue.value)}
      />
      <KpiCard
        footer={
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {firstCriticalProduct
              ? KPI_CRITICAL_ALERTS_HINT(firstCriticalProduct.warehouse)
              : KPI_CRITICAL_ALERTS_NONE}
          </span>
        }
        icon="fmd_bad"
        iconClassName="bg-error-container text-on-error-container"
        label={KPI_CRITICAL_ALERTS_LABEL}
        labelClassName="text-error"
        unit={KPI_CRITICAL_ALERTS_UNIT}
        value={formatNumber(stats.criticalStockAlerts.count)}
        valueClassName="text-error"
      />
      <KpiCard
        footer={
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {topCategory
              ? KPI_TOP_CATEGORY(topCategory.name, topCategory.productsCount)
              : KPI_TOP_CATEGORY_NONE}
          </span>
        }
        icon="category"
        iconClassName="bg-surface-container text-primary"
        label={KPI_CATEGORIES_LABEL}
        unit={KPI_CATEGORIES_UNIT}
        value={formatNumber(stats.categoriesCount)}
      />
    </div>
  )
}
