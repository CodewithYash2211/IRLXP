'use client'

import { useEffect, useState, useCallback, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { GameDialog } from '@/components/ui/GameDialog'
import { ItemGlyph } from '@/components/game/ItemGlyph'
import { PlaceBanner } from '@/components/game/PlaceBanner'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/providers/ToastProvider'
import { useRouter } from 'next/navigation'
import type { Profile, Item, InventoryItem } from '@/types/database'
import { RARITY_CONFIG } from '@/lib/utils'

const SHOP_CATEGORIES = [
  { id: 'character', label: 'OUTFITS', icon: '👕' },
  { id: 'accessories', label: 'ACCESSORIES', icon: '✨' },
  { id: 'auras', label: 'AURAS', icon: '🌟' },
  { id: 'badges', label: 'BADGES', icon: '🏅' },
  { id: 'themes', label: 'THEMES', icon: '🎨' },
] as const

interface LootScreenProps {
  profile: Profile | null
}

export function LootScreen({ profile }: LootScreenProps) {
  const { addToast } = useToast()
  const [items, setItems] = useState<Item[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [activeCategory, setActiveCategory] = useState<typeof SHOP_CATEGORIES[number]['id']>('accessories')
  const [loading, setLoading] = useState(true)
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState<Item | null>(null)
  const router = useRouter()
  const busy = useRef(false)
  const [loadError, setLoadError] = useState(false)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    // Load shop items
    const { data: shopItems, error: shopError } = await supabase
      .from('items')
      .select('*')
      .order('category')
      .order('price')

    // Load user inventory
    const { data: userInventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*, item:items(*)')
      .eq('user_id', profile?.id)

    setLoadError(Boolean(shopError || inventoryError))
    setItems(shopItems || [])
    setInventory(userInventory || [])
    setLoading(false)
  }, [profile?.id])

  useEffect(() => {
    // Subscription starts an asynchronous database read; no synchronous state is set.
    void Promise.resolve().then(loadData)
  }, [loadData])

  const categoryItems = items.filter(item => item.category === activeCategory)
  const ownedItemIds = new Set(inventory.map(i => i.item_id))
  const equippedItemIds = new Set(inventory.filter(i => i.equipped).map(i => i.item_id))

  const handlePurchase = async (item: Item) => {
    if (!profile || busy.current) return
    if (profile.coins < item.price) {
      addToast({ type: 'error', title: 'Insufficient Coins', message: `You need ${item.price - profile.coins} more coins.` })
      return
    }
    if (ownedItemIds.has(item.id)) {
      addToast({ type: 'warning', title: 'Already Owned', message: 'You already own this item.' })
      return
    }

    if (busy.current) return
    busy.current = true
    setPurchasingId(item.id)
    try {
      const res = await fetch(`/api/items/${item.id}/purchase`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Purchase failed')

      await loadData()
      router.refresh()
      addToast({ type: 'success', title: 'Purchase Complete!', message: `Acquired ${item.name} for ${item.price} coins.` })
    } catch (error: unknown) {
      addToast({ type: 'error', title: 'Purchase Failed', message: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      busy.current = false
      setPurchasingId(null)
    }
  }

  const handleEquip = async (item: Item) => {
    if (equippedItemIds.has(item.id)) {
      addToast({ type: 'info', title: 'Already Equipped' })
      return
    }

    if (busy.current) return
    busy.current = true
    setPurchasingId(item.id)
    try {
      const res = await fetch(`/api/items/${item.id}/equip`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Equip failed')

      await loadData()
      router.refresh()
      addToast({ type: 'success', title: 'Equipped!', message: `${item.name} is now equipped.` })
    } catch (error: unknown) {
      addToast({ type: 'error', title: 'Equip Failed', message: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      busy.current = false
      setPurchasingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-deepest)' }}>
        <div className="text-center">
          <div className="text-4xl animate-float mb-4">🏪</div>
          <p className="font-pixel text-sm text-gold">LOADING MERCHANT...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-deepest)' }}>
      {/* Background atmosphere */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-deepest)] via-[var(--bg-deep)] to-[var(--bg-surface)]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'var(--gold)' }} />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'var(--xp-bar)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        {loadError && <div role="alert" className="mb-4">The merchant could not load all your wares. <Button variant="ghost" onClick={loadData}>Retry</Button></div>}
<PlaceBanner place="market"/>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-pixel text-xl md:text-2xl text-gold glow-gold">MERCHANT&apos;S WARES</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Spend your hard-earned coins on gear and cosmetics.
              </p>
            </div>
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <span className="text-xl">🪙</span>
              <span className="font-pixel text-lg text-gold">{profile?.coins.toLocaleString() || 0}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>COINS</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 border-b mb-6" style={{ borderColor: 'var(--border)' }}>
            {SHOP_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 font-pixel text-[9px] tracking-wider transition-all relative',
                  activeCategory === cat.id
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-muted hover:text-foreground'
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Shop Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {categoryItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ShopItemCard
                  item={item}
                  owned={ownedItemIds.has(item.id)}
                  equipped={equippedItemIds.has(item.id)}
                  canAfford={(profile?.coins || 0) >= item.price}
                  purchasing={purchasingId !== null}
                  onClick={() => {
                    if (ownedItemIds.has(item.id)) {
                      if (!equippedItemIds.has(item.id)) handleEquip(item)
                    } else {
                      handlePurchase(item)
                    }
                  }}
                  onPreview={() => setShowPreview(item)}
                />
              </motion.div>
            ))}

            {categoryItems.length === 0 && (
              <motion.div
                className="col-span-full text-center py-16 game-panel rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-4xl mb-3 opacity-50">📦</div>
                <h3 className="font-pixel text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                  NO ITEMS IN THIS CATEGORY
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  No wares are stocked in this category yet.
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Owned Items Section */}
        {inventory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h2 className="font-pixel text-sm text-gold mb-4 flex items-center gap-2">
              <span>🎒</span> YOUR INVENTORY
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {inventory.filter(row => row.item).map((invItem, index) => (
                <motion.div
                  key={invItem.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <InventoryItemCard
                    item={invItem.item!}
                    equipped={invItem.equipped}
                    onClick={() => {
                      if (!invItem.equipped) handleEquip(invItem.item!)
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Item Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <GameDialog label="Item preview" onClose={() => { setShowPreview(null); }}>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="game-panel pixel-border-gold p-6 max-w-md w-full"
              style={{ borderColor: `var(--rarity-${showPreview.rarity})`, boxShadow: `0 0 40px color-mix(in srgb, var(--rarity-${showPreview.rarity}) 25%, transparent)` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-pixel text-sm text-gold">ITEM PREVIEW</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(null)}>✕</Button>
              </div>

              <div className="text-center mb-4">
                <div className="mb-2 animate-float"><ItemGlyph item={showPreview}/></div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{showPreview.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="font-pixel text-[8px] px-2 py-0.5 rounded" style={{
                    color: `var(--rarity-${showPreview.rarity})`,
                    background: `color-mix(in srgb, var(--rarity-${showPreview.rarity}) 13%, transparent)`,
                    border: `1px solid var(--rarity-${showPreview.rarity})`
                  }}>
                    {RARITY_CONFIG[showPreview.rarity as keyof typeof RARITY_CONFIG].label}
                  </span>
                  <span className="font-pixel text-[8px] px-2 py-0.5 rounded" style={{
                    color: 'var(--gold)',
                    background: 'color-mix(in srgb, var(--gold) 13%, transparent)',
                    border: '1px solid var(--gold)'
                  }}>
                    {showPreview.category.toUpperCase()}
                  </span>
                </div>
              </div>

              {showPreview.description && (
                <p className="text-sm mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                  {showPreview.description}
                </p>
              )}

              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="font-pixel text-lg text-gold">{showPreview.price} 🪙</span>
              </div>

              <div className="flex gap-3">
                {ownedItemIds.has(showPreview.id) ? (
                  <>
                    {equippedItemIds.has(showPreview.id) ? (
                      <Button variant="ghost" className="flex-1" disabled>
                        EQUIPPED
                      </Button>
                    ) : (
                      <Button variant="gold" className="flex-1" onClick={() => { handleEquip(showPreview); setShowPreview(null); }}>
                        EQUIP
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="gold"
                    className="flex-1"
                    disabled={(profile?.coins || 0) < showPreview.price || purchasingId === showPreview.id}
                    loading={purchasingId === showPreview.id}
                    onClick={() => { handlePurchase(showPreview); setShowPreview(null); }}
                  >
                    PURCHASE
                  </Button>
                )}
              </div>
            </motion.div>
          </GameDialog>
        )}
      </AnimatePresence>
    </div>
  )
}

function ShopItemCard({
  item,
  owned,
  equipped,
  canAfford,
  purchasing,
  onClick,
  onPreview
}: {
  item: Item
  owned: boolean
  equipped: boolean
  canAfford: boolean
  purchasing: boolean
  onClick: () => void
  onPreview: () => void
}) {
  const rarityColor = `var(--rarity-${item.rarity})`

  return (
    <div
      className={cn(
        'relative game-panel rounded-xl p-4 flex flex-col transition-all',
        'hover:shadow-[0_0_24px_rgba(245,200,66,0.15)]',
        equipped && 'border-2 ring-2 ring-gold/50',
        owned && !equipped && 'border border-white/10',
        !owned && !canAfford && 'opacity-60'
      )}
      style={{
        borderColor: equipped ? 'var(--gold)' : (owned ? 'var(--border)' : `color-mix(in srgb, ${rarityColor} 25%, transparent)`),
        background: equipped ? 'rgba(245,200,66,0.05)' : 'var(--bg-panel)',
      }}
    >
      {/* Rarity glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${rarityColor}20, transparent)`,
          border: `1px solid ${rarityColor}30`,
          borderRadius: 'inherit',
        }}
      />

      {/* Item Icon/Visual */}
      <div className="relative flex-1 flex items-center justify-center mb-4">
        <div className="text-5xl animate-float" style={{ animationDelay: '0.4s' }}>
          <ItemGlyph item={item}/>
        </div>
        {equipped && (
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-2 -right-2 text-gold"
          >
            ✦ EQUIPPED
          </motion.div>
        )}
        {!owned && !canAfford && (
          <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
            <span className="font-pixel text-xs text-gold">CANNOT AFFORD</span>
          </div>
        )}
      </div>

      {/* Item Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          {item.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="font-pixel text-[8px] px-1.5 py-0.5 rounded" style={{
            color: rarityColor,
            background: `color-mix(in srgb, ${rarityColor} 13%, transparent)`,
            border: `1px solid color-mix(in srgb, ${rarityColor} 25%, transparent)`,
          }}>
            {RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG].label}
          </span>
          <span className="font-pixel text-[8px] px-1.5 py-0.5 rounded" style={{
            color: 'var(--gold)',
            background: 'color-mix(in srgb, var(--gold) 13%, transparent)',
            border: '1px solid color-mix(in srgb, var(--gold) 25%, transparent)',
          }}>
            {item.category.toUpperCase()}
          </span>
        </div>

        {item.description && (
          <p className="text-[10px] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {item.description}
          </p>
        )}

        {/* Price / Action */}
        <div className="flex flex-wrap gap-3 items-center justify-between pt-2 border-t mt-2" style={{ borderColor: 'var(--border)' }}>
          <span className="font-pixel text-sm text-gold flex items-center gap-1">
            🪙 {item.price.toLocaleString()}
          </span>

          {owned ? (
            equipped ? (
              <span className="font-pixel text-[9px] text-green-400">✓ EQUIPPED</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-[9px] font-pixel"
                onClick={onClick}
                disabled={purchasing}
              >
                EQUIP
              </Button>
            )
          ) : (
            <Button
              variant={canAfford ? 'gold' : 'ghost'}
              size="sm"
              className="text-[9px] font-pixel flex-1"
              disabled={!canAfford || purchasing}
              loading={purchasing}
              onClick={onClick}
            >
              {purchasing ? 'BUYING...' : 'BUY'}
            </Button>
          )}
        </div>
      </div>

      {/* Preview button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-2 text-[8px] font-pixel opacity-0 hover:opacity-100 transition-opacity"
        onClick={onPreview}
      >
        👁 PREVIEW
      </Button>
    </div>
  )
}

function InventoryItemCard({ item, equipped, onClick }: { item: Item; equipped: boolean; onClick: () => void }) {
  const rarityColor = `var(--rarity-${item.rarity})`
  const animationDelay = useId()

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative game-panel rounded-lg p-3 flex flex-col items-center text-center transition-all',
        'hover:border-gold/50 hover:shadow-[0_0_16px_rgba(245,200,66,0.1)]',
        equipped && 'border-gold/50 bg-gold/5'
      )}
      style={{
        borderColor: equipped ? 'var(--gold)' : 'var(--border)',
        minHeight: '120px',
      }}
    >
      {equipped && (
        <div className="absolute -top-1 -right-1 w-5 h-5 text-gold text-[8px] animate-glow">★</div>
      )}
      <div className="text-3xl mb-1 animate-float" style={{ animationDelay: `${animationDelay.length % 2}s` }}>
        <ItemGlyph item={item}/>
      </div>
      <h4 className="font-semibold text-xs truncate w-full" style={{ color: 'var(--text-primary)' }}>
        {item.name}
      </h4>
      <span className="font-pixel text-[7px] px-1.5 py-0.5 rounded" style={{
        color: rarityColor,
        background: `color-mix(in srgb, ${rarityColor} 13%, transparent)`,
        border: `1px solid color-mix(in srgb, ${rarityColor} 25%, transparent)`,
      }}>
        {RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG].label}
      </span>
      {equipped && (
        <span className="font-pixel text-[7px] mt-1 text-green-400">EQUIPPED</span>
      )}
    </button>
  )
}
