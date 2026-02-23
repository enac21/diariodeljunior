import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Diario del Junior - Explora el Mapa de Personajes',
  description: 'Descubre personajes únicos generados proceduralmente. Explora el mapa interactivo y sígueme en mis redes sociales.',
  keywords: ['procedural', 'character generator', 'SVG', 'random', 'seed', 'map'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
