import { z } from 'zod'
import { isHttpUrl } from '@/lib/url'
import {
  PRODUCT_IMAGE_URL_ERROR,
  VALIDATION_BESTELA_PRICE_REQUIRED,
  VALIDATION_DISCOUNT_MAX,
  VALIDATION_DISCOUNT_NEGATIVE,
  VALIDATION_GALON_PRICE_REQUIRED,
  VALIDATION_MIN_STOCK_NEGATIVE,
  VALIDATION_PRODUCT_CATEGORY_REQUIRED,
  VALIDATION_PRODUCT_NAME_REQUIRED,
  VALIDATION_QUANTITY_NEGATIVE,
} from '@/constants/strings'

const urlFieldSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || isHttpUrl(value), {
    message: PRODUCT_IMAGE_URL_ERROR,
  })

export const pricingFieldsSchema = z.object({
  galonPrice: z.number().min(0.01, VALIDATION_GALON_PRICE_REQUIRED),
  galonDiscount: z
    .number()
    .min(0, VALIDATION_DISCOUNT_NEGATIVE)
    .max(100, VALIDATION_DISCOUNT_MAX),
  galonWeight: z.string().trim(),
  bestelaPrice: z.number().min(0.01, VALIDATION_BESTELA_PRICE_REQUIRED),
  bestelaDiscount: z
    .number()
    .min(0, VALIDATION_DISCOUNT_NEGATIVE)
    .max(100, VALIDATION_DISCOUNT_MAX),
  bestelaWeight: z.string().trim(),
})
export type PricingFieldValues = z.infer<typeof pricingFieldsSchema>

export const productFormSchema = pricingFieldsSchema.extend({
  name: z.string().trim().min(1, VALIDATION_PRODUCT_NAME_REQUIRED),
  category: z.string().trim().min(1, VALIDATION_PRODUCT_CATEGORY_REQUIRED),
  description: z.string().trim(),
  warehouse: z.string().trim(),
  quantity: z.number().min(0, VALIDATION_QUANTITY_NEGATIVE),
  minStockThreshold: z.number().min(0, VALIDATION_MIN_STOCK_NEGATIVE),
  image: urlFieldSchema,
  images: z.array(z.object({ url: urlFieldSchema })),
  features: z.array(z.string()),
})
export type ProductFormValues = z.infer<typeof productFormSchema>

export const productFormDefaults: ProductFormValues = {
  name: '',
  category: '',
  description: '',
  warehouse: '',
  quantity: 0,
  minStockThreshold: 20,
  image: '',
  images: [],
  features: [],
  galonPrice: 0,
  galonDiscount: 0,
  galonWeight: '',
  bestelaPrice: 0,
  bestelaDiscount: 0,
  bestelaWeight: '',
}

export const stockPriceFormSchema = pricingFieldsSchema.extend({
  quantity: z.number().min(0, VALIDATION_QUANTITY_NEGATIVE),
})
export type StockPriceFormValues = z.infer<typeof stockPriceFormSchema>
