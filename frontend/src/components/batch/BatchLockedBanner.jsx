import React from 'react'
import { Lock, FileSpreadsheet, BarChart3, Download, Sparkles, ArrowRight } from 'lucide-react'

export function BatchLockedBanner({ onOpenLogin, onOpenSignup }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm transition-all">
      <div className="relative space-y-6">
        {/* Header Badge & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-neutral-100 flex items-center justify-center text-black border border-neutral-200">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-black border border-neutral-200 mb-1">
                <Sparkles className="h-3 w-3" />
                Member Exclusive
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
                Bulk File Analysis
              </h2>
            </div>
          </div>
        </div>

        {/* Value Proposition Description */}
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl">
          Upload spreadsheets containing hundreds of customer reviews or feedback comments to receive instant multi-class sentiment distributions, average customer confidence, and downloadable enriched CSVs.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <FileSpreadsheet className="h-5 w-5 text-black shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-black">Up to 2,000 Rows</h4>
              <p className="text-[11px] text-neutral-500 leading-snug">Supports CSV, TSV, and Excel spreadsheets.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <BarChart3 className="h-5 w-5 text-black shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-black">Live Analytics</h4>
              <p className="text-[11px] text-neutral-500 leading-snug">Instant 4-class distribution breakdown & KPIs.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <Download className="h-5 w-5 text-black shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-black">Enriched Export</h4>
              <p className="text-[11px] text-neutral-500 leading-snug">Download CSV with predictions & confidence scores.</p>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenSignup}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm text-white bg-black hover:bg-neutral-800 active:bg-neutral-900 shadow-xs transition-colors cursor-pointer"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full font-medium text-sm text-black bg-white hover:bg-neutral-50 border border-neutral-200 shadow-xs transition-colors cursor-pointer"
          >
            Sign In to Unlock
          </button>
        </div>
      </div>
    </div>
  )
}
