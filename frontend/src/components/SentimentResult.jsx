import React from 'react'
import { AlertCircle, Check } from 'lucide-react'
import { cn } from '../lib/utils'

export function SentimentResult({ sentiment }) {
  const isPositive = sentiment?.toLowerCase() === 'positive'

  const config = isPositive
    ? {
        title: 'Positive',
        description: 'Your text has a positive sentiment.',
        icon: Check,
        wrapperStyles:
          'bg-emerald-50/85 border-emerald-200/80 text-emerald-950',
        iconBgStyles: 'bg-emerald-100 text-emerald-700',
        badgeStyles: 'bg-emerald-100 text-emerald-800 border-emerald-200/90',
        badgeText: 'Positive',
      }
    : {
        title: 'Negative',
        description: 'Your text has a negative sentiment.',
        icon: AlertCircle,
        wrapperStyles: 'bg-rose-50/85 border-rose-200/80 text-rose-950',
        iconBgStyles: 'bg-rose-100 text-rose-700',
        badgeStyles: 'bg-rose-100 text-rose-800 border-rose-200/90',
        badgeText: 'Negative',
      }

  const IconComponent = config.icon

  return (
    <div
      role="region"
      aria-label="Sentiment analysis result"
      className={cn(
        'w-full rounded-xl border p-4 sm:p-5 transition-all animate-result-in shadow-2xs',
        config.wrapperStyles
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
            config.iconBgStyles
          )}
        >
          <IconComponent className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
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
          <p className="text-sm text-slate-600 leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  )
}
