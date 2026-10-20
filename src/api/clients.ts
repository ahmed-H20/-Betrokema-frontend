import { request } from '@/api/client'
import {
  clientEnvelopeSchema,
  clientsForSellerResponseSchema,
  createClientInputSchema,
  type Client,
  type ClientsForSellerResponse,
  type CreateClientInput,
} from '@/api/clients.schema'

export async function getAllClients(): Promise<Client[]> {
  const raw = await request<{ status: string; data: Client[] }>('/clients?limit=100')
  return raw?.data || []
}

export async function getForSeller(
  sellerId: string,
): Promise<ClientsForSellerResponse> {
  const raw = await request<unknown>(`/clients/seller/${sellerId}`)
  return clientsForSellerResponseSchema.parse(raw)
}

export async function create(input: CreateClientInput): Promise<Client> {
  const payload = createClientInputSchema.parse(input)
  const raw = await request<unknown>('/clients', {
    method: 'POST',
    body: payload,
  })
  return clientEnvelopeSchema.parse(raw).data
}
