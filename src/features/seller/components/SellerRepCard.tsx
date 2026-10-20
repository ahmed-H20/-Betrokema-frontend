import { useSellerContext } from '../SellerContext'

export function SellerRepCard() {
  const { performance, currentSeller, allSellers, activeSellerId, setActiveSellerId, isSellerRole } =
    useSellerContext()

  const seller = performance?.seller || currentSeller
  const repName = seller?.name || 'محمود عبد الرحمن السيد'
  const repCode = seller?.code || 'PK-REP: 40920'
  const repSector = seller?.sector || 'قطاع القاهرة الكبرى وجنوب الجيزة'
  const repTitle = seller?.title || 'مندوب مبيعات معتمد • قطاع التوزيع'

  return (
    <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
      {/* Brand Orange Gradient Top Strip */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-600 to-orange-500" />

      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
              <span className="material-symbols-outlined text-[26px]">badge</span>
            </div>
            {/* Live Active Status Dot */}
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-200" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base leading-tight">
              {repName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{repTitle}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
            {repCode}
          </span>
          {/* Admin Switcher if not a seller role */}
          {!isSellerRole && allSellers.length > 1 && (
            <select
              value={activeSellerId}
              onChange={(e) => setActiveSellerId(e.target.value)}
              className="text-[11px] bg-orange-50 text-orange-700 font-semibold border border-orange-200 rounded-lg px-2 py-0.5 focus:outline-none"
              title="تبديل المندوب للمعاينة"
            >
              {allSellers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Location, Sector and Live Sync Strip */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="material-symbols-outlined text-[16px] text-orange-500">
              location_on
            </span>
            <span className="font-medium text-slate-700">{repSector}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>نشط ميدانياً</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <span className="material-symbols-outlined text-[15px] text-slate-600">
              sync
            </span>
            <span>آخر مزامنة: منذ 4 دقائق</span>
          </div>
        </div>
      </div>
    </section>
  )
}
