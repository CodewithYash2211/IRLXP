'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface XPGainProps {
  amount: number
  className?: string
  trigger: boolean
  onComplete?: () => void
}

export function XPGainAnimation({ amount, className, trigger, onComplete }: XPGainProps) {
  return (
    <AnimatePresence mode="wait">
      {trigger && (
        <motion.div
          key={`xp-reward`}
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -80, scale: 1.2 }}
          exit={{ opacity: 0, y: -120, scale: 0.9 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={cn(
            'fixed pointer-events-none z-50 font-pixel text-gold glow-gold',
            'flex items-center gap-1',
            className
          )}
          style={{ 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
          }}
          onAnimationComplete={onComplete}
        >
          <span>⚡</span>
          <span>+{amount.toLocaleString()} XP</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface CoinGainProps {
  amount: number
  className?: string
  trigger: boolean
  onComplete?: () => void
}

export function CoinGainAnimation({ amount, className, trigger, onComplete }: CoinGainProps) {
  return (
    <AnimatePresence mode="wait">
      {trigger && (
        <motion.div
          key={`coin-reward`}
          initial={{ opacity: 0, y: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, y: -60, scale: 1.1, rotate: 0 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            'fixed pointer-events-none z-50 font-pixel',
            'flex items-center gap-1',
            className
          )}
          style={{ 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)',
            color: 'var(--gold)',
            fontSize: 'clamp(1.25rem, 3vw, 2.5rem)',
          }}
          onAnimationComplete={onComplete}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            🪙
          </motion.span>
          <span>+{amount.toLocaleString()}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface LevelUpProps {
  fromLevel: number
  toLevel: number
  className?: string
  trigger: boolean
  onComplete?: () => void
}

export function LevelUpAnimation({ fromLevel, toLevel, className, trigger, onComplete }: LevelUpProps) {
  return (
    <AnimatePresence mode="wait">
      {trigger && (
        <motion.div
          key={`levelup-reward`}
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 1.2, rotate: 180 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 20,
            duration: 1.5
          }}
          className={cn(
            'fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none',
            className
          )}
          onAnimationComplete={onComplete}
        >
          {/* Background flash */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at center, rgba(245,200,66,0.3) 0%, transparent 70%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
          
          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ 
                  left: '50%', 
                  top: '50%', 
                  background: i % 3 === 0 ? 'var(--gold)' : (i % 3 === 1 ? 'var(--xp-fill)' : 'var(--discipline)'),
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ 
                  scale: 1, 
                  opacity: 0,
                  x: [0, Math.cos(i * 2.4) * 180],
                  y: [0, Math.sin(i * 2.4) * 180],
                }}
                transition={{ 
                  duration: 1.5, 
                  ease: 'easeOut',
                  delay: i * 0.015,
                }}
              />
            ))}
          </div>

          {/* Level up text */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
          >
            <div className="font-pixel text-2xl md:text-4xl text-gold glow-gold mb-4 animate-glow">
              LEVEL UP!
            </div>
            <div className="font-pixel text-4xl md:text-6xl text-gold glow-gold mb-2">
              LV {fromLevel} → LV {toLevel}
            </div>
            <motion.div
              className="font-pixel text-lg md:text-xl"
              style={{ color: 'var(--gold)' }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ⭐ NEW ABILITIES UNLOCKED ⭐
            </motion.div>
          </motion.div>

          {/* Tap to dismiss */}
          <motion.div
            className="absolute bottom-16 text-center pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={onComplete}
          >
            <p className="font-pixel text-[8px] text-gold/70 animate-glow">
              TAP ANYWHERE TO CONTINUE
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface QuestCompleteProps {
  xpEarned: number
  coinsEarned: number
  attributeAffected: string
  attrGain: number
  leveledUp: boolean
  levelBefore?: number
  levelAfter?: number
  newStreak: number
  trigger: boolean
  onComplete?: () => void
}

export function QuestCompleteAnimation({ 
  xpEarned, 
  coinsEarned, 
  attributeAffected, 
  attrGain, 
  leveledUp, 
  levelBefore, 
  levelAfter, 
  newStreak, 
  trigger, 
  onComplete 
}: QuestCompleteProps) {
  return (
    <AnimatePresence mode="wait">
      {trigger && (
        <motion.div
          key={`quest-complete-reward`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onComplete}
        >
          <motion.div
            className="relative game-panel pixel-border-gold p-6 md:p-8 max-w-md w-full"
            style={{ 
              borderColor: 'var(--gold)',
              boxShadow: '0 0 0 1px rgba(245,200,66,0.1) inset, 0 0 40px rgba(245,200,66,0.2), 0 20px 60px rgba(0,0,0,0.5)',
            }}
            animate={{ boxShadow: [
              '0 0 0 1px rgba(245,200,66,0.1) inset, 0 0 40px rgba(245,200,66,0.2), 0 20px 60px rgba(0,0,0,0.5)',
              '0 0 0 1px rgba(245,200,66,0.1) inset, 0 0 60px rgba(245,200,66,0.4), 0 20px 60px rgba(0,0,0,0.5)',
              '0 0 0 1px rgba(245,200,66,0.1) inset, 0 0 40px rgba(245,200,66,0.2), 0 20px 60px rgba(0,0,0,0.5)',
            ]}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="text-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl mb-3"
              >
                ⭐
              </motion.div>
              <h2 className="font-pixel text-lg md:text-xl text-gold glow-gold">QUEST COMPLETE!</h2>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Your hero grows stronger with each victory.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative p-4 rounded-xl text-center"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid var(--xp-bar)' }}
                >
                  <motion.span className="text-2xl animate-glow">⚡</motion.span>
                  <p className="font-pixel text-xs text-xp mt-1">XP EARNED</p>
                  <p className="font-pixel text-2xl md:text-3xl text-gold mt-1">+{xpEarned.toLocaleString()}</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative p-4 rounded-xl text-center"
                  style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid var(--gold)' }}
                >
                  <motion.span className="text-2xl animate-glow">🪙</motion.span>
                  <p className="font-pixel text-xs text-gold mt-1">COINS EARNED</p>
                  <p className="font-pixel text-2xl md:text-3xl text-gold mt-1">+{coinsEarned.toLocaleString()}</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
                className="flex items-center justify-center gap-3 p-3 rounded-lg"
                style={{ 
                  background: `var(--${attributeAffected})15`, 
                  border: `1px solid var(--${attributeAffected})40` 
                }}
              >
                <span className="text-2xl">{getAttributeEmoji(attributeAffected)}</span>
                <div>
                  <p className="font-pixel text-xs" style={{ color: `var(--${attributeAffected})` }}>
                    {attributeAffected.toUpperCase()} +{attrGain}
                  </p>
                  <p className="font-pixel text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    ATTRIBUTE STRENGTHENED
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
                className="flex items-center justify-center gap-3 p-3 rounded-lg bg-gold/10 border border-gold/30"
              >
                <span className="text-2xl animate-float">🔥</span>
                <div>
                  <p className="font-pixel text-sm text-gold">STREAK: {newStreak} {newStreak === 1 ? 'DAY' : 'DAYS'}</p>
                  <p className="font-pixel text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    KEEP THE FLAME ALIVE
                  </p>
                </div>
              </motion.div>

              {leveledUp && levelBefore && levelAfter && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 250, damping: 15 }}
                  className="relative p-4 rounded-lg text-center animate-levelup"
                  style={{ background: 'rgba(245,200,66,0.15)', border: '2px solid var(--gold)' }}
                >
                  <div className="font-pixel text-sm text-gold glow-gold mb-1">LEVEL UP!</div>
                  <div className="font-pixel text-2xl md:text-3xl text-gold">LV {levelBefore} → LV {levelAfter}</div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    New horizons await your hero.
                  </p>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <p className="font-pixel text-[8px] text-gold/70 animate-glow">
                REWARDS EARNED REWARDS
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function getAttributeEmoji(attr: string): string {
  switch (attr) {
    case 'intellect': return '🧠'
    case 'strength': return '⚔️'
    case 'discipline': return '🛡️'
    case 'vitality': return '❤️'
    default: return '✨'
  }
}

interface ButtonPressProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'gold' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function PressableButton({ 
  children, 
  className, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'md',
}: ButtonPressProps) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const variants = {
    primary: 'btn-primary',
    gold: 'btn-gold',
    ghost: 'btn-ghost',
    danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => { setPressed(false); setHovered(false); }}
      onMouseEnter={() => !disabled && setHovered(true)}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg',
        'transition-all duration-100 select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
        variants[variant],
        sizes[size],
        pressed && 'scale-95',
        hovered && !pressed && 'scale-[1.02]',
        className
      )}
    >
      {children}
    </button>
  )
}

// Need to import useState


export function HoverScale({ children, className, scale = 1.02 }: { children: React.ReactNode; className?: string; scale?: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={cn('transition-transform duration-150', className)}
      style={{ transform: hovered ? `scale(${scale})` : 'scale(1)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  )
}

export function FloatingParticles({ count = 10, color = 'var(--gold)', className }: { count?: number; color?: string; className?: string }) {
  const [particles] = useState(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 37 + 13) % 100,
    y: (i * 61 + 7) % 100,
    size: i % 4 + 2,
    delay: i % 3,
    duration: 3 + i % 4,
  })))

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none -z-10', className)} aria-hidden="true">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ 
            left: `${p.x}%`, 
            top: `${p.y}%`, 
            width: p.size, 
            height: p.size,
            background: color,
            opacity: 0.6,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('relative', className)}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({ children, delay = 0.1, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={cn('flex flex-col', className)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { transition: { staggerChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
      }}
    >
      {children}
    </motion.div>
  )
}