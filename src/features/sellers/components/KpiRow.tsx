import type { ReactNode } from 'react'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  CLIENT_PLURAL_FORMS,
  KPI_ACTIVE_CLIENTS_LABEL,
  KPI_ACTIVE_CLIENTS_NEW,
  KPI_ACTIVE_CLIENTS_UNIT,
  KPI_CERTIFIED_SELLERS_LABEL,
  KPI_CERTIFIED_SELLERS_UNIT,
  KPI_TARGET_ACHIEVEMENT_LABEL,
  KPI_TARGET_DAYS_REMAINING,
  KPI_TEAM_SALES_LABEL,
  KPI_TEAM_SALES_TARGET,
  SELLER_KPI_ERROR,
  SELLER_KPI_LOADING,
  SELLER_PLURAL_FORMS,
  SELLER_STATUS_LABELS,
} from '@/constants/strings'
import { arabicPlural, formatMillionsOrPlain, formatNumber } from '@/lib/format'
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
  value: string
  unit: string
  footer: ReactNode
}) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-label-md mb-1 block text-label-md text-on-surface-variant">
            {label}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-primary">
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
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
      </div>
      <div className="mt-4">{footer}</div>
    </div>
  )
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        footer={
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {`${SELLER_STATUS_LABELS.ACTIVE}: ${formatNumber(stats.certifiedSellers.active)} · ${SELLER_STATUS_LABELS.SUSPENDED}: ${formatNumber(stats.certifiedSellers.suspended)}`}
          </span>
        }
        icon="badge"
        iconClassName="bg-surface-container text-primary"
        label={KPI_CERTIFIED_SELLERS_LABEL}
        unit={KPI_CERTIFIED_SELLERS_UNIT(
          arabicPlural(stats.certifiedSellers.total, SELLER_PLURAL_FORMS),
        )}
        value={formatNumber(stats.certifiedSellers.total)}
      />
      <KpiCard
        footer={
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {KPI_TEAM_SALES_TARGET(
                (stats.teamMonthlySales.monthlyTarget / 1_000_000).toFixed(1),
              )}
            </span>
            <span
              className={`flex items-center gap-1 font-label-sm text-label-sm ${isNegativeGrowth ? 'text-error' : 'text-secondary'}`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isNegativeGrowth ? 'trending_down' : 'trending_up'}
              </span>
              {`${formatNumber(growthRate)}%`}
            </span>
          </div>
        }
        icon="payments"
        iconClassName="bg-secondary-fixed text-on-secondary-fixed-variant"
        label={KPI_TEAM_SALES_LABEL}
        unit="ج.م"
        value={formatMillionsOrPlain(stats.teamMonthlySales.totalAchieved)}
      />
      <KpiCard
        footer={
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {`${stats.targetAchievement.statusText} · ${KPI_TARGET_DAYS_REMAINING(stats.targetAchievement.daysRemaining)}`}
          </span>
        }
        icon="track_changes"
        iconClassName="bg-surface-container text-primary"
        label={KPI_TARGET_ACHIEVEMENT_LABEL}
        unit="%"
        value={formatNumber(stats.targetAchievement.percentage)}
      />
      <KpiCard
        footer={
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {KPI_ACTIVE_CLIENTS_NEW(stats.activeFieldClients.newThisWeek)}
          </span>
        }
        icon="groups"
        iconClassName="bg-surface-container text-primary"
        label={KPI_ACTIVE_CLIENTS_LABEL}
        unit={KPI_ACTIVE_CLIENTS_UNIT(
          arabicPlural(stats.activeFieldClients.total, CLIENT_PLURAL_FORMS),
        )}
        value={formatNumber(stats.activeFieldClients.total)}
      />
    </div>
  )
}
