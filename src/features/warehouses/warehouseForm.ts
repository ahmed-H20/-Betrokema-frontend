import type { CreateWarehouseInput } from '@/api/warehouses.schema'
import type { WarehouseFormValues } from '@/features/warehouses/warehouseForm.schema'

export function buildWarehousePayload(
  form: WarehouseFormValues,
): CreateWarehouseInput {
  return {
    name: form.name,
    governorate: form.governorate,
    address: form.address,
    supervisorName: form.supervisorName || undefined,
    emergencyPhone: form.emergencyPhone || undefined,
    capacityPallets: form.capacityPallets,
    occupiedPallets: form.occupiedPallets,
    operatingClassification: form.operatingClassification || undefined,
    isActive: form.isActive,
  }
}
