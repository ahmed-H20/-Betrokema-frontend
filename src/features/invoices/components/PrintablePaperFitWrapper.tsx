import React, { useRef, useState, useEffect } from 'react'

export interface PrintablePaperFitWrapperProps {
  paperZoomMode?: 'fit' | 'full'
  children: React.ReactNode
  className?: string
  innerRef?: React.RefObject<HTMLDivElement | null>
}

/**
 * Mathematically scales and centers the 794px A4 invoice paper
 * to perfectly fit any mobile screen width without overflow, clipping, or layout collapse.
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

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      if (el) setContainerWidth(el.clientWidth)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    const paper = paperElementRef.current
    if (paper) {
      const h = paper.offsetHeight
      if (h > 0 && Math.abs(h - paperHeight) > 5) {
        setPaperHeight(h)
      }
    }
  })

  // Calculate dynamic scale factor
  const scale =
    paperZoomMode === 'fit' && containerWidth > 0 && containerWidth < 810
      ? Math.min(1, Math.max(0.32, (containerWidth - 20) / 794))
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
