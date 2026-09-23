import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Textarea = forwardRef(function Textarea(
  { className, disabled, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      disabled={disabled}
      className={cn(
        'w-full min-h-[140px] resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-3 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 transition duration-150',
        className
      )}
      {...props}
    />
  )
})
