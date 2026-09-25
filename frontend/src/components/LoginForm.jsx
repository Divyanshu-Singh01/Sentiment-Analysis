import React, { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Lock, User } from 'lucide-react'
import { Input } from './ui/Input'

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
    <div className="w-full rounded-[24px] border border-white/20 bg-[#ebd5c5]/[0.16] backdrop-blur-2xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {sessionExpiredMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/40 backdrop-blur-md p-3 text-xs text-amber-200 animate-result-in"
          >
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{sessionExpiredMessage}</span>
          </div>
        )}

        {authError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 backdrop-blur-md p-3 text-xs text-rose-200 animate-result-in"
          >
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{authError}</span>
          </div>
        )}

        {/* Username Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-username"
            className="block text-xs font-semibold text-stone-200 tracking-tight"
          >
            Username
          </label>
          <div className="relative">
            <Input
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
              className="pl-9 bg-black/25 border-white/15 text-stone-100 placeholder:text-stone-400 focus:border-[#df8758] focus:ring-[#df8758]/25 rounded-xl"
              aria-invalid={!!usernameError}
              aria-describedby={usernameError ? 'username-error' : undefined}
            />
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          {usernameError && (
            <p id="username-error" className="text-xs text-rose-300 font-medium">
              {usernameError}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-stone-200 tracking-tight"
          >
            Password
          </label>
          <div className="relative">
            <Input
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
              className="pl-9 pr-10 bg-black/25 border-white/15 text-stone-100 placeholder:text-stone-400 focus:border-[#df8758] focus:ring-[#df8758]/25 rounded-xl"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
            />
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-200 transition cursor-pointer disabled:opacity-50"
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
            <p id="password-error" className="text-xs text-rose-300 font-medium">
              {passwordError}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center font-semibold text-[15px] rounded-full py-2.5 bg-gradient-to-r from-[#4d2517] via-[#5c2d1c] to-[#462013] hover:from-[#5c2d1c] hover:to-[#522517] border border-[#a35334]/60 text-white shadow-[0_8px_25px_rgba(40,15,8,0.6)] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Navigation Links */}
          <div className="flex items-center justify-between text-xs text-stone-300/80 pt-1">
            {onSwitchToSignup && (
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="hover:text-white font-medium underline underline-offset-2 decoration-stone-400/40 hover:decoration-stone-200 transition cursor-pointer"
              >
                Don&apos;t have an account? Sign Up
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="hover:text-white transition cursor-pointer"
              >
                Back to Analyzer
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
