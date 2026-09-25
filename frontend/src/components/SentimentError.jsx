import React from 'react'
import { AlertTriangle, XCircle } from 'lucide-react'

export function SentimentError({ message, onDismiss }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="w-full rounded-2xl border border-rose-500/30 bg-black/40 backdrop-blur-xl p-4 text-rose-100 transition-all animate-result-in shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-400 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-rose-200">{message}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md p-1 text-rose-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Dismiss error"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
