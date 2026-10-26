import { useState } from 'react'
import type { Product } from '@/api/products.schema'
import { formatNumber } from '@/lib/format'
import { resolveImageUrl } from '@/lib/image'
import { getContrastColor, getUnitIcon } from '@/features/products/components/PricingFields'

interface CatalogProductCardProps {
  product: Product
  categoryName: string
  onOpenGallery: (product: Product) => void
  addToCart: (
    product: Product,
    packageIndex: number,
    quantity?: number,
    selectedColor?: { name: string; hex?: string; price?: number },
  ) => void
}

export function CatalogProductCard({
  product,
  categoryName,
  onOpenGallery,
  addToCart,
}: CatalogProductCardProps) {
  // State for active package tab
  const [selectedPackageIndex, setSelectedPackageIndex] = useState<number>(0)

  // State to track selected color per package index
  const [selectedColorMap, setSelectedColorMap] = useState<Record<number, number>>(
    () => {
      const initial: Record<number, number> = {}
      ;(product.packages || []).forEach((pkg, idx) => {
        if (pkg.colors && pkg.colors.length > 0) {
          initial[idx] = 0
        }
      })
      return initial
    },
  )

  // State for quantity per package
  const [quantityMap, setQuantityMap] = useState<Record<number, number>>({})

  // Expandable description toggle
  const [showFullDesc, setShowFullDesc] = useState(false)

  // View mode toggle: compact tabs vs all packages list
  const [showAllPackages, setShowAllPackages] = useState(false)

  const handleSelectColor = (pkgIndex: number, colorIndex: number) => {
    setSelectedColorMap((prev) => ({
      ...prev,
      [pkgIndex]: colorIndex,
    }))
  }

  const handleQuantityChange = (pkgIndex: number, delta: number) => {
    setQuantityMap((prev) => {
      const current = prev[pkgIndex] || 1
      const updated = Math.max(1, current + delta)
      return {
        ...prev,
        [pkgIndex]: updated,
      }
    })
  }

  // Build packages array, defaulting to standard packages if empty
  const packages =
    product.packages && product.packages.length > 0
      ? product.packages
      : [
          {
            unitName: 'بستلة',
            price: 978.5,
            oldPrice: 0,
            discountPercent: 0,
            weight: '9 لتر',
            note: 'مط عالي الجودة',
            colors: [],
          },
          {
            unitName: 'جالون',
            price: 300,
            oldPrice: 0,
            discountPercent: 0,
            weight: '2.5 لتر',
            note: 'أبيض ناصع',
            colors: [],
          },
        ]

  // Safe active package
  const activePkgIndex = Math.min(selectedPackageIndex, packages.length - 1)
  const currentPkg = packages[activePkgIndex] || packages[0]

  const rawFeatures = product.fetures || (product as any).features || []
  const featuresList = Array.isArray(rawFeatures)
    ? rawFeatures
        .map((f: any) => (typeof f === 'string' ? f : f?.name))
        .filter(Boolean)
    : []

  const productGift = (product as any).gift || {}
  const giftName =
    productGift.name ||
    product.giftTitle ||
    (typeof product.giftProduct === 'object' && product.giftProduct !== null
      ? product.giftProduct.name
      : '')
  const giftImage =
    productGift.image ||
    (typeof product.giftProduct === 'object' && product.giftProduct !== null
      ? product.giftProduct.image ||
        (product.giftProduct.images && product.giftProduct.images[0])
      : '')
  const giftWeight =
    productGift.weight ||
    (typeof product.giftProduct === 'object' && product.giftProduct !== null
      ? (product.giftProduct as any).packages?.[0]?.weight || ''
      : '')
  const giftDescription =
    productGift.description ||
    (typeof product.giftProduct === 'object' && product.giftProduct !== null
      ? (product.giftProduct as any).description || ''
      : '')

  const allImages = [product.image, ...(product.images || [])].filter(
    (url): url is string => Boolean(url && url.trim() !== ''),
  )
  const displayImg = allImages[0] || ''

  // Current package calculation
  const currentHasColors =
    Array.isArray(currentPkg.colors) && currentPkg.colors.length > 0
  const currentColorIndex = selectedColorMap[activePkgIndex] ?? 0
  const currentColor = currentHasColors
    ? currentPkg.colors![currentColorIndex]
    : undefined
  const currentColorExtra = currentColor?.price || 0
  const currentUnitPrice = currentPkg.price + currentColorExtra
  const currentQty = quantityMap[activePkgIndex] || 1

  return (
    <article
      key={product._id}
      className="group rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
      dir="rtl"
    >
      <div>
        {/* 1. PRODUCT IMAGE & HERO MEDIA (Always First at the Top) */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-100 p-3 sm:p-4 flex items-center justify-center overflow-hidden border-b border-slate-100">
          {/* Top Badges: Category & Best Seller */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 flex-wrap z-10">
            <span className="text-[11px] font-bold text-emerald-900 bg-white/95 backdrop-blur-md border border-emerald-200/90 px-2.5 py-0.5 rounded-lg shadow-2xs">
              {categoryName}
            </span>
            {product.isBestSeller && (
              <span className="text-[10px] font-bold text-amber-900 bg-amber-400/95 backdrop-blur-xs px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-2xs">
                <span className="material-symbols-outlined text-[13px] text-amber-950">
                  local_fire_department
                </span>
                <span>الأكثر طلباً</span>
              </span>
            )}
          </div>

          {/* Top Left: Product Code */}
          {product.code && (
            <span
              className="absolute top-2.5 left-2.5 text-[10px] font-mono font-bold text-slate-600 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs z-10"
              dir="ltr"
            >
              #{product.code}
            </span>
          )}

          {/* Product Image with Zoom Button */}
          <button
            type="button"
            onClick={() => onOpenGallery(product)}
            className="h-full w-full flex items-center justify-center cursor-pointer group/img focus:outline-none"
            title="انقر لتكبير صورة المنتج"
          >
            {displayImg ? (
              <img
                src={resolveImageUrl(displayImg)}
                alt={product.name}
                className="max-h-full max-w-[85%] object-contain drop-shadow-md transition-transform duration-500 group-hover/img:scale-108"
                loading="lazy"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-[36px]">
                  format_paint
                </span>
              </div>
            )}

            {/* Bottom Gallery Trigger Overlay */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 hover:bg-black/80 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold backdrop-blur-xs transition-colors shadow-xs">
              <span className="material-symbols-outlined text-[13px] text-amber-300">
                zoom_in
              </span>
              <span>
                {allImages.length > 1 ? `${allImages.length} صور` : 'تكبير'}
              </span>
            </div>
          </button>
        </div>

        {/* 2. PRODUCT IDENTITY & ATTRIBUTES */}
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight">
                {product.name}
              </h3>
              {currentPkg.note ? (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                  {currentPkg.note}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                  مط عالي الجودة
                </span>
              )}
            </div>

            {/* Concise Description with Toggle */}
            {product.description && (
              <div className="mt-1.5">
                <p
                  className={`text-xs text-slate-600 leading-relaxed transition-all ${
                    showFullDesc ? '' : 'line-clamp-2'
                  }`}
                >
                  {product.description}
                </p>
                {product.description.length > 90 && (
                  <button
                    type="button"
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 mt-0.5 inline-block cursor-pointer"
                  >
                    {showFullDesc ? 'عرض أقل ↑' : 'عرض المزيد ↓'}
                  </button>
                )}
              </div>
            )}

            {/* Key Feature Chips (Max 3 visible + remainder count) */}
            {featuresList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {featuresList.slice(0, 3).map((fName, fIdx) => (
                  <span
                    key={fIdx}
                    className="inline-flex items-center gap-1 text-[10px] text-slate-700 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md font-medium shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>{fName}</span>
                  </span>
                ))}
                {featuresList.length > 3 && (
                  <span
                    className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200"
                    title={featuresList.slice(3).join(' • ')}
                  >
                    +{featuresList.length - 3} أخرى
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 3. UNIFIED PACKAGES & VARIANT SELECTION (No More Disconnected Columns) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-emerald-700">
                  package_2
                </span>
                <span>الأحجام والأسعار:</span>
              </span>

              {packages.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowAllPackages(!showAllPackages)}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {showAllPackages ? 'view_carousel' : 'format_list_bulleted'}
                  </span>
                  <span>{showAllPackages ? 'تبويبات' : 'عرض القائمة'}</span>
                </button>
              )}
            </div>

            {/* MODE A: COMPACT TABS SELECTOR (Default, Ultra Clean & Fits on Mobile Screen) */}
            {!showAllPackages && (
              <div className="space-y-2.5">
                {/* Package Tabs Row */}
                <div
                  className={`grid gap-1.5 ${
                    packages.length === 1
                      ? 'grid-cols-1'
                      : packages.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {packages.map((pkg, idx) => {
                    const isSelected = activePkgIndex === idx
                    const icon = getUnitIcon(pkg.unitName, pkg.weight)
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPackageIndex(idx)}
                        className={`relative p-2 rounded-xl text-center transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#0B3B2C] text-white border-[#0B3B2C] shadow-sm ring-2 ring-[#0B3B2C]/20'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className={`material-symbols-outlined text-[14px] ${
                              isSelected ? 'text-emerald-300' : 'text-slate-500'
                            }`}
                          >
                            {icon}
                          </span>
                          <span className="text-xs font-bold truncate">
                            {pkg.unitName}
                          </span>
                        </div>

                        <div
                          className={`text-[10px] font-mono mt-0.5 ${
                            isSelected ? 'text-emerald-100 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          {pkg.weight || '—'}
                        </div>

                        <div
                          className={`text-xs font-black font-mono mt-1 ${
                            isSelected ? 'text-amber-300' : 'text-slate-900'
                          }`}
                        >
                          {formatNumber(pkg.price)}{' '}
                          <span className="text-[9px] font-normal">ج.م</span>
                        </div>

                        {isSelected && (
                          <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xs">
                            <span className="material-symbols-outlined text-[11px] font-black">
                              check
                            </span>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Selected Package Details Box (Colors + Price + Stepper + Order Button) */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 space-y-2.5">
                  {/* Colors Selector (if package has colors) */}
                  {currentHasColors && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-emerald-700">
                            palette
                          </span>
                          <span>اللون:</span>
                          <span className="text-emerald-950 font-black">
                            {currentColor?.name}
                          </span>
                        </span>
                        {currentColor?.price && currentColor.price > 0 ? (
                          <span className="text-[10px] text-amber-800 font-bold bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300">
                            + {formatNumber(currentColor.price)} ج.م
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {currentPkg.colors!.map((c, cIdx) => {
                          const isColorSelected = currentColorIndex === cIdx
                          const textColor = getContrastColor(c.hex)
                          return (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => handleSelectColor(activePkgIndex, cIdx)}
                              style={{
                                backgroundColor: c.hex || '#000000',
                                color: textColor,
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer border flex items-center gap-1 ${
                                isColorSelected
                                  ? 'ring-2 ring-emerald-600 scale-105 border-white shadow-xs'
                                  : 'border-black/15 opacity-85 hover:opacity-100 hover:scale-102'
                              }`}
                              title={c.name}
                            >
                              {isColorSelected && (
                                <span className="material-symbols-outlined text-[12px] font-black">
                                  check
                                </span>
                              )}
                              <span>{c.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions & Pricing Row */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 flex-wrap sm:flex-nowrap">
                    {/* Price with Discount */}
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                          {formatNumber(currentUnitPrice * currentQty)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          جنيه
                        </span>
                      </div>

                      {currentPkg.oldPrice && currentPkg.oldPrice > currentPkg.price ? (
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className="text-slate-400 line-through font-mono">
                            {formatNumber(currentPkg.oldPrice * currentQty)} ج.م
                          </span>
                          {currentPkg.discountPercent && currentPkg.discountPercent > 0 ? (
                            <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">
                              خصم {currentPkg.discountPercent}%
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {/* Stepper + Order Button */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs h-9">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(activePkgIndex, -1)}
                          className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-r-xl transition-colors cursor-pointer"
                          title="تقليل الكمية"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            remove
                          </span>
                        </button>
                        <span className="w-8 text-center text-xs font-bold font-mono text-slate-800">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(activePkgIndex, 1)}
                          className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-l-xl transition-colors cursor-pointer"
                          title="زيادة الكمية"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            add
                          </span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addToCart(
                            product,
                            activePkgIndex,
                            currentQty,
                            currentColor || undefined,
                          )
                        }
                        className="flex-1 sm:flex-initial h-9 px-3.5 rounded-xl bg-[#0B3B2C] hover:bg-[#07281e] active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          add_shopping_cart
                        </span>
                        <span>طلب العبوة</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODE B: ALL PACKAGES LIST VIEW (For users who prefer all packages visible at once) */}
            {showAllPackages && (
              <div className="space-y-2">
                {packages.map((pkg, idx) => {
                  const hasColors = Array.isArray(pkg.colors) && pkg.colors.length > 0
                  const colorIdx = selectedColorMap[idx] ?? 0
                  const selectedColor = hasColors ? pkg.colors![colorIdx] : undefined
                  const colorExtra = selectedColor?.price || 0
                  const unitPrice = pkg.price + colorExtra
                  const qty = quantityMap[idx] || 1
                  const icon = getUnitIcon(pkg.unitName, pkg.weight)

                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2"
                    >
                      {/* Package Name & Price Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-emerald-800">
                            {icon}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {pkg.unitName}
                          </span>
                          {pkg.weight && (
                            <span className="text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.2 rounded font-semibold">
                              {pkg.weight}
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-black font-mono text-slate-900">
                          {formatNumber(unitPrice * qty)}{' '}
                          <span className="text-[10px] font-normal text-slate-500">
                            ج.م
                          </span>
                        </div>
                      </div>

                      {/* Colors (if exists) */}
                      {hasColors && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {pkg.colors!.map((c, cIdx) => {
                            const isColorSelected = colorIdx === cIdx
                            const textColor = getContrastColor(c.hex)
                            return (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => handleSelectColor(idx, cIdx)}
                                style={{
                                  backgroundColor: c.hex || '#000000',
                                  color: textColor,
                                }}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all shadow-2xs cursor-pointer border flex items-center gap-0.5 ${
                                  isColorSelected
                                    ? 'ring-2 ring-emerald-600 scale-105 border-white'
                                    : 'border-black/15 opacity-80'
                                }`}
                                title={c.name}
                              >
                                {isColorSelected && (
                                  <span className="material-symbols-outlined text-[10px]">
                                    check
                                  </span>
                                )}
                                <span>{c.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Stepper + Order Button */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-2xs h-7">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, -1)}
                            className="w-6 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 rounded-r-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              remove
                            </span>
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono text-slate-800">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, 1)}
                            className="w-6 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 rounded-l-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              add
                            </span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            addToCart(product, idx, qty, selectedColor || undefined)
                          }
                          className="h-7 px-3 rounded-lg bg-[#0B3B2C] hover:bg-[#07281e] active:scale-95 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            add_shopping_cart
                          </span>
                          <span>طلب {pkg.unitName}</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. PROMOTIONAL GIFT OFFER (Clean Bottom Callout if attached) */}
      {giftName && (
        <div className="mx-4 mb-4 p-2.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl flex items-center gap-2.5 shadow-2xs">
          {giftImage ? (
            <img
              src={resolveImageUrl(giftImage)}
              alt={giftName}
              className="w-9 h-9 rounded-xl object-cover border border-amber-200/90 shadow-xs shrink-0 bg-white"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">
                featured_seasonal_and_gifts
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded font-sans">
                هدية مجانية
              </span>
              {giftWeight && (
                <span className="text-[9px] text-orange-800 font-mono">
                  ({giftWeight})
                </span>
              )}
            </div>
            <h5 className="text-[11px] font-bold text-amber-950 truncate mt-0.5">
              🎁 {giftName}
            </h5>
            {giftDescription && (
              <p className="text-[9px] text-amber-900/80 truncate">
                {giftDescription}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
