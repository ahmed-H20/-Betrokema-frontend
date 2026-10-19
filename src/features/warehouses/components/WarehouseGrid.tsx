import type { Warehouse } from '@/api/warehouses.schema'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  WAREHOUSE_CENTER_PLURAL_FORMS,
  WAREHOUSES_EMPTY,
  WAREHOUSES_ERROR,
  WAREHOUSES_FILTER_ACTIVE,
  WAREHOUSES_FILTER_ALL,
  WAREHOUSES_LOADING,
  WAREHOUSES_SECTION_TITLE,
} from '@/constants/strings'
import { cn } from '@/lib/cn'
import { arabicCountPhrase } from '@/lib/format'
import { WarehouseCard } from '@/features/warehouses/components/WarehouseCard'

export function WarehouseGrid({
  warehouses,
  counts,
  isLoading,
  isError,
  activeOnly,
  onActiveOnlyChange,
  selectedId,
  onSelect,
  onEdit,
  onDeleteRequest,
}: {
  warehouses: Warehouse[]
  counts: { all: number; active: number }
  isLoading: boolean
  isError: boolean
  activeOnly: boolean
  onActiveOnlyChange: (activeOnly: boolean) => void
  selectedId: string | undefined
  onSelect: (id: string) => void
  onEdit: (warehouse: Warehouse) => void
  onDeleteRequest: (warehouse: Warehouse) => void
}) {
  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-col justify-between gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[22px] text-primary">dns</span>
          <h2 className="font-headline-md text-headline-md text-primary">
            {WAREHOUSES_SECTION_TITLE}
          </h2>
          <span className="font-label-sm rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm font-bold text-on-surface-variant">
            {arabicCountPhrase(warehouses.length, WAREHOUSE_CENTER_PLURAL_FORMS)}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-surface-container-low p-1">
          <button
            className={cn(
              'font-label-md rounded px-space-md py-1 text-label-md',
              !activeOnly
                ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
            onClick={() => onActiveOnlyChange(false)}
            type="button"
          >
            {WAREHOUSES_FILTER_ALL(counts.all)}
          </button>
          <button
            className={cn(
              'font-label-md rounded px-space-md py-1 text-label-md',
              activeOnly
                ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
            onClick={() => onActiveOnlyChange(true)}
            type="button"
          >
            {WAREHOUSES_FILTER_ACTIVE(counts.active)}
          </button>
        </div>
      </div>

      {isLoading ? (
        <StateMessage minHeightClassName="min-h-[300px]" text={WAREHOUSES_LOADING} />
      ) : isError ? (
        <StateMessage minHeightClassName="min-h-[300px]" text={WAREHOUSES_ERROR} tone="error" />
      ) : warehouses.length === 0 ? (
        <StateMessage minHeightClassName="min-h-[300px]" text={WAREHOUSES_EMPTY} />
      ) : (
        <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
          {warehouses.map((warehouse) => (
            <WarehouseCard
              key={warehouse._id}
              onDeleteRequest={() => onDeleteRequest(warehouse)}
              onEdit={() => onEdit(warehouse)}
              onSelect={() => onSelect(warehouse._id)}
              selected={warehouse._id === selectedId}
              warehouse={warehouse}
            />
          ))}
        </div>
      )}
    </div>
  )
}
