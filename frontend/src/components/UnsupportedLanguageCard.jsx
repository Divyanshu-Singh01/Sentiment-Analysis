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
      className="w-full rounded-[22px] border border-[#d98a5a]/45 bg-white/85 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_12px_32px_rgba(200,110,65,0.12)] space-y-3.5 animate-result-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800 border border-amber-500/30 mt-0.5"
            aria-hidden="true"
          >
            <Languages className="h-5 w-5 stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-[#22130b]">
                Language not supported
              </h3>
              {detectedLanguage && (
                <span className="inline-flex items-center rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-900">
                  Detected: {detectedLanguage}
                </span>
              )}
            </div>

            <p className="text-sm text-[#543f34] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-1.5 text-[#886959] hover:text-[#2c1a10] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Dismiss language notice"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Subtle Supported Languages Pill Bar */}
      <div className="pt-2.5 border-t border-black/5 flex items-center justify-between text-xs text-[#7d675b] font-medium">
        <div className="flex items-center gap-1.5">
          <span className="text-[#a47a64]">Supported:</span>
          <span className="text-[#3d2417] font-semibold">English • Hindi/Hinglish</span>
        </div>
        <span className="text-[11px] text-[#937566] hidden sm:inline">
          Edit text above to try again
        </span>
      </div>
    </div>
  )
}
