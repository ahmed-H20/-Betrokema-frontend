import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { SellerProvider } from './SellerContext'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { NotificationBell } from '@/features/notifications'

const SELLER_NAV_TABS = [
  { path: '/seller/dashboard', label: 'نظرة عامة', icon: 'dashboard' },
  { path: '/seller/clients', label: 'العملاء', icon: 'groups' },
  { path: '/seller/invoices', label: 'الفواتير', icon: 'receipt_long' },
  { path: '/seller/warehouses', label: 'المخازن', icon: 'warehouse' },
] as const

function SellerLayoutContent() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isCurrentTab = (path: string) => {
    if (path === '/seller/clients') {
      return (
        location.pathname.startsWith('/seller/clients') &&
        !location.pathname.startsWith('/seller/dashboard')
      )
    }
    return location.pathname === path
  }

  const isClientDetailPage =
    location.pathname.startsWith('/seller/clients/') &&
    location.pathname !== '/seller/clients'

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col antialiased overflow-x-hidden">
      {/* 1. Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm pt-safe transition-all">
        <div className="h-16 px-4 max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/seller/dashboard')}
              className="flex items-center gap-2 text-right"
            >
              <img
                src="/logo.png"
                alt="بتروكيما Petrokema"
                className="h-8 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="text-xs text-slate-800 font-bold leading-tight">
                  بتروكيما
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  نظرة عامة والمبيعات الميدانية
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {SELLER_NAV_TABS.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isActive || isCurrentTab(tab.path)
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <NotificationBell buttonClassName="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 hover:text-orange-600 hover:bg-orange-50 flex items-center justify-center transition-colors relative border border-slate-100 cursor-pointer" />

            {/* Rep Avatar & Logout */}
            <div className="flex items-center gap-1.5">
              <UserAvatar
                alt={user?.name || 'المندوب'}
                sizeClassName="w-9 h-9"
                shape="rounded"
              />
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
      <main className="flex-1 px-4 py-4 w-full pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
        <Outlet />
      </main>

      {/* 3. Mobile Fixed Bottom Navigation Bar (hidden on client detail page to prevent covering action button) */}
      {!isClientDetailPage && (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="h-16 max-w-md mx-auto px-4 grid grid-cols-4 items-center">
            {SELLER_NAV_TABS.map((tab) => {
              const active = isCurrentTab(tab.path)
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
      )}
    </div>
  )
}

export function SellerLayout() {
  return (
    <SellerProvider>
      <SellerLayoutContent />
    </SellerProvider>
  )
}
