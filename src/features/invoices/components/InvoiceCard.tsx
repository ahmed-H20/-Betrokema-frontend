import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
import type { Invoice } from '@/api/invoices.schema'

interface InvoiceCardProps {
  invoice: Invoice
  onViewDetails: (invoice: Invoice, initialTab?: 'details' | 'paper') => void
  onAddPayment: (invoice: Invoice) => void
  onApproveOrder?: (invoice: Invoice) => void
  isApproving?: boolean
}

export function InvoiceCard({
  invoice,
  onViewDetails,
  onAddPayment,
  onApproveOrder,
  isApproving,
}: InvoiceCardProps) {
  const clientObj = typeof invoice.client === 'object' ? invoice.client : null
  const sellerObj = typeof invoice.seller === 'object' ? invoice.seller : null

  const clientDisplayName =
    clientObj?.organizeName || clientObj?.name || 'عميل نقدي عام'
  const clientCode = clientObj?.clientCode || 'CUST-—'
  const sellerDisplayName = sellerObj?.name
    ? `${sellerObj.name}${sellerObj.city || sellerObj.sector ? ` (مندوب ${sellerObj.city || sellerObj.sector})` : ''}`
    : 'الإدارة المركزية'

  const remaining = Math.max(0, invoice.totalPrice - (invoice.totalPaid || 0))
  const isPaid = remaining <= 0 || invoice.paymentStatus === 'paid'
  const isPending = invoice.orderStatus === 'pending' || invoice.orderStatus === 'processing'
  const isCompleted = invoice.orderStatus === 'completed'
  const isCancelled = invoice.orderStatus === 'cancelled'

  // Items count and text
  const itemsCount = invoice.products?.length || 0
  const itemsText =
    itemsCount > 0
      ? `${itemsCount} ${itemsCount === 1 ? 'بند' : 'بنود'} (${invoice.products
          ?.map((p) => {
            const pObj = typeof p.productId === 'object' ? p.productId : null
            return pObj?.name || 'صنف دهان'
          })
          .slice(0, 3)
          .join(' + ')}${itemsCount > 3 ? '...' : ''})`
      : 'لا توجد بنود مدخلة'

  // Format date
  const dateStr = new Date(invoice.createdAt).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="relative flex flex-col gap-3 overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm transition-all active:scale-[0.99] hover:shadow-md">
      {/* Header row: ID & Status Pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'material-symbols-outlined text-[22px]',
              isCompleted
                ? 'text-[#15803d]'
                : isPending
                  ? 'text-on-tertiary-container'
                  : isCancelled
                    ? 'text-error'
                    : 'text-secondary',
            )}
          >
            {isCompleted
              ? 'verified'
              : isPending
                ? 'receipt'
                : isCancelled
                  ? 'cancel'
                  : 'account_balance'}
          </span>
          <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary">
            {invoice.invoiceCode}#
          </span>
        </div>

        {/* Status Pill matching petrokema_admin_6 */}
        {isPending && (
          <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-1 font-label-sm text-label-sm text-on-tertiary-fixed font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-on-tertiary-container" />
            قيد الطلب
          </span>
        )}
        {isCompleted && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-2.5 py-1 font-label-sm text-label-sm text-on-secondary-fixed font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#15803d]" />
            تم التسليم والمطابقة
          </span>
        )}
        {isCancelled && (
          <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2.5 py-1 font-label-sm text-label-sm text-on-error-container font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-error" />
            ملغاة
          </span>
        )}
      </div>

      {/* Time and Date */}
      <div className="-mt-1 flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[15px]">schedule</span>
        <span>{dateStr}</span>
      </div>

      {/* Customer & Rep Details Box */}
      <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="material-symbols-outlined flex-shrink-0 text-[18px] text-on-surface-variant">
              apartment
            </span>
            <span className="font-label-lg text-label-lg font-bold text-on-surface truncate">
              {clientDisplayName}
            </span>
          </div>
          <span className="flex-shrink-0 rounded bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {clientCode}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            person_pin
          </span>
          <span className="truncate">{sellerDisplayName}</span>
        </div>

        <div className="flex items-center gap-1.5 border-t border-dashed border-outline-variant/40 pt-1 font-body-sm text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">
            inventory
          </span>
          <span className="truncate text-on-surface font-medium">
            {itemsText}
          </span>
        </div>
      </div>

      {/* Financial Breakdown & Action Bottom Row */}
      <div className="flex flex-col gap-2.5 border-t border-outline-variant/30 pt-2.5 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:pt-1">
        <div className="flex items-center justify-between sm:flex-col sm:items-start">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {isPaid ? 'الصافي المسدد' : 'إجمالي المطالبة'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline-lg text-headline-lg font-bold text-primary">
              {formatNumber(invoice.totalPrice)}
            </span>
            <span className="font-label-sm text-label-sm font-bold text-secondary">
              ج.م
            </span>
            {!isPaid && (
              <span className="mr-1 rounded bg-error-container/60 px-1.5 py-0.5 font-label-sm text-xs font-semibold text-error">
                متبقي: {formatNumber(remaining)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          {/* Quick Approve Button for Pending Orders */}
          {isPending && onApproveOrder && (
            <button
              type="button"
              disabled={isApproving}
              onClick={() => onApproveOrder(invoice)}
              className="flex-1 sm:flex-initial flex h-10 min-w-[90px] items-center justify-center gap-1.5 rounded-lg bg-surface-container-high px-3 font-label-sm sm:font-label-md text-label-sm sm:text-label-md font-semibold text-[#15803d] hover:bg-surface-container-highest transition-colors active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              <span>اعتماد</span>
            </button>
          )}

          {/* Collect Payment CTA if remaining balance > 0 and not cancelled */}
          {!isPaid && !isCancelled && (
            <button
              type="button"
              onClick={() => onAddPayment(invoice)}
              className="flex-1 sm:flex-initial flex h-10 min-w-[90px] items-center justify-center gap-1 rounded-lg bg-secondary-fixed px-3 font-label-sm sm:font-label-md text-label-sm sm:text-label-md font-semibold text-on-secondary-fixed hover:bg-secondary-fixed-dim transition-colors active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">
                payments
              </span>
              <span>تحصيل</span>
            </button>
          )}

          {/* Printable A4 Paper CTA */}
          <button
            type="button"
            onClick={() => onViewDetails(invoice, 'paper')}
            className="flex-1 sm:flex-initial flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 font-label-sm sm:font-label-md text-label-sm sm:text-label-md font-bold bg-[#002855]/10 hover:bg-[#002855]/20 text-[#002855] border border-[#002855]/20 transition-colors active:scale-95 whitespace-nowrap shadow-2xs"
            title="معاينة الفاتورة الورقية A4 والصورة"
          >
            <span className="material-symbols-outlined text-[17px]">description</span>
            <span>فاتورة A4</span>
            {invoice.invoiceImageUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="يوجد صورة معتمدة" />
            )}
          </button>

          {/* View Invoice Details CTA */}
          <button
            type="button"
            onClick={() => onViewDetails(invoice, 'details')}
            className={cn(
              'flex h-10 items-center justify-center gap-1 rounded-lg px-3 sm:px-4 font-label-sm sm:font-label-md text-label-sm sm:text-label-md font-semibold transition-colors active:scale-95 whitespace-nowrap',
              isPending && !isPaid
                ? 'w-full sm:w-auto sm:flex-initial'
                : 'flex-1 sm:flex-initial',
              isPending
                ? 'bg-primary text-on-primary shadow-sm hover:bg-primary-container'
                : 'bg-surface-container-high text-primary hover:bg-surface-container-highest',
            )}
          >
            <span>التفاصيل</span>
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}
