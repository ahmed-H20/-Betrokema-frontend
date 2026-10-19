import { request } from '@/api/client'
import {
  categoryEnvelopeSchema,
  categoryListResponseSchema,
  type Category,
  type CreateCategoryInput,
} from '@/api/categories.schema'

export async function getAll(): Promise<{
  data: Category[]
  totalCategories: number
  totalProducts: number
}> {
  const raw = await request<unknown>('/categories')
  return categoryListResponseSchema.parse(raw)
}

export async function create(input: CreateCategoryInput): Promise<Category> {
  const raw = await request<unknown>('/categories', {
    method: 'POST',
    body: input,
  })
  return categoryEnvelopeSchema.parse(raw).data
}

export async function remove(id: string): Promise<void> {
  await request<unknown>(`/categories/${id}`, { method: 'DELETE' })
}
