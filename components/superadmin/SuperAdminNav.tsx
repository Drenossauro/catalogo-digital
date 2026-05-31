'use client'

import { signOut } from 'next-auth/react'
import { LogOut, Building2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SuperAdminNav() {
  const pathname = usePathname()

  return (
    <header className="bg-[#0F0F0F] border-b border-white/8">
      <div className="w-full px-4 h-14 flex items-center justify-between">
        {/* Logo + badge — sempre visível */}
        <div className="flex items-center gap-3">
          <Link href="/superadmin/lojas" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <span className="font-serif text-[11px] text-[#0F0F0F] leading-none">✦</span>
            </div>
            <span className="font-serif text-base text-white">Vitrine</span>
          </Link>
          <span className="text-[10px] text-white/25 uppercase tracking-widest">Admin</span>

          <Link
            href="/superadmin/lojas"
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
              pathname.startsWith('/superadmin/lojas')
                ? 'text-white font-medium'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Building2 size={17} strokeWidth={1.5} />
            <span>Lojas</span>
          </Link>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/30 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  )
}
