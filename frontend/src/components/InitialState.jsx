import React from 'react'
import { Sparkles } from 'lucide-react'

export function InitialState() {
  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-[#a35334]/30 bg-black/25 backdrop-blur-xl p-5 text-center shadow-lg shadow-black/25 animate-result-in">
      <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-stone-100">
        <Sparkles className="h-4 w-4 text-[#e28a58]" aria-hidden="true" />
        <span>Ready to analyze</span>
      </div>
      <p className="mt-1 text-xs text-stone-300/80 max-w-sm mx-auto leading-relaxed">
        Enter a review, comment, or feedback above to classify its sentiment.
      </p>
      <div className="mt-2.5 inline-flex items-center gap-2 text-[11px] text-stone-400/70 font-medium">
        <span>Positive / Negative</span>
        <span className="text-white/20">•</span>
        <span>Machine Learning</span>
      </div>
    </div>
  )
}
