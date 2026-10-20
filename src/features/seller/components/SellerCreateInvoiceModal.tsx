import { useState, useMemo, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { useSellerContext } from '../SellerContext'
import { useCreateInvoice } from '@/features/invoices/hooks'
import { useProducts } from '@/features/products/hooks'
import { formatNumber } from '@/lib/format'

interface LineItem {
  productId: string
  name: string
  unit: string
  price: number
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
  const { activeSellerId, clients, refetchAll } = useSellerContext()
  const createInvoiceMutation = useCreateInvoice()

  // Fetch products for field order
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    limit: 100,
  })
  const products = productsData?.data || []

  const [clientId, setClientId] = useState(preselectedClientId || '')
  const [warehouse, setWarehouse] = useState(WAREHOUSE_OPTIONS[0])
  const [includeVat, setIncludeVat] = useState(true)
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: '', name: '', unit: '', price: 0, quantity: 1 },
  ])

  // Reset or set preselected client when modal opens
  useEffect(() => {
    if (open) {
      setErrorMsg(null)
      if (preselectedClientId) {
        setClientId(preselectedClientId)
      } else if (clients.length > 0 && !clientId) {
        setClientId(clients[0]._id)
      }
      if (lineItems.length === 0 || !lineItems[0].productId) {
        setLineItems([
          { productId: '', name: '', unit: '', price: 0, quantity: 1 },
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
      const unitName = firstPkg?.unitName || 'بستلة (14 لتر)'
      const unitPrice = firstPkg?.price || 500

      newItems[index] = {
        productId: prod._id,
        name: prod.name,
        unit: unitName,
        price: unitPrice,
        quantity: newItems[index].quantity || 1,
      }
    } else {
      newItems[index] = {
        productId: '',
        name: '',
        unit: '',
        price: 0,
        quantity: 1,
      }
    }
    setLineItems(newItems)
  }

  // Handle unit package change
  const handleUnitChange = (index: number, unitName: string) => {
    const item = lineItems[index]
    const prod = products.find((p) => p._id === item.productId)
    if (!prod) return

    const matchedPkg = prod.packages?.find((pkg) => pkg.unitName === unitName)
    const newPrice = matchedPkg ? matchedPkg.price : item.price

    const newItems = [...lineItems]
    newItems[index] = {
      ...item,
      unit: unitName,
      price: newPrice,
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
      { productId: '', name: '', unit: '', price: 0, quantity: 1 },
    ])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) {
      setLineItems([{ productId: '', name: '', unit: '', price: 0, quantity: 1 }])
      return
    }
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  // Calculation
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => {
      if (!item.productId) return acc
      return acc + (item.price || 0) * (item.quantity || 1)
    }, 0)
  }, [lineItems])

  const vatAmount = includeVat ? Math.round(subtotal * 0.14) : 0
  const grandTotal = subtotal + vatAmount

  const handleSubmit = async () => {
    setErrorMsg(null)
    if (!clientId) {
      setErrorMsg('يرجى اختيار العميل الصادرة له الفاتورة')
      return
    }

    const validItems = lineItems.filter((i) => Boolean(i.productId))
    if (validItems.length === 0) {
      setErrorMsg('يرجى إضافة صنف واحد على الأقل من المنتجات للفاتورة')
      return
    }

    if (!activeSellerId) {
      setErrorMsg('كود المندوب غير متوفر')
      return
    }

    try {
      await createInvoiceMutation.mutateAsync({
        client: clientId,
        seller: activeSellerId,
        warehouse,
        products: validItems.map((item) => ({
          productId: item.productId,
          price: Number(item.price),
          quantity: Number(item.quantity),
          unit: item.unit,
        })),
        taxAmount: vatAmount,
        notes: notes.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      })

      toast.success('تم إصدار الفاتورة الميدانية بنجاح!')
      refetchAll()
      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إصدار الفاتورة')
    }
  }

  const selectedClient = clients.find((c) => c._id === clientId)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[94vh] sm:max-h-[90vh] rounded-t-3xl bg-[#f8fafc] shadow-2xl transition-all sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl overflow-hidden">
          {/* 1. Fixed Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">
                  post_add
                </span>
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-slate-900 leading-tight">
                  إصدار فاتورة مبيعات ميدانية
                </Dialog.Title>
                <span className="text-[11px] text-slate-500 font-medium">
                  اختيار الأصناف والكميات واعتماد أمر التوريد
                </span>
              </div>
            </div>
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

          {/* 2. Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Error Banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Client & Warehouse Section */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Client Select */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    العميل المستلم <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="">-- اختر العميل --</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.organizeName || c.name} ({c.clientCode || 'كود غير محدد'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warehouse Select */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    مستودع الصرف والتفريغ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-orange-500"
                  >
                    {WAREHOUSE_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Credit Warning / Info */}
              {selectedClient && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="material-symbols-outlined text-[16px] text-orange-600">
                      account_balance_wallet
                    </span>
                    <span>
                      المديونية الحالية:{' '}
                      <strong className="text-slate-900 font-bold">
                        {formatNumber(selectedClient.currentDebt || 0)} ج.م
                      </strong>
                    </span>
                  </div>
                  <div className="text-slate-600">
                    الحد الائتماني:{' '}
                    <strong className="text-orange-700 font-bold">
                      {formatNumber(selectedClient.creditLimit || 100000)} ج.م
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Products Table & Line Items */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-orange-600">
                    inventory_2
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    أصناف وعبوات الفاتورة
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  {lineItems.filter((i) => i.productId).length} صنف مضاف
                </span>
              </div>

              {/* Line items list */}
              <div className="space-y-3">
                {lineItems.map((item, index) => {
                  const currentProd = products.find((p) => p._id === item.productId)
                  const packages = currentProd?.packages || []

                  return (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>

                        {/* Product Picker Dropdown */}
                        <div className="flex-1">
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductSelect(index, e.target.value)}
                            disabled={isLoadingProducts}
                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 disabled:opacity-60"
                          >
                            <option value="">
                              {isLoadingProducts
                                ? '-- جاري تحميل كتالوج المنتجات... --'
                                : '-- اختر دهان أو منتج كيميائي --'}
                            </option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} ({p.code})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="حذف الصنف"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>

                      {/* Package Unit, Quantity, Price, and Total */}
                      {item.productId && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200/60">
                          {/* Unit / Package */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 block font-medium">
                              نوع العبوة
                            </span>
                            {packages.length > 0 ? (
                              <select
                                value={item.unit}
                                onChange={(e) => handleUnitChange(index, e.target.value)}
                                className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                              >
                                {packages.map((pkg, pIdx) => (
                                  <option key={pIdx} value={pkg.unitName}>
                                    {pkg.unitName} ({formatNumber(pkg.price)} ج.م)
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={item.unit || 'عبوة'}
                                onChange={(e) => {
                                  const newItems = [...lineItems]
                                  newItems[index].unit = e.target.value
                                  setLineItems(newItems)
                                }}
                                className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs"
                              />
                            )}
                          </div>

                          {/* Quantity */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 block font-medium">
                              الكمية المطلوبة
                            </span>
                            <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden h-9">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(index, item.quantity - 1)
                                }
                                className="w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(index, Number(e.target.value))
                                }
                                className="flex-1 text-center text-xs font-bold text-slate-900 border-x border-slate-200 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(index, item.quantity + 1)
                                }
                                className="w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Price & Line Total */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 block font-medium">
                              إجمالي الصنف
                            </span>
                            <div className="flex items-center justify-between h-9 px-3 bg-white border border-slate-200 rounded-lg">
                              <span className="text-[10px] text-slate-400">
                                {formatNumber(item.price)} × {item.quantity} =
                              </span>
                              <span className="text-xs font-bold text-orange-600">
                                {formatNumber((item.price || 0) * (item.quantity || 1))}{' '}
                                ج.م
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add More Product Button */}
              <button
                type="button"
                onClick={addLineItem}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-orange-300 text-orange-700 bg-orange-50/50 hover:bg-orange-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>+ إضافة صنف طلاء آخر للفاتورة</span>
              </button>
            </div>

            {/* 3. Due Date & Notes */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    تاريخ الاستحقاق المتفق عليه
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="vat-check"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                  />
                  <label
                    htmlFor="vat-check"
                    className="text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    احتساب ضريبة القيمة المضافة (14% VAT)
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  ملاحظات وتوجيهات الشحنة
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات تفريغ، طلب عينات إضافية، شروط توريد خاصة..."
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* 4. Financial Grand Summary Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-md space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>إجمالي المنتجات (قبل الضريبة):</span>
                <span className="font-semibold text-white">
                  {formatNumber(subtotal)} ج.م
                </span>
              </div>
              {includeVat && (
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>ضريبة القيمة المضافة (14%):</span>
                  <span className="font-semibold text-amber-300">
                    {formatNumber(vatAmount)} ج.م
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-200">
                  صافي قيمة الفاتورة المطلوب تحصيلها:
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-orange-400">
                    {formatNumber(grandTotal)}
                  </span>
                  <span className="text-xs text-slate-400">ج.م</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Sticky Bottom Action Bar */}
          <div className="p-4 sm:p-5 pt-3 border-t border-slate-200 bg-white/95 backdrop-blur-md shrink-0 pb-[calc(1.2rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] space-y-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createInvoiceMutation.isPending || subtotal <= 0}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 hover:from-orange-800 hover:to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                check_circle
              </span>
              <span>
                {createInvoiceMutation.isPending
                  ? 'جاري اعتماد وإصدار الفاتورة...'
                  : 'اعتماد وإصدار الفاتورة للعميل'}
              </span>
            </button>

            <Dialog.Close asChild>
              <button
                type="button"
                className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center transition-all"
              >
                إلغاء والعودة
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
