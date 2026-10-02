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
        'w-full min-h-[140px] resize-y rounded-xl border border-neutral-200 bg-white p-3.5 text-base text-black placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60 transition duration-150',
        className
      )}
      {...props}
    />
  )
})
