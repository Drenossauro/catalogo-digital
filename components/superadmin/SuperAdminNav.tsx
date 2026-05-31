'use client'

import { signOut } from 'next-auth/react'
import { LogOut, Building2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SuperAdminNav() {
  const pathname = usePathname()

  const navItem = (href: string, label: string, Icon: React.ElementType) => (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
        pathname.startsWith(href)
          ? 'text-white font-medium'
          : 'text-white/40 hover:text-white'
      }`}
    >
      <Icon size={15} strokeWidth={1.5} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )

  return (
    <header className="bg-[#0F0F0F] border-b border-white/8">
      <div className="w-full px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <Link href="/superadmin/lojas" className="flex items-center gap-2 mr-3 shrink-0">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <span className="font-serif text-[10px] text-[#0F0F0F] leading-none">✦</span>
            </div>
            <span className="font-serif text-base text-white hidden sm:inline">Vitrine</span>
          </Link>
          <span className="text-[10px] text-white/25 uppercase tracking-widest mr-3 hidden sm:inline">Admin</span>
          {navItem('/superadmin/lojas', 'Lojas', Building2)}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/30 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut size={14} strokeWidth={1.5} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  )
}
