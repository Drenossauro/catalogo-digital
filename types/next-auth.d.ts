import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      storeId: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    storeId?: string | null
    role?: string
  }
}
