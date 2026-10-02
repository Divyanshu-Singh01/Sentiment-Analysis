import React from 'react'
import { UserPlus, LogIn } from 'lucide-react'

export function LimitReachedCard({ onOpenSignup, onOpenLogin }) {
  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-5 text-center space-y-3.5 shadow-xs animate-result-in">
      <div className="space-y-1">
        <p className="text-sm text-black font-semibold">Free trials used up</p>
        <p className="text-xs text-neutral-500">Sign in or create a free account to continue analyzing without limits.</p>
      </div>

      <div className="flex items-center justify-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={onOpenSignup}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-white bg-black hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Sign up</span>
        </button>

        <button
          type="button"
          onClick={onOpenLogin}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-black border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors cursor-pointer shadow-xs"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Log in</span>
        </button>
      </div>
    </div>
  )
}
