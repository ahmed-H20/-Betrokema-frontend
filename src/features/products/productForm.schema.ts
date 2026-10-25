import type { DefaultValues } from 'react-hook-form'
import { z } from 'zod'
import { isHttpUrl } from '@/lib/url'
import {
  PRODUCT_IMAGE_URL_ERROR,
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

export const packageItemFormSchema = z.object({
  unitName: z
    .string()
    .trim()
    .min(1, 'اسم أو نوع العبوة مطلوب (مثل: شكارة، بستلة، جالون، كيلو)'),
  weight: z.string().trim(),
  price: z.number().min(0.01, 'السعر يجب أن يكون أكبر من صفر'),
  oldPrice: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  note: z.string().trim().optional(),
})
export type PackageItemFormValues = z.infer<typeof packageItemFormSchema>

export const pricingFieldsSchema = z.object({
  packages: z
    .array(packageItemFormSchema)
    .min(1, 'يجب إضافة وحدة وعبوة واحدة على الأقل للمنتج'),
  // Optional backward-compatibility fields
  galonPrice: z.number().optional(),
  galonDiscount: z.number().optional(),
  galonWeight: z.string().optional(),
  bestelaPrice: z.number().optional(),
  bestelaDiscount: z.number().optional(),
  bestelaWeight: z.string().optional(),
})
export type PricingFieldValues = z.infer<typeof pricingFieldsSchema>

export const colorItemFormSchema = z.object({
  name: z.string().trim().min(1, 'اسم اللون مطلوب'),
  code: z.string().trim().optional(),
  hex: z.string().trim().optional(),
  price: z.number().min(0, 'سعر اللون لا يمكن أن يكون سالباً').optional(),
})
export type ColorItemFormValues = z.infer<typeof colorItemFormSchema>

export const defaultColorItem: ColorItemFormValues = {
  name: '',
  code: '',
  hex: '#FFFFFF',
  price: 0,
}

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
  colors: z.array(colorItemFormSchema),
  giftProduct: z.string().optional(),
  giftTitle: z.string().optional(),
  giftName: z.string().trim().optional(),
  giftDescription: z.string().trim().optional(),
  giftImage: imageFieldSchema.optional(),
  giftWeight: z.string().trim().optional(),
})
export type ProductFormValues = z.infer<typeof productFormSchema>

export const defaultPackageItem: PackageItemFormValues = {
  unitName: 'بستلة',
  weight: '9 لتر',
  price: undefined as unknown as number,
  oldPrice: 0,
  discountPercent: 0,
  note: '',
}

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
  colors: [],
  giftProduct: '',
  giftTitle: '',
  giftName: '',
  giftDescription: '',
  giftImage: '',
  giftWeight: '',
  packages: [
    {
      unitName: 'بستلة',
      weight: '9 لتر',
      price: undefined as unknown as number,
      oldPrice: 0,
      discountPercent: 0,
      note: '',
    },
    {
      unitName: 'جالون',
      weight: '2.5 لتر',
      price: undefined as unknown as number,
      oldPrice: 0,
      discountPercent: 0,
      note: '',
    },
  ],
  galonPrice: undefined,
  galonDiscount: 0,
  galonWeight: '',
  bestelaPrice: undefined,
  bestelaDiscount: 0,
  bestelaWeight: '',
}

export const stockPriceFormSchema = pricingFieldsSchema.extend({
  quantity: z.number().min(0, VALIDATION_QUANTITY_NEGATIVE),
})
export type StockPriceFormValues = z.infer<typeof stockPriceFormSchema>
