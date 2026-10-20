import { z } from 'zod'

export const analyticsPeriodSchema = z.enum(['today', 'week', 'month', 'quarter', 'year'])
export type AnalyticsPeriod = z.infer<typeof analyticsPeriodSchema>

export const executiveOverviewSchema = z.object({
  totalRevenue: z.number().default(0),
  totalPaid: z.number().default(0),
  totalRemaining: z.number().default(0),
  collectionRate: z.number().default(0),
  totalOrders: z.number().default(0),
  overdueAmount: z.number().default(0),
  overdueCount: z.number().default(0),
})
export type ExecutiveOverview = z.infer<typeof executiveOverviewSchema>

export const monthlyTrendItemSchema = z.object({
  year: z.number(),
  month: z.number(),
  label: z.string(),
  revenue: z.number().default(0),
  collected: z.number().default(0),
  ordersCount: z.number().default(0),
})
export type MonthlyTrendItem = z.infer<typeof monthlyTrendItemSchema>

export const sectorPerformanceItemSchema = z.object({
  sector: z.string(),
  revenue: z.number().default(0),
  collected: z.number().default(0),
  ordersCount: z.number().default(0),
  share: z.number().default(0),
})
export type SectorPerformanceItem = z.infer<typeof sectorPerformanceItemSchema>

export const topProductItemSchema = z.object({
  _id: z.string(),
  name: z.string(),
  code: z.string().default(''),
  quantity: z.number().default(0),
  revenue: z.number().default(0),
  unit: z.string().default('بستلة'),
})
export type TopProductItem = z.infer<typeof topProductItemSchema>

export const paymentMethodItemSchema = z.object({
  method: z.string(),
  amount: z.number().default(0),
  count: z.number().default(0),
  share: z.number().default(0),
})
export type PaymentMethodItem = z.infer<typeof paymentMethodItemSchema>

export const topSellerItemSchema = z.object({
  _id: z.string(),
  name: z.string(),
  sector: z.string().default(''),
  sales: z.number().default(0),
  collected: z.number().default(0),
  target: z.number().default(500000),
  achievementRate: z.number().default(0),
  ordersCount: z.number().default(0),
})
export type TopSellerItem = z.infer<typeof topSellerItemSchema>

export const executiveAnalyticsSchema = z.object({
  period: z.string().default('month'),
  overview: executiveOverviewSchema,
  monthlyTrend: z.array(monthlyTrendItemSchema).default([]),
  sectors: z.array(sectorPerformanceItemSchema).default([]),
  topProducts: z.array(topProductItemSchema).default([]),
  paymentMethods: z.array(paymentMethodItemSchema).default([]),
  topSellers: z.array(topSellerItemSchema).default([]),
})
export type ExecutiveAnalytics = z.infer<typeof executiveAnalyticsSchema>

export const analyticsResponseSchema = z.object({
  status: z.literal('success'),
  data: executiveAnalyticsSchema,
})
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>
