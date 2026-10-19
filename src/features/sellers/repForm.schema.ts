import type { DefaultValues } from 'react-hook-form'
import { z } from 'zod'
import { EGYPT_MOBILE_REGEX } from '@/lib/phone'
import {
  REP_GOVERNORATE_OPTIONS,
  SELLER_PHOTO_URL_ERROR,
  VALIDATION_SELLER_NAME_REQUIRED,
  VALIDATION_SELLER_PHONE_INVALID,
} from '@/constants/strings'

const urlOrEmptySchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^https?:\/\//.test(value), {
    message: SELLER_PHOTO_URL_ERROR,
  })

export const repFormSchema = z.object({
  name: z.string().trim().min(1, VALIDATION_SELLER_NAME_REQUIRED),
  phone: z
    .string()
    .trim()
    .regex(EGYPT_MOBILE_REGEX, VALIDATION_SELLER_PHONE_INVALID),
  photoUrl: urlOrEmptySchema,
  governorate: z.string().trim(),
  region: z.string().trim(),
  title: z.string().trim(),
  sector: z.string().trim(),
  monthlyTarget: z.number().min(0).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
})
export type RepFormValues = z.infer<typeof repFormSchema>

export const repFormDefaults: DefaultValues<RepFormValues> = {
  name: '',
  phone: '',
  photoUrl: '',
  governorate: REP_GOVERNORATE_OPTIONS[0],
  region: '',
  title: '',
  sector: '',
  monthlyTarget: undefined,
  commissionRate: undefined,
}
