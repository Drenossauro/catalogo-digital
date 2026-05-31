import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Catálogo de Prata',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // pb-16 garante que o conteúdo não fique atrás da bottom tab bar no mobile
    <div className="pb-16 sm:pb-0">
      {children}
    </div>
  )
}
