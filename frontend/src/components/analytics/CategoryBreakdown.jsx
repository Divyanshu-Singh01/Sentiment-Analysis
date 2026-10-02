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
  Check,
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
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs h-full flex flex-col">
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-black">
            Category Breakdown
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Performance across detected search categories
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-xs font-medium text-black hover:underline cursor-pointer"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Table-like List (YouTube Studio Content Breakdown format) */}
      <div className="overflow-x-auto flex-1 max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-100 text-neutral-400 font-medium">
              <th className="py-2.5 px-4 font-normal">Category</th>
              <th className="py-2.5 px-3 font-normal text-right">Searches</th>
              <th className="py-2.5 px-4 font-normal">Sentiment split</th>
              <th className="py-2.5 px-4 font-normal text-right">Net Sentiment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICON_MAP[cat.id] || Layers
              const isSelected = selectedCategory === cat.id

              return (
                <tr
                  key={cat.id}
                  onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                  className={cn(
                    'transition-colors cursor-pointer select-none group',
                    isSelected
                      ? 'bg-blue-50/50 font-medium'
                      : 'hover:bg-neutral-50/80'
                  )}
                >
                  {/* Category Name & Icon */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'h-6 w-6 rounded-md flex items-center justify-center shrink-0 transition-colors',
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className={cn(
                        'text-xs truncate max-w-[140px] sm:max-w-[180px]',
                        isSelected ? 'text-blue-950 font-semibold' : 'text-black'
                      )}>
                        {cat.label}
                      </span>
                    </div>
                  </td>

                  {/* Volume & Share */}
                  <td className="py-3 px-3 text-right">
                    <span className="font-mono text-black">
                      {cat.total}
                    </span>
                    <span className="text-neutral-400 font-mono ml-1 text-[11px]">
                      ({cat.volume_share}%)
                    </span>
                  </td>

                  {/* Horizontal Sentiment Bar */}
                  <td className="py-3 px-4 min-w-[130px]">
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-neutral-100 flex overflow-hidden">
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
                          className="h-full bg-slate-300"
                          title="Neutral"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                        <span className="text-emerald-700">{cat.positive_pct}%</span>
                        <span className="text-rose-700">{cat.negative_pct}%</span>
                      </div>
                    </div>
                  </td>

                  {/* Net Sentiment Badge */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={cn(
                        'inline-block font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                        cat.net_sentiment > 0
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
                          : cat.net_sentiment < 0
                          ? 'text-rose-700 bg-rose-50 border-rose-200/60'
                          : 'text-neutral-700 bg-neutral-100 border-neutral-200'
                      )}
                    >
                      {cat.net_sentiment > 0 ? `+${cat.net_sentiment}%` : `${cat.net_sentiment}%`}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
