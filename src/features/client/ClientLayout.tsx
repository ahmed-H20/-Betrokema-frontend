import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { ClientCartProvider, useClientCart } from './ClientCartContext'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { NotificationBell } from '@/features/notifications'

interface ClientNavTab {
  path: string
  label: string
  icon: string
  exact?: boolean
}

const CLIENT_NAV_TABS: ClientNavTab[] = [
  { path: '/client', label: 'كتالوج المنتجات', icon: 'palette', exact: true },
  { path: '/client/invoices', label: 'طلباتي وفواتيري', icon: 'receipt_long' },
  { path: '/client/profile', label: 'حسابي والمنشأة', icon: 'person' },
]

function ClientLayoutHeaderAndNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { totalCount, setIsCartOpen } = useClientCart()

  const isCurrentTab = (path: string, exact?: boolean) => {
    if (path === '/client') {
      return location.pathname === '/client' || location.pathname === '/client/catalog'
    }
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const clientName = user?.name || 'العميل'
  const organizationName = (user as any)?.clientProfile?.organizeName || ''
  const clientCode = user?.code || (user as any)?.clientProfile?.clientCode || ''

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col antialiased overflow-x-hidden selection:bg-orange-100">
      {/* 1. Desktop & Mobile Header with Desktop Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="h-16 px-4 sm:px-6 max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo Side (Right in RTL) */}
          <button
            type="button"
            onClick={() => navigate('/client')}
            className="flex items-center gap-2.5 text-right shrink-0 group cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="بتروكيما Petrokema"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-sm text-slate-900 font-black leading-tight tracking-tight">
                بتروكيما
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                بوابة طلبات الدهانات والعملاء
              </span>
            </div>
          </button>

          {/* Desktop Center Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            {CLIENT_NAV_TABS.map((tab) => {
              const active = isCurrentTab(tab.path, tab.exact)
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-white text-orange-600 shadow-xs ring-1 ring-slate-900/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[19px]"
                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* Actions Side (Left in RTL) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Desktop Client Badge info */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
              <div className="text-left text-xs">
                <span className="font-bold text-slate-800 block leading-tight truncate max-w-[140px]">
                  {organizationName || clientName}
                </span>
                {clientCode && (
                  <span className="text-[10px] font-mono text-orange-700 bg-orange-50 px-1 rounded font-semibold">
                    {clientCode}
                  </span>
                )}
              </div>
            </div>

            {/* Shopping Cart Button with Count Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="سلة الطلبات"
                className="h-10 px-3 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center justify-center gap-1.5 transition-colors relative border border-orange-200 active:scale-95 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[20px]">
                  shopping_bag
                </span>
                <span className="text-xs font-bold hidden sm:inline">السلة</span>
                {totalCount > 0 && (
                  <span className="bg-orange-600 text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center ring-2 ring-white animate-in zoom-in-75">
                    {totalCount}
                  </span>
                )}
              </button>
            </div>

            {/* Notification Bell */}
            <NotificationBell buttonClassName="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 hover:text-orange-600 hover:bg-orange-50 flex items-center justify-center transition-colors relative border border-slate-200 cursor-pointer shadow-2xs" />

            {/* Profile Avatar & Logout */}
            <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2">
              <button
                type="button"
                onClick={() => navigate('/client/profile')}
                className="hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                title={clientName}
              >
                <UserAvatar
                  alt={clientName}
                  sizeClassName="w-9 h-9"
                  shape="rounded"
                />
              </button>
              <button
                type="button"
                onClick={logout}
                title="تسجيل الخروج"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
        <Outlet />
      </main>

      {/* 3. Mobile Fixed Bottom Navigation Bar (Hidden on Desktop) */}
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
