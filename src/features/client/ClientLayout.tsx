import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { ClientCartProvider, useClientCart } from './ClientCartContext'

interface ClientNavTab {
  path: string
  label: string
  icon: string
  exact?: boolean
}

const CLIENT_NAV_TABS: ClientNavTab[] = [
  { path: '/client', label: 'الرئيسية', icon: 'home', exact: true },
  { path: '/client/invoices', label: 'طلباتي', icon: 'receipt_long' },
  { path: '/client/profile', label: 'حسابي', icon: 'person' },
]

function ClientLayoutHeaderAndNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { totalCount, setIsCartOpen } = useClientCart()

  const isCurrentTab = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const isAdminOrSeller = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'seller'

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col antialiased overflow-x-hidden selection:bg-orange-100">
      {/* 1. Mobile & Web Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
        <div className="h-16 px-4 max-w-md mx-auto md:max-w-4xl flex items-center justify-between">
          {/* Logo Side (Right in RTL) */}
          <button
            type="button"
            onClick={() => navigate('/client')}
            className="flex items-center gap-2 text-right"
          >
            <img
              src="/logo.png"
              alt="بتروكيما Petrokema"
              className="h-8 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xs text-slate-900 font-bold leading-tight">
                بتروكيما
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                بوابة طلبات الدهانات
              </span>
            </div>
          </button>

          {/* Actions Side (Left in RTL) */}
          <div className="flex items-center gap-2">
            {/* Admin or Seller Back Switch */}
            {isAdminOrSeller && (
              <NavLink
                to={user?.role === 'seller' ? '/seller/dashboard' : '/products'}
                className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors"
                title="الرجوع للوحة العمليات"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {user?.role === 'seller' ? 'badge' : 'admin_panel_settings'}
                </span>
                <span>{user?.role === 'seller' ? 'لوحة المندوب' : 'لوحة الإدارة'}</span>
              </NavLink>
            )}

            {/* Shopping Cart Button with Count Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="سلة الطلبات"
                className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center justify-center transition-colors relative border border-orange-200 active:scale-95"
              >
                <span className="material-symbols-outlined text-[22px]">
                  shopping_bag
                </span>
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-in zoom-in-75">
                    {totalCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Avatar & Logout */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate('/client/profile')}
                className="w-9 h-9 rounded-xl bg-[#0b1c2d] text-white flex items-center justify-center shadow-xs hover:opacity-90 transition-opacity"
                title={user?.name || 'حسابي'}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
              </button>
              <button
                type="button"
                onClick={logout}
                title="تسجيل الخروج"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto md:max-w-4xl px-3.5 pt-3 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
        <Outlet />
      </main>

      {/* 3. Mobile Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
        <div className="h-14 max-w-md mx-auto px-6 grid grid-cols-3 items-center">
          {CLIENT_NAV_TABS.map((tab) => {
            const active = isCurrentTab(tab.path, tab.exact)
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  active ? 'text-orange-600 font-bold' : 'text-slate-500 font-medium'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
                <span className="text-[11px] leading-none">{tab.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export function ClientLayout() {
  return (
    <ClientCartProvider>
      <ClientLayoutHeaderAndNav />
    </ClientCartProvider>
  )
}
