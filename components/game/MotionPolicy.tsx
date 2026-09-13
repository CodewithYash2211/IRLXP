'use client'
import { MotionConfig } from 'framer-motion'
import { useReducedMotion } from './Responsive'
export function MotionPolicy({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()
  return <MotionConfig reducedMotion="user" skipAnimations={reduced}>{children}</MotionConfig>
}
