import React, { useState, useRef } from 'react'
import { Calendar, BarChart2, TrendingUp, Info } from 'lucide-react'
import { cn } from '../../lib/utils'

function buildSmoothPath(points, yKey) {
  if (!points || points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0][yKey]}`

  let d = `M ${points[0].x} ${points[0][yKey]}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1[yKey] + (p2[yKey] - p0[yKey]) / 6

    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2[yKey] - (p3[yKey] - p1[yKey]) / 6

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2[yKey]}`
  }

  return d
}

export function AnalyticsTrendChart({ timeSeries = [], activeMetric = 'net_sentiment' }) {
  const [chartMode, setChartMode] = useState('spline') // 'spline' | 'bars'
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const svgRef = useRef(null)

  if (!timeSeries || timeSeries.length === 0) {
    return (
      <div className="p-12 text-center space-y-2 bg-white">
        <Calendar className="h-6 w-6 text-neutral-300 mx-auto" />
        <p className="text-xs font-medium text-neutral-500">No trend history available for this range</p>
      </div>
    )
  }

  // Dimensions
  const width = 840
  const height = 280
  const padding = { top: 24, right: 32, bottom: 36, left: 52 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  // Y-axis configuration based on activeMetric
  let yMin = 0
  let yMax = 100
  let yBaseline = padding.top + chartH
  let yAxisLabels = []
  let metricTitle = 'Net Sentiment'
  let metricColor = '#000000'

  const maxTotal = Math.max(...timeSeries.map((d) => d.total || 0), 1)

  if (activeMetric === 'net_sentiment') {
    yMin = -100
    yMax = 100
    yBaseline = padding.top + chartH / 2
    yAxisLabels = ['+100%', '+50%', '0%', '-50%', '-100%']
    metricTitle = 'Net Sentiment Score'
    metricColor = '#2563eb'
  } else if (activeMetric === 'total') {
    yMin = 0
    yMax = Math.ceil(maxTotal * 1.1) || 10
    yBaseline = padding.top + chartH
    yAxisLabels = [
      `${yMax}`,
      `${Math.round(yMax * 0.75)}`,
      `${Math.round(yMax * 0.5)}`,
      `${Math.round(yMax * 0.25)}`,
      '0',
    ]
    metricTitle = 'Total Searches'
    metricColor = '#2563eb'
  } else if (activeMetric === 'positive_pct') {
    yMin = 0
    yMax = 100
    yBaseline = padding.top + chartH
    yAxisLabels = ['100%', '75%', '50%', '25%', '0%']
    metricTitle = 'Positive Sentiment Rate'
    metricColor = '#059669'
  } else if (activeMetric === 'negative_pct') {
    yMin = 0
    yMax = 100
    yBaseline = padding.top + chartH
    yAxisLabels = ['100%', '75%', '50%', '25%', '0%']
    metricTitle = 'Negative Sentiment Rate'
    metricColor = '#dc2626'
  }

  // Calculate coordinates
  const points = timeSeries.map((d, i) => {
    const x =
      timeSeries.length === 1
        ? padding.left + chartW / 2
        : padding.left + (chartW / (timeSeries.length - 1)) * i

    let metricVal = 0
    if (activeMetric === 'net_sentiment') metricVal = d.net_sentiment ?? 0
    else if (activeMetric === 'total') metricVal = d.total ?? 0
    else if (activeMetric === 'positive_pct') metricVal = d.positive_pct ?? 0
    else if (activeMetric === 'negative_pct') metricVal = d.negative_pct ?? 0

    // Clamp
    const clampedVal = Math.max(yMin, Math.min(yMax, metricVal))
    const yRatio = (clampedVal - yMin) / (yMax - yMin)
    const y = padding.top + chartH - yRatio * chartH

    return {
      ...d,
      x,
      y,
      metricVal,
      index: i,
    }
  })

  // Paths
  const linePath = buildSmoothPath(points, 'y')
  const bottomY = padding.top + chartH
  const areaPath =
    points.length === 1
      ? ''
      : `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`

  // Hover detection handler
  const handleMouseMove = (e) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * width

    // Find nearest point
    let closestIdx = 0
    let minDiff = Infinity
    points.forEach((pt, i) => {
      const diff = Math.abs(pt.x - mouseX)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = i
      }
    })
    setHoveredIndex(closestIdx)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
  }

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null

  return (
    <div className="bg-white">
      {/* Chart Canvas Area */}
      <div className="p-4 sm:p-5">
        {/* Top chart subhead with view switcher */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-600">
              {metricTitle}
            </span>
            <span className="text-[11px] text-neutral-400">
              • Daily breakdown
            </span>
          </div>

          {activeMetric === 'total' && (
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setChartMode('spline')}
                className={cn(
                  'px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer',
                  chartMode === 'spline' ? 'bg-neutral-100 text-black' : 'text-neutral-500 hover:text-black'
                )}
              >
                Line
              </button>
              <button
                type="button"
                onClick={() => setChartMode('bars')}
                className={cn(
                  'px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer',
                  chartMode === 'bars' ? 'bg-neutral-100 text-black' : 'text-neutral-500 hover:text-black'
                )}
              >
                Bars
              </button>
            </div>
          )}
        </div>

        {/* SVG Container */}
        <div className="relative w-full overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricColor} stopOpacity="0.08" />
                <stop offset="80%" stopColor={metricColor} stopOpacity="0.01" />
                <stop offset="100%" stopColor={metricColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const gridY = padding.top + chartH * ratio
              return (
                <line
                  key={`grid-${idx}`}
                  x1={padding.left}
                  y1={gridY}
                  x2={width - padding.right}
                  y2={gridY}
                  stroke="#f5f5f5"
                  strokeWidth="1"
                />
              )
            })}

            {/* Neutral Baseline (0% for NSS, bottom for volume) */}
            <line
              x1={padding.left}
              y1={yBaseline}
              x2={width - padding.right}
              y2={yBaseline}
              stroke="#e5e5e5"
              strokeDasharray={activeMetric === 'net_sentiment' ? '3 3' : 'none'}
              strokeWidth="1"
            />

            {/* Y-Axis Labels */}
            {yAxisLabels.map((lbl, idx) => {
              const lblY = padding.top + (chartH / (yAxisLabels.length - 1)) * idx + 3
              return (
                <text
                  key={`lbl-y-${idx}`}
                  x={padding.left - 10}
                  y={lblY}
                  textAnchor="end"
                  className="text-[10px] fill-neutral-400 font-mono"
                >
                  {lbl}
                </text>
              )
            })}

            {/* Scrubber guide line on hover */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={bottomY}
                stroke="#737373"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
            )}

            {/* Chart mode: Spline or Bars */}
            {chartMode === 'spline' || activeMetric !== 'total' ? (
              <>
                {/* Area under curve */}
                {points.length > 1 && (
                  <path d={areaPath} fill="url(#areaGradient)" />
                )}

                {/* Main line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={metricColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Point markers */}
                {points.map((pt, i) => {
                  const isHovered = activePoint?.index === i
                  return (
                    <circle
                      key={`pt-${pt.date}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5 : points.length > 20 ? 0 : 3}
                      fill={metricColor}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all duration-100"
                    />
                  )
                })}
              </>
            ) : (
              /* Stacked Volume Bars */
              points.map((pt) => {
                const barWidth = Math.min(28, Math.max(12, (chartW / points.length) * 0.5))
                const xPos = pt.x - barWidth / 2
                const totalH = (pt.total / yMax) * chartH

                const posH = (pt.positive / yMax) * chartH
                const negH = (pt.negative / yMax) * chartH
                const neuH = (pt.neutral / yMax) * chartH
                const mixH = (pt.mixed / yMax) * chartH

                return (
                  <g key={`bar-${pt.date}`}>
                    {posH > 0 && (
                      <rect
                        x={xPos}
                        y={bottomY - posH}
                        width={barWidth}
                        height={posH}
                        fill="#16a34a"
                        rx="1"
                      />
                    )}
                    {negH > 0 && (
                      <rect
                        x={xPos}
                        y={bottomY - posH - negH}
                        width={barWidth}
                        height={negH}
                        fill="#dc2626"
                        rx="1"
                      />
                    )}
                    {neuH > 0 && (
                      <rect
                        x={xPos}
                        y={bottomY - posH - negH - neuH}
                        width={barWidth}
                        height={neuH}
                        fill="#a3a3a3"
                        rx="1"
                      />
                    )}
                    {mixH > 0 && (
                      <rect
                        x={xPos}
                        y={bottomY - totalH}
                        width={barWidth}
                        height={mixH}
                        fill="#d97706"
                        rx="1"
                      />
                    )}
                  </g>
                )
              })
            )}

            {/* X-Axis Date Labels */}
            {points.map((pt, i) => {
              const step = Math.ceil(points.length / 7)
              if (i % step !== 0 && i !== points.length - 1 && i !== 0) return null

              return (
                <text
                  key={`lbl-x-${pt.date}`}
                  x={pt.x}
                  y={height - 12}
                  textAnchor="middle"
                  className="text-[10px] fill-neutral-400 font-medium"
                >
                  {pt.display_date}
                </text>
              )
            })}
          </svg>

          {/* YouTube Studio Hover Tooltip */}
          {activePoint && (
            <div
              className="absolute pointer-events-none z-20 bg-neutral-900 text-white rounded-lg p-3 text-xs shadow-lg space-y-1.5 transition-all duration-75"
              style={{
                left: `${Math.min(width - 200, Math.max(padding.left, activePoint.x - 90))}px`,
                top: `${padding.top + 8}px`,
                minWidth: '180px',
              }}
            >
              <div className="flex items-center justify-between border-b border-neutral-700 pb-1 font-medium text-neutral-300 text-[11px]">
                <span>{activePoint.display_date}</span>
                <span className="font-mono text-[10px] text-neutral-400">{activePoint.date}</span>
              </div>

              {/* Active Metric Callout */}
              <div className="flex items-center justify-between font-semibold pt-0.5">
                <span className="text-white text-xs">{metricTitle}:</span>
                <span className="font-mono text-xs">
                  {activeMetric === 'net_sentiment'
                    ? `${activePoint.net_sentiment > 0 ? '+' : ''}${activePoint.net_sentiment}%`
                    : activeMetric === 'total'
                    ? activePoint.total
                    : activeMetric === 'positive_pct'
                    ? `${activePoint.positive_pct}%`
                    : `${activePoint.negative_pct}%`}
                </span>
              </div>

              {/* Data Breakdown */}
              <div className="pt-1 border-t border-neutral-800 space-y-0.5 text-[10px] text-neutral-400">
                <div className="flex justify-between">
                  <span className="text-emerald-400">Positive:</span>
                  <span className="font-mono text-neutral-200">
                    {activePoint.positive} ({activePoint.positive_pct}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-400">Negative:</span>
                  <span className="font-mono text-neutral-200">
                    {activePoint.negative} ({activePoint.negative_pct}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Neutral / Mixed:</span>
                  <span className="font-mono text-neutral-200">
                    {(activePoint.neutral || 0) + (activePoint.mixed || 0)}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-neutral-300 pt-0.5">
                  <span>Total:</span>
                  <span className="font-mono">{activePoint.total} searches</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-neutral-100 text-xs text-neutral-500 bg-white">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <Info className="h-3 w-3" />
          <span>Timeline aggregated by user activity timestamp</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span className="text-neutral-700">Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            <span className="text-neutral-700">Negative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-neutral-400" />
            <span className="text-neutral-700">Neutral</span>
          </div>
        </div>
      </div>
    </div>
  )
}
