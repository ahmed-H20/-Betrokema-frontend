import { z } from 'zod'

export const orderStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'cancelled',
])
export type OrderStatus = z.infer<typeof orderStatusSchema>

export const orderPaymentStatusSchema = z.enum([
  'unpaid',
  'paid',
  'partially_paid',
  'overdue',
])
export type OrderPaymentStatus = z.infer<typeof orderPaymentStatusSchema>

// getOrdersForSeller populates `client` and `products.productId` fully, but
// the Invoices tab only ever reads the client's display name — no other
// field, and no product line items (see context/build-plan.md build order
// step 9: invoiceCode/client/date/totalPrice/status only). Unused keys on
// the real response are stripped by zod, not declared here.
const invoiceClientRefSchema = z.object({
  _id: z.string(),
  organizeName: z.string().optional().default(''),
  name: z.string().optional().default(''),
})

export const invoiceSchema = z.object({
  _id: z.string(),
  invoiceCode: z.string(),
  client: z.union([z.string(), invoiceClientRefSchema]).nullable(),
  orderStatus: orderStatusSchema,
  paymentStatus: orderPaymentStatusSchema,
  totalPrice: z.number(),
  totalPaid: z.number().optional().default(0),
  dueDate: z.string().nullable().optional().default(null),
  createdAt: z.string(),
})
export type Invoice = z.infer<typeof invoiceSchema>

export const invoicesForSellerResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number().optional(),
  data: z.array(invoiceSchema),
})
