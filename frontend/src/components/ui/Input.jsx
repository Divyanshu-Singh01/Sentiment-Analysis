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
        'w-full h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60 transition duration-150',
        className
      )}
      {...props}
    />
  )
})
