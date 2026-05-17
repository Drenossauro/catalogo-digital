import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  const role = req.auth?.user?.role ?? null

  const isLoginPage = pathname === '/admin/login'
  const isAdminRoute = pathname.startsWith('/admin')
  const isSuperAdminRoute = pathname.startsWith('/superadmin')

  // Login page: redirect authenticated users based on role
  if (isLoginPage && isAuthenticated) {
    if (role === 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin/lojas', req.url))
    }
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }

  // /admin/* (not login): require auth; if superadmin redirect away
  if (isAdminRoute && !isLoginPage) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    if (role === 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin/lojas', req.url))
    }
  }

  // /superadmin/*: require auth AND role=superadmin
  if (isSuperAdminRoute) {
    if (!isAuthenticated || role !== 'superadmin') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }
})

export const config = {
  matcher: ['/admin/:path*', '/superadmin/:path*'],
}
