import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as productsApi from '@/api/products'
import * as warehousesApi from '@/api/warehouses'
import type {
  CreateProductInput,
  ProductListFilters,
  UpdateStockAndPriceInput,
} from '@/api/products.schema'

// Minimal seam for the product form's warehouse <select> — see
// src/api/warehouses.ts. Lives here rather than in its own feature's
// hooks.ts since the full Warehouse resource isn't built until Chunk 3.
export function useWarehouseNames() {
  return useQuery({
    queryKey: ['warehouses', 'names'],
    queryFn: warehousesApi.getAllNames,
  })
}

export function useProductStats() {
  return useQuery({
    queryKey: ['products', 'stats'],
    queryFn: productsApi.getStats,
  })
}

export function useFeaturedProduct() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: productsApi.getFeatured,
  })
}

export function useProducts(filters: ProductListFilters) {
  return useQuery({
    queryKey: ['products', 'list', filters],
    queryFn: () => productsApi.getAll(filters),
  })
}

function invalidateProductQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: ['products', 'list'] })
  void queryClient.invalidateQueries({ queryKey: ['products', 'stats'] })
  void queryClient.invalidateQueries({ queryKey: ['products', 'featured'] })
  void queryClient.invalidateQueries({ queryKey: ['categories'] })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.create(input),
    onSuccess: () => invalidateProductQueries(queryClient),
  })
}

export function useUpdateProductStockAndPrice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: UpdateStockAndPriceInput
    }) => productsApi.updateStockAndPrice(id, input),
    onSuccess: () => invalidateProductQueries(queryClient),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => invalidateProductQueries(queryClient),
  })
}
