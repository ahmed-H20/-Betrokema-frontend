import type { Category } from '@/api/categories.schema'
import {
  FILTER_ALL_CATEGORIES,
  FILTER_BY_CATEGORY_LABEL,
  FILTER_TOTAL_PRODUCTS,
  PRODUCT_SEARCH_PLACEHOLDER,
} from '@/constants/strings'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

type ProductFiltersProps = {
  categories: Category[]
  totalProducts: number
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
  search: string
  onSearchChange: (value: string) => void
}

export function ProductFilters({
  categories,
  totalProducts,
  selectedCategory,
  onSelectCategory,
  search,
  onSearchChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-secondary">
              tune
            </span>
            <span className="font-label-md text-label-md font-semibold text-primary">
              {FILTER_BY_CATEGORY_LABEL}
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {FILTER_TOTAL_PRODUCTS(totalProducts)}
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            className={cn(
              'font-label-md flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-label-md transition-all',
              selectedCategory === 'all'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container',
            )}
            onClick={() => onSelectCategory('all')}
            type="button"
          >
            <span>{FILTER_ALL_CATEGORIES}</span>
            <span className="font-label-sm rounded-full bg-white/20 px-1.5 py-0.5 text-label-sm font-bold text-on-primary">
              {formatNumber(totalProducts)}
            </span>
          </button>
          {categories.map((category) => (
            <button
              className={cn(
                'font-label-md flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-label-md transition-colors',
                selectedCategory === category._id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container',
              )}
              key={category._id}
              onClick={() => onSelectCategory(category._id)}
              type="button"
            >
              <span>{category.name}</span>
              <span className="font-label-sm rounded-full bg-surface-container-highest px-1.5 py-0.5 text-label-sm text-on-surface-variant">
                {formatNumber(category.productsCount)}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-surface-container pt-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
            search
          </span>
          <input
            className="font-body-sm h-11 w-full rounded-lg bg-surface-container-low pl-4 pr-10 text-body-sm text-on-surface placeholder-outline transition-all focus:bg-surface-container-highest focus:outline-none"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={PRODUCT_SEARCH_PLACEHOLDER}
            type="text"
            value={search}
          />
        </div>
      </div>
    </div>
  )
}
