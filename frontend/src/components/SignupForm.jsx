import React, { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { Input } from './ui/Input'

export function SignupForm({ onSignup, onSwitchToLogin, onCancel }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [usernameError, setUsernameError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [confirmError, setConfirmError] = useState(null)
  const [signupError, setSignupError] = useState(null)
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

    if (!passwordConfirm) {
      setConfirmError('Please confirm your password.')
      hasValidationError = true
    } else if (password && password !== passwordConfirm) {
      setConfirmError('Passwords do not match.')
      hasValidationError = true
    } else {
      setConfirmError(null)
    }

    if (hasValidationError) {
      return
    }

    setIsLoading(true)
    setSignupError(null)

    try {
      await onSignup({
        username: trimmedUsername,
        email: email.trim(),
        password,
        passwordConfirm,
      })
    } catch (err) {
      setSignupError(err.message || 'Unable to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full rounded-[24px] border border-white/20 bg-[#ebd5c5]/[0.16] backdrop-blur-2xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {signupError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 backdrop-blur-md p-3 text-xs text-rose-200 animate-result-in"
          >
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{signupError}</span>
          </div>
        )}

        {/* Username Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-username"
            className="block text-xs font-semibold text-stone-200 tracking-tight"
          >
            Username <span className="text-[#df8758]">*</span>
          </label>
          <div className="relative">
            <Input
              id="signup-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (usernameError) setUsernameError(null)
                if (signupError) setSignupError(null)
              }}
              placeholder="Choose a username"
              disabled={isLoading}
              autoComplete="username"
              autoFocus
              className="pl-9 bg-black/25 border-white/15 text-stone-100 placeholder:text-stone-400 focus:border-[#df8758] focus:ring-[#df8758]/25 rounded-xl"
              aria-invalid={!!usernameError}
              aria-describedby={usernameError ? 'signup-username-error' : undefined}
            />
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          {usernameError && (
            <p id="signup-username-error" className="text-xs text-rose-300 font-medium">
              {usernameError}
            </p>
          )}
        </div>

        {/* Email Field (Optional) */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="block text-xs font-semibold text-stone-200 tracking-tight"
          >
            Email <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (signupError) setSignupError(null)
              }}
              placeholder="Enter your email"
              disabled={isLoading}
              autoComplete="email"
              className="pl-9 bg-black/25 border-white/15 text-stone-100 placeholder:text-stone-400 focus:border-[#df8758] focus:ring-[#df8758]/25 rounded-xl"
            />
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block text-xs font-semibold text-stone-200 tracking-tight"
          >
            Password <span className="text-[#df8758]">*</span>
          </label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordError) setPasswordError(null)
                if (signupError) setSignupError(null)
              }}
              placeholder="Create a password"
              disabled={isLoading}
              autoComplete="new-password"
              className="pl-9 pr-10 bg-black/25 border-white/15 text-stone-100 placeholder:text-stone-400 focus:border-[#df8758] focus:ring-[#df8758]/25 rounded-xl"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'signup-password-error' : undefined}
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
            <p id="signup-password-error" className="text-xs text-rose-300 font-medium">
              {passwordError}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-confirm-password"
            className="block text-xs font-semibold text-stone-200 tracking-tight"
          >
            Confirm password <span className="text-[#df8758]">*</span>
          </label>
          <div className="relative">
            <Input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value)
                if (confirmError) setConfirmError(null)
                if (signupError) setSignupError(null)
              }}
              placeholder="Confirm your password"
              disabled={isLoading}
              autoComplete="new-password"
              className="pl-9 pr-10 bg-black/25 border-white/15 text-stone-100 placeholder:text-stone-400 focus:border-[#df8758] focus:ring-[#df8758]/25 rounded-xl"
              aria-invalid={!!confirmError}
              aria-describedby={confirmError ? 'signup-confirm-error' : undefined}
            />
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-200 transition cursor-pointer disabled:opacity-50"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {confirmError && (
            <p id="signup-confirm-error" className="text-xs text-rose-300 font-medium">
              {confirmError}
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          {/* Navigation Links */}
          <div className="flex items-center justify-between text-xs text-stone-300/80 pt-1">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="hover:text-white font-medium underline underline-offset-2 decoration-stone-400/40 hover:decoration-stone-200 transition cursor-pointer"
            >
              Already have an account? Log In
            </button>

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
