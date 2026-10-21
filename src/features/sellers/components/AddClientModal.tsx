import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import {
  AccountCredentialsModal,
  type AccountCredentials,
} from '@/components/ui/AccountCredentialsModal'
import {
  ADD_CLIENT_SUBMIT,
  ADD_CLIENT_SUBTITLE,
  ADD_CLIENT_TITLE,
  CLIENT_ADDRESS_LABEL,
  CLIENT_COMMERCIAL_TYPE_LABEL,
  CLIENT_CONTACT_LABEL,
  CLIENT_CREDIT_LIMIT_LABEL,
  CLIENT_CITY_LABEL,
  CLIENT_GOVERNORATE_LABEL,
  CLIENT_NAME_LABEL,
  CLIENT_NOTES_LABEL,
  CLIENT_ORGANIZE_LABEL,
  CLIENT_PHONE_LABEL,
  GENERIC_ERROR,
  MODAL_CANCEL,
  TOAST_CLIENT_CREATED,
} from '@/constants/strings'
import { useCreateClient } from '@/features/sellers/hooks'
import { buildClientPayload } from '@/features/sellers/clientForm'
import {
  clientFormDefaults,
  clientFormSchema,
  type ClientFormValues,
} from '@/features/sellers/clientForm.schema'

const inputClassName =
  'w-full h-11 px-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-highest transition-all'
const textareaClassName =
  'w-full p-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-highest transition-all'
const labelClassName = 'block font-label-md text-label-md text-on-surface mb-1'

export function AddClientModal({
  open,
  onOpenChange,
  sellerId,
  sellerName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sellerId: string
  sellerName?: string
}) {
  const createClient = useCreateClient()
  const [createdCredentials, setCreatedCredentials] = useState<AccountCredentials | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: clientFormDefaults,
  })

  useEffect(() => {
    if (!open) {
      setCreatedCredentials(null)
      return
    }
    reset(clientFormDefaults)
  }, [open, reset])

  async function onSubmit(values: ClientFormValues) {
    try {
      const result = await createClient.mutateAsync(buildClientPayload(values, sellerId))
      toast.success(TOAST_CLIENT_CREATED)
      if (result.credentials) {
        setCreatedCredentials({
          name: values.name || values.organizeName,
          code: result.credentials.code,
          password: result.credentials.password,
          roleTitle: 'عميل معتمد',
          roleBadge: 'CLI - CLIENT',
          phone: values.phone,
        })
      } else {
        onOpenChange(false)
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
        onClose={() => onOpenChange(false)}
        subtitle={sellerName ? ADD_CLIENT_SUBTITLE(sellerName) : undefined}
        title={ADD_CLIENT_TITLE}
      />
      <form className="flex flex-1 min-h-0 flex-col overflow-hidden" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 overflow-y-auto overscroll-contain flex-1 min-h-0 p-4 sm:p-6 md:grid-cols-2">
          <div>
            <label className={labelClassName}>
              {CLIENT_NAME_LABEL} <span className="text-error">*</span>
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
              {CLIENT_ORGANIZE_LABEL} <span className="text-error">*</span>
            </label>
            <input className={inputClassName} type="text" {...register('organizeName')} />
            {errors.organizeName ? (
              <span className="font-label-sm mt-1 block text-label-sm text-error">
                {errors.organizeName.message}
              </span>
            ) : null}
          </div>
          <div>
            <label className={labelClassName}>{CLIENT_CONTACT_LABEL}</label>
            <input className={inputClassName} type="text" {...register('contactPerson')} />
          </div>
          <div>
            <label className={labelClassName}>
              {CLIENT_PHONE_LABEL} <span className="text-error">*</span>
            </label>
            <input className={inputClassName} type="text" {...register('phone')} />
            {errors.phone ? (
              <span className="font-label-sm mt-1 block text-label-sm text-error">
                {errors.phone.message}
              </span>
            ) : null}
          </div>
          <div>
            <label className={labelClassName}>{CLIENT_GOVERNORATE_LABEL}</label>
            <input className={inputClassName} type="text" {...register('governorate')} />
          </div>
          <div>
            <label className={labelClassName}>{CLIENT_CITY_LABEL}</label>
            <input className={inputClassName} type="text" {...register('city')} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClassName}>{CLIENT_ADDRESS_LABEL}</label>
            <input className={inputClassName} type="text" {...register('address')} />
          </div>
          <div>
            <label className={labelClassName}>{CLIENT_CREDIT_LIMIT_LABEL}</label>
            <input
              className={inputClassName}
              type="number"
              {...register('creditLimit', { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className={labelClassName}>{CLIENT_COMMERCIAL_TYPE_LABEL}</label>
            <input className={inputClassName} type="text" {...register('commercialType')} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClassName}>{CLIENT_NOTES_LABEL}</label>
            <textarea className={textareaClassName} rows={2} {...register('notes')} />
          </div>
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
              💡 إذا تركته فارغاً، سيقوم النظام تلقائياً بتوليد رمز PIN سهل وسريع مكون من 6 أرقام وعرضه عليك فوراً لنسخه للعميل.
            </span>
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
            {ADD_CLIENT_SUBMIT}
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
