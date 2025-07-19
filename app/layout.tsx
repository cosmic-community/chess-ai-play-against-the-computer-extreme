import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chess AI - Play Against the Computer',
  description: 'Play chess against an intelligent AI opponent powered by Cosmic. Features complete rule validation, move history, and strategic gameplay.',
  keywords: 'chess, AI, game, cosmic, artificial intelligence, strategy',
  authors: [{ name: 'Chess AI' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Chess AI - Play Against the Computer',
    description: 'Play chess against an intelligent AI opponent powered by Cosmic AI',
    type: 'website',
    images: [
      {
        url: 'https://imgix.cosmicjs.com/b67de7d0-c810-11ed-b01d-23d7b265c299-chess-hero.jpg?w=1200&h=630&fit=crop&auto=format,compress',
        width: 1200,
        height: 630,
        alt: 'Chess AI Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chess AI - Play Against the Computer',
    description: 'Play chess against an intelligent AI opponent powered by Cosmic AI',
    images: ['https://imgix.cosmicjs.com/b67de7d0-c810-11ed-b01d-23d7b265c299-chess-hero.jpg?w=1200&h=630&fit=crop&auto=format,compress'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}