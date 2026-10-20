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

const DEFAULT_UNIT_CLASSNAME = 'font-label-md text-label-md text-on-surface-variant'

function KpiCard({
  icon,
  iconClassName,
  label,
  value,
  unit,
  unitClassName = DEFAULT_UNIT_CLASSNAME,
  isCurrencyUnit,
  footer,
  bodyOverride,
}: {
  icon: string
  iconClassName: string
  label: string
  value?: ReactNode
  unit?: string
  // Per `petrokema_web_admin_2`: every card's unit is small/muted EXCEPT
  // card 2 (team sales), whose "مليون ج.م" unit is large and primary-colored
  // — a deliberate per-card difference in the export, not an oversight.
  unitClassName?: string
  // Detail rule (CLAUDE.md): an amount and its currency live in one bdi and
  // never wrap apart. Only card 2 (team sales) is a real currency amount.
  isCurrencyUnit?: boolean
  footer?: ReactNode
  // Card 3 (target achievement) puts its number, status text and
  // days-remaining on one shared baseline row in the export — a different
  // shape from the other 3 cards' stacked value-row + footer-row, so it
  // supplies its own body here instead of value/unit/footer.
  bodyOverride?: ReactNode
}) {
  const valueAndUnit = (
    <>
      <span className="font-headline-xl text-2xl text-primary md:text-headline-xl">
        {value}
      </span>
      {unit ? <span className={unitClassName}>{unit}</span> : null}
    </>
  )

  return (
    // Deliberate deviation from a plain `justify-between` card shell,
    // logged in ui-tokens.md: with grid auto-stretch making all 4 cards the
    // same overall height, `justify-between` pushed the value row down by a
    // different amount per card (whichever had the shortest footer), so the
    // big numbers didn't share one y across the row. Fixed by reserving a
    // fixed-height footer slot below instead, so the header→value gap is
    // identical on every card regardless of how tall its own footer is.
    <div className="relative flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md font-medium text-on-surface-variant">
          {label}
        </span>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
      <div className="mt-space-sm">
        {bodyOverride ?? (
          <>
            {isCurrencyUnit ? (
              <bdi className="flex items-baseline gap-space-xs whitespace-nowrap" dir="ltr">
                {valueAndUnit}
              </bdi>
            ) : (
              <div className="flex flex-wrap items-baseline gap-space-xs">
                {valueAndUnit}
              </div>
            )}
            <div className="min-h-10">{footer}</div>
          </>
        )}
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
          <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1 rounded-lg bg-surface-container-low px-1.5 py-1">
            <span className="font-label-sm flex items-center gap-0.5 whitespace-nowrap text-label-sm font-semibold text-on-surface">
              <StatusDot colorClassName="bg-secondary" />
              {formatNumber(stats.certifiedSellers.active)} {KPI_REPS_STATUS_ACTIVE}
            </span>
            <span className="font-label-sm text-outline">•</span>
            <span className="font-label-sm flex items-center gap-0.5 whitespace-nowrap text-label-sm font-semibold text-on-surface">
              <StatusDot colorClassName="bg-error" />
              {formatNumber(stats.certifiedSellers.suspended)} {KPI_REPS_STATUS_SUSPENDED}
            </span>
            <span className="font-label-sm text-outline">•</span>
            <span className="font-label-sm flex items-center gap-0.5 whitespace-nowrap text-label-sm text-on-surface-variant">
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
        isCurrencyUnit
        label={KPI_TEAM_SALES_LABEL}
        unit={totalSales.unit}
        unitClassName="font-headline-md text-headline-md text-primary"
        value={totalSales.value}
      />
      <KpiCard
        bodyOverride={
          <>
            {/* Matches petrokema_web_admin_2's own markup exactly: the
                number, status text and days-remaining share one baseline
                row — unlike the other 3 cards' stacked value+footer rows. */}
            <div className="flex items-baseline justify-between gap-space-xs">
              <div className="flex min-w-0 items-baseline gap-space-xs">
                <span className="font-headline-xl text-2xl text-primary md:text-headline-xl">
                  <bdi dir="ltr">
                    {formatNumber(stats.targetAchievement.percentage)}%
                  </bdi>
                </span>
                <span
                  className="font-label-md truncate text-label-md font-semibold text-secondary"
                  title={stats.targetAchievement.statusText}
                >
                  {stats.targetAchievement.statusText}
                </span>
              </div>
              <span className="font-label-sm shrink-0 whitespace-nowrap text-label-sm text-on-surface-variant">
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
