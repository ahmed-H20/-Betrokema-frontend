import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInvoices } from '@/features/invoices/hooks'
import { formatNumber } from '@/lib/format'

export function ClientInvoicesPage() {
  const navigate = useNavigate()
  const { data: invoicesData, isLoading } = useInvoices()
  const [activeTab, setActiveTab] = useState<'pending' | 'credit'>('pending')

  const invoices = invoicesData?.data || []

  // Filter invoices for client
  const pendingInvoices = invoices.filter(
    (inv) => inv.orderStatus === 'pending' || inv.orderStatus === 'processing'
  )
  const creditInvoices = invoices.filter(
    (inv) => inv.paymentStatus === 'unpaid' || inv.paymentStatus === 'partially_paid'
  )

  const displayedInvoices = activeTab === 'pending' ? pendingInvoices : creditInvoices

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Title Header */}
      <section className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => navigate('/client')}
          className="w-10 h-10 rounded-full bg-[#eef4fd] flex items-center justify-center text-slate-700 hover:bg-blue-100 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        <div className="flex-1 text-center px-2">
          <h1 className="text-xl font-bold text-[#0b1d33] leading-tight">طلباتي وفواتيري</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            متابعة الفواتير وأوامر التوريد المعتمدة
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-[#e7f0fa] flex items-center justify-center text-[#2563eb] shrink-0">
          <span className="material-symbols-outlined text-[22px]">receipt_long</span>
        </div>
      </section>

      {/* Tab Switcher matching petrokema_client_mobile_2 and 3 */}
      <div className="flex rounded-xl bg-slate-200/80 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">pending_actions</span>
          <span>فواتير قيد الطلب ({pendingInvoices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credit')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'credit'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
          <span>الفواتير الآجلة ({creditInvoices.length})</span>
        </button>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
            جاري تحميل سجل الفواتير وأوامر التوريد...
          </div>
        ) : displayedInvoices.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
            <span className="material-symbols-outlined text-[36px] text-slate-300">
              receipt_long
            </span>
            <p className="text-xs text-slate-600 font-bold">لا توجد فواتير في هذا القسم</p>
            <p className="text-[11px] text-slate-400">
              يمكنك طلب دهانات وأصناف جديدة مباشرة من الكتالوج
            </p>
          </div>
        ) : (
          displayedInvoices.map((inv) => {
            const isPaid = inv.paymentStatus === 'paid'
            const rem = Math.max(0, inv.totalPrice - inv.totalPaid)

            return (
              <article
                key={inv._id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm font-mono">
                        {inv.invoiceCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isPaid ? 'مسددة' : `متبقي ${formatNumber(rem)} ج.م`}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(
                        new Date(inv.createdAt)
                      )}{' '}
                      • {inv.warehouse || 'المستودع الرئيسي'}
                    </span>
                  </div>

                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block font-medium">الإجمالي</span>
                    <span className="text-base font-bold text-orange-600 font-mono">
                      {formatNumber(inv.totalPrice)}{' '}
                      <span className="text-xs font-normal text-slate-500">ج.م</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    عدد الأصناف: {inv.products?.length || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-slate-700 hover:text-orange-600 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[15px]">print</span>
                    <span>طباعة الفاتورة</span>
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
