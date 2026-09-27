import React, { useEffect, useState } from 'react'
import {
  TrendingUp,
  Filter,
  RotateCcw,
  Loader2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'

import { fetchAnalyticsTrends } from '../../services/analyticsApi'
import { AnalyticsLockedBanner } from './AnalyticsLockedBanner'
import { AnalyticsMetrics } from './AnalyticsMetrics'
import { AnalyticsTrendChart } from './AnalyticsTrendChart'
import { CategoryBreakdown } from './CategoryBreakdown'
import { RecentSearchFeed } from './RecentSearchFeed'

export function AnalyticsDashboard({ user, onOpenLogin, onOpenSignup, onNavigateTab }) {
  const [range, setRange] = useState('30d')
  const [category, setCategory] = useState('all')
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRefresh = () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    fetchAnalyticsTrends({ range, category, source: 'history' })
      .then((res) => setData(res))
      .catch((err) => setError(err.message || 'Failed to load sentiment trends.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (!user) return

    let isCurrent = true

    async function load() {
      try {
        const res = await fetchAnalyticsTrends({ range, category, source: 'history' })
        if (isCurrent) {
          setData(res)
          setError(null)
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message || 'Failed to load sentiment trends.')
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isCurrent = false
    }
  }, [user, range, category])

  // If not authenticated, show locked PRO banner
  if (!user) {
    return <AnalyticsLockedBanner onOpenLogin={onOpenLogin} onOpenSignup={onOpenSignup} />
  }

  const availableCategories = data?.available_categories || [
    { id: 'all', label: 'All Categories' },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-result-in">
      {/* Top Filter Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#ecd2be]/80 bg-white/80 backdrop-blur-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#d96526] to-[#ba4f1a] flex items-center justify-center text-white shadow-2xs">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#22130b] tracking-tight">
              Sentiment Search Analytics
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#df8758]/15 text-[#993b0a] border border-[#df8758]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Activity
            </span>
          </div>
          <p className="text-xs text-[#786154]">
            Time-series polarity, quality metrics, and category breakdown derived from your searches.
          </p>
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Range Pills */}
          <div className="flex items-center p-1 rounded-xl bg-white/90 border border-[#ecd2be] text-xs font-medium shadow-2xs">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'all', label: 'All Time' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  range === r.id
                    ? 'bg-gradient-to-r from-[#d96526] to-[#ba4f1a] text-white shadow-2xs'
                    : 'text-[#614b3f] hover:text-[#22130b]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-xl border border-[#ecd2be] bg-white/90 hover:bg-white text-[#4d382d] focus:outline-none focus:ring-1 focus:ring-[#ba4f1a] cursor-pointer shadow-2xs"
            >
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#786154] pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-xl border border-[#ecd2be] bg-white/90 hover:bg-white text-[#4d382d] transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Refresh analytics data"
          >
            <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#ba4f1a]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && !data && (
        <div className="p-12 rounded-2xl bg-white/80 backdrop-blur-xl border border-[#ecd2be]/80 text-center space-y-3 shadow-xs">
          <Loader2 className="h-6 w-6 animate-spin text-[#ba4f1a] mx-auto" />
          <p className="text-xs font-semibold text-[#786154]">Aggregating search sentiment trends...</p>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Data Views */}
      {data && (
        <>
          {data.summary.total_reviews === 0 ? (
            /* Empty State */
            <div className="p-8 sm:p-12 rounded-3xl bg-white/80 backdrop-blur-xl border border-[#ecd2be]/80 text-center space-y-5 shadow-xs">
              <div className="h-14 w-14 rounded-2xl bg-[#df8758]/15 text-[#ba4f1a] flex items-center justify-center mx-auto">
                <TrendingUp className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-[#22130b]">No Search Analytics Yet</h3>
                <p className="text-xs text-[#786154] leading-relaxed">
                  You don't have any sentiment searches recorded yet for this time range or category.
                  Enter a review in Single Review mode to start generating your personal sentiment analytics!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('single')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d96526] to-[#ba4f1a] text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Analyze Single Review
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Populated Executive Dashboard */
            <div className="space-y-6">
              {/* 1. Executive Scorecard */}
              <AnalyticsMetrics summary={data.summary} />

              {/* 2. Sentiment Trajectory Chart */}
              <AnalyticsTrendChart timeSeries={data.time_series} />

              {/* 3. Category Intelligence Breakdown */}
              <CategoryBreakdown
                categories={data.category_breakdown}
                selectedCategory={category}
                onSelectCategory={setCategory}
              />

              {/* 4. Recent Search Activity Stream */}
              <RecentSearchFeed searches={data.recent_searches} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
