import { PAGINATION_SUMMARY } from '@/constants/strings'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

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

  const pages = Array.from({ length: numberOfPages }, (_, index) => index + 1)

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-4 sm:flex-row">
      <div className="font-label-md text-label-md text-on-surface-variant">
        {PAGINATION_SUMMARY(from, to, totalCount)}
      </div>
      <div className="flex items-center gap-2" dir="ltr">
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
        {pages.map((page) => (
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
        ))}
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
