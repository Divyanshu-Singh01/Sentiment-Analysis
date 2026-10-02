import React, { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'

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

    let invalid = false
    if (!username.trim()) { setUsernameError('Required'); invalid = true } else setUsernameError(null)
    if (!password) { setPasswordError('Required'); invalid = true } else setPasswordError(null)
    if (invalid) return

    setIsLoading(true)
    setAuthError(null)
    try {
      await onLogin({ username: username.trim(), password })
    } catch (err) {
      setAuthError(err.message || 'Invalid credentials.')
    } finally { setIsLoading(false) }
  }

  return (
    <div className="w-full rounded-2xl bg-white border border-neutral-200 p-5 sm:p-6 shadow-xs animate-result-in">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {sessionExpiredMessage && (
          <p className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg p-2.5">
            {sessionExpiredMessage}
          </p>
        )}

        {authError && (
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{authError}</span>
          </p>
        )}

        <div>
          <label htmlFor="login-username" className="block text-xs font-medium text-black mb-1">Username</label>
          <div className="relative">
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameError(null); setAuthError(null) }}
              placeholder="Username"
              disabled={isLoading}
              autoComplete="username"
              autoFocus
              className={`w-full h-10 rounded-lg bg-white border text-sm text-black pl-9 pr-3 outline-none transition-colors caret-black disabled:opacity-50 ${
                usernameError ? 'border-rose-300 focus:border-rose-400' : 'border-neutral-200 focus:border-neutral-400'
              }`}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          </div>
          {usernameError && <p className="text-xs text-rose-600 mt-1">{usernameError}</p>}
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-medium text-black mb-1">Password</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(null); setAuthError(null) }}
              placeholder="Password"
              disabled={isLoading}
              autoComplete="current-password"
              className={`w-full h-10 rounded-lg bg-white border text-sm text-black pl-9 pr-9 outline-none transition-colors caret-black disabled:opacity-50 ${
                passwordError ? 'border-rose-300 focus:border-rose-400' : 'border-neutral-200 focus:border-neutral-400'
              }`}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-black cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {passwordError && <p className="text-xs text-rose-600 mt-1">{passwordError}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-full text-sm font-medium text-white bg-black hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
        >
          {isLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Signing in...</span></> : 'Sign in'}
        </button>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          {onSwitchToSignup && (
            <span>
              No account?{' '}
              <button type="button" onClick={onSwitchToSignup} className="text-black font-medium hover:underline cursor-pointer">
                Sign up
              </button>
            </span>
          )}
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-neutral-400 hover:text-black cursor-pointer ml-auto">
              Back
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
