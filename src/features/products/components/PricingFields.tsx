import type { FieldErrors, Path, UseFormRegister } from 'react-hook-form'
import type { PricingFieldValues } from '@/features/products/productForm.schema'
import {
  UNIT_BASE_PRICE_LABEL,
  UNIT_BESTELA_BADGE,
  UNIT_BESTELA_LABEL,
  UNIT_DISCOUNT_LABEL,
  UNIT_GALON_BADGE,
  UNIT_GALON_LABEL,
  UNIT_WEIGHT_LABEL,
} from '@/constants/strings'

type PricingFieldsProps<T extends PricingFieldValues> = {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
}

const inputClassName =
  'w-full h-10 px-3 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none'
const fieldLabelClassName = 'font-label-sm block text-label-sm text-on-surface mb-1'

export function PricingFields<T extends PricingFieldValues>({
  register,
  errors,
}: PricingFieldsProps<T>) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4">
        <div className="flex items-center justify-between pb-2">
          <span className="font-headline-sm flex items-center gap-1.5 text-headline-sm text-primary">
            <span className="material-symbols-outlined text-[20px] text-secondary">
              water_bottle
            </span>
            {UNIT_GALON_LABEL}
          </span>
          <span className="font-label-sm rounded bg-surface-container-highest px-2 py-0.5 text-label-sm text-on-surface-variant">
            {UNIT_GALON_BADGE}
          </span>
        </div>
        <div>
          <label className={fieldLabelClassName}>
            {UNIT_BASE_PRICE_LABEL} <span className="text-error">*</span>
          </label>
          <input
            className={inputClassName}
            placeholder="350.00"
            step="0.01"
            type="number"
            {...register('galonPrice' as Path<T>, { valueAsNumber: true })}
          />
          {errors.galonPrice ? (
            <span className="font-label-sm mt-1 block text-label-sm text-error">
              {errors.galonPrice.message as string}
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={fieldLabelClassName}>{UNIT_DISCOUNT_LABEL}</label>
            <input
              className={inputClassName}
              placeholder="5"
              step="0.1"
              type="number"
              {...register('galonDiscount' as Path<T>, {
                setValueAs: (value) => (value === '' ? 0 : Number(value)),
              })}
            />
          </div>
          <div>
            <label className={fieldLabelClassName}>{UNIT_WEIGHT_LABEL}</label>
            <input
              className={inputClassName}
              placeholder="3.75 لتر"
              type="text"
              {...register('galonWeight' as Path<T>)}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4">
        <div className="flex items-center justify-between pb-2">
          <span className="font-headline-sm flex items-center gap-1.5 text-headline-sm text-primary">
            <span className="material-symbols-outlined text-[20px] text-secondary">
              package_2
            </span>
            {UNIT_BESTELA_LABEL}
          </span>
          <span className="font-label-sm rounded bg-secondary-fixed px-2 py-0.5 text-label-sm text-on-secondary-fixed-variant">
            {UNIT_BESTELA_BADGE}
          </span>
        </div>
        <div>
          <label className={fieldLabelClassName}>
            {UNIT_BASE_PRICE_LABEL} <span className="text-error">*</span>
          </label>
          <input
            className={inputClassName}
            placeholder="1250.00"
            step="0.01"
            type="number"
            {...register('bestelaPrice' as Path<T>, { valueAsNumber: true })}
          />
          {errors.bestelaPrice ? (
            <span className="font-label-sm mt-1 block text-label-sm text-error">
              {errors.bestelaPrice.message as string}
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={fieldLabelClassName}>{UNIT_DISCOUNT_LABEL}</label>
            <input
              className={inputClassName}
              placeholder="8"
              step="0.1"
              type="number"
              {...register('bestelaDiscount' as Path<T>, {
                setValueAs: (value) => (value === '' ? 0 : Number(value)),
              })}
            />
          </div>
          <div>
            <label className={fieldLabelClassName}>{UNIT_WEIGHT_LABEL}</label>
            <input
              className={inputClassName}
              placeholder="14 لتر"
              type="text"
              {...register('bestelaWeight' as Path<T>)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
