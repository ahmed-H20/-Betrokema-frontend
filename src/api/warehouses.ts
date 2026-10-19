import { z } from 'zod'
import { request } from '@/api/client'

// Minimal seam for the products form's warehouse <select> — only `name` is
// used there. The full Warehouse resource (stats, inventory, transfers) is
// built out in Chunk 3 per context/build-plan.md; don't extend this file
// ahead of that chunk.
const warehouseNameSchema = z.object({ name: z.string() })
const warehouseNamesResponseSchema = z.object({
  status: z.literal('success'),
  data: z.array(warehouseNameSchema),
})

export async function getAllNames(): Promise<string[]> {
  const raw = await request<unknown>('/warehouses')
  const { data } = warehouseNamesResponseSchema.parse(raw)
  return data.map((warehouse) => warehouse.name)
}
