export type FaceShape = 'round' | 'oval' | 'square'
export type EyeStyle = 'spark' | 'soft' | 'wink'
export type PoseName = 'standing' | 'casual' | 'confident' | 'wave' | 'peace' | 'sit'
export type ExpressionName = 'neutral' | 'happy' | 'smile' | 'winking' | 'confident'

export interface AvatarAssetOption {
  value: string
  label: string
  color?: string
  accent?: string
  description?: string
}

export const skinOptions: AvatarAssetOption[] = [
  { value: 'skin_1', label: 'Classic', color: '#f5d7a1' },
  { value: 'skin_ember', label: 'Ember', color: '#d98a60' },
  { value: 'skin_azure', label: 'Azure', color: '#d5b08a' },
  { value: 'skin_verdant', label: 'Verdant', color: '#a1c78a' },
]

export const faceShapeOptions: AvatarAssetOption[] = [
  { value: 'round', label: 'Round', description: 'Soft and friendly' },
  { value: 'oval', label: 'Oval', description: 'Balanced profile' },
  { value: 'square', label: 'Square', description: 'Strong angle' },
]

export const eyeStyleOptions: AvatarAssetOption[] = [
  { value: 'spark', label: 'Spark', color: '#1f2937' },
  { value: 'soft', label: 'Soft', color: '#334155' },
  { value: 'wink', label: 'Wink', color: '#111827' },
]

export const eyeColors = ['#1f2937', '#1d4ed8', '#0f766e', '#7c3aed', '#f59e0b']

export const hairOptions: AvatarAssetOption[] = [
  { value: 'hair_1', label: 'Default', color: '#2b1d16' },
  { value: 'hair_midnight', label: 'Midnight', color: '#0f172a' },
  { value: 'hair_ember', label: 'Ember', color: '#6b3e2a' },
  { value: 'hair_royal', label: 'Royal', color: '#7c3aed' },
  { value: 'hair_fox', label: 'Foxfire', color: '#f59e0b' },
]

export const outfitOptions: AvatarAssetOption[] = [
  { value: 'outfit_1', label: 'Scout', color: '#5878d9' },
  { value: 'outfit_royal', label: 'Royal', color: '#c084fc' },
  { value: 'outfit_stealth', label: 'Stealth', color: '#374151' },
  { value: 'outfit_dawn', label: 'Dawn', color: '#1f766e' },
]

export const accessoryOptions: AvatarAssetOption[] = [
  { value: 'acc_neon_shades', label: 'Neon Shades', color: '#7dd3fc' },
  { value: 'acc_pixel_cap', label: 'Cap', color: '#f4a261' },
  { value: 'acc_explorer_pack', label: 'Pack', color: '#a78bfa' },
  { value: 'acc_speed_shoes', label: 'Speed Shoes', color: '#fca5a5' },
  { value: 'acc_champion_crown', label: 'Crown', color: '#f5c842' },
]

export const avatarCategories = [
  { value: 'face', label: 'Face' },
  { value: 'hair', label: 'Hair' },
  { value: 'eyes', label: 'Eyes' },
  { value: 'outfit', label: 'Outfit' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'background', label: 'Background' },
  { value: 'pose', label: 'Pose' },
] as const

export type AvatarCategory = (typeof avatarCategories)[number]['value']

export const backgroundOptions: AvatarAssetOption[] = [
  { value: 'studio', label: 'Studio', color: '#e2e8f0' },
  { value: 'sunset', label: 'Sunset', color: '#fbcfe8' },
  { value: 'forest', label: 'Forest', color: '#bbf7d0' },
  { value: 'city', label: 'City', color: '#cbd5e1' },
  { value: 'night', label: 'Night', color: '#0f172a' },
]

export const poseOptions: AvatarAssetOption[] = [
  { value: 'standing', label: 'Standing', description: 'Neutral posture' },
  { value: 'casual', label: 'Casual', description: 'Relaxed stance' },
  { value: 'confident', label: 'Confident', description: 'Strong pose' },
  { value: 'wave', label: 'Wave', description: 'Friendly hello' },
  { value: 'peace', label: 'Peace', description: 'Victory stance' },
  { value: 'sit', label: 'Sit', description: 'Seated look' },
]

export const avatarDefaults = {
  skin: 'skin_1',
  hair: 'hair_1',
  outfit: 'outfit_1',
  accessory: null as string | null,
  face: 'round' as FaceShape,
  eyes: 'spark' as EyeStyle,
  eyeColor: '#1f2937',
  background: 'studio',
  pose: 'standing' as PoseName,
  expression: 'happy' as ExpressionName,
}

export function resolveAvatarAssetKey(key: string | null | undefined, fallback: string) {
  if (!key) return fallback
  return key
}
