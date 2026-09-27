import React, { useState } from 'react'
import { TrendingUp, Calendar, BarChart2 } from 'lucide-react'
import { cn } from '../../lib/utils'

// Helper to construct a smooth cubic bezier SVG path from a set of 2D points
function buildSmoothPath(points, yKey) {
  if (points.length === 0) return ''
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

export function AnalyticsTrendChart({ timeSeries = [] }) {
  const [activeMode, setActiveMode] = useState('trajectory') // 'trajectory' or 'volume'
  const [hoveredPoint, setHoveredPoint] = useState(null)

  if (!timeSeries || timeSeries.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-white/75 backdrop-blur-md border border-[#ecd2be]/80 text-center space-y-2">
        <Calendar className="h-8 w-8 text-[#ba4f1a]/50 mx-auto" />
        <h3 className="text-sm font-bold text-[#22130b]">No Trend History Yet</h3>
        <p className="text-xs text-[#786154] max-w-sm mx-auto">
          Analyze customer feedback in Single Review mode to chart sentiment trends over time.
        </p>
      </div>
    )
  }

  // Dimensions
  const width = 840
  const height = 300
  const padding = { top: 28, right: 36, bottom: 44, left: 52 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const maxTotal = Math.max(...timeSeries.map((d) => d.total), 1)

  // Map points to SVG coordinates
  const points = timeSeries.map((d, i) => {
    const x =
      timeSeries.length === 1
        ? padding.left + chartW / 2
        : padding.left + (chartW / (timeSeries.length - 1)) * i

    // Net Sentiment Trajectory (-100 to +100):
    const clampedNss = Math.max(-100, Math.min(100, d.net_sentiment))
    const trajY = padding.top + chartH - ((clampedNss + 100) / 200) * chartH

    // Volume total Y:
    const volY = padding.top + chartH - (d.total / maxTotal) * chartH

    return {
      ...d,
      x,
      trajY,
      volY,
      index: i,
    }
  })

  // Smooth line & area path
  const trajectoryLinePath = buildSmoothPath(points, 'trajY')
  const baselineY = padding.top + chartH / 2 // NSS = 0 axis
  const bottomY = padding.top + chartH

  const trajectoryAreaPath =
    points.length === 1
      ? ''
      : `${trajectoryLinePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#ecd2be]/80 shadow-xs space-y-4">
      {/* Header and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#ba4f1a]" />
            <h3 className="text-sm font-bold text-[#22130b] tracking-tight">
              Sentiment Trajectory Timeline
            </h3>
          </div>
          <p className="text-[11px] text-[#786154]">
            {activeMode === 'trajectory'
              ? 'Net polarity shift tracking positive vs negative sentiment momentum.'
              : 'Daily search volume classified across positive, negative, neutral, and mixed sentiments.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/90 border border-[#ecd2be] text-[11px] font-semibold self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveMode('trajectory')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer select-none',
              activeMode === 'trajectory'
                ? 'bg-gradient-to-r from-[#d96526] to-[#ba4f1a] text-white shadow-2xs'
                : 'text-[#614b3f] hover:text-[#22130b]'
            )}
          >
            <TrendingUp className="h-3 w-3" />
            <span>Net Polarity</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('volume')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer select-none',
              activeMode === 'volume'
                ? 'bg-gradient-to-r from-[#d96526] to-[#ba4f1a] text-white shadow-2xs'
                : 'text-[#614b3f] hover:text-[#22130b]'
            )}
          >
            <BarChart2 className="h-3 w-3" />
            <span>Volume Bars</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[550px] select-none"
        >
          <defs>
            {/* Smooth Trajectory Glow Gradient */}
            <linearGradient id="trajGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d96526" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#df8758" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ecd2be" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#ba4f1a" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background Grid Lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="#f0dfd3"
            strokeDasharray="4 4"
            strokeWidth="0.8"
          />
          {/* Zero Neutral Baseline Axis */}
          <line
            x1={padding.left}
            y1={baselineY}
            x2={width - padding.right}
            y2={baselineY}
            stroke="#d4b49e"
            strokeDasharray={activeMode === 'trajectory' ? '3 3' : 'none'}
            strokeWidth={activeMode === 'trajectory' ? '1.2' : '0.8'}
          />
          <line
            x1={padding.left}
            y1={bottomY}
            x2={width - padding.right}
            y2={bottomY}
            stroke="#ecd2be"
            strokeWidth="1.2"
          />

          {/* Y-Axis Labels */}
          {activeMode === 'trajectory' ? (
            <>
              <text x={padding.left - 10} y={padding.top + 4} textAnchor="end" className="text-[10px] fill-emerald-700 font-bold font-mono">
                +100%
              </text>
              <text x={padding.left - 10} y={baselineY + 3.5} textAnchor="end" className="text-[10px] fill-[#786154] font-medium font-mono">
                0%
              </text>
              <text x={padding.left - 10} y={bottomY} textAnchor="end" className="text-[10px] fill-rose-700 font-bold font-mono">
                -100%
              </text>
            </>
          ) : (
            <>
              <text x={padding.left - 10} y={padding.top + 4} textAnchor="end" className="text-[10px] fill-[#786154] font-bold font-mono">
                {maxTotal}
              </text>
              <text x={padding.left - 10} y={baselineY + 3.5} textAnchor="end" className="text-[10px] fill-[#786154] font-medium font-mono">
                {Math.round(maxTotal / 2)}
              </text>
              <text x={padding.left - 10} y={bottomY} textAnchor="end" className="text-[10px] fill-[#786154] font-medium font-mono">
                0
              </text>
            </>
          )}

          {/* Vertical Scrubber Cursor Line when Hovering */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={padding.top}
              x2={hoveredPoint.x}
              y2={bottomY}
              stroke="#ba4f1a"
              strokeDasharray="2 2"
              strokeWidth="1.5"
            />
          )}

          {/* Mode 1: Net Sentiment Trajectory (Smooth Spline Curve) */}
          {activeMode === 'trajectory' ? (
            <>
              {points.length > 1 && (
                <path d={trajectoryAreaPath} fill="url(#trajGradient)" />
              )}
              <path
                d={trajectoryLinePath}
                fill="none"
                stroke="#ba4f1a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
              {points.map((pt) => {
                const isHovered = hoveredPoint?.date === pt.date
                return (
                  <circle
                    key={`pt-${pt.date}`}
                    cx={pt.x}
                    cy={pt.trajY}
                    r={isHovered ? 6.5 : 4}
                    fill={pt.net_sentiment >= 0 ? '#15803d' : '#b91c1c'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                )
              })}
            </>
          ) : (
            /* Mode 2: Stacked Volume Bars */
            points.map((pt) => {
              const barWidth = Math.min(32, Math.max(16, (chartW / points.length) * 0.55))
              const xPos = pt.x - barWidth / 2
              const totalH = (pt.total / maxTotal) * chartH

              const posH = (pt.positive / maxTotal) * chartH
              const negH = (pt.negative / maxTotal) * chartH
              const neuH = (pt.neutral / maxTotal) * chartH
              const mixH = (pt.mixed / maxTotal) * chartH

              return (
                <g
                  key={`bar-${pt.date}`}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Invisible Hitbox */}
                  <rect
                    x={xPos - 6}
                    y={padding.top}
                    width={barWidth + 12}
                    height={chartH}
                    fill="transparent"
                  />

                  {/* Positive Segment */}
                  {posH > 0 && (
                    <rect
                      x={xPos}
                      y={bottomY - posH}
                      width={barWidth}
                      height={posH}
                      fill="#16a34a"
                      rx="3"
                      className="transition-opacity group-hover:opacity-90"
                    />
                  )}
                  {/* Negative Segment */}
                  {negH > 0 && (
                    <rect
                      x={xPos}
                      y={bottomY - posH - negH}
                      width={barWidth}
                      height={negH}
                      fill="#dc2626"
                      rx="3"
                      className="transition-opacity group-hover:opacity-90"
                    />
                  )}
                  {/* Neutral Segment */}
                  {neuH > 0 && (
                    <rect
                      x={xPos}
                      y={bottomY - posH - negH - neuH}
                      width={barWidth}
                      height={neuH}
                      fill="#78716c"
                      rx="3"
                      className="transition-opacity group-hover:opacity-90"
                    />
                  )}
                  {/* Mixed Segment */}
                  {mixH > 0 && (
                    <rect
                      x={xPos}
                      y={bottomY - totalH}
                      width={barWidth}
                      height={mixH}
                      fill="#d97706"
                      rx="3"
                      className="transition-opacity group-hover:opacity-90"
                    />
                  )}
                </g>
              )
            })
          )}

          {/* X-Axis Date Labels */}
          {points.map((pt, i) => {
            const step = Math.ceil(points.length / 8)
            if (i % step !== 0 && i !== points.length - 1 && i !== 0) return null

            return (
              <text
                key={`lbl-${pt.date}`}
                x={pt.x}
                y={height - 14}
                textAnchor="middle"
                className="text-[10px] fill-[#786154] font-medium"
              >
                {pt.display_date}
              </text>
            )
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredPoint && (
          <div
            className="absolute top-2 right-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#ecd2be] shadow-[0_8px_30px_rgba(223,135,88,0.18)] text-xs space-y-1.5 pointer-events-none animate-result-in z-20 min-w-[200px]"
          >
            <div className="font-bold text-[#22130b] border-b border-[#ecd2be]/70 pb-1.5 flex items-center justify-between">
              <span>{hoveredPoint.display_date}</span>
              <span className="text-[10px] font-mono text-[#786154] font-normal">
                {hoveredPoint.date}
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-[#786154]">
                <span>Total Searches:</span>
                <span className="font-bold text-[#22130b] font-mono">{hoveredPoint.total}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-800">
                <span>Positive:</span>
                <span className="font-bold font-mono">
                  {hoveredPoint.positive} ({hoveredPoint.positive_pct}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-rose-800">
                <span>Negative:</span>
                <span className="font-bold font-mono">
                  {hoveredPoint.negative} ({hoveredPoint.negative_pct}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between font-bold border-t border-[#ecd2be]/70 pt-1.5">
              <span className="text-[#5a3f32]">Net Sentiment:</span>
              <span
                className={cn(
                  'font-mono text-xs px-1.5 py-0.2 rounded-md',
                  hoveredPoint.net_sentiment >= 0
                    ? 'text-emerald-800 bg-emerald-50'
                    : 'text-rose-800 bg-rose-50'
                )}
              >
                {hoveredPoint.net_sentiment > 0 ? `+${hoveredPoint.net_sentiment}` : hoveredPoint.net_sentiment}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-[#ecd2be]/60 text-[11px] text-[#786154]">
        <div className="flex items-center gap-1.5 text-[10px] text-[#9c7d69]">
          <span>Trajectory based on user search timestamps</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
            <span>Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#dc2626]" />
            <span>Negative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#78716c]" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#d97706]" />
            <span>Mixed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
