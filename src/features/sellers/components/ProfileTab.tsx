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
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-mono font-semibold text-on-surface">{value}</span>
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
    <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
      <div className="flex flex-col justify-between gap-space-sm rounded-lg bg-surface-container-low p-space-md">
        <span className="font-headline-sm text-headline-sm text-primary">
          {PROFILE_COVERAGE_TITLE}
        </span>
        {hasCoverage ? (
          <div className="font-body-sm flex flex-col gap-2 text-body-sm">
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

      <div className="flex flex-col justify-between gap-space-sm rounded-lg bg-surface-container-low p-space-md">
        <div>
          <span className="font-headline-sm text-headline-sm text-primary">
            {PROFILE_COMMISSION_TITLE}
          </span>
          <div className="font-body-sm mt-3 flex flex-col gap-2 text-body-sm">
            <CoverageRow
              label={PROFILE_COMMISSION_RATE_LABEL}
              value={`${formatNumber(metrics.commissionRate)}%`}
            />
            <div className="flex items-center justify-between rounded-lg bg-surface-container-highest px-3 py-2">
              <span className="font-label-md text-label-md font-bold text-primary">
                {PROFILE_COMMISSION_AMOUNT_LABEL}
              </span>
              <span className="font-headline-sm font-mono text-headline-sm font-bold text-secondary">
                {formatNumber(metrics.commissionAmount)} ج.م
              </span>
            </div>
          </div>
          <p className="font-label-sm mt-2 text-label-sm text-on-surface-variant">
            {PROFILE_COMMISSION_BASIS_NOTE}
          </p>
        </div>
        <button
          className="font-label-sm h-9 rounded-lg bg-error-container px-space-md text-label-sm text-on-error-container transition-opacity hover:opacity-90"
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
