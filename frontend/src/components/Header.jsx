import React from 'react'
import { History, LogOut, User } from 'lucide-react'
import logoImg from '../assets/logo.png'

export function Header({
  user,
  freePredictionsRemaining,
  onLogout,
  isLoggingOut,
  onOpenAuth,
  onToggleHistory,
  isHistoryOpen = false,
}) {
  return (
    <header className="w-full bg-transparent sticky top-0 z-20 backdrop-blur-xs transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-8">
        {/* Left Corner: Brand Logo */}
        <button
          type="button"
          onClick={() => {
            if (onOpenAuth) onOpenAuth(null)
          }}
          className="flex items-center group cursor-pointer text-left focus-visible:outline-none"
          aria-label="Sentiment Analysis"
        >
          <img
            src={logoImg}
            alt="Sentiment Analysis"
            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] drop-shadow-xs"
          />
        </button>

        {/* Right Corner: Controls */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
          {/* Subtle Anonymous Usage Pill */}
          {!user && typeof freePredictionsRemaining === 'number' && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/80 border border-[#df8758]/35 text-[#3d2417] backdrop-blur-md shadow-xs">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  freePredictionsRemaining > 0 ? 'bg-[#e28a58]' : 'bg-rose-500'
                }`}
              />
              <span>
                {freePredictionsRemaining}{' '}
                {freePredictionsRemaining === 1 ? 'free analysis' : 'free analyses'}{' '}
                remaining
              </span>
            </div>
          )}

          {/* History sidebar button for authenticated users */}
          {user && (
            <button
              type="button"
              onClick={onToggleHistory}
              className={`inline-flex items-center gap-1.5 font-semibold transition-all duration-150 cursor-pointer px-3 py-1.5 rounded-full active:scale-[0.97] ${
                isHistoryOpen
                  ? 'bg-black/10 text-[#140802] shadow-2xs'
                  : 'text-[#3d2417] hover:text-[#140802] hover:bg-black/5'
              }`}
              title="Toggle analysis history sidebar"
            >
              <History className="h-3.5 w-3.5 text-[#b85a32]" aria-hidden="true" />
              <span>History</span>
            </button>
          )}

          {/* Subtle Vertical Divider */}
          {user && <span className="h-3.5 w-px bg-black/15" aria-hidden="true" />}

          {/* User / Sign In Action */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 text-[#3d2417] bg-white/85 px-2.5 py-1 rounded-full border border-[#df8758]/30 shadow-xs">
                <User className="h-3 w-3 text-[#b85a32]" aria-hidden="true" />
                <span className="font-semibold text-[#24140b]">{user.username}</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-1 text-[#6e5648] hover:text-[#140802] transition-colors duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.97]"
                title="Log out of your account"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center gap-1.5 text-[#3d2417] hover:text-[#140802] font-semibold transition-colors duration-150 cursor-pointer px-1 py-1 rounded-md active:scale-[0.97]"
                title="Sign in to your account"
              >
                <User className="h-3.5 w-3.5 text-[#b85a32]" aria-hidden="true" />
                <span>Sign In</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  )
}
