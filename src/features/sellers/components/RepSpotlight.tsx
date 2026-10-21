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
import { resolveImageUrl } from '@/lib/image'
import { UserAvatar } from '@/components/ui/UserAvatar'

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
  onResetPassword,
}: {
  seller: Seller
  metrics: SellerPerformance['metrics']
  onEdit: () => void
  onDelete: () => void
  onResetPassword?: () => void
}) {
  const collectionRateDisplay =
    metrics.currentMonthSales === 0
      ? REP_COLLECTION_RATE_UNKNOWN
      : `${formatNumber(metrics.collectionRate)}%`

  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex flex-col justify-between gap-space-md sm:flex-row sm:items-center">
        <div className="flex items-start gap-space-md">
          <UserAvatar
            alt={seller.name}
            className="ring-2 ring-primary-fixed shadow-sm"
            shape="rounded"
            sizeClassName="h-16 w-16"
            src={seller.photoUrl}
          />
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
              <a
                className="flex items-center gap-1 font-mono hover:text-primary transition-colors"
                dir="ltr"
                href={`tel:${seller.phone}`}
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  call
                </span>
                {formatEgyptianPhoneDisplay(seller.phone)}
              </a>
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
            className="font-label-sm flex h-10 items-center gap-1 whitespace-nowrap rounded-lg bg-surface-container-high px-space-md text-label-sm text-on-surface transition-colors hover:bg-surface-container-highest xl:h-9"
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
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container-high xl:h-9 xl:w-9"
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
                className="z-50 min-w-[190px] rounded-lg bg-surface-container-lowest p-1 shadow-lg border border-outline-variant/30"
                sideOffset={4}
              >
                {onResetPassword && (
                  <DropdownMenu.Item
                    className="font-label-md flex items-center gap-2 cursor-pointer rounded-md px-3 py-2 text-label-md text-amber-800 outline-none hover:bg-amber-50 data-[highlighted]:bg-amber-50"
                    onSelect={onResetPassword}
                  >
                    <span className="material-symbols-outlined text-[18px] text-amber-600">
                      lock_reset
                    </span>
                    <span>إعادة تعيين كلمة المرور</span>
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Item
                  className="font-label-md flex items-center gap-2 cursor-pointer rounded-md px-3 py-2 text-label-md text-error outline-none data-[highlighted]:bg-error-container"
                  onSelect={onDelete}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                  <span>{DELETE_SELLER_BUTTON}</span>
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

      {/* Target Achievement Meter matching petrokema_admin_7 */}
      <div className="rounded-lg bg-surface-container-low p-3">
        <div className="font-label-sm mb-1.5 flex items-center justify-between text-label-sm text-on-surface-variant">
          <span className="flex items-center gap-1 font-semibold text-primary">
            <span className="material-symbols-outlined text-[16px] text-secondary">
              track_changes
            </span>
            <span>نسبة تحقيق المستهدف الشهري:</span>
          </span>
          <span className="font-mono font-bold text-secondary">
            {formatNumber(metrics.achievementRate)}% ({formatNumber(metrics.currentMonthSales)} /{' '}
            {formatNumber(seller.monthlyTarget)} ج.م)
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container">
          <div
            className="h-full rounded-full bg-gradient-to-l from-secondary to-primary-container transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, metrics.achievementRate))}%` }}
          />
        </div>
      </div>
    </div>
  )
}
