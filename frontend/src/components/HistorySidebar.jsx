import React, { useEffect, useState } from 'react'
import {
  AlertCircle,
  Check,
  Clock,
  Loader2,
  Minus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { clearAllHistory, deleteHistoryItem, fetchHistory } from '../services/historyApi'

const SENTIMENT_STYLES = {
  positive: {
    label: 'Positive',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-300/80',
    dot: 'bg-emerald-600',
    icon: Check,
  },
  negative: {
    label: 'Negative',
    badge: 'bg-rose-50 text-rose-800 border-rose-300/80',
    dot: 'bg-rose-600',
    icon: AlertCircle,
  },
  neutral: {
    label: 'Neutral',
    badge: 'bg-stone-100 text-stone-800 border-stone-300',
    dot: 'bg-stone-500',
    icon: Minus,
  },
  mixed: {
    label: 'Mixed',
    badge: 'bg-amber-50 text-amber-900 border-amber-300/80',
    dot: 'bg-amber-600',
    icon: Sparkles,
  },
}

function formatRelativeDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''

  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function formatConfidence(val) {
  if (typeof val !== 'number' || isNaN(val)) return '0%'
  if (val > 1) return `${Math.round(val)}%`
  return `${Math.round(val * 100)}%`
}

export function HistorySidebar({
  isOpen,
  onClose,
  onSelectText,
  onSessionExpired,
  refreshTrigger,
}) {
  const [historyItems, setHistoryItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)


  // Load history whenever sidebar opens or when a new analysis is made
  useEffect(() => {
    if (!isOpen) return
    let isMounted = true

    async function init() {
      setIsLoading(true)
      try {
        const data = await fetchHistory({ page: 1, pageSize: 50 })
        if (isMounted) {
          setHistoryItems(data.history || [])
          setConfirmClear(false)
        }
      } catch (err) {
        if (isMounted && err.isSessionExpired && onSessionExpired) {
          onSessionExpired()
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    init()
    return () => {
      isMounted = false
    }
  }, [isOpen, refreshTrigger, onSessionExpired])

  // Delete single item
  const handleDelete = async (e, id) => {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await deleteHistoryItem(id)
      setHistoryItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      if (err.isSessionExpired && onSessionExpired) {
        onSessionExpired()
        return
      }
    } finally {
      setDeletingId(null)
    }
  }

  // Clear all history
  const handleClearAll = async () => {
    setIsClearing(true)
    try {
      await clearAllHistory()
      setHistoryItems([])
      setConfirmClear(false)
    } catch (err) {
      if (err.isSessionExpired && onSessionExpired) {
        onSessionExpired()
        return
      }
    } finally {
      setIsClearing(false)
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Sidebar Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Analysis History Sidebar"
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white/95 backdrop-blur-2xl border-l border-[#d98a5a]/30 shadow-2xl flex flex-col text-[#22130b] animate-sidebar-slide"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 bg-white/60">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#d66524]" aria-hidden="true" />
            <h2 className="text-base font-bold tracking-tight text-[#22130b]">
              History
            </h2>
            {historyItems.length > 0 && (
              <span className="text-[11px] font-semibold text-[#8a7266] bg-black/5 px-2 py-0.5 rounded-full">
                {historyItems.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Clear all action */}
            {historyItems.length > 0 && !confirmClear && (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="text-xs font-semibold text-[#8a7266] hover:text-rose-700 px-2 py-1 rounded-md transition-colors cursor-pointer"
                title="Clear all saved history"
              >
                Clear all
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#8a7266] hover:text-[#22130b] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Confirmation banner if user clicked Clear all */}
        {confirmClear && (
          <div className="px-5 py-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between gap-2 text-xs">
            <span className="text-rose-900 font-medium">Clear all history?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1 font-semibold text-[#543f34] bg-white border border-black/10 rounded-md hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isClearing}
                className="px-2.5 py-1 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs disabled:opacity-50"
              >
                {isClearing ? 'Clearing...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}

        {/* Sidebar Body / History Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-[#7d675b]">
              <Loader2 className="h-5 w-5 animate-spin text-[#d66524]" />
              <p className="text-xs font-medium">Loading history...</p>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="py-20 text-center space-y-2 text-[#7d675b]">
              <Clock className="h-8 w-8 text-[#d98a5a]/60 mx-auto" aria-hidden="true" />
              <p className="text-sm font-semibold text-[#22130b]">No analysis history yet</p>
              <p className="text-xs text-[#8a7266] max-w-[240px] mx-auto">
                Your successful sentiment analyses will appear here.
              </p>
            </div>
          ) : (
            historyItems.map((item) => {
              const conf =
                SENTIMENT_STYLES[item.sentiment.toLowerCase()] ||
                SENTIMENT_STYLES.neutral
              const IconComponent = conf.icon

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectText) {
                      onSelectText(item.text)
                      onClose()
                    }
                  }}
                  className="group relative rounded-xl border border-[#d98a5a]/25 bg-white/90 hover:bg-white p-3.5 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer text-left space-y-2 active:scale-[0.99]"
                  title="Click to load text into analyzer"
                >
                  {/* Top line: Sentiment badge + Confidence + Relative Date + Delete */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold',
                          conf.badge
                        )}
                      >
                        <IconComponent className="h-2.5 w-2.5 stroke-[2.5]" aria-hidden="true" />
                        <span>{conf.label}</span>
                      </span>

                      <span className="text-[11px] font-semibold text-[#543f34]">
                        {formatConfidence(item.confidence)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[#8a7266]">
                        {formatRelativeDate(item.created_at)}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item.id)}
                        disabled={deletingId === item.id}
                        className="p-1 text-[#8a7266] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete record"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="h-3 w-3" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Text snippet */}
                  <p className="text-xs text-[#2c1a10] leading-relaxed line-clamp-2 select-none">
                    "{item.text}"
                  </p>
                </div>
              )
            })
          )}
        </div>

        {/* Subtle Footer hint */}
        <div className="px-5 py-3 border-t border-black/5 bg-white/60 text-center">
          <p className="text-[11px] text-[#8a7266]">
            Click any item to load text into the analyzer
          </p>
        </div>
      </aside>
    </>
  )
}
