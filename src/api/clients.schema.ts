import { z } from 'zod'
import { EGYPT_MOBILE_REGEX } from '@/lib/phone'
import {
  VALIDATION_CLIENT_NAME_REQUIRED,
  VALIDATION_CLIENT_ORGANIZE_REQUIRED,
  VALIDATION_CLIENT_PHONE_INVALID,
} from '@/constants/strings'

export const clientPaymentStatusSchema = z.enum([
  'regular',
  'over_credit',
  'excellent',
  'settled',
])
export type ClientPaymentStatus = z.infer<typeof clientPaymentStatusSchema>

const sellerRefSchema = z.object({
  _id: z.string(),
  name: z.string(),
  phone: z.string().optional().default(''),
  code: z.string().optional().default(''),
})

export const clientSchema = z.object({
  _id: z.string(),
  name: z.string(),
  organizeName: z.string(),
  contactPerson: z.string().optional().default(''),
  phone: z.string(),
  clientCode: z.string().optional().default(''),
  // getClientsForSeller never populates this (plain ObjectId string); create
  // does (populated ref) — see architecture.md.
  seller: z.union([z.string(), sellerRefSchema]).nullable(),
  governorate: z.string().optional().default('القاهرة'),
  city: z.string().optional().default('القاهرة'),
  address: z.string().optional().default(''),
  tier: z.string().optional().default('عميل عام'),
  creditLimit: z.number().optional().default(100000),
  currentDebt: z.number().optional().default(0),
  paymentStatus: clientPaymentStatusSchema.optional().default('regular'),
  commercialType: z.string().optional().default('معرض طلاء'),
  notes: z.string().optional().default(''),
  isOverCredit: z.boolean().optional().default(false),
})
export type Client = z.infer<typeof clientSchema>

export const clientsForSellerResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number().optional(),
  summary: z.object({
    totalDebt: z.number(),
    overCreditCount: z.number(),
  }),
  data: z.array(clientSchema),
})
export type ClientsForSellerResponse = z.infer<
  typeof clientsForSellerResponseSchema
>

export const clientEnvelopeSchema = z.object({
  status: z.literal('success'),
  message: z.string().optional(),
  data: clientSchema,
})

export const createClientInputSchema = z.object({
  name: z.string().trim().min(1, VALIDATION_CLIENT_NAME_REQUIRED),
  organizeName: z.string().trim().min(1, VALIDATION_CLIENT_ORGANIZE_REQUIRED),
  contactPerson: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .regex(EGYPT_MOBILE_REGEX, VALIDATION_CLIENT_PHONE_INVALID),
  seller: z.string().trim().min(1),
  governorate: z.string().trim().optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
  creditLimit: z.number().min(0).optional(),
  commercialType: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})
export type CreateClientInput = z.infer<typeof createClientInputSchema>
