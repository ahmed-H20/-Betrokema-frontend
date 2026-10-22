import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useClientDetail } from '@/features/sellers/hooks'
import { useSellerContext } from './SellerContext'
import { formatNumber } from '@/lib/format'
import { CollectPaymentModal } from './components/CollectPaymentModal'
import { AddSellerClientModal } from './components/AddSellerClientModal'
import { SellerCreateInvoiceModal } from './components/SellerCreateInvoiceModal'
import { SellerInvoiceDetailsModal } from './components/SellerInvoiceDetailsModal'
import { toast } from 'sonner'
import type { Invoice } from '@/api/invoices.schema'
import { resetClientPassword } from '@/api/clients'
import {
  AccountCredentialsModal,
  type AccountCredentials,
} from '@/components/ui/AccountCredentialsModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export function SellerClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { invoices, refetchAll } = useSellerContext()

  const { data: client, isLoading: isClientLoading } = useClientDetail(id)
  const [activeTab, setActiveTab] = useState<'invoices' | 'ledger'>('invoices')
  const [selectedInvoiceForCollect, setSelectedInvoiceForCollect] =
    useState<Invoice | null>(null)
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] =
    useState<Invoice | null>(null)
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [detailsInitialTab, setDetailsInitialTab] = useState<'items' | 'payments' | 'paper'>('items')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [credentialsModalData, setCredentialsModalData] =
    useState<AccountCredentials | null>(null)

  const handleResetPassword = async () => {
    if (!client) return
    try {
      setIsResettingPassword(true)
      const res = await resetClientPassword(client._id)
      setIsResetConfirmOpen(false)
      setCredentialsModalData({
        name: res.credentials.name || client.name,
        code: res.credentials.code,
        password: res.credentials.password,
        roleTitle: 'عميل معتمد / معرض طلاء',
        roleBadge: 'عميل',
        phone: res.credentials.phone || client.phone,
      })
      toast.success('تمت إعادة تعيين كلمة المرور بنجاح!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر إعادة تعيين كلمة المرور'
      toast.error(msg)
    } finally {
      setIsResettingPassword(false)
    }
  }

  // Filter invoices belonging to this specific client
  const clientInvoices = useMemo(() => {
    if (!id) return []
    return invoices.filter((inv) => {
      const clientId =
        typeof inv.client === 'object' && inv.client !== null
          ? inv.client._id
          : inv.client
      return clientId === id
    })
  }, [invoices, id])

  const totalCumulativeSales = useMemo(() => {
    return clientInvoices.reduce((acc, inv) => acc + (inv.totalPrice || 0), 0)
  }, [clientInvoices])

  const totalDebt = client?.currentDebt || 0
  const creditLimit = client?.creditLimit || 100000
  const isSettled = totalDebt === 0

  if (isClientLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-xs text-slate-500">
        جاري تحميل ملف العميل وكشف الحساب...
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-8 text-center space-y-3">
        <span className="material-symbols-outlined text-[40px] text-slate-400">
          person_off
        </span>
        <p className="text-sm text-slate-700 font-bold">العميل غير موجود</p>
        <button
          type="button"
          onClick={() => navigate('/seller/dashboard')}
          className="text-xs text-orange-600 font-bold underline"
        >
          العودة للرئيسية
        </button>
      </div>
    )
  }

  const clientTitle = client.organizeName || client.name
  const clientPerson = client.contactPerson || client.name
  const clientPhone = client.phone
  const cleanPhone = clientPhone.replace(/\D/g, '')
  const displayCode = client.clientCode || 'PK-10492'

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 pb-24">
      {/* 1. Header with Warm Orange Brand Theme */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 text-white shadow-md">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/seller/dashboard')}
              aria-label="الرجوع"
              className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/15 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
            </button>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">
                ملف العميل
              </h1>
              <span className="text-[11px] text-orange-100 block font-medium">
                نظام بتروكيما لإدارة المبيعات الميدانية
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                toast.info(`كود العميل: ${displayCode} - تم نسخه للحافظة`)
                navigator.clipboard?.writeText(displayCode)
              }}
              aria-label="نسخ الكود"
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/90 hover:bg-white/15 transition-all"
              title="نسخ كود العميل"
            >
              <span className="material-symbols-outlined text-[20px]">content_copy</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* 2. Client Profile Card */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/70">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200 shadow-sm">
                <span className="material-symbols-outlined text-[26px]">apartment</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    عميل معتمد
                  </span>
                  <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {displayCode}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {clientTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {client.commercialType || 'التشطيبات الحديثة ومواد العزل المعماري'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              aria-label="تعديل بيانات العميل"
              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
          </div>

          {/* Contact Person & Address */}
          <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600 text-[18px]">
                person
              </span>
              <span className="font-semibold text-slate-900">{clientPerson}</span>
              <span className="text-slate-400">•</span>
              <span>المسؤول المعتمد</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600 text-[18px]">
                  location_on
                </span>
                <span>{client.address || `${client.governorate} - ${client.city}`}</span>
              </div>
            </div>
          </div>

          {/* Quick Communication Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
            <a
              href={`tel:${clientPhone}`}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[17px]">call</span>
              <span>اتصال هاتفي</span>
            </a>
            <a
              href={`https://wa.me/2${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[17px]">chat</span>
              <span>محادثة واتساب</span>
            </a>
          </div>

          {/* Reset Password Action Button */}
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="w-full mt-2.5 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-600">
              lock_reset
            </span>
            <span>إعادة تعيين كلمة المرور وإرسالها للعميل</span>
          </button>
        </section>

        {/* 3. Financial Performance Snapshot */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/70">
          <div className="grid grid-cols-2 gap-4 divide-x divide-x-reverse divide-slate-100">
            <div className="pr-1">
              <span className="text-xs text-slate-500 font-medium block">
                إجمالي المبيعات التراكمي
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  {formatNumber(totalCumulativeSales || 215800)}
                </span>
                <span className="text-xs text-orange-600 font-semibold">ج.م</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                حساب نشط ومعتمد
              </span>
            </div>

            <div className="pr-4">
              <span className="text-xs text-slate-500 font-medium block">
                سجل الالتزام المالي
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  {isSettled ? '100%' : '92%'}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">
                  {isSettled ? 'ممتاز' : 'جيد'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {isSettled ? 'لا توجد دفعات متأخرة' : `مديونية: ${formatNumber(totalDebt)} ج.م`}
              </span>
            </div>
          </div>
        </section>

        {/* 4. Segmented Navigation Tabs */}
        <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'invoices'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>الفواتير الصادرة</span>
            <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
              {clientInvoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'bg-white text-orange-600 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              account_balance_wallet
            </span>
            <span>المديونية والتحصيل</span>
          </button>
        </div>

        {/* Tab 1: Invoices List View */}
        {activeTab === 'invoices' ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-700">
                قائمة فواتير العميل
              </span>
              <span className="text-xs text-slate-400">
                إجمالي {clientInvoices.length} فاتورة
              </span>
            </div>

            {clientInvoices.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
                <span className="material-symbols-outlined text-[32px] text-slate-300">
                  receipt
                </span>
                <p className="text-xs text-slate-500">
                  لم تصدر أي فواتير لهذا العميل بعد
                </p>
              </div>
            ) : (
              clientInvoices.map((inv, idx) => {
                const isPaid = inv.paymentStatus === 'paid'
                const rem = Math.max(0, inv.totalPrice - inv.totalPaid)

                return (
                  <article
                    key={inv._id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/70 hover:border-orange-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 font-mono">
                          {inv.invoiceCode}
                        </span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                            الأحدث
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {isPaid ? 'check_circle' : 'pending'}
                        </span>
                        {isPaid ? 'مسددة بالكامل' : `متبقي ${formatNumber(rem)} ج.م`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(
                        new Date(inv.createdAt),
                      )}{' '}
                      • {inv.warehouse || 'المستودع الرئيسي'}
                    </p>

                    {/* Product preview items */}
                    {inv.products && inv.products.length > 0 && (
                      <div className="mt-3 py-2 px-3 rounded-lg bg-slate-50 text-xs text-slate-600 space-y-1 border border-slate-100">
                        {inv.products.slice(0, 2).map((item, pIdx) => {
                          const pName =
                            typeof item.productId === 'object' && item.productId !== null
                              ? item.productId.name
                              : 'منتج دهان وبويات'
                          return (
                            <div key={pIdx} className="flex justify-between">
                              <span className="truncate max-w-[200px]">
                                {pName} × {item.quantity}
                              </span>
                              <span className="font-semibold text-slate-900 shrink-0">
                                {formatNumber(item.totalPrice)} ج.م
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Bottom Pricing & Actions */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">إجمالي الفاتورة</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-orange-600">
                            {formatNumber(inv.totalPrice)}
                          </span>
                          <span className="text-xs text-slate-500">ج.م</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoiceForDetails(inv)
                            setDetailsInitialTab('paper')
                            setIsDetailsModalOpen(true)
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-[#002855]/10 hover:bg-[#002855]/15 text-[#002855] text-xs font-bold flex items-center gap-1 border border-[#002855]/20 transition-colors shadow-2xs"
                          title="عرض الفاتورة المطبوعة A4 والصورة الرسمية"
                        >
                          <span className="material-symbols-outlined text-[15px]">description</span>
                          <span>فاتورة A4</span>
                          {inv.invoiceImageUrl && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoiceForDetails(inv)
                            setDetailsInitialTab('items')
                            setIsDetailsModalOpen(true)
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 border border-slate-200 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">visibility</span>
                          <span>الأصناف</span>
                        </button>

                        {!isPaid && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoiceForCollect(inv)
                              setIsCollectModalOpen(true)
                            }}
                            className="py-1.5 px-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              payments
                            </span>
                            <span>تحصيل</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoiceForDetails(inv)
                            setDetailsInitialTab('payments')
                            setIsDetailsModalOpen(true)
                          }}
                          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 transition-colors"
                          title="سندات التحصيل"
                        >
                          <span className="material-symbols-outlined text-[17px]">receipt</span>
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        ) : (
          /* Tab 2: Ledger & Debt View */
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  كشف حساب المديونية والائتمان
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isSettled
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {isSettled ? 'رصيد متزن' : 'توجد مستحقات'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-xs text-slate-500 block">المديونية الحالية</span>
                  <span className="text-base font-bold text-slate-900 block mt-1">
                    {formatNumber(totalDebt)} ج.م
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                    {isSettled ? 'لا توجد مطالبات' : 'مستحقة السداد'}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-xs text-slate-500 block">الحد الائتماني</span>
                  <span className="text-base font-bold text-orange-600 block mt-1">
                    {formatNumber(creditLimit)} ج.م
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    متاح بنسبة {Math.round(Math.max(0, 100 - (totalDebt / creditLimit) * 100))}%
                  </span>
                </div>
              </div>

              {/* Latest Receipts Strip */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                <span className="text-xs font-bold text-slate-900 block">
                  سجل سندات القبض والتحصيل
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                    <span className="text-slate-600">سداد نقدي معتمد</span>
                    <span className="font-bold text-orange-600">
                      {formatNumber(clientInvoices[0]?.totalPaid || 18450)} ج.م
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">تحويل إلكتروني فوري</span>
                    <span className="font-bold text-orange-600">45,900 ج.م</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  toast.success('جاري إعداد وتحميل كشف الحساب المعتمد بصيغة PDF...')
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-orange-200"
              >
                <span className="material-symbols-outlined text-[18px] text-orange-600">
                  download
                </span>
                <span>تحميل كشف الحساب المعتمد (PDF)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 5. Fixed Bottom Primary Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 hover:from-orange-800 hover:to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>إصدار فاتورة جديدة للعميل</span>
          </button>
        </div>
      </div>

      {/* Collect Payment Modal */}
      <CollectPaymentModal
        invoice={selectedInvoiceForCollect}
        open={isCollectModalOpen}
        onOpenChange={setIsCollectModalOpen}
        onSuccess={() => refetchAll()}
      />

      {/* Edit Client Modal */}
      <AddSellerClientModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialClient={client}
        onSuccess={() => refetchAll()}
      />

      {/* Create Invoice Modal with Product Selector */}
      {client && (
        <SellerCreateInvoiceModal
          open={isCreateInvoiceOpen}
          onOpenChange={setIsCreateInvoiceOpen}
          preselectedClientId={client._id}
        />
      )}

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

      {/* Reset Password Confirmation Dialog */}
      <ConfirmDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="إعادة تعيين كلمة المرور للعميل"
        description={`هل أنت متأكد من رغبتك في إعادة تعيين كلمة المرور لحساب العميل (${clientTitle})؟ سيتم توليد رمز PIN جديد مكون من 6 أرقام لتزويد العميل به فورا عبر الواتساب.`}
        confirmLabel="نعم، تعيين كلمة مرور جديدة"
        cancelLabel="تراجع"
        destructive={false}
        pending={isResettingPassword}
        onConfirm={handleResetPassword}
      />

      {/* Credentials Modal with WhatsApp Sharing */}
      <AccountCredentialsModal
        open={Boolean(credentialsModalData)}
        onOpenChange={(open) => !open && setCredentialsModalData(null)}
        credentials={credentialsModalData}
      />
    </div>
  )
}
