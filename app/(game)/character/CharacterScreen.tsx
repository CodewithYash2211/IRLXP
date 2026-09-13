'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HeroSprite } from '@/components/game/HeroSprite'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { getLevelInfo } from '@/lib/game/progression'
import type { Profile } from '@/types/database'
import { CATEGORY_CONFIG } from '@/lib/utils'

const AVATAR_LAYERS = {
  skin: [
    { id: 'skin_1', name: 'Fair', color: '#ffdbac' },
    { id: 'skin_2', name: 'Light', color: '#e8c4a0' },
    { id: 'skin_3', name: 'Medium', color: '#d4a574' },
    { id: 'skin_4', name: 'Tan', color: '#c49564' },
    { id: 'skin_5', name: 'Dark', color: '#8d5524' },
    { id: 'skin_6', name: 'Deep', color: '#5d3a1a' },
  ],
  hair: [
    { id: 'hair_1', name: 'Short Brown', color: '#5d4037', style: 'short' },
    { id: 'hair_2', name: 'Long Brown', color: '#5d4037', style: 'long' },
    { id: 'hair_3', name: 'Short Blonde', color: '#f5c842', style: 'short' },
    { id: 'hair_4', name: 'Long Blonde', color: '#f5c842', style: 'long' },
    { id: 'hair_5', name: 'Short Black', color: '#2c2c2c', style: 'short' },
    { id: 'hair_6', name: 'Long Black', color: '#2c2c2c', style: 'long' },
    { id: 'hair_7', name: 'Red', color: '#c0392b', style: 'medium' },
    { id: 'hair_8', name: 'Blue', color: '#60a5fa', style: 'spiky' },
    { id: 'hair_9', name: 'Pink', color: '#fb7185', style: 'bob' },
    { id: 'hair_10', name: 'White', color: '#f0f0ff', style: 'long' },
  ],
  outfit: [
    { id: 'outfit_1', name: 'Adventurer', color: '#2c3e50', accent: '#f5c842' },
    { id: 'outfit_2', name: 'Scholar', color: '#1a2a4a', accent: '#60a5fa' },
    { id: 'outfit_3', name: 'Warrior', color: '#4a1a1a', accent: '#f87171' },
    { id: 'outfit_4', name: 'Monk', color: '#1a3a1a', accent: '#34d399' },
    { id: 'outfit_5', name: 'Noble', color: '#2d1a3a', accent: '#c084fc' },
    { id: 'outfit_6', name: 'Rogue', color: '#1a1a1a', accent: '#f5c842' },
    { id: 'outfit_7', name: 'Mage', color: '#2a1a3a', accent: '#a855f7' },
    { id: 'outfit_8', name: 'Healer', color: '#1a2a2a', accent: '#fb7185' },
  ],
  accessory: [
    { id: null, name: 'None', icon: '' },
    { id: 'acc_glasses', name: 'Glasses', icon: '👓' },
    { id: 'acc_headband', name: 'Headband', icon: '🎗️' },
    { id: 'acc_earring', name: 'Earring', icon: '💎' },
    { id: 'acc_scarf', name: 'Scarf', icon: '🧣' },
    { id: 'acc_cape', name: 'Cape', icon: '🧥' },
    { id: 'acc_crown', name: 'Crown', icon: '👑' },
    { id: 'acc_halo', name: 'Halo', icon: '😇' },
    { id: 'acc_mask', name: 'Mask', icon: '😷' },
  ],
}

interface CharacterScreenProps {
  profile: Profile | null
}

export function CharacterScreen({ profile }: CharacterScreenProps) {
  const [activeTab, setActiveTab] = useState<'avatar' | 'stats' | 'achievements'>('avatar')
  const [customizing, setCustomizing] = useState(false)
  const [customAvatar, setCustomAvatar] = useState<Partial<Profile> | null>(() => profile ? {
    avatar_skin: profile.avatar_skin,
    avatar_hair: profile.avatar_hair,
    avatar_outfit: profile.avatar_outfit,
    avatar_accessory: profile.avatar_accessory,
  } : null)
  const router = useRouter()
  const savingRef = useRef(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const handleSaveAvatar = async () => {
    if (!customAvatar || !profile || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setSaveError(null)
    try {
      const { error } = await createClient().from('profiles').update({
        avatar_skin: customAvatar.avatar_skin,
        avatar_hair: customAvatar.avatar_hair,
        avatar_outfit: customAvatar.avatar_outfit,
        avatar_accessory: customAvatar.avatar_accessory,
      }).eq('id', profile.id)
      if (error) throw error
      setCustomizing(false)
      router.refresh()
    } catch { setSaveError('Appearance could not be saved. Please try again.') }
    finally { savingRef.current = false; setSaving(false) }
  }

  const levelInfo = profile ? getLevelInfo(profile.total_xp) : null

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-deepest)' }}>
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-deepest)] via-[var(--bg-deep)] to-[var(--bg-surface)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'var(--xp-bar)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'var(--gold)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-pixel text-xl md:text-2xl text-gold glow-gold">HERO PROFILE</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {profile?.display_name || profile?.username}&apos;s character sheet
              </p>
            </div>
            {customizing && profile && (
              <Button variant="gold" onClick={handleSaveAvatar} loading={saving} className="font-pixel text-[10px]">
                SAVE APPEARANCE
              </Button>
            )}
          </div>

          {saveError && <p role="alert" className="text-red-300 mb-3">{saveError}</p>}
          {customizing && <Button variant="ghost" disabled={saving} onClick={() => { setCustomizing(false); setCustomAvatar(profile); }}>Cancel changes</Button>}
          <div className="flex gap-1 border-b mb-6" style={{ borderColor: 'var(--border)' }}>
            {[
              { key: 'avatar', label: 'AVATAR', icon: '🧍' },
              { key: 'stats', label: 'ATTRIBUTES', icon: '📊' },
              { key: 'achievements', label: 'ACHIEVEMENTS', icon: '🏆' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  'flex-1 min-w-0 flex flex-col sm:flex-row items-center justify-center gap-2 px-1 sm:px-4 py-3 font-pixel text-[8px] tracking-normal transition-all relative',
                  activeTab === tab.key
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-muted hover:text-foreground'
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'avatar' && (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="grid md:grid-cols-3 gap-6"
            >
              <motion.div
                className="relative game-panel rounded-2xl p-6 md:p-8 flex flex-col items-center"
                style={{
                  background: 'var(--bg-panel)',
                  borderColor: 'var(--border-gold)',
                  boxShadow: '0 0 40px rgba(245,200,66,0.1)',
                  minHeight: '400px',
                }}
              >
                <div className="relative w-full max-w-xs aspect-square">
                  <HeroSprite appearance={customAvatar ?? profile ?? {}} className="w-full h-full" />
                </div>

                <div className="mt-6 w-full text-center">
                  <h2 className="font-pixel text-xs text-gold mb-2">{profile?.username || 'Hero'}</h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    LV.{levelInfo?.level || 1} &bull; {levelInfo?.totalXP.toLocaleString() || 0} XP
                  </p>
                </div>

                {customizing && (
                  <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid var(--border-gold)' }}>
                    <p className="font-pixel text-[8px] text-gold mb-2">CUSTOMIZATION MODE</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Click categories below to change appearance. Click SAVE when done.
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div className="md:col-span-2 space-y-6">
                {customizing ? (
                  <>
                    <AvatarCustomizerPanel
                      title="SKIN TONE"
                      icon="🎨"
                      items={AVATAR_LAYERS.skin}
                      selected={customAvatar?.avatar_skin || 'skin_1'}
                      onSelect={id => setCustomAvatar(prev => ({ ...prev!, avatar_skin: id }))}
                      renderItem={(item) => (
                        <div className="w-12 h-12 rounded-lg border-3 flex items-center justify-center" style={{
                          background: item.color,
                          borderColor: customAvatar?.avatar_skin === item.id ? 'var(--gold)' : 'transparent',
                        }} />
                      )}
                    />
                    <AvatarCustomizerPanel
                      title="HAIR STYLE"
                      icon="💇"
                      items={AVATAR_LAYERS.hair}
                      selected={customAvatar?.avatar_hair || 'hair_1'}
                      onSelect={id => setCustomAvatar(prev => ({ ...prev!, avatar_hair: id }))}
                      renderItem={(item) => (
                        <div className="w-12 h-12 rounded-lg border-3 flex items-center justify-center text-lg" style={{
                          background: item.color + '20',
                          borderColor: customAvatar?.avatar_hair === item.id ? 'var(--gold)' : 'transparent',
                          color: item.color,
                        }}>
                          {item.style === 'short' && '⬤'}
                          {item.style === 'long' && '⬤'}
                          {item.style === 'medium' && '⬤'}
                          {item.style === 'spiky' && '⭐'}
                          {item.style === 'bob' && '⬤'}
                        </div>
                      )}
                    />
                    <AvatarCustomizerPanel
                      title="OUTFIT"
                      icon="👕"
                      items={AVATAR_LAYERS.outfit}
                      selected={customAvatar?.avatar_outfit || 'outfit_1'}
                      onSelect={id => setCustomAvatar(prev => ({ ...prev!, avatar_outfit: id }))}
                      renderItem={(item) => (
                        <div className="w-12 h-12 rounded-lg border-3 flex items-end justify-center" style={{
                          background: item.color + '40',
                          borderColor: customAvatar?.avatar_outfit === item.id ? 'var(--gold)' : 'transparent',
                        }}>
                          <div className="w-8 h-6 rounded-t" style={{ background: item.color }} />
                          <div className="w-6 h-2 mx-auto mt-1 rounded" style={{ background: item.accent }} />
                        </div>
                      )}
                    />
                    <AvatarCustomizerPanel
                      title="ACCESSORY"
                      icon="✨"
                      items={AVATAR_LAYERS.accessory}
                      selected={customAvatar?.avatar_accessory || null}
                      onSelect={id => setCustomAvatar(prev => ({ ...prev!, avatar_accessory: id }))}
                      renderItem={(item) => (
                        <div className="w-12 h-12 rounded-lg border-3 flex items-center justify-center text-2xl" style={{
                          background: 'var(--bg-elevated)',
                          borderColor: customAvatar?.avatar_accessory === item.id ? 'var(--gold)' : 'transparent',
                        }}>
                          {item.icon || '—'}
                        </div>
                      )}
                    />
                  </>
                ) : (
                  <Button
                    variant="gold"
                    onClick={() => { setCustomAvatar(profile); setCustomizing(true); }}
                    className="w-full py-4 font-pixel text-[10px] tracking-wider"
                    style={{ boxShadow: '0 4px 20px rgba(245,200,66,0.3)' }}
                  >
                    ✎ CUSTOMIZE APPEARANCE
                  </Button>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <motion.div className="game-panel rounded-2xl p-6">
                <h2 className="font-pixel text-sm text-gold mb-6 flex items-center gap-2">
                  <span>📊</span> CORE ATTRIBUTES
                </h2>
                <div className="space-y-4">
                  {(['intellect', 'strength', 'discipline', 'vitality'] as const).map((attr, i) => (
                    <motion.div
                      key={attr}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{CATEGORY_CONFIG[attr].emoji}</span>
                          <span className="font-pixel text-xs uppercase" style={{ color: `var(--${attr})` }}>
                            {attr}
                          </span>
                        </div>
                        <span className="font-bold text-lg" style={{ color: `var(--${attr})` }}>
                          {profile?.[attr] || 0}
                        </span>
                      </div>
                      <div className="h-3 rounded overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (profile?.[attr] || 0) / 2)}%` }}
                          transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded"
                          style={{
                            background: `linear-gradient(90deg, var(--${attr}), color-mix(in srgb, var(--${attr}) 80%, transparent))`,
                            boxShadow: `0 0 12px var(--${attr})`,
                          }}
                        />
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {getAttributeDescription( profile?.[attr] || 0)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div className="space-y-6">
                <motion.div className="game-panel rounded-2xl p-6">
                  <h2 className="font-pixel text-sm text-gold mb-6 flex items-center gap-2">
                    <span>⭐</span> PROGRESSION
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-pixel text-xs text-gold">LEVEL {levelInfo?.level || 1}</span>
                        <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                          {levelInfo?.currentLevelXP.toLocaleString() || 0} / {levelInfo?.nextLevelXP.toLocaleString() || 100} XP
                        </span>
                      </div>
                      <div className="xp-bar-track h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${levelInfo?.progressPercent || 0}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="xp-bar-fill h-full"
                        />
                      </div>
                      <p className="text-xs mt-1 text-center" style={{ color: 'var(--text-secondary)' }}>
                        {levelInfo?.xpToNextLevel || 100} XP to next level
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'TOTAL XP', value: profile?.total_xp.toLocaleString() || '0', icon: '⚡', color: 'var(--xp-fill)' },
                        { label: 'COINS', value: profile?.coins.toLocaleString() || '0', icon: '🪙', color: 'var(--gold)' },
                        { label: 'STREAK', value: `${profile?.streak_count || 0} DAYS`, icon: '🔥', color: 'var(--strength)' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-center p-4 rounded-lg"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                        >
                          <span className="text-2xl mb-1 block">{stat.icon}</span>
                          <p className="font-bold text-lg" style={{ color: stat.color }}>{stat.value}</p>
                          <p className="font-pixel text-[7px] mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div className="game-panel rounded-2xl p-6">
                  <h2 className="font-pixel text-sm text-gold mb-4 flex items-center gap-2">
                    <span>📋</span> PROFILE INFO
                  </h2>
                  <dl className="space-y-3 text-sm">
                    {[
                      { label: 'Username', value: profile?.username },
                      { label: 'Display Name', value: profile?.display_name || '&mdash;' },
                      { label: 'Timezone', value: profile?.timezone || 'UTC' },
                      { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '&mdash;' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                        <dt className="font-pixel text-[8px]" style={{ color: 'var(--text-muted)' }}>{item.label.toUpperCase()}</dt>
                        <dd style={{ color: 'var(--text-primary)' }}>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="game-panel rounded-2xl p-6">
                <h2 className="font-pixel text-sm text-gold mb-6 flex items-center gap-2">
                  <span>🏆</span> ACHIEVEMENTS
                </h2>
                <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                  Achievement system coming in a future update.
                  <br />
                  <span className="font-pixel text-xs" style={{ color: 'var(--text-muted)' }}>
                    Complete quests, level up, and maintain streaks to unlock badges!
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function AvatarCustomizerPanel<T extends { id: string | null; name: string }>({
  title,
  icon,
  items,
  selected,
  onSelect,
  renderItem
}: {
  title: string
  icon: string
  items: T[]
  selected: T['id'] | null
  onSelect: (id: T['id']) => void
  renderItem: (item: T) => React.ReactNode
}) {
  return (
    <div className="game-panel rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="font-pixel text-xs text-gold">{title}</h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3" role="group" aria-label={title}>
        {items.map((item: T) => (
          <button
            key={item.id ?? 'none'}
            onClick={() => onSelect(item.id)}
            aria-label={item.name}
            aria-pressed={selected === item.id}
            className={cn(
              'relative p-2 rounded-lg transition-all',
              selected === item.id
                ? 'bg-gold/10 border-2'
                : 'hover:bg-white/5 border-2 border-transparent'
            )}
            style={{
              borderColor: selected === item.id ? 'var(--gold)' : 'transparent',
            }}
          >
            {renderItem(item)}
            {selected === item.id && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-5 h-5 text-gold"
              >
                ✓
              </motion.div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function getAttributeDescription(value: number): string {
  if (value >= 100) return 'Masterful — legendary dedication'
  if (value >= 50) return 'Expert — consistent excellence'
  if (value >= 20) return 'Skilled — notable progress'
  if (value >= 10) return 'Developing — building momentum'
  if (value >= 5) return 'Novice — first steps taken'
  return 'Untrained — potential awaits'
}
