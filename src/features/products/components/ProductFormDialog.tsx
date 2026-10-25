import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import type { Product } from '@/api/products.schema'
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
import {
  useCreateProduct,
  useProducts,
  useUpdateProduct,
  useWarehouseNames,
} from '@/features/products/hooks'
import {
  buildCreateProductPayload,
  buildProductFormDefaults,
} from '@/features/products/productForm'
import {
  productFormDefaults,
  productFormSchema,
  type ProductFormValues,
} from '@/features/products/productForm.schema'
import { FeatureCheckboxGroup } from '@/features/products/components/FeatureCheckboxGroup'
import { PricingFields } from '@/features/products/components/PricingFields'
import { ProductColorsField } from '@/features/products/components/ProductColorsField'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { MultiImageUpload } from '@/components/ui/MultiImageUpload'
import { resolveImageUrl } from '@/lib/image'

type ProductFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productToEdit?: Product | null
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
  productToEdit,
}: ProductFormDialogProps) {
  const isEditMode = Boolean(productToEdit)
  const categoriesQuery = useCategories()
  const warehousesQuery = useWarehouseNames()
  const productsQuery = useProducts({ limit: 100 })
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const availableGiftProducts = (productsQuery.data?.data || []).filter(
    (p) => !productToEdit || p._id !== productToEdit._id,
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productToEdit
      ? buildProductFormDefaults(productToEdit)
      : productFormDefaults,
  })

  const features = watch('features')
  const quantity = watch('quantity')

  useEffect(() => {
    if (open) {
      reset(
        productToEdit
          ? buildProductFormDefaults(productToEdit)
          : productFormDefaults,
      )
    }
  }, [open, productToEdit, reset])

  async function onSubmit(values: ProductFormValues) {
    try {
      const payload = buildCreateProductPayload(values)
      if (isEditMode && productToEdit) {
        await updateProduct.mutateAsync({
          id: productToEdit._id,
          input: payload,
        })
        toast.success('تم حفظ وتحديث بيانات وصور المنتج بنجاح')
      } else {
        await createProduct.mutateAsync(payload)
        toast.success(TOAST_PRODUCT_CREATED)
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-4xl">
      <DialogHeader
        icon={isEditMode ? 'edit_document' : 'add_box'}
        onClose={() => onOpenChange(false)}
        subtitle={
          isEditMode
            ? `تعديل المواصفات الفنية والأسعار والمخزون وصور المعرض لـ: ${productToEdit?.name}`
            : PRODUCT_MODAL_SUBTITLE
        }
        title={isEditMode ? 'تعديل بيانات وصور المنتج' : PRODUCT_MODAL_TITLE}
      />
      <form
        className="flex flex-1 min-h-0 flex-col overflow-hidden"
        onSubmit={handleSubmit(onSubmit, (errs) => {
          console.error('ProductForm validation errors:', errs)
          toast.error('يرجى مراجعة وتعبئة الحقول الإلزامية')
        })}
      >
        <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto overscroll-contain p-4 sm:p-6">
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
              control={control}
              errors={errors}
              register={register}
              setValue={setValue}
              watch={watch}
            />
          </div>

          <div>
            <ProductColorsField
              control={control}
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
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

          {/* Section: Gift Product & Promotions (صورة، اسم، وصف، وزن) */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-headline-sm flex items-center gap-2 text-headline-sm text-primary">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>إضافة منتج هدية على الصنف (Gift Product)</span>
              </h4>
              {(watch('giftName') ||
                watch('giftTitle') ||
                watch('giftImage') ||
                watch('giftProduct') ||
                watch('giftWeight')) && (
                <button
                  type="button"
                  onClick={() => {
                    setValue('giftProduct', '', { shouldDirty: true })
                    setValue('giftTitle', '', { shouldDirty: true })
                    setValue('giftName', '', { shouldDirty: true })
                    setValue('giftDescription', '', { shouldDirty: true })
                    setValue('giftImage', '', { shouldDirty: true })
                    setValue('giftWeight', '', { shouldDirty: true })
                  }}
                  className="text-xs text-error hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    delete_sweep
                  </span>
                  إلغاء / مسح الهدية
                </button>
              )}
            </div>
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-4 sm:p-5 space-y-4">
              {/* Optional Quick-fill from catalog */}
              <div>
                <label className={labelClassName}>
                  تعبئة تلقائية من الكتالوج الحالي (اختياري)
                </label>
                <select
                  className={inputClassName}
                  value={watch('giftProduct') || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value
                    setValue('giftProduct', selectedId, { shouldDirty: true })
                    if (selectedId) {
                      const selectedProd = availableGiftProducts.find((p) => p._id === selectedId)
                      if (selectedProd) {
                        setValue('giftName', selectedProd.name, { shouldDirty: true })
                        setValue('giftDescription', selectedProd.description || '', { shouldDirty: true })
                        const img = selectedProd.image || (selectedProd.images && selectedProd.images[0]) || ''
                        setValue('giftImage', img, { shouldDirty: true })
                        const defaultWeight = selectedProd.packages?.[0]?.weight || ''
                        setValue('giftWeight', defaultWeight, { shouldDirty: true })
                      }
                    }
                  }}
                >
                  <option value="">-- إدخال يدوي مخصص أو اختر من منتجات الشركة --</option>
                  {availableGiftProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.code ? `(${p.code})` : ''}
                    </option>
                  ))}
                </select>
                <span className="font-label-sm mt-1 block text-label-sm text-on-surface-variant">
                  يمكنك اختيار صنف من الكتالوج لنسخ بياناته تلقائياً أو تعبئة حقول الهدية يدوياً بالأسفل
                </span>
              </div>

              {/* Grid: Name & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClassName}>
                    اسم المنتج الهدية
                  </label>
                  <input
                    type="text"
                    className={inputClassName}
                    placeholder="مثال: علبة بوند بلس / فرشاة دهان 4 بوصة / جالون سيلر"
                    {...register('giftName')}
                  />
                </div>

                <div>
                  <label className={labelClassName}>
                    وزن / سعة المنتج الهدية
                  </label>
                  <input
                    type="text"
                    className={inputClassName}
                    placeholder="مثال: 3.75 لتر / 1 كجم / 1 قطعة"
                    {...register('giftWeight')}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelClassName}>
                  وصف المنتج الهدية
                </label>
                <textarea
                  className={textareaClassName}
                  placeholder="وصف مواصفات الهدية، نوعها، أو شروط استحقاقها للعميل..."
                  rows={2}
                  {...register('giftDescription')}
                />
              </div>

              {/* Gift Image Upload */}
              <div>
                <ImageUpload
                  aspectRatio="video"
                  label="صورة المنتج الهدية"
                  onChange={(url) =>
                    setValue('giftImage', url, {
                      shouldDirty: true,
                    })
                  }
                  onClear={() =>
                    setValue('giftImage', '', {
                      shouldDirty: true,
                    })
                  }
                  type="products"
                  value={watch('giftImage')}
                />
              </div>

              {/* Live Preview if gift has name or image */}
              {(watch('giftName') || watch('giftTitle') || watch('giftImage')) && (
                <div className="mt-2 p-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl flex items-center gap-3.5 shadow-2xs">
                  {watch('giftImage') ? (
                    <img
                      src={resolveImageUrl(watch('giftImage'))}
                      alt="معاينة الهدية"
                      className="w-14 h-14 rounded-xl object-cover border border-amber-200 shadow-xs shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[24px]">
                        featured_seasonal_and_gifts
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full">
                        معاينة كارت الهدية كما يظهر للعميل
                      </span>
                      {watch('giftWeight') && (
                        <span className="text-[10px] font-bold text-orange-800 bg-orange-100/90 px-2 py-0.5 rounded-full font-mono">
                          الوزن: {watch('giftWeight')}
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 mt-1 truncate">
                      🎁 هدية مجانية: {watch('giftName') || watch('giftTitle')}
                    </h5>
                    {watch('giftDescription') && (
                      <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                        {watch('giftDescription')}
                      </p>
                    )}
                  </div>
                </div>
              )}
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
            className="font-label-md flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-label-md text-on-primary shadow-md transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            disabled={isSubmitting || createProduct.isPending || updateProduct.isPending}
            type="submit"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isEditMode ? 'save' : 'check_circle'}
            </span>
            <span>
              {isSubmitting || createProduct.isPending || updateProduct.isPending
                ? 'جارٍ الحفظ...'
                : isEditMode
                  ? 'حفظ التعديلات'
                  : PRODUCT_MODAL_SUBMIT}
            </span>
          </button>
        </div>
      </form>
    </Dialog>
  )
}
