import React from 'react'
import { LogOut, Sparkles, TrendingUp } from 'lucide-react'
import logoImg from '../assets/logo (2).png'
import { cn } from '../lib/utils'

export function Header({
  user,
  freePredictionsRemaining,
  onLogout,
  isLoggingOut,
  onOpenAuth,
  activeTab = 'single',
  onSelectTab,
}) {
  const isAnalyzerActive = activeTab === 'single' || activeTab === 'batch'

  return (
    <header className="w-full bg-white sticky top-0 z-40 border-b border-neutral-200">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand */}
        <button
          type="button"
          onClick={() => {
            onSelectTab?.('single')
            onOpenAuth?.(null)
          }}
          className="group flex items-center gap-2.5 cursor-pointer focus-visible:outline-none select-none shrink-0"
          aria-label="Home"
        >
          <div className="relative flex items-center justify-center shrink-0">
            {/* Gemini-style ambient blue glow behind logo */}
            <div className="absolute inset-0 rounded-full bg-blue-500/15 blur-md scale-110 group-hover:scale-125 group-hover:bg-blue-500/30 transition-all duration-300" />
            <img
              src={logoImg}
              alt="Sentiment Analysis Logo"
              className="relative h-6.5 w-6.5 sm:h-7 sm:w-7 md:h-7.5 md:w-7.5 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_1px_6px_rgba(59,130,246,0.3)]"
            />
          </div>
          <span className="font-semibold text-sm sm:text-[15px] tracking-tight text-neutral-900 group-hover:text-black transition-colors">
            Sentiment Analysis
          </span>
        </button>

        {/* Center: Main Navigation Segmented Control (Desktop & Tablet) */}
        {onSelectTab && (
          <nav aria-label="Main Navigation" className="hidden sm:flex items-center gap-1 p-0.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-xs">
            <button
              type="button"
              onClick={() => onSelectTab('single')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer select-none',
                isAnalyzerActive
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Analyze</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('analytics')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer select-none',
                activeTab === 'analytics'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
              )}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Analytics</span>
            </button>
          </nav>
        )}

        {/* Right: Auth & Status */}
        <div className="flex items-center gap-2.5 text-xs shrink-0">
          {!user && typeof freePredictionsRemaining === 'number' && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200/80 bg-neutral-50/60 text-xs font-mono">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full shrink-0',
                  freePredictionsRemaining > 3
                    ? 'bg-emerald-500'
                    : freePredictionsRemaining > 0
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                )}
              />
              <span className="text-neutral-600 font-medium">{freePredictionsRemaining} free left</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
                {user.username}
              </span>
              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="text-xs text-neutral-500 hover:text-black p-1.5 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-medium transition-colors cursor-pointer shadow-xs"
              >
                Sign in
              </button>
            )
          )}
        </div>
      </div>
    </header>
  )
}
