import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as clientsApi from '@/api/clients'
import * as invoicesApi from '@/api/invoices'
import * as sellersApi from '@/api/sellers'
import type { CreateClientInput } from '@/api/clients.schema'
import type {
  CreateSellerInput,
  SellerListFilters,
  UpdateSellerInput,
} from '@/api/sellers.schema'

// Backend does N+1 queries per seller on both of these endpoints (see
// context/architecture.md) — avoid refiring them on every window focus and
// keep a short staleTime so repeated reads within a session reuse the
// result instead of re-triggering the whole fan-out.
const SELLERS_QUERY_CONFIG = {
  refetchOnWindowFocus: false,
  staleTime: 30_000,
} as const

export function useSellers(filters: SellerListFilters) {
  return useQuery({
    queryKey: ['sellers', 'list', filters],
    queryFn: () => sellersApi.getAll(filters),
    ...SELLERS_QUERY_CONFIG,
  })
}

export function useSellerStats() {
  return useQuery({
    queryKey: ['sellers', 'stats'],
    queryFn: sellersApi.getStats,
    ...SELLERS_QUERY_CONFIG,
  })
}

export function useSellerPerformance(sellerId: string | undefined) {
  return useQuery({
    queryKey: ['sellers', 'performance', sellerId],
    queryFn: () => sellersApi.getPerformance(sellerId as string),
    enabled: Boolean(sellerId),
  })
}

export function useClientsForSeller(sellerId: string | undefined) {
  return useQuery({
    queryKey: ['clients', 'by-seller', sellerId],
    queryFn: () => clientsApi.getForSeller(sellerId as string),
    enabled: Boolean(sellerId),
  })
}

export function useInvoicesForSeller(sellerId: string | undefined) {
  return useQuery({
    queryKey: ['invoices', 'by-seller', sellerId],
    queryFn: () => invoicesApi.getForSeller(sellerId as string),
    enabled: Boolean(sellerId),
  })
}

function invalidateSellerQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  sellerId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: ['sellers', 'list'] })
  void queryClient.invalidateQueries({ queryKey: ['sellers', 'stats'] })
  if (sellerId) {
    void queryClient.invalidateQueries({
      queryKey: ['sellers', 'performance', sellerId],
    })
  }
}

export function useCreateSeller() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSellerInput) => sellersApi.create(input),
    onSuccess: () => invalidateSellerQueries(queryClient),
  })
}

export function useUpdateSeller() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: UpdateSellerInput
    }) => sellersApi.update(id, input),
    onSuccess: (_data, variables) =>
      invalidateSellerQueries(queryClient, variables.id),
  })
}

export function useDeleteSeller() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sellersApi.remove(id),
    onSuccess: () => invalidateSellerQueries(queryClient),
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateClientInput) => clientsApi.create(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['clients', 'by-seller', variables.seller],
      })
      void queryClient.invalidateQueries({
        queryKey: ['sellers', 'performance', variables.seller],
      })
    },
  })
}
