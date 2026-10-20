import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import {
  BOTTOM_NAV_INVOICES_LABEL,
  BOTTOM_NAV_MORE_LABEL,
  BOTTOM_NAV_PRODUCTS_LABEL,
  BOTTOM_NAV_SELLERS_LABEL,
  BOTTOM_NAV_WAREHOUSES_LABEL,
} from '@/constants/strings'

// Item set + icons copied from the admin phone screens (petrokema_admin_8,
// petrokema_mobile_6), which disagree with each other (4 vs 5 items, and
// neither has a "المزيد" item at all) — see context/responsive-plan.md's
// Part 3 note for the full reasoning behind this exact 4-route + More set.
const TAB_ITEMS = [
  { path: '/invoices', label: BOTTOM_NAV_INVOICES_LABEL, icon: 'receipt_long' },
  { path: '/products', label: BOTTOM_NAV_PRODUCTS_LABEL, icon: 'inventory_2' },
  { path: '/sellers', label: BOTTOM_NAV_SELLERS_LABEL, icon: 'badge' },
  { path: '/warehouses', label: BOTTOM_NAV_WAREHOUSES_LABEL, icon: 'warehouse' },
] as const

const tabItemClassName =
  'flex h-12 min-w-[64px] flex-col items-center justify-center gap-0.5 transition-colors'

type BottomTabBarProps = {
  onMoreClick?: () => void
}

// Phone-only (<md) fixed bottom tab bar — follows petrokema_admin_8's
// markup verbatim (container/item classes, pb-safe inset). "المزيد" is the
// app's own addition (opens the same NavDrawer the tablet hamburger uses),
// not present in any Stitch reference.
export function BottomTabBar({ onMoreClick }: BottomTabBarProps) {
  return (
    <nav className="pb-safe fixed bottom-0 z-50 w-full bg-surface-container-lowest/90 shadow-[0_-4px_16px_rgba(14,42,71,0.06)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-around px-gutter">
        {TAB_ITEMS.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                tabItemClassName,
                isActive
                  ? 'font-semibold text-primary-container'
                  : 'text-on-surface-variant hover:text-primary',
              )
            }
            key={item.path}
            to={item.path}
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="font-label-sm text-label-sm">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
        <button
          className={cn(tabItemClassName, 'text-on-surface-variant hover:text-primary')}
          onClick={onMoreClick}
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">
            more_horiz
          </span>
          <span className="font-label-sm text-label-sm">
            {BOTTOM_NAV_MORE_LABEL}
          </span>
        </button>
      </div>
    </nav>
  )
}
