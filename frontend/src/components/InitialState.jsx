import React from 'react'

export function InitialState() {
  return (
    <div className="w-full rounded-xl border border-slate-200/60 bg-white/50 p-4 sm:p-5 text-center shadow-2xs">
      <p className="text-sm font-medium text-slate-800">
        Ready to analyze
      </p>
      <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        Enter a review, comment, or feedback above to classify its sentiment.
      </p>
      <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
        <span>Positive / Negative</span>
        <span>•</span>
        <span>Machine Learning</span>
      </div>
    </div>
  )
}
