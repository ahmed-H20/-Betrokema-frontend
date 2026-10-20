import { formatNumber } from '@/lib/format'
import type { InvoicesStats } from '@/api/invoices.schema'

interface DailyKpiCardProps {
  stats?: InvoicesStats
  isLoading?: boolean
}

export function DailyKpiCard({ stats, isLoading }: DailyKpiCardProps) {
  const daily = stats?.dailyCollections
  const monthly = stats?.monthlyInvoices
  const overdue = stats?.overdueDebts
  const tabs = stats?.tabsCounts

  return (
    <div>
      {/* Mobile-First Split High-Density Card (< lg) */}
      <div className="block lg:hidden">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
          {/* Ambient blur */}
          <div className="pointer-events-none absolute -left-12 -top-12 h-28 w-28 rounded-full bg-secondary-container/15 blur-2xl" />

          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                analytics
              </span>
              <span className="font-label-md text-label-md">
                حركة الفواتير اليومية
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm text-on-surface">
              <span className="h-1.5 w-1.5 rounded-full bg-[#15803d]" />
              مباشر
            </span>
          </div>

          {/* Grid Stats */}
          <div className="mt-1.5 grid grid-cols-2 gap-space-sm">
            {/* Today Collections */}
            <div className="flex flex-col justify-between rounded-lg bg-surface-container-low p-2.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                التحصيل المعتمد اليوم
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary">
                  {isLoading
                    ? '...'
                    : formatNumber(daily?.collected ?? 0)}
                </span>
                <span className="font-label-sm text-label-sm font-semibold text-secondary">
                  ج.م
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1 font-label-sm text-label-sm text-[#15803d]">
                <span className="material-symbols-outlined text-[14px]">
                  trending_up
                </span>
                <span>
                  {daily?.percentage
                    ? `${daily.percentage}% من المستهدف`
                    : 'نشط اليوم'}
                </span>
              </div>
            </div>

            {/* Pending Verification */}
            <div className="flex flex-col justify-between rounded-lg bg-tertiary-fixed/25 p-2.5">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-tertiary-container">
                  قيد التدقيق والطلب
                </span>
                <span className="h-2 w-2 animate-pulse rounded-full bg-on-tertiary-container" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary">
                  {isLoading ? '...' : tabs?.pending ?? 0}
                </span>
                <span className="font-label-sm text-label-sm font-semibold text-on-tertiary-container">
                  فاتورة
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1 font-label-sm text-label-sm text-on-tertiary-container">
                <span className="material-symbols-outlined text-[14px]">
                  pending_actions
                </span>
                <span>تتطلب اعتماد توريد</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop 4-Card Executive Grid (>= lg) matching petrokema_web_admin_3 */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:gap-space-md">
        {/* Metric 1: Monthly Total */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="mb-space-sm flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              إجمالي الفواتير الصادرة • هذا الشهر
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[20px]">
                receipt_long
              </span>
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">
              {isLoading ? '...' : formatNumber(monthly?.totalAmount ?? 0)}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              ج.م
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 font-body-sm text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-1 rounded bg-secondary-fixed px-1.5 py-0.5 font-label-sm text-label-sm text-on-secondary-fixed-variant">
              <span className="material-symbols-outlined text-[14px]">tag</span>
              <span>{tabs?.all ?? 0} فاتورة مسجلة</span>
            </span>
            <span className="font-label-sm text-label-sm text-outline">
              {monthly?.growthRate ? `${monthly.growthRate}% مقارنة بالشهر السابق` : 'الشهر الحالي'}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full rounded-full bg-secondary" style={{ width: '75%' }} />
          </div>
        </div>

        {/* Metric 2: Today Collections */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="mb-space-sm flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              التحصيل المعتمد اليوم
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-fixed text-on-secondary-container">
              <span className="material-symbols-outlined text-[20px]">
                payments
              </span>
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">
              {isLoading ? '...' : formatNumber(daily?.collected ?? 0)}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              ج.م
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 font-body-sm text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-1 rounded bg-tertiary-fixed px-1.5 py-0.5 font-label-sm text-label-sm text-on-tertiary-container">
              <span className="material-symbols-outlined text-[14px]">
                trending_up
              </span>
              <span>{daily?.percentage ?? 0}% من المستهدف</span>
            </span>
            <span className="font-label-sm text-label-sm text-outline">
              {daily?.settlementsCount ?? 0} سند تحصيل
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-primary-container"
              style={{ width: `${Math.min(100, daily?.percentage || 15)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Pending Orders */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="mb-space-sm flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              أوامر قيد التدقيق والاعتماد
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tertiary-fixed/30 text-on-tertiary-container">
              <span className="material-symbols-outlined text-[20px]">
                pending_actions
              </span>
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">
              {isLoading ? '...' : tabs?.pending ?? 0}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              طلب توريد
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 font-body-sm text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-1 rounded bg-tertiary-container/10 px-1.5 py-0.5 font-label-sm text-label-sm text-on-tertiary-container font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-on-tertiary-container animate-pulse" />
              تتطلب توريد فوري
            </span>
            <span className="font-label-sm text-label-sm text-outline">
              جاهزة للاعتماد
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-on-tertiary-container"
              style={{ width: `${Math.min(100, ((tabs?.pending || 0) / (tabs?.all || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Overdue & Debts */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="mb-space-sm flex items-center justify-between">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-error">
              المتأخرات والديون غير المحصلة
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-container text-on-error-container">
              <span className="material-symbols-outlined text-[20px]">
                warning
              </span>
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl font-bold text-error">
              {isLoading ? '...' : formatNumber(overdue?.totalAmount ?? 0)}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              ج.م
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 font-body-sm text-body-sm text-on-surface-variant">
            <span className="rounded-full bg-error-container px-2 py-0.5 font-label-sm text-label-sm font-bold text-on-error-container">
              {overdue?.overdueAccountsCount ?? 0} حسابات مستحقة
            </span>
            <span className="font-label-sm text-label-sm text-outline">
              متابعة التحصيل
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full rounded-full bg-error" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
