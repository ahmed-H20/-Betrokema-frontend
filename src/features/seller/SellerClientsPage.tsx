import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSellerContext } from './SellerContext'
import { formatNumber } from '@/lib/format'
import { AddSellerClientModal } from './components/AddSellerClientModal'
import { SellerCreateInvoiceModal } from './components/SellerCreateInvoiceModal'
import type { Client } from '@/api/clients.schema'
import { resetClientPassword } from '@/api/clients'
import {
  AccountCredentialsModal,
  type AccountCredentials,
} from '@/components/ui/AccountCredentialsModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { toast } from 'sonner'

export function SellerClientsPage() {
  const { clients, totalDebt, overCreditCount, isLoading, refetchAll } = useSellerContext()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'debt' | 'over_credit' | 'settled'>(
    'all',
  )
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClientIdForInvoice, setSelectedClientIdForInvoice] = useState<
    string | undefined
  >(undefined)
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const [clientToResetPassword, setClientToResetPassword] = useState<Client | null>(null)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [credentialsModalData, setCredentialsModalData] =
    useState<AccountCredentials | null>(null)

  const handleResetPassword = async () => {
    if (!clientToResetPassword) return
    try {
      setIsResettingPassword(true)
      const res = await resetClientPassword(clientToResetPassword._id)
      const clientRef = clientToResetPassword
      setClientToResetPassword(null)
      setCredentialsModalData({
        name: res.credentials.name || clientRef.name,
        code: res.credentials.code,
        password: res.credentials.password,
        roleTitle: 'عميل معتمد / معرض طلاء',
        roleBadge: 'عميل',
        phone: res.credentials.phone || clientRef.phone,
      })
      toast.success('تمت إعادة تعيين كلمة المرور بنجاح!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر إعادة تعيين كلمة المرور'
      toast.error(msg)
    } finally {
      setIsResettingPassword(false)
    }
  }

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.organizeName.toLowerCase().includes(q) ||
        (c.clientCode && c.clientCode.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))

      const cDebt = c.currentDebt || 0
      const cLimit = c.creditLimit || 100000

      const matchesFilter =
        filterTab === 'all' ||
        (filterTab === 'debt' && cDebt > 0) ||
        (filterTab === 'over_credit' && cDebt > cLimit) ||
        (filterTab === 'settled' && cDebt === 0)

      return matchesSearch && matchesFilter
    })
  }, [clients, search, filterTab])

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto w-full md:max-w-5xl pb-16">
      {/* 1. Header & Page Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              محفظة العملاء الميدانيين
            </h1>
            <p className="text-xs text-slate-500">
              إدارة المنشآت والحدود الائتمانية والتحصيلات الميدانية
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingClient(null)
              setIsAddModalOpen(true)
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ تسجيل عميل جديد</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metrics Bento (matching _1 and petrokema_1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Total Clients */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">groups</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">
              العملاء المعتمدين
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-900">
                {clients.length}
              </span>
              <span className="text-[10px] text-slate-500">منشأة</span>
            </div>
          </div>
        </div>

        {/* Total Portfolio Debt */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">
              account_balance_wallet
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">
              إجمالي مديونية المحفظة
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-rose-600">
                {formatNumber(totalDebt)}
              </span>
              <span className="text-[10px] text-slate-500">ج.م</span>
            </div>
          </div>
        </div>

        {/* Over-Credit Alert */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">
              warning
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">
              تجاوزوا الحد الائتماني
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-amber-700">
                {overCreditCount}
              </span>
              <span className="text-[10px] text-slate-500">عميل يحتاج متابعة</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search and Multi-Filter Bar */}
      <div className="flex flex-col gap-2.5">
        {/* Instant Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المنشأة، كود العميل، رقم الهاتف أو المنطقة..."
            className="w-full pr-10 pl-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 shadow-sm"
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

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'جميع العملاء' },
            { id: 'debt', label: 'مديونيات مستحقة' },
            { id: 'over_credit', label: 'تجاوزوا الائتمان' },
            { id: 'settled', label: 'حسابات مسددة' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === tab.id
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Clients Cards List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
            جاري تحميل محفظة العملاء...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
            <span className="material-symbols-outlined text-[32px] text-slate-300">
              person_search
            </span>
            <p className="text-xs text-slate-500">لا توجد منشآت مطابقة للبحث أو التصفية</p>
          </div>
        ) : (
          filteredClients.map((client) => {
            const clientTitle = client.organizeName || client.name
            const clientContact = client.contactPerson || client.name
            const clientLoc = client.address || `${client.governorate} - ${client.city}`
            const clientTag = client.commercialType || client.tier || 'موزع معتمد'
            const displayCode = client.clientCode || 'PK-10492'
            const debt = client.currentDebt || 0
            const limit = client.creditLimit || 100000
            const isOver = debt > limit
            const usedPercent = Math.min(100, Math.round((debt / limit) * 100))

            return (
              <article
                key={client._id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] space-y-3 transition-transform active:scale-[0.99]"
              >
                {/* Header: Icon + Name + Code */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                      <span className="material-symbols-outlined text-[24px]">
                        apartment
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {clientTag}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          {displayCode}
                        </span>
                        {isOver && (
                          <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                            تجاوز الائتمان!
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">
                        {clientTitle}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0">
                          location_on
                        </span>
                        <span className="truncate">{clientLoc}</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact & Edit & Reset Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setClientToResetPassword(client)}
                      className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center justify-center border border-amber-200 transition-colors"
                      title="إعادة تعيين كلمة المرور للعميل"
                    >
                      <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingClient(client)
                        setIsAddModalOpen(true)
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center border border-slate-200 transition-colors"
                      title="تعديل بيانات العميل"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <a
                      href={`tel:${client.phone}`}
                      className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center justify-center border border-orange-200 transition-colors"
                      title="اتصال هاتفي"
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                    </a>
                    <a
                      href={`https://wa.me/2${client.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center border border-emerald-200 transition-colors"
                      title="محادثة واتساب"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                    </a>
                  </div>
                </div>

                {/* Credit Gauge & Financial Snapshot */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">
                      المسؤول: <strong className="text-slate-800">{clientContact}</strong>
                    </span>
                    <span className="text-slate-600">
                      المديونية:{' '}
                      <strong className={debt > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {formatNumber(debt)} ج.م
                      </strong>
                    </span>
                  </div>

                  {/* Credit limit progress bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : usedPercent > 70
                            ? 'bg-amber-500'
                            : 'bg-orange-500'
                      }`}
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>مستهلك {usedPercent}% من التسهيل</span>
                    <span>الحد الائتماني: {formatNumber(limit)} ج.م</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/seller/clients/${client._id}`)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-500">
                      visibility
                    </span>
                    <span>كشف الحساب والفواتير</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClientIdForInvoice(client._id)
                      setIsCreateInvoiceOpen(true)
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add_circle
                    </span>
                    <span>+ إصدار فاتورة</span>
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom,0px))] left-4 z-40 sm:hidden">
        <button
          type="button"
          onClick={() => {
            setEditingClient(null)
            setIsAddModalOpen(true)
          }}
          className="h-12 px-4 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/30 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>+ تسجيل عميل</span>
        </button>
      </div>

      {/* Add / Edit Client Modal */}
      <AddSellerClientModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        initialClient={editingClient}
        onSuccess={() => refetchAll()}
      />

      {/* Create Invoice Modal */}
      <SellerCreateInvoiceModal
        open={isCreateInvoiceOpen}
        onOpenChange={setIsCreateInvoiceOpen}
        preselectedClientId={selectedClientIdForInvoice}
      />

      {/* Reset Password Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(clientToResetPassword)}
        onOpenChange={(open) => !open && setClientToResetPassword(null)}
        title="إعادة تعيين كلمة المرور للعميل"
        description={`هل أنت متأكد من رغبتك في إعادة تعيين كلمة المرور لحساب (${clientToResetPassword?.name || clientToResetPassword?.organizeName || ''})؟ سيتم توليد رمز PIN جديد مكون من 6 أرقام لتزويده به عبر الواتساب.`}
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
