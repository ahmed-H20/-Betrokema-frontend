import { request } from '@/api/client'
import {
  createProductInputSchema,
  featuredProductResponseSchema,
  productEnvelopeSchema,
  productListResponseSchema,
  productPickerResponseSchema,
  productStatsResponseSchema,
  updateStockAndPriceInputSchema,
  type CreateProductInput,
  type Product,
  type ProductListFilters,
  type ProductListResponse,
  type ProductPickerItem,
  type ProductStats,
  type UpdateStockAndPriceInput,
} from '@/api/products.schema'

function buildQuery(filters: ProductListFilters): string {
  const params = new URLSearchParams()
  if (filters.category && filters.category !== 'all') {
    params.set('category', filters.category)
  }
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.sort) params.set('sort', filters.sort)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function getAll(
  filters: ProductListFilters = {},
): Promise<ProductListResponse> {
  const raw = await request<unknown>(`/products${buildQuery(filters)}`)
  return productListResponseSchema.parse(raw)
}

export async function getStats(): Promise<ProductStats> {
  const raw = await request<unknown>('/products/stats')
  return productStatsResponseSchema.parse(raw).data
}

export async function getFeatured(): Promise<Product | null> {
  const raw = await request<unknown>('/products/featured')
  return featuredProductResponseSchema.parse(raw).data
}

export async function create(input: CreateProductInput): Promise<Product> {
  const payload = createProductInputSchema.parse(input)
  const raw = await request<unknown>('/products', {
    method: 'POST',
    body: payload,
  })
  return productEnvelopeSchema.parse(raw).data
}

export async function updateStockAndPrice(
  id: string,
  input: UpdateStockAndPriceInput,
): Promise<Product> {
  const payload = updateStockAndPriceInputSchema.parse(input)
  const raw = await request<unknown>(`/products/${id}/stock-price`, {
    method: 'PATCH',
    body: payload,
  })
  return productEnvelopeSchema.parse(raw).data
}

export async function remove(id: string): Promise<void> {
  await request<unknown>(`/products/${id}`, { method: 'DELETE' })
}

// Warehouse transfer/assign-product pickers — see context/.bridge-plan.md
// Chunk 3 build order step 1.
export async function getForPicker(): Promise<{
  products: ProductPickerItem[]
  totalCount: number
}> {
  const raw = await request<unknown>('/products?limit=500&field=name,code')
  const parsed = productPickerResponseSchema.parse(raw)
  return {
    products: parsed.data,
    totalCount: parsed.totalCount ?? parsed.data.length,
  }
}
