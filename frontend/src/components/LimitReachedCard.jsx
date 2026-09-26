import React from 'react'
import { Sparkles, UserPlus, LogIn } from 'lucide-react'

export function LimitReachedCard({ onOpenSignup, onOpenLogin }) {
  return (
    <div className="w-full rounded-[24px] border border-amber-500/40 bg-white/80 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_15px_35px_rgba(200,120,70,0.14)] text-center space-y-4 animate-result-in">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/20 text-[#e28a58] border border-amber-500/30">
        <Sparkles className="h-5 w-5" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold tracking-tight text-[#22130b]">
          You&apos;ve reached your 10 free predictions
        </h3>
        <p className="text-sm text-[#543f34] max-w-sm mx-auto leading-relaxed">
          Create an account or log in to continue using the sentiment analyzer with unlimited access.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 max-w-xs mx-auto">
        <button
          type="button"
          onClick={onOpenSignup}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#bd531d] via-[#8c350d] to-[#692306] hover:from-[#cc5d23] hover:to-[#772909] border border-[#f08a4f]/70 shadow-[0_6px_20px_rgba(220,90,30,0.4)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create Account</span>
        </button>

        <button
          type="button"
          onClick={onOpenLogin}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-[#3b2317] hover:text-[#180a03] bg-black/5 hover:bg-black/10 border border-black/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          <LogIn className="h-4 w-4" />
          <span>Log In</span>
        </button>
      </div>
    </div>
  )
}
