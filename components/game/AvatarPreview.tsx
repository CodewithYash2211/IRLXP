'use client'

import type { Profile } from '@/types/database'

const AVATAR_PALETTE = {
  skin_1: '#f5d7a1',
  skin_ember: '#d98a60',
  skin_azure: '#d5b08a',
  skin_verdant: '#a1c78a',

  hair_1: '#2b1d16',
  hair_midnight: '#0f172a',
  hair_ember: '#6b3e2a',
  hair_royal: '#7c3aed',
  hair_fox: '#f59e0b',

  outfit_1: '#5878d9',
  outfit_royal: '#c084fc',
  outfit_stealth: '#374151',
  outfit_dawn: '#1f766e',

  accessories_default: '#f5c842',
  acc_pixel_cap: '#f4a261',
  acc_neon_shades: '#7dd3fc',
  acc_explorer_pack: '#a78bfa',
  acc_speed_shoes: '#fca5a5',
  acc_champion_crown: '#f5c842',
} as const

function resolveColor(key: string | null | undefined, fallback: string) {
  if (!key) return fallback
  return AVATAR_PALETTE[key as keyof typeof AVATAR_PALETTE] ?? fallback
}

function getHairShape(key: string | undefined, hairColor: string) {
  const style = key ?? 'hair_1'
  const common = {
    background: hairColor,
    borderRadius: '48% 52% 18% 18% / 52% 48% 18% 18%',
    boxShadow: '0 8px 16px rgba(0,0,0,0.22)',
  }

  if (style === 'hair_midnight') {
    return {
      ...common,
      borderRadius: '46% 54% 18% 18% / 62% 62% 18% 18%',
      transform: 'scaleY(1.08)',
    }
  }

  if (style === 'hair_royal') {
    return {
      ...common,
      borderRadius: '46% 54% 32% 36% / 64% 60% 26% 26%',
      transform: 'scaleY(1.06) rotate(-2deg)',
    }
  }

  if (style === 'hair_fox') {
    return {
      ...common,
      borderRadius: '42% 58% 18% 18% / 62% 62% 14% 18%',
      transform: 'scaleY(1.1) rotate(5deg)',
    }
  }

  if (style === 'hair_ember') {
    return {
      ...common,
      borderRadius: '50% 50% 18% 18% / 50% 50% 23% 22%',
      transform: 'scaleY(1.02)',
    }
  }

  return common
}

function getFaceGeometry(variant: 'round' | 'oval' | 'square') {
  if (variant === 'oval') {
    return { width: 128, height: 132, borderRadius: '44% 44% 48% 48% / 40% 40% 60% 60%' }
  }

  if (variant === 'square') {
    return { width: 126, height: 128, borderRadius: '20% 20% 24% 24%' }
  }

  return { width: 122, height: 128, borderRadius: '48% 48% 46% 46% / 42% 42% 54% 54%' }
}

export function AvatarPreview({
  profile,
  faceVariant = 'round',
  eyeStyle = 'spark',
  eyeColor = '#1f2937',
}: {
  profile: Profile | null
  faceVariant?: 'round' | 'oval' | 'square'
  eyeStyle?: 'spark' | 'soft' | 'wink'
  eyeColor?: string
}) {
  const skin = resolveColor(profile?.avatar_skin, AVATAR_PALETTE.skin_1)
  const hair = resolveColor(profile?.avatar_hair, AVATAR_PALETTE.hair_1)
  const outfit = resolveColor(profile?.avatar_outfit, AVATAR_PALETTE.outfit_1)
  const accessory = resolveColor(profile?.avatar_accessory, 'transparent')
  const accessoryKey = profile?.avatar_accessory ?? ''
  const faceGeometry = getFaceGeometry(faceVariant)

  const eyeWidth = eyeStyle === 'wink' ? 12 : 14
  const eyeHeight = eyeStyle === 'wink' ? 5 : eyeStyle === 'soft' ? 8 : 9
  const eyeY = eyeStyle === 'wink' ? 66 : 62
  const eyeOpacity = eyeStyle === 'soft' ? 0.7 : 1

  return (
    <div
      className="relative mx-auto flex w-full items-center justify-center overflow-hidden rounded-[28px] border border-black/10"
      style={{
        minHeight: 380,
        background: 'linear-gradient(180deg, #dfe7ef 0%, #d8dfe8 20%, #d5d9d0 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)',
      }}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-28"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(197,206,199,0.5) 22%, rgba(166,174,163,0.8) 100%)',
        }}
      />

      <div
        className="absolute left-6 top-5 h-20 w-20 rounded-full opacity-80"
        style={{ background: 'rgba(255,255,255,0.5)', filter: 'blur(10px)' }}
      />

      <div
        className="absolute right-10 top-6 h-14 w-14 rounded-full opacity-80"
        style={{ background: 'rgba(255,255,255,0.5)', filter: 'blur(10px)' }}
      />

      <div
        className="absolute left-12 top-12 h-16 w-20 rounded-[50%_50%_40%_40%]"
        style={{ background: '#dfe9d1', boxShadow: '0 0 0 10px rgba(255,255,255,0.1)' }}
      />

      <div
        className="absolute right-12 top-12 h-24 w-20 rounded-[50%_50%_35%_35%]"
        style={{ background: '#dfe9d1', boxShadow: '0 0 0 10px rgba(255,255,255,0.12)' }}
      />

      <div className="absolute left-0 right-0 bottom-0 h-28" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(105,140,140,0.25) 100%)' }} />

      <div style={{ position: 'relative', width: 270, height: 330 }}>
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 48,
            width: 150,
            height: 18,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.28)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 62,
            top: 106,
            width: 146,
            height: 90,
            borderRadius: '40% 40% 8% 8%',
            background: outfit,
            boxShadow: 'inset 0 10px 18px rgba(255,255,255,0.08)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 146,
            top: 178,
            width: 18,
            height: 66,
            borderRadius: 999,
            background: 'rgba(15,23,42,0.35)',
            transform: 'rotate(-4deg)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 96,
            top: 178,
            width: 18,
            height: 66,
            borderRadius: 999,
            background: 'rgba(15,23,42,0.35)',
            transform: 'rotate(4deg)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 180,
            width: 26,
            height: 66,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.9)',
            boxShadow: 'inset 0 -8px 12px rgba(0,0,0,0.1)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: 60,
            top: 180,
            width: 26,
            height: 66,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.9)',
            boxShadow: 'inset 0 -8px 12px rgba(0,0,0,0.1)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 72,
            top: 40,
            width: 126,
            height: 132,
            background: `linear-gradient(180deg, ${skin} 0%, ${skin} 75%, rgba(0,0,0,0.04) 100%)`,
            borderRadius: '48% 48% 42% 42% / 46% 46% 54% 54%',
            boxShadow: 'inset 0 -10px 18px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: -6,
              top: -10,
              width: 138,
              height: 62,
              background: hair,
              borderRadius: '48% 52% 18% 18% / 60% 60% 16% 16%',
              boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 28,
              top: 52,
              width: 12,
              height: 12,
              borderRadius: 999,
              background: eyeColor,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              right: 28,
              top: 52,
              width: 12,
              height: 12,
              borderRadius: 999,
              background: eyeColor,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 34,
              top: 48,
              width: 15,
              height: 4,
              borderRadius: 999,
              background: 'rgba(62,39,26,0.7)',
              boxShadow: '48px 0 0 rgba(62,39,26,0.7)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 50,
              top: 70,
              width: 26,
              height: 10,
              borderRadius: 999,
              background: 'rgba(255, 180, 170, 0.42)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 56,
              top: 90,
              width: 14,
              height: 8,
              borderRadius: 999,
              background: 'rgba(255, 128, 128, 0.35)',
            }}
          />

          {accessoryKey === 'acc_neon_shades' && (
            <div
              style={{
                position: 'absolute',
                left: 20,
                top: 48,
                width: 86,
                height: 18,
                borderRadius: 999,
                border: '3px solid rgba(125,211,252,0.8)',
                background: 'rgba(125,211,252,0.12)',
              }}
            />
          )}

          {accessoryKey === 'acc_pixel_cap' && (
            <div
              style={{
                position: 'absolute',
                left: 10,
                top: -10,
                width: 108,
                height: 26,
                borderRadius: '45% 45% 18% 18%',
                background: accessory,
              }}
            />
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 160,
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(156,168,159,0.38) 100%)',
          }}
        />
      </div>
    </div>
  )
}
