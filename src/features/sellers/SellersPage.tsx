import { useState } from 'react'
import {
  SELLERS_ADD_BUTTON,
  SELLERS_PAGE_SUBTITLE,
  SELLERS_PAGE_TITLE,
} from '@/constants/strings'
import { KpiRow } from '@/features/sellers/components/KpiRow'
import { RepsDirectory } from '@/features/sellers/components/RepsDirectory'
import { RepDetailPanel } from '@/features/sellers/components/RepDetailPanel'
import { RepFormDialog } from '@/features/sellers/components/RepFormDialog'

export function SellersPage() {
  const [selectedSellerId, setSelectedSellerId] = useState<string | undefined>(
    undefined,
  )
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="font-headline-xl text-headline-xl tracking-tight text-primary">
            {SELLERS_PAGE_TITLE}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {SELLERS_PAGE_SUBTITLE}
          </p>
        </div>
        <button
          className="font-label-lg flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-label-lg text-on-primary shadow-md transition-all hover:bg-primary-container hover:shadow-lg"
          onClick={() => setCreateOpen(true)}
          type="button"
        >
          {SELLERS_ADD_BUTTON}
        </button>
      </div>

      <KpiRow />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <RepsDirectory
            onSelectSeller={setSelectedSellerId}
            selectedSellerId={selectedSellerId}
          />
        </div>
        <div className="lg:col-span-8">
          <RepDetailPanel
            onDeleted={() => setSelectedSellerId(undefined)}
            sellerId={selectedSellerId}
          />
        </div>
      </div>

      <RepFormDialog onOpenChange={setCreateOpen} open={createOpen} />
    </div>
  )
}
