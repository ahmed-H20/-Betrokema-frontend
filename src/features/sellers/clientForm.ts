import type { CreateClientInput } from '@/api/clients.schema'
import type { ClientFormValues } from '@/features/sellers/clientForm.schema'

export function buildClientPayload(
  form: ClientFormValues,
  sellerId: string,
): CreateClientInput {
  return {
    name: form.name,
    organizeName: form.organizeName,
    contactPerson: form.contactPerson || undefined,
    phone: form.phone,
    seller: sellerId,
    governorate: form.governorate || undefined,
    city: form.city || undefined,
    address: form.address || undefined,
    creditLimit: form.creditLimit,
    commercialType: form.commercialType || undefined,
    notes: form.notes || undefined,
    password: form.password || undefined,
  }
}
