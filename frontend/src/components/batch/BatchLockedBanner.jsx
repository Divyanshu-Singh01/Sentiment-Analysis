import React from 'react'
import { Lock, FileSpreadsheet, BarChart3, Download, Sparkles, ArrowRight } from 'lucide-react'

export function BatchLockedBanner({ onOpenLogin, onOpenSignup }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#ecd2be]/80 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(223,135,88,0.12)] transition-all">
      {/* Decorative ambient copper glow */}
      <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-[#f4ba93]/30 blur-2xl pointer-events-none" />

      <div className="relative space-y-6">
        {/* Header Badge & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#df8758]/20 to-[#ba4f1a]/25 flex items-center justify-center text-[#ba4f1a] border border-[#df8758]/30 shadow-xs">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#df8758]/15 text-[#9e3f0e] border border-[#df8758]/30 mb-1">
                <Sparkles className="h-3 w-3" />
                Member Exclusive
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#22130b] tracking-tight">
                Bulk File Analysis
              </h2>
            </div>
          </div>
        </div>

        {/* Value Proposition Description */}
        <p className="text-[15px] text-[#614b3f] leading-relaxed max-w-xl">
          Upload spreadsheets containing hundreds of customer reviews or feedback comments to receive instant multi-class sentiment distributions, average customer confidence, and downloadable enriched CSVs.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fefaf7] border border-[#ecd2be]/60">
            <FileSpreadsheet className="h-5 w-5 text-[#ba4f1a] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#22130b]">Up to 2,000 Rows</h4>
              <p className="text-[11px] text-[#786154] leading-snug">Supports CSV, TSV, and Excel spreadsheets.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fefaf7] border border-[#ecd2be]/60">
            <BarChart3 className="h-5 w-5 text-[#ba4f1a] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#22130b]">Live Analytics</h4>
              <p className="text-[11px] text-[#786154] leading-snug">Instant 4-class distribution breakdown & KPIs.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fefaf7] border border-[#ecd2be]/60">
            <Download className="h-5 w-5 text-[#ba4f1a] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#22130b]">Enriched Export</h4>
              <p className="text-[11px] text-[#786154] leading-snug">Download CSV with predictions & confidence scores.</p>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenSignup}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#d96526] via-[#c6551d] to-[#993b0a] hover:from-[#e37435] hover:to-[#a8440e] shadow-[0_4px_14px_rgba(217,101,38,0.35)] transition-all cursor-pointer"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm text-[#4d382d] bg-white/80 hover:bg-white border border-[#ecd2be] hover:border-[#df8758]/50 transition-all cursor-pointer"
          >
            Sign In to Unlock
          </button>
        </div>
      </div>
    </div>
  )
}
