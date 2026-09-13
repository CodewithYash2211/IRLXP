import type { Profile } from '@/types/database'

export function HeroSprite({ appearance = {}, className = '' }: { appearance?: Partial<Profile>; className?: string }) {
  const skin = ['#ffdbac','#e8c4a0','#d4a574','#c49564','#8d5524','#5d3a1a'][Number(appearance.avatar_skin?.split('_')[1] || 1)-1] || '#d4a574'
  const index = Number(appearance.avatar_hair?.split('_')[1] || 1)-1
  const hair = ['#5d4037','#5d4037','#f5c842','#f5c842','#2c2c2c','#2c2c2c','#c0392b','#60a5fa','#fb7185','#f0f0ff'][index] || '#5d4037'
  const outfit = ['#2c3e50','#1a2a4a','#4a1a1a','#1a3a1a','#2d1a3a','#1a1a1a','#2a1a3a','#1a2a2a'][Number(appearance.avatar_outfit?.split('_')[1] || 1)-1] || '#2c3e50'
  const acc = appearance.avatar_accessory
  return <svg viewBox="0 0 160 180" role="img" aria-label="Your customized adventurer" className={className}>
    <ellipse cx="80" cy="164" rx="48" ry="10" fill="#111e18" opacity=".35"/>
    <g stroke="#263329" strokeWidth="3" strokeLinejoin="round">
      {acc === 'acc_cape' && <path d="M54 100 Q34 118 35 154 L125 154 Q120 112 105 100Z" fill="#b95741"/>}
      {[1,3,5,9].includes(index) && <rect x="43" y="39" width="74" height="83" rx="26" fill={hair}/>}
      <path d="M59 131 L58 159 Q68 167 77 158 L79 134 M84 134 L85 159 Q98 166 105 158 L103 131" fill="#543e30"/>
      <path d="M54 99 Q41 104 40 128 Q43 137 53 132 L62 115 M106 99 Q119 104 120 128 Q117 137 107 132 L98 115" fill={skin}/>
      <path d="M62 96 Q80 91 98 96 L108 135 Q80 148 52 135Z" fill={outfit}/>
      <path d="M67 98 L80 110 L93 98 M54 131 L105 131" fill="none" stroke="#e7c56d" strokeWidth="6"/>
      <rect x="74" y="125" width="12" height="10" rx="2" fill="#e7c56d"/>
      <circle cx="47" cy="72" r="9" fill={skin}/><circle cx="113" cy="72" r="9" fill={skin}/>
      <rect x="47" y="35" width="66" height="65" rx="27" fill={skin}/>
      <path d={index === 7 ? 'M46 63 L40 39 L58 43 L62 22 L78 38 L92 23 L100 43 L119 38 L112 65 L96 51 L76 56 L63 49Z' : 'M46 64 Q36 28 76 28 Q117 24 115 62 L103 50 L87 54 L70 46 L59 61Z'} fill={hair}/>
      {index === 8 && <path d="M46 50 L43 92 L57 89 L57 60 M106 49 L119 91 L105 92 L101 61" fill={hair}/>}
      <path d="M65 71 L65 76 M94 71 L94 76" strokeWidth="5" strokeLinecap="round"/><path d="M74 86 Q80 91 87 85" fill="none" strokeWidth="2"/>
      {acc === 'acc_glasses' && <g fill="none"><rect x="54" y="65" width="21" height="16" rx="5"/><rect x="85" y="65" width="21" height="16" rx="5"/><path d="M75 70 H85"/></g>}
      {acc === 'acc_headband' && <path d="M47 57 Q80 47 113 57" stroke="#e57a52" strokeWidth="7"/>}
      {acc === 'acc_earring' && <circle cx="115" cy="80" r="5" fill="#f2c765"/>}
      {acc === 'acc_scarf' && <path d="M60 96 Q80 108 100 96 L96 110 L88 108 L98 133 L82 136 L76 110 L62 108Z" fill="#dc7049"/>}
      {acc === 'acc_crown' && <path d="M53 37 L48 15 L66 25 L79 9 L91 25 L110 15 L106 37Z" fill="#f2c765"/>}
      {acc === 'acc_halo' && <ellipse cx="80" cy="14" rx="29" ry="7" fill="none" stroke="#f2c765" strokeWidth="5"/>}
      {acc === 'acc_mask' && <path d="M61 80 Q80 73 100 80 L94 94 Q80 101 65 93Z" fill="#b5d5c7"/>}
      {acc === 'acc_pixel_cap' && <g><path d="M48 45 Q48 16 80 16 Q112 16 112 45Z" fill="#b5774c"/><path d="M48 44 H112 V51 H48Z" fill="#8d5a38"/><path d="M108 45 L137 48 Q141 56 132 57 L108 52Z" fill="#e0b879"/><circle cx="80" cy="19" r="4" fill="#e0b879"/></g>}
      {acc === 'acc_neon_shades' && <g><rect x="52" y="64" width="24" height="17" rx="5" fill="#123f36"/><rect x="84" y="64" width="24" height="17" rx="5" fill="#123f36"/><path d="M76 70 H84" stroke="#8ef0c6"/><path d="M56 68 L64 76 M88 68 L96 76" stroke="#8ef0c6" strokeWidth="2.5"/></g>}
      {acc === 'acc_explorer_pack' && <g><path d="M56 98 L51 134 H61 L66 102Z M104 98 L109 134 H99 L94 102Z" fill="#a88754"/><path d="M63 113 H97" stroke="#ead28c" strokeWidth="5"/><path d="M56 122 H70 M104 122 H90" stroke="#d4b77b" strokeWidth="4"/></g>}
      {acc === 'acc_speed_shoes' && <g fill="none"><path d="M57 153 Q68 162 78 157 M84 157 Q96 163 105 152" stroke="#efdfb0" strokeWidth="6"/><path d="M56 161 Q68 170 79 164 M83 164 Q97 171 106 160" stroke="#d9b27b" strokeWidth="5"/></g>}
      {acc === 'acc_champion_crown' && <g><path d="M53 37 L48 15 L66 25 L79 9 L91 25 L110 15 L106 37Z" fill="#e3c271"/><path d="M53 33 H107" stroke="#b9853f" strokeWidth="3"/><path d="M74 23 L80 17 L86 23 L80 29Z" fill="#73ae8a"/></g>}
    </g>
  </svg>
}
