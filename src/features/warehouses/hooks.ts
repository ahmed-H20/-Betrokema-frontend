import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as productsApi from '@/api/products'
import * as warehousesApi from '@/api/warehouses'
import { TRANSFER_STALE_ERROR } from '@/constants/strings'
import type {
  AssignProductInput,
  CreateTransferInput,
  CreateWarehouseInput,
  InventoryFilters,
  TransferStatus,
  UpdateInventoryItemInput,
  UpdateTransferStatusInput,
  UpdateWarehouseInput,
  WarehouseListFilters,
} from '@/api/warehouses.schema'

export function useWarehouses(filters: WarehouseListFilters = {}) {
  return useQuery({
    queryKey: ['warehouses', 'list', filters],
    queryFn: () => warehousesApi.getAll(filters),
  })
}

export function useWarehouseStats() {
  return useQuery({
    queryKey: ['warehouses', 'stats'],
    queryFn: warehousesApi.getStats,
  })
}

export function useWarehouse(id: string | undefined) {
  return useQuery({
    queryKey: ['warehouses', 'detail', id],
    queryFn: () => warehousesApi.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useWarehouseInventory(
  id: string | undefined,
  filters: InventoryFilters = {},
) {
  return useQuery({
    queryKey: ['warehouses', 'inventory', id, filters],
    queryFn: () => warehousesApi.getInventory(id as string, filters),
    enabled: Boolean(id),
  })
}

// Cached 5 minutes per context/.bridge-plan.md step 2 — a 500-row picker
// list doesn't need to refetch on every dialog open.
export function useProductsForPicker() {
  return useQuery({
    queryKey: ['products', 'picker'],
    queryFn: productsApi.getForPicker,
    staleTime: 5 * 60_000,
  })
}

export function useTransfers(status?: TransferStatus) {
  return useQuery({
    queryKey: ['warehouses', 'transfers', status],
    queryFn: () => warehousesApi.getTransfers(status),
  })
}

function invalidateWarehouseList(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['warehouses', 'list'] })
  void queryClient.invalidateQueries({ queryKey: ['warehouses', 'stats'] })
}

function invalidateWarehouseDetail(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
) {
  void queryClient.invalidateQueries({ queryKey: ['warehouses', 'detail', id] })
  void queryClient.invalidateQueries({ queryKey: ['warehouses', 'inventory', id] })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWarehouseInput) => warehousesApi.create(input),
    onSuccess: () => invalidateWarehouseList(queryClient),
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWarehouseInput }) =>
      warehousesApi.update(id, input),
    onSuccess: (_data, variables) => {
      invalidateWarehouseList(queryClient)
      invalidateWarehouseDetail(queryClient, variables.id)
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => warehousesApi.remove(id),
    onSuccess: () => invalidateWarehouseList(queryClient),
  })
}

export function useAssignProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AssignProductInput }) =>
      warehousesApi.assignProduct(id, input),
    onSuccess: (_data, variables) => {
      invalidateWarehouseList(queryClient)
      invalidateWarehouseDetail(queryClient, variables.id)
    },
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      itemId,
      input,
    }: {
      id: string
      itemId: string
      input: UpdateInventoryItemInput
    }) => warehousesApi.updateInventoryItem(id, itemId, input),
    onSuccess: (_data, variables) => {
      invalidateWarehouseList(queryClient)
      invalidateWarehouseDetail(queryClient, variables.id)
    },
  })
}

export function useExportReport() {
  return useMutation({
    mutationFn: warehousesApi.exportReport,
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTransferInput) =>
      warehousesApi.createTransfer(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['warehouses', 'transfers'] })
      void queryClient.invalidateQueries({ queryKey: ['warehouses', 'stats'] })
    },
  })
}

export function useUpdateTransferStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      transferId,
      input,
    }: {
      transferId: string
      input: UpdateTransferStatusInput
    }) => {
      // Re-check immediately before sending the PATCH — the backend has no
      // idempotency guard on approved/completed (architecture.md gap #9), so
      // a stale "pending" row (already acted on elsewhere, or a fast
      // double-click past the UI's own disable) must not re-apply the stock
      // shift a second time.
      const fresh = await warehousesApi.getTransferById(transferId)
      if (fresh.status !== 'pending') {
        throw new Error(TRANSFER_STALE_ERROR)
      }
      return warehousesApi.updateTransferStatus(transferId, input)
    },
    onSuccess: (transfer) => {
      void queryClient.invalidateQueries({ queryKey: ['warehouses', 'transfers'] })
      void queryClient.invalidateQueries({ queryKey: ['warehouses', 'stats'] })
      invalidateWarehouseList(queryClient)
      const fromId =
        typeof transfer.fromWarehouse === 'string'
          ? transfer.fromWarehouse
          : transfer.fromWarehouse._id
      const toId =
        typeof transfer.toWarehouse === 'string'
          ? transfer.toWarehouse
          : transfer.toWarehouse._id
      invalidateWarehouseDetail(queryClient, fromId)
      invalidateWarehouseDetail(queryClient, toId)
    },
  })
}
