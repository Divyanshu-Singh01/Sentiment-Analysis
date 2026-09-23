import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Button({
  children,
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer'

  const variants = {
    default:
      'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-xs',
    outline:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100',
    ghost:
      'text-slate-600 hover:bg-slate-100 active:bg-slate-200/80',
  }

  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-11 px-5 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
      )}
      {children}
    </button>
  )
}
