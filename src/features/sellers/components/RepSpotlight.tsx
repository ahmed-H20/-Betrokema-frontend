import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Seller } from '@/api/sellers.schema'
import type { SellerPerformance } from '@/api/sellers.schema'
import {
  DELETE_SELLER_BUTTON,
  REP_COLLECTION_RATE_UNKNOWN,
  REP_EDIT_BUTTON,
  REP_METRIC_ACHIEVEMENT,
  REP_METRIC_COLLECTION,
  REP_METRIC_COMMISSION,
  REP_METRIC_CURRENT_SALES,
  REP_MORE_ACTIONS_LABEL,
  SELLER_STATUS_LABELS,
} from '@/constants/strings'
import { formatEgyptianPhoneDisplay } from '@/lib/phone'
import { formatNumber } from '@/lib/format'

function MetricBox({
  label,
  value,
  valueClassName = 'text-on-surface',
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex flex-col px-space-xs">
      <span className="font-label-sm text-label-sm text-on-surface-variant">
        {label}
      </span>
      <span
        className={`font-headline-sm mt-0.5 font-mono text-headline-sm ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  )
}

export function RepSpotlight({
  seller,
  metrics,
  onEdit,
  onDelete,
}: {
  seller: Seller
  metrics: SellerPerformance['metrics']
  onEdit: () => void
  onDelete: () => void
}) {
  const collectionRateDisplay =
    metrics.currentMonthSales === 0
      ? REP_COLLECTION_RATE_UNKNOWN
      : `${formatNumber(metrics.collectionRate)}%`

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {seller.photoUrl ? (
            <img
              alt={seller.name}
              className="h-14 w-14 rounded-full object-cover"
              src={seller.photoUrl}
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container font-headline-md text-headline-md text-on-primary">
              {seller.name.trim().slice(0, 2)}
            </div>
          )}
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-primary">
              {seller.sector ? `${seller.name} - ${seller.sector}` : seller.name}
            </h2>
            <div className="font-label-md flex items-center gap-2 text-label-md text-on-surface-variant">
              <bdi dir="ltr">{formatEgyptianPhoneDisplay(seller.phone)}</bdi>
              <span>·</span>
              <span>
                {seller.region
                  ? `${seller.governorate} • ${seller.region}`
                  : seller.governorate}
              </span>
            </div>
            {seller.status !== 'ACTIVE' ? (
              <span className="font-label-sm mt-1 inline-block rounded-full bg-error-container px-2 py-0.5 text-label-sm text-on-error-container">
                {SELLER_STATUS_LABELS[seller.status]}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="font-label-md flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3.5 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
            onClick={onEdit}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            {REP_EDIT_BUTTON}
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                aria-label={REP_MORE_ACTIONS_LABEL}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  more_vert
                </span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="z-50 min-w-[180px] rounded-lg bg-surface-container-lowest p-1 shadow-lg"
                sideOffset={4}
              >
                <DropdownMenu.Item
                  className="font-label-md cursor-pointer rounded-md px-3 py-2 text-label-md text-error outline-none data-[highlighted]:bg-error-container"
                  onSelect={onDelete}
                >
                  {DELETE_SELLER_BUTTON}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-space-sm rounded-lg bg-surface-container-low p-space-sm sm:grid-cols-4">
        <MetricBox
          label={REP_METRIC_CURRENT_SALES}
          value={`${formatNumber(metrics.currentMonthSales)} ج.م`}
          valueClassName="text-primary"
        />
        <MetricBox
          label={REP_METRIC_ACHIEVEMENT}
          value={`${formatNumber(metrics.achievementRate)}%`}
          valueClassName="text-secondary"
        />
        <MetricBox
          label={REP_METRIC_COMMISSION}
          value={`${formatNumber(metrics.commissionAmount)} ج.م`}
        />
        <MetricBox label={REP_METRIC_COLLECTION} value={collectionRateDisplay} />
      </div>
    </div>
  )
}
