import { request } from '@/api/client'
import {
  createSellerInputSchema,
  sellerEnvelopeSchema,
  sellerListResponseSchema,
  sellerPerformanceResponseSchema,
  sellerStatsResponseSchema,
  updateSellerInputSchema,
  type CreateSellerInput,
  type EnrichedSeller,
  type Seller,
  type SellerCredentials,
  type SellerListFilters,
  type SellerPerformance,
  type SellerStats,
  type UpdateSellerInput,
} from '@/api/sellers.schema'

function buildQuery(filters: SellerListFilters): string {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)
  if (filters.sort) params.set('sort', filters.sort)
  // governorate is deliberately never sent here — the directory's
  // governorate dropdown options are derived client-side from this same
  // (status/search-filtered) result set, then applied as a client-side
  // filter, so the option list never shrinks to just the active selection.
  // See context/ui-tokens.md.
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function getAll(
  filters: SellerListFilters = {},
): Promise<EnrichedSeller[]> {
  const raw = await request<unknown>(`/sellers${buildQuery(filters)}`)
  return sellerListResponseSchema.parse(raw).data
}

export async function getStats(): Promise<SellerStats> {
  const raw = await request<unknown>('/sellers/stats')
  return sellerStatsResponseSchema.parse(raw).data
}

export async function getPerformance(id: string): Promise<SellerPerformance> {
  const raw = await request<unknown>(`/sellers/${id}/performance`)
  return sellerPerformanceResponseSchema.parse(raw).data
}

export async function create(
  input: CreateSellerInput,
): Promise<Seller & { credentials?: SellerCredentials }> {
  const payload = createSellerInputSchema.parse(input)
  const raw = await request<unknown>('/sellers', {
    method: 'POST',
    body: payload,
  })
  const envelope = sellerEnvelopeSchema.parse(raw)
  return {
    ...envelope.data,
    credentials: envelope.credentials,
  }
}

export async function update(
  id: string,
  input: UpdateSellerInput,
): Promise<Seller> {
  const payload = updateSellerInputSchema.parse(input)
  const raw = await request<unknown>(`/sellers/${id}`, {
    method: 'PUT',
    body: payload,
  })
  return sellerEnvelopeSchema.parse(raw).data
}

export async function remove(id: string): Promise<void> {
  await request<unknown>(`/sellers/${id}`, { method: 'DELETE' })
}
