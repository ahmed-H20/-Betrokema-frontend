import { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { formatNumber } from '@/lib/format'
import { toast } from 'sonner'
import { uploadInvoiceImage, updateInvoice } from '@/api/invoices'
import { captureInvoicePaperToBlob, downloadBlob } from '@/lib/invoiceCapture'
import { PrintableInvoicePaper, type PrintableInvoicePaperItem } from '@/features/invoices/components/PrintableInvoicePaper'
import { PrintablePaperFitWrapper } from '@/features/invoices/components/PrintablePaperFitWrapper'
import { openInvoicePrintWindow } from '@/lib/invoicePrint'
import type { Invoice, OrderStatus } from '@/api/invoices.schema'

interface InvoiceDetailsModalProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
  onAddPayment: (invoice: Invoice) => void
  onUpdateStatus?: (invoice: Invoice, status: OrderStatus) => void
  isUpdatingStatus?: boolean
  initialTab?: 'details' | 'paper'
}

export function InvoiceDetailsModal({
  invoice,
  isOpen,
  onClose,
  onAddPayment,
  onUpdateStatus,
  isUpdatingStatus,
  initialTab = 'details',
}: InvoiceDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'paper'>(initialTab)
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

  if (!isOpen || !invoice) return null
  const currentInvoice = localInvoice || invoice

  const clientObj = typeof currentInvoice.client === 'object' ? currentInvoice.client : null
  const sellerObj = typeof currentInvoice.seller === 'object' ? currentInvoice.seller : null

  const clientName = clientObj?.organizeName || clientObj?.name || 'عميل نقدي'
  const clientCode = clientObj?.clientCode || 'CUST-—'
  const clientPhone = clientObj?.phone || '—'
  const clientAddress = clientObj?.address || clientObj?.city || '—'

  const sellerName = sellerObj?.name || 'الإدارة المركزية'
  const sellerPhone = sellerObj?.phone || '—'

  const total = currentInvoice.totalPrice || 0
  const paid = currentInvoice.totalPaid || 0
  const remaining = Math.max(0, total - paid)
  const percentPaid = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
  const isFullyPaid = remaining <= 0

  const isPending = currentInvoice.orderStatus === 'pending' || currentInvoice.orderStatus === 'processing'
  const isCompleted = currentInvoice.orderStatus === 'completed'
  const isCancelled = currentInvoice.orderStatus === 'cancelled'

  // Map products to printable paper items
  const paperItems: PrintableInvoicePaperItem[] = (currentInvoice.products || []).map((p) => {
    const prodObj = typeof p.productId === 'object' && p.productId !== null ? (p.productId as Record<string, any>) : null
    const qty = p.quantity || 1
    const unitPrice = p.price || 0
    return {
      code: prodObj?.productCode || prodObj?.code || '',
      name: prodObj?.name || 'صنف دهانات وبويات',
      unit: p.unit || prodObj?.unit || 'عبوة',
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
          toast.success('تم تنزيل صورة الفاتورة فائقة الدقة بنجاح 🎉')
          // Persist image to server if missing
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
        toast.success('تم تنزيل صورة الفاتورة بنجاح')
      }
    } catch {
      if (currentInvoice?.invoiceImageUrl) {
        window.open(currentInvoice.invoiceImageUrl, '_blank')
      }
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-primary/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={`fixed inset-0 z-[70] flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-surface-container-lowest shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[92vh] ${activeTab === 'paper' ? 'md:max-w-4xl' : 'md:max-w-3xl'} md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl`}>
          <Dialog.Title className="sr-only">تفاصيل الفاتورة {currentInvoice.invoiceCode}</Dialog.Title>
          <Dialog.Description className="sr-only">عرض بنود وتفاصيل الفاتورة وحالة التحصيل</Dialog.Description>
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
                clientOrganization={clientObj?.organizeName || ''}
                clientPhone={clientPhone}
                clientAddress={clientAddress}
                warehouseName={currentInvoice.warehouse || 'المستودع الرئيسي'}
                sellerName={sellerName}
                items={paperItems}
                includeVat={(currentInvoice.taxAmount || 0) > 0}
                vatRate={14}
                discountAmount={0}
                notes={currentInvoice.notes || ''}
                invoiceImageUrl={currentInvoice.invoiceImageUrl || ''}
              />
            </div>
          </div>

          {/* Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-surface-container-high bg-surface-container-lowest px-3 sm:px-6 py-2.5 sm:py-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary">
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
                  receipt
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="font-headline-sm text-sm sm:text-headline-sm font-bold text-primary font-mono leading-tight">
                    {currentInvoice.invoiceCode}
                  </h2>
                  {isPending && (
                    <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 font-label-sm text-[10px] sm:text-label-sm font-semibold text-on-tertiary-fixed">
                      قيد الطلب
                    </span>
                  )}
                  {isCompleted && (
                    <span className="rounded-full bg-secondary-fixed px-2 py-0.5 font-label-sm text-[10px] sm:text-label-sm font-semibold text-on-secondary-fixed">
                      تم التسليم والمطابقة
                    </span>
                  )}
                  {isCancelled && (
                    <span className="rounded-full bg-error-container px-2 py-0.5 font-label-sm text-[10px] sm:text-label-sm font-semibold text-on-error-container">
                      ملغاة
                    </span>
                  )}
                </div>
                <p className="font-body-sm text-[11px] sm:text-body-sm text-on-surface-variant truncate">
                  تاريخ الإصدار: {new Date(currentInvoice.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'full' })}
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
                  className="flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2 sm:px-3 font-label-sm text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
                  title="عرض صورة الفاتورة المعتمدة الأصلية"
                >
                  <span className="material-symbols-outlined text-[17px]">image</span>
                  <span className="hidden sm:inline">صورة الفاتورة</span>
                </a>
              )}

              {/* Switch Tab to Paper */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'paper' ? 'details' : 'paper')}
                className={`flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-lg border px-2 sm:px-3 font-label-sm text-xs font-bold transition-colors shadow-2xs ${
                  activeTab === 'paper'
                    ? 'bg-[#002855] text-white border-[#002855]'
                    : 'bg-primary-container/20 text-primary border-primary/20 hover:bg-primary-container/30'
                }`}
                title="معاينة ورقة الفاتورة المطبوعة A4"
              >
                <span className="material-symbols-outlined text-[17px]">description</span>
                <span className="hidden sm:inline">{activeTab === 'paper' ? 'تفاصيل الحساب' : 'ورقة A4'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                title="طباعة الفاتورة"
                className="flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-2 sm:px-3 font-label-sm text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[17px]">
                  print
                </span>
                <span className="hidden sm:inline">طباعة</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors"
                aria-label="إغلاق"
              >
                <span className="material-symbols-outlined text-[19px] sm:text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Subheader Navigation Tabs */}
          <div className="flex border-b border-surface-container-high bg-surface-container-low/40 px-3 sm:px-6 pt-1.5 sm:pt-2 gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 pb-2 px-3 border-b-2 font-label-md text-xs sm:text-label-md font-bold transition-all ${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">list_alt</span>
              <span>تفاصيل وبنود الفاتورة</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paper')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 pb-2 px-3 border-b-2 font-label-md text-xs sm:text-label-md font-bold transition-all ${
                activeTab === 'paper'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">description</span>
              <span>📄 ورقة الفاتورة A4 والباركود</span>
              {currentInvoice.invoiceImageUrl && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="يوجد صورة معتمدة" />
              )}
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-6 flex flex-col gap-4 sm:gap-6">
            {activeTab === 'paper' && (
              <div className="space-y-4">
                {/* Top Action Bar for Paper View */}
                <div className="p-3 sm:p-4 rounded-2xl bg-surface-container-low/70 border border-surface-container-high shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-primary">
                        verified
                      </span>
                      <h4 className="font-headline-sm text-xs sm:text-sm font-bold text-primary">
                        الفاتورة الورقية الرسمية المعتمدة (A4 القياسية)
                      </h4>
                    </div>
                    {currentInvoice.invoiceImageUrl ? (
                      <p className="text-body-sm text-[11px] sm:text-xs text-[#15803d] flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[15px]">check_circle</span>
                        <span>صورة الفاتورة المعتمدة محفوظة ومربوطة بباركود التحقق.</span>
                      </p>
                    ) : (
                      <p className="text-body-sm text-[11px] sm:text-xs text-amber-700 flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[15px]">info</span>
                        <span>يمكنك حفظ وتوليد صورة الفاتورة فائقة الدقة بضغطة زر:</span>
                      </p>
                    )}
                  </div>

                  {/* Actions & Zoom Toggle */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mobile Zoom Toggle */}
                    <div className="flex sm:hidden items-center bg-surface-container-high/60 p-0.5 rounded-lg text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPaperZoomMode('fit')}
                        className={`px-2 py-1 rounded-md transition-all ${
                          paperZoomMode === 'fit' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant'
                        }`}
                      >
                        ملاءمة 📱
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaperZoomMode('full')}
                        className={`px-2 py-1 rounded-md transition-all ${
                          paperZoomMode === 'full' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant'
                        }`}
                      >
                        100% 🔍
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isCapturing}
                      onClick={handleDownloadImage}
                      className="flex-1 sm:flex-initial h-8 sm:h-9 items-center justify-center gap-1.5 rounded-lg bg-[#002855] text-white px-3 font-label-sm text-xs font-bold hover:bg-[#001f42] transition-colors shadow-2xs flex"
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
                      className="flex-1 sm:flex-initial h-8 sm:h-9 items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-label-sm text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors shadow-2xs flex"
                      title="حفظ وتحديث صورة الفاتورة المعتمدة على السيرفر"
                    >
                      <span className="material-symbols-outlined text-[17px]">photo_camera</span>
                      <span>حفظ بالسيرفر</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex-1 sm:flex-initial h-8 sm:h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 px-3 text-xs font-bold hover:bg-slate-50 transition-all shadow-xs flex active:scale-95"
                      title="فتح الفاتورة في صفحة مستقلة للطباعة A4 الرسمية"
                    >
                      <span className="material-symbols-outlined text-[17px]">print</span>
                      <span>طباعة A4</span>
                    </button>
                  </div>
                </div>

                {/* Printable Paper Render Wrapper with Mobile Fit Toggle */}
                <div className="flex justify-center p-2 sm:p-5 bg-surface-container-low/60 rounded-2xl border border-surface-container-high overflow-hidden">
                  <PrintablePaperFitWrapper paperZoomMode={paperZoomMode} innerRef={paperRef}>
                    <PrintableInvoicePaper
                      invoiceCode={currentInvoice.invoiceCode}
                      createdAt={currentInvoice.createdAt}
                      clientName={clientName}
                      clientOrganization={clientObj?.organizeName || ''}
                      clientPhone={clientPhone}
                      clientAddress={clientAddress}
                      warehouseName={currentInvoice.warehouse || 'المستودع الرئيسي'}
                      sellerName={sellerName}
                      items={paperItems}
                      includeVat={(currentInvoice.taxAmount || 0) > 0}
                      vatRate={14}
                      discountAmount={0}
                      notes={currentInvoice.notes || ''}
                      invoiceImageUrl={currentInvoice.invoiceImageUrl || ''}
                    />
                  </PrintablePaperFitWrapper>
                </div>
              </div>
            )}

          {activeTab === 'details' && (
            <>
              {/* Settlement Progress Card matching petrokema_web_admin */}
              <div className="rounded-2xl border border-surface-container-high bg-surface-container-low/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  donut_large
                </span>
                <span className="font-label-md text-label-md font-bold text-primary">
                  مؤشر تسوية الفاتورة والمدفوعات
                </span>
              </div>
              <span className="rounded-md bg-secondary-fixed px-2 py-0.5 font-label-sm text-label-sm font-bold text-on-secondary-fixed">
                {percentPaid}% مكتمل
              </span>
            </div>

            {/* Progress track */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-high flex mb-3">
              <div
                className="h-full bg-[#15803d] transition-all duration-500"
                style={{ width: `${percentPaid}%` }}
              />
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${100 - percentPaid}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-2.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant block">
                  إجمالي الفاتورة
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary block mt-0.5">
                  {formatNumber(total)} ج.م
                </span>
              </div>
              <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-2.5">
                <span className="font-label-sm text-label-sm text-[#15803d] block font-semibold">
                  المبلغ المسدد
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-[#15803d] block mt-0.5">
                  {formatNumber(paid)} ج.م
                </span>
              </div>
              <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-2.5">
                <span className="font-label-sm text-label-sm text-error block font-semibold">
                  المتبقي المستحق
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-error block mt-0.5">
                  {formatNumber(remaining)} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Client & Seller Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Info */}
            <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-surface-container-high">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  storefront
                </span>
                <span className="font-label-md text-label-md font-bold text-primary">
                  بيانات العميل والموزع
                </span>
                <span className="mr-auto font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                  {clientCode}
                </span>
              </div>
              <div className="space-y-1.5 font-body-sm text-body-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">الاسم:</span>
                  <span className="font-bold text-on-surface">{clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">الهاتف:</span>
                  <span className="font-medium text-on-surface" dir="ltr">
                    {clientPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">العنوان:</span>
                  <span className="font-medium text-on-surface">
                    {clientAddress}
                  </span>
                </div>
              </div>
            </div>

            {/* Seller & Warehouse Info */}
            <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-surface-container-high">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  badge
                </span>
                <span className="font-label-md text-label-md font-bold text-primary">
                  المندوب والمستودع المسؤول
                </span>
              </div>
              <div className="space-y-1.5 font-body-sm text-body-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">المندوب المشرف:</span>
                  <span className="font-bold text-on-surface">{sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">هاتف المندوب:</span>
                  <span className="font-medium text-on-surface" dir="ltr">
                    {sellerPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">مستودع الصرف:</span>
                  <span className="font-medium text-on-surface">
                    {invoice.warehouse || 'المستودع الرئيسي'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-xl border border-surface-container-high overflow-hidden">
            <div className="bg-surface-container-low px-4 py-3 flex items-center justify-between">
              <span className="font-label-md text-label-md font-bold text-primary">
                أصناف وبنود الفاتورة ({invoice.products?.length || 0})
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                المعايير والمواصفات المعملية
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right font-body-sm text-body-sm">
                <thead className="border-b border-surface-container-high bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
                  <tr>
                    <th className="px-4 py-2.5">الصنف</th>
                    <th className="px-4 py-2.5">الكمية والعبوة</th>
                    <th className="px-4 py-2.5">سعر الوحدة</th>
                    <th className="px-4 py-2.5 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low bg-surface-container-lowest">
                  {invoice.products && invoice.products.length > 0 ? (
                    invoice.products.map((item, idx) => {
                      const pObj = typeof item.productId === 'object' ? item.productId : null
                      const pName = pObj?.name || 'صنف دهانات'
                      const pCode = pObj?.code || ''
                      return (
                        <tr key={idx} className="hover:bg-surface-container-low/40">
                          <td className="px-4 py-3">
                            <span className="font-semibold text-primary block">{pName}</span>
                            {pCode && (
                              <span className="font-mono text-[10px] text-outline">{pCode}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.quantity} {item.unit || 'وحدة'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {formatNumber(item.price)} ج.م
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-left font-bold text-primary">
                            {formatNumber(item.totalPrice || item.price * item.quantity)} ج.م
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-on-surface-variant">
                        لا توجد بنود مفصلة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="bg-surface-container-low/60 p-4 border-t border-surface-container-high flex flex-col gap-2">
              <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold text-on-surface">
                  {formatNumber(Math.max(0, total - (invoice.taxAmount || 0)))} ج.م
                </span>
              </div>
              {invoice.taxAmount ? (
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>ضريبة القيمة المضافة (14%):</span>
                  <span className="font-semibold text-on-surface">
                    {formatNumber(invoice.taxAmount)} ج.م
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between font-label-lg text-label-lg font-bold text-primary pt-2 border-t border-surface-container-high">
                <span>إجمالي الفاتورة النهائي:</span>
                <span>{formatNumber(total)} ج.م</span>
              </div>
            </div>
          </div>

          {/* Past Payments History */}
          <div className="rounded-xl border border-surface-container-high p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-container-high">
              <span className="font-label-md text-label-md font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#15803d]">
                  history
                </span>
                سجل الدفعات والسندات السابقة ({invoice.payments?.length || 0})
              </span>
              {!isFullyPaid && !isCancelled && (
                <button
                  type="button"
                  onClick={() => onAddPayment(invoice)}
                  className="rounded-lg bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim px-3 py-1 font-label-sm text-label-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    add
                  </span>
                  <span>تسجيل دفعة جديدة</span>
                </button>
              )}
            </div>

            {invoice.payments && invoice.payments.length > 0 ? (
              <div className="space-y-2">
                {invoice.payments.map((p, idx) => (
                  <div
                    key={p._id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container-high gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-lowest text-[#15803d]">
                        <span className="material-symbols-outlined text-[18px]">
                          check
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">
                            {formatNumber(p.amount)} ج.م
                          </span>
                          <span className="rounded bg-surface-container-high px-1.5 py-0.5 font-label-sm text-[10px] font-semibold text-on-surface-variant uppercase">
                            {p.paymentMethod}
                          </span>
                        </div>
                        <span className="font-body-sm text-[11px] text-on-surface-variant">
                          {p.referenceNumber ? `مرجع: ${p.referenceNumber} • ` : ''}
                          {p.receiverName ? `المستلم: ${p.receiverName}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">
                      {new Date(p.paymentDate).toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 font-body-sm text-body-sm text-outline">
                لا توجد دفعات مسجلة على هذه الفاتورة حتى الآن
              </p>
            )}
          </div>
          </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-surface-container-high bg-surface-container-lowest px-3 sm:px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          {/* Status quick transitions */}
          <div className="flex items-center gap-2 flex-wrap">
            {isPending && onUpdateStatus && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => onUpdateStatus(invoice, 'completed')}
                className="flex-1 sm:flex-initial flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-lg bg-[#15803d] hover:bg-[#126832] text-white px-3 sm:px-4 font-label-md text-xs sm:text-label-md font-semibold transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[17px]">
                  done_all
                </span>
                <span>اعتماد التوريد والتسليم</span>
              </button>
            )}
            {!isCancelled && onUpdateStatus && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => onUpdateStatus(invoice, 'cancelled')}
                className="flex h-9 sm:h-10 items-center justify-center gap-1 rounded-lg border border-error text-error hover:bg-error-container/20 px-3 font-label-md text-xs sm:text-label-md font-semibold transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  close
                </span>
                <span>إلغاء الفاتورة</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:mr-auto">
            {!isFullyPaid && !isCancelled && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onAddPayment(invoice)
                }}
                className="flex-1 sm:flex-initial flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary px-4 sm:px-5 font-label-md text-xs sm:text-label-md font-bold shadow-md transition-all"
              >
                <span className="material-symbols-outlined text-[17px]">
                  payments
                </span>
                <span>تسجيل سند تحصيل</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial h-9 sm:h-10 px-4 rounded-lg border border-outline-variant text-on-surface font-label-md text-xs sm:text-label-md hover:bg-surface-container-low transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
