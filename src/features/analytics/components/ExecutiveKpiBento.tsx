import type { ExecutiveOverview } from '@/api/analytics.schema'
import {
  ANALYTICS_KPI_COLLECTIONS,
  ANALYTICS_KPI_EFFICIENCY,
  ANALYTICS_KPI_OVERDUE,
  ANALYTICS_KPI_REMAINING,
  ANALYTICS_KPI_REVENUE,
} from '@/constants/strings'
import { formatCurrency, formatNumber } from '@/lib/format'

export function ExecutiveKpiBento({ overview }: { overview: ExecutiveOverview }) {
  return (
    <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Revenue */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md font-medium text-on-surface-variant">
            {ANALYTICS_KPI_REVENUE}
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary">
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </span>
        </div>
        <div className="my-space-sm">
          <div className="font-headline-xl text-2xl font-bold text-primary md:text-headline-xl">
            {formatCurrency(overview.totalRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-secondary">receipt_long</span>
            <span>{formatNumber(overview.totalOrders)} فواتير مسجلة</span>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-primary/5" />
      </div>

      {/* 2. Total Collected & Cash Flow */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md font-medium text-on-surface-variant">
            {ANALYTICS_KPI_COLLECTIONS}
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-fixed text-on-secondary-fixed">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </span>
        </div>
        <div className="my-space-sm">
          <div className="font-headline-xl text-2xl font-bold text-secondary md:text-headline-xl">
            {formatCurrency(overview.totalPaid)}
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center justify-between font-label-sm text-label-sm">
              <span className="text-on-surface-variant">{ANALYTICS_KPI_EFFICIENCY}</span>
              <span className="font-bold text-secondary">{overview.collectionRate}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, overview.collectionRate))}%` }}
              />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-secondary/5" />
      </div>

      {/* 3. Remaining Receivables */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md font-medium text-on-surface-variant">
            {ANALYTICS_KPI_REMAINING}
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tertiary-fixed text-on-tertiary-fixed">
            <span className="material-symbols-outlined text-[20px]">hourglass_bottom</span>
          </span>
        </div>
        <div className="my-space-sm">
          <div className="font-headline-xl text-2xl font-bold text-primary md:text-headline-xl">
            {formatCurrency(overview.totalRemaining)}
          </div>
          <div className="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-tertiary">trending_flat</span>
            <span>ذمم مدينة قيد التحصيل الدوري</span>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-tertiary/5" />
      </div>

      {/* 4. Overdue Debts */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md font-medium text-on-surface-variant">
            {ANALYTICS_KPI_OVERDUE}
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error-container text-on-error-container">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </span>
        </div>
        <div className="my-space-sm">
          <div className="font-headline-xl text-2xl font-bold text-error md:text-headline-xl">
            {formatCurrency(overview.overdueAmount)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 font-label-sm text-label-sm text-error">
            <span className="h-2 w-2 rounded-full bg-error animate-pulse" />
            <span>{overview.overdueCount} فواتير تجاوزت موعد الاستحقاق</span>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-error/5" />
      </div>
    </div>
  )
}
