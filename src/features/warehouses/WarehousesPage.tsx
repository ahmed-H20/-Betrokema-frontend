import { useState } from 'react'
import { toast } from 'sonner'
import type { Warehouse } from '@/api/warehouses.schema'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import {
  CSV_REPORT_FILENAME_PREFIX,
  CSV_REPORT_HEADERS,
  GENERIC_ERROR,
  WAREHOUSE_FORM_SUBTITLE,
  WAREHOUSE_FORM_TITLE_CREATE,
  WAREHOUSE_FORM_TITLE_EDIT,
  WAREHOUSE_LIVE_SYNC,
  WAREHOUSES_ADD_BUTTON,
  WAREHOUSES_EXPORT_BUTTON,
  WAREHOUSES_PAGE_SUBTITLE,
  WAREHOUSES_PAGE_TITLE,
} from '@/constants/strings'
import { buildCsv, downloadCsv } from '@/lib/csv'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { DeleteWarehouseDialog } from '@/features/warehouses/components/DeleteWarehouseDialog'
import { InventorySection } from '@/features/warehouses/components/InventorySection'
import { KpiRow } from '@/features/warehouses/components/KpiRow'
import { TransferModal, type TransferPreset } from '@/features/warehouses/components/TransferModal'
import { TransfersDialog } from '@/features/warehouses/components/TransfersDialog'
import { WarehouseFormPanel } from '@/features/warehouses/components/WarehouseFormPanel'
import { WarehouseGrid } from '@/features/warehouses/components/WarehouseGrid'
import { useExportReport, useWarehouses } from '@/features/warehouses/hooks'

export function WarehousesPage() {
  const [activeOnly, setActiveOnly] = useState(false)
  const [selectedIdRaw, setSelectedId] = useState<string | undefined>(undefined)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | undefined>(undefined)
  const [formSheetOpen, setFormSheetOpen] = useState(false)
  // `lg` (1024px) is also where the grid switches from the sheet to the
  // always-visible inline panel — matches that breakpoint exactly so the
  // two never disagree about which one should be in play.
  const isBelowLg = useMediaQuery('(max-width: 1023px)')
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | undefined>(undefined)
  const [transfersDialogOpen, setTransfersDialogOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [transferPreset, setTransferPreset] = useState<TransferPreset | undefined>(undefined)

  const warehousesQuery = useWarehouses({ filter: activeOnly ? 'active' : undefined })
  const exportReport = useExportReport()

  const warehouses = warehousesQuery.data?.data ?? []
  const counts = warehousesQuery.data?.counts ?? { all: 0, active: 0 }

  const selectedId = warehouses.some((warehouse) => warehouse._id === selectedIdRaw)
    ? selectedIdRaw
    : warehouses[0]?._id
  const selectedWarehouse = warehouses.find((warehouse) => warehouse._id === selectedId)

  function openTransferFromInventory(opts: { mode: 'source' | 'destination'; productId: string }) {
    if (!selectedId) return
    setTransferPreset({ warehouseId: selectedId, role: opts.mode, productId: opts.productId })
    setTransferModalOpen(true)
  }

  // Below `lg` the add/edit form opens as a sheet; at `lg`+ it's the
  // always-visible inline panel, so opening it there is a no-op (the panel
  // already shows whatever `editingWarehouse` is set to).
  function handleAddClick() {
    setEditingWarehouse(undefined)
    if (isBelowLg) setFormSheetOpen(true)
  }

  function handleEditRequest(warehouse: Warehouse) {
    setEditingWarehouse(warehouse)
    if (isBelowLg) setFormSheetOpen(true)
  }

  function handleDoneEditing() {
    setEditingWarehouse(undefined)
    setFormSheetOpen(false)
  }

  async function onExportCsv() {
    try {
      const rows = await exportReport.mutateAsync()
      const csv = buildCsv(
        [...CSV_REPORT_HEADERS],
        rows.map((row) => [
          row.warehouseName,
          row.warehouseCode,
          row.governorate,
          row.supervisorName,
          row.productName,
          row.sku,
          row.category,
          row.binLocation,
          row.packagingUnit,
          row.currentStock,
          row.reorderLevel,
          row.stockStatus,
        ]),
      )
      downloadCsv(`${CSV_REPORT_FILENAME_PREFIX}-${new Date().toISOString().slice(0, 10)}.csv`, csv)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col justify-between gap-space-md xl:flex-row xl:items-center">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start sm:gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <span className="rounded-lg bg-primary-container p-2 text-on-primary">
                <span className="material-symbols-outlined text-[26px]">warehouse</span>
              </span>
              <h1 className="font-headline-xl text-headline-xl leading-tight text-primary">
                {WAREHOUSES_PAGE_TITLE}
              </h1>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-2.5 py-1 text-label-md font-label-md text-on-secondary-fixed">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              {WAREHOUSE_LIVE_SYNC}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {WAREHOUSES_PAGE_SUBTITLE}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            className="flex h-11 items-center gap-space-sm rounded-lg bg-surface-container-lowest px-space-md text-label-lg font-label-lg text-on-surface shadow-sm transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
            disabled={exportReport.isPending}
            onClick={() => void onExportCsv()}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">
              file_download
            </span>
            {WAREHOUSES_EXPORT_BUTTON}
          </button>
          <button
            className="flex h-11 items-center gap-space-sm rounded-lg bg-primary-container px-space-lg text-label-lg font-label-lg font-bold text-on-primary shadow-md transition-all hover:bg-primary"
            onClick={handleAddClick}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            {WAREHOUSES_ADD_BUTTON}
          </button>
        </div>
      </div>

      <KpiRow onOpenTransfers={() => setTransfersDialogOpen(true)} />

      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
        <div className="lg:col-span-8">
          <WarehouseGrid
            activeOnly={activeOnly}
            counts={counts}
            isError={warehousesQuery.isError}
            isLoading={warehousesQuery.isLoading}
            onActiveOnlyChange={setActiveOnly}
            onDeleteRequest={setDeleteTarget}
            onEdit={handleEditRequest}
            onSelect={setSelectedId}
            selectedId={selectedId}
            warehouses={warehouses}
          />
        </div>
        {/* Below lg this column collapses to nothing — the same form moves
            into the Dialog sheet below, opened explicitly via the add/edit
            handlers, instead of always being visible. */}
        <div className="hidden lg:col-span-4 lg:block">
          <WarehouseFormPanel editingWarehouse={editingWarehouse} onDoneEditing={handleDoneEditing} />
        </div>
      </div>

      <Dialog onOpenChange={setFormSheetOpen} open={isBelowLg && formSheetOpen} widthClassName="max-w-lg">
        <DialogHeader
          icon="domain_add"
          onClose={() => setFormSheetOpen(false)}
          subtitle={WAREHOUSE_FORM_SUBTITLE}
          title={
            editingWarehouse
              ? WAREHOUSE_FORM_TITLE_EDIT(editingWarehouse.name)
              : WAREHOUSE_FORM_TITLE_CREATE
          }
        />
        <div className="flex-1 overflow-y-auto p-6">
          <WarehouseFormPanel bare editingWarehouse={editingWarehouse} onDoneEditing={handleDoneEditing} />
        </div>
      </Dialog>

      {selectedWarehouse ? (
        <InventorySection
          onOpenTransfer={openTransferFromInventory}
          onSelectWarehouse={setSelectedId}
          warehouseId={selectedWarehouse._id}
          warehouseName={selectedWarehouse.name}
          warehouses={warehouses}
        />
      ) : null}

      <TransferModal
        onOpenChange={setTransferModalOpen}
        open={transferModalOpen}
        preset={transferPreset}
        warehouses={warehouses}
      />
      <TransfersDialog onOpenChange={setTransfersDialogOpen} open={transfersDialogOpen} />
      {deleteTarget ? (
        <DeleteWarehouseDialog
          onDeleted={() => setDeleteTarget(undefined)}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(undefined)
          }}
          open={Boolean(deleteTarget)}
          warehouse={deleteTarget}
        />
      ) : null}

      {/* Mobile Floating Action Buttons */}
      <div className="fixed bottom-20 left-4 z-40 flex flex-col gap-2 md:hidden">
        <button
          aria-label="طلب مناقلة سريعة"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest text-secondary shadow-lg ring-1 ring-outline-variant/30 transition-transform active:scale-95"
          onClick={() => {
            setTransferPreset(undefined)
            setTransferModalOpen(true)
          }}
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">swap_horiz</span>
        </button>
        <button
          aria-label={WAREHOUSES_ADD_BUTTON}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-xl transition-transform active:scale-95"
          onClick={handleAddClick}
          type="button"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>
    </div>
  )
}
