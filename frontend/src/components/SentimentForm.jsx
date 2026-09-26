import React from 'react'
import { ArrowRight, Loader2, RotateCcw, Sparkles, SquarePen } from 'lucide-react'

export function SentimentForm({
  text,
  setText,
  onSubmit,
  onReset,
  isLoading,
}) {
  const charCount = text ? text.length : 0
  const MAX_CHARS = 500

  const handleKeyDown = (e) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!isLoading && text.trim()) {
        onSubmit()
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isLoading && text.trim()) {
      onSubmit()
    }
  }

  const handleChange = (e) => {
    const val = e.target.value
    if (val.length <= MAX_CHARS) {
      setText(val)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
      {/* Main Text Box Container matching reference image shape & bevel */}
      <div className="relative w-full rounded-[26px] sm:rounded-[28px] p-[1.5px] bg-gradient-to-b from-[#e39c76] via-[#c6825c] to-[#a35e3c] shadow-[0_0_24px_rgba(223,135,88,0.22),0_18px_45px_-8px_rgba(0,0,0,0.45)] focus-within:from-[#f0aa84] focus-within:via-[#d99068] focus-within:to-[#b86d48] focus-within:shadow-[0_0_32px_rgba(235,140,85,0.35),0_20px_50px_-8px_rgba(0,0,0,0.55)] transition-all duration-200">
        {/* Inner Card with silk background and bevel groove */}
        <div className="relative w-full h-[190px] sm:h-[205px] rounded-[24.5px] sm:rounded-[26.5px] bg-gradient-to-br from-[#f7ebe3] via-[#eee0d6] to-[#e4cfc2] overflow-hidden">
          {/* Champagne luminous light sheen flare in bottom-right quadrant */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_86%_66%,rgba(255,252,248,0.85)_0%,rgba(255,239,228,0.45)_35%,rgba(247,226,212,0.12)_65%,transparent_80%)]"
            aria-hidden="true"
          />

          {/* Inner hairline border / contour groove from reference design */}
          <div
            className="pointer-events-none absolute inset-[3.5px] sm:inset-[4.5px] rounded-[21px] sm:rounded-[22px] border border-[#caa18a]/40 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.8),inset_0_-1px_1.5px_rgba(180,110,75,0.15)]"
            aria-hidden="true"
          />

          {/* Top-left compose/edit icon from reference design */}
          <SquarePen
            className="absolute left-5 sm:left-6 top-[21px] sm:top-[23px] h-5 w-5 text-[#5a3a29] pointer-events-none select-none shrink-0"
            aria-hidden="true"
          />

          <label htmlFor="sentiment-input" className="sr-only">
            Write your text here…
          </label>

          {/* Real functional textarea */}
          <textarea
            id="sentiment-input"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_CHARS}
            placeholder="Write your text here…"
            disabled={isLoading}
            aria-label="Write your text here to analyze its sentiment"
            className="w-full h-full bg-transparent pl-[52px] sm:pl-[56px] pr-12 sm:pr-14 pt-[19px] sm:pt-[21px] pb-10 text-[#3d2214] placeholder:text-[#886959] text-[15px] sm:text-[16px] leading-relaxed outline-none resize-none disabled:opacity-50 caret-[#df8758] font-normal"
          />

          {/* Clear text button (visible only when there is text and not loading) */}
          {text && !isLoading && (
            <button
              type="button"
              onClick={onReset}
              className="absolute top-4 right-4 sm:top-5 sm:right-6 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-[#7a5a48] hover:text-[#3d2214] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
              title="Clear text"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span className="text-[11px]">Clear</span>
            </button>
          )}

          {/* Bottom-right Character Counter and decorative corner resize marks */}
          <div className="absolute bottom-3.5 right-6 sm:bottom-4 sm:right-7 flex items-center gap-2 pointer-events-none select-none z-10">
            <span className="text-xs sm:text-[13px] font-mono font-medium text-[#7a5a48] tabular-nums tracking-wide">
              {charCount} / {MAX_CHARS}
            </span>

            {/* Corner diagonal tick marks matching reference image */}
            <svg
              className="w-3.5 h-3.5 text-[#9c7865] ml-0.5 opacity-85 shrink-0"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <line x1="14" y1="5" x2="5" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="14" y1="10" x2="10" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Analyze Sentiment Pill Button directly below the text box with glowing halo */}
      <div className="mt-6 sm:mt-7 flex justify-center">
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="group relative inline-flex items-center justify-center gap-2.5 rounded-full px-8 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-[15px] font-medium text-white bg-gradient-to-b from-[#be5424] via-[#a34217] to-[#85320e] hover:from-[#ce5f2a] hover:via-[#b24a1b] hover:to-[#933911] border border-[#f19a6d]/85 shadow-[0_0_24px_rgba(223,101,38,0.55),0_0_46px_rgba(195,80,24,0.3),0_8px_20px_rgba(120,44,14,0.32),inset_0_1px_1.5px_rgba(255,225,200,0.55)] hover:shadow-[0_0_32px_rgba(235,115,48,0.7),0_0_54px_rgba(210,90,30,0.38),0_10px_24px_rgba(120,44,14,0.4),inset_0_1px_1.5px_rgba(255,235,215,0.65)] active:scale-[0.98] transition-all duration-200 disabled:opacity-45 disabled:pointer-events-none cursor-pointer select-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#ffd4ba]" aria-hidden="true" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-[#ffe2cc] shrink-0 transition-transform group-hover:scale-110" aria-hidden="true" />
              <span className="tracking-wide">Analyze Sentiment</span>
              <ArrowRight className="h-4 w-4 text-white shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
