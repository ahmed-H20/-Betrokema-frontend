import type { ReactNode } from 'react'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  KPI_STOCK_BALANCE_LABEL,
  KPI_STOCK_BALANCE_SUBTITLE,
  KPI_TRANSFERS_ACTION_REQUIRED,
  KPI_TRANSFERS_CRITICAL_LABEL,
  KPI_WAREHOUSES_LABEL,
  PRODUCT_CODE_PLURAL_FORMS,
  TRANSFER_PENDING_PLURAL_FORMS,
  TRANSFERS_PENDING_NONE,
  WAREHOUSES_KPI_ERROR,
  WAREHOUSES_KPI_LOADING,
} from '@/constants/strings'
import { arabicCountPhrase, arabicPlural, formatNumber } from '@/lib/format'
import { useWarehouseStats } from '@/features/warehouses/hooks'

function KpiCard({
  icon,
  iconClassName,
  label,
  value,
  valueClassName = 'text-primary',
  unit,
  footer,
  accentColor = 'bg-primary/5',
  onClick,
}: {
  icon: string
  iconClassName: string
  label: string
  value: ReactNode
  valueClassName?: string
  unit?: string
  footer?: ReactNode
  accentColor?: string
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg text-right shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md font-medium text-on-surface-variant">
          {label}
        </span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </span>
      </div>
      <div className="my-space-sm">
        <div className="flex flex-wrap items-baseline gap-space-xs">
          <span className={`font-headline-xl text-2xl font-bold md:text-headline-xl ${valueClassName}`}>
            {value}
          </span>
          {unit ? (
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {unit}
            </span>
          ) : null}
        </div>
      </div>
      {footer}
      <div className={`pointer-events-none absolute -bottom-6 -left-6 h-16 w-16 rounded-full ${accentColor}`} />
    </Tag>
  )
}

export function KpiRow({ onOpenTransfers }: { onOpenTransfers: () => void }) {
  const statsQuery = useWarehouseStats()

  if (statsQuery.isLoading) {
    return <StateMessage minHeightClassName="min-h-[132px]" text={WAREHOUSES_KPI_LOADING} />
  }
  if (statsQuery.isError || !statsQuery.data) {
    return (
      <StateMessage
        minHeightClassName="min-h-[132px]"
        text={WAREHOUSES_KPI_ERROR}
        tone="error"
      />
    )
  }

  const stats = statsQuery.data
  const codePhrase = arabicCountPhrase(
    stats.stockAndChemicals.activeProductsCount,
    PRODUCT_CODE_PLURAL_FORMS,
  )
  // Plural-aware phrase only — never the backend's own pendingTransfersText,
  // which embeds the number already shown as the card's big value.
  const pendingPhrase =
    stats.transfersAndCritical.pendingTransfers === 0
      ? TRANSFERS_PENDING_NONE
      : arabicPlural(stats.transfersAndCritical.pendingTransfers, TRANSFER_PENDING_PLURAL_FORMS)

  return (
    <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        accentColor="bg-secondary/5"
        footer={
          <div className="flex items-center gap-1.5 text-label-sm font-label-sm text-secondary">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <span>{stats.warehouses.displaySummary}</span>
          </div>
        }
        icon="corporate_fare"
        iconClassName="bg-primary/10 text-primary"
        label={KPI_WAREHOUSES_LABEL}
        value={formatNumber(stats.warehouses.total)}
      />
      <KpiCard
        accentColor="bg-primary/5"
        footer={
          <div className="flex items-center gap-space-xs text-label-sm font-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary">
              verified
            </span>
            <span>{KPI_STOCK_BALANCE_SUBTITLE(codePhrase)}</span>
          </div>
        }
        icon="inventory_2"
        iconClassName="bg-primary-fixed text-on-primary-fixed"
        label={KPI_STOCK_BALANCE_LABEL}
        unit={stats.stockAndChemicals.unitLabel}
        value={formatNumber(stats.stockAndChemicals.totalUnits)}
      />
      <KpiCard
        accentColor="bg-error/5"
        footer={
          stats.transfersAndCritical.pendingTransfers > 0 ? (
            <div className="flex items-center gap-1.5 text-label-sm font-label-sm text-error">
              <span className="material-symbols-outlined text-[15px]">
                notification_important
              </span>
              <span>{KPI_TRANSFERS_ACTION_REQUIRED}</span>
            </div>
          ) : undefined
        }
        icon="swap_horiz"
        iconClassName="bg-error-container text-on-error-container"
        label={KPI_TRANSFERS_CRITICAL_LABEL}
        onClick={onOpenTransfers}
        unit={pendingPhrase}
        value={formatNumber(stats.transfersAndCritical.pendingTransfers)}
        valueClassName={
          stats.transfersAndCritical.pendingTransfers > 0 ? 'text-error' : 'text-primary'
        }
      />
    </div>
  )
}
