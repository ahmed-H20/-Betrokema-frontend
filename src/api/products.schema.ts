import { z } from 'zod'
import {
  VALIDATION_MIN_STOCK_NEGATIVE,
  VALIDATION_PACKAGES_MIN,
  VALIDATION_PRODUCT_CATEGORY_REQUIRED,
  VALIDATION_PRODUCT_NAME_REQUIRED,
  VALIDATION_PRODUCT_WAREHOUSE_REQUIRED,
  VALIDATION_QUANTITY_NEGATIVE,
} from '@/constants/strings'

export const productPackageSchema = z.object({
  unitName: z.string(),
  price: z.number(),
  oldPrice: z.number().optional().default(0),
  discountPercent: z.number().optional().default(0),
  weight: z.string().optional().default(''),
  note: z.string().optional().default(''),
})
export type ProductPackage = z.infer<typeof productPackageSchema>

export const productPackageInputSchema = z.object({
  unitName: z.string().min(1),
  price: z.number().min(0),
  oldPrice: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  weight: z.string().optional(),
  note: z.string().optional(),
})
export type ProductPackageInput = z.infer<typeof productPackageInputSchema>

const categoryRefSchema = z.object({
  _id: z.string(),
  name: z.string(),
  nameEn: z.string().optional().default(''),
  code: z.string().optional().default(''),
})

export const productGiftSchema = z.object({
  name: z.string().optional().default(''),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
  weight: z.string().optional().default(''),
})
export type ProductGift = z.infer<typeof productGiftSchema>

export const productColorSchema = z.object({
  name: z.string(),
  code: z.string().optional().default(''),
  hex: z.string().optional().default('#FFFFFF'),
  price: z.number().optional().default(0),
})
export type ProductColor = z.infer<typeof productColorSchema>

export const productColorInputSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().optional(),
  hex: z.string().trim().optional(),
  price: z.number().min(0).optional(),
})
export type ProductColorInput = z.infer<typeof productColorInputSchema>

export const giftProductRefSchema = z.object({
  _id: z.string(),
  name: z.string(),
  code: z.string().optional().default(''),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
  images: z.array(z.string()).optional().default([]),
  packages: z.array(productPackageSchema).optional().default([]),
})
export type GiftProductRef = z.infer<typeof giftProductRefSchema>

export const productSchema = z.object({
  _id: z.string(),
  name: z.string(),
  code: z.string().optional().default(''),
  description: z.string().optional().default(''),
  category: z.union([categoryRefSchema, z.string()]).nullable(),
  image: z.string().optional().default(''),
  images: z.array(z.string()).optional().default([]),
  warehouse: z.string().optional().default(''),
  quantity: z.number(),
  minStockThreshold: z.number().optional().default(20),
  isFeatured: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
  statusBadge: z.string().optional().default(''),
  fetures: z
    .array(z.object({ name: z.string().optional().default('') }))
    .optional()
    .default([]),
  packages: z.array(productPackageSchema).optional().default([]),
  colors: z.array(productColorSchema).optional().default([]),
  gift: productGiftSchema.optional().default({ name: '', description: '', image: '', weight: '' }),
  giftProduct: z.union([giftProductRefSchema, z.string()]).nullable().optional(),
  giftTitle: z.string().optional().default(''),
  isLowStock: z.boolean().optional().default(false),
})
export type Product = z.infer<typeof productSchema>

export const productListResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number().optional(),
  totalCount: z.number().optional(),
  pagination: z
    .object({
      currentPage: z.number(),
      limit: z.number(),
      numberOfPages: z.number(),
      nextPage: z.number().optional(),
      prevPage: z.number().optional(),
    })
    .optional(),
  data: z.array(productSchema),
})
export type ProductListResponse = z.infer<typeof productListResponseSchema>

export const productEnvelopeSchema = z.object({
  status: z.literal('success'),
  message: z.string().optional(),
  data: productSchema,
})

export const featuredProductResponseSchema = z.object({
  status: z.literal('success'),
  data: productSchema.nullable(),
})

export const productStatsResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    totalProducts: z.object({ count: z.number(), quarterAdded: z.number() }),
    totalStockValue: z.object({
      value: z.number(),
      warehousesCount: z.number(),
      warehousesList: z.array(z.string()),
    }),
    criticalStockAlerts: z.object({
      count: z.number(),
      products: z.array(
        z.object({
          _id: z.string(),
          name: z.string(),
          code: z.string().optional().default(''),
          quantity: z.number(),
          warehouse: z.string().optional().default(''),
        }),
      ),
    }),
    categoriesCount: z.number(),
  }),
})
export type ProductStats = z.infer<typeof productStatsResponseSchema>['data']

// Lean shape for GET /products?limit=500&field=name,code — the warehouse
// transfer/assign-product pickers only ever need id/name/code, and the full
// productSchema above requires fields (e.g. quantity) the server's `field`
// projection omits.
export const productPickerItemSchema = z.object({
  _id: z.string(),
  name: z.string(),
  code: z.string().optional().default(''),
})
export type ProductPickerItem = z.infer<typeof productPickerItemSchema>

export const productPickerResponseSchema = z.object({
  status: z.literal('success'),
  totalCount: z.number().optional(),
  data: z.array(productPickerItemSchema),
})

export type ProductListFilters = {
  category?: string
  search?: string
  page?: number
  limit?: number
  sort?: string
  isLowStock?: boolean
}

export const createProductInputSchema = z.object({
  name: z.string().trim().min(1, VALIDATION_PRODUCT_NAME_REQUIRED),
  category: z.string().trim().min(1, VALIDATION_PRODUCT_CATEGORY_REQUIRED),
  description: z.string().trim().optional(),
  warehouse: z.string().trim().min(1, VALIDATION_PRODUCT_WAREHOUSE_REQUIRED),
  quantity: z.number().min(0, VALIDATION_QUANTITY_NEGATIVE),
  minStockThreshold: z.number().min(0, VALIDATION_MIN_STOCK_NEGATIVE),
  image: z.string().trim().optional(),
  images: z.array(z.string().trim()).optional(),
  fetures: z.array(z.object({ name: z.string() })).optional(),
  packages: z.array(productPackageInputSchema).min(1, VALIDATION_PACKAGES_MIN),
  colors: z.array(productColorInputSchema).optional(),
  gift: productGiftSchema.optional(),
  giftProduct: z.string().nullable().optional(),
  giftTitle: z.string().optional(),
})
export type CreateProductInput = z.infer<typeof createProductInputSchema>

export const updateStockAndPriceInputSchema = z.object({
  quantity: z.number().min(0).optional(),
  packages: z.array(productPackageInputSchema).optional(),
})
export type UpdateStockAndPriceInput = z.infer<
  typeof updateStockAndPriceInputSchema
>
