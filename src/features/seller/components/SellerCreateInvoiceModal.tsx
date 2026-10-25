import { useState, useMemo, useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { captureInvoicePaperToBlob } from '@/lib/invoiceCapture'
import { useSellerContext } from '../SellerContext'
import { useCreateInvoice } from '@/features/invoices/hooks'
import { useProducts } from '@/features/products/hooks'
import { uploadInvoiceImage, updateInvoice } from '@/api/invoices'
import { openInvoiceDraftPrintWindow } from '@/lib/invoicePrint'
import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import {
  PrintableInvoicePaper,
  type PrintableInvoicePaperItem,
} from '@/features/invoices/components/PrintableInvoicePaper'

interface LineItem {
  productId: string
  code?: string
  name: string
  unit: string
  color?: string
  price: number
  oldPrice?: number
  discountPercent?: number
  quantity: number
}

const WAREHOUSE_OPTIONS = [
  'مستودع العاشر من رمضان المركزي',
  'مستودع مدينة السادات للمواد الخام',
  'مستودع برج العرب الساحلي',
  'مستودع أسيوط الإقليمي للصعيد',
]

interface SellerCreateInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedClientId?: string
  onSuccess?: () => void
}

export function SellerCreateInvoiceModal({
  open,
  onOpenChange,
  preselectedClientId,
  onSuccess,
}: SellerCreateInvoiceModalProps) {
  const { activeSellerId, currentSeller, clients, refetchAll } = useSellerContext()
  const createInvoiceMutation = useCreateInvoice()

  // Fetch products for field order
  const { data: productsData } = useProducts({
    limit: 100,
  })
  const products = productsData?.data || []

  const [clientId, setClientId] = useState(preselectedClientId || '')
  const [warehouse, setWarehouse] = useState(WAREHOUSE_OPTIONS[0])
  const [includeVat, setIncludeVat] = useState(true)
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  // Mobile view switcher ('form' vs 'preview')
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form')
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount')
  const [discountValue, setDiscountValue] = useState<number>(0)

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: '', code: '', name: '', unit: '', price: 0, oldPrice: 0, discountPercent: 0, quantity: 1 },
  ])

  // Ref to the live paper sheet for capturing high-res snapshot
  const paperRef = useRef<HTMLDivElement>(null)
  const hiddenCaptureRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [paperZoomMode, setPaperZoomMode] = useState<'fit' | 'full'>('fit')
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [paperHeight, setPaperHeight] = useState<number>(1123)

  useEffect(() => {
    const el = previewContainerRef.current
    if (!el) return
    const update = () => {
      if (el) setContainerWidth(el.clientWidth)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [mobileView, open])

  useEffect(() => {
    if (paperRef.current) {
      const h = paperRef.current.offsetHeight
      if (h > 0) setPaperHeight(h)
    }
  })

  // Temporary Draft Code for the live preview
  const draftInvoiceCode = useMemo(() => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    return `PK-${new Date().getFullYear()}-${randomSuffix}`
  }, [open])

  // Reset or set preselected client when modal opens
  useEffect(() => {
    if (open) {
      setErrorMsg(null)
      setIsCapturing(false)
      setMobileView('form')
      if (preselectedClientId) {
        setClientId(preselectedClientId)
      } else if (clients.length > 0 && !clientId) {
        setClientId(clients[0]._id)
      }
      if (lineItems.length === 0 || !lineItems[0].productId) {
        setLineItems([
          { productId: '', code: '', name: '', unit: '', price: 0, oldPrice: 0, discountPercent: 0, quantity: 1 },
        ])
      }
    }
  }, [open, preselectedClientId, clients])

  // Handle product selection for a line item
  const handleProductSelect = (index: number, pId: string) => {
    const prod = products.find((p) => p._id === pId)
    const newItems = [...lineItems]
    if (prod) {
      const firstPkg = prod.packages?.[0]
      const unitName = firstPkg
        ? (firstPkg.weight ? `${firstPkg.unitName} (${firstPkg.weight})` : firstPkg.unitName)
        : 'بستلة'
      const defaultColor = prod.colors?.[0]?.name || ''
      const colorExtra = prod.colors?.[0]?.price || 0
      const basePrice = firstPkg?.price || 500
      const unitPrice = basePrice + colorExtra
      const oldPrice = firstPkg?.oldPrice || 0
      const discountPercent = firstPkg?.discountPercent || 0

      newItems[index] = {
        productId: prod._id,
        code: prod.code || '',
        name: prod.name,
        unit: unitName,
        color: defaultColor,
        price: unitPrice,
        oldPrice,
        discountPercent,
        quantity: newItems[index].quantity || 1,
      }
    } else {
      newItems[index] = {
        productId: '',
        code: '',
        name: '',
        unit: '',
        color: '',
        price: 0,
        oldPrice: 0,
        discountPercent: 0,
        quantity: 1,
      }
    }
    setLineItems(newItems)
  }

  // Handle unit package change
  const handleUnitChange = (index: number, unitValue: string) => {
    const item = lineItems[index]
    const prod = products.find((p) => p._id === item.productId)
    if (!prod) return

    const matchedPkg = prod.packages?.find((pkg) => {
      const displayName = pkg.weight ? `${pkg.unitName} (${pkg.weight})` : pkg.unitName
      return displayName === unitValue || pkg.unitName === unitValue
    })
    const selectedColor = prod.colors?.find((c) => c.name === item.color)
    const colorExtra = selectedColor?.price || 0

    const basePrice = matchedPkg ? matchedPkg.price : item.price
    const newPrice = basePrice + colorExtra
    const oldPrice = matchedPkg ? (matchedPkg.oldPrice || 0) : 0
    const discountPercent = matchedPkg ? (matchedPkg.discountPercent || 0) : 0

    const newItems = [...lineItems]
    newItems[index] = {
      ...item,
      unit: unitValue,
      price: newPrice,
      oldPrice,
      discountPercent,
    }
    setLineItems(newItems)
  }

  const handleColorChange = (index: number, colorName: string) => {
    const item = lineItems[index]
    const prod = products.find((p) => p._id === item.productId)
    if (!prod) return

    const selectedColor = prod.colors?.find((c) => c.name === colorName)
    const colorExtra = selectedColor?.price || 0

    const matchedPkg = prod.packages?.find((pkg) => {
      const displayName = pkg.weight ? `${pkg.unitName} (${pkg.weight})` : pkg.unitName
      return displayName === item.unit || pkg.unitName === item.unit
    })
    const basePrice = matchedPkg ? matchedPkg.price : (prod.packages?.[0]?.price || 500)

    const newItems = [...lineItems]
    newItems[index] = {
      ...item,
      color: colorName,
      price: basePrice + colorExtra,
    }
    setLineItems(newItems)
  }

  const handleQuantityChange = (index: number, qty: number) => {
    const validQty = Math.max(1, qty)
    const newItems = [...lineItems]
    newItems[index] = { ...newItems[index], quantity: validQty }
    setLineItems(newItems)
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { productId: '', code: '', name: '', unit: '', price: 0, quantity: 1 },
    ])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) {
      setLineItems([{ productId: '', code: '', name: '', unit: '', price: 0, quantity: 1 }])
      return
    }
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => {
      if (!item.productId) return acc
      return acc + (item.price || 0) * (item.quantity || 1)
    }, 0)
  }, [lineItems])

  const calculatedDiscount = useMemo(() => {
    if (!discountValue || discountValue <= 0) return 0
    if (discountType === 'percent') {
      const pct = Math.min(100, Math.max(0, discountValue))
      return Math.round((subtotal * pct) / 100)
    }
    return Math.min(subtotal, Math.max(0, discountValue))
  }, [subtotal, discountType, discountValue])

  const netSubtotal = Math.max(0, subtotal - calculatedDiscount)
  const vatAmount = includeVat ? Math.round(netSubtotal * 0.14) : 0
  const grandTotal = netSubtotal + vatAmount

  // Find selected client details
  const selectedClient = clients.find((c) => c._id === clientId)

  // Map line items to paper items
  const paperItems: PrintableInvoicePaperItem[] = useMemo(() => {
    return lineItems
      .filter((i) => Boolean(i.productId && i.name))
      .map((i) => ({
        code: i.code || '',
        name: i.name,
        unit: i.unit,
        color: i.color,
        quantity: i.quantity,
        price: i.price,
        oldPrice: i.oldPrice,
        discountPercent: i.discountPercent,
        totalPrice: (i.price || 0) * (i.quantity || 1),
      }))
  }, [lineItems])

  // Capture image helper using high-res deterministic capture
  const capturePaperAsBlob = async (): Promise<Blob | null> => {
    const element = hiddenCaptureRef.current || paperRef.current
    if (!element) return null
    try {
      return await captureInvoicePaperToBlob(element)
    } catch (err) {
      console.warn('Invoice image capture warning:', err)
      return null
    }
  }

  const handleSubmit = async () => {
    setErrorMsg(null)
    if (!clientId) {
      setErrorMsg('يرجى اختيار العميل الصادرة له الفاتورة')
      setMobileView('form')
      return
    }

    const validItems = lineItems.filter((i) => Boolean(i.productId))
    if (validItems.length === 0) {
      setErrorMsg('يرجى إضافة صنف واحد على الأقل من المنتجات للفاتورة')
      setMobileView('form')
      return
    }

    if (!activeSellerId) {
      setErrorMsg('كود المندوب غير متوفر')
      return
    }

    setIsCapturing(true)
    let uploadedImageUrl = ''

    try {
      // 1. Capture lightweight snapshot (~250KB WebP)
      let blob: Blob | null = null
      try {
        blob = await capturePaperAsBlob()
        if (blob) {
          uploadedImageUrl = await uploadInvoiceImage(blob)
        }
      } catch (snapshotErr) {
        console.warn('Snapshot upload warning:', snapshotErr)
      }

      // 2. Create invoice record immediately
      const created = await createInvoiceMutation.mutateAsync({
        client: clientId,
        seller: activeSellerId,
        warehouse,
        invoiceCode: draftInvoiceCode,
        invoiceImageUrl: uploadedImageUrl || undefined,
        products: validItems.map((item) => ({
          productId: item.productId,
          price: Number(item.price),
          oldPrice: Number(item.oldPrice || 0),
          discountPercent: Number(item.discountPercent || 0),
          quantity: Number(item.quantity),
          unit: item.unit,
          color: item.color || undefined,
        })),
        taxAmount: vatAmount,
        discountAmount: calculatedDiscount,
        notes: notes.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      })

      // If snapshot was delayed, attach it in the background to avoid blocking the user
      if (!uploadedImageUrl && blob && created?._id) {
        uploadInvoiceImage(blob)
          .then((url) => updateInvoice(created._id, { invoiceImageUrl: url }))
          .catch((e) => console.warn('Background image attachment warning:', e))
      }

      toast.success('تم إصدار الفاتورة بنجاح!')
      refetchAll()
      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إصدار الفاتورة')
    } finally {
      setIsCapturing(false)
    }
  }

  const handlePrint = () => {
    openInvoiceDraftPrintWindow({
      invoiceCode: draftInvoiceCode,
      createdAt: new Date(),
      clientName: selectedClient?.name || 'عميل نقدي',
      clientOrganization: selectedClient?.organizeName || '',
      clientPhone: selectedClient?.phone || '',
      clientAddress: selectedClient?.address || selectedClient?.city || '',
      warehouseName: warehouse,
      sellerName: currentSeller?.name || 'مندوب المبيعات الميداني',
      items: paperItems,
      includeVat,
      vatRate: 14,
      discountAmount: calculatedDiscount,
      notes,
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col h-[100dvh] max-h-[100dvh] w-full rounded-none bg-[#f8fafc] shadow-2xl transition-all sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[96vw] sm:max-w-7xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-[92vh] sm:max-h-[92vh] sm:rounded-2xl overflow-hidden">
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
                invoiceCode={draftInvoiceCode}
                createdAt={new Date()}
                clientName={selectedClient?.name || 'عميل نقدي'}
                clientOrganization={selectedClient?.organizeName || ''}
                clientPhone={selectedClient?.phone || ''}
                clientAddress={selectedClient?.address || selectedClient?.city || ''}
                warehouseName={warehouse}
                sellerName={currentSeller?.name || 'مندوب المبيعات الميداني'}
                items={paperItems}
                includeVat={includeVat}
                vatRate={14}
                discountAmount={calculatedDiscount}
                notes={notes}
              />
            </div>
          </div>

          {/* 1. Modal Top Bar */}
          <div className="flex items-center justify-between p-3 sm:px-6 sm:py-3.5 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#002855]/10 text-[#002855] border border-[#002855]/20 flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">post_add</span>
              </div>
              <div className="min-w-0">
                <Dialog.Title className="text-sm sm:text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                  <span className="truncate">إصدار فاتورة مبيعات ميدانية</span>
                  <span className="hidden sm:inline-flex rounded-full bg-[#002855]/10 px-2 py-0.5 text-[11px] font-bold text-[#002855]">
                    {draftInvoiceCode}
                  </span>
                </Dialog.Title>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="sm:hidden text-[10px] font-mono font-bold text-[#002855] bg-[#002855]/10 px-1.5 py-0.2 rounded">
                    {draftInvoiceCode}
                  </span>
                  <span className="hidden sm:inline text-[11px] text-slate-500 font-medium">
                    معاينة حية ومباشرة لشكل الورقة المطبوعة (A4 WYSIWYG)
                  </span>
                </div>
              </div>
            </div>

            {/* Top Action Buttons (Print & Close) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Direct Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex h-8 sm:h-9 items-center gap-1.5 px-2.5 sm:px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs active:scale-95"
                title="فتح الفاتورة في صفحة مستقلة للطباعة A4 الرسمية"
              >
                <span className="material-symbols-outlined text-[17px] text-[#002855]">
                  print
                </span>
                <span>طباعة</span>
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

          {/* Dedicated Full-Width Segmented Mobile Tab Switcher */}
          <div className="lg:hidden px-3 py-2 bg-slate-100/90 border-b border-slate-200 shrink-0">
            <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl text-xs font-bold text-center gap-1">
              <button
                type="button"
                onClick={() => setMobileView('form')}
                className={cn(
                  'py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-bold',
                  mobileView === 'form'
                    ? 'bg-white text-[#002855] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                <span className="material-symbols-outlined text-[17px]">edit_note</span>
                <span>بيانات الفاتورة ✍️</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileView('preview')}
                className={cn(
                  'py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-bold',
                  mobileView === 'preview'
                    ? 'bg-white text-[#002855] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                <span className="material-symbols-outlined text-[17px]">description</span>
                <span>معاينة ورقة A4 📄</span>
              </button>
            </div>
          </div>

          {/* 2. Main Body Split Screen (Form on Right + Live A4 Paper on Left) */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* RIGHT COLUMN (Form Inputs - 42% on Desktop) */}
            <div
              className={cn(
                'lg:col-span-5 flex-col h-full overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 border-l border-slate-200 bg-white',
                mobileView === 'form' ? 'flex' : 'hidden lg:flex',
              )}
            >
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Client & Warehouse Select */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-200/80 pb-2">
                  <span className="material-symbols-outlined text-[18px] text-[#002855]">
                    storefront
                  </span>
                  <span>بيانات العميل ومستودع الصرف</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      اختيار العميل الصادرة له الفاتورة *
                    </label>
                    <select
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#002855] focus:ring-1 focus:ring-[#002855]"
                    >
                      <option value="">-- اضغط لاختيار العميل --</option>
                      {clients.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.organizeName ? `${c.organizeName} (${c.name})` : c.name} -{' '}
                          {c.city || 'المركز'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      مستودع الشحن والتوريد
                    </label>
                    <select
                      value={warehouse}
                      onChange={(e) => setWarehouse(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#002855]"
                    >
                      {WAREHOUSE_OPTIONS.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Line Items (Products & Packages) */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span className="material-symbols-outlined text-[18px] text-[#00B4D8]">
                      format_paint
                    </span>
                    <span>أصناف الفاتورة ({lineItems.filter((i) => i.productId).length})</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    تتحدث فوراً في ورقة الفاتورة
                  </span>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item, idx) => {
                    const selectedProd = products.find((p) => p._id === item.productId)
                    const availablePackages = selectedProd?.packages || []
                    const availableColors = selectedProd?.colors || []

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#002855] bg-slate-100 px-2 py-0.5 rounded-md">
                            بند رقم #{idx + 1}
                          </span>
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(idx)}
                              className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                delete
                              </span>
                              <span>حذف</span>
                            </button>
                          )}
                        </div>

                        {/* Product Picker */}
                        <div className="space-y-1">
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="w-full h-9 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#002855]"
                          >
                            <option value="">-- اختر صنف الطلاء / الكيماويات --</option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} {p.code ? `(${p.code})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Package, Color, Quantity & Price */}
                        {item.productId && (
                          <div className="space-y-2 pt-1 border-t border-slate-100">
                            <div
                              className={cn(
                                'grid gap-2',
                                availableColors.length > 0
                                  ? 'grid-cols-1 sm:grid-cols-4'
                                  : 'grid-cols-1 sm:grid-cols-3'
                              )}
                            >
                              {/* Package Unit */}
                              <div className="space-y-0.5">
                                <label className="text-[10px] text-slate-500 font-semibold block">
                                  العبوة (من الـ DB)
                                </label>
                                <select
                                  value={item.unit}
                                  onChange={(e) => handleUnitChange(idx, e.target.value)}
                                  className="w-full h-8 px-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium"
                                >
                                  {availablePackages.length > 0 ? (
                                    availablePackages.map((pkg, pIdx) => {
                                      const displayName = pkg.weight
                                        ? `${pkg.unitName} (${pkg.weight})`
                                        : pkg.unitName
                                      return (
                                        <option key={pIdx} value={displayName}>
                                          {displayName} - {formatNumber(pkg.price)} ج.م
                                        </option>
                                      )
                                    })
                                  ) : (
                                    <option value={item.unit || 'بستلة'}>
                                      {item.unit || 'بستلة'}
                                    </option>
                                  )}
                                </select>
                              </div>

                              {/* Color Dropdown if available */}
                              {availableColors.length > 0 && (
                                <div className="space-y-0.5">
                                  <label className="text-[10px] text-slate-500 font-semibold block">
                                    اللون / الدرجة
                                  </label>
                                  <select
                                    value={item.color || ''}
                                    onChange={(e) => handleColorChange(idx, e.target.value)}
                                    className="w-full h-8 px-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium"
                                  >
                                    <option value="">بدون لون محدد</option>
                                    {availableColors.map((c, cIdx) => (
                                      <option key={cIdx} value={c.name}>
                                        {c.name} {c.price > 0 ? `(+${formatNumber(c.price)} ج.م)` : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Quantity */}
                              <div className="space-y-0.5">
                                <label className="text-[10px] text-slate-500 font-semibold block">
                                  الكمية المطلوبة
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(idx, parseInt(e.target.value) || 1)
                                  }
                                  className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold font-mono text-slate-800"
                                />
                              </div>

                              {/* Unit Price (Locked from DB) */}
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] text-slate-500 font-semibold block">
                                    السعر الثابت (DB)
                                  </label>
                                  {Boolean(item.discountPercent && item.discountPercent > 0) && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded font-bold">
                                      خصم {item.discountPercent}%
                                    </span>
                                  )}
                                </div>
                                <div className="h-8 px-2 bg-slate-100 border border-slate-200 rounded-lg text-xs flex items-center justify-between font-mono font-bold text-slate-800">
                                  <span>{formatNumber(item.price)} ج.م</span>
                                  {Boolean(item.oldPrice && item.oldPrice > item.price) && (
                                    <span className="line-through text-slate-400 text-[10px] font-normal">
                                      {formatNumber(item.oldPrice || 0)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Item Subtotal Calculation bar */}
                            <div className="flex items-center justify-between bg-blue-50/70 border border-blue-100/70 rounded-lg px-2.5 py-1 text-[11px]">
                              <span className="text-slate-600 font-medium">
                                إجمالي الصنف ({item.quantity} × {formatNumber(item.price)} ج.م):
                              </span>
                              <span className="font-mono font-bold text-[#002855]">
                                {formatNumber((item.price || 0) * (item.quantity || 1))} ج.م
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Add Item Button */}
                <button
                  type="button"
                  onClick={addLineItem}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-[#002855]/40 text-[#002855] bg-[#002855]/5 hover:bg-[#002855]/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>+ إضافة صنف طلاء آخر للفاتورة</span>
                </button>
              </div>

              {/* 2.5 Discount Section */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="material-symbols-outlined text-[18px] text-[#002855]">
                      percent
                    </span>
                    <span>خصم إضافي على الفاتورة</span>
                  </div>
                  {/* Toggle Type: Amount or Percentage */}
                  <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDiscountType('amount')}
                      className={cn(
                        'px-2.5 py-1 rounded-md transition-all',
                        discountType === 'amount'
                          ? 'bg-white text-[#002855] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      مبلغ ثابت (ج.م)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      className={cn(
                        'px-2.5 py-1 rounded-md transition-all',
                        discountType === 'percent'
                          ? 'bg-white text-[#002855] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      نسبة مئوية (%)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={discountType === 'percent' ? 100 : subtotal}
                      step={discountType === 'percent' ? '0.5' : '1'}
                      value={discountValue || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        setDiscountValue(Math.max(0, val))
                      }}
                      placeholder={discountType === 'percent' ? 'مثال: 5%' : 'مثال: 500 ج.م'}
                      className="w-full h-9 px-3 pe-12 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#002855]"
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 pointer-events-none">
                      {discountType === 'percent' ? '%' : 'ج.م'}
                    </span>
                  </div>

                  {calculatedDiscount > 0 ? (
                    <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500">قيمة الخصم المعتمد:</span>
                      <span className="font-mono font-bold text-slate-800">
                        -{formatCurrency(calculatedDiscount)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      لا يوجد خصم إضافي مطبق
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Taxes, Due Date & Notes */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vat-check-split"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                    className="w-4 h-4 rounded text-[#002855] focus:ring-[#002855] border-slate-300"
                  />
                  <label
                    htmlFor="vat-check-split"
                    className="text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    احتساب ضريبة القيمة المضافة (14% VAT)
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      تاريخ الاستحقاق المتفق عليه
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#002855]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      ملاحظات خاصة
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="تعليمات توريد، رقم أمر الشراء..."
                      className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#002855]"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Mobile Switch Button to Paper */}
              <div className="lg:hidden pt-2">
                <button
                  type="button"
                  onClick={() => setMobileView('preview')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#002855] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[17px]">visibility</span>
                  <span>معاينة ورقة الفاتورة A4 المطبوعة ({formatCurrency(grandTotal)})</span>
                </button>
              </div>
            </div>

            {/* LEFT COLUMN (Live Printable A4 Sheet - 58% on Desktop) */}
            <div
              className={cn(
                'lg:col-span-7 flex-col h-full overflow-y-auto overscroll-contain bg-slate-200/60 p-2 sm:p-6',
                mobileView === 'preview' ? 'flex' : 'hidden lg:flex',
              )}
            >
              {/* Toolbar Above Paper Sheet */}
              <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-600 gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 font-bold text-[#002855]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="truncate">معاينة ورقة الفاتورة الرسمية (A4)</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Mobile Zoom Mode Toggle */}
                  <div className="flex lg:hidden items-center bg-white border border-slate-200 p-0.5 rounded-lg text-[11px] font-bold shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setPaperZoomMode('fit')}
                      className={cn(
                        'px-2 py-1 rounded-md transition-all flex items-center gap-1',
                        paperZoomMode === 'fit'
                          ? 'bg-[#002855] text-white shadow-xs'
                          : 'text-slate-600',
                      )}
                    >
                      <span>ملاءمة</span>
                      <span>📱</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperZoomMode('full')}
                      className={cn(
                        'px-2 py-1 rounded-md transition-all flex items-center gap-1',
                        paperZoomMode === 'full'
                          ? 'bg-[#002855] text-white shadow-xs'
                          : 'text-slate-600',
                      )}
                    >
                      <span>100%</span>
                      <span>🔍</span>
                    </button>
                  </div>
                  <span className="hidden sm:inline text-[11px] text-slate-500">
                    A4 Standard Sheet (210 × 297 mm)
                  </span>
                </div>
              </div>

              {/* The Real Printable Paper Component with Mathematical Scale Centering */}
              <div
                ref={previewContainerRef}
                className="w-full flex justify-center pb-8 overflow-x-auto"
              >
                {(() => {
                  const scale =
                    paperZoomMode === 'fit' && containerWidth > 0 && containerWidth < 810
                      ? Math.min(1, Math.max(0.32, (containerWidth - 24) / 794))
                      : 1

                  return (
                    <div
                      style={
                        scale < 1
                          ? {
                              width: `${Math.round(794 * scale)}px`,
                              height: `${Math.round(paperHeight * scale)}px`,
                              position: 'relative',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }
                          : {
                              width: '794px',
                              minWidth: '794px',
                            }
                      }
                    >
                      <div
                        ref={paperRef}
                        className="w-[794px] min-w-[794px] max-w-[794px] bg-white shadow-xl rounded-lg overflow-hidden"
                        style={
                          scale < 1
                            ? {
                                position: 'absolute',
                                left: '50%',
                                top: 0,
                                transform: `translateX(-50%) scale(${scale})`,
                                transformOrigin: 'top center',
                              }
                            : undefined
                        }
                      >
                        <PrintableInvoicePaper
                          invoiceCode={draftInvoiceCode}
                          createdAt={new Date()}
                          clientName={selectedClient?.name || 'عميل نقدي'}
                          clientOrganization={selectedClient?.organizeName || ''}
                          clientPhone={selectedClient?.phone || ''}
                          clientAddress={selectedClient?.address || selectedClient?.city || ''}
                          warehouseName={warehouse}
                          sellerName={currentSeller?.name || 'مندوب المبيعات الميداني'}
                          items={paperItems}
                          includeVat={includeVat}
                          vatRate={14}
                          discountAmount={calculatedDiscount}
                          notes={notes}
                        />
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* 3. Sticky Bottom Action Bar */}
          <div className="p-3 sm:px-6 sm:py-3.5 border-t border-slate-200 bg-white shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {/* Grand Total Indicator */}
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">إجمالي الفاتورة:</span>
                <span className="text-base sm:text-lg font-black font-mono text-[#E85D04]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
              {calculatedDiscount > 0 && (
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  (خصم: -{formatCurrency(calculatedDiscount)})
                </span>
              )}
              {includeVat && (
                <span className="text-[10px] text-slate-400">
                  (ضريبة: {formatCurrency(vatAmount)})
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 sm:flex-none h-10 sm:h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center transition-all"
                >
                  إلغاء والعودة
                </button>
              </Dialog.Close>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={createInvoiceMutation.isPending || isCapturing || subtotal <= 0}
                className="flex-[2] sm:flex-none h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-[#002855] via-[#003B7B] to-[#002855] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#002855]/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isCapturing ? 'photo_camera' : 'check_circle'}
                </span>
                <span>
                  {isCapturing
                    ? 'جارِ الحفظ...'
                    : createInvoiceMutation.isPending
                      ? 'جارِ الإصدار...'
                      : 'إصدار الفاتورة وحفظ الصورة'}
                </span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
