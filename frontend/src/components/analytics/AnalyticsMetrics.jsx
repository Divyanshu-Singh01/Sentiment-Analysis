import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  Smile,
  Frown,
  Activity,
  Award,
  Sparkles,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function AnalyticsMetrics({ summary }) {
  const {
    total_reviews = 0,
    positive_count = 0,
    negative_count = 0,
    neutral_count = 0,
    mixed_count = 0,
    positive_pct = 0,
    negative_pct = 0,
    neutral_pct = 0,
    mixed_pct = 0,
    average_confidence = 0,
    net_sentiment_score = 0,
  } = summary || {}

  // Net Sentiment Badge details
  const getNssInfo = (nss) => {
    if (nss >= 40) return { label: 'Strongly Positive', color: 'text-emerald-800 bg-emerald-50 border-emerald-300' }
    if (nss >= 15) return { label: 'Favorable Positive', color: 'text-teal-800 bg-teal-50 border-teal-300' }
    if (nss >= -15) return { label: 'Balanced / Neutral', color: 'text-amber-800 bg-amber-50 border-amber-300' }
    if (nss >= -40) return { label: 'Leaning Negative', color: 'text-orange-800 bg-orange-50 border-orange-300' }
    return { label: 'Critically Negative', color: 'text-rose-800 bg-rose-50 border-rose-300' }
  }

  const nssInfo = getNssInfo(net_sentiment_score)

  return (
    <div className="space-y-3">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Net Sentiment Score Hero Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#ecd2be]/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-[#786154]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9c7d69]">
              Net Sentiment (NSS)
            </span>
            {net_sentiment_score >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-600" />
            )}
          </div>

          <div className="mt-2.5 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  'text-3xl font-extrabold tracking-tight font-mono',
                  net_sentiment_score > 0
                    ? 'text-emerald-700'
                    : net_sentiment_score < 0
                    ? 'text-rose-700'
                    : 'text-[#22130b]'
                )}
              >
                {net_sentiment_score > 0 ? `+${net_sentiment_score}` : net_sentiment_score}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  nssInfo.color
                )}
              >
                {nssInfo.label}
              </span>
            </div>
            <p className="text-[10px] text-[#8c7466] pt-1">
              % Positive minus % Negative
            </p>
          </div>
        </div>

        {/* 2. Total Volume Analyzed */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#ecd2be]/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#786154]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9c7d69]">
              Search Volume
            </span>
            <Activity className="h-4 w-4 text-[#ba4f1a]" />
          </div>

          <div className="mt-2.5">
            <div className="text-3xl font-extrabold text-[#22130b] tracking-tight font-mono">
              {total_reviews.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#786154] mt-0.5">
              Total searches analyzed
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8c7466]">
              <Sparkles className="h-3 w-3 text-[#ba4f1a]" />
              <span>100% from your activity</span>
            </div>
          </div>
        </div>

        {/* 3. Positive vs Negative Ratio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#ecd2be]/80 shadow-xs flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[#786154]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9c7d69]">
              Sentiment Split
            </span>
            <div className="flex items-center gap-1">
              <Smile className="h-3.5 w-3.5 text-emerald-600" />
              <Frown className="h-3.5 w-3.5 text-rose-600" />
            </div>
          </div>

          <div className="mt-2.5 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-emerald-700 font-mono">
                {positive_pct}% <span className="text-[11px] text-[#786154] font-normal">Pos</span>
              </span>
              <span className="text-lg font-bold text-rose-700 font-mono">
                {negative_pct}% <span className="text-[11px] text-[#786154] font-normal">Neg</span>
              </span>
            </div>

            {/* Visual Split Ratio Bar */}
            <div className="h-2 w-full rounded-full bg-black/5 flex overflow-hidden">
              <div
                style={{ width: `${positive_pct}%` }}
                className="h-full bg-emerald-500 transition-all duration-500"
                title={`Positive: ${positive_pct}%`}
              />
              <div
                style={{ width: `${negative_pct}%` }}
                className="h-full bg-rose-500 transition-all duration-500"
                title={`Negative: ${negative_pct}%`}
              />
              <div
                style={{ width: `${neutral_pct}%` }}
                className="h-full bg-stone-400 transition-all duration-500"
                title={`Neutral: ${neutral_pct}%`}
              />
              <div
                style={{ width: `${mixed_pct}%` }}
                className="h-full bg-amber-500 transition-all duration-500"
                title={`Mixed: ${mixed_pct}%`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#8c7466]">
              <span>{positive_count} pos</span>
              <span>{neutral_count} neu • {mixed_count} mix</span>
              <span>{negative_count} neg</span>
            </div>
          </div>
        </div>

        {/* 4. Model Confidence Score */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#ecd2be]/80 shadow-xs flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[#786154]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9c7d69]">
              ML Confidence
            </span>
            <Award className="h-4 w-4 text-[#ba4f1a]" />
          </div>

          <div className="mt-2.5">
            <div className="text-3xl font-extrabold text-[#22130b] tracking-tight font-mono">
              {average_confidence}%
            </div>
            <p className="text-[11px] text-[#786154] mt-0.5">
              Average certainty score
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, average_confidence)}%` }}
                className="h-full bg-[#ba4f1a] rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
