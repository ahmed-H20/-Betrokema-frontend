import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSellerContext } from './SellerContext'
import { formatNumber } from '@/lib/format'
import { CollectPaymentModal } from './components/CollectPaymentModal'
import { SellerCreateInvoiceModal } from './components/SellerCreateInvoiceModal'
import { SellerInvoiceDetailsModal } from './components/SellerInvoiceDetailsModal'
import type { Invoice } from '@/api/invoices.schema'

export function SellerInvoicesPage() {
  const { invoices, isLoading } = useSellerContext()
  const navigate = useNavigate()

  const [mainTab, setMainTab] = useState<'invoices' | 'receipts'>('invoices')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all')
  const [selectedInvoiceForCollect, setSelectedInvoiceForCollect] =
    useState<Invoice | null>(null)
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] =
    useState<Invoice | null>(null)
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [detailsInitialTab, setDetailsInitialTab] = useState<'items' | 'payments' | 'paper'>('items')
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.trim().toLowerCase()
      const clientName =
        typeof inv.client === 'object' && inv.client !== null
          ? inv.client.name.toLowerCase()
          : ''
      const invCode = inv.invoiceCode.toLowerCase()

      const matchesSearch = !q || invCode.includes(q) || clientName.includes(q)

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'paid' && inv.paymentStatus === 'paid') ||
        (statusFilter === 'unpaid' && inv.paymentStatus !== 'paid')

      return matchesSearch && matchesStatus
    })
  }, [invoices, search, statusFilter])

  // Extract all payments across invoices for the "Receipts" view
  const allReceipts = useMemo(() => {
    const list: Array<{
      _id: string
      invoiceId: string
      invoiceCode: string
      clientName: string
      amount: number
      paymentMethod: string
      paymentDate: string
      referenceNumber?: string
      receiverName?: string
      notes?: string
      rawInvoice: Invoice
    }> = []

    invoices.forEach((inv) => {
      const clientName =
        typeof inv.client === 'object' && inv.client !== null
          ? inv.client.name
          : 'عميل نقدي'

      if (inv.payments && inv.payments.length > 0) {
        inv.payments.forEach((p, idx) => {
          list.push({
            _id: p._id || `${inv._id}-${idx}`,
            invoiceId: inv._id,
            invoiceCode: inv.invoiceCode,
            clientName,
            amount: p.amount,
            paymentMethod: p.paymentMethod,
            paymentDate: p.paymentDate || inv.createdAt,
            referenceNumber: p.referenceNumber || `TXN-${inv.invoiceCode}-${idx + 1}`,
            receiverName: p.receiverName,
            notes: p.notes,
            rawInvoice: inv,
          })
        })
      }
    })

    // Sort newest first
    list.sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )

    if (!search.trim()) return list
    const q = search.trim().toLowerCase()
    return list.filter(
      (r) =>
        r.invoiceCode.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        (r.referenceNumber && r.referenceNumber.toLowerCase().includes(q))
    )
  }, [invoices, search])

  const totalCollectedAmount = useMemo(() => {
    return allReceipts.reduce((sum, r) => sum + (r.amount || 0), 0)
  }, [allReceipts])

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto w-full md:max-w-4xl pb-16">
      {/* 1. Header & Main Navigation Tabs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              سجل العمليات والتحصيل الميداني
            </h2>
            <p className="text-xs text-slate-500">
              إدارة فواتير المبيعات وسندات القبض المعتمدة
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all shrink-0 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>فاتورة جديدة</span>
          </button>
        </div>

        {/* View Mode Toggle: Invoices vs Receipts */}
        <div className="flex rounded-xl bg-slate-200/80 p-1">
          <button
            type="button"
            onClick={() => setMainTab('invoices')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mainTab === 'invoices'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>فواتير المبيعات ({invoices.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab('receipts')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mainTab === 'receipts'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span>سندات القبض والتحصيل ({allReceipts.length})</span>
          </button>
        </div>

        {/* Filters if on Invoices view */}
        {mainTab === 'invoices' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'جميع الفواتير' },
              { id: 'unpaid', label: 'متبقيات للتحصيل' },
              { id: 'paid', label: 'المسددة بالكامل' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              mainTab === 'invoices'
                ? 'ابحث برقم الفاتورة أو اسم العميل...'
                : 'ابحث برقم السند، كود الفاتورة، أو العميل...'
            }
            className="w-full pr-10 pl-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Content Section */}
      {mainTab === 'invoices' ? (
        /* TAB 1: Invoices List */
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
              جاري تحميل الفواتير...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
              <span className="material-symbols-outlined text-[32px] text-slate-300">
                receipt_long
              </span>
              <p className="text-xs text-slate-500">لا توجد فواتير مطابقة للبحث</p>
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const isPaid = inv.paymentStatus === 'paid'
              const rem = Math.max(0, inv.totalPrice - inv.totalPaid)
              const clientName =
                typeof inv.client === 'object' && inv.client !== null
                  ? inv.client.name
                  : 'عميل غير مسجل'
              const clientId =
                typeof inv.client === 'object' && inv.client !== null
                  ? inv.client._id
                  : inv.client

              return (
                <article
                  key={inv._id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3 hover:border-orange-200 transition-colors"
                >
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => {
                      setSelectedInvoiceForDetails(inv)
                      setIsDetailsModalOpen(true)
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm font-mono">
                          {inv.invoiceCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isPaid ? 'مسددة' : `متبقي ${formatNumber(rem)} ج.م`}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        {clientName}
                      </p>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(
                          new Date(inv.createdAt)
                        )}{' '}
                        • {inv.warehouse || 'المستودع الرئيسي'}
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block">الإجمالي</span>
                      <span className="text-base font-bold text-orange-600">
                        {formatNumber(inv.totalPrice)}{' '}
                        <span className="text-xs font-normal text-slate-500">ج.م</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInvoiceForDetails(inv)
                        setDetailsInitialTab('paper')
                        setIsDetailsModalOpen(true)
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#002855]/10 hover:bg-[#002855]/15 text-[#002855] text-xs font-bold border border-[#002855]/20 transition-colors shadow-2xs"
                      title="عرض الفاتورة المطبوعة A4 وصورتها الرسمية"
                    >
                      <span className="material-symbols-outlined text-[16px]">description</span>
                      <span>فاتورة A4</span>
                      {inv.invoiceImageUrl && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="يوجد صورة معتمدة" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInvoiceForDetails(inv)
                        setDetailsInitialTab('items')
                        setIsDetailsModalOpen(true)
                      }}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>الأصناف</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (clientId) {
                          navigate(`/seller/clients/${clientId}`)
                        }
                      }}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      <span>العميل</span>
                    </button>

                    {!isPaid ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInvoiceForCollect(inv)
                          setIsCollectModalOpen(true)
                        }}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">payments</span>
                        <span>تحصيل</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInvoiceForDetails(inv)
                          setDetailsInitialTab('payments')
                          setIsDetailsModalOpen(true)
                        }}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">receipt</span>
                        <span>الإشعار</span>
                      </button>
                    )}
                  </div>
                </article>
              )
            })
          )}
        </div>
      ) : (
        /* TAB 2: Receipts / Collections List */
        <div className="flex flex-col gap-3">
          {/* Summary Card for Collections */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-200 block font-medium">
                إجمالي المبالغ المحصلة المعتمدة
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold font-mono">
                  {formatNumber(totalCollectedAmount)}
                </span>
                <span className="text-xs text-emerald-200">ج.م</span>
              </div>
            </div>
            <div className="text-left bg-emerald-900/40 px-3 py-2 rounded-xl border border-emerald-600/40">
              <span className="text-[10px] text-emerald-200 block">عدد السندات</span>
              <span className="text-lg font-bold">{allReceipts.length} سند قبض</span>
            </div>
          </div>

          {allReceipts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
              <span className="material-symbols-outlined text-[32px] text-slate-300">
                payments
              </span>
              <p className="text-xs text-slate-500">لا توجد سندات قبض مسجلة بعد</p>
            </div>
          ) : (
            allReceipts.map((rcpt) => (
              <div
                key={rcpt._id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm font-mono">
                        {rcpt.referenceNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                        {rcpt.paymentMethod === 'instapay'
                          ? 'إنستاباي'
                          : rcpt.paymentMethod === 'cash'
                            ? 'نقداً'
                            : rcpt.paymentMethod === 'wallet'
                              ? 'محفظة كاش'
                              : 'تحويل بنكي'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      {rcpt.clientName} • فاتورة #{rcpt.invoiceCode}
                    </p>
                    <span className="text-[11px] text-slate-400 block">
                      {new Intl.DateTimeFormat('ar-EG', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(rcpt.paymentDate))}
                    </span>
                  </div>

                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block">المبلغ المحصل</span>
                    <span className="text-base font-bold text-emerald-600 font-mono">
                      {formatNumber(rcpt.amount)}{' '}
                      <span className="text-xs font-normal text-slate-500">ج.م</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    المسؤول: {rcpt.receiverName || 'المندوب الميداني'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInvoiceForDetails(rcpt.rawInvoice)
                      setIsDetailsModalOpen(true)
                    }}
                    className="text-orange-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>عرض الفاتورة الأصلية</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Collect Payment Modal */}
      <CollectPaymentModal
        invoice={selectedInvoiceForCollect}
        open={isCollectModalOpen}
        onOpenChange={setIsCollectModalOpen}
      />

      {/* Invoice Details Modal */}
      <SellerInvoiceDetailsModal
        invoice={selectedInvoiceForDetails}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        initialTab={detailsInitialTab}
        onCollectPayment={(inv) => {
          setSelectedInvoiceForCollect(inv)
          setIsCollectModalOpen(true)
        }}
      />

      {/* Create Invoice Modal with Product Selector */}
      <SellerCreateInvoiceModal
        open={isCreateInvoiceOpen}
        onOpenChange={setIsCreateInvoiceOpen}
      />
    </div>
  )
}
