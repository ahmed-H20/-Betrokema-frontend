import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { formatNumber } from '@/lib/format'
import { PrintableInvoicePaper, type PrintableInvoicePaperItem } from '@/features/invoices/components/PrintableInvoicePaper'
import type { Invoice } from '@/api/invoices.schema'

interface ClientInvoiceDetailsModalProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: 'items' | 'payments' | 'paper'
}

export function ClientInvoiceDetailsModal({
  invoice,
  open,
  onOpenChange,
  initialTab = 'items',
}: ClientInvoiceDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'payments' | 'paper'>(initialTab)

  if (!invoice) return null

  const isPaid = invoice.paymentStatus === 'paid'
  const isPartial = invoice.paymentStatus === 'partially_paid' || (invoice.totalPaid > 0 && !isPaid)
  const remaining = Math.max(0, invoice.totalPrice - invoice.totalPaid)
  const paidPercent =
    invoice.totalPrice > 0
      ? Math.min(100, Math.round((invoice.totalPaid / invoice.totalPrice) * 100))
      : 0

  const clientObj = typeof invoice.client === 'object' && invoice.client !== null ? invoice.client : null
  const clientName = clientObj?.name || 'عميل معتمد'
  const clientOrg = clientObj?.organizeName || ''
  const clientPhone = clientObj?.phone || ''
  const clientAddress = clientObj?.address || clientObj?.city || ''

  const sellerObj =
    typeof invoice.seller === 'object' && invoice.seller !== null
      ? (invoice.seller as Record<string, any>)
      : null
  const sellerName = sellerObj?.name || 'إدارة مبيعات بتروكيما'
  const sellerPhone = sellerObj?.phone || ''
  const sellerSector = sellerObj?.sector || ''

  // Subtotal before tax
  const taxAmount = invoice.taxAmount || 0
  const subtotal = invoice.totalPrice - taxAmount

  // Map products to printable paper items
  const paperItems: PrintableInvoicePaperItem[] = (invoice.products || []).map((p) => {
    const prodObj = typeof p.productId === 'object' && p.productId !== null ? (p.productId as Record<string, any>) : null
    return {
      code: prodObj?.productCode || prodObj?.code || '',
      name: prodObj?.name || 'صنف دهانات وبويات',
      unit: p.unit || prodObj?.unit || 'عبوة',
      quantity: p.quantity,
      price: p.price,
      totalPrice: p.totalPrice || p.price * p.quantity,
    }
  })

  const handlePrint = () => {
    window.print()
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🔹 تفاصيل فاتورة بتروكيما #${invoice.invoiceCode} 🔹\n` +
      `📅 التاريخ: ${new Date(invoice.createdAt).toLocaleDateString('ar-EG')}\n` +
      `🏢 المستودع: ${invoice.warehouse || 'المستودع الرئيسي'}\n` +
      `💰 إجمالي الفاتورة: ${formatNumber(invoice.totalPrice)} ج.م\n` +
      `💵 المسدد: ${formatNumber(invoice.totalPaid)} ج.م\n` +
      `⏳ المتبقي: ${formatNumber(remaining)} ج.م\n` +
      `🏷️ حالة الفاتورة: ${isPaid ? 'مسددة بالكامل ✅' : isPartial ? 'سداد جزئي ⏳' : 'غير مسددة (آجلة) ⚠️'}`
    )
    const url = `https://wa.me/?text=${text}`
    const win = window.open(url, '_blank')
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url
    }
  }

  const handleContactSeller = () => {
    if (!sellerPhone) return
    let clean = sellerPhone.replace(/\D/g, '')
    if (clean.startsWith('0')) clean = '2' + clean
    const text = encodeURIComponent(
      `مرحباً يا فندم، بخصوص فاتورتي رقم #${invoice.invoiceCode} بقيمة ${formatNumber(invoice.totalPrice)} ج.م.`
    )
    const url = `https://wa.me/${clean}?text=${text}`
    const win = window.open(url, '_blank')
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={`fixed inset-x-0 bottom-0 z-50 flex flex-col h-[90dvh] max-h-[90dvh] sm:h-auto sm:max-h-[92vh] rounded-t-3xl bg-[#f8fafc] shadow-2xl transition-all sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full ${activeTab === 'paper' ? 'sm:max-w-4xl' : 'sm:max-w-xl'} sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl overflow-hidden`}>
          {/* 1. Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold shadow-xs">
                <span className="material-symbols-outlined text-[22px]">receipt_long</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
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
                    {isPaid ? 'مسددة بالكامل' : isPartial ? 'سداد جزئي' : 'غير مسددة (آجلة)'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      invoice.orderStatus === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : invoice.orderStatus === 'processing'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : invoice.orderStatus === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {invoice.orderStatus === 'completed'
                      ? 'تم التوريد والتسليم'
                      : invoice.orderStatus === 'processing'
                        ? 'قيد التجهيز والتعبئة'
                        : invoice.orderStatus === 'cancelled'
                          ? 'ملغاة'
                          : 'قيد المراجعة'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  تاريخ الإصدار:{' '}
                  {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(
                    new Date(invoice.createdAt)
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {invoice.invoiceImageUrl && (
                <a
                  href={invoice.invoiceImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-xs"
                  title="عرض صورة الفاتورة المعتمدة الأصلية"
                >
                  <span className="material-symbols-outlined text-[18px]">image</span>
                  <span className="hidden sm:inline">صورة الفاتورة</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'paper' ? 'items' : 'paper')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                  activeTab === 'paper'
                    ? 'bg-[#002855] text-white border-[#002855]'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'
                }`}
                title="معاينة الفاتورة المطبوعة A4"
              >
                <span className="material-symbols-outlined text-[18px]">description</span>
                <span className="hidden sm:inline">{activeTab === 'paper' ? 'بيانات الفاتورة' : 'فاتورة A4'}</span>
              </button>
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
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
            {/* Financial Overview Card */}
            <div className="bg-gradient-to-r from-[#0b1d33] via-[#0f294a] to-[#0b1d33] rounded-2xl p-4 text-white shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-300 block font-medium">صافي قيمة الفاتورة</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-orange-400 font-mono">
                      {formatNumber(invoice.totalPrice)}
                    </span>
                    <span className="text-xs text-slate-300">ج.م</span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-xs text-slate-300 block font-medium">المتبقي للسداد</span>
                  <span className={`text-base font-bold font-mono ${remaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {formatNumber(remaining)} ج.م
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1 border-t border-slate-700/80">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>تم سداد {formatNumber(invoice.totalPaid)} ج.م</span>
                  <span className="font-semibold text-orange-300">{paidPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Warehouse & Seller Details */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] font-medium">المندوب المعتمد للمتابعة:</span>
                <span className="font-bold text-slate-900 block text-sm">{sellerName}</span>
                {sellerSector && <span className="text-slate-500 block text-[11px]">{sellerSector}</span>}
                {sellerPhone && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleContactSeller}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold transition-colors text-[11px]"
                    >
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      <span>تواصل واتساب</span>
                    </button>
                    <span className="text-slate-500 font-mono text-[11px]" dir="ltr">
                      {sellerPhone}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-3">
                <span className="text-slate-400 block text-[10px] font-medium">تفاصيل الشحن والتوريد:</span>
                <div className="flex items-center gap-1.5 text-slate-700 mt-1">
                  <span className="material-symbols-outlined text-[16px] text-orange-600">warehouse</span>
                  <span className="font-semibold">{invoice.warehouse || 'المستودع الرئيسي'}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                    <span>
                      تاريخ الاستحقاق:{' '}
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

            {/* Navigation Tabs (Items vs Payments vs Paper) */}
            <div className="flex rounded-xl bg-slate-200/70 p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('items')}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'items'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">format_paint</span>
                <span>الأصناف ({invoice.products?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'payments'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">payments</span>
                <span>سندات السداد ({invoice.payments?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paper')}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'paper'
                    ? 'bg-[#002855] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 bg-white/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                <span>📄 الفاتورة A4</span>
                {invoice.invoiceImageUrl && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" title="يوجد صورة معتمدة" />
                )}
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
                      لا توجد أصناف مدرجة في الفاتورة
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
                  <span>سجل الإيصالات وسندات السداد</span>
                  <span>المبلغ المسدد</span>
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
                            المستلم: {pmt.receiverName || 'المندوب / الخزينة'} •{' '}
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
                      {remaining > 0 && (
                        <p className="text-[11px] text-amber-600 font-semibold pt-1">
                          المتبقي للسداد: {formatNumber(remaining)} ج.م
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Official Printable Invoice Paper (A4) */}
            {activeTab === 'paper' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#002855]">
                        verified
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">
                        الفاتورة الورقية الرسمية المعتمدة (A4)
                      </h4>
                    </div>
                    {invoice.invoiceImageUrl ? (
                      <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>صورة الفاتورة المعتمدة محفوظة ومربوطة بباركود الفاتورة.</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span>معاينة الفاتورة الرسمية المعتمدة الصادرة من شركة بتروكيما.</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {invoice.invoiceImageUrl && (
                      <a
                        href={invoice.invoiceImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        <span>فتح الصورة الأصلية</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#002855] hover:bg-[#001f42] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">print</span>
                      <span>طباعة A4</span>
                    </button>
                  </div>
                </div>

                {/* Printable Paper Render Wrapper */}
                <div className="overflow-x-auto flex justify-center p-3 sm:p-5 bg-slate-200/60 rounded-2xl border border-slate-300/80">
                  <div className="w-[794px] min-w-[700px] bg-white shadow-xl rounded-lg overflow-hidden shrink-0">
                    <PrintableInvoicePaper
                      invoiceCode={invoice.invoiceCode}
                      createdAt={invoice.createdAt}
                      clientName={clientName}
                      clientOrganization={clientOrg}
                      clientPhone={clientPhone}
                      clientAddress={clientAddress}
                      warehouseName={invoice.warehouse || 'المستودع الرئيسي'}
                      sellerName={sellerName}
                      items={paperItems}
                      includeVat={(invoice.taxAmount || 0) > 0}
                      vatRate={14}
                      discountAmount={0}
                      notes={invoice.notes || ''}
                      invoiceImageUrl={invoice.invoiceImageUrl || ''}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Bottom Action Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-200"
            >
              <span className="material-symbols-outlined text-[19px] text-slate-700">print</span>
              <span>طباعة الفاتورة</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              title="مشاركة الفاتورة عبر واتساب"
              className="h-12 px-3.5 sm:px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white flex items-center justify-center gap-1.5 text-xs font-bold transition-all shrink-0 shadow-sm shadow-emerald-500/20"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>مشاركة واتساب</span>
            </button>

            <Dialog.Close asChild>
              <button
                type="button"
                className="px-3.5 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all shrink-0 border border-slate-200"
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
