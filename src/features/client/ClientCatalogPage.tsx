import { useState, useMemo } from 'react'
import { useProducts } from '@/features/products/hooks'
import { useCategories } from '@/features/categories/hooks'
import { formatNumber } from '@/lib/format'
import { useClientCart } from './ClientCartContext'
import type { Category } from '@/api/categories.schema'

export function ClientCatalogPage() {
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    page: 1,
    limit: 100,
  })
  const { data: categoriesData } = useCategories()
  const { addToCart } = useClientCart()

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')

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
      {/* 1. Hero Banner matching petrokema_client_mobile_1 */}
      <section className="relative rounded-2xl overflow-hidden shadow-sm h-48 bg-slate-900 border border-slate-800">
        <img
          src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1000&auto=format&fit=crop"
          alt="دهانات فاخرة معمارية ديكورية"
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-0.5">
            منتجات معتمدة ومطابقة للمواصفات
          </span>
          <h1 className="text-2xl font-bold tracking-tight mb-1 text-white">
            لون يعبّر عنك
          </h1>
          <p className="text-xs font-normal text-slate-200">
            اكتشف دهانات وكيماويات عزل تناسب كل مشروع ومساحة معمارية.
          </p>
        </div>
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

            const features = product.fetures || [
              { name: 'تغطية فائقة' },
              { name: 'مقاوم للغسيل' },
            ]

            return (
              <article
                key={product._id}
                className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* 3-Column Header Bar with brand gradient accents matching petrokema_client_mobile_1 */}
                <div className="grid grid-cols-12 text-center text-xs font-bold text-white shadow-xs">
                  <div className="col-span-6 bg-[#4a1c1d] py-2 px-2 flex items-center justify-center gap-1.5 border-l border-white/20">
                    <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                    <span className="tracking-tight">تفاصيل المنتج</span>
                  </div>
                  <div className="col-span-3 bg-[#9b492d] py-2 px-1 flex items-center justify-center gap-1 border-l border-white/20">
                    <span className="material-symbols-outlined text-[15px]">straighten</span>
                    <span className="tracking-tight">العبوة / الحجم</span>
                  </div>
                  <div className="col-span-3 bg-[#0c5966] py-2 px-1 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">payments</span>
                    <span className="tracking-tight">السعر والطلب</span>
                  </div>
                </div>

                {/* 3-Column Content Body */}
                <div className="grid grid-cols-12 divide-x divide-x-reverse divide-slate-100">
                  {/* Column 1: Enhanced Product Presentation (Image, Hierarchy, Feature Pills) */}
                  <div className="col-span-6 p-2.5 flex flex-col justify-between bg-white text-right border-l border-slate-100">
                    <div>
                      {/* Product Title & Badge */}
                      <div className="flex items-start justify-between gap-1 pb-1 mb-1.5 border-b border-slate-100">
                        <div>
                          <span className="text-[9px] font-semibold text-[#0c5966] bg-blue-50/70 px-1.5 py-0.5 rounded">
                            {categoryName}
                          </span>
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight mt-0.5 leading-snug">
                            {product.name}
                          </h3>
                        </div>
                        <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-amber-200 shrink-0">
                          <span>★</span>
                          <span>{product.statusBadge || 'نصف لامع'}</span>
                        </span>
                      </div>

                      {/* Product Image & Description Layout */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2/5 h-24 rounded-lg bg-gradient-to-t from-slate-100 to-slate-50 p-1 flex items-center justify-center border border-slate-200 shadow-inner flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain rounded drop-shadow-xs"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-[32px] text-orange-600">
                              format_paint
                            </span>
                          )}
                        </div>
                        <div className="w-3/5 text-right flex flex-col justify-center">
                          <p className="text-[10px] text-slate-600 leading-relaxed font-normal mb-1.5 line-clamp-3">
                            {product.description ||
                              'دهان أكريليك مائي فائق الجودة يمتاز بقوة تغطية عالية ولمعان يدوم طويلاً ومقاوم للعوامل الجوية.'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {features.slice(0, 2).map((f, fIdx) => (
                              <span
                                key={fIdx}
                                className="text-[9px] text-[#0b1c2d] bg-slate-100 px-1.5 py-0.5 rounded font-medium"
                              >
                                {f.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Specification Badges */}
                    <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 text-[10px]">
                      <span className="flex-1 inline-flex items-center justify-center gap-1 bg-[#eaf1f8] text-[#1e3a5f] py-0.5 px-1 rounded-full font-medium text-[9px]">
                        <span className="material-symbols-outlined text-[12px]">home</span>
                        <span>داخلي / خارجي</span>
                      </span>
                      <span className="text-slate-500 text-[9px] font-mono shrink-0">
                        {product.code || 'PK-STD'}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Weights & Capacities */}
                  <div className="col-span-3 bg-white divide-y divide-slate-100 text-center flex flex-col justify-around text-xs">
                    {packages.map((pkg, pIdx) => (
                      <div
                        key={pIdx}
                        className={`p-2 flex-1 flex flex-col justify-center items-center ${
                          pIdx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 font-medium block mb-0.5">
                          {pkg.unitName}
                        </span>
                        <span className="font-bold text-[#0b1c2d] text-xs">
                          {pkg.weight || 'حجم قياسي'}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5 font-normal">
                          {pkg.note || 'تغطية معتمدة'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Column 3: Prices & Order Call to Action */}
                  <div className="col-span-3 bg-white divide-y divide-slate-100 text-center flex flex-col justify-around text-xs">
                    {packages.map((pkg, pIdx) => (
                      <div
                        key={pIdx}
                        className={`p-2 flex-1 flex flex-col justify-center items-center ${
                          pIdx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                      >
                        <span className="text-[9px] text-slate-400 font-medium">السعر</span>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 font-mono">
                          {formatNumber(pkg.price)}
                        </div>
                        <div className="text-[9px] text-slate-400 mb-1.5">ج.م</div>

                        <button
                          type="button"
                          onClick={() => addToCart(product, pIdx, 1)}
                          className="w-full bg-[#0c5966] hover:bg-[#08434d] active:scale-95 text-white text-[10px] font-semibold py-1.5 px-1.5 rounded-lg transition shadow-xs flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">add_shopping_cart</span>
                          <span>اطلب الآن</span>
                        </button>
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
    </div>
  )
}
