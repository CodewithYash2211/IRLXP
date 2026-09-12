/**
 * PixelBackground — CSS-only atmospheric background for auth pages.
 * Creates a starry night pixel art scene using pure CSS gradients and
 * box-shadow tricks. No images, no copyrighted assets.
 */
export function PixelBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #050210 0%, #0d0825 35%, #1a0f3d 65%, #0f1e40 100%)',
        }}
      />

      {/* Stars layer 1 — small distant stars */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.8) 0%, transparent 100%),
          radial-gradient(1px 1px at 25% 8%,  rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 40% 20%, rgba(255,255,255,0.9) 0%, transparent 100%),
          radial-gradient(1px 1px at 55% 5%,  rgba(255,255,255,0.7) 0%, transparent 100%),
          radial-gradient(1px 1px at 70% 18%, rgba(255,255,255,0.8) 0%, transparent 100%),
          radial-gradient(1px 1px at 82% 10%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 92% 22%, rgba(255,255,255,0.9) 0%, transparent 100%),
          radial-gradient(1px 1px at 15% 40%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 33% 35%, rgba(255,255,255,0.7) 0%, transparent 100%),
          radial-gradient(1px 1px at 48% 45%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 63% 30%, rgba(255,255,255,0.8) 0%, transparent 100%),
          radial-gradient(1px 1px at 78% 42%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 88% 33%, rgba(255,255,255,0.7) 0%, transparent 100%),
          radial-gradient(1px 1px at 5%  55%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 20% 60%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 38% 52%, rgba(255,255,255,0.7) 0%, transparent 100%),
          radial-gradient(1px 1px at 60% 58%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 75% 50%, rgba(255,255,255,0.8) 0%, transparent 100%),
          radial-gradient(1px 1px at 95% 47%, rgba(255,255,255,0.6) 0%, transparent 100%)
        `,
      }} />

      {/* Stars layer 2 — slightly larger, tinted */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(2px 2px at 18% 12%, rgba(180,160,255,0.6) 0%, transparent 100%),
          radial-gradient(2px 2px at 44% 7%,  rgba(255,220,180,0.5) 0%, transparent 100%),
          radial-gradient(2px 2px at 67% 25%, rgba(180,220,255,0.6) 0%, transparent 100%),
          radial-gradient(2px 2px at 85% 14%, rgba(255,255,200,0.5) 0%, transparent 100%),
          radial-gradient(2px 2px at 30% 38%, rgba(200,180,255,0.4) 0%, transparent 100%),
          radial-gradient(2px 2px at 72% 42%, rgba(180,240,255,0.5) 0%, transparent 100%)
        `,
      }} />

      {/* Moon */}
      <div
        className="absolute rounded-full"
        style={{
          width: 48,
          height: 48,
          top: '8%',
          right: '12%',
          background: 'radial-gradient(circle at 35% 35%, #fff8dc, #f5c842 40%, #d4a017 100%)',
          boxShadow: '0 0 20px rgba(245,200,66,0.4), 0 0 60px rgba(245,200,66,0.15)',
        }}
      />
      {/* Moon crater details (pixel art style) */}
      <div
        className="absolute rounded-full"
        style={{
          width: 8, height: 8,
          top: 'calc(8% + 12px)', right: 'calc(12% + 8px)',
          background: 'rgba(0,0,0,0.12)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 5, height: 5,
          top: 'calc(8% + 24px)', right: 'calc(12% + 20px)',
          background: 'rgba(0,0,0,0.1)',
        }}
      />

      {/* Distant mountains — pixel art silhouette */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '35%' }}
      >
        {/* Far mountains */}
        <svg
          viewBox="0 0 1200 200"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
          style={{ height: '100%' }}
          aria-hidden="true"
        >
          <polygon
            points="0,200 0,120 80,60 160,110 240,40 320,90 400,30 480,80 560,50 640,100 720,20 800,70 880,45 960,95 1040,25 1120,75 1200,50 1200,200"
            fill="#0d1433"
          />
          <polygon
            points="0,200 0,150 100,110 200,140 300,90 400,130 500,100 600,140 700,110 800,150 900,120 1000,155 1100,125 1200,145 1200,200"
            fill="#111a30"
          />
          {/* Ground */}
          <rect x="0" y="180" width="1200" height="20" fill="#0d1a10" />
        </svg>
      </div>

      {/* Ground glow — magical ambience */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '20%',
          background: 'linear-gradient(0deg, rgba(124,58,237,0.08) 0%, transparent 100%)',
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  )
}
