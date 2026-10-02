import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '../../lib/utils'

export function RecentSearchFeed({ searches = [] }) {
  const [selectedSentiment, setSelectedSentiment] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  if (!searches || searches.length === 0) {
    return null
  }

  const filtered = searches.filter((item) => {
    const matchesSentiment =
      selectedSentiment === 'all' ||
      item.sentiment.toLowerCase() === selectedSentiment.toLowerCase()

    const matchesQuery =
      !searchQuery.trim() ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase().trim())

    return matchesSentiment && matchesQuery
  })

  const getSentimentDot = (sentiment) => {
    const norm = (sentiment || '').toLowerCase()
    switch (norm) {
      case 'positive':
        return 'bg-emerald-500'
      case 'negative':
        return 'bg-rose-500'
      case 'neutral':
        return 'bg-neutral-400'
      case 'mixed':
        return 'bg-amber-500'
      default:
        return 'bg-neutral-400'
    }
  }

  const getSentimentBadge = (sentiment) => {
    const norm = (sentiment || '').toLowerCase()
    switch (norm) {
      case 'positive':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
      case 'negative':
        return 'text-rose-700 bg-rose-50 border border-rose-200/60'
      case 'neutral':
        return 'text-neutral-700 bg-neutral-100 border border-neutral-200'
      case 'mixed':
        return 'text-amber-700 bg-amber-50 border border-amber-200/60'
      default:
        return 'text-neutral-700 bg-neutral-100 border border-neutral-200'
    }
  }

  const filterChips = [
    { id: 'all', label: 'All', activeClass: 'bg-black text-white' },
    { id: 'positive', label: 'Positive', activeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold' },
    { id: 'negative', label: 'Negative', activeClass: 'bg-rose-50 text-rose-700 border border-rose-300 font-semibold' },
    { id: 'neutral', label: 'Neutral', activeClass: 'bg-neutral-100 text-neutral-800 border border-neutral-300 font-semibold' },
  ]

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-100 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-black">
              Recent Activity
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live log of analyzed queries
            </p>
          </div>

          {/* Filter Chips - YouTube Studio style */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {filterChips.map((pill) => {
              const isSelected = selectedSentiment === pill.id
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedSentiment(pill.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer select-none border border-transparent',
                    isSelected
                      ? pill.activeClass
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  )}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Search bar inside header */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queries..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15 text-black placeholder:text-neutral-400 transition-all"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* Stream List */}
      <div className="divide-y divide-neutral-100 flex-1 max-h-[380px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-xs text-neutral-400">
            No queries match the selected filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors"
            >
              {/* Left: Dot, query text, metadata */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', getSentimentDot(item.sentiment))} />
                  <p className="text-xs text-black font-medium truncate" title={item.text}>
                    {item.text}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 pl-3.5">
                  <span>{item.category_label || 'General'}</span>
                  <span>•</span>
                  <span>{item.display_date || item.created_at}</span>
                </div>
              </div>

              {/* Right: Badges */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded capitalize',
                    getSentimentBadge(item.sentiment)
                  )}
                >
                  {item.sentiment}
                </span>

                {item.confidence && (
                  <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                    {Math.round(item.confidence)}%
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
