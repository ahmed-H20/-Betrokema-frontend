import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatNumber } from '@/lib/format'
import { getAllClients } from '@/api/clients'
import * as sellersApi from '@/api/sellers'
import * as productsApi from '@/api/products'
import { useCreateInvoice } from '@/features/invoices/hooks'

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
}

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

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: '', name: '', unit: UNIT_OPTIONS[0], price: 0, quantity: 1 },
  ])

  if (!isOpen) return null

  // Handle Client selection and auto-link seller
  const handleClientChange = (cId: string) => {
    setClientId(cId)
    const client = clients.find((c) => c._id === cId)
    if (client && typeof client.seller === 'object' && client.seller?._id) {
      setSellerId(client.seller._id)
    } else if (client && typeof client.seller === 'string' && client.seller) {
      setSellerId(client.seller)
    }
  }

  // Handle line items
  const handleProductChange = (index: number, pId: string) => {
    const prod = products.find((p) => p._id === pId)
    const newItems = [...lineItems]
    if (prod) {
      const defaultPrice = prod.packages?.[0]?.price || 500
      const defaultUnit = prod.packages?.[0]?.unitName || UNIT_OPTIONS[0]
      newItems[index] = {
        productId: prod._id,
        name: prod.name,
        unit: defaultUnit,
        price: defaultPrice,
        quantity: newItems[index].quantity || 1,
      }
    } else {
      newItems[index].productId = ''
      newItems[index].name = ''
    }
    setLineItems(newItems)
  }

  const handleItemFieldChange = (
    index: number,
    field: keyof LineItem,
    val: string | number,
  ) => {
    const newItems = [...lineItems]
    newItems[index] = { ...newItems[index], [field]: val }
    setLineItems(newItems)
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { productId: '', name: '', unit: UNIT_OPTIONS[0], price: 0, quantity: 1 },
    ])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return
    setLineItems(lineItems.filter((_, idx) => idx !== index))
  }

  // Calculations
  const subtotal = lineItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  )
  const vatAmount = includeVat ? Math.round(subtotal * 0.14) : 0
  const grandTotal = subtotal + vatAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) {
      toast.error('يرجى اختيار العميل')
      return
    }
    if (!sellerId) {
      toast.error('يرجى اختيار المندوب المسؤول')
      return
    }
    const validItems = lineItems.filter((item) => item.productId && item.price > 0)
    if (validItems.length === 0) {
      toast.error('يجب إضافة صنف واحد على الأقل بسعر صالح')
      return
    }

    try {
      await createInvoice.mutateAsync({
        client: clientId,
        seller: sellerId,
        warehouse,
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
      toast.success('تم إصدار أمر التوريد والفاتورة بنجاح')
      onClose()
    } catch (err) {
      toast.error((err as Error)?.message || 'تعذر إصدار الفاتورة')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-primary/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 shadow-2xl border border-surface-container-high">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
              <span className="material-symbols-outlined text-[24px]">
                post_add
              </span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
                إصدار أمر توريد وفاتورة جديدة
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                قيد طلب مبيعات جديد وربطه بالعميل والمستودع المعتمد
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {/* Client & Seller Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-label-md font-bold text-primary block mb-1">
                العميل / المنشأة <span className="text-error">*</span>
              </label>
              <select
                required
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:outline-none"
              >
                <option value="">اختر العميل...</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.organizeName || c.name} ({c.clientCode || 'CUST'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-label-md text-label-md font-bold text-primary block mb-1">
                مندوب المبيعات المسؤول <span className="text-error">*</span>
              </label>
              <select
                required
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:outline-none"
              >
                <option value="">اختر المندوب...</option>
                {sellers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code || 'REP'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Warehouse & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-label-md font-bold text-primary block mb-1">
                مستودع الصرف والتوزيع
              </label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:outline-none"
              >
                {WAREHOUSE_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-label-md text-label-md font-bold text-primary block mb-1">
                تاريخ الاستحقاق المتفق عليه
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="rounded-xl border border-surface-container-high bg-surface-container-low/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-md text-label-md font-bold text-primary">
                أصناف الدهانات والكيماويات المطلوبة
              </span>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-1 rounded-lg bg-surface-container-highest px-2.5 py-1 font-label-sm text-label-sm font-semibold text-primary hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                <span>إضافة صنف</span>
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center rounded-lg bg-surface-container-lowest p-2.5 border border-surface-container-high"
                >
                  {/* Product Picker */}
                  <div className="col-span-12 sm:col-span-5">
                    <select
                      required
                      value={item.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full rounded-lg border border-outline-variant bg-transparent px-2.5 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none"
                    >
                      <option value="">اختر المنتج من الكتالوج...</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit */}
                  <div className="col-span-4 sm:col-span-3">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemFieldChange(index, 'unit', e.target.value)
                      }
                      placeholder="العبوة (بستلة / شكارة)"
                      className="w-full rounded-lg border border-outline-variant bg-transparent px-2 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemFieldChange(
                          index,
                          'quantity',
                          Math.max(1, Number(e.target.value)),
                        )
                      }
                      placeholder="الكمية"
                      className="w-full rounded-lg border border-outline-variant bg-transparent px-2 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none text-center font-bold"
                    />
                  </div>

                  {/* Price */}
                  <div className="col-span-4 sm:col-span-2 flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={item.price}
                      onChange={(e) =>
                        handleItemFieldChange(
                          index,
                          'price',
                          Number(e.target.value),
                        )
                      }
                      placeholder="السعر"
                      className="w-full rounded-lg border border-outline-variant bg-transparent px-2 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none text-center font-bold"
                    />
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-outline hover:text-error p-1"
                        title="حذف الصنف"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & VAT strip */}
            <div className="mt-4 pt-3 border-t border-surface-container-high flex flex-col gap-2 font-body-sm text-body-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>المجموع الإجمالي للأصناف:</span>
                <span className="font-bold text-on-surface">
                  {formatNumber(subtotal)} ج.م
                </span>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-label-sm text-label-sm text-on-surface">
                  <input
                    type="checkbox"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                    className="rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span>إضافة ضريبة القيمة المضافة (14%)</span>
                </label>
                <span className="font-semibold text-on-surface">
                  {formatNumber(vatAmount)} ج.م
                </span>
              </div>
              <div className="flex justify-between font-label-lg text-label-lg font-bold text-primary pt-2 border-t border-surface-container-high">
                <span>إجمالي المطالبة النهائي:</span>
                <span className="text-secondary text-xl">
                  {formatNumber(grandTotal)} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant block mb-1">
              ملاحظات وتوجيهات التسليم
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: التسليم بموقع مشروع العاصمة الإدارية، الاتصال بأمين العهدة قبل الوصول..."
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-lg border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createInvoice.isPending}
              className="h-11 px-6 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                done
              </span>
              <span>
                {createInvoice.isPending ? 'جارِ الإصدار...' : 'إصدار أمر التوريد'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
