import { request } from './client'
import {
  analyticsResponseSchema,
  type AnalyticsPeriod,
  type ExecutiveAnalytics,
} from './analytics.schema'

export async function getExecutiveAnalytics(
  period: AnalyticsPeriod = 'month',
): Promise<ExecutiveAnalytics> {
  const raw = await request<unknown>(`/invoices/analytics?period=${period}`)
  return analyticsResponseSchema.parse(raw).data
}
