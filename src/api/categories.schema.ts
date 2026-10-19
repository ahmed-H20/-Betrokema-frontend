import { z } from 'zod'
import { VALIDATION_CATEGORY_NAME_REQUIRED } from '@/constants/strings'

export const categorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  nameEn: z.string().optional().default(''),
  code: z.string().optional().default(''),
  description: z.string().optional().default(''),
  productsCount: z.number().optional().default(0),
})
export type Category = z.infer<typeof categorySchema>

export const categoryListResponseSchema = z.object({
  status: z.literal('success'),
  totalCategories: z.number(),
  totalProducts: z.number(),
  data: z.array(categorySchema),
})
export type CategoryListResponse = z.infer<typeof categoryListResponseSchema>

export const categoryEnvelopeSchema = z.object({
  status: z.literal('success'),
  message: z.string().optional(),
  data: categorySchema,
})

export const createCategoryInputSchema = z.object({
  name: z.string().trim().min(1, VALIDATION_CATEGORY_NAME_REQUIRED),
  nameEn: z.string().trim().optional(),
})
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>
