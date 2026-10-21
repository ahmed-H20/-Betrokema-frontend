import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { Seller } from '@/api/sellers.schema'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import {
  AccountCredentialsModal,
  type AccountCredentials,
} from '@/components/ui/AccountCredentialsModal'
import { ImageUpload } from '@/components/ui/ImageUpload'
import {
  GENERIC_ERROR,
  MODAL_CANCEL,
  REP_COMMISSION_RATE_LABEL,
  REP_GOVERNORATE_LABEL,
  REP_GOVERNORATE_OPTIONS,
  REP_GOVERNORATE_PLACEHOLDER,
  REP_MODAL_SUBMIT,
  REP_MODAL_SUBTITLE,
  REP_MODAL_TITLE_CREATE,
  REP_MODAL_TITLE_EDIT,
  REP_MONTHLY_TARGET_LABEL,
  REP_NAME_LABEL,
  REP_PERFORMANCE_SECTION,
  REP_PHONE_LABEL,
  REP_PHOTO_URL_LABEL,
  REP_REGION_LABEL,
  REP_SECTOR_LABEL,
  REP_TITLE_LABEL,
  TOAST_SELLER_SAVED,
} from '@/constants/strings'
import { useCreateSeller, useUpdateSeller } from '@/features/sellers/hooks'
import { buildSellerPayload } from '@/features/sellers/repForm'
import {
  repFormDefaults,
  repFormSchema,
  type RepFormValues,
} from '@/features/sellers/repForm.schema'

const inputClassName =
  'w-full h-11 px-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-highest transition-all'
const labelClassName = 'block font-label-md text-label-md text-on-surface mb-1'

function sellerToFormValues(seller: Seller): RepFormValues {
  return {
    name: seller.name,
    phone: seller.phone,
    photoUrl: seller.photoUrl,
    governorate: seller.governorate,
    region: seller.region,
    title: seller.title,
    sector: seller.sector,
    monthlyTarget: seller.monthlyTarget,
    commissionRate: seller.commissionRate,
  }
}

export function RepFormDialog({
  open,
  onOpenChange,
  seller,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  seller?: Seller
}) {
  const createSeller = useCreateSeller()
  const updateSeller = useUpdateSeller()
  const isEdit = Boolean(seller)
  const [createdCredentials, setCreatedCredentials] = useState<AccountCredentials | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RepFormValues>({
    resolver: zodResolver(repFormSchema),
    defaultValues: repFormDefaults,
  })

  useEffect(() => {
    if (!open) {
      setCreatedCredentials(null)
      return
    }
    reset(seller ? sellerToFormValues(seller) : repFormDefaults)
  }, [open, seller, reset])

  const governorateOptions = useMemo(() => {
    const options: string[] = [...REP_GOVERNORATE_OPTIONS]
    if (seller?.governorate && !options.includes(seller.governorate)) {
      options.push(seller.governorate)
    }
    return options
  }, [seller])

  async function onSubmit(values: RepFormValues) {
    try {
      const payload = buildSellerPayload(values)
      if (seller) {
        await updateSeller.mutateAsync({ id: seller._id, input: payload })
        toast.success(TOAST_SELLER_SAVED)
        onOpenChange(false)
      } else {
        const result = await createSeller.mutateAsync(payload)
        toast.success(TOAST_SELLER_SAVED)
        if (result.credentials) {
          setCreatedCredentials({
            name: values.name,
            code: result.credentials.code,
            password: result.credentials.password,
            roleTitle: values.title || 'مندوب مبيعات ميداني',
            roleBadge: 'PK - SELLER',
            phone: values.phone,
          })
        } else {
          onOpenChange(false)
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-2xl">
      <DialogHeader
        icon="person_add"
        iconClassName="bg-primary-fixed text-on-primary-fixed"
        onClose={() => onOpenChange(false)}
        subtitle={REP_MODAL_SUBTITLE}
        title={isEdit ? REP_MODAL_TITLE_EDIT : REP_MODAL_TITLE_CREATE}
      />
      <form className="flex flex-1 min-h-0 flex-col overflow-hidden" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-1 min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClassName}>
                {REP_NAME_LABEL} <span className="text-error">*</span>
              </label>
              <input className={inputClassName} type="text" {...register('name')} />
              {errors.name ? (
                <span className="font-label-sm mt-1 block text-label-sm text-error">
                  {errors.name.message}
                </span>
              ) : null}
            </div>
            <div>
              <label className={labelClassName}>
                {REP_PHONE_LABEL} <span className="text-error">*</span>
              </label>
              <div className="flex h-11 items-center overflow-hidden rounded-lg bg-surface-container-low">
                <input
                  className="h-full flex-1 bg-transparent px-3 font-body-sm text-body-sm text-on-surface focus:outline-none"
                  type="text"
                  {...register('phone')}
                />
                <span
                  className="font-label-md flex h-full items-center gap-1 bg-surface-container-high px-3 text-label-md font-semibold text-on-surface-variant"
                  dir="ltr"
                >
                  +20
                  <span className="material-symbols-outlined text-[16px]">flag</span>
                </span>
              </div>
              {errors.phone ? (
                <span className="font-label-sm mt-1 block text-label-sm text-error">
                  {errors.phone.message}
                </span>
              ) : null}
            </div>
            <div>
              <label className={labelClassName}>{REP_GOVERNORATE_LABEL}</label>
              <select className={inputClassName} {...register('governorate')}>
                <option value="">{REP_GOVERNORATE_PLACEHOLDER}</option>
                {governorateOptions.map((governorate) => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClassName}>{REP_REGION_LABEL}</label>
              <input className={inputClassName} type="text" {...register('region')} />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                error={errors.photoUrl?.message}
                helperText="PNG, JPG, WebP حتى 10 ميجابايت (رفع مباشر للصور)"
                label={REP_PHOTO_URL_LABEL}
                onChange={(url) =>
                  setValue('photoUrl', url, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                onClear={() =>
                  setValue('photoUrl', '', {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                type="sellers"
                value={watch('photoUrl')}
                variant="avatar"
              />
            </div>
            {!isEdit ? (
              <div className="md:col-span-2">
                <label className={labelClassName}>
                  كلمة المرور لتسجيل الدخول (اختياري)
                </label>
                <input
                  className={inputClassName}
                  placeholder="اتركه فارغاً للتوليد التلقائي (PIN مكون من 6 أرقام)"
                  type="text"
                  {...register('password')}
                />
                <span className="font-label-sm mt-1 block text-label-sm text-on-surface-variant">
                  💡 في حال تركته فارغاً، سيقوم النظام تلقائياً بتوليد رمز PIN سهل وسريع مكون من 6 أرقام، وسيتم عرضه فوراً على الشاشة لتتمكن من نسخه وإعطائه للمندوب.
                </span>
              </div>
            ) : null}
          </div>

          <div>
            <h4 className="font-headline-sm mb-3 flex items-center gap-2 text-headline-sm text-primary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {REP_PERFORMANCE_SECTION}
            </h4>
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-surface-container-low p-4 md:grid-cols-2">
              <div>
                <label className={labelClassName}>{REP_TITLE_LABEL}</label>
                <input
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none"
                  type="text"
                  {...register('title')}
                />
              </div>
              <div>
                <label className={labelClassName}>{REP_SECTOR_LABEL}</label>
                <input
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none"
                  type="text"
                  {...register('sector')}
                />
              </div>
              <div>
                <label className={labelClassName}>{REP_MONTHLY_TARGET_LABEL}</label>
                <input
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none"
                  type="number"
                  {...register('monthlyTarget', {
                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                  })}
                />
              </div>
              <div>
                <label className={labelClassName}>{REP_COMMISSION_RATE_LABEL}</label>
                <input
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none"
                  type="number"
                  {...register('commissionRate', {
                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                  })}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="shrink-0 flex items-center justify-end gap-3 bg-surface-container px-4 sm:px-6 py-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          <button
            className="font-label-md rounded-lg bg-surface-container-high px-4 py-2.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            {MODAL_CANCEL}
          </button>
          <button
            className="font-label-md flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-label-md text-on-primary shadow-md transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {REP_MODAL_SUBMIT}
          </button>
        </div>
      </form>
    </Dialog>

    <AccountCredentialsModal
      credentials={createdCredentials}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setCreatedCredentials(null)
          onOpenChange(false)
        }
      }}
      open={Boolean(createdCredentials)}
    />
  </>
  )
}
