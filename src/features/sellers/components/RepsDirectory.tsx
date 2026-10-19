import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useEffect, useMemo, useState } from 'react'
import type { SellerStatus } from '@/api/sellers.schema'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  REPS_EMPTY,
  REPS_ERROR,
  REPS_FILTER_BUTTON,
  REPS_GOVERNORATE_ALL,
  REPS_LIST_TITLE,
  REPS_LOADING,
  REPS_SEARCH_PLACEHOLDER,
  REPS_SORT_LABEL,
  REPS_SORT_OPTION_PERFORMANCE,
  REPS_SORT_OPTION_SALES,
  REPS_STATUS_ALL,
  SELLER_STATUS_LABELS,
} from '@/constants/strings'
import { cn } from '@/lib/cn'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useSellers } from '@/features/sellers/hooks'
import { RepCard } from '@/features/sellers/components/RepCard'

const SORT_OPTIONS = [
  { value: 'performance' as const, label: REPS_SORT_OPTION_PERFORMANCE },
  { value: 'sales' as const, label: REPS_SORT_OPTION_SALES },
]

const STATUS_FILTER_OPTIONS: { value: SellerStatus | undefined; label: string }[] = [
  { value: undefined, label: REPS_STATUS_ALL },
  { value: 'ACTIVE', label: SELLER_STATUS_LABELS.ACTIVE },
  { value: 'SUSPENDED', label: SELLER_STATUS_LABELS.SUSPENDED },
  { value: 'VACATION', label: SELLER_STATUS_LABELS.VACATION },
]

export function RepsDirectory({
  selectedSellerId,
  onSelectSeller,
}: {
  selectedSellerId: string | undefined
  onSelectSeller: (id: string | undefined) => void
}) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'performance' | 'sales'>('performance')
  const [statusFilter, setStatusFilter] = useState<SellerStatus | undefined>(
    undefined,
  )
  const [governorateFilter, setGovernorateFilter] = useState<string | undefined>(
    undefined,
  )
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

  useEffect(() => {
    if (filteredSellers.length === 0) {
      if (selectedSellerId !== undefined) onSelectSeller(undefined)
      return
    }
    const stillPresent = filteredSellers.some(
      (seller) => seller._id === selectedSellerId,
    )
    if (!stillPresent) onSelectSeller(filteredSellers[0]._id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSellers, selectedSellerId])

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ??
    REPS_SORT_OPTION_PERFORMANCE
  const statusLabel =
    STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)
      ?.label ?? REPS_STATUS_ALL

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm text-primary">
          {REPS_LIST_TITLE}
        </h2>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
          search
        </span>
        <input
          className="font-body-sm h-11 w-full rounded-lg bg-surface-container-low pl-4 pr-10 text-body-sm text-on-surface placeholder-outline transition-all focus:bg-surface-container-highest focus:outline-none"
          onChange={(event) => setSearch(event.target.value)}
          placeholder={REPS_SEARCH_PLACEHOLDER}
          type="text"
          value={search}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="font-label-md flex h-9 items-center gap-1.5 rounded-lg bg-surface-container-high px-3 text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">sort</span>
              {REPS_SORT_LABEL(sortLabel)}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              className="z-50 min-w-[160px] rounded-lg bg-surface-container-lowest p-1 shadow-lg"
              sideOffset={4}
            >
              {SORT_OPTIONS.map((option) => (
                <DropdownMenu.Item
                  className={cn(
                    'font-label-md cursor-pointer rounded-md px-3 py-2 text-label-md text-on-surface outline-none data-[highlighted]:bg-surface-container-low',
                    option.value === sort && 'text-primary font-semibold',
                  )}
                  key={option.value}
                  onSelect={() => setSort(option.value)}
                >
                  {option.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="font-label-md flex h-9 items-center gap-1.5 rounded-lg bg-surface-container-high px-3 text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                filter_list
              </span>
              {REPS_FILTER_BUTTON}
              {statusFilter ? (
                <span className="font-label-sm rounded-full bg-primary px-1.5 py-0.5 text-label-sm text-on-primary">
                  {statusLabel}
                </span>
              ) : null}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              className="z-50 min-w-[160px] rounded-lg bg-surface-container-lowest p-1 shadow-lg"
              sideOffset={4}
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <DropdownMenu.Item
                  className={cn(
                    'font-label-md cursor-pointer rounded-md px-3 py-2 text-label-md text-on-surface outline-none data-[highlighted]:bg-surface-container-low',
                    option.value === statusFilter && 'text-primary font-semibold',
                  )}
                  key={option.label}
                  onSelect={() => setStatusFilter(option.value)}
                >
                  {option.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <select
          className="font-label-md h-9 rounded-lg bg-surface-container-high px-2.5 text-label-md text-on-surface"
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
      </div>

      <div className="flex flex-col gap-2">
        {sellersQuery.isLoading ? (
          <StateMessage minHeightClassName="min-h-[200px]" text={REPS_LOADING} />
        ) : sellersQuery.isError ? (
          <StateMessage
            minHeightClassName="min-h-[200px]"
            text={REPS_ERROR}
            tone="error"
          />
        ) : filteredSellers.length === 0 ? (
          <StateMessage minHeightClassName="min-h-[200px]" text={REPS_EMPTY} />
        ) : (
          filteredSellers.map((seller) => (
            <RepCard
              key={seller._id}
              onSelect={() => onSelectSeller(seller._id)}
              selected={seller._id === selectedSellerId}
              seller={seller}
            />
          ))
        )}
      </div>
    </div>
  )
}
