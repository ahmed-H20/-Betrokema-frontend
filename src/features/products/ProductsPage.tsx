import { useState } from 'react'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  PRODUCTS_ADD_BUTTON,
  PRODUCTS_ERROR,
  PRODUCTS_LOADING,
  PRODUCTS_PAGE_EYEBROW,
  PRODUCTS_PAGE_TITLE,
} from '@/constants/strings'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { CategoryModal } from '@/features/categories/CategoryModal'
import { CategoryPanel } from '@/features/categories/CategoryPanel'
import { useCategories } from '@/features/categories/hooks'
import { useProducts, useProductStats } from '@/features/products/hooks'
import { FeaturedBanner } from '@/features/products/components/FeaturedBanner'
import { KpiBar } from '@/features/products/components/KpiBar'
import { Pagination } from '@/features/products/components/Pagination'
import { ProductFilters } from '@/features/products/components/ProductFilters'
import { ProductFormDialog } from '@/features/products/components/ProductFormDialog'
import { ProductGrid } from '@/features/products/components/ProductGrid'

const PAGE_SIZE = 12

export function ProductsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('-createdAt')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search, 400)

  const statsQuery = useProductStats()
  const categoriesQuery = useCategories()
  const productsQuery = useProducts({
    category: selectedCategory,
    search: debouncedSearch || undefined,
    sort,
    page,
    limit: PAGE_SIZE,
    isLowStock: lowStockOnly || undefined,
  })

  const criticalStock = statsQuery.data?.criticalStockAlerts
  const criticalCount = criticalStock?.count ?? 0

  function handleToggleLowStock() {
    setLowStockOnly((prev) => !prev)
    setPage(1)
  }

  function handleSortChange(value: string) {
    setSort(value)
    setPage(1)
  }

  // Reset to page 1 the moment the user changes a filter (not tied to the
  // debounce) — simpler and compiler-safe vs. deriving it from the debounced
  // value in an effect or during render.
  function handleSelectCategory(categoryId: string) {
    setSelectedCategory(categoryId)
    setPage(1)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
              {PRODUCTS_PAGE_EYEBROW}
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl tracking-tight text-primary">
            {PRODUCTS_PAGE_TITLE}
          </h1>
        </div>
        <button
          className="font-label-lg flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-label-lg text-on-primary shadow-md transition-all hover:bg-primary-container hover:shadow-lg"
          onClick={() => setCreateOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">
            add_box
          </span>
          {PRODUCTS_ADD_BUTTON}
        </button>
      </div>

      <KpiBar />

      {/* Real-time Stock Alert Banner matching petrokema_admin_1 */}
      {criticalCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-tertiary-fixed p-3 text-on-tertiary-fixed shadow-sm border border-on-tertiary-container/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-on-tertiary-container/20 text-on-tertiary-fixed">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md font-bold truncate">
                تنبيه انخفاض المخزون
              </span>
              <span className="font-body-sm text-body-sm text-on-tertiary-fixed-variant truncate">
                {criticalCount} {criticalCount === 1 ? 'منتج قارب' : 'منتجات قاربت'} على النفاد بمستودعات التشغيل
              </span>
            </div>
          </div>
          <button
            className={`flex-shrink-0 rounded-lg px-3.5 py-1.5 font-label-sm text-label-sm font-semibold shadow-sm transition-all active:scale-95 ${
              lowStockOnly
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest/90 text-on-tertiary-fixed hover:bg-surface-container-lowest'
            }`}
            onClick={handleToggleLowStock}
            type="button"
          >
            {lowStockOnly ? 'عرض الكل' : 'مراجعة'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Below lg: category add-form + list collapse into a section below
            the product list, following the mapped phone screen
            (petrokema_admin_7) — `order` puts it visually last while
            `lg:order-none` restores normal DOM order (right column) at
            desktop width, unchanged. */}
        <div className="order-2 flex flex-col gap-4 lg:order-none lg:col-span-4">
          <CategoryPanel />
        </div>

        <div className="order-1 flex flex-col gap-5 lg:order-none lg:col-span-8">
          <ProductFilters
            categories={categoriesQuery.data?.data ?? []}
            onOpenCategoriesModal={() => setCategoryModalOpen(true)}
            onSearchChange={handleSearchChange}
            onSelectCategory={handleSelectCategory}
            onSortChange={handleSortChange}
            search={search}
            selectedCategory={selectedCategory}
            sort={sort}
            totalProducts={categoriesQuery.data?.totalProducts ?? 0}
          />

          <FeaturedBanner />

          {productsQuery.isLoading ? (
            <StateMessage minHeightClassName="min-h-[200px]" text={PRODUCTS_LOADING} />
          ) : productsQuery.isError || !productsQuery.data ? (
            <StateMessage minHeightClassName="min-h-[200px]" text={PRODUCTS_ERROR} tone="error" />
          ) : (
            <>
              <ProductGrid
                categories={categoriesQuery.data?.data ?? []}
                products={productsQuery.data.data}
              />
              {productsQuery.data.pagination ? (
                <Pagination
                  currentPage={productsQuery.data.pagination.currentPage}
                  limit={productsQuery.data.pagination.limit}
                  numberOfPages={productsQuery.data.pagination.numberOfPages}
                  onPageChange={setPage}
                  totalCount={productsQuery.data.totalCount ?? 0}
                />
              ) : null}
            </>
          )}
        </div>
      </div>

      <ProductFormDialog onOpenChange={setCreateOpen} open={createOpen} />
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />

      {/* Mobile Floating Action Button matching petrokema_admin_1 */}
      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-20 start-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-label-md font-semibold text-on-primary shadow-xl ring-2 ring-primary-container/20 active:scale-95 transition-all lg:hidden"
        aria-label="إضافة منتج جديد"
      >
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        <span>إضافة منتج</span>
      </button>
    </div>
  )
}
