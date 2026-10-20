import { useState } from 'react'
import { toast } from 'sonner'
import type { AnalyticsPeriod } from '@/api/analytics.schema'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  ANALYTICS_ERROR,
  ANALYTICS_EXPORT_CSV,
  ANALYTICS_LIVE_PULSE,
  ANALYTICS_LOADING,
  ANALYTICS_PAGE_SUBTITLE,
  ANALYTICS_PAGE_TITLE,
  ANALYTICS_PERIOD_MONTH,
  ANALYTICS_PERIOD_QUARTER,
  ANALYTICS_PERIOD_TODAY,
  ANALYTICS_PERIOD_WEEK,
  ANALYTICS_PERIOD_YEAR,
  ANALYTICS_PRINT_REPORT,
  GENERIC_ERROR,
} from '@/constants/strings'
import { buildCsv, downloadCsv } from '@/lib/csv'
import { cn } from '@/lib/cn'
import { ExecutiveKpiBento } from '@/features/analytics/components/ExecutiveKpiBento'
import { PaymentMethodsCard } from '@/features/analytics/components/PaymentMethodsCard'
import { RevenueTrendCard } from '@/features/analytics/components/RevenueTrendCard'
import { SectorPerformanceCard } from '@/features/analytics/components/SectorPerformanceCard'
import { SellersLeaderboardCard } from '@/features/analytics/components/SellersLeaderboardCard'
import { TopProductsCard } from '@/features/analytics/components/TopProductsCard'
import { useExecutiveAnalytics } from '@/features/analytics/hooks'

export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('month')
  const analyticsQuery = useExecutiveAnalytics(period)

  const periods: { key: AnalyticsPeriod; label: string }[] = [
    { key: 'today', label: ANALYTICS_PERIOD_TODAY },
    { key: 'week', label: ANALYTICS_PERIOD_WEEK },
    { key: 'month', label: ANALYTICS_PERIOD_MONTH },
    { key: 'quarter', label: ANALYTICS_PERIOD_QUARTER },
    { key: 'year', label: ANALYTICS_PERIOD_YEAR },
  ]

  function handleExportCsv() {
    if (!analyticsQuery.data) return
    try {
      const data = analyticsQuery.data

      // Build a multi-section executive summary CSV
      const headers = ['القسم', 'المؤشر / البند', 'القيمة المالية (ج.م)', 'العدد / النسبة']
      const rows: (string | number)[][] = [
        ['المؤشرات العامة', 'إجمالي المبيعات والإيرادات', data.overview.totalRevenue, `${data.overview.totalOrders} فاتورة`],
        ['المؤشرات العامة', 'إجمالي التحصيلات الفعلية', data.overview.totalPaid, `${data.overview.collectionRate}% كفاءة`],
        ['المؤشرات العامة', 'المتبقي والذمم المدينة', data.overview.totalRemaining, 'قيد التحصيل'],
        ['المؤشرات العامة', 'المستحقات المتأخرة والحرجة', data.overview.overdueAmount, `${data.overview.overdueCount} فواتير متأخرة`],
      ]

      // Sectors
      data.sectors.forEach((s) => {
        rows.push(['توزيع القطاعات', s.sector, s.revenue, `${s.share}% (${s.ordersCount} طلبات)`])
      })

      // Top Products
      data.topProducts.forEach((p) => {
        rows.push(['المنتجات الأكثر مبيعاً', p.name, p.revenue, `${p.quantity} ${p.unit}`])
      })

      // Sellers
      data.topSellers.forEach((s) => {
        rows.push(['المناديب الميدانيين', s.name, s.sales, `${s.achievementRate}% المستهدف`])
      })

      const csvContent = buildCsv(headers, rows)
      downloadCsv(`petrokema-executive-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`, csvContent)
      toast.success('تم تصدير التقرير التنفيذي بنجاح')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : GENERIC_ERROR)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Top Header & Operational Banner */}
      <div className="flex flex-col justify-between gap-space-md xl:flex-row xl:items-center">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start sm:gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <span className="rounded-lg bg-primary-container p-2 text-on-primary">
                <span className="material-symbols-outlined text-[26px]">insights</span>
              </span>
              <h1 className="font-headline-xl text-headline-xl leading-tight text-primary">
                {ANALYTICS_PAGE_TITLE}
              </h1>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-2.5 py-1 text-label-md font-label-md text-on-secondary-fixed">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              {ANALYTICS_LIVE_PULSE}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {ANALYTICS_PAGE_SUBTITLE}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-space-sm print:hidden">
          <button
            className="flex h-11 items-center gap-space-sm rounded-lg bg-surface-container-lowest px-space-md text-label-lg font-label-lg text-on-surface shadow-sm transition-all hover:bg-surface-container active:scale-[0.99]"
            onClick={handlePrint}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">print</span>
            {ANALYTICS_PRINT_REPORT}
          </button>
          <button
            className="flex h-11 items-center gap-space-sm rounded-lg bg-primary-container px-space-lg text-label-lg font-label-lg font-bold text-on-primary shadow-md transition-all hover:bg-primary active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!analyticsQuery.data}
            onClick={handleExportCsv}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
              download
            </span>
            {ANALYTICS_EXPORT_CSV}
          </button>
        </div>
      </div>

      {/* Period Filter Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar print:hidden">
        {periods.map((item) => (
          <button
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-label-md font-label-md transition-all active:scale-95',
              period === item.key
                ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
            )}
            key={item.key}
            onClick={() => setPeriod(item.key)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {analyticsQuery.isLoading ? (
        <StateMessage minHeightClassName="min-h-[300px]" text={ANALYTICS_LOADING} />
      ) : analyticsQuery.isError || !analyticsQuery.data ? (
        <StateMessage minHeightClassName="min-h-[300px]" text={ANALYTICS_ERROR} tone="error" />
      ) : (
        <div className="flex flex-col gap-space-lg">
          {/* Bento KPIs Grid */}
          <ExecutiveKpiBento overview={analyticsQuery.data.overview} />

          {/* Analytical Visual Breakdown Grid */}
          <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
            {/* Column 1: Financial & Volume Movement */}
            <div className="flex flex-col gap-space-lg lg:col-span-7">
              <RevenueTrendCard items={analyticsQuery.data.monthlyTrend} />
              <TopProductsCard products={analyticsQuery.data.topProducts} />
            </div>

            {/* Column 2: Territories, Sales Reps & Cash Channels */}
            <div className="flex flex-col gap-space-lg lg:col-span-5">
              <SectorPerformanceCard sectors={analyticsQuery.data.sectors} />
              <SellersLeaderboardCard sellers={analyticsQuery.data.topSellers} />
              <PaymentMethodsCard methods={analyticsQuery.data.paymentMethods} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
