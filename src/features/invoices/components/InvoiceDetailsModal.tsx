import { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import html2canvas from 'html2canvas'
import { formatNumber } from '@/lib/format'
import { toast } from 'sonner'
import { uploadInvoiceImage, updateInvoice } from '@/api/invoices'
import { PrintableInvoicePaper, type PrintableInvoicePaperItem } from '@/features/invoices/components/PrintableInvoicePaper'
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
  const paperRef = useRef<HTMLDivElement>(null)

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

  const handleSaveInvoiceImage = async () => {
    if (!paperRef.current || !currentInvoice?._id) return
    setIsCapturing(true)
    try {
      const canvas = await html2canvas(paperRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png', 0.95)
      })
      if (!blob) throw new Error('فشل إنشاء ملف الصورة')
      const uploadedUrl = await uploadInvoiceImage(blob)
      const updated = await updateInvoice(currentInvoice._id, { invoiceImageUrl: uploadedUrl })
      setLocalInvoice(updated)
      toast.success('تم توليد وحفظ صورة الفاتورة بنجاح على السيرفر وربط الباركود بها! 🎉')
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'حدث خطأ أثناء حفظ صورة الفاتورة')
    } finally {
      setIsCapturing(false)
    }
  }

  const handleDownloadImage = async () => {
    if (!currentInvoice?.invoiceImageUrl) return
    try {
      const response = await fetch(currentInvoice.invoiceImageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `فاتورة-بتروكيما-${currentInvoice.invoiceCode}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('بدأ تنزيل صورة الفاتورة بنجاح')
    } catch {
      window.open(currentInvoice.invoiceImageUrl, '_blank')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-primary/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={`fixed inset-0 z-[70] flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-surface-container-lowest shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[92vh] ${activeTab === 'paper' ? 'md:max-w-4xl' : 'md:max-w-3xl'} md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl`}>
          <Dialog.Title className="sr-only">تفاصيل الفاتورة {currentInvoice.invoiceCode}</Dialog.Title>
          <Dialog.Description className="sr-only">عرض بنود وتفاصيل الفاتورة وحالة التحصيل</Dialog.Description>
          {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-surface-container-high bg-surface-container-lowest px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary">
              <span className="material-symbols-outlined text-[24px]">
                receipt
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-headline-sm font-bold text-primary font-mono">
                  {currentInvoice.invoiceCode}
                </h2>
                {isPending && (
                  <span className="rounded-full bg-tertiary-fixed px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-tertiary-fixed">
                    قيد الطلب
                  </span>
                )}
                {isCompleted && (
                  <span className="rounded-full bg-secondary-fixed px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-fixed">
                    تم التسليم والمطابقة
                  </span>
                )}
                {isCancelled && (
                  <span className="rounded-full bg-error-container px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-error-container">
                    ملغاة
                  </span>
                )}
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                تاريخ الإصدار: {new Date(currentInvoice.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'full' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Prominent Image Button */}
            {currentInvoice.invoiceImageUrl && (
              <a
                href={currentInvoice.invoiceImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 font-label-sm text-label-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
                title="عرض صورة الفاتورة المعتمدة الأصلية"
              >
                <span className="material-symbols-outlined text-[18px]">image</span>
                <span className="hidden sm:inline">صورة الفاتورة</span>
              </a>
            )}

            {/* Switch Tab to Paper */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'paper' ? 'details' : 'paper')}
              className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 font-label-sm text-label-sm font-bold transition-colors shadow-2xs ${
                activeTab === 'paper'
                  ? 'bg-[#002855] text-white border-[#002855]'
                  : 'bg-primary-container/20 text-primary border-primary/20 hover:bg-primary-container/30'
              }`}
              title="معاينة الفاتورة المطبوعة A4"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span className="hidden sm:inline">{activeTab === 'paper' ? 'تفاصيل الحساب' : 'فاتورة A4'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="طباعة الفاتورة"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-label-sm text-label-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                print
              </span>
              <span className="hidden sm:inline">طباعة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Subheader Navigation Tabs */}
        <div className="flex border-b border-surface-container-high bg-surface-container-low/40 px-4 sm:px-6 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 font-label-md text-label-md font-bold transition-all ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">list_alt</span>
            <span>تفاصيل وبنود الفاتورة</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paper')}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 font-label-md text-label-md font-bold transition-all ${
              activeTab === 'paper'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            <span>📄 الفاتورة المطبوعة A4 والباركود</span>
            {currentInvoice.invoiceImageUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="يوجد صورة معتمدة" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 flex flex-col gap-6">
          {activeTab === 'paper' && (
            <div className="space-y-4">
              {/* Top Action Bar for Paper View */}
              <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-surface-container-high shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      verified
                    </span>
                    <h4 className="font-headline-sm text-sm font-bold text-primary">
                      الفاتورة الورقية الرسمية المعتمدة (A4)
                    </h4>
                  </div>
                  {currentInvoice.invoiceImageUrl ? (
                    <p className="text-body-sm text-xs text-[#15803d] flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>صورة الفاتورة المعتمدة محفوظة على السيرفر ومربوطة بباركود الفاتورة.</span>
                    </p>
                  ) : (
                    <p className="text-body-sm text-xs text-amber-700 flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      <span>لم يتم حفظ صورة لهذه الفاتورة بعد. يمكنك توليدها وحفظها بضغطة زر:</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {currentInvoice.invoiceImageUrl ? (
                    <>
                      <a
                        href={currentInvoice.invoiceImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 font-label-sm text-label-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        <span>فتح الصورة الأصلية</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleDownloadImage}
                        className="flex h-9 items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-label-sm text-label-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        <span>تنزيل الصورة</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={isCapturing}
                      onClick={handleSaveInvoiceImage}
                      className="flex h-9 items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary px-4 font-label-sm text-label-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {isCapturing ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">
                            progress_activity
                          </span>
                          <span>جارِ الحفظ...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                          <span>حفظ صورة الفاتورة الآن 📸</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-[#002855] text-white px-4 font-label-sm text-label-sm font-bold hover:bg-[#001f42] transition-colors shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">print</span>
                    <span>طباعة A4</span>
                  </button>
                </div>
              </div>

              {/* Printable Paper Render Wrapper */}
              <div className="overflow-x-auto flex justify-center p-3 sm:p-5 bg-surface-container-low/60 rounded-2xl border border-surface-container-high">
                <div
                  ref={paperRef}
                  className="w-[794px] min-w-[700px] bg-white shadow-xl rounded-lg overflow-hidden shrink-0"
                >
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
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-t border-surface-container-high bg-surface-container-lowest px-4 sm:px-6 py-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          {/* Status quick transitions */}
          <div className="flex items-center gap-2">
            {isPending && onUpdateStatus && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => onUpdateStatus(invoice, 'completed')}
                className="flex h-10 items-center gap-1.5 rounded-lg bg-[#15803d] hover:bg-[#126832] text-white px-4 font-label-md text-label-md font-semibold transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
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
                className="flex h-10 items-center gap-1 rounded-lg border border-error text-error hover:bg-error-container/20 px-3 font-label-md text-label-md font-semibold transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  close
                </span>
                <span>إلغاء الفاتورة</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mr-auto">
            {!isFullyPaid && !isCancelled && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onAddPayment(invoice)
                }}
                className="flex h-10 items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary px-5 font-label-md text-label-md font-bold shadow-md transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  payments
                </span>
                <span>تسجيل سند تحصيل</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors"
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
