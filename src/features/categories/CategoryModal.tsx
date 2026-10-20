import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { Category } from '@/api/categories.schema'
import { createCategoryInputSchema, type CreateCategoryInput } from '@/api/categories.schema'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  CATEGORY_DELETE_BLOCKED,
  CATEGORY_DELETE_CONFIRM_BUTTON,
  CATEGORY_DELETE_CONFIRM_DESCRIPTION,
  CATEGORY_DELETE_CONFIRM_TITLE,
  GENERIC_ERROR,
  PRODUCT_PLURAL_FORMS,
  TOAST_CATEGORY_CREATED,
  TOAST_CATEGORY_DELETED,
} from '@/constants/strings'
import { arabicPlural } from '@/lib/format'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/features/categories/hooks'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProductToCategory?: (category: Category) => void
}

export function CategoryModal({
  isOpen,
  onClose,
  onAddProductToCategory,
}: CategoryModalProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const categoriesQuery = useCategories()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()

  const categories = categoriesQuery.data?.data || []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategoryInputSchema),
    defaultValues: { name: '', nameEn: '' },
  })

  if (!isOpen) return null

  const onSubmit = async (values: CreateCategoryInput) => {
    try {
      await createCategory.mutateAsync(values)
      toast.success(TOAST_CATEGORY_CREATED)
      reset({ name: '', nameEn: '' })
      setIsAddOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  const handleDeleteClick = (category: Category) => {
    if (category.productsCount > 0) {
      toast.error(
        CATEGORY_DELETE_BLOCKED(
          category.productsCount,
          arabicPlural(category.productsCount, PRODUCT_PLURAL_FORMS),
        ),
      )
      return
    }
    setDeleteTarget(category)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCategory.mutateAsync(deleteTarget._id)
      toast.success(TOAST_CATEGORY_DELETED)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-primary/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container-lowest p-5 sm:p-6 shadow-2xl border border-surface-container-high flex flex-col">
        {/* Header matching petrokema_admin_4 */}
        <div className="flex items-start justify-between pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-fixed text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[24px]">
                account_tree
              </span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
                هيكلية التصنيفات
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                إجمالي التصنيفات المعتمدة:{' '}
                <span className="font-bold text-primary">
                  {categories.length} تصنيفات رئيسية
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Action button to open add form */}
        <div className="mt-4">
          {!isAddOpen ? (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="w-full h-11 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">
                add_circle
              </span>
              <span>إضافة تصنيف جديد</span>
            </button>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-xl border border-secondary/40 bg-surface-container-low p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between pb-1 border-b border-surface-container-high">
                <span className="font-label-md text-label-md font-bold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    create_new_folder
                  </span>
                  بيانات التصنيف الجديد
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="text-outline hover:text-on-surface p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-primary block mb-1">
                  اسم التصنيف بالعربية <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: دهانات الحماية الصناعية والعزل..."
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant font-body-sm text-body-sm text-primary focus:border-secondary focus:outline-none"
                  {...register('name')}
                />
                {errors.name && (
                  <span className="font-label-sm text-label-sm text-error mt-0.5 block">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-primary block mb-1">
                  الاسم بالإنجليزية (اختياري)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="e.g. Industrial & Protective Coatings"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant font-body-sm text-body-sm text-primary focus:border-secondary focus:outline-none text-left"
                  {...register('nameEn')}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="h-9 px-3 rounded-lg border border-outline-variant text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-4 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm font-bold flex items-center gap-1 hover:bg-secondary/90 shadow-sm transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    check
                  </span>
                  <span>حفظ وإضافة</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Categories List matching petrokema_admin_4 */}
        <div className="mt-4 flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-1">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <article
                key={cat._id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-xs hover:border-secondary/40 transition-all"
              >
                <div className="flex flex-col min-w-0 pr-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm font-bold text-primary truncate">
                      {cat.name}
                    </span>
                    <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant whitespace-nowrap">
                      {cat.productsCount} منتج نشط
                    </span>
                  </div>
                  {cat.nameEn && (
                    <span className="font-body-sm text-[11px] text-outline truncate" dir="ltr">
                      {cat.nameEn}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {onAddProductToCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        onAddProductToCategory(cat)
                      }}
                      title="إضافة منتج لهذا التصنيف"
                      className="flex h-8 px-2.5 items-center gap-1 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container font-label-sm text-label-sm font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        add_box
                      </span>
                      <span className="hidden sm:inline">منتج</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(cat)}
                    title="حذف التصنيف"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-error hover:bg-error-container transition-colors disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="py-6 text-center text-on-surface-variant font-body-sm text-body-sm">
              لا توجد تصنيفات مسجلة
            </p>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          confirmLabel={CATEGORY_DELETE_CONFIRM_BUTTON}
          description={CATEGORY_DELETE_CONFIRM_DESCRIPTION}
          onConfirm={handleConfirmDelete}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          open={Boolean(deleteTarget)}
          pending={deleteCategory.isPending}
          title={CATEGORY_DELETE_CONFIRM_TITLE}
        />
      </div>
    </div>
  )
}
