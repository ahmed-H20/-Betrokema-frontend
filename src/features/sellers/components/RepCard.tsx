import type { EnrichedSeller } from '@/api/sellers.schema'
import {
  REP_CARD_CLIENTS_COUNT,
  REP_CARD_SALES_PREFIX,
  SELLER_STATUS_LABELS,
} from '@/constants/strings'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'

const STATUS_DOT_CLASSES: Record<EnrichedSeller['status'], string> = {
  ACTIVE: 'bg-emerald-500',
  SUSPENDED: 'bg-error',
  VACATION: 'bg-slate-400',
}

export function RepCard({
  seller,
  selected,
  onSelect,
}: {
  seller: EnrichedSeller
  selected: boolean
  onSelect: () => void
}) {
  const initials = seller.name.trim().slice(0, 2)

  return (
    <button
      className={cn(
        'flex w-full flex-col gap-3 rounded-xl p-4 text-right transition-all',
        selected
          ? 'bg-primary-container shadow-sm'
          : 'bg-surface-container-lowest hover:bg-surface-container-low',
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center gap-3">
        {seller.photoUrl ? (
          <img
            alt={seller.name}
            className="h-11 w-11 rounded-full object-cover"
            src={seller.photoUrl}
          />
        ) : (
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full font-label-lg text-label-lg',
              selected
                ? 'bg-on-primary text-primary'
                : 'bg-surface-container-high text-primary',
            )}
          >
            {initials}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                STATUS_DOT_CLASSES[seller.status],
              )}
            />
            <span
              className={cn(
                'font-label-lg truncate text-label-lg font-semibold',
                selected ? 'text-on-primary-container' : 'text-on-surface',
              )}
            >
              {seller.name}
            </span>
          </div>
          <span
            className={cn(
              'font-label-sm block truncate text-label-sm',
              selected ? 'text-on-primary-container' : 'text-on-surface-variant',
            )}
          >
            {seller.status === 'ACTIVE'
              ? `${seller.title} · ${seller.governorate}`
              : `${SELLER_STATUS_LABELS[seller.status]}${
                  seller.statusNote ? ` — ${seller.statusNote}` : ''
                }`}
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high/60">
        <div
          className="h-full rounded-full bg-secondary"
          style={{ width: `${Math.min(100, Math.max(0, seller.achievementPercent))}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'font-label-sm text-label-sm',
            selected ? 'text-on-primary-container' : 'text-on-surface-variant',
          )}
        >
          {REP_CARD_SALES_PREFIX} {formatNumber(seller.monthlySales)} ج.م
        </span>
        <span
          className={cn(
            'font-label-sm rounded-full px-2 py-0.5 text-label-sm',
            selected
              ? 'bg-on-primary/20 text-on-primary-container'
              : 'bg-surface-container-highest text-on-surface-variant',
          )}
        >
          {REP_CARD_CLIENTS_COUNT(formatNumber(seller.clientsCount))}
        </span>
      </div>
    </button>
  )
}
