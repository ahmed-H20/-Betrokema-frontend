import { useState } from 'react'
import type { Product } from '@/api/products.schema'
import { formatNumber } from '@/lib/format'
import { resolveImageUrl } from '@/lib/image'
import { getUnitIcon } from '@/features/products/components/PricingFields'

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
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(
    product.colors && product.colors.length > 0 ? 0 : null,
  )

  const selectedColor =
    selectedColorIndex !== null && product.colors && product.colors[selectedColorIndex]
      ? product.colors[selectedColorIndex]
      : null
  const colorExtra = selectedColor?.price || 0

  // Build packages array, defaulting to standard paint packages if empty
  const packages =
    product.packages && product.packages.length > 0
      ? product.packages
      : [
          {
            unitName: 'بستلة كبيرة',
            price: 1520,
            oldPrice: 1650,
            discountPercent: 8,
            weight: '14 لتر',
            note: 'تغطية واسعة للمشاريع',
          },
          {
            unitName: 'جالون فردي',
            price: 450,
            oldPrice: 480,
            discountPercent: 6,
            weight: '3.75 لتر',
            note: 'للمساحات المحدودة',
          },
        ]

  const features = product.fetures || (product as any).features || [
    { name: 'تغطية فائقة' },
    { name: 'مقاوم للغسيل' },
  ]

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
      ? product.giftProduct.image || (product.giftProduct.images && product.giftProduct.images[0])
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

  return (
    <article
      key={product._id}
      className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-xs hover:shadow-md transition-all flex flex-col"
    >
      {/* 1. Card Top: Identity, Image, Description & Feature Chips */}
      <div className="p-3.5 sm:p-4 space-y-3">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200/70 px-2 py-0.5 rounded-lg">
              {categoryName}
            </span>
            {product.code && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                #{product.code}
              </span>
            )}
            {product.isBestSeller && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-amber-600">
                  local_fire_department
                </span>
                <span>الأكثر طلباً</span>
              </span>
            )}
          </div>
          {product.quantity > 0 ? (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>متوفر بالمستودع</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              حجز مسبق
            </span>
          )}
        </div>

        {/* Thumbnail + Details */}
        <div className="flex gap-3 items-start">
          {(() => {
            const allImages = [
              product.image,
              ...(product.images || []),
            ].filter((url): url is string => Boolean(url && url.trim() !== ''))
            const totalCount = allImages.length
            const displayImg = allImages[0] || ''

            return (
              <button
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 border border-slate-200/80 p-1.5 shrink-0 overflow-hidden cursor-pointer group text-start focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                onClick={() => onOpenGallery(product)}
                title="انقر لعرض صور المنتج بالحجم الكامل"
                type="button"
              >
                <img
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                  src={resolveImageUrl(displayImg)}
                />
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <div className="flex items-center gap-1 bg-white/95 text-slate-900 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-md backdrop-blur-xs">
                    <span className="material-symbols-outlined text-[13px] text-orange-600">
                      zoom_in
                    </span>
                    <span>
                      {totalCount > 1 ? `${totalCount} صور` : 'تكبير'}
                    </span>
                  </div>
                </div>
                {totalCount > 1 && (
                  <span className="absolute bottom-1 end-1 flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs shadow-xs">
                    <span className="material-symbols-outlined text-[11px] text-orange-400">
                      photo_library
                    </span>
                    <span>{totalCount}</span>
                  </span>
                )}
              </button>
            )
          })()}

          {/* Product Title & Text */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
              {product.description ||
                'دهان أكريليك مائي فائق الجودة يمتاز بقوة تغطية عالية ولمعان يدوم طويلاً ومقاوم للعوامل الجوية.'}
            </p>

            {/* Feature Chips */}
            {features && features.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {features.map((f, fIdx) => (
                  <span
                    key={fIdx}
                    className="inline-flex items-center gap-1 text-[10px] text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-md font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                    <span>{f.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colors Selector if product has colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-indigo-600">
                  palette
                </span>
                <span>درجة اللون المطلوبة:</span>
              </span>
              {selectedColor && (
                <span className="text-[11px] font-semibold text-slate-600">
                  {selectedColor.name}
                  {colorExtra > 0 ? (
                    <span className="text-orange-600 font-bold mr-1">
                      (+{formatNumber(colorExtra)} ج.م)
                    </span>
                  ) : (
                    <span className="text-emerald-600 mr-1">(سعر أساسي)</span>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {product.colors.map((c, cIdx) => {
                const isSelected = selectedColorIndex === cIdx
                return (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => setSelectedColorIndex(cIdx)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-orange-500 text-slate-900 shadow-xs ring-2 ring-orange-500/20 font-bold'
                        : 'bg-white/80 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                    title={`${c.name} ${c.price > 0 ? `(+${c.price} ج.م)` : ''}`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                      style={{ backgroundColor: c.hex || '#FFFFFF' }}
                    />
                    <span>{c.name}</span>
                    {c.price > 0 && (
                      <span className="text-[9px] text-orange-600 font-mono">
                        +{c.price}
                      </span>
                    )}
                    {isSelected && (
                      <span className="material-symbols-outlined text-[13px] text-orange-600">
                        check
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Promotional Gift Offer Banner */}
        {giftName && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl text-amber-950 shadow-2xs">
            {giftImage ? (
              <img
                src={resolveImageUrl(giftImage)}
                alt={giftName}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-amber-200/90 shadow-xs shrink-0 bg-white"
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
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full font-sans">
                  عرض خاص مجاني
                </span>
                {giftWeight && (
                  <span className="text-[10px] font-bold text-orange-800 bg-orange-100/90 px-2 py-0.5 rounded-full font-mono">
                    الوزن: {giftWeight}
                  </span>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950 mt-1 truncate">
                🎁 هدية مع هذا الصنف: {giftName}
              </h4>
              {giftDescription && (
                <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                  {giftDescription}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Card Bottom: Available Packages & Order Rows */}
      <div className="border-t border-slate-100 bg-slate-50/60 p-3 sm:p-3.5 space-y-2 mt-auto">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-0.5">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-orange-600">
              straighten
            </span>
            <span>العبوات والأسعار المتاحة:</span>
          </span>
          <span className="text-[10px] font-normal text-slate-400">
            {colorExtra > 0 ? `الأسعار تشمل +${formatNumber(colorExtra)} ج.م للون` : 'اختر الحجم للطلب المباشر'}
          </span>
        </div>

        <div className="space-y-1.5">
          {packages.map((pkg, pIdx) => {
            const finalPrice = pkg.price + colorExtra
            const finalOldPrice = pkg.oldPrice && pkg.oldPrice > pkg.price ? pkg.oldPrice + colorExtra : 0

            return (
              <div
                key={pIdx}
                className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 hover:border-orange-300 shadow-xs flex items-center justify-between gap-2.5 transition-all"
              >
                {/* Package Type & Weight */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      {getUnitIcon(pkg.unitName, pkg.weight)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {pkg.unitName}
                      </span>
                      {pkg.weight && (
                        <span className="font-semibold text-[10px] text-orange-700 bg-orange-50 border border-orange-200/60 px-1.5 py-0.2 rounded font-mono">
                          {pkg.weight}
                        </span>
                      )}
                    </div>
                    {pkg.note && (
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        {pkg.note}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Order Action Button */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-left font-mono">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {formatNumber(finalPrice)}{' '}
                      <span className="text-[10px] font-normal font-sans text-slate-500">
                        ج.م
                      </span>
                    </div>
                    {finalOldPrice > 0 && (
                      <span className="text-[9px] text-slate-400 line-through block">
                        {formatNumber(finalOldPrice)} ج.م
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(product, pIdx, 1, selectedColor || undefined)}
                    className="h-8 sm:h-9 px-3 rounded-xl bg-[#0c5966] hover:bg-[#08434d] active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-all shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      add_shopping_cart
                    </span>
                    <span>اطلب الآن</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </article>
  )
}
