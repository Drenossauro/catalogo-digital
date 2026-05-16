import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const jost = Jost({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Catálogo de Prata',
  description: 'Catálogo de joias e acessórios em prata',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${jost.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#1a1a1a] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
