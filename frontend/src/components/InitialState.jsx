import React from 'react'
import { Sparkles } from 'lucide-react'

export function InitialState() {
  return (
    <div className="w-full max-w-lg mx-auto rounded-[22px] border border-[#d98a5a]/45 bg-white/75 backdrop-blur-xl p-5 sm:p-5.5 text-center shadow-[0_12px_32px_rgba(195,100,55,0.12)] animate-result-in">
      <div className="flex items-center justify-center gap-2 text-sm sm:text-[15px] font-semibold text-[#2c170c] tracking-tight">
        <Sparkles className="h-4 w-4 text-[#be5424] shrink-0" aria-hidden="true" />
        <span>Ready to analyze</span>
      </div>
      <p className="mt-1.5 text-xs sm:text-[13px] text-[#694f41] max-w-sm mx-auto leading-relaxed">
        Enter a review, comment, or feedback above to classify its sentiment.
      </p>
      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbf5f0]/90 border border-[#e2a886]/40 text-[11px] text-[#795a47] font-medium shadow-2xs">
        <span>Positive / Negative</span>
        <span className="text-[#be5424]/40 font-bold">•</span>
        <span>Machine Learning</span>
      </div>
    </div>
  )
}
