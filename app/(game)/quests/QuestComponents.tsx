'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Quest, QuestCategory, QuestDifficulty } from '@/types/database'

interface QuestComponentsProps {
  initialQuests: Quest[]
}

export function QuestEngine({ initialQuests }: QuestComponentsProps) {
  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
  
  const activeQuests = quests.filter(q => q.status === 'active')
  const completedQuests = quests.filter(q => q.status === 'completed')
  const displayQuests = activeTab === 'active' ? activeQuests : completedQuests

  const handleQuestCreated = (newQuest: Quest) => {
    setQuests([newQuest, ...quests])
    setShowCreateForm(false)
  }

  const handleQuestUpdated = (updatedQuest: Quest) => {
    setQuests(quests.map(q => q.id === updatedQuest.id ? updatedQuest : q))
    setEditingQuest(null)
  }

  const handleQuestDeleted = async (questId: string) => {
    if (!confirm('DELETE QUEST?\n\nThis quest has not been completed yet.')) return
    try {
      const res = await fetch(`/api/quests/${questId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setQuests(quests.filter(q => q.id !== questId))
    } catch {
      alert('Failed to delete quest.')
    }
  }

  const handleQuestCompleted = async (questId: string) => {
    try {
      const res = await fetch(`/api/quests/${questId}/complete`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to complete')
      
      // We could use the returned data to show rewards, but for Phase 3 we just mark as complete
      const updatedQuests = quests.map(q => {
        if (q.id === questId) return { ...q, status: 'completed' as const, completed_at: new Date().toISOString() }
        return q
      })
      setQuests(updatedQuests)
      alert('QUEST COMPLETE!')
    } catch {
      alert('Failed to complete quest.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-pixel text-xl text-gold glow-gold">QUEST LOG</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your real-life adventures.</p>
        </div>
        {!showCreateForm && !editingQuest && (
          <Button variant="gold" onClick={() => setShowCreateForm(true)} className="font-pixel text-[10px]">
            + CREATE QUEST
          </Button>
        )}
      </div>

      {/* Forms */}
      {showCreateForm && (
        <div className="game-panel pixel-border-gold p-4 md:p-6 mb-6">
          <h2 className="font-pixel text-sm mb-4">NEW QUEST</h2>
          <QuestForm onSave={handleQuestCreated} onCancel={() => setShowCreateForm(false)} />
        </div>
      )}

      {editingQuest && (
        <div className="game-panel pixel-border-gold p-4 md:p-6 mb-6">
          <h2 className="font-pixel text-sm mb-4">EDIT QUEST</h2>
          <QuestForm initialData={editingQuest} onSave={handleQuestUpdated} onCancel={() => setEditingQuest(null)} />
        </div>
      )}

      {/* Tabs */}
      {!showCreateForm && !editingQuest && (
        <>
          <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-muted)' }}>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 font-pixel text-[10px] tracking-wider transition-colors ${activeTab === 'active' ? 'border-b-2 border-gold text-gold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              ACTIVE ({activeQuests.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 font-pixel text-[10px] tracking-wider transition-colors ${activeTab === 'completed' ? 'border-b-2 border-gold text-gold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              COMPLETED ({completedQuests.length})
            </button>
          </div>

          {/* List */}
          <div className="space-y-4">
            {displayQuests.length === 0 ? (
              <div className="text-center py-12 game-panel rounded-xl">
                <div className="text-3xl mb-3 opacity-50">📜</div>
                <h3 className="font-pixel text-sm mb-2" style={{ color: 'var(--text-primary)' }}>YOUR QUEST LOG IS EMPTY</h3>
                {activeTab === 'active' && (
                  <>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Turn something you need to do into your next quest.</p>
                    <Button variant="gold" onClick={() => setShowCreateForm(true)} className="font-pixel text-[10px]">
                      + CREATE QUEST
                    </Button>
                  </>
                )}
              </div>
            ) : (
              displayQuests.map(quest => (
                <div key={quest.id} className={`game-panel p-4 md:p-5 rounded-xl transition-all ${quest.status === 'completed' ? 'opacity-70' : 'pixel-border-muted hover:border-gold/50'}`}>
                  <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-opacity-20`} style={{ 
                          color: `var(--${quest.category})`, 
                          backgroundColor: `var(--${quest.category})` 
                        }}>
                          {quest.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">{quest.difficulty}</span>
                        {quest.due_date && <span className="text-[10px] text-muted-foreground">📅 {quest.due_date}</span>}
                      </div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{quest.title}</h3>
                      {quest.description && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{quest.description}</p>}
                    </div>
                    
                    {quest.status === 'active' && (
                      <div className="flex md:flex-col gap-2">
                        <Button variant="gold" onClick={() => handleQuestCompleted(quest.id)} className="flex-1 font-pixel text-[9px]">COMPLETE</Button>
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => setEditingQuest(quest)} className="flex-1 text-[10px]">EDIT</Button>
                          <Button variant="ghost" onClick={() => handleQuestDeleted(quest.id)} className="flex-1 text-[10px] text-red-400 hover:text-red-300">DEL</Button>
                        </div>
                      </div>
                    )}
                    {quest.status === 'completed' && (
                      <div className="text-right">
                        <span className="font-pixel text-[10px] text-gold">COMPLETED</span>
                        {quest.completed_at && <div className="text-[10px] text-muted-foreground mt-1">{new Date(quest.completed_at).toLocaleDateString()}</div>}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

function QuestForm({ initialData, onSave, onCancel }: { initialData?: Quest, onSave: (q: Quest) => void, onCancel: () => void }) {
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
        description: description || undefined,
        category,
        difficulty,
        due_date: dueDate || undefined
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
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded">
          {error}
        </div>
      )}
      
      <Input
        label="Title"
        required
        maxLength={80}
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Study DSA for 1 hour"
      />
      
      <div>
        <label className="block text-[10px] font-pixel tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Description
        </label>
        <textarea
          className="w-full bg-black/40 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold transition-colors"
          style={{ borderColor: 'var(--border-muted)' }}
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
            className="w-full bg-black/40 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            style={{ borderColor: 'var(--border-muted)' }}
            value={category} 
            onChange={e => setCategory(e.target.value as QuestCategory)}
          >
            <option value="intellect">Intellect</option>
            <option value="strength">Strength</option>
            <option value="discipline">Discipline</option>
            <option value="vitality">Vitality</option>
          </select>
        </div>
        
        <div>
          <label className="block text-[10px] font-pixel tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Difficulty
          </label>
          <select 
            className="w-full bg-black/40 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            style={{ borderColor: 'var(--border-muted)' }}
            value={difficulty} 
            onChange={e => setDifficulty(e.target.value as QuestDifficulty)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="epic">Epic</option>
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
          {initialData ? 'SAVE QUEST' : 'CREATE QUEST'}
        </Button>
      </div>
    </form>
  )
}
