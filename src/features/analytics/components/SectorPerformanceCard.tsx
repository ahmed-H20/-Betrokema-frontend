import type { SectorPerformanceItem } from '@/api/analytics.schema'
import { ANALYTICS_SECTORS_SUBTITLE, ANALYTICS_SECTORS_TITLE } from '@/constants/strings'
import { formatCurrency, formatNumber } from '@/lib/format'

const sectorColors = [
  '#1B4965',
  '#059669',
  '#6366F1',
  '#D97706',
  '#DB2777',
  '#0284C7',
  '#8B5CF6',
]

export function SectorPerformanceCard({ sectors }: { sectors: SectorPerformanceItem[] }) {
  const sectorIcons: Record<string, string> = {
    'العاشر من رمضان': 'factory',
    'مدينة السادات': 'science',
    'برج العرب': 'sailing',
    'أسيوط': 'location_city',
    'القاهرة الكبرى': 'apartment',
    'المركز الرئيسي': 'corporate_fare',
  }

  const totalRev = sectors.reduce((s, i) => s + i.revenue, 0)
  const totalOrders = sectors.reduce((s, i) => s + i.ordersCount, 0)

  // Donut geometry
  const radius = 54
  const circumference = 2 * Math.PI * radius
  let accumulatedPercent = 0

  return (
    <div className="flex flex-col gap-space-md rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-container text-on-secondary shadow-sm">
            <span className="material-symbols-outlined text-[20px]">donut_large</span>
          </span>
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
              {ANALYTICS_SECTORS_TITLE}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {ANALYTICS_SECTORS_SUBTITLE}
            </p>
          </div>
        </div>
      </div>

      {sectors.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-body-sm text-on-surface-variant">
          لا توجد بيانات قطاعات متاحة
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Visual SVG Donut Breakdown & Quick Stats */}
          <div className="flex flex-col items-center justify-around gap-4 rounded-xl bg-surface-container-low/40 p-3 sm:flex-row">
            {/* SVG Donut */}
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
                {/* Track background */}
                <circle
                  cx="70"
                  cy="70"
                  fill="transparent"
                  r={radius}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeWidth="18"
                />
                {/* Slices */}
                {sectors.map((sec, idx) => {
                  const shareVal = sec.share > 0 ? sec.share : 0
                  const strokeDash = (shareVal / 100) * circumference
                  const strokeOffset = -(accumulatedPercent / 100) * circumference
                  accumulatedPercent += shareVal
                  const color = sectorColors[idx % sectorColors.length]

                  return (
                    <circle
                      cx="70"
                      cy="70"
                      fill="transparent"
                      key={`slice_${sec.sector}`}
                      r={radius}
                      stroke={color}
                      strokeDasharray={`${strokeDash} ${circumference}`}
                      strokeDashoffset={strokeOffset}
                      strokeWidth="18"
                      className="transition-all duration-500"
                    />
                  )
                })}
              </svg>

              {/* Donut Center Label */}
              <div className="pointer-events-none absolute flex flex-col items-center text-center">
                <span className="text-[10px] font-semibold text-on-surface-variant">
                  إجمالي القطاعات
                </span>
                <span className="text-[11px] font-bold text-primary">
                  {formatCurrency(totalRev)}
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  {formatNumber(totalOrders)} طلب
                </span>
              </div>
            </div>

            {/* Quick Mini Legend */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-label-sm font-semibold text-primary">
                الحصص التوزيعية للمناطق:
              </span>
              <div className="flex flex-wrap gap-2">
                {sectors.slice(0, 4).map((sec, idx) => {
                  const color = sectorColors[idx % sectorColors.length]
                  return (
                    <div
                      className="flex items-center gap-1.5 rounded-full bg-surface-container px-2 py-0.5 text-[11px]"
                      key={`legend_${sec.sector}`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-on-surface truncate max-w-[90px]">
                        {sec.sector}
                      </span>
                      <span className="font-bold text-primary">{sec.share}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* List of Sectors with Detailed Progress Bars */}
          <div className="flex flex-col gap-2.5">
            {sectors.map((sector, idx) => {
              const icon = sectorIcons[sector.sector] || 'pin_drop'
              const color = sectorColors[idx % sectorColors.length]
              return (
                <div
                  className="flex flex-col gap-1.5 rounded-xl border border-outline-variant/20 bg-surface-container-low/70 p-3 transition-colors hover:bg-surface-container"
                  key={sector.sector}
                >
                  <div className="flex items-center justify-between text-body-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-xs"
                        style={{ backgroundColor: color }}
                      >
                        <span className="material-symbols-outlined text-[15px]">{icon}</span>
                      </span>
                      <span className="font-label-md truncate text-label-md font-semibold text-primary">
                        {sector.sector}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-bold text-primary">
                        {formatCurrency(sector.revenue)}
                      </span>
                      <span
                        className="font-label-sm rounded-full px-2 py-0.5 text-label-sm font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {sector.share}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, sector.share))}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="font-label-sm shrink-0 text-label-sm text-on-surface-variant">
                      {formatNumber(sector.ordersCount)} طلبات
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
