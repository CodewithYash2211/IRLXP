'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float, OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useMemo, useRef } from 'react'
import type { Group } from 'three'

import type { ExpressionName, EyeStyle, FaceShape, PoseName } from '@/lib/avatar/avatarData'

const MODEL_PATH = '/models/avatar/character.glb'

const BACKGROUND_COLORS: Record<string, string> = {
  studio: '#e8edf3',
  sunset: '#f9d4d4',
  forest: '#d6f4d8',
  city: '#dfe7f2',
  night: '#111827',
}

function CharacterModel({
  pose,
  expression,
}: {
  pose: PoseName
  expression: ExpressionName
}) {
  const modelRef = useRef<Group>(null)
  const { scene } = useGLTF(MODEL_PATH)
  const asset = useMemo(() => scene.clone(), [scene])

  useFrame((state) => {
    if (!modelRef.current) return

    const t = state.clock.getElapsedTime()
    modelRef.current.position.y = Math.sin(t * 1.5) * 0.08
    modelRef.current.rotation.y = Math.sin(t * 0.8) * 0.3 + (pose === 'confident' ? 0.2 : 0)
  })

  return <primitive ref={modelRef} object={asset} position={[0, -1.45, 0]} scale={1.15} />
}

export function Avatar3D({
  skinTone = 'skin_1',
  hair = 'hair_1',
  outfit = 'outfit_1',
  face = 'round',
  eyeStyle = 'spark',
  eyeColor = '#1f2937',
  pose = 'standing',
  expression = 'happy',
  accessory = null,
  background = 'studio',
}: {
  skinTone?: string
  hair?: string
  outfit?: string
  face?: FaceShape
  eyeStyle?: EyeStyle
  eyeColor?: string
  pose?: PoseName
  expression?: ExpressionName
  accessory?: string | null
  background?: string
}) {
  const sceneBackground = BACKGROUND_COLORS[background] ?? '#e8edf3'

  return (
    <div className="h-[440px] w-full overflow-hidden rounded-[28px] border border-slate-200/40 bg-white/30 shadow-[0_18px_30px_rgba(15,23,42,0.12)]">
      <Canvas camera={{ position: [0, 1.4, 5.8], fov: 28 }} shadows dpr={[1, 2]}>
        <color attach="background" args={[sceneBackground]} />
        <ambientLight intensity={1.25} />
        <hemisphereLight intensity={0.8} groundColor="#8995a6" />
        <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <directionalLight position={[-4, 2, 3]} intensity={0.8} color="#dbeafe" />

        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.14}>
            <CharacterModel pose={pose} expression={expression} />
          </Float>
        </Suspense>

        <ContactShadows position={[0, -2.15, 0]} opacity={0.55} scale={5.5} blur={2.4} far={4.5} />

        <OrbitControls
          enablePan={false}
          minDistance={4.6}
          maxDistance={7.5}
          minPolarAngle={Math.PI / 2.8}
          maxPolarAngle={Math.PI / 1.8}
          target={[0, 0.8, 0]}
        />
      </Canvas>
    </div>
  )
}
