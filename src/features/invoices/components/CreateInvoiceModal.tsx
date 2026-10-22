import { useState, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import { formatCurrency } from '@/lib/format'
import { getAllClients } from '@/api/clients'
import * as sellersApi from '@/api/sellers'
import * as productsApi from '@/api/products'
import { useCreateInvoice } from '@/features/invoices/hooks'
import { uploadInvoiceImage } from '@/api/invoices'
import { cn } from '@/lib/cn'
import {
  PrintableInvoicePaper,
  type PrintableInvoicePaperItem,
} from '@/features/invoices/components/PrintableInvoicePaper'

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
}

interface LineItem {
  productId: string
  code?: string
  name: string
  unit: string
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

const UNIT_OPTIONS = [
  'بستلة (14 لتر)',
  'جالون (3.75 لتر)',
  'شكارة (25 كجم)',
  'برميل (200 كجم)',
  'عبوة 1 لتر',
]

export function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
  const createInvoice = useCreateInvoice()

  // Queries
  const { data: clients = [] } = useQuery({
    queryKey: ['clients', 'all'],
    queryFn: getAllClients,
    enabled: isOpen,
  })

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers', 'all'],
    queryFn: () => sellersApi.getAll(),
    enabled: isOpen,
  })

  const { data: productsData } = useQuery({
    queryKey: ['products', 'picker'],
    queryFn: () => productsApi.getAll({ limit: 100 }),
    enabled: isOpen,
  })
  const products = productsData?.data || []

  // Form State
  const [clientId, setClientId] = useState('')
  const [sellerId, setSellerId] = useState('')
  const [warehouse, setWarehouse] = useState(WAREHOUSE_OPTIONS[0])
  const [dueDate, setDueDate] = useState('')
  const [includeVat, setIncludeVat] = useState(true)
  const [notes, setNotes] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form')

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: '', code: '', name: '', unit: UNIT_OPTIONS[0], price: 0, oldPrice: 0, discountPercent: 0, quantity: 1 },
  ])

  const paperRef = useRef<HTMLDivElement>(null)

  // Draft Code
  const draftInvoiceCode = useMemo(() => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    return `PK-${new Date().getFullYear()}-${randomSuffix}`
  }, [isOpen])

  if (!isOpen) return null

  // Handle Client selection and auto-link seller
  const handleClientChange = (cId: string) => {
    setClientId(cId)
    const client = clients.find((c) => c._id === cId)
    if (client && typeof client.seller === 'object' && client.seller?._id) {
      setSellerId(client.seller._id)
    }
  }

  // Handle Product change
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p._id === productId)
    const newItems = [...lineItems]
    if (product) {
      const firstPkg = product.packages?.[0]
      const unitName = firstPkg?.unitName || UNIT_OPTIONS[0]
      const unitPrice = firstPkg?.price || 500
      const oldPrice = firstPkg?.oldPrice || 0
      const discountPercent = firstPkg?.discountPercent || 0

      newItems[index] = {
        productId,
        code: product.code || '',
        name: product.name,
        unit: unitName,
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
        unit: UNIT_OPTIONS[0],
        price: 0,
        oldPrice: 0,
        discountPercent: 0,
        quantity: 1,
      }
    }
    setLineItems(newItems)
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...lineItems]
    newItems[index] = { ...newItems[index], quantity: Math.max(1, quantity) }
    setLineItems(newItems)
  }

  const handleUnitChange = (index: number, unitName: string) => {
    const item = lineItems[index]
    const prod = products.find((p) => p._id === item.productId)
    if (!prod) return

    const matchedPkg = prod.packages?.find((pkg) => pkg.unitName === unitName)
    const newPrice = matchedPkg ? matchedPkg.price : item.price
    const oldPrice = matchedPkg ? (matchedPkg.oldPrice || 0) : 0
    const discountPercent = matchedPkg ? (matchedPkg.discountPercent || 0) : 0

    const newItems = [...lineItems]
    newItems[index] = {
      ...item,
      unit: unitName,
      price: newPrice,
      oldPrice,
      discountPercent,
    }
    setLineItems(newItems)
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { productId: '', code: '', name: '', unit: UNIT_OPTIONS[0], price: 0, oldPrice: 0, discountPercent: 0, quantity: 1 },
    ])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  // Calculations
  const subtotal = lineItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  )
  const vatAmount = includeVat ? Math.round(subtotal * 0.14) : 0
  const grandTotal = subtotal + vatAmount

  // Lookups
  const selectedClient = clients.find((c) => c._id === clientId)
  const selectedSeller = sellers.find((s) => s._id === sellerId)

  // Paper Items
  const paperItems: PrintableInvoicePaperItem[] = lineItems
    .filter((i) => Boolean(i.productId && i.name))
    .map((i) => ({
      code: i.code || '',
      name: i.name,
      unit: i.unit,
      quantity: i.quantity,
      price: i.price,
      totalPrice: (i.price || 0) * (i.quantity || 1),
    }))

  // Capture snapshot
  const capturePaperAsBlob = async (): Promise<Blob | null> => {
    const element = paperRef.current
    if (!element) return null
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png', 0.95)
      })
    } catch (err) {
      console.warn('Invoice image capture warning:', err)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) {
      toast.error('يرجى اختيار العميل')
      setMobileView('form')
      return
    }
    if (!sellerId) {
      toast.error('يرجى اختيار المندوب المسؤول')
      setMobileView('form')
      return
    }
    const validItems = lineItems.filter((item) => item.productId && item.price > 0)
    if (validItems.length === 0) {
      toast.error('يجب إضافة صنف واحد على الأقل بسعر صالح')
      setMobileView('form')
      return
    }

    setIsCapturing(true)
    let uploadedImageUrl = ''

    try {
      const blob = await capturePaperAsBlob()
      if (blob) {
        try {
          uploadedImageUrl = await uploadInvoiceImage(blob)
        } catch (uploadErr) {
          console.warn('Snapshot upload warning:', uploadErr)
        }
      }

      await createInvoice.mutateAsync({
        client: clientId,
        seller: sellerId,
        warehouse,
        invoiceCode: draftInvoiceCode,
        invoiceImageUrl: uploadedImageUrl || undefined,
        products: validItems.map((item) => ({
          productId: item.productId,
          price: Number(item.price),
          quantity: Number(item.quantity),
          unit: item.unit,
        })),
        taxAmount: vatAmount,
        dueDate: dueDate ? dueDate : null,
        notes: notes.trim() || undefined,
      })
      toast.success('تم إصدار أمر التوريد وحفظ صورة الفاتورة الرسمية بنجاح')
      onClose()
    } catch (err) {
      toast.error((err as Error)?.message || 'تعذر إصدار الفاتورة')
    } finally {
      setIsCapturing(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative flex flex-col w-full max-w-7xl h-[94vh] max-h-[94vh] rounded-2xl bg-[#f8fafc] shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#002855] text-white shadow-xs">
              <span className="material-symbols-outlined text-[22px]">post_add</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900 leading-tight">
                  إصدار أمر توريد وفاتورة رسمية
                </h2>
                <span className="hidden sm:inline-flex rounded-full bg-[#002855]/10 px-2 py-0.5 text-[11px] font-bold text-[#002855]">
                  {draftInvoiceCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                معاينة حية ومباشرة لشكل الورقة المطبوعة وحفظ الصورة والباركود
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile View Toggle */}
            <div className="flex lg:hidden rounded-lg bg-slate-100 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setMobileView('form')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-semibold transition-all',
                  mobileView === 'form'
                    ? 'bg-white text-[#002855] shadow-xs'
                    : 'text-slate-600',
                )}
              >
                النموذج ✍️
              </button>
              <button
                type="button"
                onClick={() => setMobileView('preview')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-semibold transition-all',
                  mobileView === 'preview'
                    ? 'bg-white text-[#002855] shadow-xs'
                    : 'text-slate-600',
                )}
              >
                المعاينة 📄
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex h-9 items-center gap-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
              title="طباعة الفاتورة"
            >
              <span className="material-symbols-outlined text-[17px] text-[#002855]">
                print
              </span>
              <span>طباعة</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Split Body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* RIGHT COLUMN: Form Inputs */}
          <div
            className={cn(
              'lg:col-span-5 flex-col h-full overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 border-l border-slate-200 bg-white',
              mobileView === 'form' ? 'flex' : 'hidden lg:flex',
            )}
          >
            {/* Client & Seller Section */}
            <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-200/80 pb-2">
                <span className="material-symbols-outlined text-[18px] text-[#002855]">
                  storefront
                </span>
                <span>الطرف المشتري ومسؤول البيع</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    العميل الصادرة له الفاتورة *
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#002855]"
                    required
                  >
                    <option value="">-- اضغط لاختيار العميل --</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.organizeName ? `${c.organizeName} (${c.name})` : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      المندوب المسؤول *
                    </label>
                    <select
                      value={sellerId}
                      onChange={(e) => setSellerId(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#002855]"
                      required
                    >
                      <option value="">-- اختر المندوب --</option>
                      {sellers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.sector || 'العام'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      مستودع الصرف
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
            </div>

            {/* Line Items Picker */}
            <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="material-symbols-outlined text-[18px] text-[#00B4D8]">
                    format_paint
                  </span>
                  <span>أصناف الفاتورة ({lineItems.filter((i) => i.productId).length})</span>
                </div>
                <span className="text-[11px] text-slate-500">تحديث لحظي</span>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#002855] bg-slate-100 px-2 py-0.5 rounded-md">
                        بند رقم #{index + 1}
                      </span>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            delete
                          </span>
                          <span>حذف</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(index, e.target.value)}
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

                    {item.productId && (
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                        <div className="space-y-0.5">
                          <label className="text-[10px] text-slate-500 font-semibold block">
                            نوع العبوة
                          </label>
                          <select
                            value={item.unit}
                            onChange={(e) => handleUnitChange(index, e.target.value)}
                            className="w-full h-8 px-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                          >
                            {UNIT_OPTIONS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[10px] text-slate-500 font-semibold block">
                            الكمية
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(index, parseInt(e.target.value) || 1)
                            }
                            className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-center font-bold font-mono text-slate-800"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[10px] text-slate-500 font-semibold block">
                            سعر الوحدة
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={item.price}
                            onChange={(e) =>
                              handlePriceChange(index, parseFloat(e.target.value) || 0)
                            }
                            className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-center font-mono font-bold text-slate-800"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addLineItem}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-[#002855]/40 text-[#002855] bg-[#002855]/5 hover:bg-[#002855]/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>+ إضافة صنف طلاء آخر</span>
              </button>
            </div>

            {/* Taxes, Due Date & Notes */}
            <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="admin-vat-check"
                  checked={includeVat}
                  onChange={(e) => setIncludeVat(e.target.checked)}
                  className="w-4 h-4 rounded text-[#002855] focus:ring-[#002855] border-slate-300"
                />
                <label
                  htmlFor="admin-vat-check"
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
                    ملاحظات وتوجيهات خاصة
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ملاحظات تفريغ أو استلام..."
                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#002855]"
                  />
                </div>
              </div>
            </div>

            {/* Quick Mobile Button to Preview */}
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

          {/* LEFT COLUMN: Live A4 Paper Sheet Preview */}
          <div
            className={cn(
              'lg:col-span-7 flex-col h-full overflow-y-auto overscroll-contain bg-slate-200/60 p-3 sm:p-6',
              mobileView === 'preview' ? 'flex' : 'hidden lg:flex',
            )}
          >
            <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-[#002855]">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>معاينة ورقة الفاتورة الرسمية (تتحدث حياً مع التعديلات)</span>
              </div>
              <span className="text-[11px] text-slate-500">
                A4 Standard Sheet (210 × 297 mm)
              </span>
            </div>

            <div className="flex justify-center pb-6">
              <div ref={paperRef} className="w-full">
                <PrintableInvoicePaper
                  invoiceCode={draftInvoiceCode}
                  createdAt={new Date()}
                  clientName={selectedClient?.name || 'عميل نقدي'}
                  clientOrganization={selectedClient?.organizeName || ''}
                  clientPhone={selectedClient?.phone || ''}
                  clientAddress={selectedClient?.address || selectedClient?.city || ''}
                  warehouseName={warehouse}
                  sellerName={selectedSeller?.name || 'المندوب المعتمد'}
                  items={paperItems}
                  includeVat={includeVat}
                  vatRate={14}
                  notes={notes}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="p-3 sm:px-6 sm:py-3.5 border-t border-slate-200 bg-white shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">إجمالي الفاتورة الصافي:</span>
            <span className="text-lg font-black font-mono text-[#E85D04]">
              {formatCurrency(grandTotal)}
            </span>
            {includeVat && (
              <span className="text-[10px] text-slate-400">
                (شامل 14% ضريبة: {formatCurrency(vatAmount)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center transition-all"
            >
              إلغاء والعودة
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={createInvoice.isPending || isCapturing || subtotal <= 0}
              className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-gradient-to-r from-[#002855] via-[#003B7B] to-[#002855] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#002855]/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[19px]">
                {isCapturing ? 'photo_camera' : 'check_circle'}
              </span>
              <span>
                {isCapturing
                  ? 'جارِ التقاط وحفظ صورة الفاتورة...'
                  : createInvoice.isPending
                    ? 'جارِ إصدار الفاتورة...'
                    : 'إصدار الفاتورة وحفظ الصورة والباركود'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
