import { useId, useState } from 'react'
import type { MonthlyTrendItem } from '@/api/analytics.schema'
import { ANALYTICS_CHART_SUBTITLE, ANALYTICS_CHART_TITLE } from '@/constants/strings'
import { cn } from '@/lib/cn'
import { formatCurrency, formatNumber } from '@/lib/format'

interface RevenueTrendCardProps {
  items: MonthlyTrendItem[]
}

const monthNames: Record<number, string> = {
  1: 'يناير',
  2: 'فبراير',
  3: 'مارس',
  4: 'أبريل',
  5: 'مايو',
  6: 'يونيو',
  7: 'يوليو',
  8: 'أغسطس',
  9: 'سبتمبر',
  10: 'أكتوبر',
  11: 'نوفمبر',
  12: 'ديسمبر',
}

function getNiceCeiling(val: number): number {
  if (val <= 0) return 50000
  if (val <= 10000) return Math.ceil(val / 2000) * 2000 || 10000
  if (val <= 50000) return Math.ceil(val / 10000) * 10000
  if (val <= 150000) return Math.ceil(val / 25000) * 25000
  if (val <= 500000) return Math.ceil(val / 50000) * 50000
  if (val <= 1000000) return Math.ceil(val / 100000) * 100000
  return Math.ceil(val / 500000) * 500000
}

function buildCurvedPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

export function RevenueTrendCard({ items }: RevenueTrendCardProps) {
  const [chartMode, setChartMode] = useState<'area' | 'bar'>('area')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const idPrefix = useId().replace(/:/g, '_')

  // Calculate scales and coordinates
  const n = items.length
  const rawMax = Math.max(1, ...items.map((i) => Math.max(i.revenue, i.collected)))
  const maxScale = getNiceCeiling(rawMax)

  // SVG dimensions
  const svgWidth = 840
  const svgHeight = 290
  const padTop = 25
  const padBottom = 45
  const padLeft = 85
  const padRight = 30
  const plotWidth = svgWidth - padLeft - padRight
  const plotHeight = svgHeight - padTop - padBottom
  const baselineY = padTop + plotHeight

  // Grid steps (0%, 25%, 50%, 75%, 100%)
  const gridSteps = [1, 0.75, 0.5, 0.25, 0]

  // Compute point positions for each month item
  const points = items.map((item, idx) => {
    const x = padLeft + (n > 1 ? idx * (plotWidth / (n - 1)) : plotWidth / 2)
    const revRatio = Math.max(0, Math.min(1, item.revenue / maxScale))
    const colRatio = Math.max(0, Math.min(1, item.collected / maxScale))
    const yRev = baselineY - revRatio * plotHeight
    const yCol = baselineY - colRatio * plotHeight
    return {
      item,
      x,
      yRev,
      yCol,
      revRatio,
      colRatio,
    }
  })

  // Area paths
  const revPoints = points.map((p) => ({ x: p.x, y: p.yRev }))
  const colPoints = points.map((p) => ({ x: p.x, y: p.yCol }))
  const revCurve = buildCurvedPath(revPoints)
  const colCurve = buildCurvedPath(colPoints)

  const firstX = points[0]?.x ?? padLeft
  const lastX = points[points.length - 1]?.x ?? padLeft + plotWidth

  const revAreaPath = revCurve
    ? `${revCurve} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`
    : ''
  const colAreaPath = colCurve
    ? `${colCurve} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`
    : ''

  // Total summary metrics
  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0)
  const totalCollected = items.reduce((s, i) => s + i.collected, 0)
  const totalOrders = items.reduce((s, i) => s + i.ordersCount, 0)
  const avgMonthlyRev = Math.round(totalRevenue / (n || 1))
  const overallRate = totalRevenue > 0 ? ((totalCollected / totalRevenue) * 100).toFixed(1) : '0'

  // Hovered item details
  const activeItem = hoveredIdx !== null && items[hoveredIdx] ? items[hoveredIdx] : null
  const activePoint = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null

  return (
    <div className="flex flex-col gap-space-md rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm transition-all">
      {/* Header with Title and Controls */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[20px]">show_chart</span>
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                {ANALYTICS_CHART_TITLE}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {ANALYTICS_CHART_SUBTITLE}
              </p>
            </div>
          </div>
        </div>

        {/* Chart View Toggle & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-3 rounded-lg bg-surface-container-low px-3 py-1.5 text-label-sm font-label-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1B4965]" />
              <span className="text-on-surface">إجمالي المبيعات</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#059669]" />
              <span className="text-on-surface">التحصيلات الفعلية</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg bg-surface-container-low p-0.5 text-label-sm">
            <button
              className={cn(
                'flex items-center gap-1 rounded-md px-2.5 py-1 transition-all',
                chartMode === 'area'
                  ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface',
              )}
              onClick={() => setChartMode('area')}
              title="مخطط انسيابي مساحي"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">area_chart</span>
              <span>منحنى</span>
            </button>
            <button
              className={cn(
                'flex items-center gap-1 rounded-md px-2.5 py-1 transition-all',
                chartMode === 'bar'
                  ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface',
              )}
              onClick={() => setChartMode('bar')}
              title="مخطط أعمدة مقارنة"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">bar_chart</span>
              <span>أعمدة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Container */}
      <div className="relative w-full overflow-hidden rounded-xl bg-surface-container-low/40 p-2 sm:p-4">
        {/* Floating Tooltip when Hovering */}
        {activeItem && activePoint && (
          <div
            className="pointer-events-none absolute z-30 flex flex-col gap-1 rounded-xl border border-outline-variant/30 bg-surface-container-lowest/95 p-3 text-on-surface shadow-xl backdrop-blur-md transition-all duration-150"
            style={{
              left: `${Math.min(
                Math.max(12, (activePoint.x / svgWidth) * 100),
                80,
              )}%`,
              top: '12px',
              transform: 'translateX(-50%)',
              minWidth: '200px',
            }}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-1.5 text-label-md font-bold text-primary">
              <span>
                {monthNames[activeItem.month] || activeItem.month} {activeItem.year}
              </span>
              <span className="rounded bg-primary-container/20 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                {activeItem.ordersCount} فاتورة
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 text-label-sm">
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="h-2 w-2 rounded-full bg-[#1B4965]" />
                المبيعات:
              </span>
              <span className="font-bold text-[#1B4965]">
                {formatCurrency(activeItem.revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between text-label-sm">
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="h-2 w-2 rounded-full bg-[#059669]" />
                التحصيلات:
              </span>
              <span className="font-bold text-[#059669]">
                {formatCurrency(activeItem.collected)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-1 text-[11px] text-on-surface-variant">
              <span>كفاءة التحصيل:</span>
              <span className="font-bold text-secondary">
                {activeItem.revenue > 0
                  ? `${((activeItem.collected / activeItem.revenue) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        )}

        {/* SVG Chart Graphic */}
        <div className="w-full">
          <svg
            className="w-full overflow-visible"
            preserveAspectRatio="xMidYMid meet"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          >
            <defs>
              {/* Gradients for Area Chart */}
              <linearGradient
                id={`${idPrefix}_revAreaGrad`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#1B4965" stopOpacity="0.32" />
                <stop offset="85%" stopColor="#1B4965" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#1B4965" stopOpacity="0" />
              </linearGradient>

              <linearGradient
                id={`${idPrefix}_colAreaGrad`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                <stop offset="85%" stopColor="#059669" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0" />
              </linearGradient>

              {/* Gradients for Bar Chart */}
              <linearGradient
                id={`${idPrefix}_revBarGrad`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#2E6F95" />
                <stop offset="100%" stopColor="#1B4965" />
              </linearGradient>

              <linearGradient
                id={`${idPrefix}_colBarGrad`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              {/* Glow Filter for Active Nodes */}
              <filter
                id={`${idPrefix}_glow`}
                height="200%"
                width="200%"
                x="-50%"
                y="-50%"
              >
                <feDropShadow
                  dx="0"
                  dy="2"
                  floodColor="#1B4965"
                  floodOpacity="0.3"
                  stdDeviation="3"
                />
              </filter>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {gridSteps.map((fraction) => {
              const yVal = padTop + (1 - fraction) * plotHeight
              const labelAmount = Math.round(maxScale * fraction)
              return (
                <g key={fraction}>
                  <line
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    strokeOpacity="0.12"
                    strokeWidth="1"
                    x1={padLeft}
                    x2={svgWidth - padRight}
                    y1={yVal}
                    y2={yVal}
                  />
                  <text
                    alignmentBaseline="middle"
                    className="text-[11px] font-medium fill-on-surface-variant select-none"
                    textAnchor="end"
                    x={padLeft - 10}
                    y={yVal}
                  >
                    {formatCurrency(labelAmount)}
                  </text>
                </g>
              )
            })}

            {/* X-Axis Baseline */}
            <line
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              x1={padLeft}
              x2={svgWidth - padRight}
              y1={baselineY}
              y2={baselineY}
            />

            {/* Area Chart Mode Graphics */}
            {chartMode === 'area' && (
              <>
                {/* Revenue Filled Area */}
                {revAreaPath && (
                  <path
                    d={revAreaPath}
                    fill={`url(#${idPrefix}_revAreaGrad)`}
                    className="transition-all duration-300"
                  />
                )}

                {/* Collections Filled Area */}
                {colAreaPath && (
                  <path
                    d={colAreaPath}
                    fill={`url(#${idPrefix}_colAreaGrad)`}
                    className="transition-all duration-300"
                  />
                )}

                {/* Collections Curved Stroke */}
                {colCurve && (
                  <path
                    d={colCurve}
                    fill="none"
                    stroke="#059669"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    className="transition-all duration-300"
                  />
                )}

                {/* Revenue Curved Stroke */}
                {revCurve && (
                  <path
                    d={revCurve}
                    fill="none"
                    stroke="#1B4965"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    className="transition-all duration-300"
                  />
                )}

                {/* Data Points / Circular Nodes */}
                {points.map((pt, idx) => {
                  const isHovered = hoveredIdx === idx
                  return (
                    <g key={pt.item.label}>
                      {/* Active Column Guide Line */}
                      {isHovered && (
                        <line
                          stroke="#1B4965"
                          strokeDasharray="3 3"
                          strokeOpacity="0.4"
                          strokeWidth="1.5"
                          x1={pt.x}
                          x2={pt.x}
                          y1={padTop}
                          y2={baselineY}
                        />
                      )}

                      {/* Revenue Node */}
                      <circle
                        cx={pt.x}
                        cy={pt.yRev}
                        fill="#1B4965"
                        filter={isHovered ? `url(#${idPrefix}_glow)` : undefined}
                        r={isHovered ? 6.5 : 4.5}
                        stroke="#ffffff"
                        strokeWidth={isHovered ? 2.5 : 2}
                        className="transition-all duration-150 cursor-pointer"
                      />

                      {/* Collected Node */}
                      <circle
                        cx={pt.x}
                        cy={pt.yCol}
                        fill="#059669"
                        filter={isHovered ? `url(#${idPrefix}_glow)` : undefined}
                        r={isHovered ? 5.5 : 3.5}
                        stroke="#ffffff"
                        strokeWidth={isHovered ? 2 : 1.5}
                        className="transition-all duration-150 cursor-pointer"
                      />
                    </g>
                  )
                })}
              </>
            )}

            {/* Bar Chart Mode Graphics */}
            {chartMode === 'bar' && (
              <>
                {points.map((pt, idx) => {
                  const isHovered = hoveredIdx === idx
                  const slotWidth = (plotWidth / n) * 0.65
                  const barW = Math.max(8, Math.min(26, slotWidth / 2 - 2))
                  const centerX = pt.x

                  const revH = Math.max(4, pt.revRatio * plotHeight)
                  const colH = Math.max(4, pt.colRatio * plotHeight)
                  const revY = baselineY - revH
                  const colY = baselineY - colH

                  return (
                    <g key={pt.item.label}>
                      {/* Guide Background Slot on Hover */}
                      {isHovered && (
                        <rect
                          fill="currentColor"
                          fillOpacity="0.04"
                          height={plotHeight}
                          rx="6"
                          width={slotWidth + 12}
                          x={centerX - slotWidth / 2 - 6}
                          y={padTop}
                        />
                      )}

                      {/* Revenue Bar */}
                      <rect
                        fill={`url(#${idPrefix}_revBarGrad)`}
                        height={revH}
                        opacity={isHovered ? 1 : 0.9}
                        rx="4"
                        width={barW}
                        x={centerX - barW - 1.5}
                        y={revY}
                        className="transition-all duration-200 cursor-pointer"
                      />

                      {/* Collected Bar */}
                      <rect
                        fill={`url(#${idPrefix}_colBarGrad)`}
                        height={colH}
                        opacity={isHovered ? 1 : 0.9}
                        rx="4"
                        width={barW}
                        x={centerX + 1.5}
                        y={colY}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    </g>
                  )
                })}
              </>
            )}

            {/* X-Axis Labels (Months) */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIdx === idx
              const mName = monthNames[pt.item.month] || `${pt.item.month}`
              return (
                <g key={`x_label_${pt.item.label}`}>
                  <text
                    className={cn(
                      'text-[12px] select-none transition-all duration-150',
                      isHovered
                        ? 'font-bold fill-primary text-[13px]'
                        : 'font-medium fill-on-surface-variant',
                    )}
                    textAnchor="middle"
                    x={pt.x}
                    y={baselineY + 22}
                  >
                    {mName}
                  </text>
                  {isHovered && (
                    <circle
                      cx={pt.x}
                      cy={baselineY + 32}
                      fill="#1B4965"
                      r="2"
                    />
                  )}
                </g>
              )
            })}

            {/* Invisible Full-Height Column Slices for Easy Hover Tracking */}
            {points.map((pt, idx) => {
              const sliceW = plotWidth / (n || 1)
              const sliceX = pt.x - sliceW / 2
              return (
                <rect
                  key={`hover_zone_${pt.item.label}`}
                  fill="transparent"
                  height={svgHeight}
                  width={sliceW}
                  x={sliceX}
                  y={0}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="cursor-pointer"
                />
              )}
            )}
          </svg>
        </div>
      </div>

      {/* KPI Footprint Row Below Chart */}
      <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low p-3 transition-colors hover:bg-surface-container">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            متوسط المبيعات الشهري
          </span>
          <span className="font-headline-sm text-headline-sm font-bold text-primary">
            {formatCurrency(avgMonthlyRev)}
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low p-3 transition-colors hover:bg-surface-container">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            إجمالي التحصيلات
          </span>
          <span className="font-headline-sm text-headline-sm font-bold text-[#059669]">
            {formatCurrency(totalCollected)}
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low p-3 transition-colors hover:bg-surface-container">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            معدل التحصيل العام
          </span>
          <span className="font-headline-sm text-headline-sm font-bold text-secondary">
            {overallRate}%
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low p-3 transition-colors hover:bg-surface-container">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            حركات الفواتير النشطة
          </span>
          <span className="font-headline-sm text-headline-sm font-bold text-primary">
            {formatNumber(totalOrders)} فاتورة
          </span>
        </div>
      </div>
    </div>
  )
}
