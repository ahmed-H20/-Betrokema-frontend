import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
import { NAV_ITEMS, NAV_SECTION_LABEL } from '@/constants/strings'
import { useProductStats } from '@/features/products/hooks'
import { useSellerStats } from '@/features/sellers/hooks'
import { useWarehouseStats } from '@/features/warehouses/hooks'

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

type SidebarNavContentProps = {
  onNavigate?: () => void
}

// The sidebar's nav list, extracted so it can render identically inside the
// permanent xl+ sidebar (AppLayout's <aside>) and inside the tablet/phone
// NavDrawer — one nav list, two containers.
export function SidebarNavContent({ onNavigate }: SidebarNavContentProps) {
  const productsBadge = useProductsNavBadge()
  const sellersBadge = useSellersNavBadge()
  const warehousesBadge = useWarehousesNavBadge()

  return (
    <div className="px-space-md py-space-md">
      <span className="font-label-sm mb-space-xs block px-space-sm text-label-sm uppercase tracking-wider text-outline">
        {NAV_SECTION_LABEL}
      </span>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            onClick={onNavigate}
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
  )
}
