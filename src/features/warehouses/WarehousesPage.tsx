import { useState } from 'react'
import { toast } from 'sonner'
import type { Warehouse } from '@/api/warehouses.schema'
import {
  CSV_REPORT_FILENAME_PREFIX,
  GENERIC_ERROR,
  WAREHOUSES_ADD_BUTTON,
  WAREHOUSES_EXPORT_BUTTON,
  WAREHOUSES_PAGE_TITLE,
} from '@/constants/strings'
import { buildCsv, downloadCsv } from '@/lib/csv'
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

  async function onExportCsv() {
    try {
      const rows = await exportReport.mutateAsync()
      const csv = buildCsv(
        [
          'اسم المستودع',
          'كود المستودع',
          'المحافظة',
          'أمين العهدة',
          'اسم المنتج',
          'كود الصنف',
          'التصنيف',
          'موقع التخزين',
          'وحدة التعبئة',
          'الرصيد الحالي',
          'حد إعادة الطلب',
          'حالة التوفر',
        ],
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
        <div className="flex items-center gap-space-sm">
          <span className="rounded-lg bg-primary-container p-2 text-on-primary">
            <span className="material-symbols-outlined text-[26px]">warehouse</span>
          </span>
          <h1 className="font-headline-xl text-headline-xl leading-tight text-primary">
            {WAREHOUSES_PAGE_TITLE}
          </h1>
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
            onClick={() => setEditingWarehouse(undefined)}
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
            onEdit={setEditingWarehouse}
            onSelect={setSelectedId}
            selectedId={selectedId}
            warehouses={warehouses}
          />
        </div>
        <div className="lg:col-span-4">
          <WarehouseFormPanel
            editingWarehouse={editingWarehouse}
            onDoneEditing={() => setEditingWarehouse(undefined)}
          />
        </div>
      </div>

      {selectedWarehouse ? (
        <InventorySection
          onOpenTransfer={openTransferFromInventory}
          warehouseId={selectedWarehouse._id}
          warehouseName={selectedWarehouse.name}
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
    </div>
  )
}
