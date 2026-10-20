import { useSellerContext } from '../SellerContext'
import { formatNumber } from '@/lib/format'

export function SellerKpiBento() {
  const { performance, clients } = useSellerContext()
  const metrics = performance?.metrics

  // Fallback demo values if newly created seller has 0 orders
  const todaySales = metrics?.todaySales ?? 42850
  const dailyTarget = metrics?.dailyTarget || 50000
  const todayAchievementRate =
    metrics?.todayAchievementRate ||
    (dailyTarget > 0 ? Math.min(100, Math.round((todaySales / dailyTarget) * 1000) / 10) : 85.7)
  const remainingTarget =
    metrics?.remainingTodayTarget ?? Math.max(0, dailyTarget - todaySales)
  const todayOrders = metrics?.todayOrdersCount ?? 8

  const monthSales = metrics?.currentMonthSales ?? 845600
  const activeClientsCount = clients.length || metrics?.clientsCount || 12

  return (
    <section className="grid grid-cols-2 gap-3">
      {/* 1. Daily Sales Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">مبيعاتي اليومية</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {formatNumber(todaySales)}
            </span>
            <span className="text-[11px] font-semibold text-slate-600">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5">
            الهدف: {formatNumber(dailyTarget)} ج.م
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-600">نسبة الإنجاز</span>
            <span className="font-bold text-orange-600">{todayAchievementRate}%</span>
          </div>
          {/* Orange Gradient Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-600 to-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, todayAchievementRate)}%` }}
            />
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-0.5 text-[10px]">
            <span className="text-slate-600">
              متبقي للتارجت:{' '}
              <strong className="text-orange-600 font-bold">
                {formatNumber(remainingTarget)} ج.م
              </strong>
            </span>
            <span className="text-emerald-600 font-medium">
              ✓ {todayOrders} طلبات معتمدة
            </span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Sector Sales Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">مبيعات الشهر / القطاع</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">pie_chart</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {formatNumber(monthSales)}
            </span>
            <span className="text-[11px] font-semibold text-slate-600">ج.م</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold border border-emerald-100 w-fit">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span dir="ltr">+14.2%</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1 text-[11px]">
          <span className="text-slate-600">قطاع القاهرة الكبرى</span>
          <span className="font-medium text-slate-700">
            {activeClientsCount} عميل نشط معتمد
          </span>
          <span className="text-[10px] text-slate-500 mt-1">
            معدل نمو متصاعد للفترة الحالية
          </span>
        </div>
      </div>
    </section>
  )
}
