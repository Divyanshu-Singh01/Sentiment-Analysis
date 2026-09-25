import React from 'react'
import { Sparkles, UserPlus, LogIn } from 'lucide-react'

export function LimitReachedCard({ onOpenSignup, onOpenLogin }) {
  return (
    <div className="w-full rounded-[24px] border border-amber-500/30 bg-[#ebd5c5]/[0.16] backdrop-blur-2xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.35)] text-center space-y-4 animate-result-in">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/20 text-[#e28a58] border border-amber-500/30">
        <Sparkles className="h-5 w-5" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold tracking-tight text-white">
          You&apos;ve reached your 10 free predictions
        </h3>
        <p className="text-sm text-stone-300/90 max-w-sm mx-auto leading-relaxed">
          Create an account or log in to continue using the sentiment analyzer with unlimited access.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 max-w-xs mx-auto">
        <button
          type="button"
          onClick={onOpenSignup}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#4d2517] via-[#5c2d1c] to-[#462013] hover:from-[#5c2d1c] hover:to-[#522517] border border-[#a35334]/60 shadow-[0_8px_25px_rgba(40,15,8,0.6)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create Account</span>
        </button>

        <button
          type="button"
          onClick={onOpenLogin}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium text-stone-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 active:scale-[0.98] transition-all cursor-pointer"
        >
          <LogIn className="h-4 w-4" />
          <span>Log In</span>
        </button>
      </div>
    </div>
  )
}
