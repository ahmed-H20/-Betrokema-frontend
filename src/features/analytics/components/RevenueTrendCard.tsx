import type { MonthlyTrendItem } from '@/api/analytics.schema'
import { ANALYTICS_CHART_SUBTITLE, ANALYTICS_CHART_TITLE } from '@/constants/strings'
import { formatCurrency, formatNumber } from '@/lib/format'

export function RevenueTrendCard({ items }: { items: MonthlyTrendItem[] }) {
  const maxRevenue = Math.max(1, ...items.map((i) => Math.max(i.revenue, i.collected)))

  const monthNames: Record<number, string> = {
    1: 'يناير',
    2: 'فبراير',
    3: 'مارس',
    4: 'أبريل',
    5: 'مايو',
    6: 'يونيو',
    7: 'يوليو',
    8: 'أغسطس',
    9: 'سبتمبر',
    10: 'أكتوبر',
    11: 'نوفمبر',
    12: 'ديسمبر',
  }

  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-secondary">
              trending_up
            </span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
              {ANALYTICS_CHART_TITLE}
            </h3>
          </div>
          <p className="font-body-sm mt-0.5 text-body-sm text-on-surface-variant">
            {ANALYTICS_CHART_SUBTITLE}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-space-md text-label-sm font-label-sm">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-primary" />
            <span className="text-on-surface">إجمالي المبيعات</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-secondary" />
            <span className="text-on-surface">التحصيلات الفعلية</span>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-body-sm text-on-surface-variant">
          لا توجد بيانات كافية خلال هذه الفترة
        </div>
      ) : (
        <div className="flex flex-col gap-4 pt-2">
          {/* Visual Column / Bars Grid */}
          <div className="flex h-56 items-end gap-2 sm:gap-4 border-b border-outline-variant/30 pb-2">
            {items.map((item) => {
              const revPercent = Math.min(100, Math.round((item.revenue / maxRevenue) * 100))
              const colPercent = Math.min(100, Math.round((item.collected / maxRevenue) * 100))
              const mName = monthNames[item.month] || `${item.month}`

              return (
                <div
                  className="group relative flex flex-1 flex-col items-center justify-end h-full"
                  key={item.label}
                >
                  {/* Tooltip on hover/focus */}
                  <div className="pointer-events-none absolute -top-14 z-10 hidden flex-col items-center rounded-lg bg-inverse-surface px-2.5 py-1 text-[11px] text-inverse-on-surface shadow-md group-hover:flex">
                    <span className="font-bold">{mName}</span>
                    <span>مبيعات: {formatCurrency(item.revenue)}</span>
                    <span>تحصيل: {formatCurrency(item.collected)}</span>
                  </div>

                  {/* Dual Bars */}
                  <div className="flex w-full items-end justify-center gap-1 sm:gap-1.5">
                    {/* Revenue Bar */}
                    <div
                      className="w-1/2 max-w-[28px] rounded-t bg-primary transition-all duration-300 group-hover:bg-primary/80"
                      style={{ height: `${Math.max(8, revPercent)}%` }}
                    />
                    {/* Collected Bar */}
                    <div
                      className="w-1/2 max-w-[28px] rounded-t bg-secondary transition-all duration-300 group-hover:bg-secondary/80"
                      style={{ height: `${Math.max(8, colPercent)}%` }}
                    />
                  </div>

                  {/* Month Label */}
                  <span className="mt-2 text-center font-label-sm text-[11px] sm:text-label-sm text-on-surface-variant truncate w-full">
                    {mName}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Quick Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-center">
            <div className="rounded-lg bg-surface-container p-2">
              <span className="font-label-sm block text-label-sm text-on-surface-variant">
                متوسط المبيعات الشهري
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                {formatCurrency(
                  Math.round(items.reduce((s, i) => s + i.revenue, 0) / (items.length || 1)),
                )}
              </span>
            </div>
            <div className="rounded-lg bg-surface-container p-2">
              <span className="font-label-sm block text-label-sm text-on-surface-variant">
                إجمالي تحصيلات الفترة
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-secondary">
                {formatCurrency(items.reduce((s, i) => s + i.collected, 0))}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-lg bg-surface-container p-2">
              <span className="font-label-sm block text-label-sm text-on-surface-variant">
                إجمالي حركات الفواتير
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                {formatNumber(items.reduce((s, i) => s + i.ordersCount, 0))} فاتورة
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
