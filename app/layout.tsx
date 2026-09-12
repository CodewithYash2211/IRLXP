import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IRLXP — Level Up Your Real Life',
  description: 'Turn your everyday goals into RPG quests. Earn XP, level up your character, and make real-life progress feel like an adventure.',
  keywords: ['productivity', 'RPG', 'life gamification', 'quests', 'XP', 'level up'],
  authors: [{ name: 'IRLXP' }],
  openGraph: {
    title: 'IRLXP — Level Up Your Real Life',
    description: 'Turn your everyday goals into RPG quests.',
    type: 'website',
    siteName: 'IRLXP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IRLXP — Level Up Your Real Life',
    description: 'Turn your everyday goals into RPG quests.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
