import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Painel Interno · Vitrine',
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {children}
    </div>
  )
}
