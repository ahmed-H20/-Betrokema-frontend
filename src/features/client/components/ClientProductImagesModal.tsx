import { useEffect, useMemo, useState, useCallback } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { Product } from '@/api/products.schema'
import { resolveImageUrl } from '@/lib/image'

type ClientProductImagesModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  initialIndex?: number
}

export function ClientProductImagesModal({
  open,
  onOpenChange,
  product,
  initialIndex = 0,
}: ClientProductImagesModalProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  // Deduplicate and gather all product images (cover image + gallery images)
  const allImages = useMemo(() => {
    if (!product) return []
    const list: string[] = []
    if (product.image && product.image.trim()) {
      list.push(product.image.trim())
    }
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        const trimmed = (img || '').trim()
        if (trimmed && !list.includes(trimmed)) {
          list.push(trimmed)
        }
      })
    }
    return list
  }, [product])

  useEffect(() => {
    if (open) {
      setActiveIndex(
        initialIndex >= 0 && initialIndex < allImages.length ? initialIndex : 0,
      )
    }
  }, [open, initialIndex, allImages.length])

  const handleNext = useCallback(() => {
    if (allImages.length <= 1) return
    setActiveIndex((prev) => (prev + 1) % allImages.length)
  }, [allImages.length])

  const handlePrev = useCallback(() => {
    if (allImages.length <= 1) return
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }, [allImages.length])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') {
        // In RTL, right arrow corresponds to previous item
        handlePrev()
      } else if (e.key === 'ArrowLeft') {
        // In RTL, left arrow corresponds to next item
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, handleNext, handlePrev])

  if (!product) return null

  const activeImage = allImages[activeIndex] || ''
  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : ''

  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in-0" />

        {/* Modal Content */}
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-slate-950/95 text-white shadow-2xl focus:outline-none md:inset-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[92vh] md:w-[92vw] md:max-w-3xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl border border-white/10"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4 bg-slate-900/60 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <span className="material-symbols-outlined text-[20px]">
                  photo_library
                </span>
              </div>
              <div className="min-w-0">
                <DialogPrimitive.Title className="truncate font-bold text-sm sm:text-base text-white">
                  {product.name}
                </DialogPrimitive.Title>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  {categoryName && (
                    <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] text-orange-300">
                      {categoryName}
                    </span>
                  )}
                  {product.code && <span>#{product.code}</span>}
                  {allImages.length > 0 && (
                    <span className="text-slate-400">
                      • صورة {activeIndex + 1} من {allImages.length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DialogPrimitive.Close
              aria-label="إغلاق المعرض"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Main Viewport */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-3 sm:p-6 min-h-[300px] sm:min-h-[420px] max-h-[60vh] sm:max-h-[66vh] bg-black/40">
            {allImages.length > 0 ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <img
                  alt={`${product.name} - صورة ${activeIndex + 1}`}
                  className="max-h-[55vh] sm:max-h-[60vh] max-w-full rounded-xl object-contain drop-shadow-2xl transition-all duration-300 select-none"
                  key={activeImage}
                  src={resolveImageUrl(activeImage)}
                />

                {/* Floating Image Counter Badge */}
                <div className="absolute top-2 start-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md border border-white/15">
                  <span className="material-symbols-outlined text-[13px] text-orange-400">
                    image
                  </span>
                  <span>
                    {activeIndex + 1} / {allImages.length}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400 p-8">
                <span className="material-symbols-outlined text-[48px] text-slate-600">
                  image_not_supported
                </span>
                <p className="text-xs">لا توجد صور إضافية لهذا المنتج</p>
              </div>
            )}

            {/* Previous Button (Right arrow in RTL) */}
            {allImages.length > 1 && (
              <button
                aria-label="الصورة السابقة"
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/15 transition-all hover:bg-orange-500 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                onClick={handlePrev}
                type="button"
              >
                <span className="material-symbols-outlined text-[24px]">
                  chevron_right
                </span>
              </button>
            )}

            {/* Next Button (Left arrow in RTL) */}
            {allImages.length > 1 && (
              <button
                aria-label="الصورة التالية"
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/15 transition-all hover:bg-orange-500 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                onClick={handleNext}
                type="button"
              >
                <span className="material-symbols-outlined text-[24px]">
                  chevron_left
                </span>
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {allImages.length > 1 && (
            <div className="shrink-0 border-t border-white/10 bg-slate-900/80 px-4 py-3 sm:px-6 backdrop-blur-md">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {allImages.map((img, idx) => {
                  const isActive = idx === activeIndex
                  return (
                    <button
                      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                        isActive
                          ? 'border-orange-500 scale-105 shadow-md shadow-orange-500/20 ring-2 ring-orange-400/40'
                          : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/40'
                      }`}
                      key={`${img}-${idx}`}
                      onClick={() => setActiveIndex(idx)}
                      type="button"
                    >
                      <img
                        alt={`معاينة ${idx + 1}`}
                        className="h-full w-full object-cover"
                        src={resolveImageUrl(img)}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
