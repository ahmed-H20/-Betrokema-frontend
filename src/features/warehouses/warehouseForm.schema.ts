import type { DefaultValues } from 'react-hook-form'
import { z } from 'zod'
import {
  VALIDATION_WAREHOUSE_ADDRESS_REQUIRED,
  VALIDATION_WAREHOUSE_CAPACITY_MIN,
  VALIDATION_WAREHOUSE_GOVERNORATE_REQUIRED,
  VALIDATION_WAREHOUSE_NAME_REQUIRED,
} from '@/constants/strings'

export const warehouseFormSchema = z.object({
  name: z.string().trim().min(1, VALIDATION_WAREHOUSE_NAME_REQUIRED),
  governorate: z.string().trim().min(1, VALIDATION_WAREHOUSE_GOVERNORATE_REQUIRED),
  address: z.string().trim().min(1, VALIDATION_WAREHOUSE_ADDRESS_REQUIRED),
  supervisorName: z.string().trim(),
  emergencyPhone: z.string().trim(),
  capacityPallets: z.number().min(1, VALIDATION_WAREHOUSE_CAPACITY_MIN),
  occupiedPallets: z.number().min(0),
  operatingClassification: z.string().trim(),
  isActive: z.boolean(),
})
export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>

export const warehouseFormDefaults: DefaultValues<WarehouseFormValues> = {
  name: '',
  governorate: '',
  address: '',
  supervisorName: '',
  emergencyPhone: '',
  capacityPallets: 2000,
  occupiedPallets: 0,
  operatingClassification: 'مستودع رئيسي',
  isActive: true,
}
