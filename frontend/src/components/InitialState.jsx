import React from 'react'
import { Sparkles } from 'lucide-react'

export function InitialState() {
  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-neutral-200 bg-white p-5 text-center shadow-xs animate-result-in">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-black tracking-tight">
        <Sparkles className="h-4 w-4 text-black shrink-0" aria-hidden="true" />
        <span>Ready to analyze</span>
      </div>
      <p className="mt-1.5 text-xs sm:text-[13px] text-neutral-500 max-w-sm mx-auto leading-relaxed">
        Write a customer review above, or attach a .csv / .xlsx spreadsheet to classify sentiment in bulk.
      </p>
      <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 font-medium">
        <span className="font-semibold text-black">Positive</span>
        <span className="text-neutral-300">•</span>
        <span className="font-semibold text-black">Negative</span>
        <span className="text-neutral-300">•</span>
        <span className="font-semibold text-black">Neutral</span>
        <span className="text-neutral-300">•</span>
        <span className="font-semibold text-black">Mixed</span>
        <span className="text-neutral-300">•</span>
        <span>Machine Learning</span>
      </div>
    </div>
  )
}
