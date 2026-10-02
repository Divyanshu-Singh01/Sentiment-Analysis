import React from 'react'
import { Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '../lib/utils'

export function SidebarNav({
  activeTab = 'single',
  onSelectTab,
}) {
  const isAnalyzerActive = activeTab === 'single' || activeTab === 'batch'

  return (
    /* Mobile-only sticky sub-bar (Desktop navigation is centered inside the Header) */
    <nav
      aria-label="Mobile Navigation"
      className="sm:hidden flex items-center justify-center py-2 px-4 border-b border-neutral-100 bg-white sticky top-14 z-30"
    >
      <div className="flex items-center gap-1 p-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-xs">
        <button
          type="button"
          onClick={() => onSelectTab?.('single')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer select-none',
            isAnalyzerActive ? 'bg-white text-black shadow-xs font-semibold' : 'text-neutral-500 hover:text-black'
          )}
        >
          <Sparkles className="h-3 w-3" />
          <span>Analyze</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab?.('analytics')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer select-none',
            activeTab === 'analytics' ? 'bg-white text-black shadow-xs font-semibold' : 'text-neutral-500 hover:text-black'
          )}
        >
          <TrendingUp className="h-3 w-3" />
          <span>Analytics</span>
        </button>
      </div>
    </nav>
  )
}
