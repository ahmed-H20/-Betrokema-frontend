import { request } from '@/api/client'
import { uploadSingleImage } from '@/api/upload'
import {
  type AddPaymentInput,
  type Invoice,
  type InvoicesListResponse,
  type InvoicesStats,
  type OrderStatus,
  invoiceSchema,
  invoicesForSellerResponseSchema,
  invoicesListResponseSchema,
  invoicesStatsSchema,
} from '@/api/invoices.schema'

export interface GetInvoicesParams {
  page?: number
  limit?: number
  search?: string
  orderStatus?: string
  paymentStatus?: string
  warehouse?: string
  month?: string
}

export async function getInvoices(
  params: GetInvoicesParams = {},
): Promise<InvoicesListResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.orderStatus && params.orderStatus !== 'all') {
    query.set('orderStatus', params.orderStatus)
  }
  if (params.paymentStatus) query.set('paymentStatus', params.paymentStatus)
  if (params.warehouse && params.warehouse !== 'all') {
    query.set('warehouse', params.warehouse)
  }
  if (params.month) query.set('month', params.month)

  const queryString = query.toString() ? `?${query.toString()}` : ''
  const raw = await request<unknown>(`/invoices${queryString}`)
  return invoicesListResponseSchema.parse(raw)
}

export async function getInvoiceStats(): Promise<InvoicesStats> {
  const raw = await request<unknown>('/invoices/stats')
  return invoicesStatsSchema.parse(raw).data
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  const raw = await request<{ status: string; data: unknown }>(`/invoices/${id}`)
  return invoiceSchema.parse(raw.data)
}

export async function updateOrderStatus(
  id: string,
  orderStatus: OrderStatus,
): Promise<Invoice> {
  const raw = await request<{ status: string; data: unknown }>(
    `/invoices/${id}/status`,
    {
      method: 'PATCH',
      body: { orderStatus },
    },
  )
  return invoiceSchema.parse(raw.data)
}

export async function addPaymentToInvoice(
  id: string,
  payload: AddPaymentInput,
): Promise<Invoice> {
  const raw = await request<{ status: string; data: unknown }>(
    `/invoices/${id}/payments`,
    {
      method: 'POST',
      body: payload,
    },
  )
  return invoiceSchema.parse(raw.data)
}

export interface CreateInvoicePayload {
  client: string
  seller?: string
  warehouse?: string
  invoiceCode?: string
  invoiceImageUrl?: string
  products: {
    productId: string
    price: number
    oldPrice?: number
    discountPercent?: number
    quantity: number
    unit?: string
  }[]
  taxAmount?: number
  notes?: string
  dueDate?: string | null
}

export async function uploadInvoiceImage(file: Blob | File): Promise<string> {
  const actualFile =
    file instanceof File
      ? file
      : new File([file], `invoice-${Date.now()}.png`, { type: 'image/png' })
  const res = await uploadSingleImage(actualFile, 'invoices')
  return res.url || res.path
}

export async function createInvoice(
  payload: CreateInvoicePayload,
): Promise<Invoice> {
  const raw = await request<{ status: string; data: unknown }>('/invoices', {
    method: 'POST',
    body: payload,
  })
  return invoiceSchema.parse(raw.data)
}

export async function getForSeller(sellerId: string): Promise<Invoice[]> {
  const raw = await request<unknown>(`/invoices/seller/${sellerId}`)
  return invoicesForSellerResponseSchema.parse(raw).data
}

export async function getForClient(clientId: string): Promise<Invoice[]> {
  const raw = await request<unknown>(`/invoices/client/${clientId}`)
  return invoicesForSellerResponseSchema.parse(raw).data
}

export async function updateInvoice(
  id: string,
  payload: Record<string, unknown>,
): Promise<Invoice> {
  const raw = await request<{ status: string; data: unknown }>(`/invoices/${id}`, {
    method: 'PUT',
    body: payload,
  })
  return invoiceSchema.parse(raw.data)
}

