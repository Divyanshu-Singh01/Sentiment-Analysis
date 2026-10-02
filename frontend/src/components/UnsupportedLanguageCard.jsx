import React from 'react'
import { Languages, X } from 'lucide-react'

export function UnsupportedLanguageCard({
  message = 'Sorry, I currently support sentiment analysis for English and Hindi/Hinglish only.',
  detectedLanguage = null,
  onDismiss,
}) {
  return (
    <div
      role="region"
      aria-label="Language not supported notice"
      className="w-full rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs space-y-3.5 animate-result-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-black border border-neutral-200 mt-0.5"
            aria-hidden="true"
          >
            <Languages className="h-5 w-5 stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-black">
                Language not supported
              </h3>
              {detectedLanguage && (
                <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-black">
                  Detected: {detectedLanguage}
                </span>
              )}
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Dismiss language notice"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Subtle Supported Languages Pill Bar */}
      <div className="pt-2.5 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-500">Supported:</span>
          <span className="text-black font-semibold">English • Hindi/Hinglish</span>
        </div>
        <span className="text-[11px] text-neutral-400 hidden sm:inline">
          Edit text above to try again
        </span>
      </div>
    </div>
  )
}
