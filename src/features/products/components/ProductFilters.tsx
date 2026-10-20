import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Category } from '@/api/categories.schema'
import {
  FILTER_ALL_CATEGORIES,
  FILTER_BY_CATEGORY_LABEL,
  FILTER_TOTAL_PRODUCTS,
  PRODUCT_PLURAL_FORMS,
  PRODUCT_SEARCH_PLACEHOLDER,
  SORT_BUTTON_LABEL,
  SORT_OPTION_NAME,
  SORT_OPTION_NEWEST,
  SORT_OPTION_QUANTITY,
} from '@/constants/strings'
import { arabicPlural, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

// Backend sort param is a Mongoose sort string (see ApiFeatures.sort()):
// a bare field name for ascending, a `-` prefix for descending.
const SORT_OPTIONS = [
  { value: 'name', label: SORT_OPTION_NAME },
  { value: '-quantity', label: SORT_OPTION_QUANTITY },
  { value: '-createdAt', label: SORT_OPTION_NEWEST },
]

type ProductFiltersProps = {
  categories: Category[]
  totalProducts: number
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
  search: string
  onSearchChange: (value: string) => void
  sort: string
  onSortChange: (sort: string) => void
  onOpenCategoriesModal?: () => void
}

export function ProductFilters({
  categories,
  totalProducts,
  selectedCategory,
  onSelectCategory,
  search,
  onSearchChange,
  sort,
  onSortChange,
  onOpenCategoriesModal,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-3.5 sm:p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-secondary">
              tune
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">
              {FILTER_BY_CATEGORY_LABEL}
            </span>
            {onOpenCategoriesModal && (
              <button
                type="button"
                onClick={onOpenCategoriesModal}
                className="flex items-center gap-1 rounded-md bg-secondary-fixed/50 px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-fixed-variant hover:bg-secondary-fixed transition-colors"
                title="إدارة وهيكلية التصنيفات"
              >
                <span className="material-symbols-outlined text-[14px]">account_tree</span>
                <span>إدارة التصنيفات</span>
              </button>
            )}
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {FILTER_TOTAL_PRODUCTS(
              totalProducts,
              arabicPlural(totalProducts, PRODUCT_PLURAL_FORMS),
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          <button
            className={cn(
              'font-label-md flex min-h-8 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-label-md transition-all active:scale-95',
              selectedCategory === 'all'
                ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container',
            )}
            onClick={() => onSelectCategory('all')}
            type="button"
          >
            <span>{FILTER_ALL_CATEGORIES}</span>
            <span className="font-label-sm rounded-full bg-white/20 px-1.5 py-0.2 text-label-sm font-bold text-on-primary">
              {formatNumber(totalProducts)}
            </span>
          </button>
          {categories.map((category) => (
            <button
              className={cn(
                'font-label-md flex min-h-8 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-label-md transition-all active:scale-95',
                selectedCategory === category._id
                  ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container',
              )}
              key={category._id}
              onClick={() => onSelectCategory(category._id)}
              type="button"
            >
              <span>{category.name}</span>
              <span className="font-label-sm rounded-full bg-surface-container-highest px-1.5 py-0.2 text-label-sm font-semibold text-on-surface-variant">
                {formatNumber(category.productsCount)}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2.5 border-t border-surface-container-high/60 pt-2.5">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
            search
          </span>
          <input
            className="font-body-sm h-11 w-full rounded-lg bg-surface-container-low pl-8 pr-10 text-body-sm text-on-surface placeholder-outline transition-all focus:bg-surface-container-highest focus:outline-none"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={PRODUCT_SEARCH_PLACEHOLDER}
            type="text"
            value={search}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="font-label-md flex h-11 items-center justify-center gap-1 rounded-lg bg-surface-container-high px-3.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
              title={SORT_BUTTON_LABEL}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                swap_vert
              </span>
              <span className="hidden md:inline">{SORT_BUTTON_LABEL}</span>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
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
    </div>
  )
}
