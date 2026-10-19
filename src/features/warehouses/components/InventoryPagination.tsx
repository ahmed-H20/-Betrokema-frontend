import { PRODUCT_PLURAL_FORMS, INVENTORY_FOOTER } from '@/constants/strings'
import { arabicPlural, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

// Same static "1, 2, 3, ..., last" pattern as
// src/features/products/components/Pagination.tsx — see that file and
// context/ui-tokens.md for why this isn't a sliding window.
function buildPageList(pages: number): (number | 'ellipsis')[] {
  if (pages <= 4) return Array.from({ length: pages }, (_, index) => index + 1)
  return [1, 2, 3, 'ellipsis', pages]
}

export function InventoryPagination({
  page,
  pages,
  shownCount,
  totalCount,
  onPageChange,
}: {
  page: number
  pages: number
  shownCount: number
  totalCount: number
  onPageChange: (page: number) => void
}) {
  if (totalCount === 0) return null

  const productWord = arabicPlural(totalCount, PRODUCT_PLURAL_FORMS)
  const pageList = buildPageList(pages)

  return (
    <div className="flex flex-col items-center justify-between gap-space-sm pt-space-sm sm:flex-row">
      <span className="font-body-sm text-body-sm text-on-surface-variant">
        {INVENTORY_FOOTER(shownCount, totalCount, productWord)}
      </span>
      <div className="flex items-center gap-space-xs">
        <button
          aria-label="السابق"
          className="flex h-8 w-8 items-center justify-center rounded bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
        {pageList.map((item, index) =>
          item === 'ellipsis' ? (
            <span className="text-outline" key={`ellipsis-${index}`}>
              ...
            </span>
          ) : (
            <button
              className={cn(
                'font-label-sm rounded px-3 py-1 text-label-sm transition-colors',
                item === page
                  ? 'bg-primary-container font-bold text-on-primary'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high',
              )}
              key={item}
              onClick={() => onPageChange(item)}
              type="button"
            >
              {formatNumber(item)}
            </button>
          ),
        )}
        <button
          aria-label="التالي"
          className="flex h-8 w-8 items-center justify-center rounded bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
      </div>
    </div>
  )
}
