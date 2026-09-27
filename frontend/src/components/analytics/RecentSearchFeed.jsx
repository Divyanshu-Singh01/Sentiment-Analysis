import React, { useState } from 'react'
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  Scale,
  Sparkles,
  Search,
} from 'lucide-react'
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

  const getSentimentConfig = (sentiment) => {
    const norm = (sentiment || '').toLowerCase()
    switch (norm) {
      case 'positive':
        return {
          icon: CheckCircle2,
          textColor: 'text-emerald-700',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        }
      case 'negative':
        return {
          icon: AlertCircle,
          textColor: 'text-rose-700',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        }
      case 'neutral':
        return {
          icon: MinusCircle,
          textColor: 'text-stone-700',
          badgeBg: 'bg-stone-50 text-stone-800 border-stone-200',
          dot: 'bg-stone-400',
        }
      case 'mixed':
        return {
          icon: Scale,
          textColor: 'text-amber-800',
          badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
        }
      default:
        return {
          icon: Sparkles,
          textColor: 'text-stone-700',
          badgeBg: 'bg-stone-50 text-stone-800 border-stone-200',
          dot: 'bg-stone-400',
        }
    }
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white/75 backdrop-blur-md border border-[#ecd2be]/80 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#ba4f1a]" />
            <h3 className="text-sm font-bold text-[#22130b] tracking-tight">
              Recent Analysis Stream
            </h3>
          </div>
          <p className="text-[11px] text-[#786154]">
            Recent search queries and their classified sentiment.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          {[
            { id: 'all', label: 'All' },
            { id: 'positive', label: 'Positive' },
            { id: 'negative', label: 'Negative' },
            { id: 'neutral', label: 'Neutral' },
            { id: 'mixed', label: 'Mixed' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSelectedSentiment(pill.id)}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all cursor-pointer border',
                selectedSentiment === pill.id
                  ? 'bg-gradient-to-r from-[#d96526] to-[#ba4f1a] text-white border-transparent shadow-2xs'
                  : 'bg-white/80 border-[#ecd2be] text-[#614b3f] hover:text-[#22130b] hover:bg-white'
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Search inside Stream */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter recent searches by text..."
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#ecd2be] bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#ba4f1a] text-[#22130b] placeholder:text-[#a08b7e]"
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#a08b7e] pointer-events-none" />
      </div>

      {/* Stream List */}
      <div className="divide-y divide-[#ecd2be]/50 max-h-[360px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#786154]">
            No search entries match the selected filters.
          </div>
        ) : (
          filtered.map((item) => {
            const config = getSentimentConfig(item.sentiment)
            const Icon = config.icon

            return (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-black/[0.02] px-2 rounded-xl transition-colors"
              >
                {/* Left: Text & Category */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full shrink-0', config.dot)} />
                    <p className="text-xs text-[#22130b] font-medium truncate" title={item.text}>
                      {item.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#786154] pl-4">
                    <span>{item.category_label || 'General'}</span>
                    <span>•</span>
                    <span>{item.display_date || item.created_at}</span>
                  </div>
                </div>

                {/* Right: Badges */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pl-4 sm:pl-0">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border',
                      config.badgeBg
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{item.sentiment}</span>
                  </span>

                  {item.confidence && (
                    <span className="text-[10px] font-mono font-semibold text-[#735b4d] bg-white border border-[#ecd2be] px-1.5 py-0.5 rounded-md shadow-2xs">
                      {Math.round(item.confidence)}%
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
