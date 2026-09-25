import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef(function Input(
  { className, type = 'text', disabled, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-3 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 transition duration-150',
        className
      )}
      {...props}
    />
  )
})
