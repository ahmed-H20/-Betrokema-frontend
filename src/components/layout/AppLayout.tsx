<<<<<<< HEAD
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
=======
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { NavDrawer } from '@/components/layout/NavDrawer'
import { SidebarNavContent } from '@/components/layout/SidebarNavContent'
>>>>>>> origin
import {
  APP_BADGE,
  APP_NAME,
  APP_SUBTITLE,
  NOTIFICATIONS_LABEL,
  OPEN_NAV_DRAWER_LABEL,
  SEARCH_ICON_LABEL,
  SEARCH_PLACEHOLDER,
  USER_ROLE_LABEL,
} from '@/constants/strings'

function formatToday() {
  return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

<<<<<<< HEAD
// Reuses the same ['products','stats'] query ProductsPage's KPI bar fires —
// React Query dedupes identical keys, so this adds no extra request while on
// /products, only a background one elsewhere. Per explicit product decision
// (context/build-plan.md), scoped to this one badge rather than deferred
// with the rest of the nav badges until all chunks exist.
function useProductsNavBadge() {
  const { data } = useProductStats()
  return data?.totalProducts.count
}

// Reuses the same ['sellers','stats'] query the Sellers page's KPI row
// already fires — no extra request while on /sellers, only a background one
// elsewhere. Per context/.bridge-plan.md GLOBAL rule, styled as a
// secondary-fixed pill rather than the Products badge's neutral gray — a
// deliberate color deviation logged in context/ui-tokens.md.
function useSellersNavBadge() {
  const { data } = useSellerStats()
  return data?.certifiedSellers.total
}

// Reuses the same ['warehouses','stats'] query the Warehouses page's KPI row
// already fires — no extra request while on /warehouses. Styled as a
// secondary-fixed pill per context/.bridge-plan.md's GLOBAL rule (same
// convention as the Sellers badge, not the Products badge's neutral gray).
function useWarehousesNavBadge() {
  const { data } = useWarehouseStats()
  return data?.warehouses.total
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const today = formatToday()
  const productsBadge = useProductsNavBadge()
  const sellersBadge = useSellersNavBadge()
  const warehousesBadge = useWarehousesNavBadge()

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col justify-between bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col">
          <div className="flex h-16 items-center justify-between bg-surface-container-lowest px-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[24px]">
                  factory
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm leading-tight text-primary">
                  {APP_NAME}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {APP_SUBTITLE}
                </span>
              </div>
            </div>
=======
// Brand mark — shared by the permanent xl+ sidebar strip and the below-xl
// header (where it stands in for the hidden sidebar's own strip).
function BrandMark() {
  return (
    <div className="flex items-center gap-space-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary shadow-sm">
        <span className="material-symbols-outlined text-[24px]">
          factory
        </span>
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="font-headline-sm truncate text-headline-sm leading-tight text-primary">
          {APP_NAME}
        </span>
        <span className="font-label-sm truncate text-label-sm text-on-surface-variant">
          {APP_SUBTITLE}
        </span>
      </div>
    </div>
  )
}

export function AppLayout() {
  const today = formatToday()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerPathname, setDrawerPathname] = useState(location.pathname)

  // R1: the tablet hamburger and the phone "المزيد" tab share one drawer —
  // close it whenever the route changes (e.g. a nav link inside it is
  // clicked), per the task's explicit "closes on route change" requirement.
  // Adjusted during render rather than in a useEffect, per React's own
  // "adjusting state when a prop changes" pattern — setState inside an
  // effect body here trips the `react-hooks/set-state-in-effect` lint rule.
  if (location.pathname !== drawerPathname) {
    setDrawerPathname(location.pathname)
    setDrawerOpen(false)
  }

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed right-0 top-0 z-50 hidden h-full w-72 flex-col justify-between bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] xl:flex">
        <div className="flex flex-col">
          <div className="flex h-16 items-center justify-between bg-surface-container-lowest px-space-lg">
            <BrandMark />
>>>>>>> origin
            <span className="font-label-sm rounded-full bg-secondary-fixed px-2 py-0.5 text-label-sm text-on-secondary-fixed-variant">
              {APP_BADGE}
            </span>
          </div>
<<<<<<< HEAD
          <div className="px-space-md py-space-md">
            <span className="font-label-sm mb-space-xs block px-space-sm text-label-sm uppercase tracking-wider text-outline">
              {NAV_SECTION_LABEL}
            </span>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-lg px-space-md py-space-sm transition-all',
                      isActive
                        ? 'font-label-lg bg-primary-container text-on-primary shadow-sm'
                        : 'font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                    )
                  }
                >
                  <div className="flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.path === '/products' && productsBadge !== undefined ? (
                    <span className="font-label-sm rounded-full bg-surface-container-highest px-1.5 py-0.5 text-label-sm text-on-surface-variant">
                      {formatNumber(productsBadge)}
                    </span>
                  ) : null}
                  {item.path === '/sellers' && sellersBadge !== undefined ? (
                    <span className="font-label-sm rounded-full bg-secondary-fixed px-1.5 py-0.5 text-label-sm text-on-secondary-fixed-variant">
                      {formatNumber(sellersBadge)}
                    </span>
                  ) : null}
                  {item.path === '/warehouses' && warehousesBadge !== undefined ? (
                    <span className="font-label-sm rounded-full bg-secondary-fixed px-1.5 py-0.5 text-label-sm text-on-secondary-fixed-variant">
                      {formatNumber(warehousesBadge)}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </aside>
      <div className="pr-72">
        <header className="fixed left-0 right-72 top-0 z-40 flex h-16 items-center justify-between bg-surface/85 px-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="flex max-w-xl flex-1 items-center gap-space-lg">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                search
              </span>
              <input
                className="font-body-sm h-10 w-full rounded-lg bg-surface-container-low pl-space-md pr-10 text-body-sm text-on-surface placeholder-outline transition-all focus:bg-surface-container-lowest focus:outline-none"
                placeholder={SEARCH_PLACEHOLDER}
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-space-lg">
            <div className="hidden items-center gap-space-sm rounded-lg bg-surface-container-low px-space-md py-1.5 xl:flex">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                calendar_today
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {today}
              </span>
            </div>
            <button
              aria-label={NOTIFICATIONS_LABEL}
              className="relative rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">
                notifications
              </span>
            </button>
            <div className="hidden h-6 w-px bg-outline-variant sm:block" />
            <div className="flex items-center gap-space-md">
              <div className="flex flex-col text-left">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  {user?.name || USER_ROLE_LABEL}
                </span>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {user?.code || (user?.role === 'seller' ? 'مندوب' : user?.role === 'client' ? 'عميل' : 'مسؤول')}
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
                <span className="material-symbols-outlined text-[18px]">
                  person
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                title="تسجيل الخروج"
                className="flex items-center justify-center rounded-lg p-1.5 text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
              </button>
            </div>
          </div>
        </header>
        <main className="min-h-screen w-full bg-surface px-space-lg py-space-lg pt-16">
          <Outlet />
        </main>
=======
          <SidebarNavContent />
        </div>
      </aside>

      <NavDrawer onOpenChange={setDrawerOpen} open={drawerOpen}>
        <SidebarNavContent onNavigate={() => setDrawerOpen(false)} />
      </NavDrawer>

      <div className="xl:pr-72">
        <header className="pt-safe fixed inset-x-0 top-0 z-40 bg-surface/85 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl xl:right-72">
          <div className="flex h-16 items-center justify-between gap-space-sm px-margin md:px-space-lg">
            <div className="flex items-center gap-space-sm xl:hidden">
              <button
                aria-label={OPEN_NAV_DRAWER_LABEL}
                className="hidden h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary md:flex xl:hidden"
                onClick={() => setDrawerOpen(true)}
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">
                  menu
                </span>
              </button>
              <BrandMark />
            </div>

            <div className="hidden max-w-xl flex-1 items-center gap-space-lg md:flex">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                  search
                </span>
                <input
                  className="font-body-sm h-10 w-full rounded-lg bg-surface-container-low pl-space-md pr-10 text-body-sm text-on-surface placeholder-outline transition-all focus:bg-surface-container-lowest focus:outline-none"
                  placeholder={SEARCH_PLACEHOLDER}
                  type="text"
                />
              </div>
            </div>
            <button
              aria-label={SEARCH_ICON_LABEL}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary md:hidden"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">
                search
              </span>
            </button>

            <div className="flex items-center gap-space-lg">
              <div className="hidden items-center gap-space-sm rounded-lg bg-surface-container-low px-space-md py-1.5 xl:flex">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  calendar_today
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {today}
                </span>
              </div>
              <button
                aria-label={NOTIFICATIONS_LABEL}
                className="relative rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">
                  notifications
                </span>
              </button>
              <div className="hidden h-6 w-px bg-outline-variant sm:block" />
              <div className="flex items-center gap-space-md">
                <span className="font-label-md hidden text-label-md font-semibold text-on-surface md:inline">
                  {USER_ROLE_LABEL}
                </span>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <span className="material-symbols-outlined text-[18px] text-on-primary">
                    person
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="pb-tabbar-safe min-h-screen w-full bg-surface px-margin pt-16 md:px-space-lg md:pb-space-lg">
          <Outlet />
        </main>
      </div>

      <div className="md:hidden">
        <BottomTabBar onMoreClick={() => setDrawerOpen(true)} />
>>>>>>> origin
      </div>
    </div>
  )
}
