import type { EnrichedSeller } from '@/api/sellers.schema'
import {
  REP_CARD_CLIENTS_COUNT_FORMS,
  REP_CARD_CLIENTS_REGISTERED_FORMS,
  REP_CARD_INVOICES_QUARTER_FORMS,
  REP_CARD_SALES_PREFIX,
  SELLER_STATUS_LABELS,
} from '@/constants/strings'
import { cn } from '@/lib/cn'
import { arabicPlural, formatNumber, type ArabicPluralForms } from '@/lib/format'
import { formatEgyptianPhoneLocal } from '@/lib/phone'

const STATUS_DOT_CLASSES: Record<EnrichedSeller['status'], string> = {
  ACTIVE: 'bg-secondary',
  SUSPENDED: 'bg-error',
  VACATION: 'bg-outline',
}

// Bolds the digit only when one is actually shown (3+) — for 1/2 the noun
// form itself already encodes the count ("عميل واحد", "عميلان"), so there's
// no digit to bold. See src/lib/format.ts's arabicCountPhrase for the rule.
function CountedNoun({
  count,
  forms,
  strongClassName = 'text-primary',
}: {
  count: number
  forms: ArabicPluralForms
  strongClassName?: string
}) {
  const n = Math.abs(count)
  if (n <= 2) return <>{n === 1 ? forms.one : forms.two}</>
  return (
    <>
      <strong className={strongClassName}>{formatNumber(count)}</strong>{' '}
      {arabicPlural(count, forms)}
    </>
  )
}

function Avatar({
  seller,
  sizeClassName,
}: {
  seller: EnrichedSeller
  sizeClassName: string
}) {
  if (seller.photoUrl) {
    return (
      <img
        alt={seller.name}
        className={cn('rounded-lg object-cover', sizeClassName)}
        src={seller.photoUrl}
      />
    )
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg bg-primary-container font-headline-sm text-on-primary',
        sizeClassName,
      )}
    >
      {seller.name.trim().slice(0, 2)}
    </div>
  )
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
  if (selected) {
    return (
      <button
        className="relative rounded-lg bg-primary-fixed/20 p-space-md text-right ring-1 ring-secondary/40 transition-all hover:bg-primary-fixed/30"
        onClick={onSelect}
        type="button"
      >
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full', STATUS_DOT_CLASSES[seller.status])} />
          <span className="font-label-sm text-label-sm font-semibold text-on-secondary-fixed-variant">
            {SELLER_STATUS_LABELS[seller.status]}
          </span>
        </div>
        <div className="flex items-start gap-space-sm">
          <Avatar seller={seller} sizeClassName="h-12 w-12 shrink-0 shadow-xs" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-lg truncate text-label-lg font-bold text-primary">
                {seller.name}
              </span>
              {seller.code ? (
                <span className="font-label-sm rounded bg-surface-container px-1.5 py-0.5 font-mono text-label-sm text-on-surface-variant">
                  {seller.code}
                </span>
              ) : null}
            </div>
            <div className="font-body-sm mt-0.5 flex items-center gap-space-xs text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                call
              </span>
              <span dir="ltr">{formatEgyptianPhoneLocal(seller.phone)}</span>
              <span className="text-outline-variant">•</span>
              <span className="material-symbols-outlined text-[14px] text-outline">
                location_on
              </span>
              <span className="truncate">
                {seller.region ? `${seller.governorate} - ${seller.region}` : seller.governorate}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-space-sm rounded-lg bg-surface-container-lowest/80 p-2 pt-space-xs">
          <div className="font-label-sm mb-1 flex items-center justify-between text-label-sm">
            <span className="text-on-surface-variant">
              {REP_CARD_SALES_PREFIX}{' '}
              <bdi className="font-mono" dir="ltr">
                <strong className="text-primary">
                  {formatNumber(seller.monthlySales)}
                </strong>{' '}
                / {formatNumber(seller.monthlyTarget)}
              </bdi>{' '}
              ج.م
            </span>
            <span className="font-mono font-bold text-secondary">
              {seller.achievementPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-secondary"
              style={{ width: `${Math.min(100, Math.max(0, seller.achievementPercent))}%` }}
            />
          </div>
          <div className="font-label-sm mt-2 flex items-center justify-between text-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">
                storefront
              </span>
              <CountedNoun count={seller.clientsCount} forms={REP_CARD_CLIENTS_REGISTERED_FORMS} />
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">
                receipt_long
              </span>
              <CountedNoun count={seller.invoicesThisQuarter} forms={REP_CARD_INVOICES_QUARTER_FORMS} />
            </span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      className="rounded-lg bg-surface-container-low p-space-md text-right transition-all hover:bg-surface-container-high"
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-space-sm">
          <Avatar seller={seller} sizeClassName="h-11 w-11 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-lg truncate text-label-lg font-semibold text-on-surface">
                {seller.name}
              </span>
              {seller.code ? (
                <span className="font-label-sm rounded bg-surface-container-highest px-1.5 py-0.5 font-mono text-label-sm text-on-surface-variant">
                  {seller.code}
                </span>
              ) : null}
              {seller.status === 'SUSPENDED' ? (
                <span className="font-label-sm rounded bg-error-container px-1.5 py-0.5 text-label-sm text-on-error-container">
                  {SELLER_STATUS_LABELS.SUSPENDED}
                </span>
              ) : null}
            </div>
            <div className="font-body-sm mt-0.5 flex items-center gap-space-xs text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">call</span>
              <span dir="ltr">{formatEgyptianPhoneLocal(seller.phone)}</span>
              <span className="text-outline-variant">•</span>
              <span className="material-symbols-outlined text-[14px] text-outline">
                location_on
              </span>
              <span className="truncate">
                {seller.region ? `${seller.governorate} - ${seller.region}` : seller.governorate}
              </span>
            </div>
          </div>
        </div>
        <span className={cn('mt-1.5 h-2 w-2 rounded-full', STATUS_DOT_CLASSES[seller.status])} />
      </div>
      <div className="font-label-sm mt-2.5 flex items-center justify-between pt-2 text-label-sm text-on-surface-variant">
        <span>
          {seller.status === 'ACTIVE' || seller.status === 'VACATION' ? (
            <>
              {REP_CARD_SALES_PREFIX}{' '}
              <strong className="font-mono text-primary">
                {formatNumber(seller.monthlySales)} ج.م
              </strong>{' '}
              (<bdi dir="ltr">{seller.achievementPercent}%</bdi>)
            </>
          ) : (
            seller.statusNote
          )}
        </span>
        <span>
          <CountedNoun count={seller.clientsCount} forms={REP_CARD_CLIENTS_COUNT_FORMS} />
        </span>
      </div>
    </button>
  )
}
