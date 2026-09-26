import React from 'react'
import { AlertTriangle, XCircle } from 'lucide-react'

export function SentimentError({ message, onDismiss }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="w-full rounded-2xl border border-rose-400/40 bg-white/90 backdrop-blur-xl p-4 text-rose-950 transition-all animate-result-in shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-rose-900">{message}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md p-1 text-rose-500 hover:text-rose-900 hover:bg-rose-100/60 transition cursor-pointer"
            aria-label="Dismiss error"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
