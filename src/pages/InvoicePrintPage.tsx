import { useEffect, useRef, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getInvoiceById } from '@/api/invoices'
import {
  PrintableInvoicePaper,
  type PrintableInvoicePaperItem,
  type PrintableInvoicePaperProps,
} from '@/features/invoices/components/PrintableInvoicePaper'
import { captureAndDownloadInvoicePaper } from '@/lib/invoiceCapture'
import { toast } from 'sonner'

export function InvoicePrintPage() {
  const { id } = useParams<{ id: string }>()
  const paperRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [hasAutoPrinted, setHasAutoPrinted] = useState(false)

  // 1. Fetch invoice data if ID is provided and not draft
  const isDraft = id === 'draft' || !id
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceById(id!),
    enabled: Boolean(id && !isDraft),
    staleTime: 1000 * 60 * 5,
  })

  // 2. Read draft data from sessionStorage if isDraft
  const draftProps: PrintableInvoicePaperProps | null = useMemo(() => {
    if (!isDraft) return null
    try {
      const raw = sessionStorage.getItem('petrokema_print_draft')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [isDraft])

  // 3. Compute paper props
  const paperProps: PrintableInvoicePaperProps | null = useMemo(() => {
    if (isDraft && draftProps) {
      return draftProps
    }

    if (!invoice) return null

    const clientObj =
      typeof invoice.client === 'object' && invoice.client !== null
        ? (invoice.client as Record<string, any>)
        : null
    const clientName = clientObj?.name || 'عميل نقدي'
    const clientOrg = clientObj?.organizeName || ''
    const clientPhone = clientObj?.phone || ''
    const clientAddress = clientObj?.address || clientObj?.city || ''

    const sellerObj =
      typeof invoice.seller === 'object' && invoice.seller !== null
        ? (invoice.seller as Record<string, any>)
        : null
    const sellerName = sellerObj?.name || 'مندوب المبيعات الميداني'

    const items: PrintableInvoicePaperItem[] = (invoice.products || []).map((p) => {
      const prodObj =
        typeof p.productId === 'object' && p.productId !== null
          ? (p.productId as Record<string, any>)
          : null
      return {
        code: prodObj?.productCode || prodObj?.code || '',
        name: prodObj?.name || 'صنف دهانات وبويات',
        unit: p.unit || prodObj?.unit || 'عبوة',
        color: p.color || '',
        quantity: p.quantity,
        price: p.price,
        oldPrice: p.oldPrice,
        discountPercent: p.discountPercent,
        totalPrice: p.totalPrice || p.price * p.quantity,
      }
    })

    return {
      invoiceCode: invoice.invoiceCode,
      createdAt: invoice.createdAt,
      clientName,
      clientOrganization: clientOrg,
      clientPhone,
      clientAddress,
      warehouseName: invoice.warehouse || 'المستودع الرئيسي',
      sellerName,
      items,
      includeVat: (invoice.taxAmount || 0) > 0,
      vatRate: 14,
      discountAmount: invoice.discountAmount || 0,
      notes: invoice.notes || '',
      invoiceImageUrl: invoice.invoiceImageUrl || '',
    }
  }, [isDraft, draftProps, invoice])

  // 4. Update document title for pristine PDF saving name
  useEffect(() => {
    if (paperProps?.invoiceCode) {
      document.title = `فاتورة بتروكيما - ${paperProps.invoiceCode}`
    } else {
      document.title = 'طباعة الفاتورة | شركة بتروكيما'
    }
  }, [paperProps?.invoiceCode])

  // 5. Auto print trigger when page & fonts are ready
  useEffect(() => {
    if (paperProps && !hasAutoPrinted) {
      const timer = setTimeout(async () => {
        if (typeof document !== 'undefined' && 'fonts' in document) {
          try {
            await document.fonts.ready
          } catch {
            // ignore
          }
        }
        setHasAutoPrinted(true)
        window.print()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [paperProps, hasAutoPrinted])

  const handleManualPrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (!paperRef.current || !paperProps) return
    setIsDownloading(true)
    try {
      const code = paperProps.invoiceCode || 'DRAFT'
      const success = await captureAndDownloadInvoicePaper(
        paperRef.current,
        `فاتورة-بتروكيما-${code}.webp`,
      )
      if (success) {
        toast.success('تم تنزيل صورة الفاتورة بنجاح')
      } else {
        toast.error('تعذر تنزيل صورة الفاتورة')
      }
    } catch {
      toast.error('حدث خطأ أثناء تنزيل الصورة')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleClose = () => {
    window.close()
  }

  // Loading state
  if (!isDraft && isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#002855] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-700">جاري تجهيز الفاتورة للطباعة الرسمية...</p>
        </div>
      </div>
    )
  }

  // Error state
  if ((!isDraft && error) || !paperProps) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">تعذر تحميل بيانات الفاتورة</h2>
          <p className="text-xs text-slate-500">
            يرجى التأكد من صحة رقم الفاتورة أو صلاحية الوصول، ثم المحاولة مرة أخرى.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:min-h-0 print:p-0">
      {/* 1. Non-printable Top Control Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="بتروكيما" className="h-7 w-auto object-contain" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#002855] hidden sm:inline">
                طباعة الفاتورة الرسمية (A4)
              </span>
              <span className="font-mono text-xs font-bold bg-[#002855]/10 text-[#002855] px-2 py-0.5 rounded-md">
                {paperProps.invoiceCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualPrint}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#002855] to-[#004b99] hover:from-[#001f42] hover:to-[#003875] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>طباعة (Ctrl+P)</span>
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownload}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="تنزيل نسخة صورة WebP عالية الدقة"
            >
              <span className="material-symbols-outlined text-[17px]">
                {isDownloading ? 'progress_activity' : 'download'}
              </span>
              <span className="hidden sm:inline">
                {isDownloading ? 'جارِ التحميل...' : 'تنزيل صورة'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="إغلاق"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Pristine A4 Sheet Render Area */}
      <main className="max-w-5xl mx-auto py-6 sm:py-8 px-2 flex justify-center print:p-0 print:m-0 print:max-w-none">
        <div ref={paperRef} className="print:w-full">
          <PrintableInvoicePaper
            {...paperProps}
            className="shadow-2xl print:shadow-none"
          />
        </div>
      </main>
    </div>
  )
}
