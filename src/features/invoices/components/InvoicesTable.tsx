import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
import type { Invoice } from '@/api/invoices.schema'

interface InvoicesTableProps {
  invoices: Invoice[]
  onViewDetails: (invoice: Invoice) => void
  onAddPayment: (invoice: Invoice) => void
  onApproveOrder?: (invoice: Invoice) => void
  isApproving?: boolean
}

export function InvoicesTable({
  invoices,
  onViewDetails,
  onAddPayment,
  onApproveOrder,
  isApproving,
}: InvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-lowest p-12 text-center shadow-sm">
        <span className="material-symbols-outlined text-[48px] text-outline-variant">
          receipt_long
        </span>
        <h3 className="mt-3 font-headline-sm text-headline-sm font-bold text-primary">
          لا توجد فواتير مطابقة
        </h3>
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          جرب تغيير معايير البحث أو التصفية الحالية
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-right font-body-sm text-body-sm">
          <thead className="border-b border-surface-container-high bg-surface-container-low font-label-md text-label-md text-on-surface-variant">
            <tr>
              <th className="px-4 py-3.5">رقم الفاتورة</th>
              <th className="px-4 py-3.5">العميل والمنشأة</th>
              <th className="px-4 py-3.5">المندوب والمستودع</th>
              <th className="px-4 py-3.5">تاريخ الإصدار</th>
              <th className="px-4 py-3.5">البنود</th>
              <th className="px-4 py-3.5">المبلغ وحالة التحصيل</th>
              <th className="px-4 py-3.5">حالة الطلب</th>
              <th className="px-4 py-3.5 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            {invoices.map((invoice) => {
              const clientObj =
                typeof invoice.client === 'object' ? invoice.client : null
              const sellerObj =
                typeof invoice.seller === 'object' ? invoice.seller : null

              const clientName =
                clientObj?.organizeName || clientObj?.name || 'عميل نقدي'
              const clientCode = clientObj?.clientCode || 'CUST-—'
              const sellerName = sellerObj?.name || 'الإدارة'
              const warehouseName =
                invoice.warehouse || 'كافة المستودعات (المركزية)'

              const total = invoice.totalPrice || 0
              const paid = invoice.totalPaid || 0
              const remaining = Math.max(0, total - paid)
              const percentPaid =
                total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0

              const isPaid = remaining <= 0 || invoice.paymentStatus === 'paid'
              const isPending =
                invoice.orderStatus === 'pending' ||
                invoice.orderStatus === 'processing'
              const isCompleted = invoice.orderStatus === 'completed'
              const isCancelled = invoice.orderStatus === 'cancelled'

              const dateStr = new Date(invoice.createdAt).toLocaleDateString(
                'ar-EG',
                {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                },
              )

              return (
                <tr
                  key={invoice._id}
                  className="hover:bg-surface-container-low/50 transition-colors"
                >
                  {/* Invoice Code */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-secondary">
                        receipt
                      </span>
                      <span className="font-mono font-bold text-primary">
                        {invoice.invoiceCode}
                      </span>
                    </div>
                  </td>

                  {/* Client & Code */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">
                        {clientName}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                        {clientCode}
                      </span>
                    </div>
                  </td>

                  {/* Seller & Warehouse */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-on-surface">{sellerName}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant truncate max-w-[160px]">
                        {warehouseName}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-on-surface-variant">
                    {dateStr}
                  </td>

                  {/* Products count */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="rounded bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface">
                      {invoice.products?.length || 0} صنف
                    </span>
                  </td>

                  {/* Financials & Progress bar */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1 min-w-[140px]">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-primary">
                          {formatNumber(total)} ج.م
                        </span>
                        <span
                          className={cn(
                            'font-label-sm text-label-sm font-semibold',
                            isPaid
                              ? 'text-[#15803d]'
                              : percentPaid > 0
                                ? 'text-secondary'
                                : 'text-error',
                          )}
                        >
                          {percentPaid}% مسدد
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            isPaid
                              ? 'bg-[#15803d]'
                              : percentPaid > 0
                                ? 'bg-secondary'
                                : 'bg-error',
                          )}
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                      {!isPaid && (
                        <span className="font-label-sm text-label-sm text-outline">
                          المتبقي: {formatNumber(remaining)} ج.م
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Order Status Badge */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {isPending && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-tertiary-fixed">
                        <span className="h-1.5 w-1.5 rounded-full bg-on-tertiary-container" />
                        قيد الطلب
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-secondary-fixed">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#15803d]" />
                        تم التسليم
                      </span>
                    )}
                    {isCancelled && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-error-container">
                        <span className="h-1.5 w-1.5 rounded-full bg-error" />
                        ملغاة
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {isPending && onApproveOrder && (
                        <button
                          type="button"
                          disabled={isApproving}
                          onClick={() => onApproveOrder(invoice)}
                          title="اعتماد التوريد"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-[#15803d] hover:bg-[#15803d] hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            check_circle
                          </span>
                        </button>
                      )}

                      {!isPaid && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => onAddPayment(invoice)}
                          title="تسجيل دفعة / سند تحصيل"
                          className="flex h-8 px-2.5 items-center gap-1 rounded-lg bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim font-label-sm text-label-sm font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            payments
                          </span>
                          <span>تحصيل</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onViewDetails(invoice)}
                        title="عرض تفاصيل الفاتورة"
                        className="flex h-8 px-2.5 items-center gap-1 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container-highest font-label-sm text-label-sm font-semibold transition-colors"
                      >
                        <span>عرض</span>
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_back
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
