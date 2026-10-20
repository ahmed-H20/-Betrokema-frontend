import { request } from '@/api/client'
import {
  clientEnvelopeSchema,
  clientsForSellerResponseSchema,
  createClientInputSchema,
  type Client,
  type ClientCredentials,
  type ClientsForSellerResponse,
  type CreateClientInput,
  type UpdateClientInput,
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

export async function getClientById(id: string): Promise<Client> {
  const raw = await request<{ status: string; data: unknown }>(`/clients/${id}`)
  return clientEnvelopeSchema.shape.data.parse(raw.data)
}

export async function create(
  input: CreateClientInput,
): Promise<Client & { credentials?: ClientCredentials }> {
  const payload = createClientInputSchema.parse(input)
  const raw = await request<unknown>('/clients', {
    method: 'POST',
    body: payload,
  })
  const envelope = clientEnvelopeSchema.parse(raw)
  return {
    ...envelope.data,
    credentials: envelope.credentials,
  }
}

export async function update(
  id: string,
  input: UpdateClientInput,
): Promise<Client> {
  const raw = await request<{ status: string; data: unknown }>(`/clients/${id}`, {
    method: 'PUT',
    body: input,
  })
  return clientEnvelopeSchema.shape.data.parse(raw.data)
}
