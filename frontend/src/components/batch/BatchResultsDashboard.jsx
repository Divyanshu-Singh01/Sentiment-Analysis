import React from 'react'
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  Scale,
  Sparkles,
  HelpCircle,
  FileCheck,
} from 'lucide-react'

export function BatchResultsDashboard({ data, onReset }) {
  const { filename, summary, preview_results, annotated_csv } = data
  const {
    total_rows,
    processed_rows,
    skipped_rows,
    detected_column,
    sentiment_counts,
    sentiment_percentages,
    average_confidence,
    close_predictions_count,
  } = summary

  const handleDownloadCsv = () => {
    if (!annotated_csv) return
    const blob = new Blob([annotated_csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const baseName = filename.replace(/\.[^/.]+$/, '')
    link.setAttribute('download', `${baseName}_sentiment_analysis.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getSentimentBadge = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Positive
          </span>
        )
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300">
            <AlertCircle className="h-3 w-3 text-rose-600" /> Negative
          </span>
        )
      case 'neutral':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-50 text-stone-800 border border-stone-300">
            <MinusCircle className="h-3 w-3 text-stone-500" /> Neutral
          </span>
        )
      case 'mixed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
            <Scale className="h-3 w-3 text-amber-600" /> Mixed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {sentiment || 'N/A'}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 animate-result-in">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#ecd2be]/80 bg-white/75 backdrop-blur-xl shadow-[0_8px_30px_rgb(223,135,88,0.12)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-[#ba4f1a]" />
            <h2 className="text-lg font-bold text-[#22130b] tracking-tight">{filename}</h2>
          </div>
          <p className="text-xs text-[#786154]">
            Column analyzed: <span className="font-semibold text-[#22130b] font-mono">{detected_column}</span> • {processed_rows} valid reviews
            {skipped_rows > 0 && ` (${skipped_rows} blank skipped)`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#ecd2be] bg-white/80 hover:bg-white text-[#4d382d] transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Upload Another
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#d96526] via-[#c6551d] to-[#993b0a] hover:from-[#e37435] hover:to-[#a8440e] shadow-[0_4px_12px_rgba(217,101,38,0.3)] transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download Enriched CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Positive */}
        <div className="p-4 rounded-2xl border border-emerald-300/60 bg-emerald-50/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Positive</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 font-mono">
            {sentiment_percentages.positive ?? 0}%
          </p>
          <p className="text-[11px] text-emerald-700/80 font-medium">
            {sentiment_counts.positive ?? 0} reviews
          </p>
        </div>

        {/* Negative */}
        <div className="p-4 rounded-2xl border border-rose-300/60 bg-rose-50/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">Negative</span>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-900 font-mono">
            {sentiment_percentages.negative ?? 0}%
          </p>
          <p className="text-[11px] text-rose-700/80 font-medium">
            {sentiment_counts.negative ?? 0} reviews
          </p>
        </div>

        {/* Average Confidence */}
        <div className="p-4 rounded-2xl border border-[#df8758]/35 bg-white/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#993b0a]">Avg Confidence</span>
            <Sparkles className="h-4 w-4 text-[#ba4f1a]" />
          </div>
          <p className="text-2xl font-extrabold text-[#993b0a] font-mono">
            {average_confidence}%
          </p>
          <p className="text-[11px] text-[#786154]">Model certainty</p>
        </div>

        {/* Close Predictions */}
        <div className="p-4 rounded-2xl border border-amber-300/60 bg-amber-50/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Uncertain Margin</span>
            <HelpCircle className="h-4 w-4 text-amber-700" />
          </div>
          <p className="text-2xl font-extrabold text-amber-950 font-mono">
            {close_predictions_count}
          </p>
          <p className="text-[11px] text-[#786154]">Delta &lt; 10% (Close)</p>
        </div>
      </div>

      {/* Visual Sentiment Distribution Bar */}
      <div className="p-4 rounded-xl border border-[#ecd2be]/80 bg-white/70 backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#22130b]">
          <span>Sentiment Distribution</span>
          <span className="text-[11px] font-normal text-[#786154]">{total_rows} total rows</span>
        </div>

        <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-gray-100 border border-[#ecd2be]/60">
          <div
            style={{ width: `${sentiment_percentages.positive ?? 0}%` }}
            className="bg-[#2a6d48] transition-all duration-500"
            title={`Positive: ${sentiment_percentages.positive}%`}
          />
          <div
            style={{ width: `${sentiment_percentages.negative ?? 0}%` }}
            className="bg-[#b83b3b] transition-all duration-500"
            title={`Negative: ${sentiment_percentages.negative}%`}
          />
          <div
            style={{ width: `${sentiment_percentages.mixed ?? 0}%` }}
            className="bg-[#ba6820] transition-all duration-500"
            title={`Mixed: ${sentiment_percentages.mixed}%`}
          />
          <div
            style={{ width: `${sentiment_percentages.neutral ?? 0}%` }}
            className="bg-[#6b584c] transition-all duration-500"
            title={`Neutral: ${sentiment_percentages.neutral}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-[#614b3f]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2a6d48]" />
            Positive ({sentiment_percentages.positive}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#b83b3b]" />
            Negative ({sentiment_percentages.negative}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ba6820]" />
            Mixed ({sentiment_percentages.mixed}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6b584c]" />
            Neutral ({sentiment_percentages.neutral}%)
          </span>
        </div>
      </div>

      {/* Interactive Results Preview Table */}
      <div className="rounded-2xl border border-[#ecd2be]/80 bg-white/80 backdrop-blur-xl overflow-hidden shadow-[0_8px_30px_rgb(223,135,88,0.08)] space-y-0">
        <div className="p-4 border-b border-[#ecd2be]/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#22130b]">Preview Results</h3>
            <p className="text-[11px] text-[#786154]">Showing first 25 analyzed rows. Full data available in CSV download.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#df8758]/15 text-[#993b0a]">
            {preview_results.length} rows previewed
          </span>
        </div>

        <div className="overflow-x-auto max-h-[420px] divide-y divide-[#ecd2be]/40">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#fbf6f2] text-[#4d382d] font-semibold border-b border-[#ecd2be]/60 z-10">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">Review Snippet</th>
                <th className="py-2.5 px-3 w-28">Sentiment</th>
                <th className="py-2.5 px-3 w-24 text-right">Confidence</th>
                <th className="py-2.5 px-3 w-20 text-center">Close?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecd2be]/30 text-[#22130b]">
              {preview_results.map((row) => (
                <tr key={row.row_number} className="hover:bg-[#fcf8f5] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-center text-[#786154]">
                    {row.row_number}
                  </td>
                  <td className="py-2.5 px-3 max-w-md truncate font-normal" title={row.text}>
                    {row.text || <em className="text-gray-400">Blank row</em>}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getSentimentBadge(row.sentiment)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium whitespace-nowrap">
                    {row.confidence > 0 ? `${row.confidence}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {row.is_close ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ba6820]/15 text-[#8c460a]">
                        Yes
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
