import React, { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'

export function SignupForm({ onSignup, onSwitchToLogin, onCancel }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [usernameError, setUsernameError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [confirmError, setConfirmError] = useState(null)
  const [signupError, setSignupError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return

    let invalid = false
    if (!username.trim()) { setUsernameError('Required'); invalid = true } else setUsernameError(null)
    if (!password) { setPasswordError('Required'); invalid = true } else setPasswordError(null)
    if (!passwordConfirm) { setConfirmError('Required'); invalid = true }
    else if (password !== passwordConfirm) { setConfirmError('Passwords don\'t match'); invalid = true }
    else setConfirmError(null)
    if (invalid) return

    setIsLoading(true)
    setSignupError(null)
    try {
      await onSignup({ username: username.trim(), email: email.trim(), password, passwordConfirm })
    } catch (err) {
      setSignupError(err.message || 'Unable to create account.')
    } finally { setIsLoading(false) }
  }

  const inputBase = 'w-full h-10 rounded-lg bg-white border text-sm text-black pl-9 pr-3 outline-none transition-colors caret-black disabled:opacity-50'
  const inputOk = 'border-neutral-200 focus:border-neutral-400'
  const inputErr = 'border-rose-300 focus:border-rose-400'

  return (
    <div className="w-full rounded-2xl bg-white border border-neutral-200 p-5 sm:p-6 shadow-xs animate-result-in">
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {signupError && (
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{signupError}</span>
          </p>
        )}

        <div>
          <label htmlFor="signup-username" className="block text-xs font-medium text-black mb-1">Username</label>
          <div className="relative">
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameError(null); setSignupError(null) }}
              placeholder="Username"
              disabled={isLoading}
              autoComplete="username"
              autoFocus
              className={`${inputBase} ${usernameError ? inputErr : inputOk}`}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          </div>
          {usernameError && <p className="text-xs text-rose-600 mt-1">{usernameError}</p>}
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-xs font-medium text-neutral-500 mb-1">Email <span className="text-neutral-400">(optional)</span></label>
          <div className="relative">
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSignupError(null) }}
              placeholder="Email"
              disabled={isLoading}
              autoComplete="email"
              className={`${inputBase} ${inputOk}`}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-xs font-medium text-black mb-1">Password</label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(null); setSignupError(null) }}
              placeholder="Password"
              disabled={isLoading}
              autoComplete="new-password"
              className={`${inputBase} pr-9 ${passwordError ? inputErr : inputOk}`}
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

        <div>
          <label htmlFor="signup-confirm" className="block text-xs font-medium text-black mb-1">Confirm password</label>
          <div className="relative">
            <input
              id="signup-confirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => { setPasswordConfirm(e.target.value); setConfirmError(null); setSignupError(null) }}
              placeholder="Confirm password"
              disabled={isLoading}
              autoComplete="new-password"
              className={`${inputBase} ${confirmError ? inputErr : inputOk}`}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          </div>
          {confirmError && <p className="text-xs text-rose-600 mt-1">{confirmError}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-full text-sm font-medium text-white bg-black hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
        >
          {isLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Creating...</span></> : 'Create account'}
        </button>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>
            Have an account?{' '}
            <button type="button" onClick={onSwitchToLogin} className="text-black font-medium hover:underline cursor-pointer">
              Sign in
            </button>
          </span>
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
