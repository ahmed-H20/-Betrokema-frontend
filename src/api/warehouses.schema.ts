import { z } from 'zod'
import {
  VALIDATION_ASSIGN_PRODUCT_REQUIRED,
  VALIDATION_ASSIGN_REORDER_NEGATIVE,
  VALIDATION_ASSIGN_STOCK_NEGATIVE,
  VALIDATION_WAREHOUSE_ADDRESS_REQUIRED,
  VALIDATION_WAREHOUSE_CAPACITY_MIN,
  VALIDATION_WAREHOUSE_GOVERNORATE_REQUIRED,
  VALIDATION_WAREHOUSE_NAME_REQUIRED,
} from '@/constants/strings'

export const warehouseStatusSchema = z.enum([
  'نشط',
  'جرد دوري',
  'معلق',
  'صيانة',
])
export type WarehouseStatus = z.infer<typeof warehouseStatusSchema>

export const transferStatusSchema = z.enum([
  'pending',
  'approved',
  'completed',
  'cancelled',
  'rejected',
])
export type TransferStatus = z.infer<typeof transferStatusSchema>

export const warehouseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  code: z.string().optional().default(''),
  governorate: z.string(),
  address: z.string(),
  supervisorName: z.string().optional().default(''),
  supervisorPhone: z.string().optional().default(''),
  emergencyPhone: z.string().optional().default(''),
  capacityPallets: z.number(),
  occupiedPallets: z.number().optional().default(0),
  operatingClassification: z.string().optional().default('مستودع رئيسي'),
  isActive: z.boolean().optional().default(true),
  status: warehouseStatusSchema.optional().default('نشط'),
  notes: z.string().optional().default(''),
  // Virtuals — present on list/detail responses, not on raw create/update echoes.
  occupancyRate: z.number().optional().default(0),
  linkedProductsCount: z.number().optional().default(0),
  actualStockUnits: z.number().optional().default(0),
})
export type Warehouse = z.infer<typeof warehouseSchema>

export const warehouseListResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number().optional(),
  counts: z.object({ all: z.number(), active: z.number() }),
  data: z.array(warehouseSchema),
})
export type WarehouseListResponse = z.infer<typeof warehouseListResponseSchema>

export const warehouseEnvelopeSchema = z.object({
  status: z.literal('success'),
  message: z.string().optional(),
  data: warehouseSchema,
})

export const warehouseStatsResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    warehouses: z.object({
      total: z.number(),
      active: z.number(),
      branches: z.array(z.string()),
      displaySummary: z.string(),
    }),
    stockAndChemicals: z.object({
      totalUnits: z.number(),
      activeProductsCount: z.number(),
      unitLabel: z.string(),
      totalPalletsOccupied: z.number(),
      totalCapacityPallets: z.number(),
      occupancyRate: z.number(),
      subtitle: z.string(),
    }),
    transfersAndCritical: z.object({
      pendingTransfers: z.number(),
      criticalStockItemsCount: z.number(),
      pendingTransfersText: z.string(),
      actionRequired: z.string(),
    }),
  }),
})
export type WarehouseStats = z.infer<typeof warehouseStatsResponseSchema>['data']

export type WarehouseListFilters = {
  filter?: 'active'
  governorate?: string
  search?: string
}

export const createWarehouseInputSchema = z.object({
  name: z.string().trim().min(1, VALIDATION_WAREHOUSE_NAME_REQUIRED),
  governorate: z.string().trim().min(1, VALIDATION_WAREHOUSE_GOVERNORATE_REQUIRED),
  address: z.string().trim().min(1, VALIDATION_WAREHOUSE_ADDRESS_REQUIRED),
  supervisorName: z.string().trim().optional(),
  emergencyPhone: z.string().trim().optional(),
  capacityPallets: z.number().min(1, VALIDATION_WAREHOUSE_CAPACITY_MIN),
  occupiedPallets: z.number().min(0).optional(),
  operatingClassification: z.string().trim().optional(),
  isActive: z.boolean().optional(),
})
export type CreateWarehouseInput = z.infer<typeof createWarehouseInputSchema>

export const updateWarehouseInputSchema = createWarehouseInputSchema.partial()
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseInputSchema>

// ---- Inventory ----

export const inventoryItemSchema = z.object({
  _id: z.string(),
  productId: z.string(),
  productName: z.string(),
  productDescription: z.string().optional().default(''),
  categoryName: z.string().optional().default(''),
  sku: z.string().optional().default(''),
  packagingUnit: z.string().optional().default(''),
  binLocation: z.string().optional().default(''),
  currentStock: z.number(),
  reorderLevel: z.number(),
  stockStatus: z.string(),
  isCritical: z.boolean(),
  lastAuditedAt: z.string().optional(),
  notes: z.string().optional().default(''),
})
export type InventoryItem = z.infer<typeof inventoryItemSchema>

export const inventoryResponseSchema = z.object({
  status: z.literal('success'),
  warehouseId: z.string(),
  warehouseName: z.string(),
  totalItemsInWarehouse: z.number(),
  filteredCount: z.number(),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    pages: z.number(),
  }),
  data: z.array(inventoryItemSchema),
})
export type InventoryResponse = z.infer<typeof inventoryResponseSchema>

export type InventoryFilters = {
  search?: string
  status?: 'critical' | 'available'
  page?: number
  limit?: number
}

// Raw subdocument shape returned by GET /:id (populated.product.*) and by
// PUT /:id/inventory/:itemId — distinct from the enriched/flattened shape
// above that GET /:id/inventory returns.
export const warehouseInventorySubdocSchema = z.object({
  _id: z.string(),
  product: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      name: z.string(),
      code: z.string().optional().default(''),
      description: z.string().optional().default(''),
      category: z
        .union([z.object({ name: z.string() }), z.string()])
        .nullable()
        .optional(),
    }),
  ]),
  productName: z.string().optional().default(''),
  sku: z.string().optional().default(''),
  packagingUnit: z.string().optional().default(''),
  binLocation: z.string().optional().default(''),
  currentStock: z.number(),
  reorderLevel: z.number(),
  stockStatus: z.string(),
  notes: z.string().optional().default(''),
})
export type WarehouseInventorySubdoc = z.infer<
  typeof warehouseInventorySubdocSchema
>

export const warehouseDetailSchema = warehouseSchema.extend({
  inventory: z.array(warehouseInventorySubdocSchema).optional().default([]),
})
export type WarehouseDetail = z.infer<typeof warehouseDetailSchema>

export const warehouseDetailEnvelopeSchema = z.object({
  status: z.literal('success'),
  data: warehouseDetailSchema,
})

export const assignProductInputSchema = z.object({
  productId: z.string().min(1, VALIDATION_ASSIGN_PRODUCT_REQUIRED),
  sku: z.string().trim().optional(),
  packagingUnit: z.string().trim().optional(),
  binLocation: z.string().trim().optional(),
  currentStock: z.number().min(0, VALIDATION_ASSIGN_STOCK_NEGATIVE).optional(),
  reorderLevel: z.number().min(0, VALIDATION_ASSIGN_REORDER_NEGATIVE).optional(),
  notes: z.string().trim().optional(),
})
export type AssignProductInput = z.infer<typeof assignProductInputSchema>

export const updateInventoryItemInputSchema = z.object({
  binLocation: z.string().trim().optional(),
  currentStock: z.number().min(0, VALIDATION_ASSIGN_STOCK_NEGATIVE).optional(),
  reorderLevel: z.number().min(0, VALIDATION_ASSIGN_REORDER_NEGATIVE).optional(),
  packagingUnit: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  sku: z.string().trim().optional(),
})
export type UpdateInventoryItemInput = z.infer<
  typeof updateInventoryItemInputSchema
>

// ---- Stock transfers ----

const transferWarehouseRefSchema = z.union([
  z.string(),
  z.object({
    _id: z.string(),
    name: z.string(),
    code: z.string().optional().default(''),
    governorate: z.string().optional().default(''),
  }),
])

const transferItemRefSchema = z.object({
  product: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      name: z.string(),
      code: z.string().optional().default(''),
    }),
  ]),
  productName: z.string().optional().default(''),
  quantity: z.number(),
  unit: z.string().optional().default('بستلة'),
})

export const stockTransferSchema = z.object({
  _id: z.string(),
  transferCode: z.string().optional().default(''),
  fromWarehouse: transferWarehouseRefSchema,
  toWarehouse: transferWarehouseRefSchema,
  items: z.array(transferItemRefSchema),
  status: transferStatusSchema,
  requestedBy: z.string().optional().default(''),
  approvedBy: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  requestedAt: z.string().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string().optional(),
})
export type StockTransfer = z.infer<typeof stockTransferSchema>

export const transfersResponseSchema = z.object({
  status: z.literal('success'),
  results: z.number().optional(),
  data: z.array(stockTransferSchema),
})

export const transferEnvelopeSchema = z.object({
  status: z.literal('success'),
  message: z.string().optional(),
  data: stockTransferSchema,
})

export const createTransferInputSchema = z.object({
  fromWarehouse: z.string().min(1),
  toWarehouse: z.string().min(1),
  items: z
    .array(
      z.object({
        product: z.string().min(1),
        productName: z.string().optional(),
        quantity: z.number().int().min(1),
        unit: z.string().optional(),
      }),
    )
    .min(1),
  requestedBy: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})
export type CreateTransferInput = z.infer<typeof createTransferInputSchema>

export const updateTransferStatusInputSchema = z.object({
  status: transferStatusSchema,
  approvedBy: z.string().trim().optional(),
})
export type UpdateTransferStatusInput = z.infer<
  typeof updateTransferStatusInputSchema
>

// ---- Export report ----

export const exportReportRowSchema = z.object({
  warehouseName: z.string(),
  warehouseCode: z.string().optional().default(''),
  governorate: z.string().optional().default(''),
  supervisorName: z.string().optional().default(''),
  productName: z.string().optional().default(''),
  sku: z.string().optional().default(''),
  category: z.string().optional().default(''),
  binLocation: z.string().optional().default(''),
  packagingUnit: z.string().optional().default(''),
  currentStock: z.number(),
  reorderLevel: z.number(),
  stockStatus: z.string(),
  isCritical: z.boolean(),
})
export type ExportReportRow = z.infer<typeof exportReportRowSchema>

export const exportReportResponseSchema = z.object({
  status: z.literal('success'),
  generatedAt: z.string(),
  totalRecords: z.number(),
  data: z.array(exportReportRowSchema),
})
