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
  SELLER_STATUS_LABELS,
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
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState<
    'ACTIVE' | 'SUSPENDED' | 'VACATION' | undefined
  >(undefined)

  const hasCoverage = Boolean(seller.region || seller.city || seller.address)

  const openWithStatus = (st: 'ACTIVE' | 'SUSPENDED' | 'VACATION') => {
    setTargetStatus(st)
    setStatusDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-space-md" dir="rtl">
      {/* 1. Status & Authorization Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
                seller.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : seller.status === 'VACATION'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {seller.status === 'ACTIVE'
                  ? 'check_circle'
                  : seller.status === 'VACATION'
                    ? 'flight_takeoff'
                    : 'block'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500">
                  حالة المندوب الحالية:
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                    seller.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : seller.status === 'VACATION'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {SELLER_STATUS_LABELS[seller.status] || seller.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {seller.status === 'ACTIVE'
                  ? 'المندوب على رأس العمل ونشط بالكامل لإصدار الفواتير وتسجيل العملاء.'
                  : seller.status === 'VACATION'
                    ? `المندوب في فترة إجازة رسمية / مرضية (العمليات متوقفة مؤقتاً)${
                        seller.statusNote ? ` — ${seller.statusNote}` : ''
                      }.`
                    : `المندوب موقوف عن العمل وتم تجميد حسابه وصلاحياته${
                        seller.statusNote ? ` — ${seller.statusNote}` : ''
                      }.`}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            {seller.status !== 'ACTIVE' && (
              <button
                type="button"
                onClick={() => openWithStatus('ACTIVE')}
                className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">
                  check_circle
                </span>
                <span>تفعيل المندوب (نشط)</span>
              </button>
            )}

            {seller.status !== 'VACATION' && (
              <button
                type="button"
                onClick={() => openWithStatus('VACATION')}
                className="h-8 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">
                  flight_takeoff
                </span>
                <span>وضع في إجازة</span>
              </button>
            )}

            {seller.status !== 'SUSPENDED' && (
              <button
                type="button"
                onClick={() => openWithStatus('SUSPENDED')}
                className="h-8 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">
                  block
                </span>
                <span>تعليق المندوب</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Coverage & Commission Grid */}
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <div className="flex flex-col justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-md border border-slate-200/80">
          <span className="font-headline-sm text-headline-sm text-primary font-bold">
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

        <div className="flex flex-col justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-md border border-slate-200/80">
          <div>
            <span className="font-headline-sm text-headline-sm text-primary font-bold">
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
        </div>
      </div>

      <SuspendDialog
        currentStatus={seller.status}
        currentStatusNote={seller.statusNote}
        initialStatus={targetStatus}
        onOpenChange={(open) => {
          setStatusDialogOpen(open)
          if (!open) setTargetStatus(undefined)
        }}
        open={statusDialogOpen}
        sellerId={seller._id}
        sellerName={seller.name}
      />
    </div>
  )
}
