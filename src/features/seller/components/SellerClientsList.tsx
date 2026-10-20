import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSellerContext } from '../SellerContext'
import { formatNumber } from '@/lib/format'
import { AddSellerClientModal } from './AddSellerClientModal'
import { SellerCreateInvoiceModal } from './SellerCreateInvoiceModal'

export function SellerClientsList() {
  const { clients, isLoading } = useSellerContext()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedClientIdForInvoice, setSelectedClientIdForInvoice] = useState<
    string | undefined
  >(undefined)
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)

  // Filter clients by search query and type
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.organizeName.toLowerCase().includes(q) ||
        (c.clientCode && c.clientCode.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))

      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'debt' && (c.currentDebt || 0) > 0) ||
        (filterType === 'regular' && (c.currentDebt || 0) === 0)

      return matchesSearch && matchesFilter
    })
  }, [clients, search, filterType])

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize))
  const paginatedClients = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredClients.slice(start, start + pageSize)
  }, [filteredClients, page, pageSize])

  return (
    <section className="flex flex-col gap-3 mt-1">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-sm">
            العملاء المعتمدين بالقطاع
          </h3>
          <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 font-bold px-2 py-0.5 rounded-full">
            {clients.length} عميل نشط
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilterType(filterType === 'all' ? 'debt' : 'all')}
            className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-1 rounded-lg border transition-colors ${
              filterType !== 'all'
                ? 'bg-orange-600 text-white border-orange-600'
                : 'text-orange-600 bg-orange-50/60 border-orange-200 hover:bg-orange-100'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">filter_list</span>
            <span>{filterType === 'debt' ? 'المديونيات' : 'تصفية'}</span>
          </button>
        </div>
      </div>

      {/* Instant Search Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="ابحث باسم العميل، الكود، أو المنطقة..."
          className="w-full pr-10 pl-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm transition-all"
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

      {/* Clients Cards Stream */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
            جاري تحميل محفظة العملاء...
          </div>
        ) : paginatedClients.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
            <span className="material-symbols-outlined text-[32px] text-slate-300">
              person_search
            </span>
            <p className="text-xs text-slate-500">لا توجد منشآت مطابقة لبحثك</p>
          </div>
        ) : (
          paginatedClients.map((client) => {
            const clientTitle = client.organizeName || client.name
            const clientLoc = client.address || `${client.governorate} - ${client.city}`
            const clientTag = client.commercialType || client.tier || 'موزع معتمد'
            const displayCode = client.clientCode || 'PK-10492'

            return (
              <div
                key={client._id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] flex flex-col gap-3 transition-transform active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 border border-orange-100">
                      <span className="material-symbols-outlined text-[20px]">store</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug truncate">
                        {clientTitle}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0">
                          location_on
                        </span>
                        <span className="truncate">{clientLoc}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {clientTag}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                          {displayCode}
                        </span>
                        {client.currentDebt && client.currentDebt > 0 ? (
                          <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                            مديونية: {formatNumber(client.currentDebt)} ج.م
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] text-slate-400">الحد الائتماني</span>
                    <span className="text-sm font-bold text-orange-600 tracking-tight">
                      {formatNumber(client.creditLimit || 100000)}{' '}
                      <span className="text-[10px] font-medium text-slate-500">ج.م</span>
                    </span>
                  </div>
                </div>

                {/* Client Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/seller/clients/${client._id}`)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-500">
                      description
                    </span>
                    <span>عرض الفواتير</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClientIdForInvoice(client._id)
                      setIsCreateInvoiceOpen(true)
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add_circle
                    </span>
                    <span>+ إضافة فاتورة</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination & Add Client Buttons */}
      <section className="flex flex-col gap-3 pt-1">
        {/* Pagination Strip */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-white rounded-xl border border-slate-100 text-xs text-slate-600">
            <span>
              عرض {(page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, filteredClients.length)} من أصل{' '}
              {filteredClients.length} عميل
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="السابق"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
              <span className="w-7 h-7 rounded-lg bg-orange-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {page}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="التالي"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
            </div>
          </div>
        )}

        {/* Wide Prominent Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/25 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span>+ تسجيل عميل ميداني جديد</span>
          </button>
        </div>
      </section>

      {/* Add Client Modal */}
      <AddSellerClientModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      {/* Create Invoice Modal */}
      <SellerCreateInvoiceModal
        open={isCreateInvoiceOpen}
        onOpenChange={setIsCreateInvoiceOpen}
        preselectedClientId={selectedClientIdForInvoice}
      />
    </section>
  )
}
