import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Battledle - Real-time Wordle Battle Arena',
  description: 'Multiplayer Wordle battle game with power-ups, ranked matches, and more!',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
