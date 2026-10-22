import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInvoices } from '@/features/invoices/hooks'
import { formatNumber } from '@/lib/format'
import { ClientInvoiceDetailsModal } from './components/ClientInvoiceDetailsModal'
import { openInvoicePrintWindow } from '@/lib/invoicePrint'
import type { Invoice } from '@/api/invoices.schema'

export function ClientInvoicesPage() {
  const navigate = useNavigate()
  const { data: invoicesData, isLoading } = useInvoices({ limit: 100 })

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'credit' | 'paid'>('all')
  const [search, setSearch] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const invoices = invoicesData?.data || []

  // Metrics
  const totalInvoicesCount = invoices.length
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalPrice || 0), 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.totalPaid || 0), 0)
  const totalRemaining = Math.max(0, totalAmount - totalPaid)

  // Subgroups
  const pendingInvoices = useMemo(
    () => invoices.filter((inv) => inv.orderStatus === 'pending' || inv.orderStatus === 'processing'),
    [invoices]
  )
  const creditInvoices = useMemo(
    () => invoices.filter((inv) => inv.paymentStatus === 'unpaid' || inv.paymentStatus === 'partially_paid'),
    [invoices]
  )
  const paidInvoices = useMemo(
    () => invoices.filter((inv) => inv.paymentStatus === 'paid'),
    [invoices]
  )

  // Filtered by Tab and Search
  const filteredInvoices = useMemo(() => {
    let list: Invoice[] = []
    switch (activeTab) {
      case 'pending':
        list = pendingInvoices
        break
      case 'credit':
        list = creditInvoices
        break
      case 'paid':
        list = paidInvoices
        break
      case 'all':
      default:
        list = invoices
        break
    }

    if (!search.trim()) return list
    const q = search.trim().toLowerCase()
    return list.filter(
      (inv) =>
        inv.invoiceCode.toLowerCase().includes(q) ||
        (inv.warehouse && inv.warehouse.toLowerCase().includes(q))
    )
  }, [activeTab, search, invoices, pendingInvoices, creditInvoices, paidInvoices])

  const handleOpenInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv)
    setIsDetailsOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* Title Header */}
      <section className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => navigate('/client')}
          className="w-10 h-10 rounded-full bg-[#eef4fd] flex items-center justify-center text-slate-700 hover:bg-blue-100 transition-colors shrink-0"
          title="الرجوع للرئيسية"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        <div className="flex-1 text-center px-2">
          <h1 className="text-xl font-bold text-[#0b1d33] leading-tight">سجل طلباتي وفواتيري</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            استعراض وتتبع كافة الفواتير وأوامر التوريد وتفاصيلها
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-[#e7f0fa] flex items-center justify-center text-[#2563eb] shrink-0">
          <span className="material-symbols-outlined text-[22px]">receipt_long</span>
        </div>
      </section>

      {/* Top Financial Overview KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium block">إجمالي الفواتير</span>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold text-slate-900 font-mono block leading-tight">
              {formatNumber(totalAmount)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{totalInvoicesCount} فاتورة</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium block">المسدد</span>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold text-emerald-600 font-mono block leading-tight">
              {formatNumber(totalPaid)}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">سداد معتمد</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium block">المتبقي</span>
          <div className="mt-1">
            <span
              className={`text-base sm:text-lg font-bold font-mono block leading-tight ${
                totalRemaining > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {formatNumber(totalRemaining)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {totalRemaining > 0 ? 'ذمة آجلة' : 'لا يوجد متبقي'}
            </span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث برقم الفاتورة (مثال: INV-...) أو المستودع"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 shadow-xs transition-all"
        />
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
          search
        </span>
      </div>

      {/* 4 Tabs Filter Switcher */}
      <div className="flex rounded-xl bg-slate-200/80 p-1 gap-1 overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>الكل</span>
          <span className="text-[10px] opacity-80 font-mono">({invoices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>قيد الطلب</span>
          <span className="text-[10px] opacity-80 font-mono">({pendingInvoices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credit')}
          className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === 'credit'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>الآجلة</span>
          <span className="text-[10px] opacity-80 font-mono">({creditInvoices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paid')}
          className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === 'paid'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>المسددة</span>
          <span className="text-[10px] opacity-80 font-mono">({paidInvoices.length})</span>
        </button>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[30px] animate-spin text-orange-500">
              progress_activity
            </span>
            <span>جاري تحميل سجل الفواتير وأوامر التوريد...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
            <span className="material-symbols-outlined text-[40px] text-slate-300">
              receipt_long
            </span>
            <p className="text-xs text-slate-700 font-bold">لا توجد فواتير مطابقة في هذا القسم</p>
            <p className="text-[11px] text-slate-400">
              يمكنك طلب دهانات وأصناف جديدة مباشرة من كتالوج المنتجات
            </p>
            <button
              type="button"
              onClick={() => navigate('/client/catalog')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span>تصفح الكتالوج والطلب الآن</span>
            </button>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const isPaid = inv.paymentStatus === 'paid'
            const isPartial =
              inv.paymentStatus === 'partially_paid' || (inv.totalPaid > 0 && !isPaid)
            const rem = Math.max(0, inv.totalPrice - inv.totalPaid)

            return (
              <article
                key={inv._id}
                onClick={() => handleOpenInvoice(inv)}
                className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Top Row: Code, Status Badges, and Date */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm font-mono group-hover:text-orange-600 transition-colors">
                        {inv.invoiceCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isPartial
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isPaid ? 'مسددة بالكامل' : isPartial ? 'سداد جزئي' : `متبقي ${formatNumber(rem)} ج.م`}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          inv.orderStatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : inv.orderStatus === 'processing'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : inv.orderStatus === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {inv.orderStatus === 'completed'
                          ? 'تم التوريد والتسليم'
                          : inv.orderStatus === 'processing'
                            ? 'قيد التجهيز والتعبئة'
                            : inv.orderStatus === 'cancelled'
                              ? 'ملغاة'
                              : 'قيد المراجعة'}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 block mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      <span>
                        {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(
                          new Date(inv.createdAt)
                        )}
                      </span>
                      <span className="mx-1">•</span>
                      <span className="material-symbols-outlined text-[14px]">warehouse</span>
                      <span>{inv.warehouse || 'المستودع الرئيسي'}</span>
                    </span>
                  </div>

                  {/* Financial Amount */}
                  <div className="text-left shrink-0">
                    <span className="text-[10px] text-slate-400 block font-medium">صافي القيمة</span>
                    <span className="text-base font-bold text-orange-600 font-mono">
                      {formatNumber(inv.totalPrice)}{' '}
                      <span className="text-[10px] font-normal text-slate-500">ج.م</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Products Count, Action Button */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-orange-500">format_paint</span>
                    <span>عدد الأصناف: {inv.products?.length || 1} منتج</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenInvoice(inv)
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors border border-orange-200/80"
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      <span>عرض تفاصيل الفاتورة</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (inv._id) {
                          openInvoicePrintWindow(inv._id)
                        }
                      }}
                      title="طباعة الفاتورة في صفحة مستقلة"
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">print</span>
                    </button>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>

      {/* Invoice Details Modal */}
      <ClientInvoiceDetailsModal
        invoice={selectedInvoice}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  )
}
