import React from 'react'
import { AlertTriangle, XCircle } from 'lucide-react'

export function SentimentError({ message, onDismiss }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="w-full rounded-xl border border-amber-200/90 bg-amber-50/90 p-4 text-amber-900 transition-all animate-result-in shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-amber-900">{message}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md p-1 text-amber-700 hover:bg-amber-100 transition"
            aria-label="Dismiss error"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
