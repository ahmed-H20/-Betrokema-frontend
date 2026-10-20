import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { SellerStatus } from '@/api/sellers.schema'
import type { EnrichedSeller } from '@/api/sellers.schema'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  REPS_EMPTY,
  REPS_ERROR,
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
import { formatNumber } from '@/lib/format'
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
  sellers,
  isLoading,
  isError,
  search,
  onSearchChange,
  sort,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  selectedSellerId,
  onSelectSeller,
  onSelectInvoices,
}: {
  sellers: EnrichedSeller[]
  isLoading: boolean
  isError: boolean
  search: string
  onSearchChange: (value: string) => void
  sort: 'performance' | 'sales'
  onSortChange: (sort: 'performance' | 'sales') => void
  statusFilter: SellerStatus | undefined
  onStatusFilterChange: (status: SellerStatus | undefined) => void
  selectedSellerId: string | undefined
  onSelectSeller: (id: string) => void
  onSelectInvoices?: (id: string) => void
}) {
  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ??
    REPS_SORT_OPTION_PERFORMANCE

  return (
    <div className="flex flex-col rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex items-center justify-between pb-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[20px] text-primary">
            groups
          </span>
          <span className="font-headline-sm text-headline-sm text-primary">
            {REPS_LIST_TITLE}
          </span>
          <span className="font-label-sm rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm font-semibold text-on-surface">
            {formatNumber(sellers.length)}
          </span>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="font-label-sm flex items-center gap-1 text-label-sm text-on-surface-variant"
              type="button"
            >
              {REPS_SORT_LABEL(sortLabel)}
              <span className="material-symbols-outlined text-[16px]">
                swap_vert
              </span>
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
                  onSelect={() => onSortChange(option.value)}
                >
                  {option.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Search Input Bar */}
      <div className="my-space-xs flex items-center gap-space-xs">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            className="font-body-sm h-10 w-full rounded-lg bg-surface-container-low pl-8 pr-9 text-body-sm text-on-surface placeholder-outline focus:bg-surface-container-lowest focus:outline-none md:h-9"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={REPS_SEARCH_PLACEHOLDER}
            type="text"
            value={search}
          />
          {search && (
            <button
              aria-label="مسح البحث"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-outline hover:text-on-surface"
              onClick={() => onSearchChange('')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Status Filter Pills matching petrokema_admin_5 */}
      <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-2 pt-1">
        {STATUS_FILTER_OPTIONS.map((option) => {
          const isSelected = statusFilter === option.value
          const count = option.value
            ? sellers.filter((s) => s.status === option.value).length
            : sellers.length

          return (
            <button
              className={cn(
                'font-label-md inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 text-label-md transition-all active:scale-95',
                isSelected
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              )}
              key={option.label}
              onClick={() => onStatusFilterChange(option.value)}
              type="button"
            >
              <span>{option.label}</span>
              <span
                className={cn(
                  'font-label-sm rounded-full px-1.5 py-0.2 text-label-sm font-semibold',
                  isSelected
                    ? 'bg-white/20 text-on-primary'
                    : 'bg-surface-container-high text-outline',
                )}
              >
                {formatNumber(count)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-space-sm flex max-h-[720px] flex-col gap-space-md overflow-y-auto pr-0.5">
        {isLoading ? (
          <StateMessage minHeightClassName="min-h-[200px]" text={REPS_LOADING} />
        ) : isError ? (
          <StateMessage
            minHeightClassName="min-h-[200px]"
            text={REPS_ERROR}
            tone="error"
          />
        ) : sellers.length === 0 ? (
          <StateMessage minHeightClassName="min-h-[200px]" text={REPS_EMPTY} />
        ) : (
          sellers.map((seller) => (
            <RepCard
              key={seller._id}
              onSelect={() => onSelectSeller(seller._id)}
              onSelectInvoices={() => onSelectInvoices?.(seller._id)}
              selected={seller._id === selectedSellerId}
              seller={seller}
            />
          ))
        )}
      </div>
    </div>
  )
}
