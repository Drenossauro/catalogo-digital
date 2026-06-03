import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl

  // ── 1. Autenticação ──────────────────────────────────────────────────────
  if (!session?.user) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 2. Acesso ao sistema (admin do sistema) ───────────────────────────────
  if (
    (pathname.startsWith('/admin/sistema') || pathname.startsWith('/superadmin')) &&
    session.user.systemRole !== 'admin'
  ) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }

  // ── 3. Verificação de subscription (lojistas e gerentes) ─────────────────
  // Não aplica para admin do sistema
  if (session.user.systemRole !== 'admin') {
    const subStatus = session.user.subscriptionStatus
    const isRestrictedStatus = subStatus === 'inactive' || subStatus === 'cancelled'
    // Rotas liberadas mesmo com assinatura inativa
    const exemptPaths = ['/admin/assinatura', '/admin/login', '/planos', '/checkout']
    const isExempt = exemptPaths.some((p) => pathname.startsWith(p))

    if (isRestrictedStatus && !isExempt) {
      return NextResponse.redirect(new URL('/admin/assinatura', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/((?!login$|login/).*)', '/superadmin/:path*'],
}
