import React from 'react'
import { ArrowRight, Loader2, PenLine, RotateCcw } from 'lucide-react'

export function SentimentForm({
  text,
  setText,
  onSubmit,
  onReset,
  isLoading,
}) {
  const charCount = text.length

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

  const handleExampleClick = (exampleText) => {
    setText(exampleText)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Inner Inset Textarea Glass Panel with Pencil Icon */}
      <div className="relative rounded-2xl bg-black/20 border border-white/10 transition-all duration-200 focus-within:border-[#df8758]/60 focus-within:ring-1 focus-within:ring-[#df8758]/30 shadow-inner">
        <PenLine
          className="absolute left-4 top-4 h-4 w-4 text-stone-400/80 pointer-events-none"
          aria-hidden="true"
        />

        <label htmlFor="sentiment-input" className="sr-only">
          Text to analyze
        </label>

        <textarea
          id="sentiment-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a review, comment, or feedback..."
          rows={5}
          disabled={isLoading}
          aria-label="Enter a review, comment, or feedback to analyze its sentiment"
          className="w-full min-h-[140px] bg-transparent pl-11 pr-16 py-3.5 text-stone-100 placeholder:text-stone-400/70 text-[15px] leading-relaxed outline-none resize-none disabled:opacity-50 caret-[#df8758]"
        />

        {text && !isLoading && (
          <button
            type="button"
            onClick={onReset}
            className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-white/10 transition-colors duration-150 cursor-pointer active:scale-[0.97]"
            title="Clear text"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Footer Area inside Glass Panel: Example & Meta on Left, Analyze Button on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
        {/* Left: Example Prompt and Character Metadata */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-stone-300/80">
            <span>Try an example:</span>
            <button
              type="button"
              onClick={() => handleExampleClick('I absolutely loved this product.')}
              className="text-stone-200 hover:text-white underline underline-offset-2 decoration-stone-400/40 hover:decoration-stone-200 transition font-medium cursor-pointer"
            >
              &ldquo;I absolutely loved this product.&rdquo;
            </button>
          </div>

          <div className="flex items-center gap-2 text-stone-400/70 text-[11px]">
            <span className="tabular-nums font-mono">
              {charCount} {charCount === 1 ? 'character' : 'characters'}
            </span>
            <span className="text-white/20">|</span>
            <span>Ctrl + Enter to analyze</span>
          </div>
        </div>

        {/* Right: Analyze Sentiment Pill Button */}
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#4d2517] via-[#5c2d1c] to-[#462013] hover:from-[#5c2d1c] hover:to-[#522517] border border-[#a35334]/60 shadow-[0_8px_25px_rgba(40,15,8,0.6)] hover:shadow-[0_8px_30px_rgba(70,25,12,0.7)] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-stone-300" aria-hidden="true" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze Sentiment</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

