import React from 'react'

export function AnalyticsLockedBanner({ onOpenLogin, onOpenSignup }) {
  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-neutral-200 bg-white p-8 text-center space-y-4 shadow-xs animate-result-in">
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold text-black">
          Channel & Sentiment Analytics
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Sign in or create an account to view live sentiment trajectories, category breakdowns, and Net Sentiment Scores.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenSignup}
          className="px-4 py-2 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
        >
          Create account
        </button>
        <button
          type="button"
          onClick={onOpenLogin}
          className="px-4 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-black text-xs font-medium transition-colors cursor-pointer shadow-xs"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}
