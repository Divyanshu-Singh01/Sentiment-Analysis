import React from 'react'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export function AnalyticsMetrics({ summary, activeMetric = 'net_sentiment', onSelectMetric }) {
  const {
    total_reviews = 0,
    positive_count = 0,
    negative_count = 0,
    neutral_count = 0,
    mixed_count = 0,
    positive_pct = 0,
    negative_pct = 0,
    neutral_pct = 0,
    mixed_pct = 0,
    average_confidence = 0,
    net_sentiment_score = 0,
  } = summary || {}

  const getNssLabel = (nss) => {
    if (nss >= 40) return 'Strongly positive'
    if (nss >= 15) return 'Favorable'
    if (nss >= -15) return 'Neutral balance'
    if (nss >= -40) return 'Leaning negative'
    return 'Critical negative'
  }

  const cards = [
    {
      id: 'net_sentiment',
      label: 'Net Sentiment',
      value: `${net_sentiment_score > 0 ? '+' : ''}${net_sentiment_score}%`,
      subtext: getNssLabel(net_sentiment_score),
      subtextColor: net_sentiment_score >= 15 ? 'text-emerald-700' : net_sentiment_score <= -15 ? 'text-rose-700' : 'text-neutral-500',
      description: '% Positive minus % Negative',
      hasIcon: true,
      isPositive: net_sentiment_score >= 0,
    },
    {
      id: 'total',
      label: 'Searches Analyzed',
      value: total_reviews.toLocaleString(),
      subtext: `${total_reviews} total reviews`,
      subtextColor: 'text-neutral-500',
      description: 'Activity volume',
      hasIcon: false,
    },
    {
      id: 'positive_pct',
      label: 'Positive Rate',
      value: `${positive_pct}%`,
      subtext: `${positive_count} favorable`,
      subtextColor: 'text-emerald-700',
      description: `${positive_count} of ${total_reviews} reviews`,
      hasIcon: false,
    },
    {
      id: 'negative_pct',
      label: 'Negative Rate',
      value: `${negative_pct}%`,
      subtext: `${negative_count} critical`,
      subtextColor: 'text-rose-700',
      description: `${negative_count} of ${total_reviews} reviews`,
      hasIcon: false,
    },
  ]

  const getIndicatorColor = (cardId) => {
    switch (cardId) {
      case 'total':
        return 'bg-blue-600'
      case 'positive_pct':
        return 'bg-emerald-600'
      case 'negative_pct':
        return 'bg-rose-600'
      case 'net_sentiment':
        return net_sentiment_score >= 0 ? 'bg-emerald-600' : 'bg-rose-600'
      default:
        return 'bg-black'
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-neutral-200 bg-white divide-y lg:divide-y-0 divide-neutral-200 lg:divide-x [&>*:nth-child(odd)]:border-r lg:[&>*:nth-child(odd)]:border-r-0">
      {cards.map((card) => {
        const isActive = activeMetric === card.id
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectMetric && onSelectMetric(card.id)}
            className={cn(
              'group relative flex flex-col p-4 sm:p-5 text-left transition-colors cursor-pointer select-none outline-none',
              isActive
                ? 'bg-neutral-50/90'
                : 'hover:bg-neutral-50/50'
            )}
          >
            {/* Top row: Label */}
            <div className="flex items-center justify-between gap-1 text-neutral-500">
              <span className={cn(
                'text-xs font-medium truncate transition-colors',
                isActive ? 'text-black font-semibold' : 'text-neutral-600'
              )}>
                {card.label}
              </span>
              {card.hasIcon && (
                card.isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                )
              )}
            </div>

            {/* Middle: Big Metric Value */}
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-black">
                {card.value}
              </span>
            </div>

            {/* Bottom: Subtext */}
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className={cn('font-medium truncate', card.subtextColor)}>
                {card.subtext}
              </span>
            </div>

            {/* YouTube Studio Metric-Specific Active Tab Underline Indicator */}
            {isActive && (
              <span className={cn('absolute bottom-0 left-0 right-0 h-0.5 transition-all', getIndicatorColor(card.id))} />
            )}
          </button>
        )
      })}
    </div>
  )
}
