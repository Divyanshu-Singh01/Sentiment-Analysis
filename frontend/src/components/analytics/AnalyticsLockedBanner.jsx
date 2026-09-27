import React from 'react'
import { TrendingUp, Lock, Sparkles, BarChart3, PieChart, Calendar } from 'lucide-react'

export function AnalyticsLockedBanner({ onOpenLogin, onOpenSignup }) {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl border border-[#ecd2be]/80 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_12px_40px_rgb(223,135,88,0.12)] text-center space-y-6 animate-result-in">
      {/* Icon & Pro Badge Header */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#d96526] via-[#ba4f1a] to-[#993b0a] flex items-center justify-center text-white shadow-md shadow-[#ba4f1a]/25">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-white border border-[#ecd2be] flex items-center justify-center text-[#ba4f1a] shadow-xs">
            <Lock className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#df8758]/15 text-[#993b0a] border border-[#df8758]/30">
          <Sparkles className="h-3 w-3" />
          Member Feature
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#22130b] tracking-tight">
          Unlock Live Sentiment Trend Analytics
        </h2>
        <p className="text-xs sm:text-sm text-[#614b3f] max-w-md mx-auto leading-relaxed">
          Track customer sentiment trajectories over time, benchmark product & service categories, and calculate real-time Net Sentiment Scores.
        </p>
      </div>

      {/* Feature Value Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="p-3.5 rounded-2xl bg-white/60 border border-[#ecd2be]/60 space-y-1.5">
          <div className="flex items-center gap-2 text-[#ba4f1a]">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-bold text-[#22130b]">Time-Series Trends</span>
          </div>
          <p className="text-[11px] text-[#786154] leading-normal">
            Visualize positive, negative, and mixed sentiment shifts over 7, 30, or 90 days.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/60 border border-[#ecd2be]/60 space-y-1.5">
          <div className="flex items-center gap-2 text-[#ba4f1a]">
            <PieChart className="h-4 w-4" />
            <span className="text-xs font-bold text-[#22130b]">Category Breakdown</span>
          </div>
          <p className="text-[11px] text-[#786154] leading-normal">
            Automatic categorization across E-Commerce, Food, Banking, Transit, and Telecom.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/60 border border-[#ecd2be]/60 space-y-1.5">
          <div className="flex items-center gap-2 text-[#ba4f1a]">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-bold text-[#22130b]">Net Sentiment Score</span>
          </div>
          <p className="text-[11px] text-[#786154] leading-normal">
            Unified KPI meter (-100 to +100) combining single reviews and bulk datasets.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenSignup}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d96526] via-[#ba4f1a] to-[#993b0a] hover:from-[#e06d2e] hover:to-[#a8420e] text-white text-xs font-semibold shadow-md shadow-[#ba4f1a]/20 transition-all cursor-pointer"
        >
          Create Free Account
        </button>
        <button
          type="button"
          onClick={onOpenLogin}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#ecd2be] bg-white/80 hover:bg-white text-[#4d382d] text-xs font-semibold transition-all cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </div>
  )
}
