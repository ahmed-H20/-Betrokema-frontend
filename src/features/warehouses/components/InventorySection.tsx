import { createColumnHelper, FlexRender, tableFeatures, useTable } from '@tanstack/react-table'
import { useState } from 'react'
import type { InventoryItem } from '@/api/warehouses.schema'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  INVENTORY_ASSIGN_BUTTON,
  INVENTORY_COL_ACTIONS,
  INVENTORY_COL_BIN,
  INVENTORY_COL_PACKAGING,
  INVENTORY_COL_PRODUCT,
  INVENTORY_COL_REORDER,
  INVENTORY_COL_SKU,
  INVENTORY_COL_STATUS,
  INVENTORY_COL_STOCK,
  INVENTORY_CRITICAL_SUFFIX,
  INVENTORY_EMPTY,
  INVENTORY_ERROR,
  INVENTORY_LOADING,
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
  onOpenTransfer,
}: {
  warehouseId: string
  warehouseName: string
  onOpenTransfer: (opts: { mode: 'source' | 'destination'; productId: string }) => void
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [assignFormOpen, setAssignFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined)
  const debouncedSearch = useDebouncedValue(search, 400)

  const inventoryQuery = useWarehouseInventory(warehouseId, {
    search: debouncedSearch || undefined,
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
    <div className="flex flex-col gap-space-lg rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex flex-col gap-space-md pb-space-md md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-space-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm">
            <span className="material-symbols-outlined text-[26px]">format_paint</span>
          </div>
          <div>
            <div className="flex items-center gap-space-sm">
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
        <div className="flex items-center gap-space-sm">
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              search
            </span>
            <input
              className="font-body-sm h-10 w-full rounded-lg bg-surface-container-low pl-space-md pr-9 text-body-sm text-on-surface transition-all focus:bg-surface-container focus:outline-none"
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder={INVENTORY_SEARCH_PLACEHOLDER}
              type="text"
              value={search}
            />
          </div>
          <button
            className="flex h-10 items-center gap-1.5 rounded-lg bg-primary-container px-space-md text-label-md font-label-md text-on-primary shadow-sm transition-all hover:bg-primary"
            onClick={() => setAssignFormOpen((open) => !open)}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {INVENTORY_ASSIGN_BUTTON}
          </button>
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
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
