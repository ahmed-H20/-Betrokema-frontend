import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { formatNumber } from '@/lib/format'
import { toast } from 'sonner'
import type { Invoice } from '@/api/invoices.schema'

interface SellerInvoiceDetailsModalProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCollectPayment?: (invoice: Invoice) => void
}

export function SellerInvoiceDetailsModal({
  invoice,
  open,
  onOpenChange,
  onCollectPayment,
}: SellerInvoiceDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'payments'>('items')

  if (!invoice) return null

  const isPaid = invoice.paymentStatus === 'paid'
  const isPartial = invoice.paymentStatus === 'partially_paid' || (invoice.totalPaid > 0 && !isPaid)
  const remaining = Math.max(0, invoice.totalPrice - invoice.totalPaid)
  const paidPercent =
    invoice.totalPrice > 0
      ? Math.min(100, Math.round((invoice.totalPaid / invoice.totalPrice) * 100))
      : 0

  const clientObj = typeof invoice.client === 'object' && invoice.client !== null ? invoice.client : null
  const clientName = clientObj?.name || 'عميل نقدي'
  const clientOrg = clientObj?.organizeName || ''
  const clientPhone = clientObj?.phone || ''
  const clientAddress = clientObj?.address || clientObj?.city || 'موقع العميل'

  // Subtotal before tax
  const taxAmount = invoice.taxAmount || 0
  const subtotal = invoice.totalPrice - taxAmount

  const handlePrint = () => {
    window.print()
  }

  const handleShareWhatsApp = () => {
    if (!clientPhone) {
      toast.error('لا يوجد رقم هاتف مسجل لهذا العميل')
      return
    }
    const cleanPhone = clientPhone.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone
    const text = encodeURIComponent(
      `مرحباً ${clientName}،\nتفاصيل فاتورة بتروكيما #${invoice.invoiceCode}:\nإجمالي القيمة: ${formatNumber(invoice.totalPrice)} ج.م\nالمدفوع: ${formatNumber(invoice.totalPaid)} ج.م\nالمتبقي: ${formatNumber(remaining)} ج.م\nالحالة: ${isPaid ? 'مسددة بالكامل ✅' : 'متبقي للسداد ⏳'}\nشكراً لتعاملكم معنا!`
    )
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[94vh] sm:max-h-[90vh] rounded-t-3xl bg-[#f8fafc] shadow-2xl transition-all sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl overflow-hidden">
          {/* 1. Fixed Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold shadow-xs">
                <span className="material-symbols-outlined text-[22px]">receipt_long</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Dialog.Title className="font-bold text-base text-slate-900 font-mono leading-tight">
                    {invoice.invoiceCode}
                  </Dialog.Title>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isPartial
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {isPaid ? 'مسددة بالكامل' : isPartial ? 'سداد جزئي' : 'غير مسددة'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  تاريخ الإصدار:{' '}
                  {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(
                    new Date(invoice.createdAt)
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrint}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="طباعة الفاتورة"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
              </button>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="إغلاق"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Financial Overview Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">صافي القيمة المستحقة</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-orange-400">
                      {formatNumber(invoice.totalPrice)}
                    </span>
                    <span className="text-xs text-slate-400">ج.م</span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-xs text-slate-400 block font-medium">المتبقي للتحصيل</span>
                  <span className={`text-base font-bold ${remaining > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatNumber(remaining)} ج.م
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1 border-t border-slate-700/80">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>تم تحصيل {formatNumber(invoice.totalPaid)} ج.م</span>
                  <span className="font-semibold text-orange-300">{paidPercent}%</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Client and Warehouse Details */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] font-medium">بيانات العميل:</span>
                <span className="font-bold text-slate-900 block text-sm">{clientName}</span>
                {clientOrg && <span className="text-slate-600 block">{clientOrg}</span>}
                {clientPhone && (
                  <span className="text-slate-500 font-mono block mt-0.5" dir="ltr">
                    {clientPhone}
                  </span>
                )}
                <span className="text-slate-400 block text-[11px]">{clientAddress}</span>
              </div>

              <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-3">
                <span className="text-slate-400 block text-[10px] font-medium">تفاصيل التوريد:</span>
                <div className="flex items-center gap-1.5 text-slate-700 mt-1">
                  <span className="material-symbols-outlined text-[16px] text-orange-600">warehouse</span>
                  <span className="font-semibold">{invoice.warehouse || 'المستودع الرئيسي'}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                    <span>
                      الاستحقاق:{' '}
                      {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(
                        new Date(invoice.dueDate)
                      )}
                    </span>
                  </div>
                )}
                {invoice.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                    {invoice.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Navigation Tabs (Items vs Payments) */}
            <div className="flex rounded-xl bg-slate-200/70 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('items')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'items'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">format_paint</span>
                <span>الأصناف والمنتجات ({invoice.products?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'payments'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">payments</span>
                <span>سندات التحصيل ({invoice.payments?.length || 0})</span>
              </button>
            </div>

            {/* Tab 1: Products Table */}
            {activeTab === 'items' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>بيان الأصناف المطلوبة</span>
                  <span>الكمية × السعر</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {invoice.products && invoice.products.length > 0 ? (
                    invoice.products.map((p, idx) => {
                      const pObj =
                        typeof p.productId === 'object' && p.productId !== null
                          ? (p.productId as Record<string, any>)
                          : null
                      const pName = pObj?.name ? String(pObj.name) : 'منتج دهانات وبويات'
                      const pCode = pObj?.code
                        ? String(pObj.code)
                        : pObj?.sku
                          ? String(pObj.sku)
                          : 'SKU-00'
                      const unit = p.unit || 'عبوة'

                      return (
                        <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{pName}</span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                {pCode}
                              </span>
                              <span>
                                {p.quantity} {unit} × {formatNumber(p.price)} ج.م
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900 font-mono text-sm shrink-0">
                            {formatNumber(p.totalPrice || p.quantity * p.price)} ج.م
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                      لا توجد تفاصيل أصناف مسجلة
                    </div>
                  )}
                </div>

                {/* Subtotals & Taxes */}
                <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>إجمالي الأصناف:</span>
                    <span className="font-semibold text-slate-800">{formatNumber(subtotal)} ج.م</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>ضريبة القيمة المضافة (14% VAT):</span>
                      <span className="font-semibold">{formatNumber(taxAmount)} ج.م</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                    <span>صافي الفاتورة الكلي:</span>
                    <span className="text-orange-600 font-mono">{formatNumber(invoice.totalPrice)} ج.م</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Payments History */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>سجل سندات القبض المعتمدة</span>
                  <span>المبلغ المحصل</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {invoice.payments && invoice.payments.length > 0 ? (
                    invoice.payments.map((pmt, idx) => (
                      <div key={pmt._id || idx} className="p-3.5 flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-slate-900">
                              {pmt.referenceNumber || `سند #${idx + 1}`}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                              {pmt.paymentMethod === 'instapay'
                                ? 'إنستاباي'
                                : pmt.paymentMethod === 'cash'
                                  ? 'نقداً'
                                  : pmt.paymentMethod === 'wallet'
                                    ? 'محفظة كاش'
                                    : 'تحويل بنكي'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            المستلم: {pmt.receiverName || 'المندوب الميداني'} •{' '}
                            {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(
                              new Date(pmt.paymentDate || invoice.createdAt)
                            )}
                          </p>
                          {pmt.notes && <p className="text-[10px] text-slate-400">{pmt.notes}</p>}
                        </div>
                        <span className="font-bold text-emerald-600 font-mono text-sm shrink-0">
                          {formatNumber(pmt.amount)} ج.م
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                      <span className="material-symbols-outlined text-[28px] text-slate-300 block">
                        payments
                      </span>
                      <span>لم يتم تسجيل أي سندات سداد على هذه الفاتورة بعد</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. Sticky Bottom Action Bar */}
          <div className="p-4 sm:p-5 pt-3 border-t border-slate-200 bg-white/95 backdrop-blur-md shrink-0 pb-[calc(1.2rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center gap-2">
            {!isPaid ? (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  onCollectPayment?.(invoice)
                }}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 hover:from-orange-800 hover:to-orange-600 active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                <span>تحصيل دفعة وسند قبض</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>طباعة إيصال الفاتورة المعتمدة</span>
              </button>
            )}

            {clientPhone && (
              <button
                type="button"
                onClick={handleShareWhatsApp}
                title="مشاركة عبر واتساب"
                className="h-12 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>
            )}

            <Dialog.Close asChild>
              <button
                type="button"
                className="px-4 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-all shrink-0"
              >
                إغلاق
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
