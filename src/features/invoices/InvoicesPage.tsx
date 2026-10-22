import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { buildCsv, downloadCsv } from '@/lib/csv'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import {
  useInvoiceStats,
  useInvoices,
  useUpdateOrderStatus,
} from '@/features/invoices/hooks'
import { DailyKpiCard } from '@/features/invoices/components/DailyKpiCard'
import {
  InvoiceStatusTabs,
  type TabKey,
} from '@/features/invoices/components/InvoiceStatusTabs'
import { InvoiceCard } from '@/features/invoices/components/InvoiceCard'
import { InvoicesTable } from '@/features/invoices/components/InvoicesTable'
import { AddPaymentModal } from '@/features/invoices/components/AddPaymentModal'
import { InvoiceDetailsModal } from '@/features/invoices/components/InvoiceDetailsModal'
import { CreateInvoiceModal } from '@/features/invoices/components/CreateInvoiceModal'
import type { Invoice, OrderStatus } from '@/api/invoices.schema'

const WAREHOUSES_FILTER = [
  { id: 'all', label: 'كافة المستودعات (المركزية)' },
  { id: 'مستودع العاشر من رمضان المركزي', label: 'مستودع العاشر من رمضان الصناعي' },
  { id: 'مستودع مدينة السادات للمواد الخام', label: 'مستودع مدينة السادات' },
  { id: 'مستودع برج العرب الساحلي', label: 'مجمع برج العرب اللوجستي' },
  { id: 'مستودع أسيوط الإقليمي للصعيد', label: 'مستودع أسيوط الإقليمي' },
]

export function InvoicesPage() {
  // State
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')

  // Month selector (defaults to current month)
  const currentMonthValue = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }, [])
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue)

  // Modals state
  const [detailsInvoice, setDetailsInvoice] = useState<Invoice | null>(null)
  const [detailsInitialTab, setDetailsInitialTab] = useState<'details' | 'paper'>('details')
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleOpenDetails = (invoice: Invoice, tab: 'details' | 'paper' = 'details') => {
    setDetailsInitialTab(tab)
    setDetailsInvoice(invoice)
  }

  // API Queries & Mutations
  const { data: stats, isLoading: isStatsLoading } = useInvoiceStats()
  const { data: invoicesData, isLoading: isInvoicesLoading } = useInvoices({
    search: debouncedSearch.trim() || undefined,
    orderStatus: activeTab,
    warehouse: selectedWarehouse !== 'all' ? selectedWarehouse : undefined,
    month: selectedMonth || undefined,
    limit: 50,
  })

  const invoices = invoicesData?.data || []
  const updateStatus = useUpdateOrderStatus()

  // Approve action
  const handleApproveOrder = async (invoice: Invoice) => {
    try {
      await updateStatus.mutateAsync({
        id: invoice._id,
        status: 'completed',
      })
      toast.success(`تم اعتماد توريد الفاتورة ${invoice.invoiceCode} بنجاح`)
      if (detailsInvoice?._id === invoice._id) {
        setDetailsInvoice({ ...detailsInvoice, orderStatus: 'completed' })
      }
    } catch (err) {
      toast.error((err as Error)?.message || 'تعذر اعتماد الفاتورة')
    }
  }

  // Update status handler for details drawer
  const handleUpdateStatus = async (invoice: Invoice, newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({
        id: invoice._id,
        status: newStatus,
      })
      toast.success(`تم تغيير حالة الفاتورة إلى ${newStatus}`)
      if (detailsInvoice?._id === invoice._id) {
        setDetailsInvoice({ ...detailsInvoice, orderStatus: newStatus })
      }
    } catch (err) {
      toast.error((err as Error)?.message || 'تعذر تغيير حالة الفاتورة')
    }
  }

  // Export CSV
  const handleExportCsv = () => {
    if (invoices.length === 0) {
      toast.error('لا توجد فواتير لتصديرها')
      return
    }
    const headers = [
      'رقم الفاتورة',
      'العميل',
      'كود العميل',
      'المندوب',
      'المستودع',
      'حالة الطلب',
      'حالة السداد',
      'الإجمالي',
      'المسدد',
      'المتبقي',
      'تاريخ الإصدار',
    ]
    const rows = invoices.map((inv) => {
      const client = typeof inv.client === 'object' ? inv.client : null
      const seller = typeof inv.seller === 'object' ? inv.seller : null
      const remaining = Math.max(0, inv.totalPrice - (inv.totalPaid || 0))
      return [
        inv.invoiceCode,
        client?.organizeName || client?.name || 'عميل نقدي',
        client?.clientCode || '',
        seller?.name || '',
        inv.warehouse || '',
        inv.orderStatus,
        inv.paymentStatus,
        inv.totalPrice,
        inv.totalPaid || 0,
        remaining,
        new Date(inv.createdAt).toISOString().split('T')[0],
      ]
    })
    const csvContent = buildCsv(headers, rows)
    downloadCsv(`invoices-report-${new Date().toISOString().split('T')[0]}.csv`, csvContent)
    toast.success('تم تصدير كشف حسابات الفواتير بنجاح')
  }

  return (
    <div className="flex flex-col gap-5 pb-24 lg:pb-12">
      {/* Top Headline Strip on Desktop */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
            <span>لوحة العمليات</span>
            <span className="material-symbols-outlined text-[14px]">arrow_back_ios</span>
            <span className="text-secondary font-semibold">إدارة الفواتير والتحصيلات</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight mt-1">
            إدارة الفواتير والتحصيلات العامة
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            متابعة لحظية للتدفقات النقدية، أوامر التوريد الكيماوية، وجدولة التحصيلات البنكية على مستوى الفروع والمستودعات الإقليمية.
          </p>
        </div>

        {/* Desktop Global Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-11 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">
              file_download
            </span>
            <span>تصدير كشف حسابات (Excel/CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="h-11 px-5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">
              add_circle
            </span>
            <span>فاتورة جديدة</span>
          </button>
        </div>
      </div>

      {/* 1. Daily & Monthly KPI Overview (Split High Density on Mobile, 4-Card Grid on Desktop) */}
      <section>
        <DailyKpiCard stats={stats} isLoading={isStatsLoading} />
      </section>

      {/* 2. Interactive Filtering, Status Chips, and Search Toolbar */}
      <section className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-3.5 sm:p-4 shadow-sm">
        {/* Status Filter Pills (Horizontal Scroll on Mobile) */}
        <InvoiceStatusTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          stats={stats}
        />

        {/* Search & Date Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          {/* Search Box */}
          <div className="relative flex-1 bg-surface-container-low rounded-xl flex items-center px-3 h-11 border border-transparent focus-within:border-secondary focus-within:bg-surface-container-lowest transition-all">
            <span className="material-symbols-outlined text-outline text-[20px] ml-2">
              search
            </span>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث برقم الفاتورة، العميل، أو المندوب..."
              className="w-full bg-transparent text-on-surface placeholder-on-surface-variant text-body-md font-body-md focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="text-outline-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Warehouse Selector (Desktop / Tablet) */}
          <div className="flex items-center bg-surface-container-low rounded-xl px-3 h-11 gap-2 flex-shrink-0">
            <span className="material-symbols-outlined text-[18px] text-outline">
              warehouse
            </span>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer max-w-[200px]"
            >
              {WAREHOUSES_FILTER.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center bg-surface-container-low rounded-xl px-3 h-11 gap-1.5 flex-shrink-0">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              calendar_month
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* 3. Invoices List / Table Stream */}
      <section>
        {isInvoicesLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-on-surface-variant gap-3 bg-surface-container-lowest rounded-xl shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
            <span className="font-label-md text-label-md font-semibold">
              جارِ تحميل الفواتير وأوامر التوريد...
            </span>
          </div>
        ) : (
          <>
            {/* Mobile View (< lg): Stream of High-Density Cards matching petrokema_admin_6 */}
            <div className="flex flex-col gap-3 lg:hidden">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <InvoiceCard
                    key={inv._id}
                    invoice={inv}
                    onViewDetails={handleOpenDetails}
                    onAddPayment={setPaymentInvoice}
                    onApproveOrder={handleApproveOrder}
                    isApproving={updateStatus.isPending}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-lowest p-10 text-center shadow-sm">
                  <span className="material-symbols-outlined text-[44px] text-outline-variant">
                    receipt_long
                  </span>
                  <h4 className="mt-2 font-headline-sm text-headline-sm font-bold text-primary">
                    لا توجد فواتير مسجلة
                  </h4>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    جرب تغيير الفلتر أو إضافة أمر توريد جديد
                  </p>
                </div>
              )}
            </div>

            {/* Desktop View (>= lg): Data Table matching petrokema_web_admin_3 */}
            <div className="hidden lg:block">
              <InvoicesTable
                invoices={invoices}
                onViewDetails={handleOpenDetails}
                onAddPayment={setPaymentInvoice}
                onApproveOrder={handleApproveOrder}
                isApproving={updateStatus.isPending}
              />
            </div>
          </>
        )}
      </section>

      {/* 4. Sticky Floating Executive Actions Bar on Mobile matching petrokema_admin_6 lines 263-277 */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-4 py-2 pointer-events-none lg:hidden">
        <div className="pointer-events-auto bg-primary-container text-on-primary rounded-xl p-2.5 shadow-xl flex items-center justify-between gap-2 max-w-md mx-auto">
          {/* Fast New Invoice Trigger */}
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex-1 h-11 bg-secondary text-on-secondary rounded-lg font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">
              post_add
            </span>
            <span>إصدار أمر توريد جديد</span>
          </button>

          {/* Export Report CTA */}
          <button
            type="button"
            onClick={handleExportCsv}
            title="تصدير تقرير الفواتير"
            className="h-11 px-3 bg-primary-fixed/20 text-inverse-primary rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 active:bg-primary-fixed/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              file_download
            </span>
            <span className="font-label-sm text-label-sm bg-surface-container-lowest/15 px-1.5 py-0.5 rounded font-bold">
              CSV
            </span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <InvoiceDetailsModal
        invoice={detailsInvoice}
        isOpen={Boolean(detailsInvoice)}
        onClose={() => setDetailsInvoice(null)}
        initialTab={detailsInitialTab}
        onAddPayment={(inv) => {
          setPaymentInvoice(inv)
        }}
        onUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={updateStatus.isPending}
      />

      <AddPaymentModal
        invoice={paymentInvoice}
        isOpen={Boolean(paymentInvoice)}
        onClose={() => setPaymentInvoice(null)}
      />

      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  )
}
