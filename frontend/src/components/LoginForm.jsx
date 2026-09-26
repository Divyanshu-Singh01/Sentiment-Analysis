import React, { useState } from 'react'
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Sparkles, User } from 'lucide-react'

export function LoginForm({ onLogin, onSwitchToSignup, onCancel, sessionExpiredMessage }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [usernameError, setUsernameError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return

    let hasValidationError = false

    const trimmedUsername = username.trim()
    if (!trimmedUsername) {
      setUsernameError('Username is required.')
      hasValidationError = true
    } else {
      setUsernameError(null)
    }

    if (!password) {
      setPasswordError('Password is required.')
      hasValidationError = true
    } else {
      setPasswordError(null)
    }

    if (hasValidationError) {
      return
    }

    setIsLoading(true)
    setAuthError(null)

    try {
      await onLogin({ username: trimmedUsername, password })
    } catch (err) {
      setAuthError(err.message || 'Invalid username or password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full rounded-[28px] sm:rounded-[32px] p-[1.5px] bg-gradient-to-b from-[#e39c76] via-[#c6825c] to-[#a35e3c] shadow-[0_0_28px_rgba(223,135,88,0.2),0_20px_50px_-10px_rgba(100,50,20,0.18)] transition-all animate-result-in">
      <div className="relative w-full rounded-[26.5px] sm:rounded-[30.5px] bg-gradient-to-br from-[#faf0e8]/95 via-[#f4e4d7]/95 to-[#ead3c3]/95 backdrop-blur-2xl p-7 sm:p-9 overflow-hidden shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(180,105,70,0.15)]">
        {/* Soft luminous champagne sheen flare in background */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_86%_66%,rgba(255,252,248,0.85)_0%,rgba(255,239,228,0.45)_35%,rgba(247,226,212,0.12)_65%,transparent_80%)]"
          aria-hidden="true"
        />

        {/* Inner hairline border / contour groove */}
        <div
          className="pointer-events-none absolute inset-[3.5px] sm:inset-[4.5px] rounded-[23px] sm:rounded-[27px] border border-[#caa18a]/35 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.7),inset_0_-1px_1.5px_rgba(180,110,75,0.1)]"
          aria-hidden="true"
        />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4 sm:space-y-4.5" noValidate>
          {sessionExpiredMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50/95 backdrop-blur-md p-3 text-xs text-amber-950 animate-result-in shadow-xs"
            >
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{sessionExpiredMessage}</span>
            </div>
          )}

          {authError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50/95 backdrop-blur-md p-3 text-xs text-rose-900 animate-result-in shadow-xs"
            >
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{authError}</span>
            </div>
          )}

          {/* Username Field */}
          <div>
            <label
              htmlFor="login-username"
              className="block text-[13px] font-semibold text-[#2b180f] tracking-tight mb-2"
            >
              Username <span className="text-[#d96524]">*</span>
            </label>
            <div className="relative">
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (usernameError) setUsernameError(null)
                  if (authError) setAuthError(null)
                }}
                placeholder="Enter your username"
                disabled={isLoading}
                autoComplete="username"
                autoFocus
                className={`w-full h-12 rounded-xl bg-white/80 hover:bg-white/95 focus:bg-white border text-[#2e190e] placeholder:text-[#917565] text-[14.5px] pl-11 pr-4 outline-none transition-all duration-150 disabled:opacity-50 caret-[#d96524] shadow-xs ${
                  usernameError
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/25'
                    : 'border-[#d9a88f]/60 hover:border-[#cb8362] focus:border-[#d96524] focus:ring-2 focus:ring-[#d96524]/20 focus:shadow-[0_0_12px_rgba(217,101,36,0.2)]'
                }`}
                aria-invalid={!!usernameError}
                aria-describedby={usernameError ? 'username-error' : undefined}
              />
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a6a57] pointer-events-none"
                aria-hidden="true"
              />
            </div>
            {usernameError && (
              <p id="username-error" className="text-xs text-rose-700 font-medium pt-1">
                {usernameError}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-[13px] font-semibold text-[#2b180f] tracking-tight mb-2"
            >
              Password <span className="text-[#d96524]">*</span>
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) setPasswordError(null)
                  if (authError) setAuthError(null)
                }}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
                className={`w-full h-12 rounded-xl bg-white/80 hover:bg-white/95 focus:bg-white border text-[#2e190e] placeholder:text-[#917565] text-[14.5px] pl-11 pr-11 outline-none transition-all duration-150 disabled:opacity-50 caret-[#d96524] shadow-xs ${
                  passwordError
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/25'
                    : 'border-[#d9a88f]/60 hover:border-[#cb8362] focus:border-[#d96524] focus:ring-2 focus:ring-[#d96524]/20 focus:shadow-[0_0_12px_rgba(217,101,36,0.2)]'
                }`}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a6a57] pointer-events-none"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8a6a57] hover:text-[#2b180f] transition cursor-pointer disabled:opacity-50"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {passwordError && (
              <p id="password-error" className="text-xs text-rose-700 font-medium pt-1">
                {passwordError}
              </p>
            )}
          </div>

          {/* Submit Button & Navigation Links */}
          <div className="pt-2.5 space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full inline-flex items-center justify-center gap-2.5 rounded-full py-3.5 sm:py-4 px-6 text-[15px] sm:text-base font-semibold text-white bg-gradient-to-b from-[#bd531d] via-[#8c350d] to-[#692306] hover:from-[#cc5d23] hover:via-[#9b3d11] hover:to-[#772909] border border-[#f08a4f]/75 shadow-[0_0_28px_rgba(235,110,45,0.7),0_0_50px_rgba(220,90,30,0.35),0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,200,160,0.45)] hover:shadow-[0_0_36px_rgba(245,125,55,0.85),0_0_60px_rgba(235,110,45,0.45),0_10px_24px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,215,180,0.55)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#ffe2cc]" aria-hidden="true" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#ffe2cc] shrink-0 transition-transform group-hover:scale-110" aria-hidden="true" />
                  <span className="tracking-wide">Log In</span>
                  <ArrowRight className="h-4 w-4 text-white shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </>
              )}
            </button>

            {/* Navigation Links */}
            <div className="flex items-center justify-between text-xs sm:text-[13px] pt-1">
              {onSwitchToSignup && (
                <div className="text-[#6e5546]">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="text-[#d96524] hover:text-[#ba4f1a] font-semibold underline-offset-2 hover:underline transition-colors cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-[#6e5546] hover:text-[#22130b] font-medium transition-colors cursor-pointer ml-auto"
                >
                  Back to Analyzer
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
