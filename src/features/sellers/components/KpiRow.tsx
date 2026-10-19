import type { ReactNode } from 'react'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  CLIENT_PLURAL_FORMS,
  DAYS_REMAINING_PLURAL_FORMS,
  KPI_ACTIVE_CLIENTS_LABEL,
  KPI_ACTIVE_CLIENTS_NEW,
  KPI_ACTIVE_CLIENTS_UNIT,
  KPI_CERTIFIED_SELLERS_LABEL,
  KPI_CERTIFIED_SELLERS_UNIT,
  KPI_REPS_STATUS_ACTIVE,
  KPI_REPS_STATUS_SUSPENDED,
  KPI_REPS_STATUS_VACATION,
  KPI_TARGET_ACHIEVEMENT_LABEL,
  KPI_TARGET_DAYS_REMAINING,
  KPI_TEAM_SALES_GROWTH_SUFFIX,
  KPI_TEAM_SALES_LABEL,
  KPI_TEAM_SALES_TARGET,
  SELLER_KPI_ERROR,
  SELLER_KPI_LOADING,
  SELLER_PLURAL_FORMS,
} from '@/constants/strings'
import { arabicCountPhrase, arabicPlural, formatMillionsOrPlain, formatNumber } from '@/lib/format'
import { useSellerStats } from '@/features/sellers/hooks'

function KpiCard({
  icon,
  iconClassName,
  label,
  value,
  unit,
  footer,
}: {
  icon: string
  iconClassName: string
  label: string
  value: ReactNode
  unit?: string
  footer: ReactNode
}) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md font-medium text-on-surface-variant">
          {label}
        </span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
      <div className="mt-space-sm">
        <div className="flex items-baseline gap-space-xs">
          <span className="font-headline-xl text-headline-xl text-primary">
            {value}
          </span>
          {unit ? (
            <span className="font-label-md text-label-md text-on-surface-variant">
              {unit}
            </span>
          ) : null}
        </div>
        {footer}
      </div>
    </div>
  )
}

function StatusDot({ colorClassName }: { colorClassName: string }) {
  return <span className={`h-2 w-2 rounded-full ${colorClassName}`} />
}

export function KpiRow() {
  const statsQuery = useSellerStats()

  if (statsQuery.isLoading) {
    return <StateMessage minHeightClassName="min-h-[132px]" text={SELLER_KPI_LOADING} />
  }
  if (statsQuery.isError || !statsQuery.data) {
    return (
      <StateMessage minHeightClassName="min-h-[132px]" text={SELLER_KPI_ERROR} tone="error" />
    )
  }

  const stats = statsQuery.data
  const growthRate = stats.teamMonthlySales.growthRate
  const isNegativeGrowth = growthRate < 0
  const totalSales = formatMillionsOrPlain(stats.teamMonthlySales.totalAchieved)
  // The backend falls back to exactly 14.2 when there's no prior-month data
  // to compare against (see architecture.md) — indistinguishable from a real
  // 14.2% growth month from this response alone, so treat that exact value
  // as "no data" and hide the growth line rather than show a number that
  // might be fabricated.
  const hasRealGrowthData = growthRate !== 14.2

  return (
    <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        footer={
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-surface-container-low px-2 py-1.5">
            <span className="font-label-sm flex items-center gap-1 text-label-sm font-semibold text-on-surface">
              <StatusDot colorClassName="bg-secondary" />
              {formatNumber(stats.certifiedSellers.active)} {KPI_REPS_STATUS_ACTIVE}
            </span>
            <span className="font-label-sm text-outline">•</span>
            <span className="font-label-sm flex items-center gap-1 text-label-sm font-semibold text-on-surface">
              <StatusDot colorClassName="bg-error" />
              {formatNumber(stats.certifiedSellers.suspended)} {KPI_REPS_STATUS_SUSPENDED}
            </span>
            <span className="font-label-sm text-outline">•</span>
            <span className="font-label-sm flex items-center gap-1 text-label-sm text-on-surface-variant">
              <StatusDot colorClassName="bg-outline" />
              {formatNumber(stats.certifiedSellers.vacation)} {KPI_REPS_STATUS_VACATION}
            </span>
          </div>
        }
        icon="badge"
        iconClassName="bg-secondary-fixed text-on-secondary-fixed-variant"
        label={KPI_CERTIFIED_SELLERS_LABEL}
        unit={KPI_CERTIFIED_SELLERS_UNIT(
          arabicPlural(stats.certifiedSellers.total, SELLER_PLURAL_FORMS),
        )}
        value={formatNumber(stats.certifiedSellers.total)}
      />
      <KpiCard
        footer={
          <div className="mt-2 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span>
              {KPI_TEAM_SALES_TARGET(
                (stats.teamMonthlySales.monthlyTarget / 1_000_000).toFixed(1),
              )}
            </span>
            {hasRealGrowthData ? (
              <span
                className={`flex items-center gap-0.5 font-semibold ${isNegativeGrowth ? 'text-error' : 'text-secondary'}`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isNegativeGrowth ? 'trending_down' : 'trending_up'}
                </span>
                {`${isNegativeGrowth ? '' : '+'}${formatNumber(growthRate)}% ${KPI_TEAM_SALES_GROWTH_SUFFIX}`}
              </span>
            ) : null}
          </div>
        }
        icon="payments"
        iconClassName="bg-primary-fixed text-on-primary-fixed"
        label={KPI_TEAM_SALES_LABEL}
        unit={totalSales.unit}
        value={totalSales.value}
      />
      <KpiCard
        footer={
          <>
            <div className="flex items-baseline justify-between">
              <span className="font-label-md text-label-md font-semibold text-secondary">
                {stats.targetAchievement.statusText}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {KPI_TARGET_DAYS_REMAINING(
                  arabicCountPhrase(
                    stats.targetAchievement.daysRemaining,
                    DAYS_REMAINING_PLURAL_FORMS,
                  ),
                )}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-secondary"
                style={{
                  width: `${Math.min(100, Math.max(0, stats.targetAchievement.percentage))}%`,
                }}
              />
            </div>
          </>
        }
        icon="track_changes"
        iconClassName="bg-secondary-fixed text-on-secondary-fixed-variant"
        label={KPI_TARGET_ACHIEVEMENT_LABEL}
        value={
          <bdi dir="ltr">{formatNumber(stats.targetAchievement.percentage)}%</bdi>
        }
      />
      <KpiCard
        footer={
          <div className="mt-2 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span className="font-semibold text-secondary">
              {KPI_ACTIVE_CLIENTS_NEW(stats.activeFieldClients.newThisWeek)}
            </span>
          </div>
        }
        icon="storefront"
        iconClassName="bg-surface-container-high text-primary"
        label={KPI_ACTIVE_CLIENTS_LABEL}
        unit={KPI_ACTIVE_CLIENTS_UNIT(
          arabicPlural(stats.activeFieldClients.total, CLIENT_PLURAL_FORMS),
        )}
        value={formatNumber(stats.activeFieldClients.total)}
      />
    </div>
  )
}
