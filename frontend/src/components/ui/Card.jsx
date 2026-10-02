import React from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs text-black',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
