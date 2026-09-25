import React from 'react'
import { LogOut, Network, User } from 'lucide-react'

export function Header({
  user,
  freePredictionsRemaining,
  onLogout,
  isLoggingOut,
  onOpenAuth,
}) {
  return (
    <header className="w-full bg-transparent sticky top-0 z-20 backdrop-blur-xs transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-8">
        {/* Left Corner: Leaf/Feather Logo + Sentiment Analysis */}
        <button
          type="button"
          onClick={() => onOpenAuth && onOpenAuth(null)}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus-visible:outline-none"
        >
          {/* Stylized leaf logo matching reference mockup */}
          <div className="flex h-7 w-7 items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <svg
              className="h-6 w-6 text-[#e28a58]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path
                d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"
                fill="url(#leaf-gradient)"
                stroke="none"
              />
              <line x1="16" y1="8" x2="2" y2="22" stroke="#e28a58" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="17.5" y1="15" x2="9" y2="15" stroke="#f6c2a4" strokeWidth="1.6" strokeLinecap="round" />
              <defs>
                <linearGradient id="leaf-gradient" x1="5" y1="5" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f5ab80" />
                  <stop offset="1" stopColor="#b6582e" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-white drop-shadow-xs">
            Sentiment Analysis
          </span>
        </button>

        {/* Right Corner: Analyzer & Auth Controls */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
          {/* Subtle Anonymous Usage Pill */}
          {!user && typeof freePredictionsRemaining === 'number' && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/30 border border-white/10 text-stone-300 backdrop-blur-md">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  freePredictionsRemaining > 0 ? 'bg-[#e28a58]' : 'bg-rose-400'
                }`}
              />
              <span>
                {freePredictionsRemaining}{' '}
                {freePredictionsRemaining === 1 ? 'free analysis' : 'free analyses'}{' '}
                remaining
              </span>
            </div>
          )}

          {/* Analyzer Action */}
          <button
            type="button"
            onClick={() => onOpenAuth && onOpenAuth(null)}
            className="inline-flex items-center gap-1.5 text-stone-200 hover:text-white transition-colors duration-150 cursor-pointer px-1 py-1 rounded-md active:scale-[0.97]"
            title="Go to Sentiment Analyzer"
          >
            <Network className="h-3.5 w-3.5 text-[#e28a58]" aria-hidden="true" />
            <span>Analyzer</span>
          </button>

          {/* Subtle Vertical Divider */}
          <span className="h-3.5 w-px bg-white/20" aria-hidden="true" />

          {/* User / Sign In Action */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 text-stone-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                <User className="h-3 w-3 text-[#e28a58]" aria-hidden="true" />
                <span className="text-white font-medium">{user.username}</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.97]"
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
                className="inline-flex items-center gap-1.5 text-stone-200 hover:text-white transition-colors duration-150 cursor-pointer px-1 py-1 rounded-md active:scale-[0.97]"
                title="Sign in to your account"
              >
                <User className="h-3.5 w-3.5 text-stone-300" aria-hidden="true" />
                <span>Sign In</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  )
}
