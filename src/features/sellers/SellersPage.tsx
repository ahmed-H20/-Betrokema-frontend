import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SellerStatus } from '@/api/sellers.schema'
import {
  REP_DETAIL_BACK,
  REPS_GOVERNORATE_ALL,
  SELLERS_ADD_BUTTON,
  SELLERS_PAGE_SUBTITLE,
  SELLERS_PAGE_TITLE,
} from '@/constants/strings'
import { cn } from '@/lib/cn'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useSellers } from '@/features/sellers/hooks'
import { KpiRow } from '@/features/sellers/components/KpiRow'
import { RepsDirectory } from '@/features/sellers/components/RepsDirectory'
import { RepDetailPanel } from '@/features/sellers/components/RepDetailPanel'
import { RepFormDialog } from '@/features/sellers/components/RepFormDialog'

export function SellersPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'performance' | 'sales'>('performance')
  const [statusFilter, setStatusFilter] = useState<SellerStatus | undefined>(
    undefined,
  )
  const [governorateFilter, setGovernorateFilter] = useState<string | undefined>(
    undefined,
  )
  // Selection lives in the URL (?rep=<id>), not component state, so refresh
  // and the browser back button both restore it — see context/ui-tokens.md
  // (R3-sellers-responsive).
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSellerId = searchParams.get('rep') ?? undefined
  const urlTab = searchParams.get('tab') || 'clients'
  const [createOpen, setCreateOpen] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 400)
  const sellersQuery = useSellers({
    search: debouncedSearch || undefined,
    status: statusFilter,
    sort,
  })

  const sellers = useMemo(() => sellersQuery.data ?? [], [sellersQuery.data])

  // Options reflect the current status/search-filtered result, before the
  // governorate filter itself is applied — see src/api/sellers.ts.
  const governorateOptions = useMemo(
    () =>
      Array.from(new Set(sellers.map((seller) => seller.governorate))).sort(
        (a, b) => a.localeCompare(b, 'ar'),
      ),
    [sellers],
  )

  const filteredSellers = useMemo(
    () =>
      governorateFilter
        ? sellers.filter((seller) => seller.governorate === governorateFilter)
        : sellers,
    [sellers, governorateFilter],
  )

  // Derived during render, not an effect: if the URL's rep fell out of the
  // current filter result, fall back to the first one (or none) without an
  // extra render pass. `hasExplicitSelection` (URL id still valid) decides
  // whether the below-xl drill-down view shows the list or the detail —
  // the xl+ side-by-side view always uses the fallback-inclusive id below.
  const hasExplicitSelection = filteredSellers.some(
    (seller) => seller._id === urlSellerId,
  )
  const selectedSellerId = hasExplicitSelection
    ? urlSellerId
    : filteredSellers[0]?._id

  function handleSelectSeller(id: string, tab?: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('rep', id)
      if (tab) next.set('tab', tab)
      else next.delete('tab')
      return next
    })
  }

  function handleTabChange(tab: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  function handleBackToList() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('rep')
      next.delete('tab')
      return next
    })
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm xl:flex-row xl:items-center">
        <div className="flex flex-col">
          <h1 className="font-headline-lg text-headline-lg text-primary">
            {SELLERS_PAGE_TITLE}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {SELLERS_PAGE_SUBTITLE}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="relative">
            <select
              className="h-10 appearance-none rounded-lg bg-surface-container-low pl-8 pr-space-md font-label-md text-label-md text-on-surface focus:outline-none"
              onChange={(event) =>
                setGovernorateFilter(event.target.value || undefined)
              }
              value={governorateFilter ?? ''}
            >
              <option value="">{REPS_GOVERNORATE_ALL}</option>
              {governorateOptions.map((governorate) => (
                <option key={governorate} value={governorate}>
                  {governorate}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              expand_more
            </span>
          </div>
          <button
            className="font-label-md flex h-10 items-center gap-space-xs rounded-lg bg-primary px-space-lg text-label-md text-on-primary shadow-sm transition-all hover:bg-primary-container"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              person_add
            </span>
            {SELLERS_ADD_BUTTON}
          </button>
        </div>
      </div>

      <KpiRow onOpenCreate={() => setCreateOpen(true)} />

      {/* Below xl: list-then-detail (one pane at a time, URL-driven) —
          both panes stay mounted (desktop behavior unchanged, see below),
          only visibility toggles. At xl+ both always show side by side,
          exactly as before. */}
      <div className="grid grid-cols-12 items-start gap-space-lg">
        <div
          className={cn(
            'xl:col-span-5',
            hasExplicitSelection ? 'hidden xl:block' : 'col-span-12',
          )}
        >
          <RepsDirectory
            isError={sellersQuery.isError}
            isLoading={sellersQuery.isLoading}
            onSearchChange={setSearch}
            onSelectInvoices={(id) => handleSelectSeller(id, 'invoices')}
            onSelectSeller={handleSelectSeller}
            onSortChange={setSort}
            onStatusFilterChange={setStatusFilter}
            search={search}
            selectedSellerId={selectedSellerId}
            sellers={filteredSellers}
            sort={sort}
            statusFilter={statusFilter}
          />
        </div>
        <div
          className={cn(
            'flex flex-col gap-space-md xl:col-span-7',
            hasExplicitSelection ? 'col-span-12' : 'hidden xl:block',
          )}
        >
          <button
            className="font-label-md flex h-10 w-fit items-center gap-1 rounded-lg bg-surface-container-lowest px-space-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-high xl:hidden"
            onClick={handleBackToList}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_right
            </span>
            {REP_DETAIL_BACK}
          </button>
          <RepDetailPanel
            activeTab={urlTab}
            onDeleted={handleBackToList}
            onTabChange={handleTabChange}
            sellerId={selectedSellerId}
          />
        </div>
      </div>

      <RepFormDialog onOpenChange={setCreateOpen} open={createOpen} />

      {/* Mobile Floating Action Button matching petrokema_admin_5 */}
      {!hasExplicitSelection && (
        <button
          aria-label="إضافة حساب مندوب جديد"
          className="fixed bottom-20 start-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-label-md font-semibold text-on-primary shadow-xl ring-2 ring-primary-container/20 transition-all hover:bg-primary-container active:scale-95 xl:hidden"
          onClick={() => setCreateOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>إضافة مندوب</span>
        </button>
      )}
    </div>
  )
}
