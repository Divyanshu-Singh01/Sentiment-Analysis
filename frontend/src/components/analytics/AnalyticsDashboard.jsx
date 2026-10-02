import React, { useEffect, useState } from 'react'
import { RotateCcw, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

import { fetchAnalyticsTrends } from '../../services/analyticsApi'
import { AnalyticsLockedBanner } from './AnalyticsLockedBanner'
import { AnalyticsMetrics } from './AnalyticsMetrics'
import { AnalyticsTrendChart } from './AnalyticsTrendChart'
import { CategoryBreakdown } from './CategoryBreakdown'
import { RecentSearchFeed } from './RecentSearchFeed'

const RANGES = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '28 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'Lifetime' },
]

export function AnalyticsDashboard({ user, onOpenLogin, onOpenSignup, onNavigateTab }) {
  const [range, setRange] = useState('30d')
  const [category, setCategory] = useState('all')
  const [activeMetric, setActiveMetric] = useState('net_sentiment')
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    fetchAnalyticsTrends({ range, category, source: 'history' })
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch((err) => setError(err.message || 'Failed to load analytics trends.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (!user) return
    let current = true
    setIsLoading(true)

    fetchAnalyticsTrends({ range, category, source: 'history' })
      .then((res) => {
        if (current) {
          setData(res)
          setError(null)
        }
      })
      .catch((err) => {
        if (current) setError(err.message || 'Failed to load.')
      })
      .finally(() => {
        if (current) setIsLoading(false)
      })

    return () => {
      current = false
    }
  }, [user, range, category])

  if (!user) {
    return <AnalyticsLockedBanner onOpenLogin={onOpenLogin} onOpenSignup={onOpenSignup} />
  }

  const categories = data?.available_categories || [{ id: 'all', label: 'All Categories' }]

  return (
    <div className="w-full space-y-5">
      {/* ── Top Bar: Range tabs + Category dropdown + Refresh ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-black">
            Sentiment Analytics
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Channel overview and customer feedback momentum
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Range tabs — YouTube Studio style */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-neutral-100 border border-neutral-200 text-xs">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer select-none',
                  range === r.id
                    ? 'bg-white text-black shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Category select */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-white text-black outline-none focus:border-neutral-400 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Refresh button */}
          <button
            type="button"
            onClick={load}
            disabled={isLoading}
            title="Refresh analytics data"
            className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:text-black hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-40"
          >
            <RotateCcw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Loading state when no data exists yet */}
      {isLoading && !data && (
        <div className="py-20 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400 mx-auto" />
          <p className="text-xs text-neutral-400 mt-2">Loading analytics...</p>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={load}
            className="text-xs font-medium text-black hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Data views */}
      {data && (
        <>
          {data.summary.total_reviews === 0 ? (
            /* Empty state */
            <div className="py-16 text-center space-y-3 rounded-xl border border-neutral-200 bg-white p-8">
              <p className="text-sm font-semibold text-black">No analytics data yet</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Analyze some text reviews in the input box to start tracking real-time sentiment trajectories and category breakdowns.
              </p>
              {onNavigateTab && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('single')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-black text-white text-xs font-medium cursor-pointer hover:bg-neutral-800 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Start analyzing
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* ── YouTube Studio Integrated Hero Card (KPI Row + Trend Chart) ── */}
              <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
                {/* Top: 4-Column KPI Tab Selector */}
                <AnalyticsMetrics
                  summary={data.summary}
                  activeMetric={activeMetric}
                  onSelectMetric={setActiveMetric}
                />

                {/* Bottom: Smooth Trend Chart connected to active metric */}
                <AnalyticsTrendChart
                  timeSeries={data.time_series}
                  activeMetric={activeMetric}
                />
              </div>

              {/* ── 2-Column Section: Category Breakdown + Recent Activity Stream ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7">
                  <CategoryBreakdown
                    categories={data.category_breakdown}
                    selectedCategory={category}
                    onSelectCategory={setCategory}
                  />
                </div>
                <div className="lg:col-span-5">
                  <RecentSearchFeed searches={data.recent_searches} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
