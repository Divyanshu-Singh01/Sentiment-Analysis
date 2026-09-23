import React from 'react'
import { Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xs sticky top-0 z-10">
      <div className="mx-auto flex h-13 max-w-3xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-slate-700" />
          <span className="text-sm font-medium tracking-tight text-slate-900">
            Sentiment Analysis
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Model ready</span>
        </div>
      </div>
    </header>
  )
}
