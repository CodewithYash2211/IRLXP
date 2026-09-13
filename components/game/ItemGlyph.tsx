import type { Item } from '@/types/database'

export function ItemGlyph({ item }: { item: Item }) {
  const key = item.asset_key
  return <svg viewBox="0 0 100 90" className="item-glyph" role="img" aria-label={item.name}>
    <ellipse cx="50" cy="78" rx="33" ry="7" fill="#17291f" opacity=".45"/>
    <g stroke="#26372b" strokeWidth="3" strokeLinejoin="round">
      {key.includes('cap') ? <><path d="M23 53 Q22 20 51 20 Q76 20 77 53Z" fill="#b5774c"/><path d="M22 53 H85 Q88 67 22 63Z" fill="#e0b879"/><path d="M49 22 V51" fill="none" stroke="#e0b879"/></> :
       key.includes('shades') ? <><path d="M14 33 H43 V57 Q17 68 14 33Z M57 33 H86 Q83 68 57 57Z" fill="#75b7a1"/><path d="M43 39 Q50 31 57 39" fill="none"/><path d="M22 37 L35 49 M66 37 L78 47" stroke="#cbecce"/></> :
       key.includes('pack') ? <><path d="M36 24 Q36 9 63 24" fill="none" stroke="#ae8a57" strokeWidth="6"/><rect x="26" y="24" width="48" height="49" rx="10" fill="#a88754"/><rect x="32" y="48" width="36" height="19" rx="3" fill="#d4b77b"/><path d="M47 28 V43 H55 V28" fill="#ead28c"/></> :
       key.includes('shoes') ? <><path d="M17 39 H38 L44 54 L60 60 V71 H16Z" fill="#b97a55"/><path d="M48 26 H67 L73 41 L87 46 V58 H59 L48 47Z" fill="#d9b27b"/><path d="M17 64 H58 M59 51 H84" stroke="#efdfb0" strokeWidth="5"/></> :
       key.includes('crown') ? <><path d="M19 27 L34 42 L50 19 L66 42 L81 27 L73 69 H27Z" fill="#e3c271"/><path d="M28 58 H72" stroke="#b9853f"/><path d="M50 42 L57 49 L50 56 L43 49Z" fill="#73ae8a"/></> :
       item.category === 'auras' ? <><path d="M49 13 Q21 39 27 60 Q32 79 53 73 Q84 67 71 40 Q66 51 57 42Z" fill={key.includes('flame')?'#d38b4f':key.includes('frost')?'#8dbdce':key.includes('void')?'#9980b0':'#8fbc88'}/><path d="M50 37 Q31 64 50 66 Q66 62 50 37Z" fill="#e1e8ba"/></> :
       item.category === 'badges' ? <><path d="M28 27 H72 V55 L50 76 L28 55Z" fill="#b39a6f"/><path d="M50 33 L56 43 L67 45 L58 53 L60 64 L50 58 L40 64 L42 53 L33 45 L44 43Z" fill="#efda94"/></> :
       <><rect x="19" y="22" width="62" height="47" rx="4" fill="#c3bc86"/><path d="M25 61 L42 38 L53 51 L65 33 L76 61Z" fill="#567c58"/><circle cx="34" cy="33" r="5" fill="#f4dc93"/></>}
    </g>
  </svg>
}
