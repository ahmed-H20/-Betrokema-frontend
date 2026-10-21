import type { DefaultValues } from 'react-hook-form'
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
  VALIDATION_PRODUCT_WAREHOUSE_REQUIRED,
  VALIDATION_QUANTITY_NEGATIVE,
} from '@/constants/strings'

const imageFieldSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === '' ||
      value.startsWith('/uploads') ||
      value.startsWith('uploads') ||
      value.startsWith('/') ||
      isHttpUrl(value) ||
      value.startsWith('data:image/') ||
      value.startsWith('blob:'),
    {
      message: PRODUCT_IMAGE_URL_ERROR,
    },
  )

export const pricingFieldsSchema = z.object({
  galonPrice: z
    .number({ error: VALIDATION_GALON_PRICE_REQUIRED })
    .min(0.01, VALIDATION_GALON_PRICE_REQUIRED),
  galonDiscount: z
    .number()
    .min(0, VALIDATION_DISCOUNT_NEGATIVE)
    .max(100, VALIDATION_DISCOUNT_MAX),
  galonWeight: z.string().trim(),
  bestelaPrice: z
    .number({ error: VALIDATION_BESTELA_PRICE_REQUIRED })
    .min(0.01, VALIDATION_BESTELA_PRICE_REQUIRED),
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
  warehouse: z.string().trim().min(1, VALIDATION_PRODUCT_WAREHOUSE_REQUIRED),
  quantity: z.number().min(0, VALIDATION_QUANTITY_NEGATIVE),
  minStockThreshold: z.number().min(0, VALIDATION_MIN_STOCK_NEGATIVE),
  image: imageFieldSchema,
  images: z.array(z.object({ url: imageFieldSchema })),
  features: z.array(z.string()),
})
export type ProductFormValues = z.infer<typeof productFormSchema>

// galon/bestelaPrice and discount are deliberately left undefined (not 0) so
// the Stitch placeholders ("350.00"/"1250.00", "5"/"8") show instead of a
// prefilled 0 — see context/ui-tokens.md deviations log.
export const productFormDefaults: DefaultValues<ProductFormValues> = {
  name: '',
  category: '',
  description: '',
  warehouse: '',
  quantity: 0,
  minStockThreshold: 20,
  image: '',
  images: [],
  features: [],
  galonPrice: undefined,
  galonDiscount: undefined,
  galonWeight: '',
  bestelaPrice: undefined,
  bestelaDiscount: undefined,
  bestelaWeight: '',
}

export const stockPriceFormSchema = pricingFieldsSchema.extend({
  quantity: z.number().min(0, VALIDATION_QUANTITY_NEGATIVE),
})
export type StockPriceFormValues = z.infer<typeof stockPriceFormSchema>
