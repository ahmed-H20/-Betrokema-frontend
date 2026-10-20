import { useQuery } from '@tanstack/react-query'
import { getExecutiveAnalytics } from '@/api/analytics'
import type { AnalyticsPeriod } from '@/api/analytics.schema'

export function useExecutiveAnalytics(period: AnalyticsPeriod = 'month') {
  return useQuery({
    queryKey: ['analytics', 'executive', period],
    queryFn: () => getExecutiveAnalytics(period),
    staleTime: 1000 * 60, // 1 minute fresh
  })
}
