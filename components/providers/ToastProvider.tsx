'use client'

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Toast, ToastType } from '@/types/game'

// ─── Context ────────────────────────────────────────────────────────────────

interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// ─── Reducer ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD';    toast: Toast }
  | { type: 'REMOVE'; id: string }

function reducer(state: Toast[], action: Action): Toast[] {
  switch (action.type) {
    case 'ADD':    return [action.toast, ...state].slice(0, 5)   // max 5 toasts
    case 'REMOVE': return state.filter((t) => t.id !== action.id)
    default:       return state
  }
}

// ─── Toast icon / style map ──────────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, { icon: string; border: string; bg: string }> = {
  success: { icon: '✓',  border: 'border-green-500/40',  bg: 'bg-green-500/10'  },
  error:   { icon: '✗',  border: 'border-red-500/40',    bg: 'bg-red-500/10'    },
  info:    { icon: 'ℹ',  border: 'border-blue-500/40',   bg: 'bg-blue-500/10'   },
  warning: { icon: '⚠',  border: 'border-yellow-500/40', bg: 'bg-yellow-500/10' },
  xp:      { icon: '⚡', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
  levelup: { icon: '★',  border: 'border-[var(--gold)]/50', bg: 'bg-[var(--gold)]/10' },
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, [])

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id })
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const duration = toast.duration ?? 4000
    dispatch({ type: 'ADD', toast: { ...toast, id } })
    if (duration > 0) {
      setTimeout(() => dispatch({ type: 'REMOVE', id }), duration)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div
        className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: 'min(360px, calc(100vw - 2rem))' }}
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const style = TOAST_STYLES[toast.type]
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0,  scale: 1   }}
                exit={{    opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                  'pointer-events-auto game-panel px-4 py-3 rounded-xl border',
                  'flex items-start gap-3 cursor-pointer',
                  style.border, style.bg
                )}
                onClick={() => removeToast(toast.id)}
                role="alert"
              >
                <span
                  className={cn(
                    'text-lg leading-none mt-0.5 flex-shrink-0',
                    toast.type === 'levelup' && 'animate-glow text-gold',
                    toast.type === 'xp'      && 'text-xp',
                  )}
                >
                  {style.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'font-semibold text-sm',
                      toast.type === 'levelup' && 'font-pixel text-[10px] text-gold',
                    )}
                    style={{ color: toast.type === 'error' ? 'var(--strength)' : 'var(--text-primary)' }}
                  >
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {toast.message}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
