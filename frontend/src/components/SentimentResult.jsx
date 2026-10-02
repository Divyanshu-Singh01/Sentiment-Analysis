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
  { key: 'neutral', label: 'Neutral', dotColor: 'bg-stone-400', barColor: 'bg-stone-400' },
  { key: 'mixed', label: 'Mixed', dotColor: 'bg-amber-500', barColor: 'bg-amber-500' },
]

function pct(val) {
  if (typeof val !== 'number' || isNaN(val)) return '0%'
  return `${Math.round(val * 100)}%`
}

const iconBoxMap = {
  positive: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
  negative: 'bg-rose-50 text-rose-600 border border-rose-200/60',
  neutral: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  mixed: 'bg-amber-50 text-amber-600 border border-amber-200/60',
}

const badgeMap = {
  positive: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  negative: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  mixed: 'bg-amber-50 text-amber-700 border border-amber-200/60',
}

const barColorMap = {
  positive: 'bg-emerald-500',
  negative: 'bg-rose-500',
  neutral: 'bg-neutral-600',
  mixed: 'bg-amber-500',
}

export function SentimentResult({ result, sentiment, onAnalyzeAnother }) {
  const norm = (result?.sentiment || sentiment || '').toLowerCase().trim()
  const score = typeof result?.score === 'number' ? result.score : null
  const scores = result?.scores || null
  const isClose = Boolean(result?.is_close || result?.isClose)

  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const Icon = iconMap[norm] || AlertCircle
  const label = norm.charAt(0).toUpperCase() + norm.slice(1)

  const handleCopy = () => {
    navigator.clipboard.writeText(`${label}: ${score !== null ? pct(score) : 'N/A'}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs animate-result-in space-y-3.5">
      {/* Header: icon + label + confidence */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition-colors', iconBoxMap[norm] || iconBoxMap.neutral)}>
            <Icon className="h-4 w-4" />
          </div>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', badgeMap[norm] || badgeMap.neutral)}>
            {label}
          </span>
        </div>

        {score !== null && (
          <span className="text-xs font-mono font-medium text-neutral-700">{pct(score)}</span>
        )}
      </div>

      {/* Confidence bar */}
      {score !== null && (
        <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
          <div
            style={{ width: `${Math.round(score * 100)}%` }}
            className={cn('h-full rounded-full transition-all duration-500', barColorMap[norm] || 'bg-black')}
          />
        </div>
      )}

      {/* Close prediction note */}
      {isClose && (
        <p className="text-xs text-neutral-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 align-middle" />
          Close prediction — another class scored similarly.
        </p>
      )}

      {/* Probability breakdown */}
      {scores && (
        <div>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-black transition-colors cursor-pointer"
          >
            <span>{showDetails ? 'Hide' : 'Details'}</span>
            <ChevronDown className={cn('h-3 w-3 transition-transform', showDetails && 'rotate-180')} />
          </button>

          <div className={cn(
            'grid transition-all duration-200',
            showDetails ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
          )}>
            <div className="overflow-hidden">
              <div className="space-y-1">
                {PRESENTATION_ORDER.map((item) => {
                  const v = scores[item.key] ?? 0
                  const winning = norm === item.key
                  return (
                    <div key={item.key} className="flex items-center gap-2 text-xs">
                      <span className={cn('h-1.5 w-1.5 rounded-full', item.dotColor)} />
                      <span className={cn('w-14', winning ? 'text-black font-medium' : 'text-neutral-500')}>
                        {item.label}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          style={{ width: `${Math.round(v * 100)}%` }}
                          className={cn('h-full rounded-full transition-all duration-300', item.barColor, !winning && 'opacity-60')}
                        />
                      </div>
                      <span className="font-mono w-8 text-right text-neutral-600">{pct(v)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-black transition-colors cursor-pointer"
        >
          {copied ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {onAnalyzeAnother && (
          <button
            type="button"
            onClick={onAnalyzeAnother}
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-black transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>New</span>
          </button>
        )}
      </div>
    </div>
  )
}
