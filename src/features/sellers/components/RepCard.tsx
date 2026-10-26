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
import { UserAvatar } from '@/components/ui/UserAvatar'

const STATUS_DOT_CLASSES: Record<EnrichedSeller['status'], string> = {
  ACTIVE: 'bg-emerald-600',
  SUSPENDED: 'bg-rose-600',
  VACATION: 'bg-amber-500',
}

const STATUS_LABEL_CLASSES: Record<EnrichedSeller['status'], string> = {
  ACTIVE: 'text-emerald-700 font-bold',
  SUSPENDED: 'rounded-full bg-error-container px-2 py-0.5 font-mono text-on-error-container font-bold',
  VACATION: 'rounded-full bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 font-bold',
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
  return (
    <UserAvatar
      alt={seller.name}
      className="shadow-xs"
      shape="rounded"
      sizeClassName={sizeClassName}
      src={seller.photoUrl}
    />
  )
}

export function RepCard({
  seller,
  selected,
  onSelect,
  onSelectInvoices,
}: {
  seller: EnrichedSeller
  selected: boolean
  onSelect: () => void
  onSelectInvoices?: () => void
}) {
  return (
    <>
      {/* Mobile Card Layout (xl:hidden) matching petrokema_admin_5 */}
      <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm transition-all hover:shadow-md xl:hidden">
        {/* Header Section: Profile, Name, Status, Quick Call */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <Avatar seller={seller} sizeClassName="h-12 w-12 rounded-full object-cover" />
              {seller.status === 'ACTIVE' && (
                <span
                  className="absolute bottom-0 start-0 h-3.5 w-3.5 rounded-full bg-[#15803d] ring-2 ring-surface-container-lowest"
                  title="متصل الآن"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1.5">
                <h3 className="font-headline-sm truncate text-headline-sm font-bold text-on-surface">
                  {seller.name}
                </h3>
                <span
                  className="material-symbols-outlined text-[16px] text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                {seller.code ? (
                  <span className="font-label-sm font-mono rounded-full bg-secondary-fixed px-2 py-0.5 text-label-sm text-on-secondary-fixed">
                    كود: {seller.code}
                  </span>
                ) : null}
                <span
                  className={cn(
                    'font-label-sm rounded-full px-2 py-0.5 text-label-sm font-semibold',
                    seller.status === 'ACTIVE'
                      ? 'bg-[#dcfce7] text-[#15803d]'
                      : seller.status === 'SUSPENDED'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-amber-100 text-amber-900 border border-amber-200 font-bold',
                  )}
                >
                  {SELLER_STATUS_LABELS[seller.status]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <a
              aria-label="اتصال هاتفي"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-transform active:scale-95 hover:bg-secondary/20"
              href={`tel:${seller.phone}`}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
            </a>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-2.5">
          <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined shrink-0 text-[16px] text-secondary">
                smartphone
              </span>
              <span className="font-medium font-mono text-primary" dir="ltr">
                {formatEgyptianPhoneLocal(seller.phone)}
              </span>
            </div>
            {seller.statusNote ? (
              <span className="font-label-sm max-w-[140px] truncate text-label-sm text-outline">
                {seller.statusNote}
              </span>
            ) : null}
          </div>
          <div className="flex items-start gap-2 border-t border-outline-variant/30 pt-1 text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined mt-0.5 shrink-0 text-[16px] text-secondary">
              location_on
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-label-sm rounded bg-surface-container px-2 py-0.5 text-label-sm font-semibold text-primary">
                محافظة {seller.governorate}
              </span>
              {seller.region && (
                <>
                  <span className="text-label-sm text-outline">•</span>
                  <span className="text-body-sm text-on-surface-variant">{seller.region}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Performance Grid: 3 columns */}
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-outline-variant/20 bg-surface-bright p-2.5 text-center">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] text-secondary">group</span>
              <span className="font-label-sm text-label-sm">العملاء</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                {formatNumber(seller.clientsCount)}
              </span>
              <span className="font-label-sm text-label-sm text-outline">عميل</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5 border-r border-l border-outline-variant/30 px-1">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                receipt_long
              </span>
              <span className="font-label-sm text-label-sm">الفواتير</span>
            </div>
            <div className="mt-0.5 flex flex-col leading-tight">
              <span className="font-label-md text-label-md font-bold text-primary">
                {formatNumber(seller.invoicesThisQuarter)} فاتورة
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] text-secondary">payments</span>
              <span className="font-label-sm text-label-sm">المبيعات</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="font-headline-sm text-headline-sm font-bold text-secondary">
                {formatNumber(seller.monthlySales)}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">ج.م</span>
            </div>
          </div>
        </div>

        {/* Target Achievement Bar */}
        <div className="rounded-lg bg-surface-container-low p-2">
          <div className="font-label-sm mb-1 flex items-center justify-between text-label-sm text-on-surface-variant">
            <span>نسبة تحقيق التارجت:</span>
            <span className="font-mono font-bold text-secondary">
              {seller.achievementPercent}% ({formatNumber(seller.monthlySales)} /{' '}
              {formatNumber(seller.monthlyTarget)} ج.م)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-secondary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, seller.achievementPercent))}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            className="font-label-md flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-[0.98]"
            onClick={onSelect}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">account_box</span>
            <span>عرض الملف الكامل</span>
          </button>
          <button
            className="font-label-md flex h-10 items-center justify-center gap-1.5 rounded-lg bg-surface-container px-3 text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-variant"
            onClick={onSelectInvoices ?? onSelect}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">
              receipt_long
            </span>
            <span>الفواتير ({formatNumber(seller.invoicesThisQuarter)})</span>
          </button>
        </div>
      </div>

      {/* Desktop Card (hidden xl:block) */}
      <div className="hidden xl:block">
        {selected ? (
          <button
            className="relative w-full rounded-lg bg-primary-fixed/20 p-space-md text-right ring-1 ring-secondary/40 transition-all hover:bg-primary-fixed/30"
            onClick={onSelect}
            type="button"
          >
            <div className="absolute left-3 top-3 flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', STATUS_DOT_CLASSES[seller.status])} />
              <span
                className={cn(
                  'font-label-sm text-label-sm font-semibold',
                  STATUS_LABEL_CLASSES[seller.status],
                )}
              >
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
            {seller.statusNote ? (
              <div className="font-label-sm mt-space-xs text-label-sm text-on-surface-variant">
                {seller.statusNote}
              </div>
            ) : null}
          </button>
        ) : (
          <button
            className="w-full rounded-lg bg-surface-container-low p-space-md text-right transition-all hover:bg-surface-container-high"
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
        )}
      </div>
    </>
  )
}
