import { useState, useMemo } from 'react'
import { useProducts } from '@/features/products/hooks'
import { useCategories } from '@/features/categories/hooks'
import { formatNumber } from '@/lib/format'
import { useClientCart } from './ClientCartContext'
import type { Category } from '@/api/categories.schema'
import type { Product } from '@/api/products.schema'
import { resolveImageUrl } from '@/lib/image'
import clientHeroImg from '@/assets/client-hero.jpg'
import { ClientProductImagesModal } from './components/ClientProductImagesModal'

export function ClientCatalogPage() {
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    page: 1,
    limit: 100,
  })
  const { data: categoriesData } = useCategories()
  const { addToCart } = useClientCart()

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)

  const products = productsData?.data || []
  const categories: Category[] = categoriesData?.data || []

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))

      const pCatId =
        typeof p.category === 'object' && p.category !== null
          ? p.category._id
          : p.category
      const matchesCategory =
        selectedCategory === 'all' || pCatId === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, search, selectedCategory])

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* 1. Brand Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white">
        <img
          src={clientHeroImg}
          alt="بتروكيما للدهانات - كل لون حكاية بيت"
          className="w-full h-auto aspect-[16/9] object-cover rounded-2xl block"
          loading="eager"
        />
      </section>

      {/* 2. Search Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم الدهان، كود الصنف، أو الاستخدام..."
          className="w-full pr-10 pl-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 shadow-xs placeholder:text-slate-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
          </button>
        )}
      </div>

      {/* 3. Category Filter Tabs Carousel */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-bold text-slate-900">تصنيفات الدهانات</h2>
          <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
            {categories.length} فئات معتمدة
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
              selectedCategory === 'all'
                ? 'bg-[#0b1c2d] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">apps</span>
            <span>جميع المنتجات ({products.length})</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setSelectedCategory(cat._id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all shadow-xs ${
                selectedCategory === cat._id
                  ? 'bg-[#0b1c2d] text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">format_paint</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Products Catalog Section */}
      <section className="space-y-3 pt-1">
        <div className="text-center mb-1">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            منتجات بتروكيما المعتمدة
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            أعلى معايير التغطية والمتانة المعمارية للواجهات والديكورات
          </p>
        </div>

        {isLoadingProducts ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
            جاري تحميل كتالوج المنتجات والأسعار المعتمدة...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
            <span className="material-symbols-outlined text-[36px] text-slate-300">
              format_paint
            </span>
            <p className="text-xs text-slate-600 font-bold">لا توجد منتجات مطابقة لبحثك</p>
            <p className="text-[11px] text-slate-400">
              جرب تغيير كلمة البحث أو اختيار تصنيف آخر
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const categoryName =
              typeof product.category === 'object' && product.category !== null
                ? product.category.name
                : 'دهانات عامة'

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
                        <span className="font-mono text-slate-500 text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg font-semibold">
                          {product.code}
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                      <span>★</span>
                      <span>{product.statusBadge || 'مطابق للمواصفات'}</span>
                    </span>
                  </div>

                  {/* Main Product Info (Image + Title & Description) */}
                  <div className="flex items-start gap-3">
                    {/* Product Image Frame */}
                    {(() => {
                      const hasImage = Boolean(
                        (product.image && product.image.trim()) ||
                        (product.images && product.images.length > 0),
                      )
                      const displayImg =
                        product.image || (product.images && product.images[0]) || ''
                      const totalCount =
                        (product.image ? 1 : 0) +
                        (product.images?.filter((img) => img !== product.image)
                          ?.length || 0)

                      if (!hasImage) {
                        return (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 p-2 flex items-center justify-center border border-slate-200/80 shadow-xs shrink-0 overflow-hidden">
                            <span className="material-symbols-outlined text-[36px] text-orange-500">
                              format_paint
                            </span>
                          </div>
                        )
                      }

                      return (
                        <button
                          className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 p-2 flex items-center justify-center border border-slate-200/80 shadow-xs shrink-0 overflow-hidden cursor-pointer hover:border-orange-500/60 hover:shadow-md transition-all active:scale-95"
                          onClick={() => setViewingProduct(product)}
                          title="انقر لعرض صور المنتج بالحجم الكامل"
                          type="button"
                        >
                          <img
                            alt={product.name}
                            className="w-full h-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                            src={resolveImageUrl(displayImg)}
                          />
                          {/* Hover magnifying overlay */}
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
                </div>

                {/* 2. Card Bottom: Available Packages & Order Rows */}
                <div className="border-t border-slate-100 bg-slate-50/60 p-3 sm:p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-orange-600">
                        straighten
                      </span>
                      <span>العبوات والأسعار المتاحة:</span>
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">
                      اختر الحجم للطلب المباشر
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {packages.map((pkg, pIdx) => (
                      <div
                        key={pIdx}
                        className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 hover:border-orange-300 shadow-xs flex items-center justify-between gap-2.5 transition-all"
                      >
                        {/* Package Type & Weight */}
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold shrink-0">
                            <span className="material-symbols-outlined text-[18px]">
                              {pkg.weight && (pkg.weight.includes('14') || pkg.weight.includes('16') || pkg.weight.includes('بستلة'))
                                ? 'nest_heat_link_e'
                                : 'format_paint'}
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
                              {formatNumber(pkg.price)}{' '}
                              <span className="text-[10px] font-normal font-sans text-slate-500">
                                ج.م
                              </span>
                            </div>
                            {pkg.oldPrice && pkg.oldPrice > pkg.price && (
                              <span className="text-[9px] text-slate-400 line-through block">
                                {formatNumber(pkg.oldPrice)} ج.م
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => addToCart(product, pIdx, 1)}
                            className="h-8 sm:h-9 px-3 rounded-xl bg-[#0c5966] hover:bg-[#08434d] active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-all shrink-0"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              add_shopping_cart
                            </span>
                            <span>اطلب الآن</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            )
          })
        )}
      </section>

      {/* 5. Value Propositions Section matching petrokema_client_mobile_1 */}
      <section className="bg-blue-50/60 rounded-2xl p-3.5 border border-blue-100/70 mt-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[16px]">layers</span>
            </div>
            <span className="text-[11px] font-bold text-slate-900">تغطية فائقة</span>
            <span className="text-[9px] text-slate-500">كثافة صبغية عالية</span>
          </div>

          <div className="flex flex-col items-center border-x border-blue-200/60">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </div>
            <span className="text-[11px] font-bold text-slate-900">ثبات طويل الأمد</span>
            <span className="text-[9px] text-slate-500">ضمان استقرار اللون</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[16px]">eco</span>
            </div>
            <span className="text-[11px] font-bold text-slate-900">صديق للبيئة</span>
            <span className="text-[9px] text-slate-500">منخفض الانبعاثات</span>
          </div>
        </div>
      </section>

      {/* Product Images Lightbox Modal */}
      <ClientProductImagesModal
        onOpenChange={(open) => {
          if (!open) setViewingProduct(null)
        }}
        open={Boolean(viewingProduct)}
        product={viewingProduct}
      />
    </div>
  )
}
