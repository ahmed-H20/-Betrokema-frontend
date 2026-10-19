import type { DefaultValues } from 'react-hook-form'
import { z } from 'zod'
import { EGYPT_MOBILE_REGEX } from '@/lib/phone'
import {
  VALIDATION_CLIENT_NAME_REQUIRED,
  VALIDATION_CLIENT_ORGANIZE_REQUIRED,
  VALIDATION_CLIENT_PHONE_INVALID,
} from '@/constants/strings'

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, VALIDATION_CLIENT_NAME_REQUIRED),
  organizeName: z.string().trim().min(1, VALIDATION_CLIENT_ORGANIZE_REQUIRED),
  contactPerson: z.string().trim(),
  phone: z
    .string()
    .trim()
    .regex(EGYPT_MOBILE_REGEX, VALIDATION_CLIENT_PHONE_INVALID),
  governorate: z.string().trim(),
  city: z.string().trim(),
  address: z.string().trim(),
  creditLimit: z.number().min(0),
  commercialType: z.string().trim(),
  notes: z.string().trim(),
})
export type ClientFormValues = z.infer<typeof clientFormSchema>

export const clientFormDefaults: DefaultValues<ClientFormValues> = {
  name: '',
  organizeName: '',
  contactPerson: '',
  phone: '',
  governorate: 'القاهرة',
  city: 'القاهرة',
  address: '',
  creditLimit: 100000,
  commercialType: '',
  notes: '',
}
