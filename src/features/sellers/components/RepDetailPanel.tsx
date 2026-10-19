import * as Tabs from '@radix-ui/react-tabs'
import { useState } from 'react'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  REP_DETAIL_EMPTY,
  SELLER_KPI_ERROR,
  SELLER_KPI_LOADING,
  TAB_CLIENTS,
  TAB_INVOICES,
  TAB_PERFORMANCE,
} from '@/constants/strings'
import { cn } from '@/lib/cn'
import { useSellerPerformance } from '@/features/sellers/hooks'
import { RepSpotlight } from '@/features/sellers/components/RepSpotlight'
import { ClientsTab } from '@/features/sellers/components/ClientsTab'
import { InvoicesTab } from '@/features/sellers/components/InvoicesTab'
import { ProfileTab } from '@/features/sellers/components/ProfileTab'
import { RepFormDialog } from '@/features/sellers/components/RepFormDialog'
import { DeleteRepDialog } from '@/features/sellers/components/DeleteRepDialog'

export function RepDetailPanel({
  sellerId,
  onDeleted,
}: {
  sellerId: string | undefined
  onDeleted: () => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const performanceQuery = useSellerPerformance(sellerId)

  if (!sellerId) {
    return <StateMessage minHeightClassName="min-h-[400px]" text={REP_DETAIL_EMPTY} />
  }

  if (performanceQuery.isLoading) {
    return <StateMessage minHeightClassName="min-h-[400px]" text={SELLER_KPI_LOADING} />
  }

  if (performanceQuery.isError || !performanceQuery.data) {
    return (
      <StateMessage minHeightClassName="min-h-[400px]" text={SELLER_KPI_ERROR} tone="error" />
    )
  }

  const { seller, metrics } = performanceQuery.data

  return (
    <div className="flex flex-col gap-4">
      <RepSpotlight
        metrics={metrics}
        onDelete={() => setDeleteOpen(true)}
        onEdit={() => setEditOpen(true)}
        seller={seller}
      />

      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
        <Tabs.Root defaultValue="clients">
          <Tabs.List className="mb-space-md flex items-center gap-space-md rounded-lg bg-surface-container-low p-1.5">
            {[
              { value: 'clients', icon: 'storefront', label: TAB_CLIENTS(metrics.clientsCount) },
              { value: 'invoices', icon: 'receipt_long', label: TAB_INVOICES(metrics.totalInvoicesCount) },
              { value: 'performance', icon: 'badge', label: TAB_PERFORMANCE },
            ].map((tab) => (
              <Tabs.Trigger
                className={cn(
                  'font-label-md flex flex-1 items-center justify-center gap-space-xs rounded-md px-space-md py-2 text-label-md transition-all data-[state=active]:bg-primary-container data-[state=active]:font-bold data-[state=active]:text-on-primary data-[state=active]:shadow-xs data-[state=inactive]:font-medium data-[state=inactive]:text-on-surface-variant data-[state=inactive]:hover:text-on-surface',
                )}
                key={tab.value}
                value={tab.value}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {tab.icon}
                </span>
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value="clients">
            <ClientsTab sellerId={seller._id} sellerName={seller.name} />
          </Tabs.Content>
          <Tabs.Content value="invoices">
            <InvoicesTab sellerId={seller._id} />
          </Tabs.Content>
          <Tabs.Content value="performance">
            <ProfileTab metrics={metrics} seller={seller} />
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <RepFormDialog onOpenChange={setEditOpen} open={editOpen} seller={seller} />
      <DeleteRepDialog
        metrics={metrics}
        onDeleted={onDeleted}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        seller={seller}
      />
    </div>
  )
}
