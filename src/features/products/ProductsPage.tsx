import { useState } from 'react'
import { StateMessage } from '@/components/ui/StateMessage'
import { PRODUCTS_ADD_BUTTON, PRODUCTS_ERROR, PRODUCTS_LOADING, PRODUCTS_PAGE_TITLE } from '@/constants/strings'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { CategoryPanel } from '@/features/categories/CategoryPanel'
import { useCategories } from '@/features/categories/hooks'
import { useProducts } from '@/features/products/hooks'
import { FeaturedBanner } from '@/features/products/components/FeaturedBanner'
import { KpiBar } from '@/features/products/components/KpiBar'
import { Pagination } from '@/features/products/components/Pagination'
import { ProductFilters } from '@/features/products/components/ProductFilters'
import { ProductFormDialog } from '@/features/products/components/ProductFormDialog'
import { ProductGrid } from '@/features/products/components/ProductGrid'

const PAGE_SIZE = 12

export function ProductsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search, 400)

  const categoriesQuery = useCategories()
  const productsQuery = useProducts({
    category: selectedCategory,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  })

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
        <h1 className="font-headline-xl text-headline-xl tracking-tight text-primary">
          {PRODUCTS_PAGE_TITLE}
        </h1>
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

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-4">
          <CategoryPanel />
        </div>

        <div className="flex flex-col gap-5 lg:col-span-8">
          <ProductFilters
            categories={categoriesQuery.data?.data ?? []}
            onSearchChange={handleSearchChange}
            onSelectCategory={handleSelectCategory}
            search={search}
            selectedCategory={selectedCategory}
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
    </div>
  )
}
