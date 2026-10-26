import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAll as getAllProducts } from '@/api/products'
import type { Product } from '@/api/products.schema'
import { formatNumber } from '@/lib/format'

// ==========================================
// Exact Vector Icons Matching User Screenshot
// ==========================================

// Double stacked coins with $ icon
const CoinsSvg = () => (
  <svg className="w-7 h-7 text-[#063D37] shrink-0" viewBox="0 0 28 28" fill="none" stroke="currentColor">
    {/* Top coin */}
    <circle cx="11" cy="9.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 6v7M9.5 7.5a1.8 1.8 0 0 1 3 0c0 1-.9 1.4-1.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    {/* Bottom offset coin */}
    <circle cx="17" cy="18" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M17 14.5v7M15.5 16a1.8 1.8 0 0 1 3 0c0 1-.9 1.4-1.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

// Paint bucket/can outline with handle
const PaintCanSvg = () => (
  <svg className="w-6 h-7 text-[#063D37] shrink-0" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="6" rx="6.5" ry="3.5" />
    <path d="M5.5 6v14c0 1.93 2.91 3.5 6.5 3.5s6.5-1.57 6.5-3.5V6" />
    <path d="M8.5 9.5c0 1.1 1.57 2 3.5 2s3.5-.9 3.5-2" strokeWidth="1.2" />
  </svg>
)

// Sack outline for putty
const SackSvg = () => (
  <svg className="w-6 h-7 text-[#063D37] shrink-0" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 10l2.5-6h7L18 10v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z" />
    <path d="M9.5 4v2.5m5-2.5v2.5" />
  </svg>
)

// House outline badge icon
const BadgeHouseSvg = () => (
  <svg className="w-4 h-4 text-[#063D37] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20v-9.5z" />
    <path d="M9 21v-7h6v7" />
  </svg>
)

// Magic wand / sparkle badge icon
const BadgeWandSvg = () => (
  <svg className="w-4 h-4 text-[#063D37] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 4l5 5L7 22H2v-5L15 4z" />
    <path d="M18.5 2.5l3 3" />
    <path d="M2 2l2 2" />
    <path d="M9 2l1 2" />
  </svg>
)

// Bottom guarantee icons
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
          <div className="w-12 h-12 border-4 border-[#063D37] border-t-transparent rounded-full animate-spin" />
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
      <header className="sticky top-0 z-50 bg-[#063D37] text-white border-b border-[#042A26] shadow-md print:hidden">
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
            padding: 9mm 12mm !important;
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
            {/* Background Graphic with cleaned pill badge */}
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
              PAGE 2: Wall & Decorative Paints (Exact Product Cards)
             ======================================================== */}
          <div className="price-menu-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white text-slate-900 overflow-hidden rounded-md shadow-2xl p-6 flex flex-col justify-between print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
            {/* Page Header */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col text-right">
                    <span className="text-base font-black text-[#063D37] leading-tight">بتروكيما</span>
                    <span className="text-[10px] font-bold text-[#00B4D8]">للدهانات</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-center">
                  <div className="w-12 h-[2px] bg-[#063D37]" />
                  <span className="text-2xl font-black text-[#063D37] tracking-tight">قائمة أسعار</span>
                  <div className="w-2.5 h-2.5 rotate-45 bg-[#E85D04]" />
                  <div className="w-12 h-[2px] bg-[#063D37]" />
                </div>

                <div className="text-left font-mono text-[10px] font-bold text-slate-400">
                  <span>{releaseDate}</span>
                </div>
              </div>

              {/* 4 Cards for Page 2 */}
              <div className="space-y-3">
                {/* 1. كيما ستار 20000 */}
                {(() => {
                  const p = p20000
                  const pkg9L = p?.packages?.find((k) => k.unitName.includes('بستل') || k.weight.includes('9'))
                  const pkg2L = p?.packages?.find((k) => k.unitName.includes('جالون') || k.weight.includes('2.5'))
                  return (
                    <div className="w-full bg-white border-2 border-[#063D37] rounded-2xl overflow-hidden shadow-2xs grid grid-cols-12 items-stretch text-right">
                      {/* Product (Right 6 cols) */}
                      <div className="col-span-6 flex items-center justify-between p-3.5 pl-2 gap-3">
                        <div className="flex flex-col justify-between h-full py-0.5">
                          <div>
                            <h3 className="text-2xl font-black text-[#063D37] leading-tight">
                              {p?.name || 'كيما ستار 20000'}
                            </h3>
                            <p className="text-sm font-semibold text-slate-700 mt-1">
                              دهان أكريليك مائي داخلي خارجي نصف لامع
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2.5">
                            <div className="rounded-full border-[1.5px] border-[#063D37]/60 px-3 py-1 flex items-center gap-1.5 text-xs font-black text-[#063D37] bg-white">
                              <BadgeHouseSvg />
                              <span>داخلي / خارجي</span>
                            </div>
                            <div className="rounded-full border-[1.5px] border-[#063D37]/60 px-3 py-1 flex items-center gap-1.5 text-xs font-black text-[#063D37] bg-white">
                              <BadgeWandSvg />
                              <span>نصف لامع</span>
                            </div>
                          </div>
                        </div>
                        {p?.image && (
                          <img src={p.image} alt={p.name} className="w-32 h-32 sm:w-36 sm:h-36 object-contain shrink-0 drop-shadow-lg" />
                        )}
                      </div>

                      {/* Weight (Middle 3 cols) */}
                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2.5 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <PaintCanSvg />
                          <span className="text-xs font-bold text-[#063D37] mt-1">وزن البستلة</span>
                          <span className="text-2xl font-black text-slate-900 mt-0.5">{pkg9L?.weight || '9 لتر'}</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-1" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">وزن الجالون</span>
                          <span className="text-2xl font-black text-slate-900 mt-0.5">{pkg2L?.weight || '2.5 لتر'}</span>
                        </div>
                      </div>

                      {/* Price (Left 3 cols) */}
                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2.5 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <CoinsSvg />
                          <span className="text-xs font-bold text-[#063D37] mt-1">سعر البستلة</span>
                          <span className="text-3xl font-black text-slate-900 leading-tight mt-0.5">
                            {formatNumber(pkg9L?.price || 1529.55)}
                          </span>
                          <span className="text-xs font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-1" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">سعر الجالون</span>
                          <span className="text-3xl font-black text-slate-900 leading-tight mt-0.5">
                            {formatNumber(pkg2L?.price || 450)}
                          </span>
                          <span className="text-xs font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* 2. كيما ستار 15000 */}
                {(() => {
                  const p = p15000
                  const pkg9L = p?.packages?.find((k) => k.unitName.includes('بستل') || k.weight.includes('9'))
                  const pkg2L = p?.packages?.find((k) => k.unitName.includes('جالون') || k.weight.includes('2.5'))
                  return (
                    <div className="w-full bg-white border-2 border-[#063D37] rounded-2xl overflow-hidden shadow-2xs grid grid-cols-12 items-stretch text-right">
                      <div className="col-span-6 flex items-center justify-between p-3.5 pl-2 gap-3">
                        <div className="flex flex-col justify-between h-full py-0.5">
                          <div>
                            <h3 className="text-2xl font-black text-[#063D37] leading-tight">
                              {p?.name || 'كيما ستار 15000'}
                            </h3>
                            <p className="text-sm font-semibold text-slate-700 mt-1">
                              دهان أكريليك مائي داخلي خارجي ربع لامع
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2.5">
                            <div className="rounded-full border-[1.5px] border-[#063D37]/60 px-3 py-1 flex items-center gap-1.5 text-xs font-black text-[#063D37] bg-white">
                              <BadgeHouseSvg />
                              <span>داخلي / خارجي</span>
                            </div>
                            <div className="rounded-full border-[1.5px] border-[#063D37]/60 px-3 py-1 flex items-center gap-1.5 text-xs font-black text-[#063D37] bg-white">
                              <BadgeWandSvg />
                              <span>ربع لامع</span>
                            </div>
                          </div>
                        </div>
                        {p?.image && (
                          <img src={p.image} alt={p.name} className="w-32 h-32 sm:w-36 sm:h-36 object-contain shrink-0 drop-shadow-lg" />
                        )}
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2.5 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <PaintCanSvg />
                          <span className="text-xs font-bold text-[#063D37] mt-1">وزن البستلة</span>
                          <span className="text-2xl font-black text-slate-900 mt-0.5">{pkg9L?.weight || '9 لتر'}</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-1" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">وزن الجالون</span>
                          <span className="text-2xl font-black text-slate-900 mt-0.5">{pkg2L?.weight || '2.5 لتر'}</span>
                        </div>
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2.5 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <CoinsSvg />
                          <span className="text-xs font-bold text-[#063D37] mt-1">سعر البستلة</span>
                          <span className="text-3xl font-black text-slate-900 leading-tight mt-0.5">
                            {formatNumber(pkg9L?.price || 1359.6)}
                          </span>
                          <span className="text-xs font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-1" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">سعر الجالون</span>
                          <span className="text-3xl font-black text-slate-900 leading-tight mt-0.5">
                            {formatNumber(pkg2L?.price || 400)}
                          </span>
                          <span className="text-xs font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* 3. بلاستيك بلس 700 */}
                {(() => {
                  const p = p700
                  const pkg9L = p?.packages?.find((k) => k.unitName.includes('بستل'))
                  const pkgWhite = p?.packages?.find((k) => k.unitName.includes('ابيض') || k.unitName.includes('أبيض')) || p?.packages?.[1]
                  const pkgColors = p?.packages?.find((k) => k.unitName.includes('الوان') || k.unitName.includes('ألوان')) || p?.packages?.[2]
                  return (
                    <div className="w-full bg-white border-2 border-[#063D37] rounded-2xl overflow-hidden shadow-2xs grid grid-cols-12 items-stretch text-right">
                      <div className="col-span-6 flex items-center justify-between p-3.5 pl-2 gap-3">
                        <div className="flex flex-col justify-between h-full py-0.5">
                          <div>
                            <h3 className="text-2xl font-black text-[#063D37] leading-tight">
                              بلاستيك بلس 700
                            </h3>
                            <p className="text-sm font-semibold text-slate-700 mt-1">
                              دهان بلاستيك مط عالي الجودة
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2.5">
                            <div className="rounded-full border-[1.5px] border-[#063D37]/60 px-3 py-1 flex items-center gap-1.5 text-xs font-black text-[#063D37] bg-white">
                              <BadgeHouseSvg />
                              <span>داخلي</span>
                            </div>
                            <div className="rounded-full border-[1.5px] border-[#063D37]/60 px-3 py-1 flex items-center gap-1.5 text-xs font-black text-[#063D37] bg-white">
                              <BadgeWandSvg />
                              <span>مط عالي الجودة</span>
                            </div>
                          </div>
                        </div>
                        {p?.image && (
                          <img src={p.image} alt={p.name} className="w-32 h-32 sm:w-36 sm:h-36 object-contain shrink-0 drop-shadow-lg" />
                        )}
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <PaintCanSvg />
                          <span className="text-xs font-bold text-[#063D37]">وزن البستلة</span>
                          <span className="text-lg font-black text-slate-900">{pkg9L?.weight || '9 لتر'}</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">وزن الجالون الأبيض</span>
                          <span className="text-lg font-black text-slate-900">{pkgWhite?.weight || '2.5 لتر'}</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">وزن الجالون الألوان</span>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-black text-slate-900">{pkgColors?.weight || '2.25 لتر'}</span>
                            <div className="flex items-center gap-0.5">
                              <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-bold">أسود</span>
                              <span className="text-[9px] bg-[#67000D] text-white px-1.5 py-0.5 rounded font-bold">نبيتي</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <CoinsSvg />
                          <span className="text-xs font-bold text-[#063D37]">سعر البستلة</span>
                          <span className="text-2xl font-black text-slate-900 leading-tight">
                            {formatNumber(pkg9L?.price || 978.5)}
                          </span>
                          <span className="text-xs font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">سعر الجالون</span>
                          <span className="text-2xl font-black text-slate-900 leading-tight">
                            {formatNumber(pkgWhite?.price || 300)}
                          </span>
                          <span className="text-xs font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">سعر الجالون الألوان</span>
                          <span className="text-2xl font-black text-slate-900 leading-tight">
                            {formatNumber(pkgColors?.price || 240)}
                          </span>
                          <span className="text-xs font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* 4. كيما برو 5050 */}
                {(() => {
                  const p = p5050
                  const pkg9L = p?.packages?.find((k) => k.unitName.includes('بستل'))
                  const pkgWhite = p?.packages?.find((k) => k.unitName.includes('ابيض') || k.unitName.includes('أبيض')) || p?.packages?.[1]
                  const pkgColors = p?.packages?.find((k) => k.unitName.includes('الوان') || k.unitName.includes('ألوان')) || p?.packages?.[2]
                  return (
                    <div className="w-full bg-white border-2 border-[#063D37] rounded-2xl overflow-hidden shadow-2xs grid grid-cols-12 items-stretch text-right">
                      <div className="col-span-6 flex items-center justify-between p-3.5 pl-2 gap-3">
                        <div className="flex flex-col justify-between h-full py-0.5">
                          <div>
                            <h3 className="text-2xl font-black text-[#063D37] leading-tight">
                              كيما برو 5050
                            </h3>
                            <p className="text-sm font-semibold text-slate-700 mt-1">
                              طلاء بلاستيك مط عالي الجودة
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2.5">
                            <div className="rounded-full border-[1.5px] border-[#063D37]/60 px-3 py-1 flex items-center gap-1.5 text-xs font-black text-[#063D37] bg-white">
                              <BadgeHouseSvg />
                              <span>داخلي</span>
                            </div>
                            <div className="rounded-full border-[1.5px] border-[#063D37]/60 px-3 py-1 flex items-center gap-1.5 text-xs font-black text-[#063D37] bg-white">
                              <BadgeWandSvg />
                              <span>مط داخلي</span>
                            </div>
                          </div>
                        </div>
                        {p?.image && (
                          <img src={p.image} alt={p.name} className="w-32 h-32 sm:w-36 sm:h-36 object-contain shrink-0 drop-shadow-lg" />
                        )}
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <PaintCanSvg />
                          <span className="text-xs font-bold text-[#063D37]">وزن البستلة</span>
                          <span className="text-lg font-black text-slate-900">{pkg9L?.weight || '9 لتر'}</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">وزن الجالون الأبيض</span>
                          <span className="text-lg font-black text-slate-900">{pkgWhite?.weight || '2.5 لتر'}</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">وزن الجالون الألوان</span>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-black text-slate-900">{pkgColors?.weight || '2.5 لتر'}</span>
                            <div className="flex items-center gap-0.5">
                              <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-bold">أسود</span>
                              <span className="text-[9px] bg-[#67000D] text-white px-1.5 py-0.5 rounded font-bold">نبيتي</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <CoinsSvg />
                          <span className="text-xs font-bold text-[#063D37]">سعر البستلة</span>
                          <span className="text-2xl font-black text-slate-900 leading-tight">
                            {formatNumber(pkg9L?.price || 545.95)}
                          </span>
                          <span className="text-xs font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">سعر الجالون الأبيض</span>
                          <span className="text-2xl font-black text-slate-900 leading-tight">
                            {formatNumber(pkgWhite?.price || 165)}
                          </span>
                          <span className="text-xs font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">سعر الجالون الألوان</span>
                          <span className="text-2xl font-black text-slate-900 leading-tight">
                            {formatNumber(pkgColors?.price || 180)}
                          </span>
                          <span className="text-xs font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Bottom Guarantee Strips */}
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
              PAGE 3: Sealers, Varnishes & Putties (Exact Product Cards)
             ======================================================== */}
          <div className="price-menu-page relative mx-auto w-[794px] min-w-[794px] max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white text-slate-900 overflow-hidden rounded-md shadow-2xl p-6 flex flex-col justify-between print:m-0 print:w-full print:min-w-0 print:max-w-none print:shadow-none print:rounded-none print:break-after-page">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col text-right">
                    <span className="text-base font-black text-[#063D37] leading-tight">بتروكيما</span>
                    <span className="text-[10px] font-bold text-[#00B4D8]">للدهانات</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-center">
                  <div className="w-12 h-[2px] bg-[#063D37]" />
                  <span className="text-2xl font-black text-[#063D37] tracking-tight">قائمة أسعار</span>
                  <div className="w-2.5 h-2.5 rotate-45 bg-[#E85D04]" />
                  <div className="w-12 h-[2px] bg-[#063D37]" />
                </div>

                <div className="text-left font-mono text-[10px] font-bold text-slate-400">
                  <span>{releaseDate}</span>
                </div>
              </div>

              {/* 5 Cards for Page 3 matching User Image */}
              <div className="space-y-2">
                {/* 1. سيلر مقاوم 333 (Exact Replica of User Screenshot) */}
                {(() => {
                  const p = p333
                  const pkg9L = p?.packages?.find((k) => k.unitName.includes('بستل') || k.weight.includes('9'))
                  const pkg2L = p?.packages?.find((k) => k.unitName.includes('جالون') || k.weight.includes('2.5'))
                  return (
                    <div className="w-full bg-white border-2 border-[#063D37] rounded-2xl overflow-hidden shadow-2xs grid grid-cols-12 items-stretch text-right">
                      {/* Product (Right 6 cols) */}
                      <div className="col-span-6 flex items-center justify-between p-3 pl-2 gap-3">
                        <div className="flex flex-col justify-between h-full py-0.5">
                          <div>
                            <h3 className="text-xl font-black text-[#063D37] leading-tight">
                              سيلر مقاوم 333
                            </h3>
                            <p className="text-xs font-medium text-slate-700 mt-1">
                              سيلر اكريليك مائي داخلي
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="rounded-full border border-[#063D37]/50 px-3 py-0.5 flex items-center gap-1.5 text-xs font-bold text-[#063D37] bg-white">
                              <BadgeHouseSvg />
                              <span>داخلي</span>
                            </div>
                            <div className="rounded-full border border-[#063D37]/50 px-3 py-0.5 flex items-center gap-1.5 text-xs font-bold text-[#063D37] bg-white">
                              <BadgeWandSvg />
                              <span>سهل التطبيق</span>
                            </div>
                          </div>
                        </div>
                        {p?.image && (
                          <img src={p.image} alt={p.name} className="w-24 h-24 object-contain shrink-0 drop-shadow-md" />
                        )}
                      </div>

                      {/* Weight (Middle 3 cols) */}
                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <PaintCanSvg />
                          <span className="text-xs font-bold text-[#063D37] mt-0.5">وزن البستلة</span>
                          <span className="text-xl font-black text-slate-900 mt-0.5">{pkg9L?.weight || '9 لتر'}</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">وزن الجالون</span>
                          <span className="text-xl font-black text-slate-900 mt-0.5">{pkg2L?.weight || '2.5 لتر'}</span>
                        </div>
                      </div>

                      {/* Price (Left 3 cols) */}
                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <CoinsSvg />
                          <span className="text-xs font-bold text-[#063D37] mt-0.5">سعر البستلة</span>
                          <span className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                            {formatNumber(pkg9L?.price || 375.95)}
                          </span>
                          <span className="text-[11px] font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">سعر الجالون</span>
                          <span className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                            {formatNumber(pkg2L?.price || 140)}
                          </span>
                          <span className="text-[11px] font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* 2. ورنيش كلير 444 */}
                {(() => {
                  const p = p444
                  const pkg = p?.packages?.[0]
                  return (
                    <div className="w-full bg-white border-2 border-[#063D37] rounded-2xl overflow-hidden shadow-2xs grid grid-cols-12 items-stretch text-right">
                      <div className="col-span-6 flex items-center justify-between p-3 pl-2 gap-3">
                        <div className="flex flex-col justify-between h-full py-0.5">
                          <div>
                            <h3 className="text-xl font-black text-[#063D37] leading-tight">
                              ورنيش كلير 444
                            </h3>
                            <p className="text-xs font-medium text-slate-700 mt-1">
                              ورنيش اكريليك مائي عالي الشفافية
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="rounded-full border border-[#063D37]/50 px-3 py-0.5 flex items-center gap-1.5 text-xs font-bold text-[#063D37] bg-white">
                              <BadgeHouseSvg />
                              <span>داخلي / خارجي</span>
                            </div>
                            <div className="rounded-full border border-[#063D37]/50 px-3 py-0.5 flex items-center gap-1.5 text-xs font-bold text-[#063D37] bg-white">
                              <BadgeWandSvg />
                              <span>لامع</span>
                            </div>
                          </div>
                        </div>
                        {p?.image && (
                          <img src={p.image} alt={p.name} className="w-24 h-24 object-contain shrink-0 drop-shadow-md" />
                        )}
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-center items-center py-2 px-2 text-center bg-white">
                        <PaintCanSvg />
                        <span className="text-xs font-bold text-[#063D37] mt-1">وزن الجالون</span>
                        <span className="text-xl font-black text-slate-900 mt-0.5">{pkg?.weight || '2.25 لتر'}</span>
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-center items-center py-2 px-2 text-center bg-white">
                        <CoinsSvg />
                        <span className="text-xs font-bold text-[#063D37] mt-1">سعر الجالون</span>
                        <span className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                          {formatNumber(pkg?.price || 200)}
                        </span>
                        <span className="text-[11px] font-bold text-[#063D37]">جنيه مصري</span>
                      </div>
                    </div>
                  )
                })()}

                {/* 3. بلاستيك ايكو كيم */}
                {(() => {
                  const p = pEco
                  const pkg = p?.packages?.[0]
                  return (
                    <div className="w-full bg-white border-2 border-[#063D37] rounded-2xl overflow-hidden shadow-2xs grid grid-cols-12 items-stretch text-right">
                      <div className="col-span-6 flex items-center justify-between p-3 pl-2 gap-3">
                        <div className="flex flex-col justify-between h-full py-0.5">
                          <div>
                            <h3 className="text-xl font-black text-[#063D37] leading-tight">
                              بلاستيك ايكو كيم
                            </h3>
                            <p className="text-xs font-medium text-slate-700 mt-1">
                              دهان مائي بطانة مط للحوائط والأسقف
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="rounded-full border border-[#063D37]/50 px-3 py-0.5 flex items-center gap-1.5 text-xs font-bold text-[#063D37] bg-white">
                              <BadgeHouseSvg />
                              <span>داخلي</span>
                            </div>
                            <div className="rounded-full border border-[#063D37]/50 px-3 py-0.5 flex items-center gap-1.5 text-xs font-bold text-[#063D37] bg-white">
                              <BadgeWandSvg />
                              <span>إقتصادي</span>
                            </div>
                          </div>
                        </div>
                        {p?.image && (
                          <img src={p.image} alt={p.name} className="w-24 h-24 object-contain shrink-0 drop-shadow-md" />
                        )}
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-center items-center py-2 px-2 text-center bg-white">
                        <PaintCanSvg />
                        <span className="text-xs font-bold text-[#063D37] mt-1">وزن البستلة</span>
                        <span className="text-xl font-black text-slate-900 mt-0.5">{pkg?.weight || '9 لتر'}</span>
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-center items-center py-2 px-2 text-center bg-white">
                        <CoinsSvg />
                        <span className="text-xs font-bold text-[#063D37] mt-1">سعر البستلة</span>
                        <span className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                          {formatNumber(pkg?.price || 283.25)}
                        </span>
                        <span className="text-[11px] font-bold text-[#063D37]">جنيه مصري</span>
                      </div>
                    </div>
                  )
                })()}

                {/* 4. معجون بترو 100 */}
                {(() => {
                  const p = p100
                  const pkg15Kg = p?.packages?.find((k) => k.unitName.includes('15') || k.weight.includes('15')) || p?.packages?.[0]
                  const pkg3Kg = p?.packages?.find((k) => k.unitName.includes('3') || k.weight.includes('3')) || p?.packages?.[1]
                  return (
                    <div className="w-full bg-white border-2 border-[#063D37] rounded-2xl overflow-hidden shadow-2xs grid grid-cols-12 items-stretch text-right">
                      <div className="col-span-6 flex items-center justify-between p-3 pl-2 gap-3">
                        <div className="flex flex-col justify-between h-full py-0.5">
                          <div>
                            <h3 className="text-xl font-black text-[#063D37] leading-tight">
                              معجون بترو 100
                            </h3>
                            <p className="text-xs font-medium text-slate-700 mt-1">
                              معجون داخلي جاهز للاستعمال مصنع من أساس كوبوليمر
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="rounded-full border border-[#063D37]/50 px-3 py-0.5 flex items-center gap-1.5 text-xs font-bold text-[#063D37] bg-white">
                              <BadgeHouseSvg />
                              <span>داخلي</span>
                            </div>
                            <div className="rounded-full border border-[#063D37]/50 px-3 py-0.5 flex items-center gap-1.5 text-xs font-bold text-[#063D37] bg-white">
                              <BadgeWandSvg />
                              <span>جاهز للاستعمال</span>
                            </div>
                          </div>
                        </div>
                        {p?.image && (
                          <img src={p.image} alt={p.name} className="w-24 h-24 object-contain shrink-0 drop-shadow-md" />
                        )}
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <SackSvg />
                          <span className="text-xs font-bold text-[#063D37] mt-0.5">وزن الشيكارة</span>
                          <span className="text-xl font-black text-slate-900 mt-0.5">{pkg15Kg?.weight || '15 كجم'}</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">وزن الشيكارة</span>
                          <span className="text-xl font-black text-slate-900 mt-0.5">{pkg3Kg?.weight || '3 كجم'}</span>
                        </div>
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-around py-2 px-2 text-center bg-white">
                        <div className="flex flex-col items-center">
                          <CoinsSvg />
                          <span className="text-xs font-bold text-[#063D37] mt-0.5">سعر الشيكارة 15 كجم</span>
                          <span className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                            {formatNumber(pkg15Kg?.price || 190)}
                          </span>
                          <span className="text-[11px] font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto my-0.5" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-[#063D37]">سعر الشيكارة 3 كجم</span>
                          <span className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                            {formatNumber(pkg3Kg?.price || 47)}
                          </span>
                          <span className="text-[11px] font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* 5. معجون اكريليك بترو 500 */}
                {(() => {
                  const p = p500
                  const pkg15Kg = p?.packages?.[0]
                  return (
                    <div className="w-full bg-white border-2 border-[#063D37] rounded-2xl overflow-hidden shadow-2xs grid grid-cols-12 items-stretch text-right">
                      <div className="col-span-6 flex items-center justify-between p-3 pl-2 gap-3">
                        <div className="flex flex-col justify-between h-full py-0.5">
                          <div>
                            <h3 className="text-xl font-black text-[#063D37] leading-tight">
                              معجون اكريليك بترو 500
                            </h3>
                            <p className="text-xs font-medium text-slate-700 mt-1">
                              معجون اكريليك داخلي وخارجي جاهز للاستخدام
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="rounded-full border border-[#063D37]/50 px-3 py-0.5 flex items-center gap-1.5 text-xs font-bold text-[#063D37] bg-white">
                              <BadgeHouseSvg />
                              <span>داخلي / خارجي</span>
                            </div>
                            <div className="rounded-full border border-[#063D37]/50 px-3 py-0.5 flex items-center gap-1.5 text-xs font-bold text-[#063D37] bg-white">
                              <BadgeWandSvg />
                              <span>جاهز للاستخدام</span>
                            </div>
                          </div>
                        </div>
                        {p?.image && (
                          <img src={p.image} alt={p.name} className="w-24 h-24 object-contain shrink-0 drop-shadow-md" />
                        )}
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-center items-center py-2 px-2 text-center bg-white">
                        <SackSvg />
                        <span className="text-xs font-bold text-[#063D37] mt-1">وزن الشيكارة</span>
                        <span className="text-xl font-black text-slate-900 mt-0.5">{pkg15Kg?.weight || '15 كجم'}</span>
                      </div>

                      <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col justify-center items-center py-2 px-2 text-center bg-white">
                        <CoinsSvg />
                        <span className="text-xs font-bold text-[#063D37] mt-1">سعر الشيكارة 15 كجم</span>
                        <span className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                          {formatNumber(pkg15Kg?.price || 360.5)}
                        </span>
                        <span className="text-[11px] font-bold text-[#063D37]">جنيه مصري</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Bottom Guarantee Strips */}
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
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col text-right">
                    <span className="text-base font-black text-[#063D37] leading-tight">بتروكيما</span>
                    <span className="text-[10px] font-bold text-[#00B4D8]">للدهانات</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-center">
                  <div className="w-12 h-[2px] bg-[#063D37]" />
                  <span className="text-2xl font-black text-[#063D37] tracking-tight">قائمة أسعار</span>
                  <div className="w-2.5 h-2.5 rotate-45 bg-[#E85D04]" />
                  <div className="w-12 h-[2px] bg-[#063D37]" />
                </div>

                <div className="text-left font-mono text-[10px] font-bold text-slate-400">
                  <span>{releaseDate}</span>
                </div>
              </div>

              {/* 3 Industrial Cards Matching PDF */}
              <div className="space-y-3">
                {/* Card 1: برايمر بريكس (Red) */}
                <div className="border-2 border-[#8B1E1E] rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="bg-[#8B1E1E] text-white py-1.5 px-4 text-center font-black text-sm tracking-wide">
                    برايمر بريكس
                  </div>
                  <div className="grid grid-cols-12 p-2.5 items-center gap-2 text-right">
                    {/* Table (Right 8 cols) */}
                    <div className="col-span-8">
                      <table className="w-full text-right text-[10px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-1 px-1.5 text-center w-6">م</th>
                            <th className="py-1 px-2">المنتج</th>
                            <th className="py-1 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <PaintCanSvg />
                                <span>الوزن</span>
                              </div>
                            </th>
                            <th className="py-1 px-2 text-left">
                              <div className="flex items-center justify-end gap-1">
                                <CoinsSvg />
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
                    <div className="col-span-4 flex items-center justify-around border-r-2 border-[#8B1E1E]/40 pr-1">
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
                <div className="border-2 border-[#A37517] rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="bg-[#A37517] text-white py-1.5 px-4 text-center font-black text-sm tracking-wide">
                    كيما كوت
                  </div>
                  <div className="grid grid-cols-12 p-2.5 items-center gap-2 text-right">
                    <div className="col-span-8">
                      <table className="w-full text-right text-[9.5px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-0.5 px-1.5 text-center w-6">م</th>
                            <th className="py-0.5 px-2">المنتج</th>
                            <th className="py-0.5 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <PaintCanSvg />
                                <span>الوزن</span>
                              </div>
                            </th>
                            <th className="py-0.5 px-2 text-left">
                              <div className="flex items-center justify-end gap-1">
                                <CoinsSvg />
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

                    <div className="col-span-4 flex items-center justify-center border-r-2 border-[#A37517]/40 pr-1">
                      {pKemaCoat?.image && (
                        <img src={pKemaCoat.image} alt="كيما كوت" className="w-20 h-20 object-contain drop-shadow-md" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 3: سوبر ستار (Olive Green) */}
                <div className="border-2 border-[#4A6B32] rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="bg-[#4A6B32] text-white py-1.5 px-4 text-center font-black text-sm tracking-wide flex items-center justify-center gap-1.5">
                    <span>★</span>
                    <span>سوبر ستار</span>
                    <span>★</span>
                  </div>
                  <div className="grid grid-cols-12 p-2.5 items-center gap-2 text-right">
                    <div className="col-span-8">
                      <table className="w-full text-right text-[9px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-0.5 px-1 text-center w-5">م</th>
                            <th className="py-0.5 px-1.5">المنتج</th>
                            <th className="py-0.5 px-1.5 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                <PaintCanSvg />
                                <span>الوزن</span>
                              </div>
                            </th>
                            <th className="py-0.5 px-1.5 text-left">
                              <div className="flex items-center justify-end gap-0.5">
                                <CoinsSvg />
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

                    <div className="col-span-4 flex items-center justify-center border-r-2 border-[#4A6B32]/40 pr-1">
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
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="بتروكيما" className="h-10 w-auto object-contain" />
                    <span className="text-base font-black text-[#063D37]">بتروكيما للدهانات</span>
                  </div>
                  <span className="text-2xl font-black text-[#063D37]">• قائمة أسعار إضافية •</span>
                  <span className="text-xs font-mono text-slate-400">{releaseDate}</span>
                </div>

                <div className="space-y-3">
                  {extraProducts.map((p) => {
                    const packages = p.packages || []
                    return (
                      <div key={p._id} className="w-full bg-white border-2 border-[#063D37] rounded-2xl overflow-hidden shadow-2xs grid grid-cols-12 items-stretch text-right">
                        <div className="col-span-6 flex items-center justify-between p-3.5 pl-2 gap-3">
                          <div className="flex flex-col justify-between h-full py-0.5">
                            <div>
                              <h3 className="text-xl font-black text-[#063D37]">{p.name}</h3>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1">{p.description}</p>
                            </div>
                          </div>
                          {p.image && <img src={p.image} alt={p.name} className="w-20 h-20 object-contain shrink-0" />}
                        </div>
                        <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col items-center justify-center p-2 text-center bg-white">
                          <PaintCanSvg />
                          <span className="text-xs font-bold text-[#063D37] mt-1">{packages[0]?.unitName || 'العبوة'}</span>
                          <span className="text-lg font-black text-slate-900 mt-0.5">{packages[0]?.weight || 'حسب الطلب'}</span>
                        </div>
                        <div className="col-span-3 border-r-2 border-[#063D37] flex flex-col items-center justify-center p-2 text-center bg-white">
                          <CoinsSvg />
                          <span className="text-xs font-bold text-[#063D37] mt-1">السعر</span>
                          <span className="text-2xl font-black text-slate-900 mt-0.5">{formatNumber(packages[0]?.price || 0)}</span>
                          <span className="text-[11px] font-bold text-[#063D37]">جنيه مصري</span>
                        </div>
                      </div>
                    )
                  })}
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
