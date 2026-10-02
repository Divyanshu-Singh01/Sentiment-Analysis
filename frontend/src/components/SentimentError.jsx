import React from 'react'
import { AlertTriangle, XCircle } from 'lucide-react'

export function SentimentError({ message, onDismiss }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="w-full rounded-2xl border border-neutral-200 bg-white p-3.5 sm:p-4 text-black transition-all animate-result-in shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-black mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-semibold text-black leading-snug">{message}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-1 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss error"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
