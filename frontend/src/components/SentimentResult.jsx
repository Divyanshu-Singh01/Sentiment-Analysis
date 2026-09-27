import React, { useState } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  Minus,
  RotateCcw,
  Scale,
  Copy,
  CheckCheck,
} from 'lucide-react'
import { cn } from '../lib/utils'

const PRESENTATION_ORDER = [
  { key: 'positive', label: 'Positive', dotColor: 'bg-emerald-500', barColor: 'bg-emerald-500' },
  { key: 'negative', label: 'Negative', dotColor: 'bg-rose-500', barColor: 'bg-rose-500' },
  { key: 'neutral', label: 'Neutral', dotColor: 'bg-stone-500', barColor: 'bg-stone-500' },
  { key: 'mixed', label: 'Mixed', dotColor: 'bg-amber-500', barColor: 'bg-amber-500' },
]

function formatPercent(val) {
  if (typeof val !== 'number' || isNaN(val)) return '0%'
  return `${Math.round(val * 100)}%`
}

export function SentimentResult({ result, sentiment, onAnalyzeAnother }) {
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

  const isClose = typeof result === 'object'
    ? Boolean(result?.is_close || result?.isClose)
    : false

  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const configMap = {
    positive: {
      title: 'Positive Sentiment',
      badgeText: 'Positive',
      description: 'Your text conveys an overall positive sentiment.',
      icon: Check,
      accentBorder: 'border-emerald-500/35',
      glowShadow: 'shadow-[0_12px_32px_rgba(16,185,129,0.12)]',
      iconBg: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      barColor: 'bg-emerald-500',
      confidenceText: 'text-emerald-800',
    },
    negative: {
      title: 'Negative Sentiment',
      badgeText: 'Negative',
      description: 'Your text conveys an overall negative sentiment.',
      icon: AlertCircle,
      accentBorder: 'border-rose-500/35',
      glowShadow: 'shadow-[0_12px_32px_rgba(244,63,94,0.12)]',
      iconBg: 'bg-rose-100 text-rose-700 border border-rose-300',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      barColor: 'bg-rose-500',
      confidenceText: 'text-rose-800',
    },
    neutral: {
      title: 'Neutral Sentiment',
      badgeText: 'Neutral',
      description: 'Your text has a neutral or factual tone.',
      icon: Minus,
      accentBorder: 'border-stone-400/40',
      glowShadow: 'shadow-[0_12px_32px_rgba(120,113,108,0.12)]',
      iconBg: 'bg-stone-100 text-stone-700 border border-stone-300',
      badgeBg: 'bg-stone-50 text-stone-800 border-stone-200',
      barColor: 'bg-stone-500',
      confidenceText: 'text-stone-800',
    },
    mixed: {
      title: 'Mixed Sentiment',
      badgeText: 'Mixed',
      description: 'Your text contains both positive and negative aspects.',
      icon: Scale,
      accentBorder: 'border-amber-500/35',
      glowShadow: 'shadow-[0_12px_32px_rgba(245,158,11,0.12)]',
      iconBg: 'bg-amber-100 text-amber-800 border border-amber-300',
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
      barColor: 'bg-amber-500',
      confidenceText: 'text-amber-900',
    },
  }

  const config = configMap[normSentiment] || configMap.negative
  const IconComponent = config.icon

  const handleCopy = () => {
    const textToCopy = `Sentiment: ${config.title} (${score !== null ? formatPercent(score) : 'N/A'})`
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      role="region"
      aria-label="Sentiment analysis result"
      className={cn(
        'w-full rounded-2xl border bg-white/85 backdrop-blur-xl p-5 sm:p-6 transition-all duration-200 animate-result-in space-y-4',
        config.accentBorder,
        config.glowShadow
      )}
    >
      {/* Top Header Row: Icon, Title, Confidence Badge */}
      <div className="flex items-start justify-between gap-3.5">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-2xs mt-0.5',
              config.iconBg
            )}
          >
            <IconComponent className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#22130b]">
                {config.title}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide',
                  config.badgeBg
                )}
              >
                {config.badgeText}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5d473b] leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {/* Confidence Metric Pill */}
        {score !== null && (
          <div className="shrink-0 text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#df8758]/30 shadow-2xs">
              <span className="text-[11px] text-[#735b4d] font-medium">Confidence</span>
              <span className={cn('text-xs font-bold font-mono', config.confidenceText)}>
                {formatPercent(score)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Confidence Indicator Bar */}
      {score !== null && (
        <div className="w-full h-1.5 rounded-full bg-black/5 overflow-hidden">
          <div
            style={{ width: `${Math.round(score * 100)}%` }}
            className={cn('h-full rounded-full transition-all duration-500 ease-out', config.barColor)}
          />
        </div>
      )}

      {/* Close Prediction Banner (Only shown if isClose === true) */}
      {isClose && (
        <div
          role="note"
          aria-label="Close prediction notice"
          className="flex items-start gap-2.5 rounded-xl border border-amber-400/50 bg-amber-50/90 px-3.5 py-2.5 text-xs text-amber-950 animate-result-in shadow-2xs"
        >
          <span
            className="inline-block h-2 w-2 rounded-full bg-amber-500 mt-1 flex-shrink-0"
            aria-hidden="true"
          />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-900">
              Close Prediction
            </p>
            <p className="text-amber-800 leading-relaxed">
              Another sentiment class scored very closely to this result.
            </p>
          </div>
        </div>
      )}

      {/* Expandable Class Probability Breakdown */}
      {scores && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-controls="prediction-score-details"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6e5547] hover:text-[#22130b] transition-colors duration-150 cursor-pointer select-none"
          >
            <span>{showDetails ? 'Hide probability breakdown' : 'View probability breakdown'}</span>
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
                ? 'grid-rows-[1fr] opacity-100 mt-2'
                : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
            )}
          >
            <div className="overflow-hidden">
              <div className="rounded-xl border border-[#ecd2be]/80 bg-white/75 p-3 space-y-1.5 text-xs shadow-2xs text-[#2b180f]">
                {PRESENTATION_ORDER.map((item) => {
                  const classScore = scores[item.key] ?? 0
                  const pct = formatPercent(classScore)
                  const isWinningClass = normSentiment === item.key

                  return (
                    <div
                      key={item.key}
                      className={cn(
                        'flex items-center justify-between py-1 px-2.5 rounded-lg transition-colors duration-150 gap-3',
                        isWinningClass
                          ? 'bg-[#df8758]/15 font-semibold text-[#22130b]'
                          : 'text-[#614b3f]'
                      )}
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn('h-2 w-2 rounded-full', item.dotColor)} />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-24 sm:w-32 h-1.5 rounded-full bg-black/5 overflow-hidden">
                          <div
                            style={{ width: `${Math.round(classScore * 100)}%` }}
                            className={cn('h-full rounded-full transition-all duration-300', item.barColor)}
                          />
                        </div>
                        <span className="font-mono tabular-nums font-semibold text-right w-10">
                          {pct}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Row: Copy & Analyze Another */}
      <div className="pt-2 border-t border-[#ecd2be]/60 flex items-center justify-between">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#614b3f] hover:text-[#22130b] bg-white hover:bg-black/5 px-3 py-1.5 rounded-full border border-[#ecd2be]/80 transition-all duration-150 active:scale-[0.97] cursor-pointer shadow-2xs"
        >
          {copied ? (
            <>
              <CheckCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              <span className="text-emerald-700">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-[#ba4f1a]" aria-hidden="true" />
              <span>Copy result</span>
            </>
          )}
        </button>

        {onAnalyzeAnother && (
          <button
            type="button"
            onClick={onAnalyzeAnother}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3b2215] hover:text-[#180a03] bg-white hover:bg-black/5 px-3.5 py-1.5 rounded-full border border-[#ecd2be]/80 transition-all duration-150 active:scale-[0.97] cursor-pointer shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#ba4f1a]" aria-hidden="true" />
            <span>Analyze another</span>
          </button>
        )}
      </div>
    </div>
  )
}
