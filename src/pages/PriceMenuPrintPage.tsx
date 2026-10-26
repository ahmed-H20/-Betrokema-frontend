import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAll as getAllProducts } from '@/api/products'
import type { Product } from '@/api/products.schema'
import { formatNumber } from '@/lib/format'

// ==========================================
// Vector Icons Matching PDF Template 100%
// ==========================================

const BucketSvg = () => (
  <svg className="w-5 h-5 text-[#0D3833] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8l1.5 11.5a2 2 0 0 0 2 1.5h9a2 2 0 0 0 2-1.5L20 8" />
    <path d="M3 8h18" />
    <path d="M8 8V6a4 4 0 0 1 8 0v2" />
  </svg>
)

const SackSvg = () => (
  <svg className="w-5 h-5 text-[#0D3833] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l2-5h8l2 5v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" />
    <path d="M9 4v2m6-2v2" />
  </svg>
)

const CoinSvg = () => (
  <svg className="w-5 h-5 text-[#0D3833] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2 2-2 3.5m0 0a1 1 0 0 0 2 1h-2" />
  </svg>
)

const HouseSvg = () => (
  <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20v-9.5z" />
  </svg>
)

const SparkleSvg = () => (
  <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2l2.4 5.6L20 10l-4.5 4.4L16.8 20 12 16.8 7.2 20l1.3-5.6L4 10l5.6-2.4L12 2z" />
  </svg>
)

const ShieldSvg = () => (
  <svg className="w-5 h-5 text-slate-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const LeafSvg = () => (
  <svg className="w-5 h-5 text-slate-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 21 2c-.5 4-1 6.5-2.1 12.2A7 7 0 0 1 11 20z" />
    <path d="M2 21c0-4 3.5-7.5 7.5-7.5" />
  </svg>
)

const RollerSvg = () => (
  <svg className="w-5 h-5 text-slate-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="3" width="16" height="5" rx="1.5" />
    <path d="M20 5.5h2a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H13v6a1.5 1.5 0 0 1-3 0v-6H8" />
  </svg>
)

const StarMedalSvg = () => (
  <svg className="w-5 h-5 text-slate-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="6" />
    <path d="M8.2 13.5L7 22l5-3 5 3-1.2-8.5" />
  </svg>
)

export function PriceMenuPrintPage() {
  // Format today's date in day/month/year format
  const [releaseDate, setReleaseDate] = useState(() => {
    const d = new Date()
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  })

  // 1. Fetch live products from database
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['price-menu-products'],
    queryFn: () => getAllProducts({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  })

  const products: Product[] = useMemo(() => {
    return productsData?.data || []
  }, [productsData])

  // Helper to find product by keyword
  const findProduct = (keyword: string): Product | undefined => {
    const q = keyword.trim().toLowerCase()
    return products.find(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)),
    )
  }

  // Exact matching for Page 2 (Wall & Decor Paints)
  const p20000 = useMemo(() => findProduct('20000'), [products])
  const p15000 = useMemo(() => findProduct('15000'), [products])
  const p700 = useMemo(() => findProduct('700'), [products])
  const p5050 = useMemo(() => findProduct('5050'), [products])

  // Exact matching for Page 3 (Sealers, Varnishes, Putties)
  const p333 = useMemo(() => findProduct('333'), [products])
  const p444 = useMemo(() => findProduct('444'), [products])
  const pEco = useMemo(() => findProduct('ايكو'), [products])
  const p100 = useMemo(() => findProduct('100'), [products])
  const p500 = useMemo(() => findProduct('بترو 500') || findProduct('500'), [products])

  // Exact matching for Page 4 (Industrial Primers & Enamels)
  const pBrex = useMemo(() => findProduct('بريكس'), [products])
  const pKemaCoat = useMemo(() => findProduct('كوت'), [products])
  const pSuperStar = useMemo(() => findProduct('سوبر ستار'), [products])

  // Extra dynamic products not covered by original template
  const extraProducts = useMemo(() => {
    const usedIds = new Set(
      [p20000, p15000, p700, p5050, p333, p444, pEco, p100, p500, pBrex, pKemaCoat, pSuperStar]
        .filter(Boolean)
        .map((p) => p?._id),
    )
    return products.filter((p) => !usedIds.has(p._id))
  }, [products, p20000, p15000, p700, p5050, p333, p444, pEco, p100, p500, pBrex, pKemaCoat, pSuperStar])

  // Document title
  useEffect(() => {
    document.title = `قائمة_أسعار_بتروكيما_${releaseDate.replace(/\//g, '-')}`
  }, [releaseDate])

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
          <div className="w-12 h-12 border-4 border-[#0D3833] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-800">جاري سحب أحدث بيانات وأسعار المنتجات من السيستم...</p>
          <span className="text-xs text-slate-500">يتم إعداد منيو وقائمة الأسعار الرسمية للطباعة</span>
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
      className="min-h-screen bg-slate-200/90 text-slate-900 print:bg-white print:min-h-0 print:p-0"
      style={{
        fontFamily: "'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      dir="rtl"
    >
      {/* Sticky Non-Printable Header */}
      <header className="sticky top-0 z-50 bg-[#0D3833] text-white border-b border-[#082622] shadow-md print:hidden">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 font-bold">
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-white">منيو وقائمة أسعار شركة بتروكيما</h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                  محدثة مباشرة من النظام ({products.length} صنف)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                تصميم مطابق لكتالوج الشركة الرسمي · جاهز للحفظ بصيغة PDF أو الطباعة A4 المباشرة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Date Control */}
            <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/10">
              <span className="text-[11px] text-slate-300 font-medium">تاريخ الإصدار:</span>
              <input
                type="text"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-24 bg-white text-slate-900 text-xs font-bold font-mono px-1.5 py-0.5 rounded text-center border-none focus:outline-none focus:ring-1 focus:ring-amber-400"
                title="تعديل تاريخ الإصدار الظاهر على الغلاف وقائمة الأسعار"
              />
            </div>

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
              title="تنزيل نسخة PDF الأصلية"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              <span className="hidden sm:inline">تحميل PDF الأصلي</span>
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

      {/* Global Print Media Rules for Pixel-Perfect A4 Pages */}
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
            padding: 10mm 12mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          .price-menu-page.cover-page {
            padding: 0 !important;
          }
          .price-menu-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

      {/* Main Viewport Container */}
      <main className="max-w-5xl mx-auto py-6 sm:py-8 px-2 flex flex-col items-center gap-8 print:p-0 print:m-0 print:gap-0 print:max-w-none">
        <div className="flex flex-col gap-8 print:gap-0 print:w-full">

          {/* ========================================================
              PAGE 1: Official Luxury Cover Sheet with Dynamic Date
             ======================================================== */}
          <div className="price-menu-page cover-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-[#0E332F] overflow-hidden rounded-md shadow-2xl print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
            {/* Background Graphic */}
            <img
              src="/price-menu/page_1.png"
              alt="غلاف قائمة أسعار بتروكيما"
              className="w-full h-full object-cover object-top pointer-events-none select-none"
            />

            {/* Live Dynamic Date rendered directly inside the original 3D metallic gold pill badge */}
            <div
              className="absolute flex items-center justify-center font-bold text-white select-none pointer-events-none"
              style={{
                left: '150px',
                top: '447px',
                width: '205px',
                height: '46px',
                fontSize: '25px',
                fontFamily: "'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '0.5px',
                fontWeight: 900,
                textShadow: '0 2px 4px rgba(0,0,0,0.4)',
              }}
              dir="ltr"
            >
              {releaseDate}
            </div>
          </div>

          {/* ========================================================
              PAGE 2: Wall & Decorative Paints (Exact CSS Carbon Copy)
             ======================================================== */}
          <div className="price-menu-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white text-slate-900 overflow-hidden rounded-md shadow-2xl p-6 flex flex-col justify-between print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
            {/* Page Header */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-2">
                {/* Right: Brand Logo */}
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col text-right">
                    <span className="text-base font-black text-[#0D3833] leading-tight">بتروكيما</span>
                    <span className="text-[10px] font-bold text-[#00B4D8]">للدهانات</span>
                  </div>
                </div>

                {/* Center: Title with Decorative Rule */}
                <div className="flex items-center gap-2 text-center">
                  <div className="w-12 h-[2px] bg-[#0D3833]" />
                  <span className="text-2xl font-black text-[#0D3833] tracking-tight">قائمة أسعار</span>
                  <div className="w-2.5 h-2.5 rotate-45 bg-[#E85D04]" />
                  <div className="w-12 h-[2px] bg-[#0D3833]" />
                </div>

                {/* Left: Release Date */}
                <div className="text-left font-mono text-[10px] font-bold text-slate-400">
                  <span>{releaseDate}</span>
                </div>
              </div>

              {/* Exact Rounded Green Container */}
              <div className="border-2 border-[#0D3833] rounded-[18px] overflow-hidden bg-white">
                {/* Column Header Bar */}
                <div className="grid grid-cols-12 bg-[#0D3833] text-white font-bold text-xs py-2 px-3 text-center">
                  <div className="col-span-6 text-center">المنتج</div>
                  <div className="col-span-3 text-center border-r border-white/20">الوزن</div>
                  <div className="col-span-3 text-center border-r border-white/20">السعر</div>
                </div>

                {/* 4 Product Rows */}
                <div className="divide-y divide-dotted divide-slate-300">
                  {/* Row 1: كيما ستار 20000 */}
                  {(() => {
                    const p = p20000
                    const pkg9L = p?.packages?.find((k) => k.unitName.includes('بستل') || k.weight.includes('9'))
                    const pkg2L = p?.packages?.find((k) => k.unitName.includes('جالون') || k.weight.includes('2.5'))
                    return (
                      <div className="grid grid-cols-12 items-center py-2.5 px-3 text-right">
                        {/* 1. Product Column */}
                        <div className="col-span-6 flex items-center justify-between gap-2 pl-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-black text-[#0D3833] leading-snug">
                              {p?.name || 'كيما ستار 20000'}
                            </h3>
                            <p className="text-[9.5px] text-slate-700 leading-relaxed mt-0.5 font-medium">
                              {p?.description || 'هو دهان أكريليك مائي داخلي خارجي، نصف لامع فائق الجودة، مصنع من اجود انواع مواد الاكريليك المنتقاة لتكسبه مقاومة عالية للاحتكاك والغسيل.'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="flex items-center gap-1 text-[8.5px] font-bold border border-slate-300 rounded-md px-1.5 py-0.5 text-slate-700 bg-white shadow-2xs">
                                <HouseSvg />
                                <span>داخلي / خارجي</span>
                              </span>
                              <span className="flex items-center gap-1 text-[8.5px] font-bold border border-slate-300 rounded-md px-1.5 py-0.5 text-slate-700 bg-white shadow-2xs">
                                <SparkleSvg />
                                <span>نصف لامع</span>
                              </span>
                            </div>
                          </div>
                          {p?.image && (
                            <img src={p.image} alt={p.name} className="w-[78px] h-[78px] object-contain shrink-0 drop-shadow-md" />
                          )}
                        </div>

                        {/* 2. Weight Column */}
                        <div className="col-span-3 flex flex-col items-center justify-center gap-2 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                              <BucketSvg />
                              <span>وزن البستلة</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-900 mt-0.5">
                              {pkg9L?.weight || '9 لتر'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                              <BucketSvg />
                              <span>وزن الجالون</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-900 mt-0.5">
                              {pkg2L?.weight || '2.5 لتر'}
                            </span>
                          </div>
                        </div>

                        {/* 3. Price Column */}
                        <div className="col-span-3 flex flex-col items-center justify-center gap-2 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                              <CoinSvg />
                              <span>سعر البستلة</span>
                            </div>
                            <span className="font-mono text-base font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkg9L?.price || 1529.55)}
                            </span>
                            <span className="text-[8.5px] text-slate-500">جنيه مصري</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-slate-500 font-medium">سعر الجالون</span>
                            <span className="font-mono text-sm font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkg2L?.price || 450)}
                            </span>
                            <span className="text-[8.5px] text-slate-500">جنيه مصري</span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Row 2: كيما ستار 15000 */}
                  {(() => {
                    const p = p15000
                    const pkg9L = p?.packages?.find((k) => k.unitName.includes('بستل') || k.weight.includes('9'))
                    const pkg2L = p?.packages?.find((k) => k.unitName.includes('جالون') || k.weight.includes('2.5'))
                    return (
                      <div className="grid grid-cols-12 items-center py-2.5 px-3 text-right">
                        <div className="col-span-6 flex items-center justify-between gap-2 pl-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-black text-[#0D3833] leading-snug">
                              {p?.name || 'كيما ستار 15000'}
                            </h3>
                            <p className="text-[9.5px] text-slate-700 leading-relaxed mt-0.5 font-medium">
                              {p?.description || 'هو دهان أكريليك مائي داخلي خارجي، ربع لامع فائق الجودة، مصنع من اجود انواع مواد الاكريليك المنتقاة لتكسبه مقاومة عالية للاحتكاك والغسيل.'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="flex items-center gap-1 text-[8.5px] font-bold border border-slate-300 rounded-md px-1.5 py-0.5 text-slate-700 bg-white shadow-2xs">
                                <HouseSvg />
                                <span>داخلي / خارجي</span>
                              </span>
                              <span className="flex items-center gap-1 text-[8.5px] font-bold border border-slate-300 rounded-md px-1.5 py-0.5 text-slate-700 bg-white shadow-2xs">
                                <SparkleSvg />
                                <span>ربع لامع</span>
                              </span>
                            </div>
                          </div>
                          {p?.image && (
                            <img src={p.image} alt={p.name} className="w-[78px] h-[78px] object-contain shrink-0 drop-shadow-md" />
                          )}
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-2 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                              <BucketSvg />
                              <span>وزن البستلة</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-900 mt-0.5">
                              {pkg9L?.weight || '9 لتر'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                              <BucketSvg />
                              <span>وزن الجالون</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-900 mt-0.5">
                              {pkg2L?.weight || '2.5 لتر'}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-2 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                              <CoinSvg />
                              <span>سعر البستلة</span>
                            </div>
                            <span className="font-mono text-base font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkg9L?.price || 1359.6)}
                            </span>
                            <span className="text-[8.5px] text-slate-500">جنيه مصري</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-slate-500 font-medium">سعر الجالون</span>
                            <span className="font-mono text-sm font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkg2L?.price || 400)}
                            </span>
                            <span className="text-[8.5px] text-slate-500">جنيه مصري</span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Row 3: بلاستيك بلس 700 */}
                  {(() => {
                    const p = p700
                    const pkg9L = p?.packages?.find((k) => k.unitName.includes('بستل'))
                    const pkgWhite = p?.packages?.find((k) => k.unitName.includes('ابيض') || k.unitName.includes('أبيض')) || p?.packages?.[1]
                    const pkgColors = p?.packages?.find((k) => k.unitName.includes('الوان') || k.unitName.includes('ألوان')) || p?.packages?.[2]
                    return (
                      <div className="grid grid-cols-12 items-center py-2.5 px-3 text-right">
                        <div className="col-span-6 flex items-center justify-between gap-2 pl-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-[#0D3833] leading-snug">
                                بلاستيك بلس 700
                              </h3>
                              <span className="text-[9px] font-bold text-slate-600">مط عالي الجودة</span>
                              <span className="text-[8.5px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-300">مط</span>
                            </div>
                            <p className="text-[9.5px] text-slate-700 leading-relaxed mt-1 font-medium">
                              {p?.description || 'بلس 700 هو دهان بلاستيك مط (مطفي) فائق الجودة مصنع من اجود انواع الاكريليك بوليمر ومواد اخرى عديده تمنحه خصائص فريدة من نوعها.'}
                            </p>
                          </div>
                          {p?.image && (
                            <img src={p.image} alt={p.name} className="w-[78px] h-[78px] object-contain shrink-0 drop-shadow-md" />
                          )}
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1.5 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[8.5px] text-slate-500 font-medium">
                              <BucketSvg />
                              <span>وزن البستلة</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {pkg9L?.weight || '9 لتر'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8.5px] text-slate-500">وزن الجالون الأبيض</span>
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {pkgWhite?.weight || '2.5 لتر'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8.5px] text-slate-500">وزن الجالون الألوان</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs font-bold text-slate-900">
                                {pkgColors?.weight || '2.25 لتر'}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <span className="text-[7.5px] bg-black text-white px-1 py-0.2 rounded font-bold">أسود</span>
                                <span className="text-[7.5px] bg-[#67000D] text-white px-1 py-0.2 rounded font-bold">نبيتي</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1.5 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[8.5px] text-slate-500 font-medium">
                              <CoinSvg />
                              <span>سعر البستلة</span>
                            </div>
                            <span className="font-mono text-sm font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkg9L?.price || 978.5)}
                            </span>
                            <span className="text-[8px] text-slate-500">جنيه مصري</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8.5px] text-slate-500">سعر الجالون</span>
                            <span className="font-mono text-xs font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkgWhite?.price || 300)}
                            </span>
                            <span className="text-[8px] text-slate-500">جنيه مصري</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8.5px] text-slate-500">سعر الجالون الألوان</span>
                            <span className="font-mono text-xs font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkgColors?.price || 240)}
                            </span>
                            <span className="text-[8px] text-slate-500">جنيه مصري</span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Row 4: كيما برو 5050 */}
                  {(() => {
                    const p = p5050
                    const pkg9L = p?.packages?.find((k) => k.unitName.includes('بستل'))
                    const pkgWhite = p?.packages?.find((k) => k.unitName.includes('ابيض') || k.unitName.includes('أبيض')) || p?.packages?.[1]
                    const pkgColors = p?.packages?.find((k) => k.unitName.includes('الوان') || k.unitName.includes('ألوان')) || p?.packages?.[2]
                    return (
                      <div className="grid grid-cols-12 items-center py-2.5 px-3 text-right">
                        <div className="col-span-6 flex items-center justify-between gap-2 pl-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-[#0D3833] leading-snug">
                                كيما برو 5050
                              </h3>
                              <span className="text-[9px] font-bold text-slate-600">طلاء بلاستيك عالي الجودة</span>
                              <span className="text-[8.5px] bg-[#0D3833] text-white px-1.5 py-0.2 rounded font-bold">مط داخلي</span>
                            </div>
                            <p className="text-[9.5px] text-slate-700 leading-relaxed mt-1 font-medium">
                              {p?.description || 'كيما برو 5050 هو دهان بلاستيك مط (مطفي) عالي الجوده مصنع من اجود انواع كوبوليمر الاكريليك ليعطي سطح أملس جذاب بيمتاز ببياض فريد من نوعه ومعدل فرد ممتاز.'}
                            </p>
                          </div>
                          {p?.image && (
                            <img src={p.image} alt={p.name} className="w-[78px] h-[78px] object-contain shrink-0 drop-shadow-md" />
                          )}
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1.5 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[8.5px] text-slate-500 font-medium">
                              <BucketSvg />
                              <span>وزن البستلة</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {pkg9L?.weight || '9 لتر'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8.5px] text-slate-500">وزن الجالون الأبيض</span>
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {pkgWhite?.weight || '2.5 لتر'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8.5px] text-slate-500">وزن الجالون الألوان</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs font-bold text-slate-900">
                                {pkgColors?.weight || '2.5 لتر'}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <span className="text-[7.5px] bg-black text-white px-1 py-0.2 rounded font-bold">أسود</span>
                                <span className="text-[7.5px] bg-[#67000D] text-white px-1 py-0.2 rounded font-bold">نبيتي</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1.5 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[8.5px] text-slate-500 font-medium">
                              <CoinSvg />
                              <span>سعر البستلة</span>
                            </div>
                            <span className="font-mono text-sm font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkg9L?.price || 545.95)}
                            </span>
                            <span className="text-[8px] text-slate-500">جنيه مصري</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8.5px] text-slate-500">سعر الجالون الأبيض</span>
                            <span className="font-mono text-xs font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkgWhite?.price || 165)}
                            </span>
                            <span className="text-[8px] text-slate-500">جنيه مصري</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8.5px] text-slate-500">سعر الجالون الألوان</span>
                            <span className="font-mono text-xs font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkgColors?.price || 180)}
                            </span>
                            <span className="text-[8px] text-slate-500">جنيه مصري</span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Bottom 3 Guarantee Strips (Exact Match to PDF) */}
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-2.5 text-center text-[9.5px] font-bold text-slate-800">
                <div className="flex items-center justify-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] py-2 rounded-xl">
                  <ShieldSvg />
                  <span>مقاومة عالية للإحتكاك والغسيل</span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] py-2 rounded-xl">
                  <LeafSvg />
                  <span>صديقة للبيئة خالية من المواد الضارة</span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] py-2 rounded-xl">
                  <RollerSvg />
                  <span>سهولة في التطبيق تغطية فائقة</span>
                </div>
              </div>
              <p className="text-[9px] text-center text-slate-500 font-medium mt-1.5">
                * الأسعار شاملة ضريبة القيمة المضافة
              </p>
            </div>
          </div>

          {/* ========================================================
              PAGE 3: Sealers, Varnishes & Putties (Exact CSS Carbon Copy)
             ======================================================== */}
          <div className="price-menu-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white text-slate-900 overflow-hidden rounded-md shadow-2xl p-6 flex flex-col justify-between print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col text-right">
                    <span className="text-base font-black text-[#0D3833] leading-tight">بتروكيما</span>
                    <span className="text-[10px] font-bold text-[#00B4D8]">للدهانات</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-center">
                  <div className="w-12 h-[2px] bg-[#0D3833]" />
                  <span className="text-2xl font-black text-[#0D3833] tracking-tight">قائمة أسعار</span>
                  <div className="w-2.5 h-2.5 rotate-45 bg-[#E85D04]" />
                  <div className="w-12 h-[2px] bg-[#0D3833]" />
                </div>

                <div className="text-left font-mono text-[10px] font-bold text-slate-400">
                  <span>{releaseDate}</span>
                </div>
              </div>

              {/* Exact Rounded Green Container */}
              <div className="border-2 border-[#0D3833] rounded-[18px] overflow-hidden bg-white">
                <div className="grid grid-cols-12 bg-[#0D3833] text-white font-bold text-xs py-2 px-3 text-center">
                  <div className="col-span-6 text-center">المنتج</div>
                  <div className="col-span-3 text-center border-r border-white/20">الوزن</div>
                  <div className="col-span-3 text-center border-r border-white/20">السعر</div>
                </div>

                {/* 5 Product Rows */}
                <div className="divide-y divide-dotted divide-slate-300">
                  {/* Row 1: سيلر مقاوم 333 */}
                  {(() => {
                    const p = p333
                    const pkg9L = p?.packages?.find((k) => k.unitName.includes('بستل') || k.weight.includes('9'))
                    const pkg2L = p?.packages?.find((k) => k.unitName.includes('جالون') || k.weight.includes('2.5'))
                    return (
                      <div className="grid grid-cols-12 items-center py-2 px-3 text-right">
                        <div className="col-span-6 flex items-center justify-between gap-2 pl-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-black text-[#0D3833] leading-snug">
                              سيلر مقاوم 333
                            </h3>
                            <p className="text-[9px] text-slate-600 font-semibold mt-0.5">
                              سيلر اكريليك مائي داخلي
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="flex items-center gap-1 text-[8px] font-bold border border-slate-300 rounded px-1.5 py-0.2 text-slate-700 bg-white">
                                <HouseSvg />
                                <span>داخلي</span>
                              </span>
                              <span className="flex items-center gap-1 text-[8px] font-bold border border-slate-300 rounded px-1.5 py-0.2 text-slate-700 bg-white">
                                <SparkleSvg />
                                <span>سهل التطبيق</span>
                              </span>
                            </div>
                          </div>
                          {p?.image && (
                            <img src={p.image} alt={p.name} className="w-[68px] h-[68px] object-contain shrink-0 drop-shadow-md" />
                          )}
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1.5 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[8.5px] text-slate-500">
                              <BucketSvg />
                              <span>وزن البستلة</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {pkg9L?.weight || '9 لتر'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8.5px] text-slate-500">وزن الجالون</span>
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {pkg2L?.weight || '2.5 لتر'}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1.5 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[8.5px] text-slate-500">
                              <CoinSvg />
                              <span>سعر البستلة</span>
                            </div>
                            <span className="font-mono text-sm font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkg9L?.price || 375.95)}
                            </span>
                            <span className="text-[7.5px] text-slate-500">جنيه مصري</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8.5px] text-slate-500">سعر الجالون</span>
                            <span className="font-mono text-xs font-black text-[#0D3833] leading-none mt-0.5">
                              {formatNumber(pkg2L?.price || 140)}
                            </span>
                            <span className="text-[7.5px] text-slate-500">جنيه مصري</span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Row 2: ورنيش كلير 444 */}
                  {(() => {
                    const p = p444
                    const pkg = p?.packages?.[0]
                    return (
                      <div className="grid grid-cols-12 items-center py-2 px-3 text-right">
                        <div className="col-span-6 flex items-center justify-between gap-2 pl-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-black text-[#0D3833] leading-snug">
                              ورنيش كلير 444
                            </h3>
                            <p className="text-[9px] text-slate-600 font-semibold mt-0.5">
                              ورنيش اكريليك مائي
                            </p>
                            <span className="text-[8px] font-bold bg-slate-900 text-white px-1.5 py-0.2 rounded inline-block mt-0.5">
                              لامع داخلي وخارجي
                            </span>
                            <p className="text-[8.5px] text-slate-600 leading-tight mt-1 font-medium">
                              {p?.description || 'ورنيش كلير 444 هو ورنيش مائي عالي الشفافية فائق الجودة غير قابل للاصفرار مركب من اجود انواع الاكريليك المنتقاة.'}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="flex items-center gap-0.5 text-[8px] font-bold border border-slate-300 rounded px-1 text-slate-700 bg-white">
                                <HouseSvg />
                                <span>داخلي / خارجي</span>
                              </span>
                              <span className="flex items-center gap-0.5 text-[8px] font-bold border border-slate-300 rounded px-1 text-slate-700 bg-white">
                                <SparkleSvg />
                                <span>لامع</span>
                              </span>
                            </div>
                          </div>
                          {p?.image && (
                            <img src={p.image} alt={p.name} className="w-[68px] h-[68px] object-contain shrink-0 drop-shadow-md" />
                          )}
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex items-center gap-1 text-[8.5px] text-slate-500">
                            <BucketSvg />
                            <span>وزن الجالون</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {pkg?.weight || '2.25 لتر'}
                          </span>
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex items-center gap-1 text-[8.5px] text-slate-500">
                            <CoinSvg />
                            <span>سعر الجالون</span>
                          </div>
                          <span className="font-mono text-base font-black text-[#0D3833]">
                            {formatNumber(pkg?.price || 200)}
                          </span>
                          <span className="text-[8px] text-slate-500">جنيه مصري</span>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Row 3: بلاستيك ايكو كيم */}
                  {(() => {
                    const p = pEco
                    const pkg = p?.packages?.[0]
                    return (
                      <div className="grid grid-cols-12 items-center py-2 px-3 text-right">
                        <div className="col-span-6 flex items-center justify-between gap-2 pl-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-black text-[#0D3833] leading-snug">
                              بلاستيك ايكو كيم
                            </h3>
                            <span className="text-[8.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded inline-block mt-0.5">
                              بلاستيك إقتصادي
                            </span>
                            <p className="text-[8.5px] text-slate-600 leading-tight mt-1 font-medium">
                              {p?.description || 'ايكو كيم دهان مائي بطانة مط للحوائط والاسقف الداخلية مصمم خصيصا ليعطي قدرة تخبئة عالية ودرجة بياض عالية منتج بأساس مائي صديق للبيئة.'}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="flex items-center gap-0.5 text-[8px] font-bold border border-slate-300 rounded px-1 text-slate-700 bg-white">
                                <HouseSvg />
                                <span>داخلي</span>
                              </span>
                              <span className="text-[8px] font-bold border border-slate-300 rounded px-1 text-slate-700 bg-white">
                                إقتصادي
                              </span>
                            </div>
                          </div>
                          {p?.image && (
                            <img src={p.image} alt={p.name} className="w-[68px] h-[68px] object-contain shrink-0 drop-shadow-md" />
                          )}
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex items-center gap-1 text-[8.5px] text-slate-500">
                            <BucketSvg />
                            <span>وزن البستلة</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {pkg?.weight || '9 لتر'}
                          </span>
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex items-center gap-1 text-[8.5px] text-slate-500">
                            <CoinSvg />
                            <span>سعر البستلة</span>
                          </div>
                          <span className="font-mono text-base font-black text-[#0D3833]">
                            {formatNumber(pkg?.price || 283.25)}
                          </span>
                          <span className="text-[8px] text-slate-500">جنيه مصري</span>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Row 4: معجون بترو 100 */}
                  {(() => {
                    const p = p100
                    const pkg15Kg = p?.packages?.find((k) => k.unitName.includes('15') || k.weight.includes('15')) || p?.packages?.[0]
                    const pkg3Kg = p?.packages?.find((k) => k.unitName.includes('3') || k.weight.includes('3')) || p?.packages?.[1]
                    return (
                      <div className="grid grid-cols-12 items-center py-2 px-3 text-right">
                        <div className="col-span-6 flex items-center justify-between gap-2 pl-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-black text-[#0D3833] leading-snug">
                              معجون بترو 100
                            </h3>
                            <p className="text-[8.5px] text-slate-600 leading-tight mt-0.5 font-medium">
                              {p?.description || 'معجون بترو 100 هو معجون داخلي جاهز للاستعمال مصنع من اساس كوبوليمر.'}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="flex items-center gap-0.5 text-[8px] font-bold border border-slate-300 rounded px-1 text-slate-700 bg-white">
                                <HouseSvg />
                                <span>داخلي</span>
                              </span>
                              <span className="flex items-center gap-0.5 text-[8px] font-bold border border-slate-300 rounded px-1 text-slate-700 bg-white">
                                <SparkleSvg />
                                <span>جاهز للاستعمال</span>
                              </span>
                            </div>
                          </div>
                          {p?.image && (
                            <img src={p.image} alt={p.name} className="w-[64px] h-[64px] object-contain shrink-0 drop-shadow-md" />
                          )}
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1.5 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[8px] text-slate-500">
                              <SackSvg />
                              <span>وزن الشيكارة</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {pkg15Kg?.weight || '15 كجم'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-slate-500">وزن الشيكارة</span>
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {pkg3Kg?.weight || '3 كجم'}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1.5 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[8px] text-slate-500">
                              <CoinSvg />
                              <span>سعر الشيكارة 15 كجم</span>
                            </div>
                            <span className="font-mono text-xs font-black text-[#0D3833]">
                              {formatNumber(pkg15Kg?.price || 190)}
                            </span>
                            <span className="text-[7.5px] text-slate-500">جنيه مصري</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-slate-500">سعر الشيكارة 3 كجم</span>
                            <span className="font-mono text-xs font-black text-[#0D3833]">
                              {formatNumber(pkg3Kg?.price || 47)}
                            </span>
                            <span className="text-[7.5px] text-slate-500">جنيه مصري</span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Row 5: معجون اكريليك بترو 500 */}
                  {(() => {
                    const p = p500
                    const pkg15Kg = p?.packages?.[0]
                    return (
                      <div className="grid grid-cols-12 items-center py-2 px-3 text-right">
                        <div className="col-span-6 flex items-center justify-between gap-2 pl-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-black text-[#0D3833] leading-snug">
                              معجون اكريليك بترو 500
                            </h3>
                            <p className="text-[8.5px] text-slate-600 leading-tight mt-0.5 font-medium">
                              {p?.description || 'هو معجون اكريليك داخلي وخارجي جاهز للاستخدام.'}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="flex items-center gap-0.5 text-[8px] font-bold border border-slate-300 rounded px-1 text-slate-700 bg-white">
                                <HouseSvg />
                                <span>داخلي / خارجي</span>
                              </span>
                              <span className="flex items-center gap-0.5 text-[8px] font-bold border border-slate-300 rounded px-1 text-slate-700 bg-white">
                                <SparkleSvg />
                                <span>جاهز للاستخدام</span>
                              </span>
                            </div>
                          </div>
                          {p?.image && (
                            <img src={p.image} alt={p.name} className="w-[64px] h-[64px] object-contain shrink-0 drop-shadow-md" />
                          )}
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex items-center gap-1 text-[8.5px] text-slate-500">
                            <SackSvg />
                            <span>وزن الشيكارة</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {pkg15Kg?.weight || '15 كجم'}
                          </span>
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1 border-r border-dotted border-slate-300 text-center py-1">
                          <div className="flex items-center gap-1 text-[8.5px] text-slate-500">
                            <CoinSvg />
                            <span>سعر الشيكارة 15 كجم</span>
                          </div>
                          <span className="font-mono text-base font-black text-[#0D3833]">
                            {formatNumber(pkg15Kg?.price || 360.5)}
                          </span>
                          <span className="text-[8px] text-slate-500">جنيه مصري</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Bottom 3 Guarantee Strips */}
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-2.5 text-center text-[9.5px] font-bold text-slate-800">
                <div className="flex items-center justify-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] py-2 rounded-xl">
                  <ShieldSvg />
                  <span>مقاومة عالية للإحتكاك والغسيل</span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] py-2 rounded-xl">
                  <LeafSvg />
                  <span>صديقة للبيئة خالية من المواد الضارة</span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] py-2 rounded-xl">
                  <RollerSvg />
                  <span>سهولة في التطبيق تغطية فائقة</span>
                </div>
              </div>
              <p className="text-[9px] text-center text-slate-500 font-medium mt-1.5">
                * الأسعار شاملة ضريبة القيمة المضافة
              </p>
            </div>
          </div>

          {/* ========================================================
              PAGE 4: Industrial Enamels & Primers (Exact CSS Carbon Copy)
             ======================================================== */}
          <div className="price-menu-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white text-slate-900 overflow-hidden rounded-md shadow-2xl p-6 flex flex-col justify-between print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col text-right">
                    <span className="text-base font-black text-[#0D3833] leading-tight">بتروكيما</span>
                    <span className="text-[10px] font-bold text-[#00B4D8]">للدهانات</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-center">
                  <div className="w-12 h-[2px] bg-[#0D3833]" />
                  <span className="text-2xl font-black text-[#0D3833] tracking-tight">قائمة أسعار</span>
                  <div className="w-2.5 h-2.5 rotate-45 bg-[#E85D04]" />
                  <div className="w-12 h-[2px] bg-[#0D3833]" />
                </div>

                <div className="text-left font-mono text-[10px] font-bold text-slate-400">
                  <span>{releaseDate}</span>
                </div>
              </div>

              {/* 3 Industrial Cards Matching PDF */}
              <div className="space-y-3">
                {/* Card 1: برايمر بريكس (Red) */}
                <div className="border-2 border-[#8B1E1E] rounded-[14px] overflow-hidden bg-white">
                  <div className="bg-[#8B1E1E] text-white py-1.5 px-4 text-center font-black text-sm tracking-wide">
                    برايمر بريكس
                  </div>
                  <div className="grid grid-cols-12 p-2 items-center gap-2">
                    {/* Table (Right 8 cols) */}
                    <div className="col-span-8">
                      <table className="w-full text-right text-[10px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-1 px-1.5 text-center w-6">م</th>
                            <th className="py-1 px-2">المنتج</th>
                            <th className="py-1 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <BucketSvg />
                                <span>الوزن</span>
                              </div>
                            </th>
                            <th className="py-1 px-2 text-left">
                              <div className="flex items-center justify-end gap-1">
                                <CoinSvg />
                                <span>سعر العبوة</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(pBrex?.packages || [
                            { unitName: 'نصف كيلو', price: 46.35, weight: '0.350 L' },
                            { unitName: 'كيلو', price: 97.85, weight: '1 L' },
                            { unitName: 'جالون', price: 283.25, weight: '2.5 L' },
                            { unitName: 'بستله', price: 1340, weight: '20 Kg' },
                          ]).map((pkg, idx) => (
                            <tr key={idx}>
                              <td className="py-1 px-1.5 text-center">
                                <span className="w-4 h-4 rounded bg-[#8B1E1E] text-white text-[9px] font-bold font-mono inline-flex items-center justify-center">
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="py-1 px-2 font-bold text-slate-800">{pkg.unitName}</td>
                              <td className="py-1 px-2 text-center font-mono font-medium text-slate-600">{pkg.weight}</td>
                              <td className="py-1 px-2 text-left font-mono font-black text-[#8B1E1E]">
                                {formatNumber(pkg.price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Can Graphic + Color Swatches (Left 4 cols) */}
                    <div className="col-span-4 flex items-center justify-around border-r border-slate-100 pr-1">
                      {pBrex?.image && (
                        <img src={pBrex.image} alt="برايمر بريكس" className="w-16 h-16 object-contain drop-shadow-md" />
                      )}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-slate-700">متوفر للألوان</span>
                        <div className="flex flex-col gap-1 mt-1 text-[8.5px] font-bold text-white text-center">
                          <span className="bg-[#8B1E1E] px-2.5 py-0.5 rounded shadow-2xs">أحمر</span>
                          <span className="bg-slate-500 px-2.5 py-0.5 rounded shadow-2xs">رصاصي</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: كيما كوت (Gold/Ochre) */}
                <div className="border-2 border-[#A37517] rounded-[14px] overflow-hidden bg-white">
                  <div className="bg-[#A37517] text-white py-1.5 px-4 text-center font-black text-sm tracking-wide">
                    كيما كوت
                  </div>
                  <div className="grid grid-cols-12 p-2 items-center gap-2">
                    <div className="col-span-8">
                      <table className="w-full text-right text-[9.5px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-0.5 px-1.5 text-center w-6">م</th>
                            <th className="py-0.5 px-2">المنتج</th>
                            <th className="py-0.5 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <BucketSvg />
                                <span>الوزن</span>
                              </div>
                            </th>
                            <th className="py-0.5 px-2 text-left">
                              <div className="flex items-center justify-end gap-1">
                                <CoinSvg />
                                <span>سعر العبوة</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(pKemaCoat?.packages || [
                            { unitName: 'كيلو مط أبيض', price: 98.88, weight: '0.7 L' },
                            { unitName: 'جالون مط أبيض', price: 293.55, weight: '2.5 L' },
                            { unitName: 'جالون دبل مط أبيض', price: 473.80, weight: '3.5 L' },
                            { unitName: 'جالون مط ألوان', price: 242.05, weight: '2.5 L' },
                            { unitName: 'كيلو مط ألوان', price: 76.73, weight: '0.7 L' },
                            { unitName: 'جالون دبل مط ألوان', price: 391.71, weight: '3.5 L' },
                            { unitName: 'بستله كيما كوت أبيض', price: 2090.90, weight: '25 Kg' },
                          ]).map((pkg, idx) => (
                            <tr key={idx}>
                              <td className="py-0.5 px-1.5 text-center">
                                <span className="w-3.5 h-3.5 rounded bg-[#A37517] text-white text-[8.5px] font-bold font-mono inline-flex items-center justify-center">
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="py-0.5 px-2 font-medium text-slate-800">{pkg.unitName}</td>
                              <td className="py-0.5 px-2 text-center font-mono text-slate-600">{pkg.weight}</td>
                              <td className="py-0.5 px-2 text-left font-mono font-black text-[#A37517]">
                                {formatNumber(pkg.price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="col-span-4 flex items-center justify-center border-r border-slate-100 pr-1">
                      {pKemaCoat?.image && (
                        <img src={pKemaCoat.image} alt="كيما كوت" className="w-20 h-20 object-contain drop-shadow-md" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 3: سوبر ستار (Olive Green) */}
                <div className="border-2 border-[#4A6B32] rounded-[14px] overflow-hidden bg-white">
                  <div className="bg-[#4A6B32] text-white py-1.5 px-4 text-center font-black text-sm tracking-wide flex items-center justify-center gap-1.5">
                    <span>★</span>
                    <span>سوبر ستار</span>
                    <span>★</span>
                  </div>
                  <div className="grid grid-cols-12 p-2 items-center gap-2">
                    <div className="col-span-8">
                      <table className="w-full text-right text-[9px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-0.5 px-1 text-center w-5">م</th>
                            <th className="py-0.5 px-1.5">المنتج</th>
                            <th className="py-0.5 px-1.5 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                <BucketSvg />
                                <span>الوزن</span>
                              </div>
                            </th>
                            <th className="py-0.5 px-1.5 text-left">
                              <div className="flex items-center justify-end gap-0.5">
                                <CoinSvg />
                                <span>سعر العبوة</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(pSuperStar?.packages || []).slice(0, 10).map((pkg, idx) => (
                            <tr key={idx}>
                              <td className="py-0.5 px-1 text-center">
                                <span className="w-3.5 h-3.5 rounded bg-[#4A6B32] text-white text-[8px] font-bold font-mono inline-flex items-center justify-center">
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="py-0.5 px-1.5 font-medium text-slate-800">{pkg.unitName}</td>
                              <td className="py-0.5 px-1.5 text-center font-mono text-slate-600">{pkg.weight}</td>
                              <td className="py-0.5 px-1.5 text-left font-mono font-black text-[#4A6B32]">
                                {formatNumber(pkg.price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="col-span-4 flex items-center justify-center border-r border-slate-100 pr-1">
                      {pSuperStar?.image && (
                        <img src={pSuperStar.image} alt="سوبر ستار" className="w-20 h-20 object-contain drop-shadow-md" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 4 Guarantee Strips */}
            <div className="pt-2">
              <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-bold text-slate-800">
                <div className="flex items-center justify-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] py-1.5 rounded-xl">
                  <ShieldSvg />
                  <span>مقاومة عالية للإحتكاك والغسيل</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] py-1.5 rounded-xl">
                  <LeafSvg />
                  <span>صديقة للبيئة خالية من المواد الضارة</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] py-1.5 rounded-xl">
                  <RollerSvg />
                  <span>سهولة في التطبيق تغطية فائقة</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] py-1.5 rounded-xl">
                  <StarMedalSvg />
                  <span>أعلى جودة نتائج تدوم طويلاً</span>
                </div>
              </div>
              <p className="text-[9px] text-center text-slate-500 font-medium mt-1.5">
                * الأسعار شاملة ضريبة القيمة المضافة
              </p>
            </div>
          </div>

          {/* ========================================================
              PAGE 5+ (Optional): Dynamic Extra Products
             ======================================================== */}
          {extraProducts.length > 0 && (
            <div className="price-menu-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white text-slate-900 overflow-hidden rounded-md shadow-2xl p-6 flex flex-col justify-between print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                    <span className="text-base font-black text-[#0D3833]">بتروكيما للدهانات</span>
                  </div>
                  <span className="text-2xl font-black text-[#0D3833]">• قائمة أسعار إضافية •</span>
                  <span className="text-xs font-mono text-slate-400">{releaseDate}</span>
                </div>

                <div className="border-2 border-[#0D3833] rounded-[18px] overflow-hidden bg-white">
                  <div className="grid grid-cols-12 bg-[#0D3833] text-white font-bold text-xs py-2 px-3 text-center">
                    <div className="col-span-6 text-center">المنتج</div>
                    <div className="col-span-3 text-center border-r border-white/20">الوزن</div>
                    <div className="col-span-3 text-center border-r border-white/20">السعر</div>
                  </div>

                  <div className="divide-y divide-dotted divide-slate-300">
                    {extraProducts.map((p) => {
                      const packages = p.packages || []
                      return (
                        <div key={p._id} className="grid grid-cols-12 items-center py-2 px-3 text-right">
                          <div className="col-span-6 flex items-center justify-between gap-2 pl-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-black text-[#0D3833]">{p.name}</h3>
                              <p className="text-[9px] text-slate-600 line-clamp-2">{p.description}</p>
                            </div>
                            {p.image && <img src={p.image} alt={p.name} className="w-14 h-14 object-contain shrink-0" />}
                          </div>
                          <div className="col-span-3 flex flex-col items-center justify-center gap-1 border-r border-dotted border-slate-300 text-center py-1">
                            {packages.map((pkg, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold">
                                {pkg.weight || pkg.unitName}
                              </div>
                            ))}
                          </div>
                          <div className="col-span-3 flex flex-col items-center justify-center gap-1 border-r border-dotted border-slate-300 text-center py-1">
                            {packages.map((pkg, idx) => (
                              <div key={idx} className="flex flex-col items-center">
                                <span className="font-mono text-xs font-black text-[#0D3833]">
                                  {formatNumber(pkg.price)} ج.م
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2">
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
