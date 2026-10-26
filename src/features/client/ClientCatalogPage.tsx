import { useState, useMemo } from 'react'
import { useProducts } from '@/features/products/hooks'
import { useCategories } from '@/features/categories/hooks'
import { useClientCart } from './ClientCartContext'
import type { Category } from '@/api/categories.schema'
import type { Product } from '@/api/products.schema'
import clientHeroImg from '@/assets/client-hero.jpg'
import { ClientProductImagesModal } from './components/ClientProductImagesModal'
import { CatalogProductCard } from './components/CatalogProductCard'

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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
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
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {filteredProducts.map((product) => {
              const categoryName =
                typeof product.category === 'object' && product.category !== null
                  ? product.category.name
                  : 'دهانات عامة'

              return (
                <CatalogProductCard
                  key={product._id}
                  product={product}
                  categoryName={categoryName}
                  onOpenGallery={setViewingProduct}
                  addToCart={addToCart}
                />
              )
            })}
          </div>
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
