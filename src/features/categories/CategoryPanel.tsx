import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { Category } from '@/api/categories.schema'
import { createCategoryInputSchema, type CreateCategoryInput } from '@/api/categories.schema'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StateMessage } from '@/components/ui/StateMessage'
import {
  CATEGORIES_EMPTY,
  CATEGORIES_ERROR,
  CATEGORIES_LOADING,
  CATEGORY_DELETE_BLOCKED,
  CATEGORY_DELETE_BLOCKED_TOOLTIP,
  CATEGORY_DELETE_CONFIRM_BUTTON,
  CATEGORY_DELETE_CONFIRM_DESCRIPTION,
  CATEGORY_DELETE_CONFIRM_TITLE,
  CATEGORY_DELETE_TITLE,
  CATEGORY_FORM_BADGE,
  CATEGORY_FORM_NAME_EN_LABEL,
  CATEGORY_FORM_NAME_EN_PLACEHOLDER,
  CATEGORY_FORM_NAME_LABEL,
  CATEGORY_FORM_SUBMIT,
  CATEGORY_FORM_TITLE,
  CATEGORY_LIST_TITLE,
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

const inputClassName =
  'w-full h-10 px-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder-outline focus:outline-none focus:bg-surface-container-lowest transition-all'

function CategoryDeleteAction({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)
  const deleteCategory = useDeleteCategory()
  const blocked = category.productsCount > 0

  async function handleConfirm() {
    try {
      await deleteCategory.mutateAsync(category._id)
      toast.success(TOAST_CATEGORY_DELETED)
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  function handleOpen() {
    if (blocked) {
      toast.error(
        CATEGORY_DELETE_BLOCKED(
          category.productsCount,
          arabicPlural(category.productsCount, PRODUCT_PLURAL_FORMS),
        ),
      )
      return
    }
    setOpen(true)
  }

  return (
    <>
      <button
        className="flex h-8 w-8 items-center justify-center rounded-lg text-error transition-colors hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-40"
        disabled={blocked}
        onClick={handleOpen}
        title={blocked ? CATEGORY_DELETE_BLOCKED_TOOLTIP : CATEGORY_DELETE_TITLE}
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
      <ConfirmDialog
        confirmLabel={CATEGORY_DELETE_CONFIRM_BUTTON}
        description={CATEGORY_DELETE_CONFIRM_DESCRIPTION}
        onConfirm={handleConfirm}
        onOpenChange={setOpen}
        open={open}
        pending={deleteCategory.isPending}
        title={CATEGORY_DELETE_CONFIRM_TITLE}
      />
    </>
  )
}

export function CategoryPanel() {
  const categoriesQuery = useCategories()
  const createCategory = useCreateCategory()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategoryInputSchema),
    defaultValues: { name: '', nameEn: '' },
  })

  async function onSubmit(values: CreateCategoryInput) {
    try {
      await createCategory.mutateAsync(values)
      toast.success(TOAST_CATEGORY_CREATED)
      reset({ name: '', nameEn: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-secondary">
              format_list_bulleted_add
            </span>
            <h2 className="font-headline-sm text-headline-sm text-primary">
              {CATEGORY_FORM_TITLE}
            </h2>
          </div>
          <span className="font-label-sm rounded-full bg-secondary-fixed px-2 py-0.5 text-label-sm font-semibold text-on-secondary-fixed-variant">
            {CATEGORY_FORM_BADGE}
          </span>
        </div>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="font-label-md mb-1.5 block text-label-md text-on-surface">
              {CATEGORY_FORM_NAME_LABEL} <span className="text-error">*</span>
            </label>
            <input className={inputClassName} type="text" {...register('name')} />
            {errors.name ? (
              <span className="font-label-sm mt-1 block text-label-sm text-error">
                {errors.name.message}
              </span>
            ) : null}
          </div>
          <div>
            <label className="font-label-md mb-1.5 block text-label-md text-on-surface">
              {CATEGORY_FORM_NAME_EN_LABEL}
            </label>
            <input
              className={inputClassName}
              placeholder={CATEGORY_FORM_NAME_EN_PLACEHOLDER}
              type="text"
              {...register('nameEn')}
            />
          </div>
          <button
            className="font-label-md mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary-container text-label-md text-on-primary transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            {CATEGORY_FORM_SUBMIT}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-5 shadow-sm">
        {categoriesQuery.isLoading ? (
          <StateMessage minHeightClassName="min-h-[80px]" text={CATEGORIES_LOADING} />
        ) : categoriesQuery.isError || !categoriesQuery.data ? (
          <StateMessage minHeightClassName="min-h-[80px]" text={CATEGORIES_ERROR} tone="error" />
        ) : (
          <>
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                {CATEGORY_LIST_TITLE(categoriesQuery.data.data.length)}
              </h3>
            </div>
            {categoriesQuery.data.data.length === 0 ? (
              <StateMessage minHeightClassName="min-h-[80px]" text={CATEGORIES_EMPTY} />
            ) : (
              <div className="flex flex-col gap-2">
                {categoriesQuery.data.data.map((category) => (
                  <div
                    className="group flex items-center justify-between rounded-lg bg-surface-container-low p-3 transition-colors hover:bg-surface-container"
                    key={category._id}
                  >
                    <h4 className="font-label-md text-label-md text-on-surface">
                      {category.name}
                    </h4>
                    <CategoryDeleteAction category={category} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
