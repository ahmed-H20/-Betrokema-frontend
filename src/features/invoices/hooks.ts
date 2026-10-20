import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type AddPaymentInput,
  type OrderStatus,
} from '@/api/invoices.schema'
import {
  type CreateInvoicePayload,
  type GetInvoicesParams,
  addPaymentToInvoice,
  createInvoice,
  getInvoiceById,
  getInvoiceStats,
  getInvoices,
  updateOrderStatus,
} from '@/api/invoices'

export function useInvoices(params: GetInvoicesParams = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => getInvoices(params),
  })
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: ['invoices', 'stats'],
    queryFn: getInvoiceStats,
    staleTime: 1000 * 30, // 30s fresh
  })
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => (id ? getInvoiceById(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', id] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['sellers'] })
    },
  })
}

export function useAddPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AddPaymentInput }) =>
      addPaymentToInvoice(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', id] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['sellers'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['sellers'] })
    },
  })
}
