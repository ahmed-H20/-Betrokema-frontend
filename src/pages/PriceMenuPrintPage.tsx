import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAll as getAllProducts } from '@/api/products'
import type { Product } from '@/api/products.schema'
import { formatNumber } from '@/lib/format'

export function PriceMenuPrintPage() {

  // 1. Fetch live products from database
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['price-menu-products'],
    queryFn: () => getAllProducts({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  })

  const products: Product[] = useMemo(() => {
    return productsData?.data || []
  }, [productsData])

  // Helper to find product by partial name or code
  const findProduct = (keyword: string): Product | undefined => {
    const q = keyword.trim().toLowerCase()
    return products.find(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)),
    )
  }

  // Group specific products matching original template pages
  // Page 2: Wall & Decorative Paints
  const page2Products = useMemo(() => {
    const targets = ['20000', '15000', '700', '5050']
    const matched: Product[] = []
    targets.forEach((t) => {
      const p = findProduct(t)
      if (p && !matched.some((m) => m._id === p._id)) matched.push(p)
    })
    return matched
  }, [products])

  // Page 3: Sealers, Varnishes & Putties
  const page3Products = useMemo(() => {
    const targets = ['333', '444', 'ايكو', '100', 'بترو 500']
    const matched: Product[] = []
    targets.forEach((t) => {
      const p = findProduct(t)
      if (p && !matched.some((m) => m._id === p._id)) matched.push(p)
    })
    return matched
  }, [products])

  // Page 4: Industrial Enamels & Primers
  const page4Products = useMemo(() => {
    const targets = ['بريكس', 'كوت', 'سوبر ستار']
    const matched: Product[] = []
    targets.forEach((t) => {
      const p = findProduct(t)
      if (p && !matched.some((m) => m._id === p._id)) matched.push(p)
    })
    return matched
  }, [products])

  // Extra products not explicitly mapped to the main 4 template slots
  const extraProducts = useMemo(() => {
    const usedIds = new Set([
      ...page2Products.map((p) => p._id),
      ...page3Products.map((p) => p._id),
      ...page4Products.map((p) => p._id),
    ])
    return products.filter((p) => !usedIds.has(p._id))
  }, [products, page2Products, page3Products, page4Products])

  // 2. Set document title
  useEffect(() => {
    document.title = 'قائمة_أسعار_بتروكيما_2026'
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleClose = () => {
    window.close()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#002855] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-800">جاري سحب أحدث بيانات وأسعار المنتجات من السيستم...</p>
          <span className="text-xs text-slate-500">يتم إعداد منيو الأسعار فائق الدقة A4 للطباعة الرسمية</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">تعذر تحميل بيانات قائمة الأسعار</h2>
          <p className="text-xs text-slate-500">حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة مرة أخرى.</p>
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-slate-200/80 text-slate-900 print:bg-white print:min-h-0 print:p-0"
      style={{
        fontFamily: "'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      dir="rtl"
    >
      {/* Non-printable Sticky Control Bar */}
      <header className="sticky top-0 z-50 bg-[#002855] text-white border-b border-[#001f42] shadow-md print:hidden">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 font-bold">
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-white">منيو وقائمة أسعار شركة بتروكيما (2026)</h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                  محدثة مباشرة من النظام ({products.length} صنف)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                تصميم مطابق لكتالوج الشركة الرسمي · جاهز للحفظ بصيغة PDF أو الطباعة A4 المباشرة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="h-9 px-4 rounded-xl bg-[#E85D04] hover:bg-[#d05303] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>طباعة / حفظ كـ PDF</span>
            </button>

            <a
              href="/petrokema_price_list_2026.pdf"
              download="قائمة_أسعار_بتروكيما_2026.pdf"
              className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تنزيل نسخة PDF الأصلية المعتمدة"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              <span className="hidden sm:inline">تحميل PDF</span>
            </a>

            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="إغلاق النافذة"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dedicated Print Media Styles for Price Menu */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .price-menu-page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* Printable Sheet Viewport */}
      <main className="max-w-5xl mx-auto py-6 sm:py-8 px-2 flex flex-col items-center gap-8 print:p-0 print:m-0 print:gap-0 print:max-w-none">
        <div className="flex flex-col gap-8 print:gap-0 print:w-full">

          {/* ========================================================
              PAGE 1: Official Luxury Cover Sheet
             ======================================================== */}
          <div className="price-menu-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-[#0E332F] overflow-hidden rounded-md shadow-2xl print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
            {/* Background Graphic */}
            <img
              src="/price-menu/page_1.png"
              alt="غلاف قائمة أسعار بتروكيما 2026"
              className="w-full h-full object-cover object-top pointer-events-none select-none"
            />
          </div>

          {/* ========================================================
              PAGE 2: Wall & Decorative Paints
             ======================================================== */}
          <div className="price-menu-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white text-slate-900 overflow-hidden rounded-md shadow-2xl p-7 flex flex-col justify-between print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
            {/* Top Page Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col text-right">
                    <span className="text-base font-black text-[#002855] leading-tight">بتروكيما</span>
                    <span className="text-[10px] font-semibold text-[#00B4D8]">للدهانات</span>
                  </div>
                </div>

                {/* Center Title with decorative diamond dot */}
                <div className="flex items-center gap-2 text-center">
                  <div className="w-10 h-0.5 bg-[#002855]/30 rounded-full" />
                  <span className="text-2xl font-black text-[#002855] tracking-tight">قائمة أسعار</span>
                  <div className="w-2 h-2 rotate-45 bg-[#E85D04]" />
                  <div className="w-10 h-0.5 bg-[#002855]/30 rounded-full" />
                </div>

                <div className="text-left font-mono text-[11px] font-bold text-slate-400">
                  <span>2026 / 2027</span>
                </div>
              </div>

              {/* Table Column Headers Bar */}
              <div className="grid grid-cols-12 bg-[#0B3B36] text-white font-bold text-xs rounded-lg py-2 px-3 text-center shadow-xs">
                <div className="col-span-6 text-center">المنتج والمواصفات</div>
                <div className="col-span-3 text-center border-r border-[#1B524C]">الوزن والعبوة</div>
                <div className="col-span-3 text-center border-r border-[#1B524C]">السعر</div>
              </div>

              {/* Product Rows */}
              <div className="divide-y divide-dashed divide-slate-300 mt-1">
                {page2Products.map((p) => {
                  const packages = p.packages || []
                  return (
                    <div key={p._id} className="grid grid-cols-12 items-center py-2.5 px-2 gap-2 text-right">
                      {/* 1. Product Info & Image Column (Rightmost in RTL) */}
                      <div className="col-span-6 flex items-center justify-between gap-3 pl-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-black text-[#002855] leading-snug">{p.name}</h3>
                          <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed mt-0.5">
                            {p.description || 'دهان أكريليك مائي فائق الجودة للاستخدامات الداخلية والخارجية.'}
                          </p>
                          {/* Badges / Tags */}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-[9px] font-bold bg-[#0B3B36]/10 text-[#0B3B36] px-1.5 py-0.5 rounded border border-[#0B3B36]/20">
                              داخلي / خارجي
                            </span>
                            <span className="text-[9px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                              {p.fetures?.[0]?.name || 'فائق الجودة ومقاوم للغسيل'}
                            </span>
                          </div>
                        </div>

                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-20 h-20 object-contain shrink-0 drop-shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                            <span className="material-symbols-outlined text-3xl">format_paint</span>
                          </div>
                        )}
                      </div>

                      {/* 2. Weight Column (Center in RTL) */}
                      <div className="col-span-3 flex flex-col items-center justify-center gap-2 border-r border-slate-200 text-center">
                        {packages.map((pkg, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-md px-2 py-1">
                            <span className="material-symbols-outlined text-[15px] text-[#0B3B36]">
                              {pkg.unitName.includes('بستل') ? 'delete' : 'science'}
                            </span>
                            <div className="flex flex-col text-right">
                              <span className="text-[9px] text-slate-500 font-medium">وزن {pkg.unitName}</span>
                              <span className="font-mono text-xs font-bold text-slate-900">
                                {pkg.weight || 'حسب العبوة'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 3. Price Column (Leftmost in RTL) */}
                      <div className="col-span-3 flex flex-col items-center justify-center gap-1.5 text-center border-r border-slate-200">
                        {packages.map((pkg, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <span className="text-[10px] text-slate-500 font-medium">سعر {pkg.unitName}</span>
                            <div className="flex items-baseline gap-1">
                              <span className="font-mono text-base font-black text-[#002855]">
                                {formatNumber(pkg.price)}
                              </span>
                              <span className="text-[9px] text-slate-600 font-medium">ج.م</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Guarantee Strip (Matching PDF exactly) */}
            <div className="border-t border-slate-200 pt-3">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-700">
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>مقاومة عالية للإحتكاك والغسيل</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">eco</span>
                  <span>صديقة للبيئة خالية من المواد الضارة</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">format_paint</span>
                  <span>سهولة في التطبيق تغطية فائقة</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">stars</span>
                  <span>أعلى جودة نتائج تدوم طويلاً</span>
                </div>
              </div>
              <p className="text-[9px] text-center text-slate-400 font-medium mt-1.5">
                * جميع الأسعار بالجنيه المصري وشاملة ضريبة القيمة المضافة (14%) الرسمية
              </p>
            </div>
          </div>

          {/* ========================================================
              PAGE 3: Sealers, Varnishes & Putties
             ======================================================== */}
          <div className="price-menu-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white text-slate-900 overflow-hidden rounded-md shadow-2xl p-7 flex flex-col justify-between print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
            {/* Top Page Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col text-right">
                    <span className="text-base font-black text-[#002855] leading-tight">بتروكيما</span>
                    <span className="text-[10px] font-semibold text-[#00B4D8]">للدهانات</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-center">
                  <div className="w-10 h-0.5 bg-[#002855]/30 rounded-full" />
                  <span className="text-2xl font-black text-[#002855] tracking-tight">قائمة أسعار</span>
                  <div className="w-2 h-2 rotate-45 bg-[#E85D04]" />
                  <div className="w-10 h-0.5 bg-[#002855]/30 rounded-full" />
                </div>

                <div className="text-left font-mono text-[11px] font-bold text-slate-400">
                  <span>السيلر والمعجون والورنيش</span>
                </div>
              </div>

              {/* Table Column Headers Bar */}
              <div className="grid grid-cols-12 bg-[#0B3B36] text-white font-bold text-xs rounded-lg py-2 px-3 text-center shadow-xs">
                <div className="col-span-6 text-center">المنتج والمواصفات</div>
                <div className="col-span-3 text-center border-r border-[#1B524C]">الوزن والعبوة</div>
                <div className="col-span-3 text-center border-r border-[#1B524C]">السعر</div>
              </div>

              {/* Product Rows */}
              <div className="divide-y divide-dashed divide-slate-300 mt-1">
                {page3Products.map((p) => {
                  const packages = p.packages || []
                  return (
                    <div key={p._id} className="grid grid-cols-12 items-center py-2 px-2 gap-2 text-right">
                      {/* 1. Product Info & Image Column */}
                      <div className="col-span-6 flex items-center justify-between gap-3 pl-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-[#002855] leading-snug">{p.name}</h3>
                          <p className="text-[9px] text-slate-600 line-clamp-2 leading-relaxed mt-0.5">
                            {p.description || 'معجون وسيلر عالي الجودة للتشطيب والتأسيس.'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[8px] font-bold bg-[#0B3B36]/10 text-[#0B3B36] px-1.5 py-0.5 rounded border border-[#0B3B36]/20">
                              داخلي / خارجي
                            </span>
                            <span className="text-[8px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                              جاهز للاستعمال
                            </span>
                          </div>
                        </div>

                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-16 h-16 object-contain shrink-0 drop-shadow-md"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                            <span className="material-symbols-outlined text-2xl">format_paint</span>
                          </div>
                        )}
                      </div>

                      {/* 2. Weight Column */}
                      <div className="col-span-3 flex flex-col items-center justify-center gap-1.5 border-r border-slate-200 text-center">
                        {packages.map((pkg, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-md px-2 py-0.5">
                            <span className="material-symbols-outlined text-[14px] text-[#0B3B36]">
                              {pkg.unitName.includes('شكار') ? 'shopping_bag' : 'science'}
                            </span>
                            <div className="flex flex-col text-right">
                              <span className="text-[8px] text-slate-500 font-medium">{pkg.unitName}</span>
                              <span className="font-mono text-[11px] font-bold text-slate-900">
                                {pkg.weight || 'حسب العبوة'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 3. Price Column */}
                      <div className="col-span-3 flex flex-col items-center justify-center gap-1 text-center border-r border-slate-200">
                        {packages.map((pkg, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <span className="text-[9px] text-slate-500">سعر {pkg.unitName}</span>
                            <div className="flex items-baseline gap-1">
                              <span className="font-mono text-sm font-black text-[#002855]">
                                {formatNumber(pkg.price)}
                              </span>
                              <span className="text-[9px] text-slate-600 font-medium">ج.م</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Guarantee Strip */}
            <div className="border-t border-slate-200 pt-3">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-700">
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>مقاومة عالية للإحتكاك والغسيل</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">eco</span>
                  <span>صديقة للبيئة خالية من المواد الضارة</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">format_paint</span>
                  <span>سهولة في التطبيق تغطية فائقة</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">stars</span>
                  <span>أعلى جودة نتائج تدوم طويلاً</span>
                </div>
              </div>
              <p className="text-[9px] text-center text-slate-400 font-medium mt-1.5">
                * جميع الأسعار بالجنيه المصري وشاملة ضريبة القيمة المضافة (14%) الرسمية
              </p>
            </div>
          </div>

          {/* ========================================================
              PAGE 4: Industrial Enamels & Multi-Variant Tables
             ======================================================== */}
          <div className="price-menu-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white text-slate-900 overflow-hidden rounded-md shadow-2xl p-7 flex flex-col justify-between print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
            {/* Top Page Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col text-right">
                    <span className="text-base font-black text-[#002855] leading-tight">بتروكيما</span>
                    <span className="text-[10px] font-semibold text-[#00B4D8]">للدهانات</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-center">
                  <div className="w-10 h-0.5 bg-[#002855]/30 rounded-full" />
                  <span className="text-2xl font-black text-[#002855] tracking-tight">قائمة أسعار</span>
                  <div className="w-2 h-2 rotate-45 bg-[#E85D04]" />
                  <div className="w-10 h-0.5 bg-[#002855]/30 rounded-full" />
                </div>

                <div className="text-left font-mono text-[11px] font-bold text-slate-400">
                  <span>اللاكيهات والدهانات الصناعية</span>
                </div>
              </div>

              {/* Multi-variant Table Section (برايمر بريكس، كيما كوت 500، سوبر ستار) */}
              <div className="space-y-3">
                {page4Products.map((p, pIdx) => {
                  const packages = p.packages || []
                  // Brand color theme for variant headers
                  const themeColors = [
                    { bg: 'bg-[#8B0000]', text: 'text-white' }, // برايمر بريكس
                    { bg: 'bg-[#B8860B]', text: 'text-white' }, // كيما كوت
                    { bg: 'bg-[#556B2F]', text: 'text-white' }, // سوبر ستار
                  ][pIdx % 3]

                  return (
                    <div key={p._id} className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                      {/* Product Section Bar */}
                      <div className={`${themeColors.bg} ${themeColors.text} px-3 py-1.5 flex items-center justify-between`}>
                        <h4 className="font-bold text-xs">{p.name}</h4>
                        <span className="text-[10px] opacity-90">
                          {typeof p.category === 'object' && p.category !== null
                            ? p.category.name
                            : (p.category || 'دهان صناعي واقي')}
                        </span>
                      </div>

                      {/* Content Grid: Table + Product Image */}
                      <div className="grid grid-cols-12 p-2 gap-3 items-center bg-white">
                        {/* Breakdown Table */}
                        <div className="col-span-8">
                          <table className="w-full text-[10px] text-right">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                              <tr>
                                <th className="py-1 px-1 text-center w-6">م</th>
                                <th className="py-1 px-2">المنتج / النوع</th>
                                <th className="py-1 px-2 text-center">الوزن</th>
                                <th className="py-1 px-2 text-left">سعر العبوة</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {packages.slice(0, 10).map((pkg, idx) => (
                                <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                                  <td className="py-0.5 px-1 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                                  <td className="py-0.5 px-2 font-medium text-slate-800 truncate max-w-[150px]">{pkg.unitName}</td>
                                  <td className="py-0.5 px-2 text-center font-mono text-slate-600">{pkg.weight || '—'}</td>
                                  <td className="py-0.5 px-2 text-left font-mono font-bold text-[#002855]">
                                    {formatNumber(pkg.price)} ج.م
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Product Tin Graphic & Color variants */}
                        <div className="col-span-4 flex flex-col items-center justify-center border-r border-slate-100 pr-2">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-20 h-20 object-contain drop-shadow-md"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined text-2xl">format_paint</span>
                            </div>
                          )}
                          <span className="text-[9px] font-bold text-slate-600 mt-1">متوفر للألوان:</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-3 h-3 rounded-full bg-red-600 border border-slate-300 shadow-2xs" title="أحمر" />
                            <span className="w-3 h-3 rounded-full bg-slate-400 border border-slate-300 shadow-2xs" title="رصاصي" />
                            <span className="w-3 h-3 rounded-full bg-white border border-slate-400 shadow-2xs" title="أبيض" />
                            <span className="w-3 h-3 rounded-full bg-amber-500 border border-slate-300 shadow-2xs" title="ألوان" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Guarantee Strip */}
            <div className="border-t border-slate-200 pt-3">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-700">
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>مقاومة عالية للإحتكاك والغسيل</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">eco</span>
                  <span>صديقة للبيئة خالية من المواد الضارة</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">format_paint</span>
                  <span>سهولة في التطبيق تغطية فائقة</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">stars</span>
                  <span>أعلى جودة نتائج تدوم طويلاً</span>
                </div>
              </div>
              <p className="text-[9px] text-center text-slate-400 font-medium mt-1.5">
                * جميع الأسعار بالجنيه المصري وشاملة ضريبة القيمة المضافة (14%) الرسمية
              </p>
            </div>
          </div>

          {/* ========================================================
              PAGE 5+ (Optional): Any Extra Dynamic Products
             ======================================================== */}
          {extraProducts.length > 0 && (
            <div className="price-menu-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white text-slate-900 overflow-hidden rounded-md shadow-2xl p-7 flex flex-col justify-between print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                    <span className="text-base font-black text-[#002855]">بتروكيما للدهانات</span>
                  </div>
                  <span className="text-2xl font-black text-[#002855]">• قائمة أسعار إضافية •</span>
                  <span className="text-xs font-mono text-slate-400">منتجات حديثة</span>
                </div>

                <div className="grid grid-cols-12 bg-[#0B3B36] text-white font-bold text-xs rounded-lg py-2 px-3 text-center shadow-xs">
                  <div className="col-span-3 text-center">السعر</div>
                  <div className="col-span-3 text-center border-r border-[#1B524C]">الوزن والعبوة</div>
                  <div className="col-span-6 text-center border-r border-[#1B524C]">المنتج والمواصفات</div>
                </div>

                <div className="divide-y divide-slate-200 mt-1">
                  {extraProducts.map((p) => {
                    const packages = p.packages || []
                    return (
                      <div key={p._id} className="grid grid-cols-12 items-center py-2 px-2 gap-2 text-right">
                        <div className="col-span-3 flex flex-col items-center justify-center gap-1 text-center">
                          {packages.map((pkg, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <span className="text-[9px] text-slate-500">سعر {pkg.unitName}</span>
                              <span className="font-mono text-sm font-black text-[#002855]">{formatNumber(pkg.price)} ج.م</span>
                            </div>
                          ))}
                        </div>
                        <div className="col-span-3 flex flex-col items-center justify-center gap-1.5 border-r border-slate-100 text-center">
                          {packages.map((pkg, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-bold">
                              {pkg.weight || pkg.unitName}
                            </div>
                          ))}
                        </div>
                        <div className="col-span-6 flex items-center gap-3 border-r border-slate-100 pr-2">
                          {p.image && <img src={p.image} alt={p.name} className="w-14 h-14 object-contain shrink-0" />}
                          <div>
                            <h3 className="text-sm font-black text-[#002855]">{p.name}</h3>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{p.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p className="text-[10px] text-center text-slate-500 font-bold">
                  شركة بتروكيما للصناعات الكيماوية والدهانات الحديثة · طريق مصر إسماعيلية الصحراوي
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
