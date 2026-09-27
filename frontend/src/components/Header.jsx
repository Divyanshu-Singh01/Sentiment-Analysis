import React from 'react'
import { LogOut, User } from 'lucide-react'
import logoImg from '../assets/logo.png'

export function Header({
  user,
  freePredictionsRemaining,
  onLogout,
  isLoggingOut,
  onOpenAuth,
}) {
  return (
    <header className="w-full bg-white/40 sticky top-0 z-20 backdrop-blur-md border-b border-[#edd7c7]/50 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-8">
        {/* Left Corner: Brand Logo */}
        <button
          type="button"
          onClick={() => {
            if (onOpenAuth) onOpenAuth(null)
          }}
          className="flex items-center group cursor-pointer text-left focus-visible:outline-none"
          aria-label="Sentiment Analysis Home"
        >
          <img
            src={logoImg}
            alt="Sentiment Analysis"
            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] drop-shadow-xs"
          />
        </button>

        {/* Right Corner: Controls */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
          {/* Anonymous Usage Pill */}
          {!user && typeof freePredictionsRemaining === 'number' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/85 border border-[#df8758]/35 text-[#3d2417] backdrop-blur-md shadow-xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  freePredictionsRemaining > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>
                {freePredictionsRemaining}{' '}
                {freePredictionsRemaining === 1 ? 'free trial left' : 'free trials left'}
              </span>
            </div>
          )}

          {/* User / Sign In Action */}
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 text-[#3d2417] bg-white/90 px-3 py-1.5 rounded-full border border-[#df8758]/35 shadow-xs">
                <div className="h-4 w-4 rounded-full bg-[#df8758]/20 flex items-center justify-center text-[#ba4f1a]">
                  <User className="h-2.5 w-2.5 stroke-[2.5]" aria-hidden="true" />
                </div>
                <span className="font-bold text-[#24140b] tracking-tight">{user.username}</span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-1.5 text-[#6e5648] hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-full border border-transparent hover:border-rose-200 transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-95"
                title="Log out of your account"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-semibold">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center gap-1.5 text-[#24140b] bg-white/90 hover:bg-white font-bold transition-all duration-150 cursor-pointer px-4 py-1.5 rounded-full border border-[#df8758]/35 shadow-xs active:scale-95"
                title="Sign in to your account"
              >
                <User className="h-3.5 w-3.5 text-[#ba4f1a]" aria-hidden="true" />
                <span>Sign In</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  )
}
