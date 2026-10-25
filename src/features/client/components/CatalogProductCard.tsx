import { useState } from 'react'
import type { Product } from '@/api/products.schema'
import { formatNumber } from '@/lib/format'
import { resolveImageUrl } from '@/lib/image'
import { getContrastColor } from '@/features/products/components/PricingFields'

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
  // State to track selected color per package index (defaults to first color if package has colors)
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

  const handleSelectColor = (pkgIndex: number, colorIndex: number) => {
    setSelectedColorMap((prev) => ({
      ...prev,
      [pkgIndex]: colorIndex,
    }))
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

  return (
    <article
      key={product._id}
      className="group rounded-3xl border-2 border-[#0B3B2C]/90 bg-white shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden relative"
      dir="rtl"
    >
      {/* 4-Column Brochure Layout matching Petrochema Official Design */}
      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-200/90 items-stretch">
        {/* COLUMN 1 (Left): Prices (سعر البستلة، سعر الجالون، سعر الجالون الألوان) */}
        <div className="md:col-span-3 p-4 sm:p-5 flex flex-col justify-between bg-slate-50/50 text-center">
          {/* Header Icon */}
          <div className="flex flex-col items-center justify-center pb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-2xs border border-emerald-100">
              <span className="material-symbols-outlined text-[24px]">
                payments
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              قائمة الأسعار
            </span>
          </div>

          {/* Packages Price Rows */}
          <div className="flex-1 flex flex-col justify-around py-1 space-y-4">
            {packages.map((pkg, idx) => {
              const hasColors = Array.isArray(pkg.colors) && pkg.colors.length > 0
              const selectedColorIndex = selectedColorMap[idx] ?? 0
              const selectedColor = hasColors
                ? pkg.colors![selectedColorIndex]
                : undefined
              const isLast = idx === packages.length - 1

              return (
                <div key={idx} className="space-y-1">
                  {/* Package Price Label */}
                  <div className="text-xs sm:text-sm font-bold text-slate-800">
                    سعر {pkg.unitName}
                  </div>

                  {/* If package has colors, render color dots right below the title */}
                  {hasColors && (
                    <div className="flex items-center justify-center gap-1.5 py-0.5">
                      {pkg.colors!.map((c, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleSelectColor(idx, cIdx)}
                          style={{ backgroundColor: c.hex || '#000000' }}
                          className={`w-4 h-4 rounded-full border shadow-2xs transition-all cursor-pointer ${
                            selectedColorIndex === cIdx
                              ? 'ring-2 ring-emerald-600 scale-125 border-white'
                              : 'border-slate-300 opacity-80 hover:opacity-100'
                          }`}
                          title={`اختيار ${c.name}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Price Value */}
                  <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {formatNumber(pkg.price)}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">
                    جنيه مصري
                  </div>

                  {/* Old price if discount */}
                  {pkg.oldPrice && pkg.oldPrice > pkg.price ? (
                    <div className="text-[10px] text-slate-400 line-through font-mono">
                      {formatNumber(pkg.oldPrice)} ج.م
                    </div>
                  ) : null}

                  {/* Direct Add to Cart / Order Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        addToCart(product, idx, 1, selectedColor || undefined)
                      }
                      className="w-full max-w-[130px] mx-auto h-8 rounded-xl bg-[#0B3B2C] hover:bg-[#07281e] active:scale-95 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        add_shopping_cart
                      </span>
                      <span>طلب العبوة</span>
                    </button>
                  </div>

                  {/* Dotted separator between packages */}
                  {!isLast && (
                    <div className="border-b-2 border-dotted border-slate-300/80 pt-3 w-4/5 mx-auto" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* COLUMN 2 (Middle-Left): Weights & Colors (وزن البستلة، وزن الجالون، وزن الجالون الألوان) */}
        <div className="md:col-span-3 p-4 sm:p-5 flex flex-col justify-between bg-white text-center">
          {/* Header Icon */}
          <div className="flex flex-col items-center justify-center pb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shadow-2xs border border-blue-100">
              <span className="material-symbols-outlined text-[24px]">
                nest_heat_link_e
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              الأوزان والأحجام
            </span>
          </div>

          {/* Packages Weight Rows */}
          <div className="flex-1 flex flex-col justify-around py-1 space-y-4">
            {packages.map((pkg, idx) => {
              const hasColors = Array.isArray(pkg.colors) && pkg.colors.length > 0
              const selectedColorIndex = selectedColorMap[idx] ?? 0
              const isLast = idx === packages.length - 1

              return (
                <div key={idx} className="space-y-1">
                  {/* Package Weight Label */}
                  <div className="text-xs sm:text-sm font-bold text-slate-800">
                    وزن {pkg.unitName}
                  </div>

                  {/* Weight Value */}
                  <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {pkg.weight || '—'}
                  </div>

                  {/* Colored Badges matching brochure: [نبيتي] [أسود] */}
                  {hasColors && (
                    <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                      {pkg.colors!.map((c, cIdx) => {
                        const isSelected = selectedColorIndex === cIdx
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
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer border border-black/10 ${
                              isSelected
                                ? 'ring-2 ring-emerald-600 scale-105 shadow-md'
                                : 'opacity-90 hover:opacity-100 hover:scale-102'
                            }`}
                            title={`اختيار ${c.name}`}
                          >
                            {c.name}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Note / Subtitle if exists and no colors */}
                  {!hasColors && pkg.note && (
                    <div className="text-[11px] text-slate-400 font-medium">
                      {pkg.note}
                    </div>
                  )}

                  {/* Dotted separator between packages */}
                  {!isLast && (
                    <div className="border-b-2 border-dotted border-slate-300/80 pt-3 w-4/5 mx-auto" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* COLUMN 3 (Middle-Right): Product Info & Specifications */}
        <div className="md:col-span-3 p-4 sm:p-5 flex flex-col justify-between text-start bg-slate-50/30">
          <div>
            {/* Category and Code */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg">
                {categoryName}
              </span>
              {product.code && (
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  #{product.code}
                </span>
              )}
              {product.isBestSeller && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px] text-amber-600">
                    local_fire_department
                  </span>
                  <span>الأكثر طلباً</span>
                </span>
              )}
            </div>

            {/* Product Title */}
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h3>

            {/* Finish Badge & Subtitle */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-white bg-[#0B3B2C] px-3 py-0.5 rounded-full shadow-2xs">
                مط عالي الجودة
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed mt-2.5 line-clamp-4">
              {product.description ||
                `${product.name} هو دهان بلاستيك فائق الجودة مصنع من أجود أنواع الأكريليك بوليمر ومواد أخرى عديدة تمنحه خصائص فريدة من نوعها.`}
            </p>

            {/* Feature Chips */}
            {featuresList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {featuresList.map((fName, fIdx) => (
                  <span
                    key={fIdx}
                    className="inline-flex items-center gap-1 text-[10px] text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-semibold shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>{fName}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Promotional Gift Offer Banner if attached */}
          {giftName && (
            <div className="mt-4 p-2.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl flex items-center gap-2.5 shadow-2xs">
              {giftImage ? (
                <img
                  src={resolveImageUrl(giftImage)}
                  alt={giftName}
                  className="w-10 h-10 rounded-xl object-cover border border-amber-200/90 shadow-xs shrink-0 bg-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">
                    featured_seasonal_and_gifts
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded font-sans">
                  هدية مجانية
                </span>
                <h5 className="text-[11px] font-bold text-amber-950 truncate mt-0.5">
                  🎁 {giftName}
                </h5>
                {giftWeight && (
                  <span className="text-[9px] text-orange-800 font-mono block">
                    الوزن: {giftWeight}
                  </span>
                )}
                {giftDescription && (
                  <p className="text-[9px] text-amber-900/80 truncate mt-0.5">
                    {giftDescription}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 4 (Right): Product Image (صورة المنتج مع الجالون والبستلة) */}
        <div className="md:col-span-3 p-4 sm:p-5 flex flex-col items-center justify-center bg-white relative">
          <button
            type="button"
            onClick={() => onOpenGallery(product)}
            className="relative w-full aspect-square max-w-[220px] rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/50 border border-slate-200/80 p-3 overflow-hidden cursor-pointer group/img text-start focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            title="انقر لعرض صور المنتج بالحجم الكامل"
          >
            <img
              src={resolveImageUrl(displayImg)}
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 group-hover/img:scale-110"
            />
            {/* Zoom overlay */}
            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <div className="flex items-center gap-1 bg-white/95 text-slate-900 rounded-full px-2.5 py-1 text-xs font-bold shadow-md backdrop-blur-xs">
                <span className="material-symbols-outlined text-[15px] text-emerald-700">
                  zoom_in
                </span>
                <span>
                  {allImages.length > 1
                    ? `${allImages.length} صور`
                    : 'عرض بالحجم الكامل'}
                </span>
              </div>
            </div>
            {allImages.length > 1 && (
              <span className="absolute bottom-2 end-2 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs shadow-xs">
                <span className="material-symbols-outlined text-[12px] text-amber-400">
                  photo_library
                </span>
                <span>{allImages.length}</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
