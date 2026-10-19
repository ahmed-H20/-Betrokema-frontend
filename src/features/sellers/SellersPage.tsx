import { useMemo, useState } from 'react'
import type { SellerStatus } from '@/api/sellers.schema'
import {
  REPS_GOVERNORATE_ALL,
  SELLERS_ADD_BUTTON,
  SELLERS_PAGE_SUBTITLE,
  SELLERS_PAGE_TITLE,
} from '@/constants/strings'
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
  const [selectedSellerIdRaw, setSelectedSellerId] = useState<
    string | undefined
  >(undefined)
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

  // Derived during render, not an effect: if the previously-selected seller
  // fell out of the current filter result, fall back to the first one
  // (or none) without an extra render pass.
  const selectedSellerId = filteredSellers.some(
    (seller) => seller._id === selectedSellerIdRaw,
  )
    ? selectedSellerIdRaw
    : filteredSellers[0]?._id

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

      <KpiRow />

      <div className="grid grid-cols-12 items-start gap-space-lg">
        <div className="col-span-12 xl:col-span-5">
          <RepsDirectory
            isError={sellersQuery.isError}
            isLoading={sellersQuery.isLoading}
            onSelectSeller={setSelectedSellerId}
            onSortChange={setSort}
            onStatusFilterChange={setStatusFilter}
            search={search}
            onSearchChange={setSearch}
            selectedSellerId={selectedSellerId}
            sellers={filteredSellers}
            sort={sort}
            statusFilter={statusFilter}
          />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <RepDetailPanel
            onDeleted={() => setSelectedSellerId(undefined)}
            sellerId={selectedSellerId}
          />
        </div>
      </div>

      <RepFormDialog onOpenChange={setCreateOpen} open={createOpen} />
    </div>
  )
}
