import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Seller } from '@/api/sellers.schema'
import type { SellerPerformance } from '@/api/sellers.schema'
import {
  DELETE_SELLER_BUTTON,
  REP_CERTIFIED_SINCE,
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
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex flex-col justify-between gap-space-md sm:flex-row sm:items-center">
        <div className="flex items-start gap-space-md">
          {seller.photoUrl ? (
            <img
              alt={seller.name}
              className="h-16 w-16 rounded-xl object-cover ring-2 ring-primary-fixed"
              src={seller.photoUrl}
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-container font-headline-md text-headline-md text-on-primary ring-2 ring-primary-fixed">
              {seller.name.trim().slice(0, 2)}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="font-headline-md text-headline-md font-bold text-primary">
                {seller.name}
              </span>
              {seller.code ? (
                <span className="font-label-sm rounded bg-primary-container px-2 py-0.5 font-mono text-label-sm text-on-primary">
                  {seller.code}
                </span>
              ) : null}
              {seller.title ? (
                <span className="font-label-sm rounded-full bg-secondary-fixed px-2 py-0.5 text-label-sm font-semibold text-on-secondary-fixed-variant">
                  {seller.sector ? `${seller.title} - ${seller.sector}` : seller.title}
                </span>
              ) : null}
            </div>
            <div className="font-body-sm mt-1 flex flex-wrap items-center gap-space-md text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  location_on
                </span>
                {seller.region
                  ? `${seller.governorate} • ${seller.region}`
                  : seller.governorate}
              </span>
              <span className="flex items-center gap-1 font-mono" dir="ltr">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  call
                </span>
                {formatEgyptianPhoneDisplay(seller.phone)}
              </span>
              {seller.certifiedSince ? (
                <span className="flex items-center gap-1 font-semibold text-secondary">
                  <span className="material-symbols-outlined text-[16px]">
                    verified
                  </span>
                  {REP_CERTIFIED_SINCE(seller.certifiedSince)}
                </span>
              ) : null}
            </div>
            {seller.status !== 'ACTIVE' ? (
              <span className="font-label-sm mt-1 inline-block w-fit rounded-full bg-error-container px-2 py-0.5 text-label-sm text-on-error-container">
                {SELLER_STATUS_LABELS[seller.status]}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-space-xs self-end sm:self-auto">
          <button
            className="font-label-sm flex h-9 items-center gap-1 rounded-lg bg-surface-container-high px-space-md text-label-sm text-on-surface transition-colors hover:bg-surface-container-highest"
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
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container-high"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
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
