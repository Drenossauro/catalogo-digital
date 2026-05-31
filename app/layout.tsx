import type { Metadata } from 'next'
import {
  Cormorant_Garamond,
  Jost,
  Playfair_Display,
  DM_Serif_Display,
  Raleway,
  DM_Sans,
} from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})
const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})
const dmSerif = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: ['400'],
})
const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})
const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Vitrine',
  description: 'Seu catálogo digital',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [
    cormorant.variable,
    jost.variable,
    playfair.variable,
    dmSerif.variable,
    raleway.variable,
    dmSans.variable,
  ].join(' ')

  return (
    <html lang="pt-BR" className={`${fontVars} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#1a1a1a] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
