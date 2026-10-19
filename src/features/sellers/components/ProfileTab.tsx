import { useState } from 'react'
import type { Seller, SellerPerformance } from '@/api/sellers.schema'
import {
  PROFILE_COMMISSION_AMOUNT_LABEL,
  PROFILE_COMMISSION_BASIS_NOTE,
  PROFILE_COMMISSION_RATE_LABEL,
  PROFILE_COMMISSION_TITLE,
  PROFILE_COVERAGE_ADDRESS_LABEL,
  PROFILE_COVERAGE_CITY_LABEL,
  PROFILE_COVERAGE_EMPTY,
  PROFILE_COVERAGE_REGION_LABEL,
  PROFILE_COVERAGE_TITLE,
  PROFILE_REACTIVATE_BUTTON,
  PROFILE_SUSPEND_BUTTON,
} from '@/constants/strings'
import { formatNumber } from '@/lib/format'
import { SuspendDialog } from '@/features/sellers/components/SuspendDialog'

function CoverageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <span className="font-label-md text-label-md text-on-surface">{value}</span>
    </div>
  )
}

export function ProfileTab({
  seller,
  metrics,
}: {
  seller: Seller
  metrics: SellerPerformance['metrics']
}) {
  const [suspendOpen, setSuspendOpen] = useState(false)
  const hasCoverage = Boolean(seller.region || seller.city || seller.address)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-5 shadow-sm">
        <h3 className="font-headline-sm text-headline-sm text-primary">
          {PROFILE_COVERAGE_TITLE}
        </h3>
        {hasCoverage ? (
          <div className="flex flex-col gap-2">
            {seller.region ? (
              <CoverageRow label={PROFILE_COVERAGE_REGION_LABEL} value={seller.region} />
            ) : null}
            {seller.city ? (
              <CoverageRow label={PROFILE_COVERAGE_CITY_LABEL} value={seller.city} />
            ) : null}
            {seller.address ? (
              <CoverageRow label={PROFILE_COVERAGE_ADDRESS_LABEL} value={seller.address} />
            ) : null}
          </div>
        ) : (
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {PROFILE_COVERAGE_EMPTY}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-5 shadow-sm">
        <h3 className="font-headline-sm text-headline-sm text-primary">
          {PROFILE_COMMISSION_TITLE}
        </h3>
        <CoverageRow
          label={PROFILE_COMMISSION_RATE_LABEL}
          value={`${formatNumber(metrics.commissionRate)}%`}
        />
        <CoverageRow
          label={PROFILE_COMMISSION_AMOUNT_LABEL}
          value={`${formatNumber(metrics.commissionAmount)} ج.م`}
        />
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          {PROFILE_COMMISSION_BASIS_NOTE}
        </p>
      </div>

      <div className="md:col-span-2">
        <button
          className="font-label-md rounded-lg bg-surface-container-high px-4 py-2.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
          onClick={() => setSuspendOpen(true)}
          type="button"
        >
          {seller.status === 'SUSPENDED' ? PROFILE_REACTIVATE_BUTTON : PROFILE_SUSPEND_BUTTON}
        </button>
      </div>

      <SuspendDialog
        mode={seller.status === 'SUSPENDED' ? 'reactivate' : 'suspend'}
        onOpenChange={setSuspendOpen}
        open={suspendOpen}
        sellerId={seller._id}
      />
    </div>
  )
}
