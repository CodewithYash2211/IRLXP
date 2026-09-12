'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, RotateCcw, Sparkles, Wand2 } from 'lucide-react'

import { Avatar3D } from '@/components/game/Avatar3D'
import { avatarCategories, backgroundOptions, eyeColors, eyeStyleOptions, faceShapeOptions, hairOptions, outfitOptions, poseOptions, skinOptions, accessoryOptions, type AvatarCategory, type ExpressionName, type FaceShape, type PoseName } from '@/lib/avatar/avatarData'

interface AvatarConfig {
  skin: string
  hair: string
  outfit: string
  accessory: string | null
  face: FaceShape
  eyes: 'spark' | 'soft' | 'wink'
  eyeColor: string
  background: string
  pose: PoseName
  expression: ExpressionName
}

const defaultConfig: AvatarConfig = {
  skin: 'skin_1',
  hair: 'hair_1',
  outfit: 'outfit_1',
  accessory: null,
  face: 'round',
  eyes: 'spark',
  eyeColor: '#1f2937',
  background: 'studio',
  pose: 'standing',
  expression: 'happy',
}

const expressionOptions = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'happy', label: 'Happy' },
  { value: 'smile', label: 'Smile' },
  { value: 'winking', label: 'Winking' },
  { value: 'confident', label: 'Confident' },
] as const

export function AvatarEditor() {
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>('face')
  const [config, setConfig] = useState<AvatarConfig>(defaultConfig)

  const selectedSummary = useMemo(() => {
    const skin = skinOptions.find((option) => option.value === config.skin)?.label ?? 'Classic'
    const hair = hairOptions.find((option) => option.value === config.hair)?.label ?? 'Default'
    const outfit = outfitOptions.find((option) => option.value === config.outfit)?.label ?? 'Scout'
    return { skin, hair, outfit }
  }, [config])

  function updateConfig<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  function randomizeAvatar() {
    const randomSkin = skinOptions[Math.floor(Math.random() * skinOptions.length)]
    const randomHair = hairOptions[Math.floor(Math.random() * hairOptions.length)]
    const randomOutfit = outfitOptions[Math.floor(Math.random() * outfitOptions.length)]
    const randomFace = faceShapeOptions[Math.floor(Math.random() * faceShapeOptions.length)]
    const randomEyeStyle = eyeStyleOptions[Math.floor(Math.random() * eyeStyleOptions.length)]
    const randomAccessory = accessoryOptions[Math.floor(Math.random() * accessoryOptions.length)]
    const randomBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)]
    const randomPose = poseOptions[Math.floor(Math.random() * poseOptions.length)]
    const randomExpression = expressionOptions[Math.floor(Math.random() * expressionOptions.length)]

    setConfig({
      skin: randomSkin.value,
      hair: randomHair.value,
      outfit: randomOutfit.value,
      accessory: randomAccessory.value,
      face: randomFace.value as FaceShape,
      eyes: randomEyeStyle.value as 'spark' | 'soft' | 'wink',
      eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
      background: randomBackground.value,
      pose: randomPose.value as PoseName,
      expression: randomExpression.value as ExpressionName,
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <div className="font-pixel text-[10px] text-gold">AVATAR STUDIO</div>
          <h2 className="mt-2 text-3xl font-bold text-white">Customize your look</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfig(defaultConfig)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            type="button"
            onClick={randomizeAvatar}
            className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-sm font-medium text-yellow-300"
          >
            <Sparkles size={14} /> Randomize
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr_340px]">
        <aside className="game-panel rounded-[28px] p-4">
          <div className="mb-4 font-pixel text-[10px] text-gold">CATEGORIES</div>
          <div className="space-y-2">
            {avatarCategories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveCategory(category.value)}
                className="flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition-all"
                style={{
                  borderColor: activeCategory === category.value ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
                  background: activeCategory === category.value ? 'rgba(245,200,66,0.12)' : 'rgba(255,255,255,0.02)',
                  color: activeCategory === category.value ? 'white' : 'rgba(255,255,255,0.72)',
                }}
              >
                <span>{category.label}</span>
                {activeCategory === category.value && <Check size={14} />}
              </button>
            ))}
          </div>
        </aside>

        <main className="game-panel rounded-[30px] p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-pixel text-[10px] text-gold">LIVE PREVIEW</div>
              <h3 className="mt-2 text-xl font-bold text-white">3D model</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {selectedSummary.skin} / {selectedSummary.hair}
            </div>
          </div>

          <Avatar3D
            skinTone={config.skin}
            hair={config.hair}
            outfit={config.outfit}
            face={config.face}
            eyeStyle={config.eyes}
            eyeColor={config.eyeColor}
            pose={config.pose}
            expression={config.expression}
            accessory={config.accessory}
            background={config.background}
          />
        </main>

        <aside className="game-panel rounded-[28px] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-pixel text-[10px] text-gold">OPTIONS</div>
              <h3 className="mt-2 text-xl font-bold text-white">Selected items</h3>
            </div>
            <button type="button" className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200">
              <Wand2 size={14} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              {activeCategory === 'face' && (
                <>
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Face shape</div>
                    <div className="space-y-2">
                      {faceShapeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateConfig('face', option.value as FaceShape)}
                          className="flex w-full items-center justify-between rounded-2xl border p-3 text-left"
                          style={{
                            borderColor: config.face === option.value ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
                            background: config.face === option.value ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.02)',
                          }}
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">{option.label}</div>
                            <div className="mt-1 text-xs text-slate-400">{option.description}</div>
                          </div>
                          <div className="relative h-10 w-10 rounded-full bg-gradient-to-b from-[#f5d7a1] to-[#e5b36c]" style={{ borderRadius: option.value === 'square' ? '20%' : option.value === 'oval' ? '40% 40% 45% 45%' : '50%' }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Skin tone</div>
                    <div className="flex flex-wrap gap-2">
                      {skinOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateConfig('skin', option.value)}
                          className="flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium"
                          style={{
                            borderColor: config.skin === option.value ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
                            background: config.skin === option.value ? 'rgba(245,200,66,0.12)' : 'rgba(255,255,255,0.02)',
                          }}
                        >
                          <span className="inline-block h-3 w-3 rounded-full" style={{ background: option.color }} />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeCategory === 'hair' && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Hair styles</div>
                  <div className="space-y-2">
                    {hairOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateConfig('hair', option.value)}
                        className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left"
                        style={{
                          borderColor: config.hair === option.value ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
                          background: config.hair === option.value ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <span className="h-10 w-10 rounded-full" style={{ background: option.color }} />
                        <span className="text-sm font-semibold text-white">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === 'eyes' && (
                <>
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Eye style</div>
                    <div className="grid grid-cols-3 gap-2">
                      {eyeStyleOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateConfig('eyes', option.value as 'spark' | 'soft' | 'wink')}
                          className="rounded-2xl border p-3 text-center"
                          style={{
                            borderColor: config.eyes === option.value ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
                            background: config.eyes === option.value ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.02)',
                          }}
                        >
                          <div className="mx-auto mb-2 flex items-center justify-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#1f2937]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#1f2937]" />
                          </div>
                          <div className="text-xs font-medium text-white">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Eye color</div>
                    <div className="flex flex-wrap gap-2">
                      {eyeColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateConfig('eyeColor', color)}
                          className="h-9 w-9 rounded-full border-2"
                          style={{
                            background: color,
                            borderColor: config.eyeColor === color ? 'rgba(245,200,66,0.9)' : 'rgba(255,255,255,0.25)',
                            boxShadow: config.eyeColor === color ? `0 0 0 4px ${color}33` : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeCategory === 'outfit' && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Wardrobe</div>
                  <div className="space-y-2">
                    {outfitOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateConfig('outfit', option.value)}
                        className="flex w-full items-center justify-between rounded-2xl border p-3 text-left"
                        style={{
                          borderColor: config.outfit === option.value ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
                          background: config.outfit === option.value ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{option.label}</div>
                          <div className="mt-1 text-xs text-slate-400">Premium layer</div>
                        </div>
                        <span className="h-8 w-8 rounded-full" style={{ background: option.color }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === 'accessories' && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Accessories</div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => updateConfig('accessory', null)}
                      className="flex w-full items-center justify-between rounded-2xl border p-3 text-left"
                      style={{
                        borderColor: !config.accessory ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
                        background: !config.accessory ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <span className="text-sm font-semibold text-white">No accessory</span>
                    </button>

                    {accessoryOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateConfig('accessory', option.value)}
                        className="flex w-full items-center justify-between rounded-2xl border p-3 text-left"
                        style={{
                          borderColor: config.accessory === option.value ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
                          background: config.accessory === option.value ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{option.label}</div>
                          <div className="mt-1 text-xs text-slate-400">Wearable</div>
                        </div>
                        <span className="h-8 w-8 rounded-full" style={{ background: option.color }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === 'background' && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Background</div>
                  <div className="grid grid-cols-2 gap-2">
                    {backgroundOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateConfig('background', option.value)}
                        className="rounded-2xl border p-3 text-left"
                        style={{
                          borderColor: config.background === option.value ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
                          background: config.background === option.value ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <div className="mb-2 h-12 rounded-xl" style={{ background: option.color }} />
                        <div className="text-sm font-semibold text-white">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === 'pose' && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Pose</div>
                  <div className="space-y-2">
                    {poseOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateConfig('pose', option.value as PoseName)}
                        className="w-full rounded-2xl border p-3 text-left"
                        style={{
                          borderColor: config.pose === option.value ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
                          background: config.pose === option.value ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <div className="text-sm font-semibold text-white">{option.label}</div>
                        <div className="mt-1 text-xs text-slate-400">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Expression</div>
                <div className="flex flex-wrap gap-2">
                  {expressionOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateConfig('expression', option.value as ExpressionName)}
                      className="rounded-full border px-3 py-2 text-xs font-medium"
                      style={{
                        borderColor: config.expression === option.value ? 'rgba(245,200,66,0.8)' : 'rgba(255,255,255,0.08)',
                        background: config.expression === option.value ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.02)',
                        color: 'white',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>
    </div>
  )
}
