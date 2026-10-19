import type { CreateSellerInput, UpdateSellerInput } from '@/api/sellers.schema'
import type { RepFormValues } from '@/features/sellers/repForm.schema'

export function buildSellerPayload(
  form: RepFormValues,
): CreateSellerInput & UpdateSellerInput {
  return {
    name: form.name,
    phone: form.phone,
    photoUrl: form.photoUrl || undefined,
    governorate: form.governorate || undefined,
    region: form.region || undefined,
    title: form.title || undefined,
    sector: form.sector || undefined,
    monthlyTarget: form.monthlyTarget,
    commissionRate: form.commissionRate,
  }
}
