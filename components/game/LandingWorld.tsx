import Link from 'next/link'
import { AdventureScene } from './AdventureScene'
import { HeroSprite } from './HeroSprite'
export function LandingWorld() { return <AdventureScene/> }
export function LandingContent() {
  return <div className="landing-copy"><p className="eyebrow">A LITTLE PROGRESS. A GRAND ADVENTURE.</p><h1>IRLXP<span>Your life.<br/>Your next quest.</span></h1><p>Read a chapter. Move your body. Build a habit.<br className="hidden sm:block"/> Turn everyday effort into an adventure worth returning to.</p><div className="flex flex-wrap gap-4 mt-7"><Link href="/signup" className="btn-gold adventure-cta">Begin your adventure →</Link><Link href="/login" className="adventure-return">Continue journey</Link></div><ul className="landing-traits"><li>Real goals</li><li>Earned XP</li><li>Your own hero</li></ul></div>
}
export function LandingPage() {
  return <main className="landing-page"><AdventureScene/><nav className="landing-nav" aria-label="Main navigation"><Link href="/" className="font-pixel">IRLXP</Link><Link href="/login">Enter the realm ↗</Link></nav><LandingContent/><div className="landing-hero"><HeroSprite/><span>Every hero starts somewhere.</span></div><footer className="landing-footer">ONE QUEST AT A TIME <span>Intellect · Strength · Discipline · Vitality</span></footer></main>
}
export default LandingPage
