import React from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'

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
    <form onSubmit={handleSubmit} className="w-full space-y-3.5">
      <div className="relative">
        <label htmlFor="sentiment-input" className="sr-only">
          Text to analyze
        </label>
        <Textarea
          id="sentiment-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a review, comment, or feedback..."
          rows={5}
          disabled={isLoading}
          aria-label="Enter a review, comment, or feedback to analyze its sentiment"
        />

        {text && !isLoading && (
          <button
            type="button"
            onClick={onReset}
            className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            title="Clear text"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Subtle Example Prompt */}
      {!text && !isLoading && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 px-0.5">
          <span>Try an example:</span>
          <button
            type="button"
            onClick={() => handleExampleClick('I absolutely loved this product.')}
            className="text-slate-700 hover:text-slate-900 underline underline-offset-2 decoration-slate-300 hover:decoration-slate-600 transition cursor-pointer font-medium"
          >
            &ldquo;I absolutely loved this product.&rdquo;
          </button>
        </div>
      )}

      {/* Input Footer: Muted Metadata & Action Button */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <span className="tabular-nums font-mono text-slate-500">
            {charCount} {charCount === 1 ? 'character' : 'characters'}
          </span>
          <span className="hidden sm:inline text-slate-200">•</span>
          <span className="hidden sm:inline text-slate-400 font-normal">
            Ctrl + Enter to analyze
          </span>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading || !text.trim()}
          size="default"
          className="w-full sm:w-auto font-semibold px-5 text-[15px]"
        >
          {isLoading ? (
            'Analyzing...'
          ) : (
            <span className="flex items-center gap-1.5">
              Analyze Sentiment
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}

