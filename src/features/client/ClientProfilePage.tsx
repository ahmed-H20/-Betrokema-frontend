import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { formatNumber } from '@/lib/format'

export function ClientProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const clientName = user?.name || 'م. أحمد خليل'
  const organizationName = (user as any)?.clientProfile?.organizeName || 'شركة الأفق للمقاولات العامة والدهانات'
  const phone = user?.phone || '01004569920'
  const clientCode = user?.code || 'PK-CUST-10492'
  const commercialType = (user as any)?.clientProfile?.commercialType || 'مقاولو التشطيبات والدهانات'
  const creditLimit = (user as any)?.clientProfile?.creditLimit || 250000
  const currentDebt = (user as any)?.clientProfile?.currentDebt || 64200

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Title & Status */}
      <section className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => navigate('/client')}
          className="w-10 h-10 rounded-full bg-[#eef4fd] flex items-center justify-center text-slate-700 hover:bg-blue-100 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        <div className="flex-1 text-center px-2">
          <h1 className="text-xl font-bold text-[#0b1d33] leading-tight">حسابي ومعلومات المنشأة</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            إدارة بيانات العميل والموقف المالي
          </p>
        </div>

        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <span className="material-symbols-outlined text-[14px]">verified</span>
          <span>معتمد</span>
        </div>
      </section>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#0b1c2d] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <span className="material-symbols-outlined text-[28px]">storefront</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {clientCode}
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">{clientName}</h2>
            <p className="text-xs text-slate-500">{organizationName}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[10px]">نوع النشاط:</span>
            <strong className="text-slate-800 font-semibold">{commercialType}</strong>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[10px]">رقم الهاتف:</span>
            <strong className="text-slate-800 font-mono" dir="ltr">{phone}</strong>
          </div>
        </div>
      </div>

      {/* Credit & Financial Health Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-orange-400">
              account_balance_wallet
            </span>
            <span className="text-xs font-bold text-white">الموقف المالي والائتماني</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            حساب منتظم
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <span className="text-slate-400 block text-[10px]">المديونية الحالية:</span>
            <span className="text-xl font-bold text-orange-400 font-mono">
              {formatNumber(currentDebt)} ج.م
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">الحد الائتماني المتاح:</span>
            <span className="text-base font-bold text-slate-200 font-mono">
              {formatNumber(creditLimit)} ج.م
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700/80">
          <div className="flex justify-between items-center text-[10px] text-slate-300 mb-1">
            <span>نسبة الاستهلاك من سقف الائتمان</span>
            <span className="font-bold text-orange-300">
              {Math.round((currentDebt / creditLimit) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full"
              style={{ width: `${Math.min(100, Math.round((currentDebt / creditLimit) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Support & Logout Actions */}
      <div className="space-y-2">
        <a
          href="tel:01004569920"
          className="w-full h-11 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] text-orange-600">call</span>
          <span>الاتصال بمندوب بتروكيما الميداني</span>
        </a>

        <button
          type="button"
          onClick={logout}
          className="w-full h-11 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 border border-rose-200 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>تسجيل الخروج من الحساب</span>
        </button>
      </div>
    </div>
  )
}
