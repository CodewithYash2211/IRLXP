/**
 * World screen — home of the game experience.
 * Full implementation: Phase 5.
 */
export default function WorldPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="text-center">
        <div className="font-pixel text-xs mb-3 text-gold">🌎 YOUR WORLD</div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          The world is being forged… Phase 5 incoming.
        </p>
      </div>
    </div>
  )
}
