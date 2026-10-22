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

export const paymentMethodSchema = z.enum([
  'cash',
  'instapay',
  'wallet',
  'bank_transfer',
  'card',
  'cheque',
])
export type PaymentMethod = z.infer<typeof paymentMethodSchema>

export const paymentTypeSchema = z.enum([
  'deposit',
  'advance',
  'installment',
  'final_payment',
  'final_settlement',
])
export type PaymentType = z.infer<typeof paymentTypeSchema>

export const invoicePaymentSchema = z
  .object({
    _id: z.string().optional(),
    amount: z.number(),
    paymentMethod: z.string().optional().default('cash'),
    paymentType: z.string().optional().default('advance'),
    paymentDate: z.any().optional().default(() => new Date().toISOString()),
    referenceNumber: z.string().optional().default(''),
    chequeDueDate: z.any().optional().default(null),
    notes: z.string().optional().default(''),
    receiverName: z.string().optional().default('الخزينة المركزية'),
    receivedBy: z.any().optional(),
  })
  .passthrough()
export type InvoicePayment = z.infer<typeof invoicePaymentSchema>

export const invoiceProductItemSchema = z
  .object({
    productId: z
      .union([
        z.string(),
        z
          .object({
            _id: z.string().optional(),
            name: z.string().optional().default(''),
            code: z.string().optional().default(''),
          })
          .passthrough(),
      ])
      .nullable()
      .optional(),
    price: z.number().default(0),
    quantity: z.number().default(1),
    unit: z.string().optional().default('وحدة'),
    totalPrice: z.number().default(0),
  })
  .passthrough()
export type InvoiceProductItem = z.infer<typeof invoiceProductItemSchema>

export const invoiceClientSchema = z
  .object({
    _id: z.string(),
    name: z.string().optional().default(''),
    organizeName: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    city: z.string().optional().default(''),
    clientCode: z.string().optional().default(''),
    tier: z.string().optional().default('عميل عام'),
    address: z.string().optional().default(''),
  })
  .passthrough()
export type InvoiceClient = z.infer<typeof invoiceClientSchema>

export const invoiceSellerSchema = z
  .object({
    _id: z.string(),
    name: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    sector: z.string().optional().default(''),
    city: z.string().optional().default(''),
  })
  .passthrough()
export type InvoiceSeller = z.infer<typeof invoiceSellerSchema>

export const invoiceSchema = z
  .object({
    _id: z.string(),
    invoiceCode: z.string(),
    client: z.any().optional(),
    seller: z.any().optional(),
    warehouse: z.string().optional().default('كافة المستودعات (المركزية)'),
    orderStatus: orderStatusSchema,
    paymentStatus: orderPaymentStatusSchema,
    products: z.array(invoiceProductItemSchema).optional().default([]),
    totalPrice: z.number().default(0),
    totalPaid: z.number().optional().default(0),
    taxAmount: z.number().optional().default(0),
    dueDate: z.any().optional().default(null),
    payments: z.array(invoicePaymentSchema).optional().default([]),
    notes: z.string().optional().default(''),
    invoiceImageUrl: z.string().optional().default(''),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  })
  .passthrough()
export type Invoice = z.infer<typeof invoiceSchema>

export const invoicesListResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number().optional(),
  totalCount: z.number().optional(),
  pagination: z
    .object({
      currentPage: z.number().optional(),
      totalPages: z.number().optional(),
      limit: z.number().optional(),
      nextPage: z.number().optional().nullable(),
      prevPage: z.number().optional().nullable(),
    })
    .optional(),
  data: z.array(invoiceSchema),
})
export type InvoicesListResponse = z.infer<typeof invoicesListResponseSchema>

export const invoicesStatsSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    monthlyInvoices: z.object({
      totalAmount: z.number(),
      activeInvoicesCount: z.number(),
      growthRate: z.number(),
    }),
    dailyCollections: z.object({
      target: z.number(),
      collected: z.number(),
      percentage: z.number(),
      settlementsCount: z.number(),
    }),
    overdueDebts: z.object({
      totalAmount: z.number(),
      overdueAccountsCount: z.number(),
    }),
    tabsCounts: z.object({
      all: z.number(),
      pending: z.number(),
      completed: z.number(),
      cancelled: z.number(),
    }),
  }),
})
export type InvoicesStats = z.infer<typeof invoicesStatsSchema>['data']

export const invoicesForSellerResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number().optional(),
  data: z.array(invoiceSchema),
})

export const addPaymentInputSchema = z.object({
  amount: z.number().min(1, 'المبلغ يجب أن يكون أكبر من صفر'),
  paymentMethod: paymentMethodSchema,
  paymentType: paymentTypeSchema,
  referenceNumber: z.string().optional(),
  chequeDueDate: z.string().nullable().optional(),
  notes: z.string().optional(),
  receivedBy: z.string().optional(),
  receiverName: z.string().optional(),
  paymentDate: z.string().optional(),
})
export type AddPaymentInput = z.infer<typeof addPaymentInputSchema>
