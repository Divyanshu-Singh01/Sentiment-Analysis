import { useState } from 'react'
import { AlertCircle, Check, ChevronDown, Minus, RotateCcw, Scale } from 'lucide-react'
import { cn } from '../lib/utils'

const PRESENTATION_ORDER = [
  { key: 'positive', label: 'Positive', dotColor: 'bg-emerald-600' },
  { key: 'negative', label: 'Negative', dotColor: 'bg-rose-600' },
  { key: 'neutral', label: 'Neutral', dotColor: 'bg-stone-500' },
  { key: 'mixed', label: 'Mixed', dotColor: 'bg-amber-600' },
]

function formatPercent(val) {
  if (typeof val !== 'number' || isNaN(val)) return '0%'
  return `${Math.round(val * 100)}%`
}

export function SentimentResult({ result, sentiment, onAnalyzeAnother }) {
  // Support both object shape { sentiment, score, scores, isClose } and legacy string sentiment
  const normSentiment = (typeof result === 'object' && result?.sentiment
    ? result.sentiment
    : sentiment || ''
  ).toLowerCase().trim()

  const score = typeof result === 'object' && typeof result?.score === 'number'
    ? result.score
    : null

  const scores = typeof result === 'object' && result?.scores
    ? result.scores
    : null

  const isClose = typeof result === 'object' ? Boolean(result?.isClose) : false

  const [showDetails, setShowDetails] = useState(false)

  const configMap = {
    positive: {
      title: 'Positive',
      description: 'Your text has a positive sentiment.',
      icon: Check,
      iconBgStyles: 'bg-emerald-50 text-emerald-700 border border-emerald-300/80 shadow-2xs',
      badgeStyles: 'bg-emerald-50 text-emerald-800 border-emerald-300/80 font-semibold',
      badgeText: 'Positive',
    },
    negative: {
      title: 'Negative',
      description: 'Your text has a negative sentiment.',
      icon: AlertCircle,
      iconBgStyles: 'bg-rose-50 text-rose-700 border border-rose-300/80 shadow-2xs',
      badgeStyles: 'bg-rose-50 text-rose-800 border-rose-300/80 font-semibold',
      badgeText: 'Negative',
    },
    neutral: {
      title: 'Neutral',
      description: 'Your text has a neutral or factual tone.',
      icon: Minus,
      iconBgStyles: 'bg-stone-100 text-stone-700 border border-stone-300 shadow-2xs',
      badgeStyles: 'bg-stone-100 text-stone-800 border-stone-300 font-semibold',
      badgeText: 'Neutral',
    },
    mixed: {
      title: 'Mixed',
      description: 'Your text contains both positive and negative aspects.',
      icon: Scale,
      iconBgStyles: 'bg-amber-50 text-amber-800 border border-amber-300/80 shadow-2xs',
      badgeStyles: 'bg-amber-50 text-amber-900 border-amber-300/80 font-semibold',
      badgeText: 'Mixed',
    },
  }

  const config = configMap[normSentiment] || configMap.negative
  const IconComponent = config.icon

  return (
    <div
      role="region"
      aria-label="Sentiment analysis result"
      className="w-full rounded-[24px] border border-[#d98a5a]/40 bg-white/80 backdrop-blur-2xl p-5 sm:p-7 shadow-[0_15px_35px_rgba(200,120,70,0.14)] space-y-4 animate-result-in"
    >
      {/* Top Main Result: Icon, Title, Badge, Description, and Model Score */}
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl mt-0.5',
            config.iconBgStyles
          )}
        >
          <IconComponent className="h-4.5 w-4.5 stroke-[2.5]" aria-hidden="true" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-[#22130b]">
                {config.title}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center rounded-md border px-1.5 py-0.2 text-[11px] font-medium',
                  config.badgeStyles
                )}
              >
                {config.badgeText}
              </span>
            </div>

            {score !== null && (
              <div className="text-xs font-semibold text-[#3b2317] bg-white/90 px-2.5 py-1 rounded-full border border-[#d98a5a]/35 shadow-xs">
                Model score: <span className="font-semibold text-[#c2561e]">{formatPercent(score)}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-[#543f34] leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>

      {/* Close Prediction Banner (Shown only when isClose === true) */}
      {isClose && (
        <div
          role="note"
          aria-label="Close prediction notice"
          className="flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-50/90 backdrop-blur-md px-3.5 py-2.5 text-xs text-amber-950 animate-result-in"
        >
          <span
            className="inline-block h-2 w-2 rounded-full bg-[#df8758] mt-1 flex-shrink-0"
            aria-hidden="true"
          />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-900">
              Close prediction
            </p>
            <p className="text-amber-800 leading-relaxed">
              Another sentiment has a similar model score.
            </p>
          </div>
        </div>
      )}

      {/* View Details Expandable Section */}
      {scores && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-controls="prediction-score-details"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#543f34] hover:text-[#180a03] transition-colors duration-150 active:scale-[0.97] cursor-pointer select-none"
          >
            <span>{showDetails ? 'Hide details' : 'View details'}</span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-200 ease-out',
                showDetails && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </button>

          <div
            id="prediction-score-details"
            className={cn(
              'grid transition-all duration-200 ease-out',
              showDetails
                ? 'grid-rows-[1fr] opacity-100 mt-2.5'
                : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
            )}
          >
            <div className="overflow-hidden">
              <div className="rounded-xl border border-[#d98a5a]/30 bg-white/90 backdrop-blur-md p-3.5 space-y-2 text-xs shadow-xs text-[#2b180f]">
                <p className="font-semibold text-[#22130b] tracking-tight">
                  Prediction details
                </p>
                <div className="space-y-1.5 pt-0.5">
                  {PRESENTATION_ORDER.map((item) => {
                    const classScore = scores[item.key] ?? 0
                    const pct = formatPercent(classScore)
                    const isWinningClass = normSentiment === item.key

                    return (
                      <div
                        key={item.key}
                        className={cn(
                          'flex items-center justify-between py-1 px-2.5 rounded-md transition-colors duration-150',
                          isWinningClass
                            ? 'bg-black/5 font-semibold text-[#180a03]'
                            : 'text-[#543f34]'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn('h-1.5 w-1.5 rounded-full', item.dotColor)} />
                          <span>{item.label}</span>
                        </div>
                        <span className="font-mono tabular-nums font-medium">
                          {pct}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Another Action Button */}
      {onAnalyzeAnother && (
        <div className="pt-2 border-t border-black/10 flex items-center justify-end">
          <button
            type="button"
            onClick={onAnalyzeAnother}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3d2417] hover:text-[#180a03] bg-black/5 hover:bg-black/10 px-3.5 py-1.5 rounded-full border border-black/10 transition-all duration-150 active:scale-[0.97] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Analyze another</span>
          </button>
        </div>
      )}
    </div>
  )
}
