import { Component, type ReactNode } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { formatCurrency, formatNumber } from '@/lib/format'
import { tafqeet } from '@/lib/tafqeet'
import { cn } from '@/lib/cn'

class SafeQRCodeBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(err: unknown) {
    console.warn('QR Code generation failed safely caught:', err)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-[78px] w-[78px] items-center justify-center rounded bg-slate-100 text-slate-400">
            <span className="material-symbols-outlined text-[32px]">qr_code_2</span>
          </div>
        )
      )
    }
    return this.props.children
  }
}

export interface PrintableInvoicePaperItem {
  code?: string
  name: string
  unit?: string
  color?: string
  quantity: number
  price: number
  oldPrice?: number
  discountPercent?: number
  totalPrice?: number
}

export interface PrintableInvoicePaperProps {
  id?: string
  invoiceCode?: string
  createdAt?: string | Date
  clientName?: string
  clientOrganization?: string
  clientPhone?: string
  clientAddress?: string
  warehouseName?: string
  sellerName?: string
  items: PrintableInvoicePaperItem[]
  includeVat?: boolean
  vatRate?: number
  discountAmount?: number
  notes?: string
  invoiceImageUrl?: string
  className?: string
}

export function PrintableInvoicePaper({
  id = 'printable-invoice-paper',
  invoiceCode = 'مسودة (DRAFT)',
  createdAt = new Date(),
  clientName = 'عميل نقدي',
  clientOrganization = '',
  clientPhone = '',
  clientAddress = '',
  warehouseName = 'المستودع الرئيسي (العاشر من رمضان)',
  sellerName = 'مندوب المبيعات الميداني',
  items = [],
  includeVat = true,
  vatRate = 14,
  discountAmount = 0,
  notes = '',
  className,
}: PrintableInvoicePaperProps) {
  // Format formatted date safely (handles null, undefined, timestamps, Date objects, or invalid date strings)
  const validDate = (() => {
    if (!createdAt) return new Date()
    const d = createdAt instanceof Date ? createdAt : new Date(createdAt)
    return isNaN(d.getTime()) ? new Date() : d
  })()

  const formattedDate = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(validDate)

  // Calculate financials and discounts safely
  const safeItems = Array.isArray(items) ? items : []
  const itemsDiscountSum = safeItems.reduce((acc, item) => {
    if (item && typeof item.oldPrice === 'number' && typeof item.price === 'number' && item.oldPrice > item.price) {
      return acc + (item.oldPrice - item.price) * (item.quantity || 1)
    }
    return acc
  }, 0)

  const subtotal = safeItems.reduce((acc, item) => {
    if (!item) return acc
    const itemTotal =
      typeof item.totalPrice === 'number' && item.totalPrice > 0
        ? item.totalPrice
        : ((item.price || 0) * (item.quantity || 1))
    return acc + itemTotal
  }, 0)

  const grossBeforeDiscount = itemsDiscountSum > 0 ? subtotal + itemsDiscountSum : subtotal
  const invoiceDiscount = discountAmount || 0
  const totalDiscount = itemsDiscountSum + invoiceDiscount
  const netSubtotal = Math.max(0, subtotal - invoiceDiscount)

  const vatAmount = includeVat ? Math.round((netSubtotal * (vatRate || 14)) / 100) : 0
  const grandTotal = Math.max(0, netSubtotal + vatAmount)

  // Official Linktree link for all Petrokema invoices QR codes
  const qrTargetUrl = 'https://linktr.ee/ptrokema'

  // Minimum 5 rows to give the invoice an authentic, balanced look
  const minRows = Math.max(items.length, 5)
  const paddedItems = [...items]
  while (paddedItems.length < minRows) {
    paddedItems.push({
      code: '',
      name: '',
      unit: '',
      quantity: 0,
      price: 0,
      totalPrice: 0,
    })
  }

  const clientDisplayName = clientOrganization
    ? `${clientOrganization} (${clientName})`
    : clientName

  return (
    <div
      className={cn(
        'printable-paper-sheet mx-auto flex w-[794px] min-w-[794px] max-w-[794px] flex-col justify-between overflow-hidden rounded-md border border-slate-200/90 bg-white p-8 text-slate-900 shadow-xl transition-all print:m-0 print:w-full print:min-w-0 print:max-w-none print:border-none print:p-0 print:shadow-none',
        className,
      )}
      style={{
        fontFamily: "'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        letterSpacing: 'normal',
        textRendering: 'geometricPrecision',
      }}
      dir="rtl"
      id={id}
    >
      {/* 1. Header (Logo & Company Credentials) */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
          {/* Company details in Arabic */}
          <div className="flex flex-col text-right">
            <h1 className="text-2xl font-black text-[#002855] leading-snug">
              شركة بتروكيما للصناعات والدهانات الحديثة
            </h1>
            <span className="text-xs font-semibold text-[#00B4D8] font-sans">
              Petrokema for Chemical Industries & Modern Paints
            </span>
            <div className="mt-1 flex items-center gap-x-2 text-[10px] font-medium text-slate-500">
              <span>س.ت: 78945</span>
              <span>•</span>
              <span>ب.ض: 789-456-321</span>
              <span>•</span>
              <span>المنطقة الصناعية - السادس من أكتوبر</span>
            </div>
            <div className="flex items-center gap-x-2 text-[10px] text-slate-500">
              <span>هاتف: 02-38341234 / 01001234567</span>
              <span>•</span>
              <span>البريد: info@petrokema.eg</span>
            </div>
          </div>

          {/* Official Company Logo */}
          <div className="flex shrink-0 flex-col items-center">
            <img
              alt="شعار شركة بتروكيما للدهانات"
              className="h-16 w-auto object-contain"
              src="/logo.png"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Multi-color Brand Accent Line */}
        <div className="h-1.5 w-full rounded-full bg-gradient-to-l from-[#002855] via-[#00B4D8] to-[#E85D04]" />

        {/* 2. Invoice Title Banner */}
        <div className="flex items-center justify-between rounded-xl bg-[#002855] px-4 py-2.5 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">
              فاتورة مبيعات / إذن صرف وتوريد بضاعة
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-slate-300">رقم الفاتورة:</span>
            <span className="rounded bg-white/15 px-2.5 py-0.5 text-white">
              {invoiceCode}
            </span>
          </div>
        </div>

        {/* 3. Invoice & Parties Metadata Box */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
          {/* Client Details */}
          <div className="flex flex-col gap-1.5 border-l border-slate-200/80 pl-3">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#002855]">السيد العميل:</span>
              <span className="font-semibold text-slate-900 truncate">
                {clientDisplayName}
              </span>
            </div>
            {clientPhone && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="font-semibold text-slate-700">رقم الهاتف:</span>
                <span className="font-mono text-slate-900">{clientPhone}</span>
              </div>
            )}
            {clientAddress && (
              <div className="flex items-center gap-1.5 text-slate-600 truncate">
                <span className="font-semibold text-slate-700">العنوان:</span>
                <span className="truncate">{clientAddress}</span>
              </div>
            )}
          </div>

          {/* Invoice Meta */}
          <div className="flex flex-col gap-1.5 pr-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">تاريخ الإصدار:</span>
              <span className="font-bold text-slate-900">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">المستودع المصدر:</span>
              <span className="font-medium text-slate-900 truncate max-w-[200px]">
                {warehouseName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">مسؤول البيع:</span>
              <span className="font-bold text-[#002855]">{sellerName}</span>
            </div>
          </div>
        </div>

        {/* 4. Products Table */}
        <div className="overflow-hidden rounded-xl border border-slate-300 shadow-2xs">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#002855] text-white">
                <th className="w-10 px-2.5 py-2 text-center font-bold">م</th>
                <th className="w-24 px-2.5 py-2 font-bold">كود الصنف</th>
                <th className="px-3 py-2 font-bold">اسم المنتج والبيان</th>
                <th className="w-24 px-2.5 py-2 text-center font-bold">نوع العبوة</th>
                <th className="w-16 px-2.5 py-2 text-center font-bold">الكمية</th>
                <th className="w-24 px-2.5 py-2 text-left font-bold">سعر الوحدة</th>
                <th className="w-28 px-3 py-2 text-left font-bold">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paddedItems.map((item, idx) => {
                const isEmpty = !item.name
                const itemTotal =
                  typeof item.totalPrice === 'number' && item.totalPrice > 0
                    ? item.totalPrice
                    : (item.price || 0) * (item.quantity || 1)

                return (
                  <tr
                    className={cn(
                      'transition-colors',
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
                      isEmpty && 'h-8 text-transparent select-none',
                    )}
                    key={idx}
                  >
                    <td className="px-2.5 py-2 text-center font-mono font-medium text-slate-500">
                      {!isEmpty ? idx + 1 : ' '}
                    </td>
                    <td className="px-2.5 py-2 font-mono text-slate-700 whitespace-nowrap">
                      {!isEmpty ? item.code || '—' : ' '}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-900">
                      {!isEmpty ? (
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          {Boolean(item.color) && (
                            <span className="text-[10px] font-normal text-slate-500">
                              اللون: {item.color}
                            </span>
                          )}
                        </div>
                      ) : (
                        ' '
                      )}
                    </td>
                    <td className="px-2.5 py-2 text-center text-slate-700 whitespace-nowrap">
                      {!isEmpty ? item.unit || '—' : ' '}
                    </td>
                    <td className="px-2.5 py-2 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                      {!isEmpty ? formatNumber(item.quantity) : ' '}
                    </td>
                    <td className="px-2.5 py-2 text-left font-mono text-slate-700 whitespace-nowrap">
                      {!isEmpty ? (
                        <div className="flex flex-col items-start leading-tight">
                          <span className="font-bold text-slate-900">{formatCurrency(item.price)}</span>
                          {Boolean(item.oldPrice && item.oldPrice > item.price) && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {formatCurrency(item.oldPrice || 0)}
                            </span>
                          )}
                        </div>
                      ) : (
                        ' '
                      )}
                    </td>
                    <td className="px-3 py-2 text-left font-mono font-bold text-[#002855] whitespace-nowrap">
                      {!isEmpty ? formatCurrency(itemTotal) : ' '}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 5. Financial Summary & Arabic Tafqeet */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-row justify-between gap-4 items-start">
            {/* Notes / Terms */}
            <div className="flex flex-1 flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-[11px] text-slate-600">
              <div>
                <span className="font-bold text-[#002855] block mb-1">
                  ملاحظات وشروط التوريد:
                </span>
                <p className="leading-relaxed">
                  {notes ||
                    'البضاعة المباعة تم فحصها ومعاينتها وتعتبر مطابقة للمواصفات الفنية المعتمدة لشركة بتروكيما. أي استرجاع أو استبدال يتم خلال المدة القانونية المقررة بالفاتورة الأصلية.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span>وثيقة مبيعات رسمية ومؤرشفة إلكترونياً</span>
                <span>•</span>
                <span>بتروكيما للصناعات الكيماوية والدهانات</span>
              </div>
            </div>

            {/* Calculations Box */}
            <div className="w-72 shrink-0 overflow-hidden rounded-xl border border-slate-300 text-xs shadow-2xs">
              {totalDiscount > 0 ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5">
                    <span className="text-slate-600">الإجمالي قبل الخصم:</span>
                    <span className="font-mono text-slate-700">
                      {formatCurrency(grossBeforeDiscount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 bg-emerald-50/60 px-3 py-1.5 text-emerald-800">
                    <span className="font-bold">إجمالي الخصم المعتمد:</span>
                    <span className="font-mono font-bold">
                      -{formatCurrency(totalDiscount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5">
                    <span className="text-slate-600">الصافي بعد الخصم:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(netSubtotal)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5">
                  <span className="text-slate-600">الإجمالي الفرعي:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              )}

              {includeVat && (
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5">
                  <span className="text-slate-600">
                    ضريبة القيمة المضافة ({vatRate}%):
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(vatAmount)}
                  </span>
                </div>
              )}

              {/* Grand Total Bar in Coral/Amber Brand Color */}
              <div className="flex items-center justify-between bg-[#E85D04] px-3.5 py-2 text-white">
                <span className="font-bold">الصافي الكلي المطلوب:</span>
                <span className="text-base font-black font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Tafqeet (Written Amount in Arabic Words) */}
          <div className="rounded-lg border border-[#00B4D8]/30 bg-[#00B4D8]/5 px-3.5 py-2 text-center text-xs font-bold text-[#002855]">
            <span>المبلغ كتابةً: </span>
            <span className="text-slate-900">{tafqeet(grandTotal)}</span>
          </div>
        </div>

        {/* 6. Signatures & Live Scannable QR Code */}
        <div className="mt-2 grid grid-cols-3 items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          {/* Customer Receipt Signature */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-bold text-slate-800">
              توقيع واستلام العميل
            </span>
            <span className="mt-1 text-[10px] text-slate-500">
              (استلمت البضاعة كاملة ومطابقة بحالة جيدة)
            </span>
            <div className="mt-8 w-36 border-b border-dashed border-slate-400" />
          </div>

          {/* Dynamic Scannable QR Code */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-lg border border-slate-300 bg-white p-1.5 shadow-sm">
              <SafeQRCodeBoundary>
                <QRCodeSVG
                  fgColor="#002855"
                  level="M"
                  size={78}
                  value={qrTargetUrl}
                />
              </SafeQRCodeBoundary>
            </div>
            <span className="mt-1.5 text-[10px] font-bold text-[#002855]">
              امسح بالكاميرا لزيارة روابط وصفحات الشركة 📱
            </span>
            <span className="text-[9px] text-slate-500">
              دليل وتوثيق شركة بتروكيما المعتمد
            </span>
          </div>

          {/* Sales Representative Signature */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-bold text-slate-800">
              توقيع واعتماد مسؤول المبيعات
            </span>
            <span className="mt-1 text-[10px] text-[#002855] font-semibold truncate max-w-[150px]">
              {sellerName}
            </span>
            <div className="mt-8 w-36 border-b border-dashed border-slate-400" />
          </div>
        </div>
      </div>

      {/* 7. Bottom Brand Stripe & Footer Credentials */}
      <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-3 text-center text-[10px] text-slate-500 print:mt-4">
        <div className="flex items-center justify-center gap-x-4 font-medium">
          <span>شركة بتروكيما للصناعات الكيماوية والدهانات</span>
          <span>•</span>
          <span>قطاع المبيعات والتوزيع المركزي</span>
          <span>•</span>
          <span>خدمة العملاء: 01001234567</span>
          <span>•</span>
          <span>الموقع الرسمي: www.petrokema.eg</span>
        </div>
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-[#002855] via-[#00B4D8] to-[#E85D04]" />
      </div>
    </div>
  )
}
