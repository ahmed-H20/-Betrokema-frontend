import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { Warehouse } from '@/api/warehouses.schema'
import {
  GENERIC_ERROR,
  TOAST_WAREHOUSE_SAVED,
  WAREHOUSE_ACTIVE_CHECKBOX_LABEL,
  WAREHOUSE_ADDRESS_FORM_LABEL,
  WAREHOUSE_ADDRESS_PLACEHOLDER,
  WAREHOUSE_CAPACITY_LABEL,
  WAREHOUSE_CAPACITY_UNIT,
  WAREHOUSE_CLASSIFICATION_LABEL,
  WAREHOUSE_CLASSIFICATION_OPTIONS,
  WAREHOUSE_EMERGENCY_PHONE_LABEL,
  WAREHOUSE_EMERGENCY_PHONE_PLACEHOLDER,
  WAREHOUSE_FORM_BADGE_CREATE,
  WAREHOUSE_FORM_BADGE_EDIT,
  WAREHOUSE_FORM_RESET,
  WAREHOUSE_FORM_SUBMIT_CREATE,
  WAREHOUSE_FORM_SUBMIT_EDIT,
  WAREHOUSE_FORM_SUBTITLE,
  WAREHOUSE_FORM_TITLE_CREATE,
  WAREHOUSE_FORM_TITLE_EDIT,
  WAREHOUSE_GOVERNORATE_LABEL,
  WAREHOUSE_GOVERNORATE_OPTIONS,
  WAREHOUSE_GOVERNORATE_PLACEHOLDER,
  WAREHOUSE_NAME_LABEL,
  WAREHOUSE_NAME_PLACEHOLDER,
  WAREHOUSE_OCCUPIED_PALLETS_LABEL,
  WAREHOUSE_SUPERVISOR_NAME_LABEL,
  WAREHOUSE_SUPERVISOR_NAME_PLACEHOLDER,
} from '@/constants/strings'
import { cn } from '@/lib/cn'
import { useCreateWarehouse, useUpdateWarehouse } from '@/features/warehouses/hooks'
import { buildWarehousePayload } from '@/features/warehouses/warehouseForm'
import {
  warehouseFormDefaults,
  warehouseFormSchema,
  type WarehouseFormValues,
} from '@/features/warehouses/warehouseForm.schema'

const inputClassName =
  'w-full h-11 px-space-md rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest transition-all'
const labelClassName =
  'font-label-md text-label-md text-primary font-semibold flex items-center gap-1'

function warehouseToFormValues(warehouse: Warehouse): WarehouseFormValues {
  return {
    name: warehouse.name,
    governorate: warehouse.governorate,
    address: warehouse.address,
    supervisorName: warehouse.supervisorName,
    emergencyPhone: warehouse.emergencyPhone,
    capacityPallets: warehouse.capacityPallets,
    occupiedPallets: warehouse.occupiedPallets,
    operatingClassification: warehouse.operatingClassification,
    isActive: warehouse.isActive,
  }
}

export function WarehouseFormPanel({
  editingWarehouse,
  onDoneEditing,
}: {
  editingWarehouse: Warehouse | undefined
  onDoneEditing: () => void
}) {
  const createWarehouse = useCreateWarehouse()
  const updateWarehouse = useUpdateWarehouse()
  const panelRef = useRef<HTMLDivElement>(null)
  const isEdit = Boolean(editingWarehouse)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: warehouseFormDefaults,
  })

  useEffect(() => {
    reset(
      editingWarehouse
        ? warehouseToFormValues(editingWarehouse)
        : warehouseFormDefaults,
    )
    if (editingWarehouse) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [editingWarehouse, reset])

  const governorateOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [
      ...WAREHOUSE_GOVERNORATE_OPTIONS,
    ]
    if (
      editingWarehouse &&
      !options.some((option) => option.value === editingWarehouse.governorate)
    ) {
      options.push({
        value: editingWarehouse.governorate,
        label: editingWarehouse.governorate,
      })
    }
    return options
  }, [editingWarehouse])

  const classificationOptions = useMemo(() => {
    const options: string[] = [...WAREHOUSE_CLASSIFICATION_OPTIONS]
    if (
      editingWarehouse &&
      !options.includes(editingWarehouse.operatingClassification)
    ) {
      options.push(editingWarehouse.operatingClassification)
    }
    return options
  }, [editingWarehouse])

  async function onSubmit(values: WarehouseFormValues) {
    try {
      const payload = buildWarehousePayload(values)
      if (editingWarehouse) {
        await updateWarehouse.mutateAsync({ id: editingWarehouse._id, input: payload })
      } else {
        await createWarehouse.mutateAsync(payload)
      }
      toast.success(TOAST_WAREHOUSE_SAVED)
      reset(warehouseFormDefaults)
      onDoneEditing()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  function onResetClick() {
    reset(warehouseFormDefaults)
    onDoneEditing()
  }

  return (
    <div
      className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
      ref={panelRef}
    >
      <div className="flex items-center justify-between pb-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[22px] text-secondary">
            domain_add
          </span>
          <h2 className="font-headline-md text-headline-md font-bold text-primary">
            {isEdit ? WAREHOUSE_FORM_TITLE_EDIT(editingWarehouse?.name ?? '') : WAREHOUSE_FORM_TITLE_CREATE}
          </h2>
        </div>
        <span
          className={cn(
            'font-label-sm rounded px-2 py-0.5 text-label-sm font-bold',
            isEdit
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : 'bg-secondary-fixed text-on-secondary-fixed-variant',
          )}
        >
          {isEdit ? WAREHOUSE_FORM_BADGE_EDIT : WAREHOUSE_FORM_BADGE_CREATE}
        </span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        {WAREHOUSE_FORM_SUBTITLE}
      </p>

      <form className="flex flex-col gap-space-md" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <label className={labelClassName}>
            {WAREHOUSE_NAME_LABEL} <span className="font-bold text-error">*</span>
          </label>
          <input
            className={inputClassName}
            placeholder={WAREHOUSE_NAME_PLACEHOLDER}
            type="text"
            {...register('name')}
          />
          {errors.name ? (
            <span className="font-label-sm text-label-sm text-error">{errors.name.message}</span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClassName}>
            {WAREHOUSE_GOVERNORATE_LABEL} <span className="font-bold text-error">*</span>
          </label>
          <select className={inputClassName} {...register('governorate')}>
            <option disabled value="">
              {WAREHOUSE_GOVERNORATE_PLACEHOLDER}
            </option>
            {governorateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.governorate ? (
            <span className="font-label-sm text-label-sm text-error">
              {errors.governorate.message}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClassName}>
            {WAREHOUSE_ADDRESS_FORM_LABEL} <span className="font-bold text-error">*</span>
          </label>
          <textarea
            className="w-full resize-none rounded-lg bg-surface-container-low p-space-md font-body-md text-body-md text-on-surface transition-all focus:bg-surface-container-lowest focus:outline-none"
            placeholder={WAREHOUSE_ADDRESS_PLACEHOLDER}
            rows={2}
            {...register('address')}
          />
          {errors.address ? (
            <span className="font-label-sm text-label-sm text-error">
              {errors.address.message}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{WAREHOUSE_SUPERVISOR_NAME_LABEL}</label>
            <input
              className={inputClassName}
              placeholder={WAREHOUSE_SUPERVISOR_NAME_PLACEHOLDER}
              type="text"
              {...register('supervisorName')}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{WAREHOUSE_EMERGENCY_PHONE_LABEL}</label>
            <input
              className={inputClassName}
              placeholder={WAREHOUSE_EMERGENCY_PHONE_PLACEHOLDER}
              type="text"
              {...register('emergencyPhone')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>
              {WAREHOUSE_CAPACITY_LABEL} <span className="font-bold text-error">*</span>
            </label>
            <div className="relative">
              <input
                className={cn(inputClassName, 'pl-12')}
                type="number"
                {...register('capacityPallets', { valueAsNumber: true })}
              />
              <span className="font-label-sm absolute left-3 top-1/2 -translate-y-1/2 text-label-sm font-bold text-on-surface-variant">
                {WAREHOUSE_CAPACITY_UNIT}
              </span>
            </div>
            {errors.capacityPallets ? (
              <span className="font-label-sm text-label-sm text-error">
                {errors.capacityPallets.message}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClassName}>{WAREHOUSE_OCCUPIED_PALLETS_LABEL}</label>
            <input
              className={inputClassName}
              type="number"
              {...register('occupiedPallets', { valueAsNumber: true })}
            />
            {errors.occupiedPallets ? (
              <span className="font-label-sm text-label-sm text-error">
                {errors.occupiedPallets.message}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClassName}>{WAREHOUSE_CLASSIFICATION_LABEL}</label>
          <select className={inputClassName} {...register('operatingClassification')}>
            {classificationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-space-sm rounded-lg bg-surface-container-low p-space-sm">
          <input
            className="h-4 w-4 cursor-pointer rounded text-secondary focus:ring-secondary"
            type="checkbox"
            {...register('isActive')}
          />
          <span className="font-label-md text-label-md font-medium text-on-surface">
            {WAREHOUSE_ACTIVE_CHECKBOX_LABEL}
          </span>
        </label>

        <div className="flex items-center gap-space-sm pt-space-sm">
          <button
            className="flex h-11 flex-1 items-center justify-center gap-space-xs rounded-lg bg-primary text-label-lg font-label-lg text-on-primary shadow-md transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            {isEdit ? WAREHOUSE_FORM_SUBMIT_EDIT : WAREHOUSE_FORM_SUBMIT_CREATE}
          </button>
          <button
            className="font-label-md h-11 rounded-lg bg-surface-container px-space-md text-label-md text-on-surface-variant transition-all hover:bg-surface-container-high"
            onClick={onResetClick}
            type="button"
          >
            {WAREHOUSE_FORM_RESET}
          </button>
        </div>
      </form>
    </div>
  )
}
