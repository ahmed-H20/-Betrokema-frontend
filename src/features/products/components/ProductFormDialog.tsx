import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import {
  GENERIC_ERROR,
  MODAL_CANCEL,
  PRODUCT_CATEGORY_LABEL,
  PRODUCT_CATEGORY_PLACEHOLDER,
  PRODUCT_DESCRIPTION_LABEL,
  PRODUCT_DESCRIPTION_PLACEHOLDER,
  PRODUCT_GALLERY_LABEL,
  PRODUCT_IMAGE_LABEL,
  PRODUCT_INITIAL_QUANTITY_LABEL,
  PRODUCT_MODAL_SECTION_BASIC,
  PRODUCT_MODAL_SECTION_FEATURES,
  PRODUCT_MODAL_SECTION_MEDIA,
  PRODUCT_MODAL_SECTION_PRICING,
  PRODUCT_MODAL_SECTION_STOCK,
  PRODUCT_MODAL_SUBMIT,
  PRODUCT_MODAL_SUBTITLE,
  PRODUCT_MODAL_TITLE,
  PRODUCT_NAME_LABEL,
  PRODUCT_NAME_PLACEHOLDER,
  PRODUCT_REORDER_LEVEL_LABEL,
  PRODUCT_WAREHOUSE_LABEL,
  PRODUCT_WAREHOUSE_PLACEHOLDER,
  TOAST_PRODUCT_CREATED,
} from '@/constants/strings'
import { useCategories } from '@/features/categories/hooks'
import { useCreateProduct, useWarehouseNames } from '@/features/products/hooks'
import { buildCreateProductPayload } from '@/features/products/productForm'
import {
  productFormDefaults,
  productFormSchema,
  type ProductFormValues,
} from '@/features/products/productForm.schema'
import { FeatureCheckboxGroup } from '@/features/products/components/FeatureCheckboxGroup'
import { PricingFields } from '@/features/products/components/PricingFields'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { MultiImageUpload } from '@/components/ui/MultiImageUpload'

type ProductFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const inputClassName =
  'w-full h-11 px-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-highest transition-all'
const textareaClassName =
  'w-full p-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-highest transition-all'
const compactInputClassName =
  'w-full h-10 px-3 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none transition-all'
const DEFAULT_WAREHOUSES = [
  'مستودع العاشر من رمضان المركزي',
  'مستودع مدينة السادات للمواد الخام',
  'مستودع برج العرب الساحلي',
  'مستودع أسيوط الإقليمي للصعيد',
]

const labelClassName = 'block font-label-md text-label-md text-on-surface mb-1'

export function ProductFormDialog({
  open,
  onOpenChange,
}: ProductFormDialogProps) {
  const categoriesQuery = useCategories()
  const warehousesQuery = useWarehouseNames()
  const createProduct = useCreateProduct()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormDefaults,
  })

  const features = watch('features')
  const quantity = watch('quantity')

  useEffect(() => {
    if (open) reset(productFormDefaults)
  }, [open, reset])

  async function onSubmit(values: ProductFormValues) {
    try {
      await createProduct.mutateAsync(buildCreateProductPayload(values))
      toast.success(TOAST_PRODUCT_CREATED)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-4xl">
      <DialogHeader
        icon="add_box"
        onClose={() => onOpenChange(false)}
        subtitle={PRODUCT_MODAL_SUBTITLE}
        title={PRODUCT_MODAL_TITLE}
      />
      <form
        className="flex flex-1 flex-col overflow-hidden"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-6 overflow-y-auto p-6">
          <div>
            <h4 className="font-headline-sm mb-3 flex items-center gap-2 text-headline-sm text-primary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {PRODUCT_MODAL_SECTION_BASIC}
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClassName}>
                  {PRODUCT_NAME_LABEL} <span className="text-error">*</span>
                </label>
                <input
                  className={inputClassName}
                  placeholder={PRODUCT_NAME_PLACEHOLDER}
                  type="text"
                  {...register('name')}
                />
                {errors.name ? (
                  <span className="font-label-sm mt-1 block text-label-sm text-error">
                    {errors.name.message}
                  </span>
                ) : null}
              </div>
              <div>
                <label className={labelClassName}>
                  {PRODUCT_CATEGORY_LABEL} <span className="text-error">*</span>
                </label>
                <select className={inputClassName} {...register('category')}>
                  <option value="">{PRODUCT_CATEGORY_PLACEHOLDER}</option>
                  {categoriesQuery.isLoading ? (
                    <option disabled value="">
                      جارِ تحميل التصنيفات المعتمَدة...
                    </option>
                  ) : null}
                  {categoriesQuery.data?.data && categoriesQuery.data.data.length === 0 && !categoriesQuery.isLoading ? (
                    <option disabled value="">
                      لا توجد تصنيفات حالياً - يرجى إنشاء تصنيف أولاً
                    </option>
                  ) : null}
                  {categoriesQuery.data?.data.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category ? (
                  <span className="font-label-sm mt-1 block text-label-sm text-error">
                    {errors.category.message}
                  </span>
                ) : null}
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>
                  {PRODUCT_DESCRIPTION_LABEL}
                </label>
                <textarea
                  className={textareaClassName}
                  placeholder={PRODUCT_DESCRIPTION_PLACEHOLDER}
                  rows={3}
                  {...register('description')}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-headline-sm mb-3 flex items-center gap-2 text-headline-sm text-primary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {PRODUCT_MODAL_SECTION_PRICING}
            </h4>
            <PricingFields
              errors={errors}
              register={register}
              setValue={setValue}
            />
          </div>

          <div>
            <h4 className="font-headline-sm mb-3 flex items-center gap-2 text-headline-sm text-primary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {PRODUCT_MODAL_SECTION_STOCK}
            </h4>
            <div className="grid grid-cols-1 items-center gap-4 rounded-xl bg-surface-container-low p-4 md:grid-cols-3">
              <div>
                <label className={labelClassName}>
                  {PRODUCT_WAREHOUSE_LABEL} <span className="text-error">*</span>
                </label>
                <select
                  className={compactInputClassName}
                  {...register('warehouse')}
                >
                  <option value="">{PRODUCT_WAREHOUSE_PLACEHOLDER}</option>
                  {warehousesQuery.isLoading ? (
                    <option disabled value="">
                      جارِ تحميل المستودعات...
                    </option>
                  ) : null}
                  {(warehousesQuery.data && warehousesQuery.data.length > 0
                    ? warehousesQuery.data
                    : DEFAULT_WAREHOUSES
                  ).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {errors.warehouse ? (
                  <span className="font-label-sm mt-1 block text-label-sm text-error">
                    {errors.warehouse.message}
                  </span>
                ) : null}
              </div>
              <div>
                <label className={labelClassName}>
                  {PRODUCT_INITIAL_QUANTITY_LABEL}
                </label>
                <div className="flex items-center">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-r-lg bg-surface-container-highest text-lg font-bold text-on-surface transition-colors hover:bg-surface-container"
                    onClick={() =>
                      setValue('quantity', Math.max(0, (quantity || 0) - 5))
                    }
                    type="button"
                  >
                    -
                  </button>
                  <input
                    className="font-headline-sm h-10 w-full bg-surface-container-lowest text-center text-headline-sm text-primary focus:outline-none"
                    type="number"
                    {...register('quantity', { valueAsNumber: true })}
                  />
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-l-lg bg-surface-container-highest text-lg font-bold text-on-surface transition-colors hover:bg-surface-container"
                    onClick={() => setValue('quantity', (quantity || 0) + 5)}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClassName}>
                  {PRODUCT_REORDER_LEVEL_LABEL}
                </label>
                <input
                  className={compactInputClassName}
                  type="number"
                  {...register('minStockThreshold', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-headline-sm mb-2 flex items-center gap-2 text-headline-sm text-primary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {PRODUCT_MODAL_SECTION_FEATURES}
            </h4>
            <FeatureCheckboxGroup
              onChange={(next) => setValue('features', next)}
              value={features}
            />
          </div>

          <div>
            <h4 className="font-headline-sm mb-3 flex items-center gap-2 text-headline-sm text-primary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {PRODUCT_MODAL_SECTION_MEDIA}
            </h4>
            <div className="flex flex-col gap-5">
              <ImageUpload
                aspectRatio="video"
                error={errors.image?.message}
                label={PRODUCT_IMAGE_LABEL}
                onChange={(url) =>
                  setValue('image', url, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                onClear={() =>
                  setValue('image', '', {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                type="products"
                value={watch('image')}
              />

              <MultiImageUpload
                helperText="يمكنك رفع حتى 10 صور إضافية لمعرض المنتج (PNG, JPG, WebP)"
                images={watch('images') || []}
                label={PRODUCT_GALLERY_LABEL}
                onChange={(nextImages) =>
                  setValue('images', nextImages, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                type="products"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 bg-surface-container px-6 py-4">
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
            <span className="material-symbols-outlined text-[18px]">
              check_circle
            </span>
            {PRODUCT_MODAL_SUBMIT}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
