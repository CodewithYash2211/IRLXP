'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2.5 rounded-lg text-sm',
            'border transition-all duration-150 outline-none',
            'placeholder:text-[var(--text-muted)]',
            // default
            'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-primary)]',
            // focus
            'focus:border-[var(--xp-bar)] focus:shadow-[0_0_0_2px_var(--xp-glow)]',
            // error
            error && 'border-red-500/60 focus:border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.2)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
