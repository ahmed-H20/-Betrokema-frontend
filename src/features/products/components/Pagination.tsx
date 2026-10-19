import { PAGINATION_SUMMARY, PRODUCT_PLURAL_FORMS } from '@/constants/strings'
import { arabicPlural, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

// Mirrors the export's static "1, 2, 3, ..., last" pattern rather than a
// dynamic sliding window — see context/ui-tokens.md deviations log.
function buildPageList(numberOfPages: number): (number | 'ellipsis')[] {
  if (numberOfPages <= 4) {
    return Array.from({ length: numberOfPages }, (_, index) => index + 1)
  }
  return [1, 2, 3, 'ellipsis', numberOfPages]
}

type PaginationProps = {
  currentPage: number
  numberOfPages: number
  limit: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  numberOfPages,
  limit,
  totalCount,
  onPageChange,
}: PaginationProps) {
  if (totalCount === 0) return null

  const from = (currentPage - 1) * limit + 1
  const to = Math.min(currentPage * limit, totalCount)
  const productWord = arabicPlural(totalCount, PRODUCT_PLURAL_FORMS)

  const pageList = buildPageList(numberOfPages)

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-4 sm:flex-row">
      <div className="font-label-md text-label-md text-on-surface-variant">
        {PAGINATION_SUMMARY(from, to, totalCount, productWord)}
      </div>
      {/* No dir/reversal here — DOM order (prev, pages ascending, next)
          already renders previous at the right edge and next at the left
          edge under the page's inherited RTL, matching the export. Adding
          dir="ltr" here was the mirroring bug (see ui-tokens.md). */}
      <div className="flex items-center gap-2">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            chevron_right
          </span>
        </button>
        {pageList.map((page, index) =>
          page === 'ellipsis' ? (
            <span className="text-outline" key={`ellipsis-${index}`}>
              ...
            </span>
          ) : (
            <button
              className={cn(
                'font-label-md flex h-9 w-9 items-center justify-center rounded-lg text-label-md transition-colors',
                page === currentPage
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container',
              )}
              key={page}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {formatNumber(page)}
            </button>
          ),
        )}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage >= numberOfPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            chevron_left
          </span>
        </button>
      </div>
    </div>
  )
}
