import { request } from '@/api/client'
import {
  invoicesForSellerResponseSchema,
  type Invoice,
} from '@/api/invoices.schema'

export async function getForSeller(sellerId: string): Promise<Invoice[]> {
  const raw = await request<unknown>(`/invoices/seller/${sellerId}`)
  return invoicesForSellerResponseSchema.parse(raw).data
}
