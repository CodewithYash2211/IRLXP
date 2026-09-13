'use client'

import React, { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PlaceBanner } from '@/components/game/PlaceBanner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/providers/ToastProvider'
import { getLevelInfo } from '@/lib/game/progression'
import type { PartyAction } from '@/lib/validation/party'
import type { PartyChallenge, PartyState } from '@/types/party'
import { cn } from '@/lib/utils'

type RunAction = (action: PartyAction, payload?: Record<string, unknown>) => Promise<boolean>
const messages: Record<PartyAction, string> = {
  create: 'PARTY CREATED', join: 'PARTY JOINED', leave: 'PARTY LEFT',
  create_challenge: 'CHALLENGE CREATED', participate: 'CHALLENGE JOINED', progress: 'PROGRESS SAVED',
}

const CLASS_ICONS = ['⚔️', '🧙', '🏹', '🛡️', '⚡', '🗡️', '📜', '🔮']

function getMemberClass(member: { user_id: string }, state: PartyState | null) {
  // Assign a pseudo-class based on XP distribution
  if (!state) return CLASS_ICONS[0]
  const index = state.members.findIndex(m => m.id === member.user_id)
  return CLASS_ICONS[index % CLASS_ICONS.length]
}

export function PartyScreen({ userId, state, loadError }: { userId: string; state: PartyState | null; loadError: boolean }) {
  const router = useRouter()
  const { addToast } = useToast()
  const lock = useRef(false)
  const [saving, setSaving] = useState(false)
  const [refreshing, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const busy = saving || refreshing
  const refresh = () => startTransition(() => router.refresh())

  const run: RunAction = async (action, payload = {}) => {
    if (lock.current || busy) return false
    lock.current = true
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/party', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, payload }),
      })
      if (response.redirected) throw new Error('Your session has ended. Sign in again to continue.')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save. Please try again.')
      addToast({ type: 'success', title: messages[action] })
      setConfirmLeave(false)
      refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save. Please try again.')
      return false
    } finally {
      lock.current = false
      setSaving(false)
    }
  }

  return (
    <div className="relative min-h-screen max-w-5xl mx-auto p-4 md:p-8 space-y-6" style={{ background: 'var(--bg-deepest)' }}>
      {/* Campfire background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: 'var(--strength)' }} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-t from-strength/50 to-transparent animate-float" />
      </div>

<PlaceBanner place="camp"/>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-pixel text-xl md:text-2xl text-gold glow-gold">PARTY CAMPFIRE</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Gather your allies. Shared challenges await.
            </p>
          </div>
          <Button variant="ghost" disabled={busy} onClick={refresh} className="font-pixel text-[10px]">
            🔄 REFRESH
          </Button>
        </header>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="game-panel p-3 text-red-400 border border-red-500/30 rounded-lg mb-4"
          >
            {error}
          </motion.p>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {loadError || !state ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 game-panel p-6 space-y-3 text-center"
            style={{ borderColor: 'var(--strength)' }}
          >
            <h2 className="font-pixel text-xs text-gold">🏕️ CAMPFIRE UNLIT</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Unable to load your party. The flames flicker...</p>
            <Button variant="gold" disabled={busy} onClick={refresh} className="mt-2">TRY AGAIN</Button>
          </motion.div>
        ) : !state.party ? (
          <motion.div
            key="no-party"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10"
          >
            <CampfireEmptyState onCreate={run} onJoin={run} busy={busy} />
          </motion.div>
        ) : (
          <motion.div
            key="party"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 space-y-6"
          >
            {/* Party Header */}
            <motion.div className="game-panel pixel-border-gold p-5 md:p-8 relative overflow-hidden" style={{ borderColor: 'var(--gold)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="font-pixel text-sm md:text-lg text-gold break-words">{state.party.name}</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {state.members.length}/8 heroes gathered around the fire
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid var(--border-gold)' }}>
                    <p className="font-pixel text-[8px] text-gold mb-1">INVITE CODE</p>
                    <p className="font-mono text-sm text-gold break-all select-all">{state.party.invite_code}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(state.party?.invite_code ?? '').then(() => addToast({ type: 'success', title: 'Invite code copied' })).catch(() => setError('Copy failed. Select and copy the invite code manually.'))}>
                    📋 COPY
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Party Roster */}
            <motion.section className="space-y-4">
              <h2 className="font-pixel text-xs text-gold flex items-center gap-2">
                <span>👥</span> PARTY ROSTER
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {state.members.map((member, index) => (
                  <motion.article
                    key={member.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.08 }}
                    className={cn(
                      'relative game-panel rounded-xl p-4 transition-all',
                      'hover:border-gold/50 hover:shadow-[0_0_20px_rgba(245,200,66,0.15)]',
                      member.id === userId && 'ring-2 ring-gold/30 border-gold/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="text-3xl">{getMemberClass({ user_id: member.id }, state)}</div>
                        {member.id === userId && (
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute -top-1 -right-1 w-5 h-5 text-gold text-[8px]"
                          >
                            ★
                          </motion.div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {member.display_name || member.username}
                          </p>
                          {member.id === userId && (
                            <span className="font-pixel text-[7px] text-gold">(YOU)</span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {member.completed_challenges} targets completed
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t text-right" style={{ borderColor: 'var(--border)' }}>
                      <p className="font-pixel text-xs text-gold">LV {getLevelInfo(member.total_xp).level}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {member.total_xp.toLocaleString()} XP
                      </p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.section>

            {/* Shared Challenges */}
            <motion.section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="font-pixel text-xs text-gold flex items-center gap-2">
                  <span>🏆</span> SHARED CHALLENGES
                </h2>
                <Button
                  variant="gold"
                  disabled={busy}
                  onClick={() => setShowChallengeForm(!showChallengeForm)}
                  className="font-pixel text-[10px]"
                >
                  {showChallengeForm ? 'CANCEL' : '+ CREATE CHALLENGE'}
                </Button>
              </div>

              {showChallengeForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="game-panel pixel-border-gold p-5 space-y-4"
                >
                  <ChallengeForm today={state.today} busy={busy} run={run} onSaved={() => setShowChallengeForm(false)} />
                </motion.div>
              )}

              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Each participant works toward the full target. Everyone enrolled must finish to complete the challenge. Dates use UTC. Challenge progress does not award XP or coins.
              </p>

              <div className="flex flex-wrap gap-2 mb-4" aria-label="Challenge filters">
                <Button
                  variant={tab === 'active' ? 'gold' : 'ghost'}
                  onClick={() => setTab('active')}
                  aria-pressed={tab === 'active'}
                  className="font-pixel text-[9px]"
                >
                  ACTIVE / UPCOMING
                </Button>
                <Button
                  variant={tab === 'history' ? 'gold' : 'ghost'}
                  onClick={() => setTab('history')}
                  aria-pressed={tab === 'history'}
                  className="font-pixel text-[9px]"
                >
                  COMPLETED / EXPIRED
                </Button>
              </div>

              <AnimatePresence>
                {state.challenges
                  .filter(c => (tab === 'active') === (c.status === 'active' || c.status === 'upcoming'))
                  .map((challenge, index) => (
                    <motion.article
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="game-panel p-5 space-y-4 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 opacity-0" style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--${challenge.status === 'completed' ? 'discipline' : 'intellect'}) 6%, transparent), transparent)` }} />

                      <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg break-words min-w-0">{challenge.title}</h3>
                            <span className={cn(
                              'font-pixel text-[8px] px-2 py-0.5 rounded uppercase',
                              challenge.status === 'completed' && 'bg-green-500/20 text-green-400 border-green-500/30',
                              challenge.status === 'active' && 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                              challenge.status === 'upcoming' && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                              challenge.status === 'expired' && 'bg-gray-500/20 text-gray-400 border-gray-500/30',
                            )}>
                              {challenge.status.toUpperCase()}
                            </span>
                          </div>
                          {challenge.description && (
                            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{challenge.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span>🎯 {challenge.target} {challenge.unit} per person</span>
                            <span>📅 {challenge.start_date} → {challenge.end_date} (UTC)</span>
                            <span>👥 {challenge.participants.length} participants</span>
                          </div>
                        </div>

                        <div className="relative w-full md:w-48 flex-shrink-0">
                          <div className="text-sm mb-2">Party Progress</div>
                          <CampfireProgressMeter
                            value={getPartyProgress(challenge)}
                            label={`${challenge.title} party progress`}
                          />
                        </div>
                      </div>

                      {/* Participants */}
                      <ul className="relative space-y-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                        {challenge.participants.map(p => (
                          <motion.li
                            key={p.user_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded-lg"
                            style={{ background: p.user_id === userId ? 'rgba(245,200,66,0.05)' : 'var(--bg-elevated)' }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getMemberClass({ user_id: p.user_id }, state)}</span>
                              <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                {state.members.find(m => m.id === p.user_id)?.username || 'Unknown'}
                                {p.user_id === userId && <span className="ml-1 font-pixel text-[7px] text-gold">(YOU)</span>}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                                {p.progress}/{challenge.target} {challenge.unit}
                              </span>
                              <div className="w-32 h-1.5 xp-bar-track">
                                <div className="xp-bar-fill h-full" style={{ width: `${Math.floor(p.progress / challenge.target * 100)}%` }} />
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </ul>

                      {/* Actions */}
                      <ChallengeActions
                        challenge={challenge}
                        state={state}
                        userId={userId}
                        busy={busy}
                        run={run}
                      />
</motion.article>
                  ))}
                <div>

                  {state.challenges.filter(c => (tab === 'active') === (c.status === 'active' || c.status === 'upcoming')).length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="game-panel p-8 text-center"
                  >
                    <div className="text-4xl mb-3 opacity-50 animate-float">{tab === 'active' ? '🏆' : '📜'}</div>
                    <h3 className="font-pixel text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                      {tab === 'active' ? 'NO ACTIVE CHALLENGES' : 'NO COMPLETED CHALLENGES'}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {tab === 'active' ? 'Set a shared goal for your party to begin.' : 'Completed challenges will be remembered here.'}
                    </p>
                  </motion.div>
                )}
                </div>
              </AnimatePresence>
            </motion.section>

            {/* Leave Party */}
            <motion.section className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <AnimatePresence mode="wait">
                {confirmLeave ? (
                  <motion.div
                    key="confirm-leave"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="game-panel p-5 space-y-4 border border-red-500/30"
                    style={{ background: 'rgba(239,68,68,0.05)' }}
                  >
                    <div className="flex items-center gap-2 text-red-400">
                      <span className="text-xl">⚠️</span>
                      <h3 className="font-pixel text-sm">LEAVE PARTY?</h3>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {state.members.length === 1
                        ? 'You are the last member. This will extinguish the campfire and remove the party and its challenge history forever.'
                        : 'Your challenge progress stays with this party. You can rejoin later with the invite code.'}
                    </p>
                    <div className="flex gap-3">
                      <Button variant="danger" disabled={busy} onClick={() => run('leave')} className="flex-1">
                        EXTINGUISH CAMPFIRE
                      </Button>
                      <Button variant="ghost" disabled={busy} onClick={() => setConfirmLeave(false)} className="flex-1">
                        STAY
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="leave-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Button variant="ghost" disabled={busy} onClick={() => setConfirmLeave(true)} className="w-full">
                      🚪 LEAVE PARTY
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </motion.div>
)}
      </AnimatePresence>
    </div>
  )
}
function CampfireEmptyState({ onCreate, onJoin, busy }: { onCreate: RunAction; onJoin: RunAction; busy: boolean }) {
  return (
    <section className="game-panel pixel-border-gold p-5 md:p-8 space-y-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-2xl opacity-20" style={{ background: 'var(--strength)' }} />

      <div className="relative text-center mb-4">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          🏕️
        </motion.div>
        <h2 className="font-pixel text-sm md:text-lg text-gold mb-2">NO CAMPFIRE YET</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Gather up to 8 heroes. Create a party or enter a code from a friend.
        </p>
      </div>

      <div className="relative grid md:grid-cols-2 gap-6">
        <form className="space-y-3 relative" onSubmit={async e => {
          e.preventDefault()
          const form = e.currentTarget
          if (await onCreate('create', { name: new FormData(form).get('name') })) form.reset()
        }}>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 font-pixel text-[7px] text-gold px-2" style={{ background: 'var(--bg-panel)', borderRadius: '4px' }}>
            CREATE NEW
          </div>
          <Input label="Party name" name="name" required minLength={2} maxLength={40} placeholder="The Daily Adventurers" disabled={busy} />
          <Button type="submit" variant="gold" disabled={busy} className="w-full font-pixel text-[10px]">
            ⚡ LIGHT CAMPFIRE
          </Button>
        </form>

        <form className="space-y-3 relative" onSubmit={async e => {
          e.preventDefault()
          const form = e.currentTarget
          if (await onJoin('join', { code: new FormData(form).get('code') })) form.reset()
        }}>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 font-pixel text-[7px] text-gold px-2" style={{ background: 'var(--bg-panel)', borderRadius: '4px' }}>
            JOIN EXISTING
          </div>
          <Input label="Party code" name="code" required maxLength={18} placeholder="IRLXP-12A34B56C78D" disabled={busy} autoCapitalize="characters" />
          <Button type="submit" variant="gold" disabled={busy} className="w-full font-pixel text-[10px]">
            🔥 JOIN CAMPFIRE
          </Button>
        </form>
      </div>
    </section>
  )
}

function ChallengeForm({ today, busy, run, onSaved }: { today: string; busy: boolean; run: RunAction; onSaved: () => void }) {
  return (
    <form className="space-y-4" onSubmit={async e => {
      e.preventDefault()
      const fields = Object.fromEntries(new FormData(e.currentTarget))
      if (await run('create_challenge', { ...fields, target: Number(fields.target) })) onSaved()
    }}>
      <legend className="font-pixel text-xs text-gold mb-4">⚔️ FORGE NEW CHALLENGE</legend>
      <Input label="Title" name="title" required minLength={2} maxLength={80} placeholder="Read 100 pages this week" />
      <Input label="Description" name="description" maxLength={400} placeholder="Pick a book and share your progress." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Target per person" name="target" type="number" required min={1} max={1000000} step={1} placeholder="100" />
        <Input label="Unit" name="unit" required maxLength={30} placeholder="pages" />
        <Input label="Start date (UTC)" name="start_date" type="date" required defaultValue={today} />
        <Input label="End date (UTC, inclusive)" name="end_date" type="date" required min={today} defaultValue={today} />
      </div>
      <Button type="submit" variant="gold" disabled={busy} className="w-full font-pixel text-[10px]">
        ✦ CREATE & PARTICIPATE
      </Button>
    </form>
  )
}

function ChallengeActions({ challenge, userId, busy, run }: { challenge: PartyChallenge; state: PartyState; userId: string; busy: boolean; run: RunAction }) {
  const own = challenge.participants.find(p => p.user_id === userId)
  const ended = challenge.status === 'completed' || challenge.status === 'expired'

  if (ended) {
    return (
      <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {challenge.status === 'completed' ? '✅ Challenge completed!' : '⏳ Challenge expired'}
        </span>
      </div>
    )
  }

  if (!own) {
    return (
      <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
        <Button variant="gold" disabled={busy} onClick={() => run('participate', { challenge_id: challenge.id })} className="font-pixel text-[10px]">
          🤝 PARTICIPATE
        </Button>
      </div>
    )
  }

  if (challenge.status === 'upcoming') {
    return (
      <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs text-gold flex items-center gap-1">
          <span>⏳</span> Progress opens on {challenge.start_date} (UTC)
        </p>
      </div>
    )
  }

  return (
    <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
      <form className="flex flex-wrap items-end gap-3" onSubmit={async e => {
        e.preventDefault()
        await run('progress', { challenge_id: challenge.id, progress: Number(new FormData(e.currentTarget).get('progress')) })
      }}>
        <Input key={own.updated_at} label={`Your total (${challenge.unit})`} name="progress" type="number" min={0} max={challenge.target} step={1} required defaultValue={own.progress} disabled={busy} className="max-w-48 flex-1" />
        <Button type="submit" variant="gold" disabled={busy} className="font-pixel text-[10px]">
          💾 SAVE PROGRESS
        </Button>
      </form>
    </div>
  )
}

function getPartyProgress(challenge: PartyChallenge): number {
  const total = challenge.participants.reduce((sum, p) => sum + p.progress, 0)
  const target = challenge.target * challenge.participants.length
  return target ? Math.floor(total / target * 100) : 0
}

function CampfireProgressMeter({ value, label }: { value: number; label: string }) {
  const color = value >= 100 ? 'var(--discipline)' : (value >= 66 ? 'var(--gold)' : (value >= 33 ? 'var(--intellect)' : 'var(--strength)'))
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} className="relative">
      <div className="xp-bar-track h-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded"
          style={{
            background: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs font-pixel" style={{ color: 'var(--text-muted)' }}>
        <span>0%</span>
        <span className="text-gold">{value}%</span>
        <span>100%</span>
      </div>
    </div>
  )
}
