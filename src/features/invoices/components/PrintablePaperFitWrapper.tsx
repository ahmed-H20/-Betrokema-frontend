import React, { useRef, useState, useEffect } from 'react'

export interface PrintablePaperFitWrapperProps {
  paperZoomMode?: 'fit' | 'full'
  children: React.ReactNode
  className?: string
  innerRef?: React.RefObject<HTMLDivElement | null>
}

/**
 * Mathematically scales and centers the 794px A4 invoice paper
 * to perfectly fit any mobile or desktop screen width without overflow or clipping.
 * Built with throttled observers to prevent infinite render loops.
 */
export function PrintablePaperFitWrapper({
  paperZoomMode = 'fit',
  children,
  className = '',
  innerRef,
}: PrintablePaperFitWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const localPaperRef = useRef<HTMLDivElement>(null)
  const paperElementRef = innerRef || localPaperRef

  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [paperHeight, setPaperHeight] = useState<number>(1123)

  // 1. Observe container width changes (debounced with requestAnimationFrame)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let rafId: number | null = null
    const measure = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!el) return
        const w = el.clientWidth
        setContainerWidth((prev) => (Math.abs(prev - w) > 4 ? w : prev))
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  // 2. Observe paper element height safely
  useEffect(() => {
    const paper = paperElementRef.current
    if (!paper) return

    let rafId: number | null = null
    const measureHeight = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!paper) return
        const h = paper.offsetHeight
        if (h > 0) {
          setPaperHeight((prev) => (Math.abs(prev - h) > 30 ? h : prev))
        }
      })
    }

    measureHeight()
    const ro = new ResizeObserver(measureHeight)
    ro.observe(paper)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [paperElementRef])

  // Calculate dynamic scale factor
  const scale =
    paperZoomMode === 'fit' && containerWidth > 0 && containerWidth < 810
      ? Math.min(1, Math.max(0.32, (containerWidth - 24) / 794))
      : 1

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center items-start overflow-x-auto ${className}`}
    >
      <div
        style={
          scale < 1
            ? {
                width: `${Math.round(794 * scale)}px`,
                height: `${Math.round(paperHeight * scale)}px`,
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
                margin: '0 auto',
              }
            : {
                width: '794px',
                minWidth: '794px',
                margin: '0 auto',
              }
        }
      >
        <div
          ref={paperElementRef as React.RefObject<HTMLDivElement>}
          className="w-[794px] min-w-[794px] max-w-[794px] bg-white shadow-xl rounded-lg overflow-hidden"
          style={
            scale < 1
              ? {
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  transform: `translateX(-50%) scale(${scale})`,
                  transformOrigin: 'top center',
                }
              : undefined
          }
        >
          {children}
        </div>
      </div>
    </div>
  )
}
