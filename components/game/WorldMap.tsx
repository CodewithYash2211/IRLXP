'use client'

import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import type { Profile } from '@/types/database'
import { AdventureScene } from './AdventureScene'
import { HeroSprite } from './HeroSprite'
import { getLevelInfo } from '@/lib/game/progression'

const regions = [
  { name: 'Library of Knowledge', category: 'intellect', detail: 'Read, learn, discover', icon: '📖', x: '40%', y: '42%' },
  { name: 'Forge of Might', category: 'strength', detail: 'Build your strength', icon: '⚒', x: '30%', y: '72%' },
  { name: 'Temple of Focus', category: 'discipline', detail: 'Make habits stick', icon: '⚑', x: '69%', y: '46%' },
  { name: 'Gardens of Life', category: 'vitality', detail: 'Rest, move, recharge', icon: '❀', x: '77%', y: '79%' },
  { name: 'Tavern of Bonds', category: 'social', detail: 'Gather your party', icon: '♜', x: '85%', y: '58%' },
]

// Walk speed in px/ms — a light stroll, not a sprint.
const WALK_SPEED = 0.18
const MIN_WALK_MS = 250
const MAX_WALK_MS = 2400

interface WalkState {
  dx: number
  dy: number
  ms: number
}

export function WorldMap({ profile }: { profile: Profile | null }) {
  const mapRef = useRef<HTMLElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const [walk, setWalk] = useState<WalkState | null>(null)
  const [walking, setWalking] = useState(false)
  const [faceRight, setFaceRight] = useState(true)
  const [marker, setMarker] = useState<{ x: number; y: number; key: number } | null>(null)
  const walkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Where the hero currently stands (offset from its resting spot), so new
  // taps mid-walk measure distance and facing from the visual position.
  const posRef = useRef({ x: 0, y: 0 })

  const handleGroundTap = useCallback((e: React.PointerEvent<HTMLElement>) => {
    // Destination links keep their own behaviour — don't walk when tapping them.
    if (e.target instanceof Element && e.target.closest('a,button')) return
    const map = mapRef.current
    const player = playerRef.current
    const scene = map?.querySelector<HTMLElement>('.adventure-scene')
    if (!map || !player || !scene) return

    const mapRect = map.getBoundingClientRect()
    const sceneRect = scene.getBoundingClientRect()
    const tapX = e.clientX - mapRect.left
    const tapY = e.clientY - mapRect.top

    // Keep the hero inside the painted scene, clear of the edges.
    const minX = 30
    const maxX = mapRect.width - 30
    const minY = sceneRect.top - mapRect.top + 46
    const maxY = sceneRect.bottom - mapRect.top - 120
    if (maxX <= minX || maxY <= minY) return

    const destX = Math.min(Math.max(tapX, minX), maxX)
    const destY = Math.min(Math.max(tapY, minY), maxY)

    // offsetLeft/Top ignore transforms, so this is the hero's resting spot.
    const homeX = player.offsetLeft + player.offsetWidth / 2
    const homeY = player.offsetTop + 46
    const dx = destX - homeX - posRef.current.x
    const dy = destY - homeY - posRef.current.y
    const distance = Math.hypot(dx, dy)
    if (distance < 8) return

    const ms = Math.min(Math.max(distance / WALK_SPEED, MIN_WALK_MS), MAX_WALK_MS)
    posRef.current = { x: posRef.current.x + dx, y: posRef.current.y + dy }
    if (Math.abs(dx) > 6) setFaceRight(dx > 0)
    setWalking(true)
    setWalk({ dx, dy, ms })
    setMarker({ x: destX, y: destY, key: Date.now() })
    if (walkTimer.current) clearTimeout(walkTimer.current)
    // Fallback in case transitionend never fires (e.g. reduced-motion mode).
    walkTimer.current = setTimeout(() => setWalking(false), ms + 120)
  }, [])

  return (
    <section
      ref={mapRef}
      className="world-map"
      aria-label="Explore your overworld"
      onPointerDown={handleGroundTap}
    >
      <AdventureScene />
      <div
        ref={playerRef}
        className={`world-player${walking ? ' is-walking' : ' is-idle'}`}
        style={walk ? {
          transform: `translate(${walk.dx}px, ${walk.dy}px)`,
          transition: `transform ${walk.ms}ms linear`,
        } : undefined}
        onTransitionEnd={e => {
          if (e.propertyName !== 'transform') return
          if (walkTimer.current) clearTimeout(walkTimer.current)
          setWalking(false)
        }}
      >
        <div className="world-hero" style={{ transform: `scaleX(${faceRight ? 1 : -1})` }}>
          <HeroSprite appearance={profile ?? {}} className={walking ? 'hero-walk' : 'hero-idle'} />
        </div>
        <span>{profile?.username ?? 'Adventurer'}</span>
      </div>
      {marker && (
        <span
          key={marker.key}
          className="world-move-marker"
          style={{ left: marker.x, top: marker.y }}
          onAnimationEnd={() => setMarker(null)}
        />
      )}
      <nav className="world-locations" aria-label="World destinations">{regions.map(region => <Link key={region.category} href={region.category === 'social' ? '/party' : `/quests?category=${region.category}`} style={{left:region.x,top:region.y}} className="world-location"><span aria-hidden="true">{region.icon}</span><strong>{region.name}</strong><small>{region.detail}</small></Link>)}</nav>
    </section>
  )
}
export function WorldPage({ profile }: { profile: Profile | null }) {
  const level = getLevelInfo(profile?.total_xp ?? 0)
  return <div className="world-page"><header className="flex flex-wrap items-end justify-between gap-4 p-5 md:p-8"><div><p className="eyebrow text-gold">THE EVERYDAY REALM</p><h1 className="text-3xl font-bold mt-2">Where will you go today?</h1><p className="text-secondary mt-2">Choose a destination. Your real-life effort moves the story forward.</p></div><Link href="/character" className="world-level">Level {level.level} · {profile?.total_xp.toLocaleString() ?? 0} XP</Link></header><WorldMap profile={profile}/><p className="px-5 py-5 text-sm text-secondary">Tap the map and your hero walks there. Explore a region to open its quest board, or meet your party at the tavern.</p></div>
}
export default WorldPage
