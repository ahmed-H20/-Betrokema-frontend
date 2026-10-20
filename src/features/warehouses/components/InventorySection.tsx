import { createColumnHelper, FlexRender, tableFeatures, useTable } from '@tanstack/react-table'
import { useState } from 'react'
import type { InventoryItem, Warehouse } from '@/api/warehouses.schema'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  INVENTORY_ADJUST_STOCK,
  INVENTORY_ASSIGN_BUTTON,
  INVENTORY_BELOW_REORDER_NOTE,
  INVENTORY_COL_ACTIONS,
  INVENTORY_COL_BIN,
  INVENTORY_COL_PACKAGING,
  INVENTORY_COL_PRODUCT,
  INVENTORY_COL_REORDER,
  INVENTORY_COL_SKU,
  INVENTORY_COL_STATUS,
  INVENTORY_COL_STOCK,
  INVENTORY_CRITICAL_BADGE,
  INVENTORY_CRITICAL_SUFFIX,
  INVENTORY_EMPTY,
  INVENTORY_ERROR,
  INVENTORY_FILTER_ALL,
  INVENTORY_FILTER_AVAILABLE,
  INVENTORY_FILTER_CRITICAL,
  INVENTORY_LOADING,
  INVENTORY_REQUEST_TRANSFER,
  INVENTORY_SEARCH_PLACEHOLDER,
  INVENTORY_SECTION_SUBTITLE,
  INVENTORY_SECTION_TITLE,
  INVENTORY_TRANSFER_TOOLTIP,
  INVENTORY_UPDATE_TOOLTIP,
  INVENTORY_URGENT_TRANSFER_TOOLTIP,
} from '@/constants/strings'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { AssignProductForm } from '@/features/warehouses/components/AssignProductForm'
import { EditInventoryItemDialog } from '@/features/warehouses/components/EditInventoryItemDialog'
import { InventoryPagination } from '@/features/warehouses/components/InventoryPagination'
import { useWarehouseInventory } from '@/features/warehouses/hooks'

function firstWord(unit: string): string {
  return unit.trim().split(/\s+/)[0] ?? ''
}

// Exact export classes (petrokema_web_admin_5), not the shared StatusPill —
// this table's pill has its own dot + bg-surface-container-high/error-container
// shape that doesn't match StatusPill's rounded chip family. Tone keyed off the
// server-authoritative `isCritical` flag, never the label text itself.
function AvailabilityPill({ label, critical }: { label: string; critical: boolean }) {
  return (
    <span
      className={cn(
        'font-label-sm flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-label-sm font-bold',
        critical
          ? 'bg-error-container text-on-error-container'
          : 'bg-surface-container-high text-secondary',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', critical ? 'bg-error' : 'bg-secondary')} />
      {label}
    </span>
  )
}

// Below md: one card per inventory item, following petrokema_mobile's own
// allocation-card shape (thumbnail tile with a bin-location overlay badge,
// name+status-pill header, SKU/reorder sub-row, stock+unit and action
// buttons on a shared baseline row).
function InventoryItemCard({
  item,
  onEditStock,
  onTransfer,
}: {
  item: InventoryItem
  onEditStock: (item: InventoryItem) => void
  onTransfer: (item: InventoryItem) => void
}) {
  const unitNoun = firstWord(item.packagingUnit)
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all',
        item.isCritical && 'border-r-4 border-r-error',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[26px]">package_2</span>
          </div>
          <span
            className={cn(
              'font-label-sm absolute inset-x-0 bottom-0 whitespace-nowrap py-0.5 text-center text-[9px]',
              item.isCritical
                ? 'bg-error text-on-error font-bold'
                : 'bg-primary/70 text-on-primary',
            )}
            dir="ltr"
          >
            {item.binLocation || '—'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <h4
              className={cn(
                'font-headline-sm truncate text-headline-sm font-semibold',
                item.isCritical ? 'text-error' : 'text-primary',
              )}
            >
              {item.productName}
            </h4>
            {item.isCritical ? (
              <span className="font-label-sm shrink-0 rounded-full bg-error-container px-2 py-0.5 text-label-sm font-bold text-on-error-container animate-pulse">
                {INVENTORY_CRITICAL_BADGE}
              </span>
            ) : (
              <AvailabilityPill critical={false} label={item.stockStatus} />
            )}
          </div>
          <div className="font-body-sm mt-0.5 flex flex-wrap items-center gap-1.5 text-body-sm text-on-surface-variant">
            {item.sku ? (
              <>
                <bdi className="whitespace-nowrap font-mono" dir="ltr">
                  كود: {item.sku}
                </bdi>
                <span>•</span>
              </>
            ) : null}
            {item.isCritical ? (
              <span className="text-error font-medium">
                {INVENTORY_BELOW_REORDER_NOTE(item.reorderLevel, unitNoun)}
              </span>
            ) : (
              <span className="truncate">
                {INVENTORY_COL_REORDER}: {formatNumber(item.reorderLevel)} {unitNoun}
              </span>
            )}
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <bdi
              className={cn(
                'font-label-lg whitespace-nowrap text-label-lg font-bold',
                item.isCritical ? 'text-error' : 'text-primary',
              )}
              dir="ltr"
            >
              {formatNumber(item.currentStock)}{' '}
              <span className="font-label-sm font-normal text-on-surface-variant">
                {item.packagingUnit}
              </span>
            </bdi>
            <div className="flex items-center gap-1.5">
              <button
                className={cn(
                  'flex h-8 items-center gap-1 rounded-lg px-2.5 text-label-sm font-label-sm font-medium transition-colors',
                  item.isCritical
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim'
                    : 'bg-surface-container text-primary hover:bg-surface-container-high',
                )}
                onClick={() => onTransfer(item)}
                title={item.isCritical ? INVENTORY_URGENT_TRANSFER_TOOLTIP : INVENTORY_TRANSFER_TOOLTIP}
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {item.isCritical ? 'sync_alt' : 'move_up'}
                </span>
                <span>{INVENTORY_REQUEST_TRANSFER}</span>
              </button>
              <button
                className="flex h-8 items-center gap-1 rounded-lg bg-surface-container px-2.5 text-label-sm font-label-sm text-primary transition-colors hover:bg-surface-container-high"
                onClick={() => onEditStock(item)}
                title={INVENTORY_UPDATE_TOOLTIP}
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">edit_note</span>
                <span className="hidden xs:inline">{INVENTORY_ADJUST_STOCK}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, InventoryItem>()

function buildColumns(
  onEditStock: (item: InventoryItem) => void,
  onTransfer: (item: InventoryItem) => void,
) {
  return columnHelper.columns([
    columnHelper.display({
      id: 'product',
      header: INVENTORY_COL_PRODUCT,
      cell: (info) => (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-headline-sm text-headline-sm font-semibold',
              info.row.original.isCritical ? 'text-error' : 'text-primary',
            )}
          >
            {info.row.original.productName}
          </span>
          {info.row.original.productDescription ? (
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {info.row.original.productDescription}
            </span>
          ) : null}
        </div>
      ),
    }),
    columnHelper.accessor('sku', {
      header: INVENTORY_COL_SKU,
      cell: (info) => (
        <span className="font-mono font-label-md text-label-md text-on-surface-variant" dir="ltr">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('packagingUnit', {
      header: INVENTORY_COL_PACKAGING,
      cell: (info) => (
        <span className="font-body-sm text-body-sm text-on-surface">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('binLocation', {
      header: INVENTORY_COL_BIN,
      cell: (info) => (
        <span
          className="font-mono rounded bg-surface-container px-2 py-1 text-label-md font-bold text-primary"
          dir="ltr"
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'stock',
      header: INVENTORY_COL_STOCK,
      cell: (info) => {
        const item = info.row.original
        const unitNoun = firstWord(item.packagingUnit)
        return (
          <span>
            <span
              className={cn(
                'font-headline-sm text-headline-sm font-bold',
                item.isCritical ? 'text-error' : 'text-primary',
              )}
            >
              {formatNumber(item.currentStock)}
            </span>
            <span
              className={cn(
                'font-label-sm mr-1 text-label-sm',
                item.isCritical ? 'text-error' : 'text-on-surface-variant',
              )}
            >
              {unitNoun}
              {item.isCritical ? ` ${INVENTORY_CRITICAL_SUFFIX}` : ''}
            </span>
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'reorder',
      header: INVENTORY_COL_REORDER,
      cell: (info) => (
        <span className="font-body-md text-body-md text-on-surface-variant">
          {formatNumber(info.row.original.reorderLevel)} {firstWord(info.row.original.packagingUnit)}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'status',
      header: INVENTORY_COL_STATUS,
      cell: (info) => (
        <AvailabilityPill
          critical={info.row.original.isCritical}
          label={info.row.original.stockStatus}
        />
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: INVENTORY_COL_ACTIONS,
      cell: (info) => {
        const item = info.row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <button
              className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
              onClick={() => onEditStock(item)}
              title={INVENTORY_UPDATE_TOOLTIP}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
            </button>
            {item.isCritical ? (
              <button
                className="rounded bg-error-container p-1.5 text-on-error-container transition-colors hover:bg-error hover:text-on-error"
                onClick={() => onTransfer(item)}
                title={INVENTORY_URGENT_TRANSFER_TOOLTIP}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  swap_horizontal_circle
                </span>
              </button>
            ) : (
              <button
                className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-secondary"
                onClick={() => onTransfer(item)}
                title={INVENTORY_TRANSFER_TOOLTIP}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">move_up</span>
              </button>
            )}
          </div>
        )
      },
    }),
  ])
}

export function InventorySection({
  warehouseId,
  warehouseName,
  warehouses = [],
  onSelectWarehouse,
  onOpenTransfer,
}: {
  warehouseId: string
  warehouseName: string
  warehouses?: Warehouse[]
  onSelectWarehouse?: (id: string) => void
  onOpenTransfer: (opts: { mode: 'source' | 'destination'; productId: string }) => void
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'available'>('all')
  const [page, setPage] = useState(1)
  const [assignFormOpen, setAssignFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined)
  const debouncedSearch = useDebouncedValue(search, 400)

  const inventoryQuery = useWarehouseInventory(warehouseId, {
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: 10,
  })

  const columns = buildColumns(
    (item) => setEditingItem(item),
    (item) => onOpenTransfer({ mode: item.isCritical ? 'destination' : 'source', productId: item.productId }),
  )

  const data = inventoryQuery.data?.data ?? []
  const table = useTable({ features, columns, data })

  return (
    <div
      className="flex flex-col gap-space-md sm:gap-space-lg rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm"
      id="warehouse-inventory-section"
    >
      <div className="flex flex-col gap-space-sm pb-space-sm">
        <div className="flex items-center gap-space-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm">
            <span className="material-symbols-outlined text-[26px]">format_paint</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-space-sm">
              <h3 className="font-headline-lg text-headline-lg font-bold text-primary">
                {INVENTORY_SECTION_TITLE}
              </h3>
              <span className="font-label-sm rounded-full bg-secondary px-2.5 py-0.5 text-label-sm font-bold text-on-secondary">
                {warehouseName}
              </span>
            </div>
            <p className="font-body-sm mt-0.5 text-body-sm text-on-surface-variant">
              {INVENTORY_SECTION_SUBTITLE}
            </p>
          </div>
        </div>

        {/* Quick Switcher Pills for Depots (Horizontal Scrollable Mobile) */}
        {warehouses.length > 1 ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar">
            {warehouses.map((wh) => (
              <button
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-label-md font-label-md transition-all active:scale-95',
                  wh._id === warehouseId
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high',
                )}
                key={wh._id}
                onClick={() => onSelectWarehouse?.(wh._id)}
                type="button"
              >
                {wh.name} ({wh.linkedProductsCount} صنف)
              </button>
            ))}
          </div>
        ) : null}

        {/* Filter Chips & Search Bar */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            <button
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-label-sm font-label-sm font-semibold transition-all',
                statusFilter === 'all'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
              )}
              onClick={() => {
                setStatusFilter('all')
                setPage(1)
              }}
              type="button"
            >
              {INVENTORY_FILTER_ALL}
            </button>
            <button
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-label-sm font-label-sm font-semibold transition-all',
                statusFilter === 'critical'
                  ? 'bg-error-container text-on-error-container shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
              )}
              onClick={() => {
                setStatusFilter('critical')
                setPage(1)
              }}
              type="button"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-error" />
              {INVENTORY_FILTER_CRITICAL}
            </button>
            <button
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-label-sm font-label-sm font-semibold transition-all',
                statusFilter === 'available'
                  ? 'bg-secondary-fixed text-on-secondary-fixed shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
              )}
              onClick={() => {
                setStatusFilter('available')
                setPage(1)
              }}
              type="button"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              {INVENTORY_FILTER_AVAILABLE}
            </button>
          </div>

          <div className="flex items-center gap-space-sm">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                search
              </span>
              <input
                className="font-body-sm h-10 w-full rounded-lg bg-surface-container-low pl-8 pr-9 text-body-sm text-on-surface transition-all focus:bg-surface-container focus:outline-none"
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder={INVENTORY_SEARCH_PLACEHOLDER}
                type="text"
                value={search}
              />
              {search ? (
                <button
                  aria-label="مسح البحث"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-outline hover:text-on-surface"
                  onClick={() => {
                    setSearch('')
                    setPage(1)
                  }}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              ) : null}
            </div>
            <button
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary-container px-space-md text-label-md font-label-md text-on-primary shadow-sm transition-all hover:bg-primary"
              onClick={() => setAssignFormOpen((open) => !open)}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">{INVENTORY_ASSIGN_BUTTON}</span>
              <span className="sm:hidden">تخصيص صنف</span>
            </button>
          </div>
        </div>
      </div>

      {assignFormOpen ? (
        <AssignProductForm
          onClose={() => setAssignFormOpen(false)}
          warehouseId={warehouseId}
          warehouseName={warehouseName}
        />
      ) : null}

      {inventoryQuery.isLoading ? (
        <StateMessage minHeightClassName="min-h-[200px]" text={INVENTORY_LOADING} />
      ) : inventoryQuery.isError ? (
        <StateMessage minHeightClassName="min-h-[200px]" text={INVENTORY_ERROR} tone="error" />
      ) : data.length === 0 ? (
        <StateMessage minHeightClassName="min-h-[200px]" text={INVENTORY_EMPTY} />
      ) : (
        <>
          <div className="flex flex-col gap-space-sm md:hidden">
            {data.map((item) => (
              <InventoryItemCard
                item={item}
                key={item._id}
                onEditStock={(target) => setEditingItem(target)}
                onTransfer={(target) =>
                  onOpenTransfer({
                    mode: target.isCritical ? 'destination' : 'source',
                    productId: target.productId,
                  })
                }
              />
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] border-collapse text-right">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr className="bg-surface-container-low" key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <th
                      className={cn(
                        'font-label-md px-space-md py-space-sm text-label-md text-on-surface-variant',
                        index === 0 && 'rounded-r-lg',
                        index === headerGroup.headers.length - 1 && 'rounded-l-lg text-center',
                      )}
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : <FlexRender header={header} />}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  className="transition-colors hover:bg-surface-container-low"
                  key={row.id}
                >
                  {row.getAllCells().map((cell) => (
                    <td className="p-space-md" key={cell.id}>
                      <FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      {inventoryQuery.data ? (
        <InventoryPagination
          onPageChange={setPage}
          page={inventoryQuery.data.pagination.page}
          pages={inventoryQuery.data.pagination.pages}
          shownCount={data.length}
          totalCount={inventoryQuery.data.totalItemsInWarehouse}
        />
      ) : null}

      {editingItem ? (
        <EditInventoryItemDialog
          item={editingItem}
          onOpenChange={(open) => {
            if (!open) setEditingItem(undefined)
          }}
          open={Boolean(editingItem)}
          warehouseId={warehouseId}
        />
      ) : null}
    </div>
  )
}
