'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/providers/ToastProvider'
import { getLevelInfo } from '@/lib/game/progression'
import type { PartyAction } from '@/lib/validation/party'
import type { PartyChallenge, PartyState } from '@/types/party'

type RunAction = (action: PartyAction, payload?: Record<string, unknown>) => Promise<boolean>
const messages: Record<PartyAction, string> = {
  create: 'PARTY CREATED', join: 'PARTY JOINED', leave: 'PARTY LEFT',
  create_challenge: 'CHALLENGE CREATED', participate: 'CHALLENGE JOINED', progress: 'PROGRESS SAVED',
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
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div><h1 className="font-pixel text-xl text-gold">PARTY</h1><p className="text-sm mt-2 text-[var(--text-secondary)]">Real-life adventures are better together.</p></div>
        <Button variant="ghost" disabled={busy} onClick={refresh}>Refresh</Button>
      </header>
      {error && <p role="alert" className="game-panel p-3 text-red-400">{error}</p>}
      <p role="status" className="text-xs text-[var(--text-secondary)]">{busy ? 'Updating your party…' : ''}</p>
      {loadError || !state ? (
        <section className="game-panel p-6 space-y-3" role="alert">
          <h2 className="font-pixel text-xs text-gold">PARTY UNAVAILABLE</h2>
          <p>Your party could not be loaded. Try refreshing in a moment.</p>
          <Button variant="gold" disabled={busy} onClick={refresh}>Try again</Button>
        </section>
      ) : !state.party ? (
        <section className="game-panel pixel-border-gold p-5 md:p-8 space-y-6">
          <h2 className="font-pixel text-sm text-gold">YOUR PARTY AWAITS</h2>
          <p className="text-sm text-[var(--text-secondary)]">Gather up to 8 heroes. Create a party or enter a code from a friend.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <form className="space-y-3" onSubmit={async e => {
              e.preventDefault()
              const form = e.currentTarget
              if (await run('create', { name: new FormData(form).get('name') })) form.reset()
            }}>
              <Input label="Party name" name="name" required minLength={2} maxLength={40} placeholder="The Daily Adventurers" disabled={busy} />
              <Button type="submit" variant="gold" disabled={busy}>CREATE PARTY</Button>
            </form>
            <form className="space-y-3" onSubmit={async e => {
              e.preventDefault()
              const form = e.currentTarget
              if (await run('join', { code: new FormData(form).get('code') })) form.reset()
            }}>
              <Input label="Party code" name="code" required maxLength={18} placeholder="IRLXP-12A34B56C78D" disabled={busy} autoCapitalize="characters" />
              <Button type="submit" variant="gold" disabled={busy}>JOIN PARTY</Button>
            </form>
          </div>
        </section>
      ) : (
        <>
          <section className="game-panel pixel-border-gold p-5 space-y-3">
            <h2 className="font-pixel text-sm text-gold break-words">{state.party.name}</h2>
            <p className="text-sm">{state.members.length}/8 heroes · Share this code with your friends:</p>
            <p className="font-mono text-gold break-all select-all">{state.party.invite_code}</p>
          </section>

          <section className="space-y-3" aria-labelledby="party-members">
            <h2 id="party-members" className="font-pixel text-xs text-gold">PARTY LEADERBOARD</h2>
            <ol className="game-panel divide-y divide-white/10 px-4">
              {state.members.map((member, index) => (
                <li key={member.id} className="py-4 flex flex-wrap items-center gap-3">
                  <span className="text-gold text-sm">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold break-words">{member.display_name || member.username} {member.id === userId && <span className="text-xs text-gold">(YOU)</span>}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{member.completed_challenges} personal targets completed</p>
                  </div>
                  <div className="text-right text-sm"><p className="text-gold">LV {getLevelInfo(member.total_xp).level}</p><p>{member.total_xp.toLocaleString()} XP</p></div>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-4" aria-labelledby="party-challenges">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="party-challenges" className="font-pixel text-xs text-gold">SHARED CHALLENGES</h2>
              <Button variant="gold" disabled={busy} onClick={() => setShowChallengeForm(!showChallengeForm)}>{showChallengeForm ? 'CANCEL' : '+ CREATE CHALLENGE'}</Button>
            </div>
            {showChallengeForm && <ChallengeForm today={state.today} busy={busy} run={run} onSaved={() => setShowChallengeForm(false)} />}
            <p className="text-xs text-[var(--text-secondary)]">Each participant works toward the full target. Everyone enrolled must finish to complete the challenge. Dates use UTC. Challenge progress does not award XP or coins.</p>
            <div className="flex flex-wrap gap-2" aria-label="Challenge filters">
              <Button variant={tab === 'active' ? 'gold' : 'ghost'} onClick={() => setTab('active')} aria-pressed={tab === 'active'}>ACTIVE / UPCOMING</Button>
              <Button variant={tab === 'history' ? 'gold' : 'ghost'} onClick={() => setTab('history')} aria-pressed={tab === 'history'}>COMPLETED / EXPIRED</Button>
            </div>
            {state.challenges.filter(c => (tab === 'active') === (c.status === 'active' || c.status === 'upcoming')).length === 0 && <p className="game-panel p-6 text-sm text-[var(--text-secondary)]">{tab === 'active' ? 'No active challenges. Set a shared goal for your party.' : 'Completed and expired challenges will appear here.'}</p>}
            {state.challenges.filter(c => (tab === 'active') === (c.status === 'active' || c.status === 'upcoming')).map(challenge => (
              <Challenge key={challenge.id} challenge={challenge} state={state} userId={userId} busy={busy} run={run} />
            ))}
          </section>

          <section className="pt-4 border-t border-white/10 space-y-3">
            {confirmLeave ? (
              <>
                <p className="text-sm">Leave {state.party.name}? {state.members.length === 1 ? 'You are the last member. This will remove the party and its challenge history.' : 'Your challenge progress stays in this party. You can rejoin with its code.'}</p>
                <div className="flex gap-3"><Button variant="danger" disabled={busy} onClick={() => run('leave')}>CONFIRM LEAVE</Button><Button variant="ghost" disabled={busy} onClick={() => setConfirmLeave(false)}>CANCEL</Button></div>
              </>
            ) : <Button variant="ghost" disabled={busy} onClick={() => setConfirmLeave(true)}>LEAVE PARTY</Button>}
          </section>
        </>
      )}
    </div>
  )
}

function ChallengeForm({ today, busy, run, onSaved }: { today: string; busy: boolean; run: RunAction; onSaved: () => void }) {
  return (
    <form className="game-panel p-5 space-y-4" onSubmit={async e => {
      e.preventDefault()
      const fields = Object.fromEntries(new FormData(e.currentTarget))
      if (await run('create_challenge', { ...fields, target: Number(fields.target) })) onSaved()
    }}>
      <fieldset disabled={busy} className="space-y-4">
        <legend className="font-pixel text-xs mb-4">NEW CHALLENGE</legend>
        <Input label="Title" name="title" required minLength={2} maxLength={80} placeholder="Read 100 pages this week" />
        <Input label="Description" name="description" maxLength={400} placeholder="Pick a book and share your progress." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Target per person" name="target" type="number" required min={1} max={1000000} step={1} placeholder="100" />
          <Input label="Unit" name="unit" required maxLength={30} placeholder="pages" />
          <Input label="Start date (UTC)" name="start_date" type="date" required defaultValue={today} />
          <Input label="End date (UTC, inclusive)" name="end_date" type="date" required min={today} defaultValue={today} />
        </div>
        <Button type="submit" variant="gold" disabled={busy}>CREATE & PARTICIPATE</Button>
      </fieldset>
    </form>
  )
}

function Challenge({ challenge, state, userId, busy, run }: { challenge: PartyChallenge; state: PartyState; userId: string; busy: boolean; run: RunAction }) {
  const own = challenge.participants.find(p => p.user_id === userId)
  const ended = challenge.status === 'completed' || challenge.status === 'expired'
  const total = challenge.participants.reduce((sum, p) => sum + p.progress, 0)
  const target = challenge.target * challenge.participants.length
  const percent = target ? Math.floor(total / target * 100) : 0
  const name = (id: string | null) => state.members.find(m => m.id === id)?.username || 'Former member'
  return (
    <article className="game-panel p-5 space-y-4">
      <div className="flex flex-wrap justify-between gap-2">
        <h3 className="font-semibold text-lg break-words min-w-0">{challenge.title}</h3>
        <span className="text-xs uppercase text-gold">{challenge.status}</span>
      </div>
      {challenge.description && <p className="text-sm text-[var(--text-secondary)] break-words">{challenge.description}</p>}
      <p className="text-sm">Goal: {challenge.target} {challenge.unit} per person</p>
      <p className="text-xs text-[var(--text-secondary)]">{challenge.start_date} → {challenge.end_date} (UTC) · Created by {name(challenge.created_by)}</p>
      <div><p className="text-sm mb-2">Party progress · {percent}% · {challenge.participants.length} participants</p><Meter value={percent} label={`${challenge.title} party progress`} /></div>
      <ul className="space-y-3">
        {challenge.participants.map(p => <li key={p.user_id} className="text-xs space-y-1">
          <div className="flex flex-wrap justify-between gap-2"><span>{name(p.user_id)}{p.user_id === userId ? ' (YOU)' : ''}</span><span>{p.progress}/{challenge.target} {challenge.unit}</span></div>
          <Meter value={Math.floor(p.progress / challenge.target * 100)} label={`${name(p.user_id)} progress`} />
        </li>)}
      </ul>
      {!ended && (!own ? <Button variant="gold" disabled={busy} onClick={() => run('participate', { challenge_id: challenge.id })}>PARTICIPATE</Button> : challenge.status === 'upcoming' ? <p className="text-xs text-gold">You’re enrolled. Progress opens on {challenge.start_date} (UTC).</p> : (
        <form className="flex flex-wrap items-end gap-3" onSubmit={async e => {
          e.preventDefault()
          await run('progress', { challenge_id: challenge.id, progress: Number(new FormData(e.currentTarget).get('progress')) })
        }}>
          <Input key={own.updated_at} label={`Your total (${challenge.unit})`} name="progress" type="number" min={0} max={challenge.target} step={1} required defaultValue={own.progress} disabled={busy} className="max-w-48" />
          <Button type="submit" variant="gold" disabled={busy}>SAVE PROGRESS</Button>
        </form>
      ))}
    </article>
  )
}

function Meter({ value, label }: { value: number; label: string }) {
  return <div role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} className="xp-bar-track h-2"><div className="xp-bar-fill h-full" style={{ width: `${value}%` }} /></div>
}
