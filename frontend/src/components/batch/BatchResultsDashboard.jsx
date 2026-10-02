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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Positive
          </span>
        )
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <AlertCircle className="h-3 w-3 text-rose-600" /> Negative
          </span>
        )
      case 'neutral':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
            <MinusCircle className="h-3 w-3 text-neutral-500" /> Neutral
          </span>
        )
      case 'mixed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Scale className="h-3 w-3 text-amber-600" /> Mixed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
            {sentiment || 'N/A'}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 animate-result-in">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-black" />
            <h2 className="text-lg font-bold text-black tracking-tight">{filename}</h2>
          </div>
          <p className="text-xs text-neutral-600">
            Column analyzed: <span className="font-semibold text-black font-mono">{detected_column}</span> • {processed_rows} valid reviews
            {skipped_rows > 0 && ` (${skipped_rows} blank skipped)`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-black transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Upload Another
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full text-white bg-black hover:bg-neutral-800 shadow-xs transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download Enriched CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Positive */}
        <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-1 hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-black">Positive</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-black font-mono">
            {sentiment_percentages.positive ?? 0}%
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">
            {sentiment_counts.positive ?? 0} reviews
          </p>
        </div>

        {/* Negative */}
        <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-1 hover:border-rose-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-black">Negative</span>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-black font-mono">
            {sentiment_percentages.negative ?? 0}%
          </p>
          <p className="text-[11px] text-rose-700 font-medium">
            {sentiment_counts.negative ?? 0} reviews
          </p>
        </div>

        {/* Average Confidence */}
        <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-1 hover:border-violet-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-black">Avg Confidence</span>
            <Sparkles className="h-4 w-4 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-black font-mono">
            {average_confidence}%
          </p>
          <p className="text-[11px] text-neutral-500">Model certainty</p>
        </div>

        {/* Close Predictions */}
        <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-1 hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-black">Uncertain Margin</span>
            <HelpCircle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-black font-mono">
            {close_predictions_count}
          </p>
          <p className="text-[11px] text-amber-700">Delta &lt; 10% (Close)</p>
        </div>
      </div>

      {/* Visual Sentiment Distribution Bar */}
      <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-black">
          <span>Sentiment Distribution</span>
          <span className="text-[11px] font-normal text-neutral-500">{total_rows} total rows</span>
        </div>

        <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-100">
          <div
            style={{ width: `${sentiment_percentages.positive ?? 0}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Positive: ${sentiment_percentages.positive}%`}
          />
          <div
            style={{ width: `${sentiment_percentages.negative ?? 0}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Negative: ${sentiment_percentages.negative}%`}
          />
          <div
            style={{ width: `${sentiment_percentages.mixed ?? 0}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Mixed: ${sentiment_percentages.mixed}%`}
          />
          <div
            style={{ width: `${sentiment_percentages.neutral ?? 0}%` }}
            className="bg-neutral-400 transition-all duration-500"
            title={`Neutral: ${sentiment_percentages.neutral}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-neutral-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Positive ({sentiment_percentages.positive}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Negative ({sentiment_percentages.negative}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Mixed ({sentiment_percentages.mixed}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-neutral-400" />
            Neutral ({sentiment_percentages.neutral}%)
          </span>
        </div>
      </div>

      {/* Interactive Results Preview Table */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm space-y-0">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-black">Preview Results</h3>
            <p className="text-[11px] text-neutral-500">Showing first 25 analyzed rows. Full data available in CSV download.</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 text-black border border-neutral-200">
            {preview_results.length} rows previewed
          </span>
        </div>

        <div className="overflow-x-auto max-h-[420px] divide-y divide-neutral-100">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-neutral-50 text-black font-semibold border-b border-neutral-200 z-10">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">Review Snippet</th>
                <th className="py-2.5 px-3 w-28">Sentiment</th>
                <th className="py-2.5 px-3 w-24 text-right">Confidence</th>
                <th className="py-2.5 px-3 w-20 text-center">Close?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-black">
              {preview_results.map((row) => (
                <tr key={row.row_number} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-center text-neutral-500">
                    {row.row_number}
                  </td>
                  <td className="py-2.5 px-3 max-w-md truncate font-normal" title={row.text}>
                    {row.text || <em className="text-neutral-400">Blank row</em>}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getSentimentBadge(row.sentiment)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium whitespace-nowrap">
                    {row.confidence > 0 ? `${row.confidence}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {row.is_close ? (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-black border border-neutral-200">
                        Yes
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400">—</span>
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
