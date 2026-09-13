'use client'
import { useId } from 'react'

export function AdventureScene() {
  const id = useId().replaceAll(':','')
  return <div className="adventure-scene" aria-hidden="true" onPointerMove={e => {
    if (e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--scene-x', `${(e.clientX-bounds.left-bounds.width/2)/65}px`)
  }} onPointerLeave={e => e.currentTarget.style.setProperty('--scene-x','0px')}>
    <svg viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid slice" className="landscape" shapeRendering="crispEdges">
      <defs>
        <g id={`${id}-tree`}><path d="M-5 0 H5 V48 H-5Z" fill="#6f563b"/><path d="M0-68 L-31-22 H-21 L-42 14 H42 L21-22 H31Z" fill="#285e48"/><path d="M0-68 V14 H42 L21-22 H31Z" fill="#357458"/></g>
        <g id={`${id}-house`}><path d="M-38-30 H38 V28 H-38Z" fill="#ebd19b"/><path d="M-49-30 L0-73 L49-30Z" fill="#b96340"/><path d="M0-66 L39-30 H-39Z" fill="#dc8652"/><path d="M-10 1 H10 V28 H-10Z" fill="#513f31"/><path d="M-29-17 H-16 V-3 H-29Z M16-17 H29 V-3 H16Z" fill="#458581"/></g>
      </defs>
      <path fill="#b9d7ce" d="M0 0H1000V650H0Z"/><circle cx="752" cy="106" r="48" fill="#f9dfa0"/>
      <g className="scene-clouds"><g className="scene-cloud" fill="#edf0d9"><path d="M75 105 H98 V90 H150 V105 H190 V122 H75Z"/><path d="M410 62 H435 V43 H488 V62 H538 V79 H410Z"/><path d="M790 164 H812 V148 H868 V163 H915 V180 H790Z"/></g></g>
      <path d="M0 282 L132 140 L245 264 L406 118 L574 295 L680 180 L846 304 L970 180 L1000 230 V450 H0Z" fill="#82a99a"/>
      <path d="M337 191 L406 118 L477 195 L429 178 L402 151 L380 184Z" fill="#e5e8cc"/>
      <path d="M0 330 Q150 236 309 315 T623 300 T1000 291 V650 H0Z" fill="#5f9165"/>
      <path d="M0 417 Q179 331 370 399 T692 377 T1000 402 V650 H0Z" fill="#84aa6a"/>
      <path d="M636 315 Q529 362 644 425 T688 530 L768 650 H607 L579 544 Q648 479 584 436 T591 315Z" fill="#62a8a4"/>
      <path className="scene-water" d="M601 346 H628 M598 386 H631 M645 458 H674 M624 556 H661 M666 603 H710" stroke="#b0d9bd" strokeWidth="4"/>
      <path d="M72 650 Q194 541 315 518 T455 395 Q476 342 407 314 M311 519 Q408 548 562 539 T853 408 M456 398 L696 348" fill="none" stroke="#d4c78e" strokeWidth="28"/>
      <path d="M581 533 H675 M581 545 H675" stroke="#735d3b" strokeWidth="9"/>
      {[[86,337],[149,371],[56,474],[204,291],[231,339],[756,307],[817,303],[928,376],[914,475],[980,547],[787,569],[159,577],[220,620],[30,605]].map(([x,y],i)=><use key={i} href={`#${id}-tree`} transform={`translate(${x} ${y}) scale(${i%3===0?1.2:.85})`}/>)}
      <use href={`#${id}-house`} transform="translate(403 316)"/><use href={`#${id}-house`} transform="translate(304 503) scale(.85)"/><use href={`#${id}-house`} transform="translate(850 403) scale(1.2)"/>
      <g transform="translate(695 341)"><path d="M-43 0 V-70 H-25 V-54 H-11 V-74 H10 V-54 H25 V-70 H43 V0Z" fill="#c6cba5"/><path d="M-13 0 V-25 Q0-45 13-25 V0Z" fill="#496a55"/><path d="M0-74 V-115" stroke="#6b5f3d" strokeWidth="5"/><path className="scene-flag" d="M3-113 H38 L29-101 L38-90 H3Z" fill="#bc6545"/></g>
      <g fill="#eed484">{Array.from({length:28},(_,i)=><path key={i} d={`M${(i*137+71)%980} ${455+(i*43)%177}h4v4h-4Z`}/>)}</g>
      <g className="scene-motes" fill="#fff8d2" aria-hidden="true">{[[128,252],[352,182],[566,338],[768,262],[912,214],[286,436],[668,492],[96,540]].map(([cx,cy],i)=><circle key={i} className="scene-mote" cx={cx} cy={cy} r={i%2?2.4:3.4} style={{animationDelay:`${(i*0.83).toFixed(2)}s`}}/>)}</g>
      <path d="M0 640 Q210 600 328 638 T654 630 T1000 615 V650 H0Z" fill="#3e7350"/>
    </svg>
  </div>
}
