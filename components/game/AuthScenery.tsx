import { AdventureScene } from './AdventureScene'
import { HeroSprite } from './HeroSprite'
export function AuthScenery() {
  return <div className="auth-scenery"><AdventureScene/><div className="auth-story"><p className="eyebrow">THE EVERYDAY REALM</p><h2>A new chapter<br/>starts with you.</h2><p>Small steps. Real progress. A hero in the making.</p><HeroSprite/></div></div>
}
