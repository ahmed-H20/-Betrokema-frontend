import React, { createContext, useContext, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import {
  useClientsForSeller,
  useInvoicesForSeller,
  useSellerPerformance,
  useSellers,
} from '@/features/sellers/hooks'
import type { Client } from '@/api/clients.schema'
import type { Invoice } from '@/api/invoices.schema'
import type { EnrichedSeller, SellerPerformance } from '@/api/sellers.schema'

interface SellerContextType {
  activeSellerId: string | undefined
  setActiveSellerId: (id: string) => void
  currentSeller: EnrichedSeller | null
  performance: SellerPerformance | undefined
  clients: Client[]
  totalDebt: number
  overCreditCount: number
  invoices: Invoice[]
  allSellers: EnrichedSeller[]
  isSellerRole: boolean
  isLoading: boolean
  refetchAll: () => void
}

const SellerContext = createContext<SellerContextType | undefined>(undefined)

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const isSellerRole = user?.role === 'seller'

  // Fetch all sellers so admins/managers can switch or select reps
  const { data: sellersData, isLoading: isLoadingSellers } = useSellers({})
  const allSellers: EnrichedSeller[] = sellersData || []

  // Determine active seller ID
  const defaultSellerId = useMemo(() => {
    if (isSellerRole) {
      return (
        user?.sellerProfile?._id ||
        (user?.sellerProfile as any)?.id ||
        user?.id
      )
    }
    // If admin or manager, select first seller if available
    return allSellers[0]?._id
  }, [isSellerRole, user, allSellers])

  const [selectedSellerId, setSelectedSellerId] = useState<string | undefined>(
    undefined,
  )

  const activeSellerId = selectedSellerId || defaultSellerId

  const currentSeller = useMemo(() => {
    return allSellers.find((s) => s._id === activeSellerId) || null
  }, [allSellers, activeSellerId])

  // Queries for the active seller
  const {
    data: performanceData,
    isLoading: isLoadingPerformance,
    refetch: refetchPerf,
  } = useSellerPerformance(activeSellerId)

  const {
    data: clientsData,
    isLoading: isLoadingClients,
    refetch: refetchClients,
  } = useClientsForSeller(activeSellerId)

  const {
    data: invoicesData,
    isLoading: isLoadingInvoices,
    refetch: refetchInvoices,
  } = useInvoicesForSeller(activeSellerId)

  const clients = clientsData?.data || []
  const totalDebt = clientsData?.summary?.totalDebt || 0
  const overCreditCount = clientsData?.summary?.overCreditCount || 0
  const invoices = invoicesData || []

  const isLoading =
    isLoadingSellers ||
    isLoadingPerformance ||
    isLoadingClients ||
    isLoadingInvoices

  const refetchAll = () => {
    void refetchPerf()
    void refetchClients()
    void refetchInvoices()
  }

  const value = useMemo<SellerContextType>(
    () => ({
      activeSellerId,
      setActiveSellerId: setSelectedSellerId,
      currentSeller,
      performance: performanceData,
      clients,
      totalDebt,
      overCreditCount,
      invoices,
      allSellers,
      isSellerRole,
      isLoading,
      refetchAll,
    }),
    [
      activeSellerId,
      currentSeller,
      performanceData,
      clients,
      totalDebt,
      overCreditCount,
      invoices,
      allSellers,
      isSellerRole,
      isLoading,
    ],
  )

  return (
    <SellerContext.Provider value={value}>{children}</SellerContext.Provider>
  )
}

export function useSellerContext() {
  const ctx = useContext(SellerContext)
  if (!ctx) {
    throw new Error('useSellerContext must be used within a SellerProvider')
  }
  return ctx
}
