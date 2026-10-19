import { z } from 'zod'
import { request } from '@/api/client'
import { TRANSFER_NOT_FOUND_ERROR } from '@/constants/strings'
import {
  assignProductInputSchema,
  createTransferInputSchema,
  createWarehouseInputSchema,
  exportReportResponseSchema,
  inventoryResponseSchema,
  transferEnvelopeSchema,
  transfersResponseSchema,
  updateInventoryItemInputSchema,
  updateTransferStatusInputSchema,
  updateWarehouseInputSchema,
  warehouseDetailEnvelopeSchema,
  warehouseEnvelopeSchema,
  warehouseListResponseSchema,
  warehouseStatsResponseSchema,
  type AssignProductInput,
  type CreateTransferInput,
  type CreateWarehouseInput,
  type ExportReportRow,
  type InventoryFilters,
  type InventoryResponse,
  type StockTransfer,
  type TransferStatus,
  type UpdateInventoryItemInput,
  type UpdateTransferStatusInput,
  type UpdateWarehouseInput,
  type Warehouse,
  type WarehouseDetail,
  type WarehouseListFilters,
  type WarehouseListResponse,
  type WarehouseStats,
} from '@/api/warehouses.schema'

// Minimal seam for the products form's warehouse <select> — only `name` is
// used there. The full Warehouse resource below is built out in Chunk 3.
const warehouseNameSchema = z.object({ name: z.string() })
const warehouseNamesResponseSchema = z.object({
  status: z.literal('success'),
  data: z.array(warehouseNameSchema),
})

export async function getAllNames(): Promise<string[]> {
  const raw = await request<unknown>('/warehouses')
  const { data } = warehouseNamesResponseSchema.parse(raw)
  return data.map((warehouse) => warehouse.name)
}

function buildListQuery(filters: WarehouseListFilters): string {
  const params = new URLSearchParams()
  if (filters.filter) params.set('filter', filters.filter)
  if (filters.governorate) params.set('governorate', filters.governorate)
  if (filters.search) params.set('search', filters.search)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function getAll(
  filters: WarehouseListFilters = {},
): Promise<WarehouseListResponse> {
  const raw = await request<unknown>(`/warehouses${buildListQuery(filters)}`)
  return warehouseListResponseSchema.parse(raw)
}

export async function getStats(): Promise<WarehouseStats> {
  const raw = await request<unknown>('/warehouses/stats')
  return warehouseStatsResponseSchema.parse(raw).data
}

export async function getById(id: string): Promise<WarehouseDetail> {
  const raw = await request<unknown>(`/warehouses/${id}`)
  return warehouseDetailEnvelopeSchema.parse(raw).data
}

export async function create(input: CreateWarehouseInput): Promise<Warehouse> {
  const payload = createWarehouseInputSchema.parse(input)
  const raw = await request<unknown>('/warehouses', {
    method: 'POST',
    body: payload,
  })
  return warehouseEnvelopeSchema.parse(raw).data
}

export async function update(
  id: string,
  input: UpdateWarehouseInput,
): Promise<Warehouse> {
  const payload = updateWarehouseInputSchema.parse(input)
  const raw = await request<unknown>(`/warehouses/${id}`, {
    method: 'PUT',
    body: payload,
  })
  return warehouseEnvelopeSchema.parse(raw).data
}

export async function remove(id: string): Promise<void> {
  await request<unknown>(`/warehouses/${id}`, { method: 'DELETE' })
}

function buildInventoryQuery(filters: InventoryFilters): string {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function getInventory(
  id: string,
  filters: InventoryFilters = {},
): Promise<InventoryResponse> {
  const raw = await request<unknown>(
    `/warehouses/${id}/inventory${buildInventoryQuery(filters)}`,
  )
  return inventoryResponseSchema.parse(raw)
}

export async function assignProduct(
  id: string,
  input: AssignProductInput,
): Promise<WarehouseDetail> {
  const payload = assignProductInputSchema.parse(input)
  const raw = await request<unknown>(`/warehouses/${id}/inventory`, {
    method: 'POST',
    body: payload,
  })
  return warehouseDetailEnvelopeSchema.parse(raw).data
}

export async function updateInventoryItem(
  id: string,
  itemId: string,
  input: UpdateInventoryItemInput,
): Promise<void> {
  const payload = updateInventoryItemInputSchema.parse(input)
  await request<unknown>(`/warehouses/${id}/inventory/${itemId}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function getTransfers(
  status?: TransferStatus,
): Promise<StockTransfer[]> {
  const query = status ? `?status=${status}` : ''
  const raw = await request<unknown>(`/warehouses/transfers${query}`)
  return transfersResponseSchema.parse(raw).data
}

export async function createTransfer(
  input: CreateTransferInput,
): Promise<StockTransfer> {
  const payload = createTransferInputSchema.parse(input)
  const raw = await request<unknown>('/warehouses/transfers', {
    method: 'POST',
    body: payload,
  })
  return transferEnvelopeSchema.parse(raw).data
}

export async function getTransferById(transferId: string): Promise<StockTransfer> {
  // No single-transfer GET endpoint exists — the Transfers dialog's
  // re-check-before-PATCH guard (architecture.md gap #9) refetches the
  // whole list and finds this one by id instead.
  const all = await getTransfers()
  const transfer = all.find((item) => item._id === transferId)
  if (!transfer) throw new Error(TRANSFER_NOT_FOUND_ERROR)
  return transfer
}

export async function updateTransferStatus(
  transferId: string,
  input: UpdateTransferStatusInput,
): Promise<StockTransfer> {
  const payload = updateTransferStatusInputSchema.parse(input)
  const raw = await request<unknown>(`/warehouses/transfers/${transferId}/status`, {
    method: 'PATCH',
    body: payload,
  })
  return transferEnvelopeSchema.parse(raw).data
}

export async function exportReport(): Promise<ExportReportRow[]> {
  const raw = await request<unknown>('/warehouses/export')
  return exportReportResponseSchema.parse(raw).data
}
