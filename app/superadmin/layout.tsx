import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SuperAdmin — Catálogo Digital',
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
