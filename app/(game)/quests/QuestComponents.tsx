'use client'

import { useId, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GameDialog } from '@/components/ui/GameDialog'
import { PlaceBanner } from '@/components/game/PlaceBanner'
import { Button } from '@/components/ui/Button'
import { DIFFICULTY_REWARDS } from '@/lib/game/rewards'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/providers/ToastProvider'
import type { Quest, QuestCategory, QuestDifficulty } from '@/types/database'
import type { QuestCompleteResult } from '@/types/game'
import { cn, CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '@/lib/utils'

interface QuestComponentsProps {
  initialQuests: Quest[]
}

export function QuestEngine({ initialQuests }: QuestComponentsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const completionLock = useRef(false)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [completionError, setCompletionError] = useState<string | null>(null)
  const [reward, setReward] = useState<QuestCompleteResult | null>(null)
  const [rewardAnimation, setRewardAnimation] = useState<{ xp: number; coins: number } | null>(null)
  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
  const [filterCategory, setFilterCategory] = useState<QuestCategory | 'all'>(() => {
    const cat = searchParams.get('category')
    if (cat && ['intellect', 'strength', 'discipline', 'vitality'].includes(cat)) {
      return cat as QuestCategory
    }
    return 'all'
  })

  const activeQuests = quests.filter(q => q.status === 'active')
  const completedQuests = quests.filter(q => q.status === 'completed')
  const displayQuests = activeTab === 'active' ? activeQuests : completedQuests
  const filteredQuests = filterCategory === 'all'
    ? displayQuests
    : displayQuests.filter(q => q.category === filterCategory)

  const handleQuestCreated = (newQuest: Quest) => {
    setQuests(current => [newQuest, ...current])
    setShowCreateForm(false)
    addToast({ type: 'success', title: 'Quest Created', message: `"${newQuest.title}" added to your log.` })
  }

  const handleQuestUpdated = (updatedQuest: Quest) => {
    setQuests(current => current.map(q => q.id === updatedQuest.id ? updatedQuest : q))
    setEditingQuest(null)
    addToast({ type: 'success', title: 'Quest Updated' })
  }

  const handleQuestDeleted = async (questId: string) => {
    if (deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/quests/${questId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setQuests(current => current.filter(q => q.id !== questId))
      setPendingDelete(null)
      addToast({ type: 'success', title: 'Quest Deleted' })
    } catch {
      setDeleteError('Could not delete the quest. Please try again.')
      addToast({ type: 'error', title: 'Failed to delete quest' })
    } finally { setDeleting(false) }
  }

  const handleQuestCompleted = async (questId: string) => {
    if (completionLock.current) return
    completionLock.current = true
    setCompletingId(questId)
    setCompletionError(null)
    setReward(null)
    setRewardAnimation(null)
    try {
      const res = await fetch(`/api/quests/${questId}/complete`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to complete quest.')
      const result: QuestCompleteResult = data

      // Trigger reward animation
      setRewardAnimation({ xp: result.xpEarned, coins: result.coinsEarned })

      setQuests(current => current.map(q => {
        if (q.id === questId) return { ...q, status: 'completed' as const, completed_at: new Date().toISOString() }
        return q
      }))
      setReward(result)
      router.refresh()

      // Toast notifications
      addToast({ type: 'xp', title: `+${result.xpEarned} XP Earned!`, message: `+${result.coinsEarned} Coins` })
      if (result.leveledUp) {
        setTimeout(() => {
          addToast({
            type: 'levelup',
            title: 'LEVEL UP!',
            message: `LV ${result.levelBefore} → LV ${result.levelAfter}`,
            duration: 6000
          })
        }, 500)
      }
    } catch (error: unknown) {
      setCompletionError(error instanceof Error ? error.message : 'Failed to complete quest.')
      addToast({ type: 'error', title: 'Failed to complete quest' })
    } finally {
      completionLock.current = false
      setCompletingId(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      {/* Quest Board Background */}
      <div className="absolute inset-0 -z-10 opacity-5 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMGMtMTYuNSAwLTMwIDEzLjUtMzAgMzAgMCAxNi41IDEzLjUgMzAgMzAgMzAgMTYuNSAwIDMwLTEzLjUgMzAtMzAgMC0xNi41LTEzLjUtMzAtMzAtMzB6bTAgNGMxNC4zIDAgMjYgMTEuNyAyNiAyNnMtMTEuNyAyNi0yNiAyNi0yNi0xMS43LTI2LTI2IDEuNS0yNiAxNS43LTI2IDI2em0wLTIwYy0xMC4yIDAtMTguNiA4LjMtMTguNiAxOC42IDAgMTAuMiA4LjMgMTguNiAxOC42IDE4LjYgMTAuMiAwIDE4LjYtOC4zIDE4LjYtMTguNlM0MC4yIDAgMzAgMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1Yzg0MiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')]" />
      </div>

<PlaceBanner place="board"/>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="font-pixel text-xl md:text-2xl text-gold glow-gold">QUEST BOARD</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Your adventure log — real-life quests await.</p>
        </div>
        {!showCreateForm && !editingQuest && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(true)}
            className="btn-gold font-pixel text-[10px] tracking-wider whitespace-nowrap"
            style={{ boxShadow: '0 4px 20px rgba(245,200,66,0.3)' }}
          >
            + POST NEW QUEST
          </motion.button>
        )}
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        <button
          onClick={() => setFilterCategory('all')}
          className={cn(
            'px-3 py-1.5 rounded-full font-pixel text-[9px] tracking-wider transition-all',
            filterCategory === 'all'
              ? 'bg-gold/20 border-gold text-gold'
              : 'border border-white/10 text-muted hover:border-gold/50 hover:text-gold'
          )}
        >
          ALL QUESTS
        </button>
        {(['intellect', 'strength', 'discipline', 'vitality'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full font-pixel text-[9px] tracking-wider transition-all flex items-center gap-1',
              filterCategory === cat
                ? 'bg-current/20 border-current text-current'
                : 'border border-white/10 text-muted hover:border-current/50 hover:text-current'
            )}
            style={{
              borderColor: `var(--${cat})`,
              color: filterCategory === cat ? `var(--${cat})` : 'var(--text-muted)',
            }}
          >
            <span>{CATEGORY_CONFIG[cat].emoji}</span>
            <span>{cat.toUpperCase()}</span>
          </button>
        ))}
      </motion.div>

      {/* Reward Animation Overlay */}
      <AnimatePresence>
        {rewardAnimation && (
          <motion.div
            key="reward-anim"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -100, opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="font-pixel text-2xl text-gold glow-gold"
              >
                +{rewardAnimation.xp} XP
              </motion.div>
              <motion.div
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -100, opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                className="font-pixel text-xl" style={{ color: 'var(--gold)' }}
              >
                +{rewardAnimation.coins} COINS
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {pendingDelete && <GameDialog label="Delete quest" onClose={() => { if (!deleting) setPendingDelete(null) }}><div className="game-panel p-6"><h2 className="font-bold text-xl mb-3">Remove this quest?</h2><p className="text-sm mb-5">This removes the unfinished quest from your board. No XP or coins will be awarded.</p>{deleteError && <p role="alert" className="text-red-300 mb-3">{deleteError}</p>}<div className="flex gap-3"><Button variant="ghost" disabled={deleting} onClick={() => setPendingDelete(null)}>Keep quest</Button><Button variant="danger" loading={deleting} onClick={() => handleQuestDeleted(pendingDelete)}>Delete quest</Button></div></div></GameDialog>}
      {/* Completion Reward Modal */}
      <AnimatePresence>
        {reward && (
          <GameDialog label="Quest rewards" onClose={() => { setReward(null); setRewardAnimation(null); }}>

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
              <div className="text-center mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-5xl mb-2"
                >
                  ⭐
                </motion.div>
                <h2 className="font-pixel text-lg text-gold glow-gold">QUEST COMPLETE!</h2>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-center gap-6 font-pixel text-sm text-gold">
                  <div className="flex flex-col items-center">
                    <span className="text-xl">⚡</span>
                    <span>+{reward.xpEarned} XP</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xl">🪙</span>
                    <span>+{reward.coinsEarned} COINS</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <div className="px-3 py-1.5 rounded-full text-xs font-pixel" style={{
                    background: `color-mix(in srgb, var(--${reward.attributeAffected}) 13%, transparent)`,
                    color: `var(--${reward.attributeAffected})`,
                    border: `1px solid var(--${reward.attributeAffected})`
                  }}>
                    {reward.attributeAffected.toUpperCase()} +{reward.attrGain}
                  </div>
                  <div className="px-3 py-1.5 rounded-full text-xs font-pixel bg-gold/20 border-gold text-gold border">
                    🔥 STREAK {reward.newStreak}
                  </div>
                </div>
              </div>

              {reward.leveledUp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
                  className="text-center p-4 mb-4 animate-levelup"
                  style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid var(--gold)', borderRadius: '8px' }}
                >
                  <h3 className="font-pixel text-sm text-gold glow-gold mb-1">LEVEL UP!</h3>
                  <p className="font-pixel text-base text-gold">LV {reward.levelBefore} → LV {reward.levelAfter}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Your effort paid off. Your hero grows stronger.
                  </p>
                </motion.div>
              )}

              <Button
                variant="gold"
                onClick={() => { setReward(null); setRewardAnimation(null); }}
                className="w-full font-pixel text-[10px] mt-2"
              >
                ONWARD!
              </Button>
            </motion.div>
          </GameDialog>
        )}
      </AnimatePresence>

      {completionError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded"
        >
          {completionError}
        </motion.p>
      )}

      {/* Forms */}
      <AnimatePresence mode="wait">
        {showCreateForm && (
          <motion.div
            key="create-form"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="game-panel pixel-border-gold p-4 md:p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-pixel text-sm text-gold">NEW QUEST</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>✕</Button>
            </div>
            <QuestForm onSave={handleQuestCreated} onCancel={() => setShowCreateForm(false)} />
          </motion.div>
        )}

        {editingQuest && (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="game-panel pixel-border-gold p-4 md:p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-pixel text-sm text-gold">EDIT QUEST</h2>
              <Button variant="ghost" size="sm" onClick={() => setEditingQuest(null)}>✕</Button>
            </div>
            <QuestForm initialData={editingQuest} onSave={handleQuestUpdated} onCancel={() => setEditingQuest(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active/Completed Tabs */}
      <AnimatePresence mode="wait">
        {!showCreateForm && !editingQuest && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex gap-2 border-b mb-4" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setActiveTab('active')}
                className={cn(
                  'px-4 py-2 font-pixel text-[10px] tracking-wider transition-all relative',
                  activeTab === 'active'
                    ? 'text-gold'
                    : 'text-muted hover:text-foreground'
                )}
              >
                ACTIVE
                <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-pixel" style={{
                  background: activeTab === 'active' ? 'var(--gold)' : 'var(--bg-elevated)',
                  color: activeTab === 'active' ? 'var(--bg-deepest)' : 'var(--text-muted)'
                }}>
                  {activeQuests.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={cn(
                  'px-4 py-2 font-pixel text-[10px] tracking-wider transition-all relative',
                  activeTab === 'completed'
                    ? 'text-gold'
                    : 'text-muted hover:text-foreground'
                )}
              >
                COMPLETED
                <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-pixel" style={{
                  background: activeTab === 'completed' ? 'var(--gold)' : 'var(--bg-elevated)',
                  color: activeTab === 'completed' ? 'var(--bg-deepest)' : 'var(--text-muted)'
                }}>
                  {completedQuests.length}
                </span>
              </button>
              <div className="flex-1 h-px mt-3" style={{ background: 'linear-gradient(90deg, var(--border), var(--gold), var(--border))' }} />
            </div>

            {/* Quest List */}
            <div className="space-y-3">
              {filteredQuests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 game-panel rounded-xl"
                >
                  <div className="text-4xl mb-3 opacity-50 animate-float">
                    {activeTab === 'active' ? '📜' : '✅'}
                  </div>
                  <h3 className="font-pixel text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                    {activeTab === 'active' ? 'NO ACTIVE QUESTS' : 'NO COMPLETED QUESTS'}
                  </h3>
                  {activeTab === 'active' && (
                    <>
                      <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Turn something you need to do into your next quest.
                        {filterCategory !== 'all' && ' Try clearing the filter.'}
                      </p>
                      <Button variant="gold" onClick={() => setShowCreateForm(true)} className="font-pixel text-[10px]">
                        + POST NEW QUEST
                      </Button>
                    </>
                  )}
                  {activeTab === 'completed' && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Complete quests to see your history here.
                    </p>
                  )}
                </motion.div>
              ) : (
                <AnimatePresence>
                  {filteredQuests.map((quest, index) => (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, y: 20, x: -20 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      exit={{ opacity: 0, y: -20, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={cn(
                        'game-panel p-4 md:p-5 rounded-xl transition-all relative overflow-hidden',
                        quest.status === 'completed'
                          ? 'opacity-70 bg-green-500/5 border-green-500/10'
                          : 'pixel-border hover:border-gold/50'
                      )}
                    >
                      {/* Quest card background accent */}
                      <div
                        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                        style={{
                          background: `linear-gradient(135deg, color-mix(in srgb, var(--${quest.category}) 6%, transparent), transparent)`
                        }}
                      />

                      <div className="relative flex flex-col md:flex-row gap-4 justify-between md:items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className="text-[9px] uppercase font-bold px-2 py-0.5 rounded font-pixel"
                              style={{
                                color: `var(--${quest.category})`,
                                backgroundColor: `color-mix(in srgb, var(--${quest.category}) 13%, transparent)`,
                                border: `1px solid color-mix(in srgb, var(--${quest.category}) 25%, transparent)`,
                              }}
                            >
                              {CATEGORY_CONFIG[quest.category].emoji} {quest.category.toUpperCase()}
                            </span>
                            <span
                              className="text-[9px] uppercase font-pixel px-2 py-0.5 rounded"
                              style={{
                                color: DIFFICULTY_CONFIG[quest.difficulty].color,
                                backgroundColor: DIFFICULTY_CONFIG[quest.difficulty].bgColor,
                              }}
                            >
                              {DIFFICULTY_CONFIG[quest.difficulty].label}
                            </span>
                            {quest.due_date && (
                              <span className="text-[9px] font-pixel flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                📅 {quest.due_date}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-1 break-words" style={{ color: 'var(--text-primary)' }}>
                            {quest.title}
                          </h3>
                          {quest.description && (
                            <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                              {quest.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[9px] font-pixel" style={{ color: 'var(--text-muted)' }}>
                            <span>⚡ +{quest.xp_reward} XP</span>
                            <span>🪙 +{quest.coin_reward} COINS</span>
                          </div>
                        </div>

                        {quest.status === 'active' && (
                          <div className="flex flex-col sm:flex-row md:flex-col gap-2 md:w-40 flex-shrink-0">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleQuestCompleted(quest.id)}
                              disabled={completingId !== null}
                              className="btn-gold font-pixel text-[9px] py-3"
                              style={{
                                boxShadow: '0 2px 12px rgba(245,200,66,0.3)',
                                minHeight: '44px',
                              }}
                            >
                              {completingId === quest.id ? '⚡ COMPLETING...' : '✓ COMPLETE QUEST'}
                            </motion.button>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                disabled={completingId === quest.id}
                                onClick={() => setEditingQuest(quest)}
                                className="flex-1 text-[10px] min-h-[44px]"
                              >
                                ✎ EDIT
                              </Button>
                              <Button
                                variant="ghost"
                                disabled={completingId === quest.id}
                                onClick={() => { setDeleteError(null); setPendingDelete(quest.id); }}
                                className="flex-1 text-[10px] text-red-400 hover:text-red-300 min-h-[44px]"
                              >
                                🗑 DEL
                              </Button>
                            </div>
                          </div>
                        )}
                        {quest.status === 'completed' && (
                          <motion.div
                            className="text-right"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <span className="font-pixel text-[10px] text-gold">✓ COMPLETED</span>
                            {quest.completed_at && (
                              <div className="text-[9px] font-pixel mt-1" style={{ color: 'var(--text-muted)' }}>
                                {new Date(quest.completed_at).toLocaleDateString()}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function QuestForm({ initialData, onSave, onCancel }: { initialData?: Quest, onSave: (q: Quest) => void, onCancel: () => void }) {
  const fieldId = useId()
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [category, setCategory] = useState<QuestCategory>(initialData?.category || 'intellect')
  const [difficulty, setDifficulty] = useState<QuestDifficulty>(initialData?.difficulty || 'easy')
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        title,
        description: description || null,
        category,
        difficulty,
        due_date: dueDate || null
      }

      const url = initialData ? `/api/quests/${initialData.id}` : '/api/quests'
      const method = initialData ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) {
        if (data.errors) {
          throw new Error(Object.values(data.errors).join(', '))
        }
        throw new Error(data.error || 'Failed to save quest')
      }

      onSave(data.quest || data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded"
        >
          {error}
        </motion.div>
      )}

      <Input
        label="Quest Title"
        required
        maxLength={80}
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Study DSA for 1 hour"
      />

      <div>
        <label htmlFor={`${fieldId}-description`} className="block text-[10px] font-pixel tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Description
        </label>
        <textarea id={`${fieldId}-description`}
          className="w-full bg-[var(--bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
          style={{ borderColor: 'var(--border)' }}
          rows={3}
          maxLength={400}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Complete graphs and DP revision"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-pixel tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Category
          </label>
          <select
            className="w-full bg-[var(--bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            style={{ borderColor: 'var(--border)' }}
            id={`${fieldId}-category`} aria-label="Category" value={category}
            onChange={e => setCategory(e.target.value as QuestCategory)}
          >
            <option value="intellect">🧠 Intellect</option>
            <option value="strength">⚔️ Strength</option>
            <option value="discipline">🛡️ Discipline</option>
            <option value="vitality">❤️ Vitality</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-pixel tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Difficulty
          </label>
          <select
            className="w-full bg-[var(--bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            style={{ borderColor: 'var(--border)' }}
            id={`${fieldId}-difficulty`} aria-label="Difficulty" value={difficulty}
            onChange={e => setDifficulty(e.target.value as QuestDifficulty)}
          >
            {Object.entries(DIFFICULTY_REWARDS).map(([key, value]) => <option key={key} value={key}>{key} ({value.xp} XP, {value.coins} coins)</option>)}
          </select>
        </div>
      </div>

      <Input
        label="Due Date (Optional)"
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 text-[10px]" disabled={loading}>
          CANCEL
        </Button>
        <Button type="submit" variant="gold" className="flex-1 font-pixel text-[10px]" loading={loading}>
          {initialData ? 'SAVE QUEST' : 'POST QUEST'}
        </Button>
      </div>
    </form>
  )
}
