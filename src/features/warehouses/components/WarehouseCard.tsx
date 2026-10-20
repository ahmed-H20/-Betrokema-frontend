import type { Warehouse } from '@/api/warehouses.schema'
import {
  PRODUCT_PLURAL_FORMS,
  WAREHOUSE_ADDRESS_LABEL,
  WAREHOUSE_CAPACITY_UNIT,
  WAREHOUSE_CAPACITY_USED_LABEL,
  WAREHOUSE_CODE_LABEL,
  WAREHOUSE_DELETE_TOOLTIP,
  WAREHOUSE_DISTRIBUTE_BUTTON,
  WAREHOUSE_EDIT_TOOLTIP,
  WAREHOUSE_LINKED_PRODUCTS_LABEL,
  WAREHOUSE_STOCK_UNIT,
  WAREHOUSE_SUPERVISOR_LABEL,
  WAREHOUSE_TOTAL_STOCK_LABEL,
} from '@/constants/strings'
import { arabicCountPhrase, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

// Precedence confirmed against the real export: a non-default `status`
// (anything but "نشط") always wins with the tertiary-fixed + status-text
// pill; only when status is default does `isActive` decide
// secondary-fixed (active) vs neutral (inactive) — see ui-tokens.md.
function governoratePill(warehouse: Warehouse) {
  if (warehouse.status !== 'نشط') {
    return {
      className: 'bg-tertiary-fixed text-on-tertiary-fixed',
      label: `${warehouse.governorate} (${warehouse.status})`,
    }
  }
  if (!warehouse.isActive) {
    return {
      className: 'bg-surface-container-high text-on-surface',
      label: warehouse.governorate,
    }
  }
  return {
    className: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    label: warehouse.governorate,
  }
}

export function WarehouseCard({
  warehouse,
  selected,
  onSelect,
  onEdit,
  onDeleteRequest,
}: {
  warehouse: Warehouse
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDeleteRequest: () => void
}) {
  function onDistribute() {
    onSelect()
    // Matches the export's own selectWarehouse() behavior (scroll to the
    // inventory table) — see .bridge-plan.md Chunk 3 build order step 5.
    document
      .getElementById('warehouse-inventory-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const pill = governoratePill(warehouse)
  const dotClassName = warehouse.status === 'نشط' ? 'bg-secondary' : 'bg-on-tertiary-container'
  const occupancyRate = warehouse.occupancyRate
  const barClassName = occupancyRate >= 90 ? 'bg-tertiary-fixed-dim' : 'bg-secondary'

  const phone = warehouse.emergencyPhone || warehouse.supervisorPhone

  return (
    <div
      className={cn(
        'flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm transition-all',
        selected && 'shadow-md ring-2 ring-secondary',
      )}
    >
      <div>
        <div className="mb-space-sm flex items-start justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span
                className={cn(
                  'h-2.5 w-2.5 shrink-0 rounded-full',
                  dotClassName,
                  selected && warehouse.status === 'نشط' && 'animate-pulse',
                )}
              />
              <h3 className="font-headline-sm truncate text-headline-sm font-bold text-primary">
                {warehouse.name}
              </h3>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
              <span>
                {WAREHOUSE_CODE_LABEL} <bdi dir="ltr">{warehouse.code}</bdi>
              </span>
              {warehouse.operatingClassification ? (
                <>
                  <span>•</span>
                  <span className="font-label-sm rounded bg-surface-container px-1.5 py-0.5 text-label-sm font-medium text-secondary">
                    {warehouse.operatingClassification}
                  </span>
                </>
              ) : null}
            </div>
          </div>
          <span
            className={cn(
              'font-label-sm shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-label-sm font-bold',
              pill.className,
            )}
          >
            {pill.label}
          </span>
        </div>

        <div className="my-space-sm flex flex-col gap-2 rounded-lg bg-surface-container-low p-space-md">
          <div className="flex items-center justify-between text-body-sm">
            <span className="font-label-md flex items-center gap-1 text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {WAREHOUSE_ADDRESS_LABEL}
            </span>
            <span
              className="font-body-sm max-w-[200px] truncate text-body-sm font-medium text-on-surface"
              title={warehouse.address}
            >
              {warehouse.address}
            </span>
          </div>

          {warehouse.supervisorName ? (
            <div className="flex items-center justify-between text-body-sm">
              <span className="font-label-md flex items-center gap-1 text-label-md text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">badge</span>
                {WAREHOUSE_SUPERVISOR_LABEL}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-body-sm text-body-sm font-semibold text-primary">
                  {warehouse.supervisorName}
                </span>
                {phone ? (
                  <a
                    className="flex h-6 items-center gap-1 rounded bg-secondary/10 px-1.5 font-mono text-[11px] font-semibold text-secondary transition-colors hover:bg-secondary hover:text-on-secondary"
                    dir="ltr"
                    href={`tel:${phone}`}
                    title="اتصال بالطوارئ"
                  >
                    <span className="material-symbols-outlined text-[13px]">call</span>
                    {phone}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between text-body-sm">
            <span className="font-label-md flex items-center gap-1 text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">pallet</span>
              {WAREHOUSE_CAPACITY_USED_LABEL}
            </span>
            <span className="font-label-md text-label-md font-bold text-secondary">
              <bdi dir="ltr">
                {formatNumber(warehouse.occupiedPallets)} / {formatNumber(warehouse.capacityPallets)}
              </bdi>{' '}
              {WAREHOUSE_CAPACITY_UNIT} (<bdi dir="ltr">{occupancyRate}%</bdi>)
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className={cn('h-full rounded-full', barClassName)}
              style={{ width: `${Math.min(100, Math.max(0, occupancyRate))}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1 text-center">
          <div className="rounded-lg bg-surface-container p-2">
            <span className="font-label-sm block text-label-sm text-on-surface-variant">
              {WAREHOUSE_TOTAL_STOCK_LABEL}
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-primary">
              {formatNumber(warehouse.actualStockUnits)} {WAREHOUSE_STOCK_UNIT}
            </span>
          </div>
          <div className="rounded-lg bg-surface-container p-2">
            <span className="font-label-sm block text-label-sm text-on-surface-variant">
              {WAREHOUSE_LINKED_PRODUCTS_LABEL}
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-primary">
              {arabicCountPhrase(warehouse.linkedProductsCount, PRODUCT_PLURAL_FORMS)}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-lg bg-surface-container p-2">
            <span className="font-label-sm block text-label-sm text-on-surface-variant">
              {WAREHOUSE_SUPERVISOR_LABEL}
            </span>
            <span className="font-label-md truncate text-label-md font-semibold text-primary block">
              {warehouse.supervisorName || '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-space-sm flex items-center justify-between gap-space-sm pt-space-md">
        <button
          className={cn(
            'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-space-md text-label-md font-label-md transition-all active:scale-[0.99] md:h-9',
            selected
              ? 'bg-primary-container text-on-primary hover:bg-primary shadow-sm'
              : 'bg-surface-container text-primary hover:bg-primary-container hover:text-on-primary',
          )}
          onClick={onDistribute}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">inventory</span>
          {WAREHOUSE_DISTRIBUTE_BUTTON}
        </button>

        {phone ? (
          <a
            aria-label="اتصال بالطوارئ بأمين المستودع"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-secondary transition-colors hover:bg-secondary hover:text-on-secondary md:h-9 md:w-9"
            href={`tel:${phone}`}
            title="اتصال سريع"
          >
            <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
          </a>
        ) : null}

        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high md:h-9 md:w-9"
          onClick={onEdit}
          title={WAREHOUSE_EDIT_TOOLTIP}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-error-container text-on-error-container transition-colors hover:bg-error hover:text-on-error md:h-9 md:w-9"
          onClick={onDeleteRequest}
          title={WAREHOUSE_DELETE_TOOLTIP}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  )
}
