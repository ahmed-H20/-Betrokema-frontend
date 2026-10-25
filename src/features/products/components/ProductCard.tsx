import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Product } from '@/api/products.schema'
import {
  CURRENCY_SUFFIX,
  GENERIC_ERROR,
  PRODUCT_DELETE_BUTTON,
  PRODUCT_DELETE_CONFIRM_BUTTON,
  PRODUCT_DELETE_CONFIRM_DESCRIPTION,
  PRODUCT_DELETE_CONFIRM_TITLE,
  PRODUCT_LOW_STOCK_BADGE,
  PRODUCT_NO_CATEGORY,
  TOAST_PRODUCT_DELETED,
} from '@/constants/strings'
import { formatNumber } from '@/lib/format'
import { resolveImageUrl } from '@/lib/image'
import { useDeleteProduct } from '@/features/products/hooks'
import { QuickEditStockDialog } from '@/features/products/components/QuickEditStockDialog'
import { ProductFormDialog } from '@/features/products/components/ProductFormDialog'
import { getUnitIcon, getContrastColor } from '@/features/products/components/PricingFields'

const CATEGORY_BADGE_STYLES = [
  'bg-secondary-fixed text-on-secondary-fixed-variant',
  'bg-surface-container-highest text-primary',
  'bg-tertiary-fixed text-on-tertiary-fixed-variant',
]

type ProductCardProps = {
  product: Product
  categoryColorIndex: number
}

function getFeatureIcon(name: string): string {
  if (name.includes('شمس') || name.includes('UV') || name.includes('حرار')) return 'wb_sunny'
  if (name.includes('بيئة') || name.includes('أخضر')) return 'eco'
  if (name.includes('مائي') || name.includes('رطوبة') || name.includes('عزل')) return 'water_drop'
  if (name.includes('غسيل') || name.includes('تنظيف')) return 'clean_hands'
  return 'verified'
}

export function ProductCard({ product, categoryColorIndex }: ProductCardProps) {
  const [fullEditOpen, setFullEditOpen] = useState(false)
  const [quickEditOpen, setQuickEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteProduct = useDeleteProduct()

  const categoryName =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name

  async function handleDelete() {
    try {
      await deleteProduct.mutateAsync(product._id)
      toast.success(TOAST_PRODUCT_DELETED)
      setDeleteOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  const galleryCount = (product.images?.length || 0) + (product.image ? 1 : 0)

  return (
    <div className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md">
      <div>
        {/* Header: Image preview + Basic info matching petrokema_admin_1 */}
        <div className="mb-3 flex items-start gap-3.5">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
            {product.image ? (
              <img
                alt={product.name}
                className="h-full w-full object-cover"
                src={resolveImageUrl(product.image)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-headline-sm text-headline-sm text-on-surface-variant">
                {product.name.slice(0, 2)}
              </div>
            )}
            {galleryCount > 1 && (
              <span className="absolute bottom-1 end-1 flex items-center gap-0.5 rounded bg-primary/75 px-1.5 py-0.2 font-label-sm text-[9px] text-on-primary backdrop-blur-xl">
                <span className="material-symbols-outlined text-[10px]">photo_library</span>{' '}
                {galleryCount}
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-1">
              <span
                className={`font-label-sm whitespace-nowrap rounded-full px-2 py-0.5 text-label-sm font-semibold ${
                  categoryName
                    ? CATEGORY_BADGE_STYLES[categoryColorIndex % 3]
                    : 'bg-surface-container-highest text-on-surface-variant'
                }`}
              >
                {categoryName ?? PRODUCT_NO_CATEGORY}
              </span>
              {product.code ? (
                <span
                  className="font-label-sm font-mono whitespace-nowrap text-label-sm text-outline"
                  dir="ltr"
                >
                  #{product.code}
                </span>
              ) : null}
            </div>

            <h3 className="font-headline-sm mt-1 text-headline-sm font-bold leading-snug text-primary truncate">
              {product.name}
            </h3>

            {product.description ? (
              <p className="font-body-sm mt-0.5 text-body-sm text-on-surface-variant line-clamp-1 truncate">
                {product.description}
              </p>
            ) : null}
          </div>
        </div>

        {/* Features Badges matching petrokema_admin_1 */}
        {(() => {
          const rawFeatures = product.fetures || (product as any).features || []
          const list = Array.isArray(rawFeatures)
            ? rawFeatures.map((f: any) => typeof f === 'string' ? f : f?.name).filter(Boolean)
            : []
          if (list.length === 0) return null
          return (
            <div className="mb-3 flex flex-wrap gap-1.5 py-0.5">
              {list.map((name: string, index: number) => (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-surface font-medium"
                  key={`${name}-${index}`}
                >
                  <span className="material-symbols-outlined text-[13px] text-secondary">
                    {getFeatureIcon(name)}
                  </span>
                  {name}
                </span>
              ))}
            </div>
          )
        })()}

        {/* Dynamic Multi-Packaging Pricing Grid */}
        {product.packages && product.packages.length > 0 ? (
          <div
            className={`mb-3 grid gap-2 rounded-xl bg-surface-container-low p-2 ${
              product.packages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            {product.packages.map((pkg, idx) => {
              const icon = getUnitIcon(pkg.unitName, pkg.weight)
              return (
                <div
                  className="flex flex-col rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-2"
                  key={`${pkg.unitName}-${pkg.weight || ''}-${idx}`}
                >
                  <div className="flex items-center justify-between border-b border-surface-container-high pb-1 gap-1">
                    <span className="font-label-md text-label-md font-semibold text-primary flex items-center gap-1 min-w-0 truncate">
                      <span className="material-symbols-outlined text-[15px] text-secondary shrink-0">
                        {icon}
                      </span>
                      <span className="truncate">{pkg.unitName}</span>
                    </span>
                    {pkg.weight ? (
                      <span className="font-label-sm text-[11px] font-mono text-on-surface-variant shrink-0 bg-surface-container px-1 py-0.2 rounded">
                        {pkg.weight}
                      </span>
                    ) : null}
                  </div>
                  {pkg.note ? (
                    <span className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5 font-medium">
                      {pkg.note}
                    </span>
                  ) : null}
                  <div className="flex items-baseline justify-between pt-1.5 gap-1">
                    <div>
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">
                        {formatNumber(pkg.price)}
                      </span>
                      <span className="font-label-sm mr-1 text-label-sm text-on-surface-variant">
                        {CURRENCY_SUFFIX}
                      </span>
                    </div>
                    {pkg.oldPrice > pkg.price ? (
                      <div className="flex flex-col items-end">
                        <span className="font-body-sm text-[11px] text-outline line-through">
                          {formatNumber(pkg.oldPrice)} {CURRENCY_SUFFIX}
                        </span>
                        {pkg.discountPercent > 0 && (
                          <span className="font-label-sm text-[10px] font-semibold text-error">
                            خصم {pkg.discountPercent}%
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                  {pkg.colors && pkg.colors.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-1.5 border-t border-surface-container-high/60 mt-1.5">
                      <div className="flex items-center -space-x-1 space-x-reverse">
                        {pkg.colors.slice(0, 4).map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: c.hex || '#000000' }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {pkg.colors.slice(0, 3).map((c, cIdx) => (
                          <span
                            key={cIdx}
                            style={{
                              backgroundColor: c.hex || '#000000',
                              color: getContrastColor(c.hex),
                            }}
                            className="px-1.5 py-0.2 rounded text-[9px] font-bold shadow-2xs"
                          >
                            {c.name}
                          </span>
                        ))}
                        {pkg.colors.length > 3 && (
                          <span className="text-[9px] text-slate-500 font-bold">
                            +{pkg.colors.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : null}

        {/* Colors Strip if configured */}
        {product.colors && product.colors.length > 0 ? (
          <div className="mb-3 rounded-lg border border-surface-container-high bg-surface-container-lowest/80 p-2 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <span className="material-symbols-outlined text-[14px] text-indigo-600">
                  palette
                </span>
                <span>الألوان المتاحة ({product.colors.length}):</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.colors.map((c, cIdx) => (
                <div
                  key={cIdx}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-800 shadow-2xs"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-slate-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: c.hex || '#FFFFFF' }}
                  />
                  <span>{c.name}</span>
                  {c.price > 0 && (
                    <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1 py-0.2 rounded font-mono">
                      +{formatNumber(c.price)} ج.م
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Gift Product Badge if set */}
        {(() => {
          const pGift = (product as any).gift || {}
          const name = pGift.name || product.giftTitle || (typeof product.giftProduct === 'object' && product.giftProduct?.name ? product.giftProduct.name : '')
          const image = pGift.image || (typeof product.giftProduct === 'object' && product.giftProduct?.image ? product.giftProduct.image : '')
          const weight = pGift.weight || ''

          if (!name) return null

          return (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 font-label-sm text-label-sm text-amber-900">
              {image ? (
                <img
                  src={resolveImageUrl(image)}
                  alt={name}
                  className="w-6 h-6 rounded-md object-cover border border-amber-300 bg-white shrink-0"
                />
              ) : (
                <span className="material-symbols-outlined text-[16px] text-amber-600">
                  featured_seasonal_and_gifts
                </span>
              )}
              <span className="font-semibold shrink-0">هدية مع المنتج:</span>
              <span className="font-bold text-amber-950 truncate flex-1">{name}</span>
              {weight && (
                <span className="text-[10px] font-mono font-bold bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded shrink-0">
                  {weight}
                </span>
              )}
            </div>
          )
        })()}

        {/* Stock Status Strip matching petrokema_admin_1 */}
        <div className="mb-3 flex items-center justify-between rounded-lg bg-surface-container-low px-2.5 py-1.5 font-label-sm text-label-sm">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary">
              inventory_2
            </span>
            <span>الكمية بالمخزون:</span>
            <span className="font-bold text-primary">
              {formatNumber(product.quantity)} وحدة
            </span>
          </div>
          {product.isLowStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2 py-0.5 font-semibold text-on-error-container">
              <span className="material-symbols-outlined text-[13px]">warning</span>
              {PRODUCT_LOW_STOCK_BADGE}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-2 py-0.5 font-semibold text-on-secondary-fixed-variant">
              <span className="h-1.5 w-1.5 rounded-full bg-[#15803d]" />
              متوفر بالمستودع
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-surface-container pt-3">
        <button
          className="font-label-md flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-center text-label-md font-semibold text-on-primary transition-all hover:bg-primary/90 shadow-xs cursor-pointer"
          onClick={() => setFullEditOpen(true)}
          title="تعديل كافة بيانات ومواصفات وصور المنتج"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">
            edit
          </span>
          <span>تعديل المنتج</span>
        </button>

        <button
          className="font-label-md flex h-10 items-center justify-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-2 text-center text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container-highest cursor-pointer"
          onClick={() => setQuickEditOpen(true)}
          title="تعديل سريع للسعر والمخزون فقط"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">
            tune
          </span>
          <span className="hidden sm:inline">سعر ومخزون</span>
        </button>

        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-error transition-colors hover:bg-error-container cursor-pointer"
          onClick={() => setDeleteOpen(true)}
          title={PRODUCT_DELETE_BUTTON}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            delete
          </span>
        </button>
      </div>

      {fullEditOpen ? (
        <ProductFormDialog
          onOpenChange={setFullEditOpen}
          open={fullEditOpen}
          productToEdit={product}
        />
      ) : null}

      {quickEditOpen ? (
        <QuickEditStockDialog
          onOpenChange={setQuickEditOpen}
          open={quickEditOpen}
          product={product}
        />
      ) : null}

      <ConfirmDialog
        confirmLabel={PRODUCT_DELETE_CONFIRM_BUTTON}
        description={PRODUCT_DELETE_CONFIRM_DESCRIPTION}
        onConfirm={handleDelete}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        pending={deleteProduct.isPending}
        title={PRODUCT_DELETE_CONFIRM_TITLE}
      />
    </div>
  )
}
