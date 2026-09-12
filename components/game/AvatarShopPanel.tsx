'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AvatarPreview } from '@/components/game/AvatarPreview'
import { createClient } from '@/lib/supabase/client'
import type { InventoryItem, Item, Profile } from '@/types/database'

const SKIN_OPTIONS = [
  { value: 'skin_1', label: 'Classic', tone: '#f5d7a1' },
  { value: 'skin_ember', label: 'Ember', tone: '#d98a60' },
  { value: 'skin_azure', label: 'Azure', tone: '#c9a77d' },
  { value: 'skin_verdant', label: 'Verdant', tone: '#a1c78a' },
]

const HAIR_OPTIONS = [
  { value: 'hair_1', label: 'Default', tone: '#2b1d16' },
  { value: 'hair_midnight', label: 'Midnight', tone: '#0f172a' },
  { value: 'hair_ember', label: 'Ember', tone: '#6b3e2a' },
  { value: 'hair_royal', label: 'Royal', tone: '#7c3aed' },
  { value: 'hair_fox', label: 'Foxfire', tone: '#f59e0b' },
]

const OUTFIT_OPTIONS = [
  { value: 'outfit_1', label: 'Scout', tone: '#5878d9' },
  { value: 'outfit_royal', label: 'Royal', tone: '#c084fc' },
  { value: 'outfit_stealth', label: 'Stealth', tone: '#374151' },
  { value: 'outfit_dawn', label: 'Dawn', tone: '#1f766e' },
]

const FACE_VARIANTS = [
  { value: 'round', label: 'Round', description: 'Soft and friendly' },
  { value: 'oval', label: 'Oval', description: 'Balanced profile' },
  { value: 'square', label: 'Square', description: 'Strong angle' },
] as const

const EYE_STYLES = [
  { value: 'spark', label: 'Spark', tone: '#1f2937' },
  { value: 'soft', label: 'Soft', tone: '#334155' },
  { value: 'wink', label: 'Wink', tone: '#111827' },
] as const

const EYE_COLORS = ['#1f2937', '#1d4ed8', '#0f766e', '#7c3aed', '#f59e0b']

const SHOE_STYLES = [
  { value: 'street', label: 'Street', accent: '#cbd5e1' },
  { value: 'sport', label: 'Sport', accent: '#38bdf8' },
  { value: 'boots', label: 'Boots', accent: '#fca5a5' },
] as const

const RARITY_COLORS: Record<string, string> = {
  common: '#94a3b8',
  rare: '#60a5fa',
  epic: '#c084fc',
  legendary: '#f5c842',
}

const avatarCategories = [
  { value: 'face', label: 'Face' },
  { value: 'hair', label: 'Hair' },
  { value: 'outfit', label: 'Outfit' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
] as const

type Category = (typeof avatarCategories)[number]['value']
type FaceVariant = (typeof FACE_VARIANTS)[number]['value']
type EyeStyle = (typeof EYE_STYLES)[number]['value']

interface AvatarShopPanelProps {
  mode: 'character' | 'shop'
  initialProfile: Profile | null
  initialItems: Item[]
  initialInventory: InventoryItem[]
}

export function AvatarShopPanel({ mode, initialProfile, initialItems, initialInventory }: AvatarShopPanelProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [items] = useState<Item[]>(initialItems)
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('face')
  const [faceVariant, setFaceVariant] = useState<FaceVariant>('round')
  const [eyeStyle, setEyeStyle] = useState<EyeStyle>('spark')
  const [eyeColor, setEyeColor] = useState('#1f2937')
  const [shoeStyle, setShoeStyle] = useState<(typeof SHOE_STYLES)[number]['value']>('sport')

  const categoryPillStyle = (isActive: boolean) => ({
    borderColor: isActive ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
    background: isActive ? 'rgba(245,200,66,0.12)' : 'rgba(255,255,255,0.02)',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    boxShadow: isActive ? '0 0 0 1px rgba(245,200,66,0.18)' : 'none',
  })

  const ownedItemIds = useMemo(() => new Set(inventory.map((entry) => entry.item_id)), [inventory])
  const equippedItemIds = useMemo(() => new Set(inventory.filter((entry) => entry.equipped).map((entry) => entry.item_id)), [inventory])
  const accessoryItems = useMemo(
    () => inventory.filter((entry) => entry.item?.category === 'accessories').map((entry) => entry.item!).filter(Boolean),
    [inventory]
  )

  async function refreshInventory() {
    const supabase = createClient()
    const { data: nextInventory } = await supabase
      .from('inventory')
      .select('*, item:items(*)')
      .order('purchased_at', { ascending: false })

    setInventory(nextInventory ?? [])
  }

  function setAvatarField(field: 'avatar_skin' | 'avatar_hair' | 'avatar_outfit' | 'avatar_accessory', value: string | null) {
    if (!profile) return

    const nextProfile = { ...profile, [field]: value }
    setProfile(nextProfile)
  }

  async function handleSaveAvatar(field: 'avatar_skin' | 'avatar_hair' | 'avatar_outfit' | 'avatar_accessory', value: string | null) {
    if (!profile) return

    setSavingAvatar(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', profile.id)

      if (error) {
        throw error
      }

      setAvatarField(field, value)
      setMessage({ type: 'success', text: 'Appearance saved.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save avatar.'
      setMessage({ type: 'error', text: message })
    } finally {
      setSavingAvatar(false)
    }
  }

  async function handlePurchase(item: Item) {
    if (!profile) return

    setLoadingActionId(item.id)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('purchase_item', { p_item_id: item.id })

      if (error) {
        const message = error.message || 'Purchase failed.'
        const friendly = message.toLowerCase().includes('insufficient coins')
          ? 'Not enough coins for that item.'
          : message.toLowerCase().includes('duplicate') || message.toLowerCase().includes('already')
            ? 'You already own this item.'
            : 'Purchase failed. Try again.'
        throw new Error(friendly)
      }

      const payload = data as { success?: boolean; remainingCoins?: number } | null
      const nextCoins = typeof payload?.remainingCoins === 'number' ? payload.remainingCoins : profile.coins

      setProfile((current) =>
        current ? { ...current, coins: nextCoins } : current
      )
      await refreshInventory()
      setMessage({ type: 'success', text: `${item.name} purchased successfully.` })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to complete purchase.'
      setMessage({ type: 'error', text: message })
    } finally {
      setLoadingActionId(null)
    }
  }

  async function handleEquip(item: Item) {
    if (!profile) return

    setLoadingActionId(item.id)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('equip_item', { p_item_id: item.id })

      if (error) {
        const message = error.message || 'Equip failed.'
        const friendly = message.toLowerCase().includes('not owned')
          ? 'You do not own that item.'
          : message.toLowerCase().includes('not found')
            ? 'Item not found.'
            : 'Unable to equip item.'
        throw new Error(friendly)
      }

      await refreshInventory()

      const nextProfile: Profile = { ...profile }
      const key = item.asset_key
      if (key.startsWith('skin_')) nextProfile.avatar_skin = key
      else if (key.startsWith('hair_')) nextProfile.avatar_hair = key
      else if (key.startsWith('outfit_')) nextProfile.avatar_outfit = key
      else if (key.startsWith('acc_')) nextProfile.avatar_accessory = key

      setProfile(nextProfile)
      setMessage({ type: 'success', text: `${item.name} equipped.` })

      if (data && typeof data === 'object' && 'success' in data && data.success === true) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            avatar_skin: nextProfile.avatar_skin,
            avatar_hair: nextProfile.avatar_hair,
            avatar_outfit: nextProfile.avatar_outfit,
            avatar_accessory: nextProfile.avatar_accessory,
          })
          .eq('id', profile.id)

        if (profileError) {
          throw profileError
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to equip item.'
      setMessage({ type: 'error', text: message })
    } finally {
      setLoadingActionId(null)
    }
  }

  const isCharacterMode = mode === 'character'

  return (
    <div className="space-y-6 p-4 md:p-6 pb-24 md:pb-8">
      {message && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: message.type === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(120,255,195,0.25)',
            background: message.type === 'error' ? 'rgba(127,29,29,0.25)' : 'rgba(13,148,136,0.12)',
            color: message.type === 'error' ? 'var(--strength)' : 'var(--text-primary)',
            boxShadow: '0 10px 24px rgba(15, 118, 110, 0.08)',
          }}
        >
          {message.text}
        </div>
      )}

      {isCharacterMode ? (
        <div className="mx-auto max-w-[430px] rounded-[32px] border border-black/5 bg-[#f4f4f4] shadow-[0_18px_40px_rgba(15,23,42,0.12)] overflow-hidden">
          <div className="relative bg-[#e4e8ee] px-4 pb-3 pt-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span>12:45</span>
              <div className="flex items-center gap-2">
                <span>◔</span>
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end">
              <button className="flex items-center gap-2 rounded-full bg-[#2b2b2b] px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">
                <span>◌</span> Share
              </button>
            </div>

            <div className="relative mt-2 rounded-[28px] bg-[#dfe7ef] px-3 pb-3 pt-0 shadow-inner">
              <div className="absolute left-3 top-8 h-16 w-16 rounded-full bg-white/40 blur-lg" />
              <div className="absolute right-5 top-10 h-16 w-16 rounded-full bg-white/35 blur-lg" />
              <div className="absolute left-12 top-14 h-20 w-20 rounded-[50%_50%_35%_35%] bg-[#dce8d9]" />
              <div className="absolute right-14 top-14 h-24 w-20 rounded-[50%_50%_35%_35%] bg-[#dce8d9]" />

              <AvatarPreview profile={profile} faceVariant={faceVariant} eyeStyle={eyeStyle} eyeColor={eyeColor} />
            </div>
          </div>

          <div className="bg-[#f3f3f3] px-4 pb-5 pt-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-[#1f1f1f]">{profile?.display_name ?? profile?.username ?? 'Amelie Monroe'}</div>
              <button className="text-xl text-[#444]">×</button>
            </div>

            <div className="mt-3 space-y-2 rounded-[18px] bg-white/80 p-2 shadow-sm">
              <button className="flex w-full items-center justify-between rounded-12 px-3 py-3 text-left text-sm font-medium text-slate-700">
                <span className="flex items-center gap-3"><span>↗</span> Change Outfit</span>
                <span>›</span>
              </button>
              <button className="flex w-full items-center justify-between rounded-12 px-3 py-3 text-left text-sm font-medium text-slate-700">
                <span className="flex items-center gap-3"><span>⤴</span> Share Outfit</span>
                <span>›</span>
              </button>
              <button className="flex w-full items-center justify-between rounded-12 px-3 py-3 text-left text-sm font-medium text-slate-700">
                <span className="flex items-center gap-3"><span>◍</span> Pose &amp; Background</span>
                <span>›</span>
              </button>
              <button className="flex w-full items-center justify-between rounded-12 px-3 py-3 text-left text-sm font-medium text-slate-700">
                <span className="flex items-center gap-3"><span>◌</span> Change Selfie</span>
                <span>›</span>
              </button>
            </div>

            <div className="mt-5 rounded-[22px] bg-white p-3 shadow-sm">
              <div className="flex items-center justify-center gap-5 text-[11px] font-semibold text-slate-500">
                <button className="flex flex-col items-center gap-2 text-[#2f2f2f]">
                  <span className="rounded-full bg-[#ececec] p-2">◫</span>
                  <span>Fashion</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-slate-500">
                  <span className="rounded-full bg-[#ececec] p-2">◧</span>
                  <span>Kleider</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-slate-500">
                  <span className="rounded-full bg-[#ececec] p-2">◍</span>
                  <span>Avatar</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {['Snapchat+', 'Blueberry', 'Coach'].map((label, idx) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveCategory(idx === 0 ? 'outfit' : idx === 1 ? 'hair' : 'face')}
                    className="rounded-2xl border border-slate-200 bg-[#f8f8f8] p-2 text-left"
                  >
                    <div className="mb-2 h-16 rounded-xl bg-gradient-to-br from-slate-300 to-slate-100" />
                    <div className="text-xs font-semibold text-slate-700">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[22px] bg-[#f9f9f9] p-3 shadow-sm">
              <div className="mb-2 text-sm font-semibold text-slate-700">Style options</div>
              <div className="grid gap-2">
                <div className="flex flex-wrap gap-2">
                  {SKIN_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSaveAvatar('avatar_skin', option.value)}
                      className="rounded-full border px-3 py-2 text-xs font-medium"
                      style={{
                        borderColor: profile?.avatar_skin === option.value ? '#2d2d2d' : '#d9d9d9',
                        background: profile?.avatar_skin === option.value ? '#f3f3f3' : '#fff',
                        color: '#2d2d2d',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {HAIR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSaveAvatar('avatar_hair', option.value)}
                      className="rounded-full border px-3 py-2 text-xs"
                      style={{
                        borderColor: profile?.avatar_hair === option.value ? '#2d2d2d' : '#d9d9d9',
                        background: profile?.avatar_hair === option.value ? '#f3f3f3' : '#fff',
                        color: '#2d2d2d',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {OUTFIT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSaveAvatar('avatar_outfit', option.value)}
                      className="rounded-full border px-3 py-2 text-xs"
                      style={{
                        borderColor: profile?.avatar_outfit === option.value ? '#2d2d2d' : '#d9d9d9',
                        background: profile?.avatar_outfit === option.value ? '#f3f3f3' : '#fff',
                        color: '#2d2d2d',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-pixel text-[10px] text-gold">LOOT SHOP</div>
              <h2 className="mt-2 text-2xl font-bold text-white">Cosmetic boutique</h2>
            </div>
            <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-300">
              🪙 {profile?.coins?.toLocaleString() ?? 0}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const owned = ownedItemIds.has(item.id)
              const equipped = equippedItemIds.has(item.id)
              const canAfford = (profile?.coins ?? 0) >= item.price

              return (
                <div
                  key={item.id}
                  className="game-card rounded-[28px] p-4 transition-all duration-200 hover:-translate-y-1"
                  style={{ borderColor: equipped ? 'rgba(245,200,66,0.65)' : 'var(--border)', boxShadow: equipped ? '0 12px 28px rgba(245, 200, 66, 0.14)' : '0 12px 22px rgba(0,0,0,0.18)' }}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-pixel text-[9px] text-[var(--text-muted)]">{item.category.toUpperCase()}</div>
                      <h3 className="mt-2 text-lg font-bold text-white">{item.name}</h3>
                    </div>
                    <span
                      className="rounded-full border px-2 py-1 text-[10px] font-bold uppercase"
                      style={{
                        borderColor: `${RARITY_COLORS[item.rarity] ?? '#94a3b8'}55`,
                        color: RARITY_COLORS[item.rarity] ?? '#94a3b8',
                        background: `${RARITY_COLORS[item.rarity] ?? '#94a3b8'}14`,
                      }}
                    >
                      {item.rarity}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--text-secondary)]">{item.description ?? 'Rare loot for your hero.'}</p>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Price</span>
                    <span className="font-bold text-yellow-300">🪙 {item.price}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {owned ? (
                      <Button
                        variant={equipped ? 'gold' : 'primary'}
                        size="sm"
                        loading={loadingActionId === item.id}
                        onClick={() => handleEquip(item)}
                        className="flex-1"
                      >
                        {equipped ? 'Equipped' : 'Equip'}
                      </Button>
                    ) : (
                      <Button
                        variant="gold"
                        size="sm"
                        loading={loadingActionId === item.id}
                        onClick={() => handlePurchase(item)}
                        className="flex-1"
                        disabled={!canAfford}
                      >
                        {canAfford ? 'Buy' : 'Need more coins'}
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-[var(--text-muted)]">
                    {owned ? (equipped ? 'Currently equipped' : 'Owned in inventory') : 'Not yet purchased'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
