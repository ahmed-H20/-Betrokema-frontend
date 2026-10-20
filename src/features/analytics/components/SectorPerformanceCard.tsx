import type { SectorPerformanceItem } from '@/api/analytics.schema'
import { ANALYTICS_SECTORS_SUBTITLE, ANALYTICS_SECTORS_TITLE } from '@/constants/strings'
import { formatCurrency, formatNumber } from '@/lib/format'

export function SectorPerformanceCard({ sectors }: { sectors: SectorPerformanceItem[] }) {
  const sectorIcons: Record<string, string> = {
    'العاشر من رمضان': 'factory',
    'مدينة السادات': 'science',
    'برج العرب': 'sailing',
    'أسيوط': 'location_city',
    'القاهرة الكبرى': 'apartment',
    'المركز الرئيسي': 'corporate_fare',
  }

  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-secondary">
            map
          </span>
          <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
            {ANALYTICS_SECTORS_TITLE}
          </h3>
        </div>
        <p className="font-body-sm mt-0.5 text-body-sm text-on-surface-variant">
          {ANALYTICS_SECTORS_SUBTITLE}
        </p>
      </div>

      {sectors.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-body-sm text-on-surface-variant">
          لا توجد بيانات قطاعات متاحة
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sectors.map((sector) => {
            const icon = sectorIcons[sector.sector] || 'pin_drop'
            return (
              <div
                className="flex flex-col gap-1.5 rounded-lg bg-surface-container-low p-3 transition-colors hover:bg-surface-container"
                key={sector.sector}
              >
                <div className="flex items-center justify-between text-body-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-container text-primary">
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    </span>
                    <span className="font-label-md truncate text-label-md font-semibold text-primary">
                      {sector.sector}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md font-bold text-primary">
                      {formatCurrency(sector.revenue)}
                    </span>
                    <span className="font-label-sm rounded-full bg-secondary-fixed px-2 py-0.5 text-label-sm font-bold text-on-secondary-fixed">
                      {sector.share}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
                    <div
                      className="h-full rounded-full bg-secondary transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, sector.share))}%` }}
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
      )}
    </div>
  )
}
