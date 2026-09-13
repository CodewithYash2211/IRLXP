'use client'

import { useSyncExternalStore, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

function useMedia(query: string) {
  const subscribe = useCallback((notify: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener('change', notify)
    return () => media.removeEventListener('change', notify)
  }, [query])
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
export function useReducedMotion() { return useMedia('(prefers-reduced-motion: reduce)') }
export function useIsMobile() { return useMedia('(max-width: 767px)') }
export function useIsTablet() { return useMedia('(min-width: 768px) and (max-width: 1023px)') }
const subscribeViewport = (notify: () => void) => {
  window.addEventListener('resize', notify)
  return () => window.removeEventListener('resize', notify)
}
export function useViewport() {
  const size = useSyncExternalStore(subscribeViewport, () => `${window.innerWidth},${window.innerHeight}`, () => '0,0')
  const [width, height] = size.split(',').map(Number)
  return { width, height }
}

export function ResponsiveContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}

export function TouchTarget({ children, className, minSize = 44 }: { children: React.ReactNode; className?: string; minSize?: number }) {
  return (
    <div className={cn('min-h-[44px] min-w-[44px] flex items-center justify-center', className)} style={{ minHeight: minSize, minWidth: minSize }}>
      {children}
    </div>
  )
}

export function SafeArea({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-screen pb-safe', className)}>
      {children}
    </div>
  )
}

export function AdaptiveGrid({ 
  children, 
  className, 
  mobileCols = 1, 
  tabletCols = 2, 
  desktopCols = 3, 
  wideCols = 4,
  gap = 'gap-4'
}: { 
  children: React.ReactNode
  className?: string
  mobileCols?: number
  tabletCols?: number
  desktopCols?: number
  wideCols?: number
  gap?: string
}) {
  return (
    <div className={cn(
      'grid',
      ['','grid-cols-1','grid-cols-2','grid-cols-3','grid-cols-4'][mobileCols],
      ['','md:grid-cols-1','md:grid-cols-2','md:grid-cols-3','md:grid-cols-4'][tabletCols],
      ['','lg:grid-cols-1','lg:grid-cols-2','lg:grid-cols-3','lg:grid-cols-4'][desktopCols],
      ['','xl:grid-cols-1','xl:grid-cols-2','xl:grid-cols-3','xl:grid-cols-4'][wideCols],
      gap,
      className
    )}>
      {children}
    </div>
  )
}

export function FlexColumn({ children, className, gap = 'gap-4', mobileGap }: { children: React.ReactNode; className?: string; gap?: string; mobileGap?: string }) {
  return (
    <div className={cn('flex flex-col', mobileGap ?? gap, mobileGap && ({ 'gap-2': 'md:gap-2', 'gap-4': 'md:gap-4', 'gap-6': 'md:gap-6' } as Record<string,string>)[gap], className)}>
      {children}
    </div>
  )
}

export function HorizontalScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex overflow-x-auto scrollbar-hide gap-4 pb-4 -mx-4 px-4', className)}>
      {children}
    </div>
  )
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true, 
  className,
  icon 
}: { 
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  icon?: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn('game-panel rounded-xl overflow-hidden', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center gap-2 text-left transition-colors"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}
        aria-expanded={open}
      >
        {icon && <span className="text-lg">{icon}</span>}
        <span className="font-pixel text-xs text-gold flex-1">{title}</span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="text-gold"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}