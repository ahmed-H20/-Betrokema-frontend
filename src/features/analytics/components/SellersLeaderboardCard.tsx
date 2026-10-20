import type { TopSellerItem } from '@/api/analytics.schema'
import {
  ANALYTICS_SELLERS_SUBTITLE,
  ANALYTICS_SELLERS_TITLE,
} from '@/constants/strings'
import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

export function SellersLeaderboardCard({ sellers }: { sellers: TopSellerItem[] }) {
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-secondary">
            military_tech
          </span>
          <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
            {ANALYTICS_SELLERS_TITLE}
          </h3>
        </div>
        <p className="font-body-sm mt-0.5 text-body-sm text-on-surface-variant">
          {ANALYTICS_SELLERS_SUBTITLE}
        </p>
      </div>

      {sellers.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-body-sm text-on-surface-variant">
          لا توجد سجلات مناديب معتمدة
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sellers.map((seller, idx) => (
            <div
              className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-3 transition-colors hover:bg-surface-container"
              key={seller._id || idx}
            >
              <div className="flex items-center justify-between text-body-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center text-base">
                    {idx < 3 ? medals[idx] : <span className="font-label-sm font-bold text-outline">#{idx + 1}</span>}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md truncate text-label-md font-bold text-primary">
                      {seller.name}
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      {seller.sector} • {formatNumber(seller.ordersCount)} فاتورة
                    </span>
                  </div>
                </div>

                <div className="flex flex-col text-left shrink-0">
                  <span className="font-label-md text-label-md font-bold text-primary">
                    {formatCurrency(seller.sales)}
                  </span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant">
                    تحصيل: {formatCurrency(seller.collected)}
                  </span>
                </div>
              </div>

              {/* Target Meter */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      seller.achievementRate >= 100
                        ? 'bg-secondary'
                        : seller.achievementRate >= 70
                          ? 'bg-primary'
                          : 'bg-tertiary-fixed-dim',
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, seller.achievementRate))}%` }}
                  />
                </div>
                <span className="font-label-sm shrink-0 text-label-sm font-bold text-primary">
                  {seller.achievementRate}% المستهدف
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
