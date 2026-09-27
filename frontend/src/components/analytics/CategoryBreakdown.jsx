import React from 'react'
import {
  ShoppingBag,
  Utensils,
  Landmark,
  Car,
  Wifi,
  Layers,
  HeartPulse,
  GraduationCap,
  Tv,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const CATEGORY_ICON_MAP = {
  ecommerce_retail: ShoppingBag,
  food_dining: Utensils,
  banking_fintech: Landmark,
  travel_transit: Car,
  tech_telecom: Wifi,
  healthcare_wellness: HeartPulse,
  education_edtech: GraduationCap,
  entertainment_media: Tv,
  general: Layers,
}

export function CategoryBreakdown({ categories = [], selectedCategory = 'all', onSelectCategory }) {
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-[#22130b] tracking-tight">
            Category Sentiment Breakdown
          </h3>
          <p className="text-[11px] text-[#786154]">
            Sentiment classification by detected search topic. Click a card to filter.
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-[11px] font-semibold text-[#ba4f1a] hover:underline cursor-pointer"
          >
            Clear category filter
          </button>
        )}
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICON_MAP[cat.id] || Layers
          const isSelected = selectedCategory === cat.id

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
              className={cn(
                'p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer border select-none',
                isSelected
                  ? 'bg-gradient-to-br from-white to-[#fff8f3] border-[#ba4f1a] shadow-md ring-2 ring-[#ba4f1a]/25'
                  : 'bg-white/80 backdrop-blur-md border-[#ecd2be]/80 hover:bg-white hover:border-[#df8758] shadow-xs'
              )}
            >
              {/* Card Header: Icon, Name, Volume */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                      isSelected
                        ? 'bg-gradient-to-tr from-[#d96526] to-[#ba4f1a] text-white border-transparent'
                        : 'bg-[#df8758]/10 text-[#ba4f1a] border-[#ecd2be]'
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#22130b] truncate">
                      {cat.label}
                    </h4>
                    <span className="text-[10px] text-[#8c7466] font-mono">
                      {cat.total} {cat.total === 1 ? 'search' : 'searches'} ({cat.volume_share}%)
                    </span>
                  </div>
                </div>

                {/* Net Sentiment Badge */}
                <div
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 font-mono',
                    cat.net_sentiment > 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : cat.net_sentiment < 0
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-stone-50 text-stone-800 border-stone-300'
                  )}
                >
                  {cat.net_sentiment > 0 ? `+${cat.net_sentiment}%` : `${cat.net_sentiment}%`}
                </div>
              </div>

              {/* Progress Split Bar */}
              <div className="mt-3 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-black/5 flex overflow-hidden">
                  <div
                    style={{ width: `${cat.positive_pct}%` }}
                    className="h-full bg-emerald-500"
                    title={`Positive: ${cat.positive_pct}%`}
                  />
                  <div
                    style={{ width: `${cat.negative_pct}%` }}
                    className="h-full bg-rose-500"
                    title={`Negative: ${cat.negative_pct}%`}
                  />
                  <div
                    style={{
                      width: `${Math.max(0, 100 - cat.positive_pct - cat.negative_pct)}%`,
                    }}
                    className="h-full bg-stone-300"
                    title="Neutral / Mixed"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#786154]">
                  <span className="text-emerald-700 font-semibold">{cat.positive} pos</span>
                  <span className="text-rose-700 font-semibold">{cat.negative} neg</span>
                  <span className="text-[#8c7466]">{cat.avg_confidence}% conf</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
