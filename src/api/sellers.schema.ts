import { z } from 'zod'
import { EGYPT_MOBILE_REGEX } from '@/lib/phone'
import {
  SELLER_PHOTO_URL_ERROR,
  VALIDATION_SELLER_NAME_REQUIRED,
  VALIDATION_SELLER_PHONE_INVALID,
} from '@/constants/strings'

export const sellerStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'VACATION'])
export type SellerStatus = z.infer<typeof sellerStatusSchema>

export const sellerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  code: z.string().optional().default(''),
  phone: z.string(),
  title: z.string().optional().default('مندوب مبيعات ميداني'),
  governorate: z.string().optional().default('القاهرة'),
  region: z.string().optional().default(''),
  sector: z.string().optional().default('قطاع عام'),
  city: z.string().optional().default(''),
  address: z.string().optional().default(''),
  photoUrl: z.string().optional().default(''),
  monthlyTarget: z.number().optional().default(500000),
  commissionRate: z.number().optional().default(6),
  status: sellerStatusSchema.optional().default('ACTIVE'),
  statusNote: z.string().optional().default(''),
  certifiedSince: z.number().optional(),
})
export type Seller = z.infer<typeof sellerSchema>

// GET /sellers enriches each Seller with per-request aggregates (see
// architecture.md) — not persisted fields on the model itself.
export const enrichedSellerSchema = sellerSchema.extend({
  monthlySales: z.number(),
  achievementPercent: z.number(),
  clientsCount: z.number(),
  invoicesThisQuarter: z.number(),
})
export type EnrichedSeller = z.infer<typeof enrichedSellerSchema>

export const sellerListResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number().optional(),
  data: z.array(enrichedSellerSchema),
})
export type SellerListResponse = z.infer<typeof sellerListResponseSchema>

export const sellerEnvelopeSchema = z.object({
  status: z.literal('success'),
  message: z.string().optional(),
  data: sellerSchema,
})

export const sellerStatsResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    certifiedSellers: z.object({
      total: z.number(),
      active: z.number(),
      suspended: z.number(),
      vacation: z.number(),
    }),
    teamMonthlySales: z.object({
      totalAchieved: z.number(),
      monthlyTarget: z.number(),
      growthRate: z.number(),
    }),
    targetAchievement: z.object({
      percentage: z.number(),
      statusText: z.string(),
      daysRemaining: z.number(),
    }),
    activeFieldClients: z.object({
      total: z.number(),
      newThisWeek: z.number(),
      // activityRate is a hardcoded 92 server-side (architecture.md) — parsed
      // here so the shape stays faithful to the real response, but the UI
      // must never render it (context/build-plan.md data-honesty rule).
      activityRate: z.number(),
    }),
  }),
})
export type SellerStats = z.infer<typeof sellerStatsResponseSchema>['data']

export const sellerPerformanceResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    seller: sellerSchema,
    metrics: z.object({
      currentMonthSales: z.number(),
      monthlyTarget: z.number(),
      achievementRate: z.number(),
      commissionRate: z.number(),
      commissionAmount: z.number(),
      // Falls back to a hardcoded 91 only when currentMonthSales === 0
      // (architecture.md) — the UI must show "—" in that exact case instead
      // of rendering this fallback as a real rate.
      collectionRate: z.number(),
      clientsCount: z.number(),
      totalInvoicesCount: z.number(),
    }),
  }),
})
export type SellerPerformance = z.infer<
  typeof sellerPerformanceResponseSchema
>['data']

export type SellerListFilters = {
  governorate?: string
  status?: SellerStatus
  search?: string
  sort?: 'performance' | 'sales'
}

const sellerPhoneSchema = z
  .string()
  .trim()
  .regex(EGYPT_MOBILE_REGEX, VALIDATION_SELLER_PHONE_INVALID)
const sellerPhotoUrlSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^https?:\/\//.test(value), {
    message: SELLER_PHOTO_URL_ERROR,
  })

export const createSellerInputSchema = z.object({
  name: z.string().trim().min(1, VALIDATION_SELLER_NAME_REQUIRED),
  phone: sellerPhoneSchema,
  title: z.string().trim().optional(),
  governorate: z.string().trim().optional(),
  region: z.string().trim().optional(),
  sector: z.string().trim().optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
  photoUrl: sellerPhotoUrlSchema.optional(),
  monthlyTarget: z.number().min(0).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
})
export type CreateSellerInput = z.infer<typeof createSellerInputSchema>

export const updateSellerInputSchema = createSellerInputSchema
  .partial()
  .extend({
    status: sellerStatusSchema.optional(),
    statusNote: z.string().trim().optional(),
  })
export type UpdateSellerInput = z.infer<typeof updateSellerInputSchema>
