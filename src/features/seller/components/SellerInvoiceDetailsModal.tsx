import { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { formatNumber } from '@/lib/format'
import { toast } from 'sonner'
import { uploadInvoiceImage, updateInvoice } from '@/api/invoices'
import { captureInvoicePaperToBlob, downloadBlob } from '@/lib/invoiceCapture'
import { PrintableInvoicePaper, type PrintableInvoicePaperItem } from '@/features/invoices/components/PrintableInvoicePaper'
import { PrintablePaperFitWrapper } from '@/features/invoices/components/PrintablePaperFitWrapper'
import { openInvoicePrintWindow } from '@/lib/invoicePrint'
import type { Invoice } from '@/api/invoices.schema'

interface SellerInvoiceDetailsModalProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCollectPayment?: (invoice: Invoice) => void
  initialTab?: 'items' | 'payments' | 'paper'
}

export function SellerInvoiceDetailsModal({
  invoice,
  open,
  onOpenChange,
  onCollectPayment,
  initialTab = 'items',
}: SellerInvoiceDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'payments' | 'paper'>(initialTab)
  const [localInvoice, setLocalInvoice] = useState<Invoice | null>(invoice)
  const [isCapturing, setIsCapturing] = useState(false)
  const [paperZoomMode, setPaperZoomMode] = useState<'fit' | 'full'>('fit')
  const paperRef = useRef<HTMLDivElement>(null)
  const hiddenCaptureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalInvoice(invoice)
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [invoice, initialTab])

  const currentInvoice = localInvoice || invoice
  if (!currentInvoice) return null

  const isPaid = currentInvoice.paymentStatus === 'paid'
  const totalPaid = currentInvoice.totalPaid || 0
  const totalPrice = currentInvoice.totalPrice || 0
  const isPartial = currentInvoice.paymentStatus === 'partially_paid' || (totalPaid > 0 && !isPaid)
  const remaining = Math.max(0, totalPrice - totalPaid)
  const paidPercent =
    totalPrice > 0
      ? Math.min(100, Math.round((totalPaid / totalPrice) * 100))
      : 0

  const clientObj = typeof currentInvoice.client === 'object' && currentInvoice.client !== null ? currentInvoice.client : null
  const clientName = clientObj?.name || 'عميل نقدي'
  const clientOrg = clientObj?.organizeName || ''
  const clientPhone = clientObj?.phone || ''
  const clientAddress = clientObj?.address || clientObj?.city || 'موقع العميل'
  const sellerObj = typeof currentInvoice.seller === 'object' && currentInvoice.seller !== null ? currentInvoice.seller : null
  const sellerName = sellerObj?.name || 'مندوب المبيعات الميداني'

  // Subtotal before tax
  const taxAmount = currentInvoice.taxAmount || 0
  const subtotal = Math.max(0, totalPrice - taxAmount)

  // Map products to printable paper items
  const paperItems: PrintableInvoicePaperItem[] = (currentInvoice.products || []).map((p) => {
    const prodObj = typeof p.productId === 'object' && p.productId !== null ? (p.productId as Record<string, any>) : null
    const qty = p.quantity || 1
    const unitPrice = p.price || 0
    return {
      code: prodObj?.productCode || prodObj?.code || '',
      name: prodObj?.name || 'صنف دهانات وبويات',
      unit: p.unit || prodObj?.unit || 'عبوة',
      color: p.color || '',
      quantity: qty,
      price: unitPrice,
      totalPrice: typeof p.totalPrice === 'number' && p.totalPrice > 0 ? p.totalPrice : unitPrice * qty,
    }
  })

  const handlePrint = () => {
    if (currentInvoice?._id) {
      openInvoicePrintWindow(currentInvoice._id)
    } else {
      window.print()
    }
  }

  const handleSaveInvoiceImage = async () => {
    const targetEl = hiddenCaptureRef.current || paperRef.current
    if (!targetEl || !currentInvoice?._id) return
    setIsCapturing(true)
    try {
      const blob = await captureInvoicePaperToBlob(targetEl)
      if (!blob) throw new Error('فشل إنشاء ملف الصورة')
      const uploadedUrl = await uploadInvoiceImage(blob)
      const updated = await updateInvoice(currentInvoice._id, { invoiceImageUrl: uploadedUrl })
      setLocalInvoice(updated)
      toast.success('تم توليد وحفظ صورة الفاتورة المعتمدة بنجاح على السيرفر وربط الباركود بها! 🎉')
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'حدث خطأ أثناء حفظ صورة الفاتورة')
    } finally {
      setIsCapturing(false)
    }
  }

  const handleDownloadImage = async () => {
    setIsCapturing(true)
    try {
      const targetEl = hiddenCaptureRef.current || paperRef.current
      if (targetEl) {
        const blob = await captureInvoicePaperToBlob(targetEl)
        if (blob) {
          downloadBlob(blob, `فاتورة-بتروكيما-${currentInvoice.invoiceCode}.png`)
          toast.success('تم تنزيل صورة الفاتورة بنجاح 🎉')
          if (!currentInvoice.invoiceImageUrl && currentInvoice._id) {
            uploadInvoiceImage(blob).then((url) => {
              updateInvoice(currentInvoice._id, { invoiceImageUrl: url }).then((updated) => {
                setLocalInvoice(updated)
              })
            }).catch(console.warn)
          }
          return
        }
      }
      if (currentInvoice?.invoiceImageUrl) {
        const response = await fetch(currentInvoice.invoiceImageUrl)
        const blob = await response.blob()
        downloadBlob(blob, `فاتورة-بتروكيما-${currentInvoice.invoiceCode}.png`)
        toast.success('بدأ تنزيل صورة الفاتورة بنجاح')
      }
    } catch {
      if (currentInvoice?.invoiceImageUrl) {
        window.open(currentInvoice.invoiceImageUrl, '_blank')
      }
    } finally {
      setIsCapturing(false)
    }
  }

  const handleShareWhatsApp = () => {
    if (!clientPhone) {
      toast.error('لا يوجد رقم هاتف مسجل لهذا العميل')
      return
    }
    const cleanPhone = clientPhone.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone
    const text = encodeURIComponent(
      `مرحباً ${clientName}،\nتفاصيل فاتورة بتروكيما #${currentInvoice.invoiceCode}:\nإجمالي القيمة: ${formatNumber(currentInvoice.totalPrice)} ج.م\nالمدفوع: ${formatNumber(currentInvoice.totalPaid)} ج.م\nالمتبقي: ${formatNumber(remaining)} ج.م\nالحالة: ${isPaid ? 'مسددة بالكامل ✅' : 'متبقي للسداد ⏳'}${currentInvoice.invoiceImageUrl ? `\nرابط صورة الفاتورة الرسمية:\n${currentInvoice.invoiceImageUrl}` : ''}\nشكراً لتعاملكم معنا!`
    )
    const url = `https://wa.me/${formattedPhone}?text=${text}`
    const win = window.open(url, '_blank')
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={`fixed inset-x-0 bottom-0 z-50 flex flex-col h-[92dvh] max-h-[92dvh] sm:h-auto sm:max-h-[92vh] rounded-t-3xl bg-[#f8fafc] shadow-2xl transition-all sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full ${activeTab === 'paper' ? 'sm:max-w-4xl' : 'sm:max-w-xl'} sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl overflow-hidden`}>
          {/* Offscreen dedicated container for 100% pristine, deterministic 794px A4 capture on phone & desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed"
            style={{
              top: 0,
              left: '-9999px',
              width: '794px',
              minWidth: '794px',
              maxWidth: '794px',
              zIndex: -9999,
              visibility: 'visible',
              opacity: 1,
            }}
          >
            <div ref={hiddenCaptureRef} style={{ width: '794px', minWidth: '794px', maxWidth: '794px', background: '#ffffff' }}>
              <PrintableInvoicePaper
                invoiceCode={currentInvoice.invoiceCode}
                createdAt={currentInvoice.createdAt}
                clientName={clientName}
                clientOrganization={clientOrg}
                clientPhone={clientPhone}
                clientAddress={clientAddress}
                warehouseName={currentInvoice.warehouse || 'المستودع الرئيسي'}
                sellerName={sellerName}
                items={paperItems}
                includeVat={(currentInvoice.taxAmount || 0) > 0}
                vatRate={14}
                discountAmount={currentInvoice.discountAmount || 0}
                notes={currentInvoice.notes || ''}
                invoiceImageUrl={currentInvoice.invoiceImageUrl || ''}
              />
            </div>
          </div>

          {/* 1. Fixed Header */}
          <div className="flex items-center justify-between p-3 sm:p-5 border-b border-slate-200 bg-white shrink-0 gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold shadow-xs shrink-0">
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">receipt_long</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <Dialog.Title className="font-bold text-sm sm:text-base text-slate-900 font-mono leading-tight">
                    {currentInvoice.invoiceCode}
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
                    {isPaid ? 'مسددة' : isPartial ? 'سداد جزئي' : 'غير مسددة'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                  تاريخ الإصدار:{' '}
                  {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(
                    new Date(currentInvoice.createdAt)
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Prominent Image Button */}
              {currentInvoice.invoiceImageUrl && (
                <a
                  href={currentInvoice.invoiceImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-xs"
                  title="عرض صورة الفاتورة المعتمدة الأصلية"
                >
                  <span className="material-symbols-outlined text-[17px]">image</span>
                  <span className="hidden sm:inline">صورة الفاتورة</span>
                </a>
              )}

              {/* Toggle to Printable Paper View */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'paper' ? 'items' : 'paper')}
                className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                  activeTab === 'paper'
                    ? 'bg-[#002855] text-white border-[#002855]'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'
                }`}
                title="معاينة الفاتورة المطبوعة A4"
              >
                <span className="material-symbols-outlined text-[17px]">description</span>
                <span className="hidden sm:inline">{activeTab === 'paper' ? 'بيانات الفاتورة' : 'ورقة A4'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="طباعة الفاتورة"
              >
                <span className="material-symbols-outlined text-[17px] sm:text-[18px]">print</span>
              </button>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="إغلاق"
                >
                  <span className="material-symbols-outlined text-[19px] sm:text-[20px]">close</span>
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
            {/* Financial Overview Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 block font-medium">صافي القيمة المستحقة</span>
                    {(currentInvoice.discountAmount || 0) > 0 && (
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        خصم: -{formatNumber(currentInvoice.discountAmount || 0)} ج.م
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-orange-400">
                      {formatNumber(currentInvoice.totalPrice)}
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
                  <span>تم تحصيل {formatNumber(currentInvoice.totalPaid)} ج.م</span>
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
                  <span className="font-semibold">{currentInvoice.warehouse || 'المستودع الرئيسي'}</span>
                </div>
                {currentInvoice.dueDate && (
                  <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                    <span>
                      الاستحقاق:{' '}
                      {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(
                        new Date(currentInvoice.dueDate)
                      )}
                    </span>
                  </div>
                )}
                {currentInvoice.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                    {currentInvoice.notes}
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
                <span>الأصناف ({currentInvoice.products?.length || 0})</span>
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
                <span>التحصيلات ({currentInvoice.payments?.length || 0})</span>
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
                {currentInvoice.invoiceImageUrl && (
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
                  {currentInvoice.products && currentInvoice.products.length > 0 ? (
                    currentInvoice.products.map((p, idx) => {
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
                              {p.color && (
                                <span className="bg-blue-50 text-[#002855] px-1.5 py-0.5 rounded text-[10px] font-medium">
                                  اللون: {p.color}
                                </span>
                              )}
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
                    <span className="text-orange-600 font-mono">{formatNumber(currentInvoice.totalPrice)} ج.م</span>
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
                  {currentInvoice.payments && currentInvoice.payments.length > 0 ? (
                    currentInvoice.payments.map((pmt, idx) => (
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
                              new Date(pmt.paymentDate || currentInvoice.createdAt)
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

            {/* Tab 3: Official Printable Invoice Paper (A4) with Image controls */}
            {activeTab === 'paper' && (
              <div className="space-y-4">
                {/* Paper Controls & Image Status Banner */}
                <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#002855]">
                        verified
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        الفاتورة الورقية الرسمية المعتمدة (A4 القياسية)
                      </h4>
                    </div>
                    {currentInvoice.invoiceImageUrl ? (
                      <p className="text-[11px] sm:text-xs text-emerald-700 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[15px]">check_circle</span>
                        <span>صورة الفاتورة الأصلية محفوظة ومربوطة بباركود التحقق.</span>
                      </p>
                    ) : (
                      <p className="text-[11px] sm:text-xs text-amber-700 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[15px]">info</span>
                        <span>لم يتم حفظ صورة لهذه الفاتورة بعد. يمكنك حفظها الآن:</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mobile Zoom Toggle */}
                    <div className="flex sm:hidden items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPaperZoomMode('fit')}
                        className={`px-2 py-1 rounded-md transition-all ${
                          paperZoomMode === 'fit' ? 'bg-white text-primary shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        ملاءمة 📱
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaperZoomMode('full')}
                        className={`px-2 py-1 rounded-md transition-all ${
                          paperZoomMode === 'full' ? 'bg-white text-primary shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        100% 🔍
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isCapturing}
                      onClick={handleDownloadImage}
                      className="flex-1 sm:flex-initial h-8 sm:h-9 items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#002855] text-white text-xs font-bold transition-all shadow-xs flex"
                      title="تنزيل صورة الفاتورة الأصلية بنفس الأبعاد والبيانات على الهاتف أو الكمبيوتر"
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        {isCapturing ? 'progress_activity' : 'download'}
                      </span>
                      <span>{isCapturing ? 'جارِ المعالجة...' : 'تنزيل الصورة'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isCapturing}
                      onClick={handleSaveInvoiceImage}
                      className="flex-1 sm:flex-initial h-8 sm:h-9 items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-xs flex active:scale-95 disabled:opacity-50"
                      title="حفظ وتحديث صورة الفاتورة المعتمدة على السيرفر"
                    >
                      <span className="material-symbols-outlined text-[17px]">photo_camera</span>
                      <span>حفظ بالسيرفر</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex-1 sm:flex-initial h-8 sm:h-9 items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-xs flex active:scale-95"
                      title="فتح الفاتورة في صفحة مستقلة للطباعة A4 الرسمية"
                    >
                      <span className="material-symbols-outlined text-[17px]">print</span>
                      <span>طباعة A4</span>
                    </button>
                  </div>
                </div>

                {/* Printable Paper Render Wrapper */}
                <div className="flex justify-center p-2 sm:p-5 bg-slate-200/60 rounded-2xl border border-slate-300/80 overflow-hidden">
                  <PrintablePaperFitWrapper paperZoomMode={paperZoomMode} innerRef={paperRef}>
                    <PrintableInvoicePaper
                      invoiceCode={currentInvoice.invoiceCode}
                      createdAt={currentInvoice.createdAt}
                      clientName={clientName}
                      clientOrganization={clientOrg}
                      clientPhone={clientPhone}
                      clientAddress={clientAddress}
                      warehouseName={currentInvoice.warehouse || 'المستودع الرئيسي'}
                      sellerName={sellerName}
                      items={paperItems}
                      includeVat={(currentInvoice.taxAmount || 0) > 0}
                      vatRate={14}
                      discountAmount={currentInvoice.discountAmount || 0}
                      notes={currentInvoice.notes || ''}
                      invoiceImageUrl={currentInvoice.invoiceImageUrl || ''}
                    />
                  </PrintablePaperFitWrapper>
                </div>
              </div>
            )}
          </div>

          {/* 3. Sticky Bottom Action Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center gap-2">
            {!isPaid ? (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  onCollectPayment?.(currentInvoice)
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
                className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-200"
              >
                <span className="material-symbols-outlined text-[19px] text-slate-700">print</span>
                <span>طباعة إيصال الفاتورة المعتمدة</span>
              </button>
            )}

            {clientPhone && (
              <button
                type="button"
                onClick={handleShareWhatsApp}
                title="مشاركة عبر واتساب"
                className="h-12 px-3.5 sm:px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white flex items-center justify-center gap-1.5 text-xs font-bold transition-all shrink-0 shadow-sm shadow-emerald-500/20"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>واتساب</span>
              </button>
            )}

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
